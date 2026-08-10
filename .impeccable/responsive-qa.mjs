import http from "node:http";
import path from "node:path";
import process from "node:process";
import { promises as fs } from "node:fs";
import { chromium, webkit } from "playwright";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "output", "responsive-qa");
const TOLERANCE = 2.5;

const portraitCases = [
  ["portrait-320x568", 320, 568],
  ["portrait-360x640", 360, 640],
  ["portrait-375x667", 375, 667],
  ["portrait-390x844", 390, 844],
  ["portrait-393x852", 393, 852],
  ["portrait-430x932", 430, 932],
];

const landscapeCases = [
  ["landscape-480x320", 480, 320],
  ["landscape-568x320", 568, 320],
  ["landscape-667x375", 667, 375],
  ["landscape-740x360", 740, 360],
  ["landscape-844x390", 844, 390],
  ["landscape-852x393", 852, 393],
];

const tabletCases = [
  ["tablet-768x1024", 768, 1024],
  ["tablet-820x1180", 820, 1180],
  ["tablet-1024x768", 1024, 768],
];

const desktopCases = [
  ["desktop-1280x720", 1280, 720],
  ["desktop-1366x768", 1366, 768],
  ["desktop-1440x900", 1440, 900],
  ["desktop-1600x900", 1600, 900],
  ["desktop-1680x1050", 1680, 1050],
  ["desktop-1728x900", 1728, 900],
  ["desktop-1920x1080", 1920, 1080],
  ["desktop-2560x1440", 2560, 1440],
];

const breakpointFlanks = [
  ["flank-359", 359, 800],
  ["flank-360", 360, 800],
  ["flank-361", 361, 800],
  ["flank-519", 519, 844],
  ["flank-520", 520, 844],
  ["flank-521", 521, 844],
  ["flank-899", 899, 900],
  ["flank-900", 900, 900],
  ["flank-901", 901, 900],
  ["flank-1099", 1099, 800],
  ["flank-1100", 1100, 800],
  ["flank-1101", 1101, 800],
  ["flank-1179", 1179, 820],
  ["flank-1180", 1180, 820],
  ["flank-1181", 1181, 820],
  ["flank-1439", 1439, 900],
  ["flank-1440", 1440, 900],
  ["flank-1441", 1441, 900],
];

const viewportCases = [
  ...portraitCases,
  ...landscapeCases,
  ...tabletCases,
  ...desktopCases,
  ...breakpointFlanks,
].map(([name, width, height]) => ({ name, width, height }));

const textScaleCases = [
  { name: "text-mobile-320x800", width: 320, height: 800 },
  { name: "text-mobile-390x844", width: 390, height: 844 },
  { name: "text-landscape-568x320", width: 568, height: 320 },
  { name: "text-breakpoint-901x900", width: 901, height: 900 },
  { name: "text-breakpoint-1100x800", width: 1100, height: 800 },
  { name: "text-breakpoint-1440x900", width: 1440, height: 900 },
  { name: "text-desktop-1440x900", width: 1440, height: 900 },
];

const browserTypes = [
  ["chromium", chromium],
  ["webkit", webkit],
];

const motionModes = ["no-preference", "reduce"];

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

function startStaticServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
      let pathname = decodeURIComponent(requestUrl.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";

      const relativePath = pathname.replace(/^\/+/, "");
      const filePath = path.resolve(ROOT, relativePath);
      const insideRoot = filePath === ROOT || filePath.startsWith(`${ROOT}${path.sep}`);

      if (!insideRoot) {
        response.writeHead(403).end("Forbidden");
        return;
      }

      const contents = await fs.readFile(filePath);
      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type": mimeTypes.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream",
      });
      if (request.method === "HEAD") response.end();
      else response.end(contents);
    } catch (error) {
      const status = error?.code === "ENOENT" || error?.code === "EISDIR" ? 404 : 500;
      response.writeHead(status).end(status === 404 ? "Not found" : "Server error");
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Static QA server did not expose a TCP port."));
        return;
      }

      resolve({
        server,
        url: `http://127.0.0.1:${address.port}/`,
      });
    });
  });
}

function stopStaticServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function pageDiagnostics(page) {
  const errors = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });

  return errors;
}

async function settlePage(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;

    const heroArt = document.querySelector(".hero-art");
    if (heroArt instanceof HTMLImageElement && !heroArt.complete) {
      await heroArt.decode().catch(() => undefined);
    }

    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    for (const animation of document.getAnimations()) {
      try {
        animation.finish();
      } catch {
        // An animation without an active timeline cannot affect the settled layout check.
      }
    }

    await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

async function inspectResponsiveLayout(page) {
  return page.evaluate(({ tolerance }) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const semanticSelector = "h1,h2,h3,p,li,a,button,blockquote,figcaption,strong,.brand,.primary-action,.nav-action";
    const clippingValues = new Set(["auto", "clip", "hidden", "scroll"]);

    function rounded(value) {
      return Math.round(value * 10) / 10;
    }

    function label(element) {
      if (!(element instanceof Element)) return "unknown";
      const id = element.id ? `#${element.id}` : "";
      const classes = [...element.classList].slice(0, 3).map((name) => `.${name}`).join("");
      return `${element.tagName.toLowerCase()}${id}${classes}`;
    }

    function isExcluded(element) {
      return Boolean(element.closest("[hidden],.sr-only,script,style,noscript,[aria-hidden='true']"));
    }

    function isRendered(element) {
      if (!(element instanceof Element) || isExcluded(element)) return false;

      for (let current = element; current; current = current.parentElement) {
        const style = getComputedStyle(current);
        if (style.display === "none" || style.visibility === "hidden" || style.contentVisibility === "hidden") {
          return false;
        }
      }

      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }

    function rectData(rect) {
      return {
        bottom: rounded(rect.bottom),
        height: rounded(rect.height),
        left: rounded(rect.left),
        right: rounded(rect.right),
        top: rounded(rect.top),
        width: rounded(rect.width),
      };
    }

    const documentWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth ?? 0,
    );

    const localScrollOverflow = [];
    for (const element of document.querySelectorAll(semanticSelector)) {
      if (!isRendered(element)) continue;
      const style = getComputedStyle(element);
      if (style.display === "inline" || element.clientWidth <= 0) continue;
      if (element.scrollWidth <= element.clientWidth + tolerance) continue;

      localScrollOverflow.push({
        element: label(element),
        clientWidth: rounded(element.clientWidth),
        scrollWidth: rounded(element.scrollWidth),
      });
    }

    const textOutsideViewport = [];
    const clippedText = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let textNode;

    while ((textNode = walker.nextNode())) {
      if (!textNode.textContent?.trim()) continue;
      const parent = textNode.parentElement;
      if (!parent || !parent.closest(semanticSelector) || !isRendered(parent)) continue;

      const range = document.createRange();
      range.selectNodeContents(textNode);

      for (const rect of range.getClientRects()) {
        if (rect.width <= 0 || rect.height <= 0) continue;

        if (rect.left < -tolerance || rect.right > viewportWidth + tolerance) {
          textOutsideViewport.push({
            element: label(parent),
            rect: rectData(rect),
            text: textNode.textContent.trim().slice(0, 80),
          });
        }

        for (let ancestor = parent; ancestor && ancestor !== document.body; ancestor = ancestor.parentElement) {
          const style = getComputedStyle(ancestor);
          const clipsHorizontally = clippingValues.has(style.overflowX) || style.clipPath !== "none";
          if (!clipsHorizontally) continue;

          const ancestorRect = ancestor.getBoundingClientRect();
          if (rect.left < ancestorRect.left - tolerance || rect.right > ancestorRect.right + tolerance) {
            clippedText.push({
              ancestor: label(ancestor),
              element: label(parent),
              ancestorRect: rectData(ancestorRect),
              rect: rectData(rect),
              text: textNode.textContent.trim().slice(0, 80),
            });
            break;
          }
        }
      }

      range.detach();
    }

    const heroTitle = document.querySelector("#hero-title");
    const heroAction = document.querySelector(".hero .primary-action");
    const heroArt = document.querySelector(".hero-art");
    const decisionArrow = document.querySelector(".sequence-result");

    const heroTitleRect = heroTitle?.getBoundingClientRect();
    const heroActionRect = heroAction?.getBoundingClientRect();
    const heroArtRect = heroArt?.getBoundingClientRect();
    const decisionArrowRect = decisionArrow?.getBoundingClientRect();

    const artIntersection = heroArtRect ? {
      width: Math.max(0, Math.min(heroArtRect.right, viewportWidth) - Math.max(heroArtRect.left, 0)),
      height: Math.max(0, Math.min(heroArtRect.bottom, viewportHeight) - Math.max(heroArtRect.top, 0)),
    } : { width: 0, height: 0 };
    artIntersection.area = artIntersection.width * artIntersection.height;

    const touchTargetViolations = [];
    for (const element of document.querySelectorAll("button,[role='button'],a.primary-action,a.nav-action")) {
      if (!isRendered(element)) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width + 0.5 < 44 || rect.height + 0.5 < 44) {
        touchTargetViolations.push({
          element: label(element),
          rect: rectData(rect),
        });
      }
    }

    return {
      viewport: { width: viewportWidth, height: viewportHeight },
      documentOverflow: {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: documentWidth,
        overflow: rounded(documentWidth - document.documentElement.clientWidth),
      },
      localScrollOverflow,
      textOutsideViewport,
      clippedText,
      hero: {
        title: heroTitleRect ? rectData(heroTitleRect) : null,
        action: heroActionRect ? rectData(heroActionRect) : null,
        art: heroArtRect ? rectData(heroArtRect) : null,
        artComplete: heroArt instanceof HTMLImageElement ? heroArt.complete && heroArt.naturalWidth > 0 : false,
        artIntersection: {
          width: rounded(artIntersection.width),
          height: rounded(artIntersection.height),
          area: rounded(artIntersection.area),
        },
      },
      decisionArrow: decisionArrowRect ? rectData(decisionArrowRect) : null,
      touchTargetViolations,
    };
  }, { tolerance: TOLERANCE });
}

function baselineIssues(report, consoleErrors) {
  const issues = [];
  const { width, height } = report.viewport;

  if (report.documentOverflow.overflow > TOLERANCE) {
    issues.push(`document overflows horizontally by ${report.documentOverflow.overflow}px`);
  }
  if (report.localScrollOverflow.length) {
    issues.push(`local semantic overflow: ${JSON.stringify(report.localScrollOverflow.slice(0, 8))}`);
  }
  if (report.textOutsideViewport.length) {
    issues.push(`semantic text outside viewport: ${JSON.stringify(report.textOutsideViewport.slice(0, 8))}`);
  }
  if (report.clippedText.length) {
    issues.push(`text clipped by ancestor: ${JSON.stringify(report.clippedText.slice(0, 8))}`);
  }

  const title = report.hero.title;
  if (!title) {
    issues.push("hero title is missing");
  } else if (
    title.left < -TOLERANCE
    || title.right > width + TOLERANCE
    || title.top < -TOLERANCE
    || title.bottom > height + TOLERANCE
  ) {
    issues.push(`hero title is not fully inside the first viewport: ${JSON.stringify(title)}`);
  }

  const action = report.hero.action;
  if (!action) {
    issues.push("hero primary action is missing");
  } else if (
    action.left < -TOLERANCE
    || action.right > width + TOLERANCE
    || action.top < -TOLERANCE
    || action.bottom > height + TOLERANCE
  ) {
    issues.push(`hero primary action is not fully inside the first viewport: ${JSON.stringify(action)}`);
  }

  const art = report.hero.art;
  const artIntersection = report.hero.artIntersection;
  const minimumArtWidth = Math.min(96, width * 0.2);
  const minimumArtHeight = Math.min(64, height * 0.1);
  const minimumArtArea = width * height * 0.02;
  if (!art || !report.hero.artComplete) {
    issues.push("hero art is missing or did not load");
  } else if (
    artIntersection.width < minimumArtWidth
    || artIntersection.height < minimumArtHeight
    || artIntersection.area < minimumArtArea
  ) {
    issues.push(`hero art has no meaningful first-viewport presence: ${JSON.stringify({ art, artIntersection })}`);
  }

  const arrow = report.decisionArrow;
  if (!arrow) {
    issues.push("decision result arrow is missing");
  } else if (arrow.left < -TOLERANCE || arrow.right > width + TOLERANCE || arrow.width <= 0) {
    issues.push(`decision result arrow leaves the viewport: ${JSON.stringify(arrow)}`);
  }

  if (report.touchTargetViolations.length) {
    issues.push(`key touch target below 44px: ${JSON.stringify(report.touchTargetViolations)}`);
  }
  if (consoleErrors.length) {
    issues.push(`browser errors: ${JSON.stringify(consoleErrors)}`);
  }

  return issues;
}

function textScaleIssues(report, consoleErrors) {
  const issues = [];

  if (report.documentOverflow.overflow > TOLERANCE) {
    issues.push(`document overflows horizontally by ${report.documentOverflow.overflow}px`);
  }
  if (report.localScrollOverflow.length) {
    issues.push(`local semantic overflow: ${JSON.stringify(report.localScrollOverflow.slice(0, 8))}`);
  }
  if (report.textOutsideViewport.length) {
    issues.push(`semantic text outside viewport: ${JSON.stringify(report.textOutsideViewport.slice(0, 8))}`);
  }
  if (report.clippedText.length) {
    issues.push(`text clipped by ancestor: ${JSON.stringify(report.clippedText.slice(0, 8))}`);
  }
  if (consoleErrors.length) {
    issues.push(`browser errors: ${JSON.stringify(consoleErrors)}`);
  }

  return issues;
}

function safeFilename(value) {
  return value.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

async function saveFailureScreenshot(page, parts) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const filename = `${parts.map(safeFilename).join("--")}.png`;
  const destination = path.join(OUTPUT_DIR, filename);
  await page.screenshot({ path: destination, fullPage: true });
  return path.relative(ROOT, destination);
}

async function openSettledPage(context, baseUrl, testCase) {
  const page = await context.newPage();
  const consoleErrors = pageDiagnostics(page);
  await page.setViewportSize({ width: testCase.width, height: testCase.height });
  await page.goto(baseUrl, { waitUntil: "load" });
  await settlePage(page);
  return { page, consoleErrors };
}

async function runViewportCase(context, baseUrl, browserName, motionMode, testCase, failures) {
  const { page, consoleErrors } = await openSettledPage(context, baseUrl, testCase);

  try {
    const report = await inspectResponsiveLayout(page);
    const issues = baselineIssues(report, consoleErrors);
    if (!issues.length) return;

    const screenshot = await saveFailureScreenshot(page, [browserName, motionMode, testCase.name]);
    failures.push({
      label: `${browserName} / ${motionMode} / ${testCase.name}`,
      issues,
      screenshot,
    });
  } catch (error) {
    const screenshot = await saveFailureScreenshot(page, [browserName, motionMode, testCase.name, "runner"]).catch(() => null);
    failures.push({
      label: `${browserName} / ${motionMode} / ${testCase.name}`,
      issues: [`QA runner error: ${error.stack ?? error.message}`],
      screenshot,
    });
  } finally {
    await page.close();
  }
}

async function runTextScaleCase(context, baseUrl, browserName, testCase, scale, failures) {
  const { page, consoleErrors } = await openSettledPage(context, baseUrl, testCase);

  try {
    await page.evaluate((percentage) => {
      document.documentElement.style.fontSize = `${percentage}%`;
    }, scale);
    await settlePage(page);

    const report = await inspectResponsiveLayout(page);
    const issues = textScaleIssues(report, consoleErrors);
    if (!issues.length) return;

    const screenshot = await saveFailureScreenshot(page, [browserName, `${scale}pct`, testCase.name]);
    failures.push({
      label: `${browserName} / text ${scale}% / ${testCase.name}`,
      issues,
      screenshot,
    });
  } catch (error) {
    const screenshot = await saveFailureScreenshot(page, [browserName, `${scale}pct`, testCase.name, "runner"]).catch(() => null);
    failures.push({
      label: `${browserName} / text ${scale}% / ${testCase.name}`,
      issues: [`QA runner error: ${error.stack ?? error.message}`],
      screenshot,
    });
  } finally {
    await page.close();
  }
}

async function runMobileMenuCase(context, baseUrl, browserName, failures) {
  const testCase = { name: "mobile-menu-390x844", width: 390, height: 844 };
  const { page, consoleErrors } = await openSettledPage(context, baseUrl, testCase);

  try {
    const button = page.locator(".menu-toggle");
    await button.focus();
    await page.keyboard.press("Enter");
    await page.locator("#mobile-nav:not([hidden])").waitFor({ state: "visible" });

    const openState = await page.evaluate(() => {
      const menuButton = document.querySelector(".menu-toggle");
      const mobileNav = document.querySelector("#mobile-nav");
      const activeElement = document.activeElement;
      const smallLinks = [];

      for (const link of document.querySelectorAll("#mobile-nav a")) {
        const rect = link.getBoundingClientRect();
        if (rect.width + 0.5 < 44 || rect.height + 0.5 < 44) {
          smallLinks.push({
            text: link.textContent.trim(),
            width: Math.round(rect.width * 10) / 10,
            height: Math.round(rect.height * 10) / 10,
          });
        }
      }

      return {
        expanded: menuButton?.getAttribute("aria-expanded"),
        navHidden: mobileNav?.hidden,
        focusInsideNav: Boolean(activeElement && mobileNav?.contains(activeElement)),
        smallLinks,
      };
    });

    const issues = [];
    if (openState.expanded !== "true" || openState.navHidden !== false) {
      issues.push(`Enter did not open the mobile menu: ${JSON.stringify(openState)}`);
    }
    if (!openState.focusInsideNav) {
      issues.push("opening the mobile menu did not move focus into it");
    }
    if (openState.smallLinks.length) {
      issues.push(`mobile navigation touch target below 44px: ${JSON.stringify(openState.smallLinks)}`);
    }

    await page.keyboard.press("Escape");
    const closedState = await page.evaluate(() => {
      const menuButton = document.querySelector(".menu-toggle");
      const mobileNav = document.querySelector("#mobile-nav");
      return {
        expanded: menuButton?.getAttribute("aria-expanded"),
        navHidden: mobileNav?.hidden,
        focusReturned: document.activeElement === menuButton,
      };
    });

    if (closedState.expanded !== "false" || closedState.navHidden !== true) {
      issues.push(`Escape did not close the mobile menu: ${JSON.stringify(closedState)}`);
    }
    if (!closedState.focusReturned) {
      issues.push("Escape did not return focus to the menu button");
    }
    if (consoleErrors.length) {
      issues.push(`browser errors: ${JSON.stringify(consoleErrors)}`);
    }

    if (!issues.length) return;
    const screenshot = await saveFailureScreenshot(page, [browserName, testCase.name]);
    failures.push({
      label: `${browserName} / ${testCase.name}`,
      issues,
      screenshot,
    });
  } catch (error) {
    const screenshot = await saveFailureScreenshot(page, [browserName, testCase.name, "runner"]).catch(() => null);
    failures.push({
      label: `${browserName} / ${testCase.name}`,
      issues: [`QA runner error: ${error.stack ?? error.message}`],
      screenshot,
    });
  } finally {
    await page.close();
  }
}

async function main() {
  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  const failures = [];
  const { server, url } = await startStaticServer();

  try {
    for (const [browserName, browserType] of browserTypes) {
      const browser = await browserType.launch({ headless: true });

      try {
        for (const motionMode of motionModes) {
          process.stdout.write(`Checking ${browserName} with motion=${motionMode} across ${viewportCases.length} viewports...\n`);
          const context = await browser.newContext({ reducedMotion: motionMode });

          try {
            for (const testCase of viewportCases) {
              await runViewportCase(context, url, browserName, motionMode, testCase, failures);
            }

            if (motionMode === "no-preference") {
              await runMobileMenuCase(context, url, browserName, failures);

              for (const scale of [150, 200]) {
                process.stdout.write(`Checking ${browserName} at ${scale}% text scaling...\n`);
                for (const testCase of textScaleCases) {
                  await runTextScaleCase(context, url, browserName, testCase, scale, failures);
                }
              }
            }
          } finally {
            await context.close();
          }
        }
      } finally {
        await browser.close();
      }
    }
  } finally {
    await stopStaticServer(server);
  }

  if (failures.length) {
    process.stderr.write(`\nResponsive QA found ${failures.length} failing scenario(s):\n`);
    for (const failure of failures) {
      process.stderr.write(`\n- ${failure.label}\n`);
      for (const issue of failure.issues) process.stderr.write(`  - ${issue}\n`);
      if (failure.screenshot) process.stderr.write(`  - screenshot: ${failure.screenshot}\n`);
    }
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`Responsive QA passed: ${viewportCases.length} viewports, 2 motion modes, 2 browser engines, 150%/200% text scaling, and keyboard menu checks.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error.message}\n`);
  process.exitCode = 1;
});
