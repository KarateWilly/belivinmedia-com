import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import test from 'node:test';

import { chromium } from 'playwright';

const ROOT = path.resolve(import.meta.dirname, '..');
const MIME_TYPES = new Map([
  ['.avif', 'image/avif'],
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);

function startServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      const pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
      const filePath = path.resolve(ROOT, pathname.replace(/^\/+/, ''));
      if (!filePath.startsWith(`${ROOT}${path.sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
      }

      const contents = await fs.readFile(filePath);
      response.writeHead(200, {
        'Cache-Control': 'no-store',
        'Content-Type': MIME_TYPES.get(path.extname(filePath)) ?? 'application/octet-stream',
      }).end(contents);
    } catch (error) {
      const status = error?.code === 'ENOENT' ? 404 : 500;
      response.writeHead(status).end(status === 404 ? 'Not found' : 'Server error');
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Analytics test server did not expose a port.'));
        return;
      }

      resolve({ server, url: `http://127.0.0.1:${address.port}/` });
    });
  });
}

test('browser clicks queue only the approved conversion properties', async () => {
  const { server, url } = await startServer();
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.route('**/_vercel/insights/script.js', (route) => route.fulfill({
      body: '/* Vercel Analytics test stub */',
      contentType: 'text/javascript',
      status: 200,
    }));
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => {
      document.addEventListener('click', (event) => event.preventDefault(), { capture: true });
    });

    await page.locator('[data-analytics-event="calendly_click"][data-analytics-placement="nav"]').first().click();
    await page.locator('[data-analytics-event="calendly_click"][data-analytics-placement="hero"]').click();
    await page.locator('[data-analytics-event="case_study_click"]').click();
    await page.locator('[data-analytics-event="calendly_click"][data-analytics-placement="closing"]').click();
    await page.locator('[data-analytics-event="email_click"]').click();

    const queue = await page.evaluate(() => (window.vaq ?? []).map((entry) => [...entry]));
    assert.deepEqual(queue, [
      ['event', { name: 'calendly_click', data: { placement: 'nav' } }],
      ['event', { name: 'calendly_click', data: { placement: 'hero' } }],
      ['event', { name: 'case_study_click', data: { project: 'bestlife', placement: 'customer_proof' } }],
      ['event', { name: 'calendly_click', data: { placement: 'closing' } }],
      ['event', { name: 'email_click', data: { placement: 'footer' } }],
    ]);

    const serialized = JSON.stringify(queue);
    assert.doesNotMatch(serialized, /mario@|calendly\.com|bestlifeliving\.de|Cristina|token=/i);
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
