#!/usr/bin/env node

// Proves the built root page against the approved Kundenweg comp at 390 and 1440,
// with motion reduced so animation cannot fake a difference, and writes the review evidence.

import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const review = join(repo, '.impeccable/review');
const { chromium } = await import(pathToFileURL(join(repo, 'node_modules/playwright/index.mjs')).href);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png' };

const server = createServer((request, response) => {
  let path = join(repo, decodeURIComponent(new URL(request.url, 'http://x').pathname));
  if (path.endsWith('/')) path = join(path, 'index.html');
  if (!path.startsWith(repo) || !existsSync(path)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
  response.end(readFileSync(path));
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const comp = `${origin}/.impeccable/mocks/belivin-agency-2026/comp-kundenweg/index.html`;
const build = `${origin}/`;

const browser = await chromium.launch({ channel: 'chrome' });
const result = {};

async function shoot(url, viewport, mobile, fullPage = false) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  const external = [];
  page.on('console', message => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => !request.url().startsWith(origin) && external.push(request.url()));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'));
  // Lanes redraw on the ResizeObserver's next frame; let it settle before capturing.
  await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
  await page.waitForTimeout(500);
  const image = await page.screenshot({ fullPage });
  await context.close();
  return { image, errors, external };
}

async function diff(a, b) {
  const page = await browser.newPage();
  const count = await page.evaluate(async ([left, right]) => {
    const load = src => new Promise(done => { const image = new Image(); image.onload = () => done(image); image.src = src; });
    const [one, two] = await Promise.all([load(left), load(right)]);
    if (one.width !== two.width || one.height !== two.height) return { sizeMismatch: [one.width, one.height, two.width, two.height] };
    const pixels = image => {
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height).data;
    };
    const p = pixels(one);
    const q = pixels(two);
    let changed = 0;
    for (let i = 0; i < p.length; i += 4) {
      if (Math.abs(p[i] - q[i]) + Math.abs(p[i + 1] - q[i + 1]) + Math.abs(p[i + 2] - q[i + 2]) > 6) changed += 1;
    }
    return { changed, total: p.length / 4 };
  }, [`data:image/png;base64,${a.toString('base64')}`, `data:image/png;base64,${b.toString('base64')}`]);
  await page.close();
  return count;
}

for (const [name, viewport, mobile] of [['mobile', { width: 390, height: 844 }, true], ['desktop', { width: 1440, height: 900 }, false]]) {
  const fromComp = await shoot(comp, viewport, mobile);
  const fromBuild = await shoot(build, viewport, mobile);
  const full = await shoot(build, viewport, mobile, true);
  writeFileSync(join(review, name === 'desktop' ? 'hero-repro.png' : 'hero-repro-mobile.png'), fromBuild.image);
  writeFileSync(join(review, `${name}.png`), full.image);
  result[name] = {
    firstScreenVsComp: await diff(fromComp.image, fromBuild.image),
    buildErrors: [...fromBuild.errors, ...full.errors],
    externalRequests: [...new Set([...fromBuild.external, ...full.external])],
  };
}

await browser.close();
server.close();
writeFileSync(join(review, 'prove-build.json'), `${JSON.stringify(result, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
