import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { promises as fs } from "node:fs";
import { chromium, webkit } from "playwright";

const ROOT = process.cwd();
const OUTPUT = path.join(ROOT, "output", "shk-design-2-qa");
const CALENDLY = "https://calendly.com/mario-belivinmedia/kostenfreier-15-minuten-website-check";
const DESIGN_ROUTE = "/beispiele/shk/design-2/";
const MIME = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".ttf", "font/ttf"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

const viewports = [
  ["mobile-min", 320, 720],
  ["mobile-primary", 390, 844],
  ["mobile-wide", 430, 932],
  ["short-landscape", 568, 320],
  ["tablet-portrait", 768, 1024],
  ["breakpoint-below", 899, 900],
  ["breakpoint-above", 901, 900],
  ["wide-transition-below", 1179, 820],
  ["wide-transition-above", 1181, 820],
  ["desktop", 1440, 900],
  ["desktop-full-hd", 1920, 1080],
  ["desktop-4k", 3840, 2160],
].map(([name, width, height]) => ({ name, width, height }));

const textScaleCases = [
  ["mobile-min", 320, 800],
  ["mobile-primary", 390, 844],
  ["breakpoint-above", 901, 900],
  ["desktop", 1440, 900],
].map(([name, width, height]) => ({ name, width, height }));

function startServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      let pathname = decodeURIComponent(requestUrl.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";
      const file = path.resolve(ROOT, pathname.replace(/^\/+/, ""));
      assert.ok(file === ROOT || file.startsWith(`${ROOT}${path.sep}`));
      const contents = await fs.readFile(file);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": MIME.get(path.extname(file).toLowerCase()) ?? "application/octet-stream",
      });
      if (request.method === "HEAD") response.end();
      else response.end(contents);
    } catch (error) {
      response.writeHead(error?.code === "ENOENT" ? 404 : 500).end("Not found");
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(async (image) => {
      try {
        await image.decode();
      } catch {
        if (!image.complete) {
          await new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          });
        }
      }
    }));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

async function inspect(page, { requireFirstFold = true } = {}) {
  return page.evaluate(({ requireFirstFold: shouldRequireFirstFold }) => {
    const tolerance = 2.5;
    const viewport = { width: innerWidth, height: innerHeight };
    const visible = (element) => {
      if (!(element instanceof Element)) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const label = (element) => {
      const classes = [...element.classList].slice(0, 3).map((value) => `.${value}`).join("");
      return `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${classes}`;
    };
    const rectData = (element) => {
      const rect = element?.getBoundingClientRect();
      if (!rect) return null;
      return Object.fromEntries(["left", "right", "top", "bottom", "width", "height"].map((key) => [key, Math.round(rect[key] * 10) / 10]));
    };

    const semantic = [...document.querySelectorAll("h1,h2,h3,p,li,a,strong")]
      .filter((element) => visible(element) && !element.closest(".sr-only,[aria-hidden='true']"));
    const textOutsideViewport = [];
    for (const element of semantic) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent?.trim() || node.parentElement?.closest(".sr-only,[aria-hidden='true']")) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) {
          if (rect.left < -tolerance || rect.right > viewport.width + tolerance) {
            textOutsideViewport.push({ element: label(element), text: node.textContent.trim().slice(0, 80), left: rect.left, right: rect.right });
          }
        }
      }
    }

    const localOverflow = semantic
      .filter((element) => getComputedStyle(element).display !== "inline" && element.clientWidth > 0 && element.scrollWidth > element.clientWidth + tolerance)
      .map((element) => ({ element: label(element), clientWidth: element.clientWidth, scrollWidth: element.scrollWidth }));

    const criticalTargets = [...document.querySelectorAll(".header-action,.primary-action")].filter(visible);
    const smallTargets = criticalTargets
      .map((element) => ({ element: label(element), ...rectData(element) }))
      .filter((target) => target.width < 44 || target.height < 44);

    const collisions = [];
    const overlaps = (first, second, gap = 2) => first && second
      && first.right > second.left - gap
      && second.right > first.left - gap
      && first.bottom > second.top + gap
      && second.bottom > first.top + gap;

    const textRect = (element) => {
      if (!element) return null;
      const range = document.createRange();
      range.selectNodeContents(element);
      const rect = range.getBoundingClientRect();
      range.detach();
      return rect;
    };

    for (const row of document.querySelectorAll(".comparison li")) {
      const left = textRect(row.querySelector("p"));
      const right = textRect(row.querySelector("strong"));
      if (overlaps(left, right)) collisions.push("comparison");
    }
    if (innerWidth > 560) {
      for (const row of document.querySelectorAll(".supply-map article")) {
        const left = textRect(row.querySelector(":scope > span"));
        const right = textRect(row.querySelector(":scope > div"));
        if (overlaps(left, right)) collisions.push("supply-map");
      }
    }

    const hero = document.querySelector(".hero");
    const heroTitle = document.querySelector("#hero-title");
    const heroAction = hero?.querySelector(".primary-action");
    const heroArt = hero?.querySelector(".hero-art");
    const titleRect = heroTitle?.getBoundingClientRect();
    const actionRect = heroAction?.getBoundingClientRect();
    const firstFoldFailures = [];
    if (shouldRequireFirstFold) {
      for (const [name, rect] of [["title", titleRect], ["action", actionRect]]) {
        if (!rect || rect.left < -tolerance || rect.right > viewport.width + tolerance || rect.top < -tolerance || rect.bottom > viewport.height + tolerance) {
          firstFoldFailures.push({ name, rect: rect ? rectData(name === "title" ? heroTitle : heroAction) : null });
        }
      }
    }

    const source = heroArt instanceof HTMLImageElement ? new URL(heroArt.currentSrc).pathname : null;
    const expectsMobile = innerWidth <= 900 && matchMedia("(orientation: portrait)").matches;
    const wrongHeroSource = !source || (expectsMobile ? !source.includes("hero-mobile-") : !source.includes("hero-desktop-"));
    const brokenImages = [...document.images]
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src);

    return {
      viewport,
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      localOverflow,
      textOutsideViewport,
      smallTargets,
      collisions,
      firstFoldFailures,
      source,
      wrongHeroSource,
      brokenImages,
      heroTitle: rectData(heroTitle),
      heroAction: rectData(heroAction),
    };
  }, { requireFirstFold });
}

function assertReport(report, errors, label) {
  assert.ok(report.documentOverflow <= 2.5, `${label}: document overflow ${report.documentOverflow}px`);
  assert.deepEqual(report.localOverflow, [], `${label}: local overflow ${JSON.stringify(report.localOverflow)}`);
  assert.deepEqual(report.textOutsideViewport, [], `${label}: text outside viewport ${JSON.stringify(report.textOutsideViewport.slice(0, 5))}`);
  assert.deepEqual(report.smallTargets, [], `${label}: small CTA ${JSON.stringify(report.smallTargets)}`);
  assert.deepEqual(report.collisions, [], `${label}: column collision ${JSON.stringify(report.collisions)}`);
  assert.deepEqual(report.firstFoldFailures, [], `${label}: first-fold failure ${JSON.stringify(report.firstFoldFailures)}`);
  assert.equal(report.wrongHeroSource, false, `${label}: wrong hero source ${report.source}`);
  assert.deepEqual(report.brokenImages, [], `${label}: broken images ${JSON.stringify(report.brokenImages)}`);
  assert.deepEqual(errors, [], `${label}: browser errors ${JSON.stringify(errors)}`);
}

async function runViewportMatrix(browserType, browserName, baseUrl) {
  const browser = await browserType.launch({ headless: true });
  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport, locale: "de-DE", timezoneId: "Europe/Berlin" });
      const page = await context.newPage();
      const errors = [];
      page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${baseUrl}${DESIGN_ROUTE}`, { waitUntil: "load" });
      await settle(page);
      const isPortraitSalesSurface = viewport.width <= 900 && viewport.height >= 720 && viewport.height > viewport.width;
      const isDesktopSalesSurface = viewport.width > 900 && viewport.height >= 720;
      const report = await inspect(page, { requireFirstFold: isPortraitSalesSurface || isDesktopSalesSurface });
      assertReport(report, errors, `${browserName}/${viewport.name}`);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

async function runTextScaling(baseUrl) {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const scale of [150, 200]) {
      for (const viewport of textScaleCases) {
        const context = await browser.newContext({ viewport });
        const page = await context.newPage();
        const errors = [];
        page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`${baseUrl}${DESIGN_ROUTE}`, { waitUntil: "load" });
        await page.evaluate((value) => { document.documentElement.style.fontSize = `${value}%`; }, scale);
        await settle(page);
        const report = await inspect(page, { requireFirstFold: false });
        assertReport(report, errors, `chromium/text-${scale}/${viewport.name}`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}

async function runAnchorStability(browserType, browserName, baseUrl) {
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  try {
    for (const viewport of [{ width: 1440, height: 900 }, { width: 3840, height: 2160 }]) {
      await page.setViewportSize(viewport);
      await page.goto(`${baseUrl}${DESIGN_ROUTE}`, { waitUntil: "domcontentloaded" });
      for (const hash of ["#komfort", "#versorgung", "#zusammenspiel"]) {
        for (let attempt = 1; attempt <= 3; attempt += 1) {
          await page.evaluate(() => scrollTo(0, 0));
          await page.locator(`.site-nav a[href="${hash}"]`).click();
          await page.waitForFunction((targetHash) => {
            const target = document.querySelector(targetHash);
            return location.hash === targetHash && target && Math.abs(target.getBoundingClientRect().top) <= 1;
          }, hash);
          const positions = await page.evaluate(async (targetHash) => {
            const samples = [];
            for (let index = 0; index < 12; index += 1) {
              const target = document.querySelector(targetHash);
              samples.push(`${Math.round(scrollY)}:${Math.round(target.getBoundingClientRect().top)}`);
              await new Promise(requestAnimationFrame);
            }
            return [...new Set(samples)];
          }, hash);
          assert.equal(positions.length, 1, `${browserName}/${viewport.width}/${hash}/${attempt}: ${positions.join(",")}`);
          assert.match(positions[0], /^\d+:0$/);
        }
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

async function runInteractionAndScreenshots(baseUrl) {
  await fs.rm(OUTPUT, { recursive: true, force: true });
  await fs.mkdir(OUTPUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of viewports.filter(({ name }) => ["mobile-min", "mobile-primary", "desktop", "desktop-4k"].includes(name))) {
      const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto(`${baseUrl}${DESIGN_ROUTE}`, { waitUntil: "load" });
      await settle(page);
      await page.evaluate(() => { history.replaceState(null, "", location.pathname); scrollTo(0, 0); });
      assert.equal(await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length), 0);
      await page.screenshot({ path: path.join(OUTPUT, `${viewport.name}-hero.png`), fullPage: false });
      if (viewport.name !== "desktop-4k") {
        await page.screenshot({ path: path.join(OUTPUT, `${viewport.name}-full.png`), fullPage: true });
      }
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    await context.route("https://calendly.com/**", (route) => route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><title>Calendly destination probe</title>",
    }));
    const page = await context.newPage();
    await page.goto(`${baseUrl}${DESIGN_ROUTE}`, { waitUntil: "load" });
    await settle(page);

    assert.equal(await page.getByRole("heading", { level: 1, name: /Komfort beginnt unter der Oberfläche/i }).count(), 1);
    assert.equal(await page.locator('nav[aria-label="Hauptnavigation"]').count(), 1);
    assert.equal(await page.getByRole("list", { name: "Drei Ebenen eines gut versorgten Zuhauses" }).count(), 1);
    assert.equal(await page.getByRole("list", { name: "Vorteile einer abgestimmten Planung" }).count(), 1);

    const primary = page.locator(".hero .primary-action");
    await primary.focus();
    const focusStyle = await primary.evaluate((element) => ({
      outlineStyle: getComputedStyle(element).outlineStyle,
      outlineWidth: getComputedStyle(element).outlineWidth,
    }));
    assert.notEqual(focusStyle.outlineStyle, "none");
    assert.notEqual(focusStyle.outlineWidth, "0px");

    const [destination] = await Promise.all([
      context.waitForEvent("page"),
      primary.click(),
    ]);
    await destination.waitForLoadState("domcontentloaded");
    assert.ok(destination.url().startsWith(CALENDLY), `CTA opened ${destination.url()}`);
    await context.close();

    const showroomContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const showroom = await showroomContext.newPage();
    await showroom.goto(`${baseUrl}/beispiele/shk/`, { waitUntil: "load" });
    await settle(showroom);
    assert.equal(await showroom.getByRole("link", { name: /Design 02 Versorgung in Schichten live öffnen/i }).count(), 1);
    await showroom.screenshot({ path: path.join(OUTPUT, "showroom-desktop-full.png"), fullPage: true });
    await showroomContext.close();
  } finally {
    await browser.close();
  }
}

async function main() {
  const { server, baseUrl } = await startServer();
  try {
    await runViewportMatrix(chromium, "chromium", baseUrl);
    await runViewportMatrix(webkit, "webkit", baseUrl);
    await runTextScaling(baseUrl);
    await runAnchorStability(chromium, "chromium", baseUrl);
    await runAnchorStability(webkit, "webkit", baseUrl);
    await runInteractionAndScreenshots(baseUrl);
  } finally {
    await closeServer(server);
  }

  process.stdout.write(`SHK Design 02 browser QA passed: ${viewports.length} viewports × 2 engines, 150%/200% text scaling, repeated anchors, reduced motion, keyboard focus, semantic roles and direct CTA click. Screenshots: ${path.relative(ROOT, OUTPUT)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exitCode = 1;
});
