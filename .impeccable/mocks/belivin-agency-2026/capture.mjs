#!/usr/bin/env node

// Captures every comp at 390x844 and 1440x900 (first screen and full page), checks the
// copy against the locked file, sweeps the responsive widths for overflow, and writes
// one mobile+desktop pair board per comp for the decision page.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const { chromium } = await import(pathToFileURL(join(repo, 'node_modules/playwright/index.mjs')).href);
const { copy } = await import(pathToFileURL(join(here, 'build-comps.mjs')).href);

const lockedPath = join(repo, '.impeccable/copy/belivin-agency-2026-locked.md');
const locked = readFileSync(lockedPath, 'utf8');
const sha256 = path => createHash('sha256').update(readFileSync(path)).digest('hex');

const strings = [];
const collect = value => {
  if (typeof value === 'string') strings.push(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
};
collect(copy);
const missing = strings.filter(value => !value.startsWith('/') && !locked.includes(value));
if (missing.length > 0) {
  process.stderr.write(`Copy outside the locked file:\n- ${missing.join('\n- ')}\n`);
  process.exit(1);
}

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = createServer((request, response) => {
  const path = join(here, decodeURIComponent(new URL(request.url, 'http://x').pathname));
  if (!path.startsWith(here) || !existsSync(path)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
  response.end(readFileSync(path));
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ channel: 'chrome' });
const comps = process.argv.slice(2).length ? process.argv.slice(2) : ['a', 'b', 'c'];
const report = {};

async function open(id, viewport, mobile) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const page = await context.newPage();
  const errors = [];
  page.on('console', message => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${origin}/comp-${id}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => ['is-fitted', 'is-ready'].some(name => document.documentElement.classList.contains(name)));
  await page.waitForTimeout(150);
  return { context, page, errors };
}

for (const id of comps) {
  const entry = { captures: {}, overflow: {}, errors: [] };
  for (const [name, viewport, mobile] of [['mobile', { width: 390, height: 844 }, true], ['desktop', { width: 1440, height: 900 }, false]]) {
    const { context, page, errors } = await open(id, viewport, mobile);
    const first = join(here, `comp-${id}-${viewport.width}x${viewport.height}.png`);
    const full = join(here, `comp-${id}-${viewport.width}-full.png`);
    await page.screenshot({ path: first });
    await page.screenshot({ path: full, fullPage: true });
    entry.captures[name] = { viewport, deviceScaleFactor: mobile ? 2 : 1, firstScreen: relative(repo, first), fullPage: relative(repo, full) };
    const texts = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const found = [];
      while (walker.nextNode()) {
        const parent = walker.currentNode.parentElement;
        if (parent.closest('script, style')) continue;
        const text = walker.currentNode.textContent.replace(/\s+/g, ' ').trim();
        if (text && text !== '·') found.push(text);
      }
      return found;
    });
    const lowerLocked = locked.toLowerCase();
    entry.copyOutsideLock = [...new Set(texts.filter(text => !lowerLocked.includes(text.toLowerCase())))];
    entry.errors.push(...errors);
    await context.close();
  }
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    const mobile = width < 768;
    const { context, page, errors } = await open(id, { width, height: mobile ? 760 : 900 }, mobile);
    entry.overflow[width] = await page.evaluate(() => {
      const root = document.documentElement;
      const clipped = [...document.querySelectorAll('h1, h2, h3, p, li, a, summary, span')]
        .filter(el => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible')
        .map(el => el.textContent.trim().slice(0, 40));
      const outside = [...document.querySelectorAll('h1 span, li, p, a, summary')]
        .filter(el => {
          const box = el.getBoundingClientRect();
          return box.width > 0 && (box.right > root.clientWidth + 1 || box.left < -1);
        })
        .map(el => el.textContent.trim().slice(0, 40));
      return { horizontalScroll: root.scrollWidth > root.clientWidth, clipped, outside };
    });
    entry.errors.push(...errors);
    await context.close();
  }
  report[id] = entry;
}

// Pair boards: desktop first screen beside the mobile first screen, same height.
const board = await browser.newPage({ viewport: { width: 2000, height: 900 } });
for (const id of comps) {
  const desktop = `${origin}/comp-${id}-1440x900.png`;
  const mobile = `${origin}/comp-${id}-390x844.png`;
  await board.setContent(`<!doctype html><html><body style="margin:0;background:#101010;display:flex;gap:40px;padding:40px;align-items:flex-start">
    <img src="${desktop}" style="height:820px;width:auto;display:block">
    <img src="${mobile}" style="height:820px;width:auto;display:block">
  </body></html>`);
  await board.waitForLoadState('networkidle');
  const size = await board.evaluate(() => ({ width: document.body.scrollWidth, height: document.body.scrollHeight }));
  await board.setViewportSize(size);
  const path = join(here, `comp-${id}-pair.png`);
  await board.screenshot({ path });
  report[id].captures.pair = relative(repo, path);
}

await browser.close();
server.close();

function fontsFor(id) {
  if (id === 'kundenweg') {
    return ['funnel-display', 'funnel-sans'].map(name => ({
      family: name === 'funnel-display' ? 'Funnel Display' : 'Funnel Sans',
      file: `fonts/${name}-latin-wght-normal.woff2`,
      license: `fonts/OFL-${name}.txt`,
      origin: `@fontsource-variable/${name}@5.2.8 (SIL OFL 1.1)`,
    }));
  }
  return [{ family: 'Anybody', file: 'fonts/anybody-latin-standard-normal.woff2', license: 'fonts/OFL-Anybody.txt', origin: '@fontsource-variable/anybody@5.2.7 (SIL OFL 1.1)' }];
}

const sources = ['shared/base.css', 'shared/fit.js', 'fonts/anybody-latin-standard-normal.woff2', 'fonts/OFL-Anybody.txt'];
for (const id of comps) {
  const manifestPath = join(here, `comp-${id}.json`);
  const previous = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
  const files = id === 'kundenweg'
    ? ['comp-kundenweg/index.html', 'comp-kundenweg/styles.css', 'comp-kundenweg/kundenweg.js', ...fontsFor(id).flatMap(font => [font.file, font.license])]
    : [`comp-${id}/index.html`, `comp-${id}/comp.css`, ...sources];
  const manifest = {
    id: `comp-${id}`,
    approved: previous.approved ?? false,
    ...(previous.approval ? { approval: previous.approval } : {}),
    source: relative(repo, join(here, `comp-${id}/index.html`)),
    copy: relative(repo, lockedPath),
    copySha256: sha256(lockedPath),
    fonts: fontsFor(id),
    rasters: [],
    captures: report[id].captures,
    responsiveSweep: report[id].overflow,
    browserErrors: report[id].errors,
    copyOutsideLock: report[id].copyOutsideLock,
    hashes: Object.fromEntries(files.map(file => [file, sha256(join(here, file))])),
  };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

process.stdout.write(`${JSON.stringify(Object.fromEntries(comps.map(id => [id, { overflow: report[id].overflow, errors: report[id].errors, copyOutsideLock: report[id].copyOutsideLock }])), null, 2)}\n`);
