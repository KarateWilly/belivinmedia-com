#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];
const passes = [];

function read(relativePath) {
  const path = resolve(root, relativePath);
  if (!existsSync(path)) {
    failures.push(`missing: ${relativePath}`);
    return '';
  }
  return readFileSync(path, 'utf8');
}

function requireCondition(condition, message) {
  if (condition) passes.push(message);
  else failures.push(message);
}

function requireText(content, marker, owner) {
  requireCondition(content.includes(marker), `${owner} contains ${JSON.stringify(marker)}`);
}

const agents = read('AGENTS.md');
const product = read('PRODUCT.md');
const packageJson = JSON.parse(read('package.json') || '{}');

requireText(agents, 'npm run handoff:check', 'AGENTS.md');
requireText(agents, '.impeccable/site-gate.json', 'AGENTS.md');
requireText(agents, 'npm run gate:unlock', 'AGENTS.md');
requireText(agents, 'No fixed canvas', 'AGENTS.md');
requireText(product, 'full-service marketing agency', 'PRODUCT.md');

for (const script of ['qa', 'handoff:check', 'gate:status', 'gate:unlock', 'gate:lock', 'gate:commit']) {
  requireCondition(Boolean(packageJson.scripts?.[script]), `package script exists: ${script}`);
}

const hook = read('.githooks/pre-commit');
requireText(hook, '.impeccable/site-gate.mjs commit', '.githooks/pre-commit');

let gateStatus = null;
const gateRun = spawnSync(process.execPath, ['.impeccable/site-gate.mjs', 'status'], { cwd: root, encoding: 'utf8' });
if (gateRun.status === 0) {
  gateStatus = JSON.parse(gateRun.stdout);
  passes.push('site gate status is readable');
} else {
  failures.push(`site gate status failed: ${gateRun.stderr.trim()}`);
}

if (gateStatus) {
  const buildOpen = gateStatus.buildStatus === 'open';
  for (const [path, state] of Object.entries(gateStatus.locks)) {
    if (buildOpen) passes.push(`${path} is ${state} during an open build`);
    else requireCondition(state === 'locked', `${path} is uchg-locked while the build is ${gateStatus.buildStatus}`);
  }
}

try {
  const branch = execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim();
  requireCondition(branch === 'main', 'working branch is main');
  const dirty = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean).length;
  warnings.push(`WORKTREE: ${dirty} changed/untracked paths; do not reset or broad-clean in the next session`);
} catch (error) {
  failures.push(`git state unavailable: ${error.message}`);
}

const result = {
  handoffReady: failures.length === 0,
  stage: gateStatus?.stage ?? 'unknown',
  nextAction: gateStatus?.nextAction ?? 'Repair the site gate first.',
  blockers: gateStatus?.blockers ?? [],
  passes: passes.length,
  failures,
  warnings,
  nextSession: [
    'Read AGENTS.md, PRODUCT.md and .impeccable/site-gate.json.',
    'Load the live Impeccable skill before any design, copy or build step.',
    'Follow nextAction; open or close main and legal sources only via npm run gate:unlock / gate:lock.',
    'Do not commit, push or deploy without Mario\'s recorded release approval.',
  ],
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exitCode = failures.length === 0 ? 0 : 1;
