import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { promises as fs } from "node:fs";
import { chromium, webkit } from "playwright";

const ROOT = process.cwd();
const MIME = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

async function startServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";
      const file = path.resolve(ROOT, pathname.replace(/^\/+/, ""));
      assert.ok(file === ROOT || file.startsWith(`${ROOT}${path.sep}`));

      if (pathname.endsWith("/beispiele/shk/design-1/styles.css")) {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }

      const contents = await fs.readFile(file);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": MIME.get(path.extname(file)) ?? "application/octet-stream",
      });
      response.end(contents);
    } catch (error) {
      response.writeHead(error?.code === "ENOENT" ? 404 : 500).end("Not found");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  return { server, baseUrl: `http://127.0.0.1:${address.port}` };
}

async function closeServer(server) {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

for (const [browserName, browserType] of [["chromium", chromium], ["webkit", webkit]]) {
  test(`SHK header navigation is one-click stable in ${browserName}`, async () => {
    const { server, baseUrl } = await startServer();
    const browser = await browserType.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    try {
      for (const viewport of [{ width: 1440, height: 900 }, { width: 3840, height: 2160 }]) {
        await page.setViewportSize(viewport);
        await page.goto(`${baseUrl}/beispiele/shk/design-1/`, { waitUntil: "domcontentloaded" });

        const initialHeader = await page.locator(".desktop-nav").evaluate((nav) => {
          const rect = nav.getBoundingClientRect();
          return { display: getComputedStyle(nav).display, x: rect.x, width: rect.width };
        });
        assert.equal(initialHeader.display, "flex");
        assert.ok(initialHeader.x > 500, `header hitbox moved before CSS settled: ${JSON.stringify(initialHeader)}`);

        for (const hash of ["#leistungen", "#bad-wasser", "#ablauf"]) {
          for (let attempt = 1; attempt <= 5; attempt += 1) {
            await page.evaluate(() => window.scrollTo(0, 0));
            await page.locator(`.desktop-nav a[href="${hash}"]`).click();
            await page.waitForFunction((targetHash) => {
              const target = document.querySelector(targetHash);
              return location.hash === targetHash && target && Math.abs(target.getBoundingClientRect().top) <= 1;
            }, hash);

            const positions = await page.evaluate(async (targetHash) => {
              const samples = [];
              const deadline = performance.now() + 500;
              while (performance.now() < deadline) {
                const target = document.querySelector(targetHash);
                samples.push(`${Math.round(scrollY)}:${Math.round(target.getBoundingClientRect().top)}`);
                await new Promise(requestAnimationFrame);
              }
              return [...new Set(samples)];
            }, hash);

            assert.equal(positions.length, 1, `${viewport.width}px ${hash} attempt ${attempt} moved after click: ${positions.join(", ")}`);
            assert.match(positions[0], /^\d+:0$/);
          }
        }
      }
    } finally {
      await context.close();
      await browser.close();
      await closeServer(server);
    }
  });
}
