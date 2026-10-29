#!/usr/bin/env node

// Release QA for the Kundenweg main site and the legal pages: Chromium and WebKit,
// phone to wide desktop. Checks horizontal bounds, fonts, console and page errors,
// third-party requests, local links and anchors, hit areas, keyboard focus,
// layout shift, the lanes, and the primary action in the first screen.

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { chromium, webkit } from 'playwright';

const root = resolve(process.cwd());
const outputDir = join(root, 'output/responsive-qa');
const pages = ['/', '/impressum.html', '/datenschutz.html'];
const viewports = [
  { name: 'phone-small', width: 320, height: 568, mobile: true },
  { name: 'phone', width: 390, height: 844, mobile: true },
  { name: 'phone-landscape', width: 844, height: 390, mobile: true },
  { name: 'tablet', width: 768, height: 1024, mobile: true },
  { name: 'laptop', width: 1024, height: 768, mobile: false },
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'wide', width: 1920, height: 1080, mobile: false },
];
// The approved comps prove the primary action inside the first screen at these sizes.
const firstScreenAction = new Set(['phone', 'desktop', 'wide']);
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.xml': 'application/xml' };

const server = createServer((request, response) => {
  let path = join(root, decodeURIComponent(new URL(request.url, 'http://x').pathname));
  if (path.endsWith('/')) path = join(path, 'index.html');
  if (!path.startsWith(root) || !existsSync(path)) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
  response.end(readFileSync(path));
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;

async function launch(type) {
  try {
    return await type.launch();
  } catch (error) {
    // Locally a missing bundled Chromium may fall back to installed Chrome; CI installs both engines.
    if (type === chromium && !process.env.CI) return chromium.launch({ channel: 'chrome' });
    throw new Error(`${type.name()} is not installed: run "npx playwright install ${type.name()}" (${error.message.split('\n')[0]})`);
  }
}

const failures = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);
mkdirSync(outputDir, { recursive: true });

// QA_ENGINES=chromium narrows a local run; the release floor and CI run both engines.
const engines = (process.env.QA_ENGINES ?? 'chromium,webkit').split(',').map(name => ({ chromium, webkit })[name.trim()]);

for (const engine of engines) {
  const browser = await launch(engine);
  for (const viewport of viewports) {
    for (const path of pages) {
      const where = `${engine.name()} ${viewport.name} ${path}`;
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.mobile ? 2 : 1,
        isMobile: viewport.mobile && engine === chromium,
        hasTouch: viewport.mobile,
      });
      const page = await context.newPage();
      const errors = [];
      const external = [];
      page.on('console', message => message.type() === 'error' && errors.push(message.text()));
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => !request.url().startsWith(origin) && !request.url().startsWith('data:') && external.push(request.url()));
      await page.addInitScript(() => {
        window.__shift = 0;
        try {
          new PerformanceObserver(list => {
            for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__shift += entry.value;
          }).observe({ type: 'layout-shift', buffered: true });
        } catch {
          window.__shift = null;
        }
      });

      await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      if (path === '/') await page.waitForFunction(() => document.documentElement.classList.contains('is-ready'));
      await page.waitForTimeout(300);

      const report = await page.evaluate(({ isMain, wantAction }) => {
        const doc = document.documentElement;
        const result = {
          horizontalScroll: doc.scrollWidth > doc.clientWidth + 1,
          fonts: ['Funnel Display', 'Funnel Sans'].filter(family => !document.fonts.check(`400 20px "${family}"`)),
          outside: [...document.querySelectorAll('h1, h2, h3, p, li, a, summary, dt, dd')]
            .filter(element => {
              const box = element.getBoundingClientRect();
              return box.width > 0 && (box.right > doc.clientWidth + 1 || box.left < -1);
            })
            .map(element => element.textContent.trim().slice(0, 40)),
          smallTargets: [...document.querySelectorAll('a, summary, button')]
            // Links inside running text are exempt (WCAG 2.5.8 inline exception).
            .filter(element => !element.closest('p, address, dd, .legal-section li'))
            .filter(element => {
              const box = element.getBoundingClientRect();
              return box.width > 0 && (box.width < 24 || box.height < 24);
            })
            .map(element => element.textContent.trim().slice(0, 40)),
          missingAnchors: [...document.querySelectorAll('a[href^="#"]')]
            .map(element => element.getAttribute('href'))
            .filter(href => href.length > 1 && !document.getElementById(href.slice(1))),
          localLinks: [...new Set([...document.querySelectorAll('a[href^="/"]')].map(element => element.getAttribute('href').split('#')[0]))],
          shift: window.__shift,
        };
        if (isMain) {
          result.lanes = document.querySelectorAll('.lanes .lane, .chain-lane .lane, .finale-lane .lane').length;
          if (wantAction) {
            const action = document.querySelector('.converge-action .cta').getBoundingClientRect();
            result.actionInFirstScreen = action.bottom <= innerHeight && action.top >= 0;
          }
        }
        return result;
      }, { isMain: path === '/', wantAction: firstScreenAction.has(viewport.name) });

      if (errors.length) fail(where, `browser errors: ${errors.join(' | ')}`);
      if (external.length) fail(where, `third-party requests: ${[...new Set(external)].join(', ')}`);
      if (report.horizontalScroll) fail(where, 'horizontal scroll');
      if (report.outside.length) fail(where, `content outside the viewport: ${report.outside.join(' | ')}`);
      if (report.fonts.length) fail(where, `fonts not loaded: ${report.fonts.join(', ')}`);
      if (report.smallTargets.length) fail(where, `hit areas under 24px: ${report.smallTargets.join(' | ')}`);
      if (report.missingAnchors.length) fail(where, `missing anchors: ${report.missingAnchors.join(', ')}`);
      if (report.shift !== null && report.shift > 0.1) fail(where, `layout shift ${report.shift.toFixed(3)}`);
      if (path === '/' && report.lanes < 6) fail(where, `only ${report.lanes} lanes drawn`);
      if (report.actionInFirstScreen === false) fail(where, 'primary action outside the first screen');

      for (const link of report.localLinks) {
        const response = await page.request.get(`${origin}${link}`);
        if (response.status() !== 200) fail(where, `local link ${link} returned ${response.status()}`);
      }

      // Keyboard: every focus stop shows a visible outline.
      for (let step = 0; step < 6; step += 1) {
        await page.keyboard.press('Tab');
        const focus = await page.evaluate(() => {
          const element = document.activeElement;
          if (!element || element === document.body) return null;
          const style = getComputedStyle(element);
          return { label: element.textContent.trim().slice(0, 30), visible: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0 };
        });
        if (focus && !focus.visible) fail(where, `focus not visible on "${focus.label}"`);
      }

      if (failures.some(entry => entry.startsWith(where))) {
        await page.screenshot({ path: join(outputDir, `${engine.name()}-${viewport.name}-${path.replace(/\W+/g, '') || 'index'}.png`), fullPage: true });
      }
      await context.close();
    }
  }
  await browser.close();
}

server.close();
const checked = engines.length * viewports.length * pages.length;
if (failures.length) {
  process.stderr.write(`Responsive QA failed (${failures.length} findings across ${checked} page renders):\n- ${failures.join('\n- ')}\n`);
  process.exit(1);
}
process.stdout.write(`Responsive QA passed: ${checked} page renders in ${engines.map(engine => engine.name()).join(' and ')}.\n`);
