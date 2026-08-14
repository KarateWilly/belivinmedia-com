#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const root = process.cwd();
const failures = [];
const warnings = [];
const passes = [];

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function read(relativePath) {
  const path = resolve(root, relativePath);
  if (!existsSync(path)) {
    failures.push(`missing: ${relativePath}`);
    return '';
  }
  return readFileSync(path, 'utf8');
}

function json(relativePath) {
  const content = read(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`invalid JSON: ${relativePath}: ${error.message}`);
    return null;
  }
}

function requireCondition(condition, message) {
  if (condition) passes.push(message);
  else failures.push(message);
}

function requireText(content, marker, owner) {
  requireCondition(content.includes(marker), `${owner} contains ${JSON.stringify(marker)}`);
}

function requireHash(relativePath, expected, label = relativePath) {
  const path = resolve(root, relativePath);
  if (!existsSync(path)) {
    failures.push(`missing hash-bound file: ${relativePath}`);
    return;
  }
  requireCondition(sha256(path) === expected, `${label} SHA-256 matches manifest`);
}

function immutable(relativePath) {
  try {
    const output = execFileSync('ls', ['-lO', resolve(root, relativePath)], { encoding: 'utf8' });
    return /\buchg\b/.test(output);
  } catch {
    return false;
  }
}

const packageJson = json('package.json');
const gate = json('.impeccable/main-site-build-gate.json');
const registry = json('beispiele/industry-registry.json');
const agents = read('AGENTS.md');

const skillRoot = join(homedir(), '.hermes', 'skills', 'business', 'belivin-media');
const skillPath = join(skillRoot, 'SKILL.md');
const standardPath = join(skillRoot, 'references', 'belivin-browser-native-delivery-standard.md');
const adapterPath = join(skillRoot, 'references', 'belivin-main-site-impeccable-production-gate.md');

for (const path of [skillPath, standardPath, adapterPath]) {
  requireCondition(existsSync(path), `global workflow file exists: ${path}`);
}

const skill = existsSync(skillPath) ? readFileSync(skillPath, 'utf8') : '';
const standard = existsSync(standardPath) ? readFileSync(standardPath, 'utf8') : '';
const adapter = existsSync(adapterPath) ? readFileSync(adapterPath, 'utf8') : '';

requireText(skill, 'version: 1.3.0', 'belivin-media skill');
requireText(skill, 'references/belivin-browser-native-delivery-standard.md', 'belivin-media skill');
requireText(skill, 'references/belivin-main-site-impeccable-production-gate.md', 'belivin-media skill');
requireText(skill, 'beispiele/industry-registry.json', 'belivin-media skill');
requireText(standard, 'Gate 10 — Responsive, legal, industry and release', 'global delivery standard');
requireText(standard, 'three distinct production-ready templates', 'global delivery standard');
requireText(adapter, 'Gate F — Responsive, legal and release boundary', 'repository adapter');
requireText(adapter, 'npm run gate:main-site:unlock-release', 'repository adapter');
requireText(adapter, 'npm run qa', 'repository adapter');

requireText(agents, 'references/belivin-browser-native-delivery-standard.md', 'AGENTS.md');
requireText(agents, 'references/belivin-main-site-impeccable-production-gate.md', 'AGENTS.md');
requireText(agents, 'npm run gate:main-site:unlock-release', 'AGENTS.md');
requireText(agents, 'npm run handoff:check', 'AGENTS.md');
requireCondition(
  !agents.includes('main-site-production-gate.mjs check` and then `unlock`'),
  'AGENTS.md contains no obsolete check/unlock command',
);

if (packageJson) {
  const requiredScripts = [
    'qa',
    'handoff:check',
    'gate:main-site',
    'gate:main-site:open-hero',
    'gate:main-site:unlock-page',
    'gate:main-site:unlock-release',
    'gate:main-site:lock',
    'gate:main-site:status',
    'gate:main-site:commit',
  ];
  for (const script of requiredScripts) {
    requireCondition(Boolean(packageJson.scripts?.[script]), `package script exists: ${script}`);
  }
}

if (gate) {
  requireCondition(gate.schemaVersion === 2, 'build gate schemaVersion is 2');
  requireCondition(gate.designAuthority === 'impeccable-only', 'build gate keeps Impeccable as sole design authority');
  requireCondition(gate.implementation?.firstViewportHeroTransfer?.changedPixels === 0, 'final root first viewport equals Hero at 0 changed pixels');
  requireCondition(gate.implementation?.releaseReadiness?.responsive?.status === 'pass', 'responsive readiness is pass');
  requireCondition(gate.implementation?.releaseReadiness?.industryRegistry?.status === 'pass', 'industry registry readiness is pass');

  for (const [relativePath, expected] of Object.entries(gate.implementation?.releaseBindings ?? {})) {
    requireHash(relativePath, expected);
  }

  const responsive = gate.implementation?.releaseReadiness?.responsive;
  if (responsive?.qaScript && responsive?.qaScriptSha256) {
    requireHash(responsive.qaScript, responsive.qaScriptSha256, 'responsive QA script');
  } else {
    failures.push('responsive QA script binding missing');
  }

  const industry = gate.implementation?.releaseReadiness?.industryRegistry;
  if (industry?.path && industry?.sha256) {
    requireHash(industry.path, industry.sha256, 'industry registry');
  } else {
    failures.push('industry registry binding missing');
  }

  for (const [pathKey, hashKey] of [
    ['desktopScreenshot', 'desktopScreenshotSha256'],
    ['firstViewportScreenshot', 'firstViewportSha256'],
  ]) {
    const path = gate.implementation?.[pathKey];
    const hash = gate.implementation?.[hashKey];
    if (path && hash) requireHash(path, hash, pathKey);
    else failures.push(`${pathKey} binding missing`);
  }

  const legal = gate.implementation?.releaseReadiness?.legal;
  if (legal?.status === 'blocked' && legal?.licensingAuthorityVerified === false) {
    warnings.push(`RELEASE BLOCKED: ${legal.reason}`);
  } else if (legal?.status !== 'pass' || legal?.licensingAuthorityVerified !== true) {
    failures.push('legal readiness state is inconsistent');
  }

  const approval = gate.implementation?.visualApproval;
  if (approval?.status !== 'approved') {
    warnings.push(`RELEASE BLOCKED: visual approval is ${approval?.status ?? 'missing'}`);
  }

  const handoff = gate.implementation?.sessionHandoff;
  requireCondition(handoff?.status === 'ready', 'manifest session-handoff status is ready');
  requireCondition(handoff?.checkCommand === 'npm run handoff:check', 'manifest exposes the canonical handoff command');
  const workflowBindings = handoff?.workflowBindings ?? {};
  requireCondition(Object.keys(workflowBindings).length >= 6, 'manifest binds the repository workflow contracts');
  for (const [relativePath, expected] of Object.entries(workflowBindings)) {
    requireHash(relativePath, expected, `workflow contract ${relativePath}`);
  }
}

if (registry) {
  const shk = registry.industries?.shk;
  requireCondition(registry.policy?.requiredProductionTemplatesPerIndustry === 3, 'industry policy requires 3 production templates');
  requireCondition(shk?.currentTemplateCount === shk?.templates?.length, 'SHK registry count equals listed templates');
  requireCondition(shk?.currentTemplateCount === 2, 'SHK truth remains 2/3');
  requireCondition(shk?.publicHubEligible === false, 'SHK public hub remains blocked');
  requireCondition(shk?.outreachEligible === false, 'SHK outreach remains blocked');
  requireCondition(registry.globalIndustryHub?.status === 'blocked', 'global industry hub remains blocked');
}

for (const relativePath of [
  '.impeccable/hero-build/index.html',
  '.impeccable/hero-build/styles.css',
  'index.html',
  'styles.css',
  'impressum.html',
  'datenschutz.html',
  'legal.css',
]) {
  requireCondition(immutable(relativePath), `${relativePath} is uchg-locked`);
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
  releaseReady: failures.length === 0 && warnings.every(item => !item.startsWith('RELEASE BLOCKED')),
  passes: passes.length,
  failures,
  warnings,
  nextSession: [
    'Load belivin-media v1.3.0 and its two mandatory references.',
    'Read AGENTS.md, .impeccable/main-site-build-gate.json, and beispiele/industry-registry.json.',
    'Run npm run handoff:check before editing.',
    'Use npm run gate:main-site:unlock-release for approved legal/responsive changes; never bypass uchg.',
    'Do not commit, push, or deploy without Mario approval and a verified licensing/register authority.',
  ],
};

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exitCode = failures.length === 0 ? 0 : 1;
