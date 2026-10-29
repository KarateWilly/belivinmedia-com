#!/usr/bin/env node

// BELIVIN main-site gate. `.impeccable/site-gate.json` is the one machine-readable
// stage record; this script is the only sanctioned way to open or close the
// uchg locks on the main and legal sources.

import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const gatePath = '.impeccable/site-gate.json';
const mainSources = ['index.html', 'styles.css', 'site.js'];
const legalSources = ['impressum.html', 'datenschutz.html', 'legal.css'];
const guardedPattern = /^(index\.html|styles\.css|site\.js|impressum\.html|datenschutz\.html|legal\.css|public\/site\/)/;
const stages = ['direction', 'copy', 'comps', 'build', 'review', 'release'];

const nextActions = {
  direction: 'Run the Impeccable direction round (reference/new-work.md) and record the selection.',
  copy: "Get Mario's approval of the copy draft, freeze it as belivin-agency-2026-locked.md, and record path, SHA-256 and his words in site-gate.json.",
  comps: 'Build three responsive browser-native comps, each captured at 390x844 and 1440x900; record Mario\'s choice and mark its manifest "approved": true.',
  build: 'Run npm run gate:unlock, build from the approved comp, capture the review evidence at 390 and 1440, run the finish review, then set build.status to "done".',
  review: 'Stop for Mario: he reviews mobile and desktop together; record his approval in review.approval.',
  release: "Get npm run qa green, verify the legal licensing authority, run npm run gate:lock, and record Mario's release approval before any commit, push or deploy.",
};

function abs(relativePath) {
  return resolve(root, relativePath);
}

function exists(relativePath) {
  return typeof relativePath === 'string' && existsSync(abs(relativePath));
}

function sha256(relativePath) {
  return createHash('sha256').update(readFileSync(abs(relativePath))).digest('hex');
}

function readGate() {
  if (!exists(gatePath)) throw new Error(`${gatePath} is missing`);
  return JSON.parse(readFileSync(abs(gatePath), 'utf8'));
}

function writeGate(gate) {
  writeFileSync(abs(gatePath), `${JSON.stringify(gate, null, 2)}\n`);
}

function approved(record) {
  return Boolean(record?.by && record?.at && record?.quote);
}

function isLocked(relativePath) {
  if (!exists(relativePath)) return null;
  if (process.platform === 'darwin') {
    return /\buchg\b/.test(execFileSync('ls', ['-lO', abs(relativePath)], { encoding: 'utf8' }));
  }
  // Without BSD flags (CI), a read-only mode stands in for uchg.
  return (statSync(abs(relativePath)).mode & 0o222) === 0;
}

function setLocked(relativePaths, locked) {
  const existing = relativePaths.filter(exists);
  if (existing.length === 0) return;
  const [command, args] = process.platform === 'darwin'
    ? ['chflags', [locked ? 'uchg' : 'nouchg', ...existing]]
    : ['chmod', [locked ? 'a-w' : 'u+w', ...existing]];
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `${command} failed`);
}

function evaluate(gate) {
  const problems = Object.fromEntries(stages.map(stage => [stage, []]));
  const need = (stage, condition, message) => {
    if (!condition) problems[stage].push(message);
  };

  need('direction', gate.direction?.status === 'chosen', 'direction is not chosen');
  need('direction', exists(gate.direction?.selection), 'direction selection record is missing');

  const copy = gate.copy ?? {};
  need('copy', copy.status === 'locked', 'copy is not locked');
  need('copy', exists(copy.locked), 'locked copy file is missing');
  need('copy', exists(copy.locked) && copy.sha256 === sha256(copy.locked), 'locked copy SHA-256 does not match');
  need('copy', approved(copy.approval), "Mario's copy approval is not recorded");

  const comp = gate.comps?.approved;
  need('comps', Boolean(comp), 'no approved comp is recorded');
  if (comp) {
    for (const key of ['source', 'manifest', 'mobile', 'desktop']) {
      need('comps', exists(comp[key]), `approved comp ${key} is missing`);
    }
    if (exists(comp.manifest)) {
      const manifest = JSON.parse(readFileSync(abs(comp.manifest), 'utf8'));
      need('comps', manifest.approved === true, 'approved comp manifest lacks "approved": true');
      need('comps', manifest.copySha256 === copy.sha256, 'approved comp is bound to a different copy');
    }
    need('comps', approved(comp.approval), "Mario's comp approval is not recorded");
  }

  need('build', gate.build?.status === 'done', 'build is not done');
  for (const [name, path] of Object.entries(gate.build?.evidence ?? {})) {
    need('build', exists(path), `review evidence ${name} is missing`);
  }

  need('review', approved(gate.review?.approval), "Mario's mobile+desktop review approval is not recorded");

  const release = gate.release ?? {};
  need('release', release.qa?.status === 'pass', 'npm run qa has not passed');
  need(
    'release',
    release.legal?.licensingAuthorityVerified === true || approved(release.legal?.waiver),
    release.legal?.reason ?? 'legal licensing authority is not verified',
  );
  need('release', approved(release.approval), "Mario's release approval is not recorded");

  const stage = stages.find(name => problems[name].length > 0) ?? 'released';
  return { stage, problems };
}

function stagesBefore(stage) {
  return stages.slice(0, stages.indexOf(stage));
}

function status() {
  const gate = readGate();
  const { stage, problems } = evaluate(gate);
  const locks = Object.fromEntries([...mainSources, ...legalSources]
    .filter(exists)
    .map(path => [path, isLocked(path) ? 'locked' : 'open']));
  return {
    stage,
    nextAction: nextActions[stage] ?? 'Nothing pending.',
    blockers: problems[stage] ?? [],
    buildStatus: gate.build?.status,
    locks,
  };
}

function unlock() {
  const gate = readGate();
  const { problems } = evaluate(gate);
  const blocking = stagesBefore('build').flatMap(stage => problems[stage]);
  if (blocking.length > 0) {
    throw new Error(`Build stays locked:\n- ${blocking.join('\n- ')}`);
  }
  setLocked([...mainSources, ...legalSources], false);
  if (gate.build.status === 'closed') {
    gate.build.status = 'open';
    writeGate(gate);
  }
  return 'Main and legal sources are open for the approved build.';
}

function lock() {
  setLocked([...mainSources, ...legalSources], true);
  return 'Main and legal sources are locked.';
}

function commit() {
  const staged = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMRD'], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  const guarded = staged.filter(path => guardedPattern.test(path));
  if (guarded.length === 0) return 'No guarded main-site or legal files staged.';

  const { stage, problems } = evaluate(readGate());
  if (stage !== 'released') {
    const open = stages.flatMap(name => problems[name]);
    throw new Error(`Commit blocked for ${guarded.join(', ')}:\n- ${open.join('\n- ')}`);
  }
  const unlocked = [...mainSources, ...legalSources].filter(path => isLocked(path) === false);
  if (unlocked.length > 0) throw new Error(`Commit blocked: re-lock first (${unlocked.join(', ')})`);
  return 'Release gate passed.';
}

const commands = {
  status: () => JSON.stringify(status(), null, 2),
  unlock,
  lock,
  commit,
};

const command = process.argv[2] ?? 'status';
if (!commands[command]) {
  process.stderr.write(`Unknown command: ${command}. Use ${Object.keys(commands).join(', ')}.\n`);
  process.exit(2);
}

try {
  process.stdout.write(`${commands[command]()}\n`);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
