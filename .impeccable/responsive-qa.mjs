import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { chromium, webkit } from "playwright";

const ROOT = process.cwd();
const CALENDLY = "https://calendly.com/mario-belivinmedia/kostenfreier-15-minuten-website-check";
const MIME = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".avif", "image/avif"],
  [".woff2", "font/woff2"],
  [".ttf", "font/ttf"],
  [".txt", "text/plain; charset=utf-8"],
]);

function resolveRequestPath(urlPath) {
  const pathname = decodeURIComponent(urlPath.split("?")[0]);
  const relative = pathname.endsWith("/") ? `${pathname}index.html` : pathname;
  const resolved = path.resolve(ROOT, `.${relative}`);
  assert.ok(resolved.startsWith(`${ROOT}${path.sep}`) || resolved === ROOT, "request escaped project root");
  return resolved;
}

async function serveFile(request, response) {
  try {
    let filePath = resolveRequestPath(request.url ?? "/");
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) filePath = path.join(filePath, "index.html");
    const body = await readFile(filePath);
    response.writeHead(200, {
      "content-type": MIME.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = createServer((request, response) => void serveFile(request, response));
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
assert.ok(address && typeof address === "object");
const baseURL = `http://127.0.0.1:${address.port}`;

const mainProfiles = [
  { name: "desktop-master", width: 1672, height: 941 },
  { name: "compact-desktop", width: 1366, height: 900 },
  { name: "tablet-landscape", width: 1024, height: 900 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "large-mobile", width: 430, height: 932 },
  { name: "mobile", width: 390, height: 844 },
  { name: "small-mobile", width: 360, height: 800 },
];
const legalProfiles = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

async function localTargetsAreReachable(context, page) {
  const hrefs = await page.locator("a[href]").evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.href),
  );
  const targets = [...new Set(hrefs
    .map((href) => new URL(href))
    .filter((url) => url.origin === baseURL)
    .map((url) => `${url.origin}${url.pathname}${url.search}`))];

  for (const target of targets) {
    const response = await context.request.get(target, { failOnStatusCode: false });
    assert.equal(response.status(), 200, `local link did not return 200: ${target}`);
  }
}

async function runPage(browserName, browser, route, profile, kind) {
  const context = await browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const externalRequests = [];
  const badResponses = [];

  await page.addInitScript(() => {
    window.__qaCLS = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__qaCLS += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("requestfailed", (request) => failedRequests.push(`${request.method()} ${request.url()}`));
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== baseURL && !["data:", "blob:"].includes(url.protocol)) externalRequests.push(request.url());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
  });

  const response = await page.goto(`${baseURL}${route}`, { waitUntil: "load" });
  assert.equal(response?.status(), 200, `${route} did not return 200`);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });

  const metrics = await page.evaluate(({ kind, width }) => {
    const root = document.documentElement;
    const probe = (selector) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`missing ${selector}`);
      const box = element.getBoundingClientRect();
      return {
        selector,
        x: box.x,
        right: box.right,
        width: box.width,
        height: box.height,
      };
    };
    const fonts = [...document.fonts].map((font) => ({ family: font.family, status: font.status }));
    const resources = performance.getEntriesByType("resource");
    const result = {
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      hasHeader: Boolean(document.querySelector("header")),
      hasMain: Boolean(document.querySelector("main")),
      hasFooter: Boolean(document.querySelector("footer")),
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      cls: window.__qaCLS ?? 0,
      fonts,
      scriptCount: document.scripts.length,
      resourceCount: resources.length,
      transferBytes: resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0),
      probes: [],
    };
    if (kind === "main") {
      result.probes = [".hero", ".primary-ticket", ".proof-window", ".products", ".process-section", ".region-sign", ".closing-ticket"]
        .map(probe);
      const hero = document.querySelector(".hero").getBoundingClientRect();
      result.desktopMasterHeight = width === 1672 ? hero.height : null;
    } else {
      result.probes = [".legal-header", ".legal-hero", ".legal-document", ".legal-footer"].map(probe);
    }
    return result;
  }, { kind, width: profile.width });

  assert.equal(metrics.h1Count, 1, `${route} must expose exactly one h1`);
  assert.ok(metrics.hasHeader && metrics.hasMain && metrics.hasFooter, `${route} must expose header/main/footer`);
  assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, `${route} overflows by ${metrics.scrollWidth - metrics.clientWidth}px at ${profile.width}px`);
  assert.ok(metrics.fonts.length >= 2 && metrics.fonts.every((font) => font.status === "loaded"), `${route} fonts did not load`);
  assert.ok(metrics.cls <= 0.1, `${route} CLS ${metrics.cls.toFixed(3)} exceeded 0.1`);
  assert.deepEqual(consoleErrors, [], `${route} console errors: ${consoleErrors.join(" | ")}`);
  assert.deepEqual(pageErrors, [], `${route} page errors: ${pageErrors.join(" | ")}`);
  assert.deepEqual(failedRequests, [], `${route} failed requests: ${failedRequests.join(" | ")}`);
  assert.deepEqual(badResponses, [], `${route} bad responses: ${badResponses.join(" | ")}`);
  assert.deepEqual(externalRequests, [], `${route} loaded third-party resources: ${externalRequests.join(" | ")}`);

  for (const probe of metrics.probes) {
    assert.ok(probe.width > 0 && probe.height > 0, `${route} ${probe.selector} has no box`);
    assert.ok(probe.x >= -1, `${route} ${probe.selector} begins outside viewport`);
    assert.ok(probe.right <= profile.width + 1, `${route} ${probe.selector} exceeds viewport by ${(probe.right - profile.width).toFixed(1)}px`);
  }
  if (kind === "main" && profile.width === 1672) assert.equal(metrics.desktopMasterHeight, 941);
  if (kind === "legal") assert.equal(metrics.scriptCount, 0, `${route} must remain script-free`);

  const allLinks = page.locator("a[href]");
  const linkCount = await allLinks.count();
  assert.ok(linkCount >= 2, `${route} must expose usable links`);
  for (let index = 0; index < linkCount; index += 1) {
    const link = allLinks.nth(index);
    const href = await link.getAttribute("href");
    assert.ok(href && href !== "#", `${route} contains an empty link`);
    if (/^https?:/.test(href) && !href.startsWith(baseURL)) {
      const target = await link.getAttribute("target");
      const rel = await link.getAttribute("rel");
      assert.equal(target, "_blank", `${route} external link must open separately`);
      assert.match(rel ?? "", /noopener/, `${route} external link must set noopener`);
    }
  }

  if (kind === "main") {
    const navLinks = page.locator(".site-nav a");
    assert.equal(await navLinks.count(), 4);
    const navHits = await navLinks.evaluateAll((anchors) => anchors.map((anchor) => {
      const box = anchor.getBoundingClientRect();
      const x = Math.max(0, Math.min(innerWidth - 1, box.x + box.width / 2));
      const y = Math.max(0, Math.min(innerHeight - 1, box.y + box.height / 2));
      const hit = document.elementFromPoint(x, y);
      return hit === anchor || anchor.contains(hit);
    }));
    assert.ok(navHits.every(Boolean), `${route} navigation contains a blocked hit area`);
    assert.equal(await page.locator(`a[href="${CALENDLY}"]`).count(), 2, "approved Calendly CTA count changed");
    await navLinks.first().focus();
    const focusOutline = await navLinks.first().evaluate((link) => getComputedStyle(link).outlineStyle);
    assert.notEqual(focusOutline, "none", "main navigation lacks visible keyboard focus");
  } else {
    await page.locator(".legal-back").focus();
    const focusOutline = await page.locator(".legal-back").evaluate((link) => getComputedStyle(link).outlineStyle);
    assert.notEqual(focusOutline, "none", "legal navigation lacks visible keyboard focus");
  }

  await localTargetsAreReachable(context, page);
  await context.close();
  return {
    browser: browserName,
    route,
    viewport: `${profile.width}x${profile.height}`,
    cls: Number(metrics.cls.toFixed(4)),
    resources: metrics.resourceCount,
    transferKB: Math.round(metrics.transferBytes / 1024),
  };
}

const results = [];
try {
  const chromiumBrowser = await chromium.launch({ headless: true });
  try {
    for (const profile of mainProfiles) results.push(await runPage("chromium", chromiumBrowser, "/", profile, "main"));
    for (const route of ["/impressum.html", "/datenschutz.html"]) {
      for (const profile of legalProfiles) results.push(await runPage("chromium", chromiumBrowser, route, profile, "legal"));
    }
  } finally {
    await chromiumBrowser.close();
  }

  const webkitBrowser = await webkit.launch({ headless: true });
  try {
    for (const profile of [mainProfiles[0], mainProfiles[5]]) results.push(await runPage("webkit", webkitBrowser, "/", profile, "main"));
    for (const route of ["/impressum.html", "/datenschutz.html"]) {
      results.push(await runPage("webkit", webkitBrowser, route, legalProfiles[2], "legal"));
    }
  } finally {
    await webkitBrowser.close();
  }

  console.log(JSON.stringify({ status: "pass", checks: results.length, results }, null, 2));
} finally {
  await new Promise((resolve) => server.close(resolve));
}
