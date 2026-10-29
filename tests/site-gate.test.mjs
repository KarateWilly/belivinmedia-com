import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const gateSource = join(projectRoot, '.impeccable/site-gate.mjs');
const guardedFiles = ['index.html', 'styles.css', 'impressum.html', 'datenschutz.html', 'legal.css'];
const approval = { by: 'Mario', at: 'fixture', quote: 'Freigegeben.' };

function writeText(root, path, value) {
  mkdirSync(dirname(join(root, path)), { recursive: true });
  writeFileSync(join(root, path), value);
}

function writeJson(root, path, value) {
  writeText(root, path, `${JSON.stringify(value, null, 2)}\n`);
}

function hashFile(root, path) {
  return createHash('sha256').update(readFileSync(join(root, path))).digest('hex');
}

function run(root, action) {
  return spawnSync(process.execPath, ['.impeccable/site-gate.mjs', action], { cwd: root, encoding: 'utf8' });
}

function locked(root, path) {
  if (process.platform === 'darwin') {
    return /\buchg\b/.test(execFileSync('ls', ['-lO', path], { cwd: root, encoding: 'utf8' }));
  }
  return (statSync(join(root, path)).mode & 0o222) === 0;
}

function readGate(root) {
  return JSON.parse(readFileSync(join(root, '.impeccable/site-gate.json'), 'utf8'));
}

function createFixture(t, { copyLocked = false, compApproved = false, released = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'belivin-site-gate-'));
  t.after(() => {
    if (process.platform === 'darwin') spawnSync('chflags', ['-R', 'nouchg', root]);
    else spawnSync('chmod', ['-R', 'u+w', root]);
    rmSync(root, { recursive: true, force: true });
  });

  cpSync(gateSource, join(root, '.impeccable/site-gate.mjs'));
  for (const file of guardedFiles) writeText(root, file, `${file}\n`);
  writeText(root, '.impeccable/directions/selection.md', 'Festival-Line-up\n');
  writeText(root, '.impeccable/copy/locked.md', 'MEHR KUNDEN.\n');
  const copySha = hashFile(root, '.impeccable/copy/locked.md');

  const gate = {
    schemaVersion: 1,
    direction: { status: 'chosen', selection: '.impeccable/directions/selection.md' },
    copy: { status: 'draft', locked: null, sha256: null, approval: null },
    comps: { approved: null },
    build: { status: 'closed', evidence: { mobile: '.impeccable/review/mobile.png', desktop: '.impeccable/review/desktop.png' } },
    review: { approval: null },
    release: { qa: null, legal: { licensingAuthorityVerified: false, reason: 'licence not verified' }, approval: null },
  };

  if (copyLocked) {
    gate.copy = { status: 'locked', locked: '.impeccable/copy/locked.md', sha256: copySha, approval };
  }
  if (compApproved) {
    for (const file of ['comp-a/index.html', 'comp-a-390x844.png', 'comp-a-1440x900.png']) {
      writeText(root, `.impeccable/mocks/${file}`, 'fixture\n');
    }
    writeJson(root, '.impeccable/mocks/comp-a.json', { approved: true, copySha256: copySha });
    gate.comps.approved = {
      source: '.impeccable/mocks/comp-a/index.html',
      manifest: '.impeccable/mocks/comp-a.json',
      mobile: '.impeccable/mocks/comp-a-390x844.png',
      desktop: '.impeccable/mocks/comp-a-1440x900.png',
      approval,
    };
  }
  if (released) {
    writeText(root, '.impeccable/review/mobile.png', 'fixture\n');
    writeText(root, '.impeccable/review/desktop.png', 'fixture\n');
    gate.build.status = 'done';
    gate.review.approval = approval;
    gate.release = { qa: { status: 'pass' }, legal: { licensingAuthorityVerified: true }, approval };
  }

  writeJson(root, '.impeccable/site-gate.json', gate);
  execFileSync('git', ['init', '-q'], { cwd: root });
  assert.equal(run(root, 'lock').status, 0);
  return root;
}

test('status names the first open stage and its blockers', t => {
  const root = createFixture(t);
  const result = run(root, 'status');
  assert.equal(result.status, 0, result.stderr);
  const status = JSON.parse(result.stdout);
  assert.equal(status.stage, 'copy');
  assert.ok(status.blockers.includes('copy is not locked'));
});

test('unlock fails closed without locked copy and approved comp', t => {
  const root = createFixture(t, { copyLocked: true });
  const result = run(root, 'unlock');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no approved comp is recorded/);
  for (const file of guardedFiles) assert.ok(locked(root, file), `${file} stays locked`);
});

test('unlock fails closed when the locked copy changed after approval', t => {
  const root = createFixture(t, { copyLocked: true, compApproved: true });
  if (process.platform === 'darwin') spawnSync('chflags', ['nouchg', '.impeccable/copy/locked.md'], { cwd: root });
  writeText(root, '.impeccable/copy/locked.md', 'NEUE COPY\n');
  const result = run(root, 'unlock');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /locked copy SHA-256 does not match/);
});

test('unlock opens main and legal sources once copy and comp are approved', t => {
  const root = createFixture(t, { copyLocked: true, compApproved: true });
  const result = run(root, 'unlock');
  assert.equal(result.status, 0, result.stderr);
  for (const file of guardedFiles) assert.ok(!locked(root, file), `${file} is open`);
  assert.equal(readGate(root).build.status, 'open');
});

test('commit blocks guarded files before release approval', t => {
  const root = createFixture(t, { copyLocked: true, compApproved: true });
  run(root, 'unlock');
  writeText(root, 'index.html', 'changed\n');
  execFileSync('git', ['add', 'index.html'], { cwd: root });
  const result = run(root, 'commit');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Commit blocked for index\.html/);
});

test('commit ignores unguarded files', t => {
  const root = createFixture(t);
  writeText(root, 'README.md', 'notes\n');
  execFileSync('git', ['add', 'README.md'], { cwd: root });
  assert.equal(run(root, 'commit').status, 0);
});

test("a recorded legal waiver from Mario stands in for licence verification", t => {
  const root = createFixture(t, { copyLocked: true, compApproved: true, released: true });
  const gate = readGate(root);
  gate.release.legal = { licensingAuthorityVerified: false, reason: 'licence renewal pending' };
  writeJson(root, '.impeccable/site-gate.json', gate);
  assert.equal(JSON.parse(run(root, 'status').stdout).stage, 'release');
  gate.release.legal.waiver = approval;
  writeJson(root, '.impeccable/site-gate.json', gate);
  assert.equal(JSON.parse(run(root, 'status').stdout).stage, 'released');
});

test('commit passes only after release approval with sources re-locked', t => {
  const root = createFixture(t, { copyLocked: true, compApproved: true, released: true });
  run(root, 'unlock');
  writeText(root, 'index.html', 'release\n');
  execFileSync('git', ['add', 'index.html'], { cwd: root });
  assert.equal(run(root, 'commit').status, 1, 'open sources block the commit');
  assert.equal(run(root, 'lock').status, 0);
  const result = run(root, 'commit');
  assert.equal(result.status, 0, result.stderr);
});
