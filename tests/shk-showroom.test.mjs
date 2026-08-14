import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const SHOWROOM_PATH = path.join(ROOT, "beispiele/shk/index.html");
const DESIGN_PATH = path.join(ROOT, "beispiele/shk/design-1/index.html");
const DESIGN_TWO_PATH = path.join(ROOT, "beispiele/shk/design-2/index.html");
const NAVIGATION_PATH = path.join(ROOT, "beispiele/shk/design-1/navigation.js");
const EXPERIENCE_TWO_PATH = path.join(ROOT, "beispiele/shk/design-2/experience.js");
const INDUSTRY_REGISTRY_PATH = path.join(ROOT, "beispiele/industry-registry.json");
const CALENDLY = "https://calendly.com/mario-belivinmedia/kostenfreier-15-minuten-website-check";
const ROBOTS = "noindex,nofollow,noarchive,nosnippet,max-image-preview:large";

const [showroom, design, designTwo, navigation, experienceTwo, product, sitemap, vercel, industryRegistry] = await Promise.all([
  readFile(SHOWROOM_PATH, "utf8"),
  readFile(DESIGN_PATH, "utf8"),
  readFile(DESIGN_TWO_PATH, "utf8"),
  readFile(NAVIGATION_PATH, "utf8"),
  readFile(EXPERIENCE_TWO_PATH, "utf8"),
  readFile(path.join(ROOT, "PRODUCT.md"), "utf8"),
  readFile(path.join(ROOT, "sitemap.xml"), "utf8"),
  readFile(path.join(ROOT, "vercel.json"), "utf8").then(JSON.parse),
  readFile(INDUSTRY_REGISTRY_PATH, "utf8").then(JSON.parse),
]);

test("SHK showroom stays fail-closed at two of three production templates", () => {
  assert.match(showroom, /So könnte auch Ihre Website aussehen\./);
  assert.doesNotMatch(showroom, /1 DESIGN VERFÜGBAR|EIN LIVE-BEISPIEL/);
  assert.match(product, /three distinct production-ready template worlds/);
  assert.match(product, /there is no per-template A\/B\/C split/);
  assert.match(showroom, /DESIGN 02 · VERSORGUNG IN SCHICHTEN/);
  assert.match(showroom, /href="\.\/design-2\/"/);
  assert.doesNotMatch(showroom, /DESIGN 03/);
  assert.equal(industryRegistry.policy.requiredProductionTemplatesPerIndustry, 3);
  assert.equal(industryRegistry.policy.placeholderIndustriesForbidden, true);
  assert.equal(industryRegistry.globalIndustryHub.status, "blocked");
  assert.equal(industryRegistry.industries.shk.currentTemplateCount, 2);
  assert.equal(industryRegistry.industries.shk.templates.length, 2);
  assert.equal(industryRegistry.industries.shk.publicHubEligible, false);
  assert.equal(industryRegistry.industries.shk.outreachEligible, false);
  assert.equal(industryRegistry.industries.shk.homepageProof.templateId, "design-1");
});

test("SHK header fragments use deterministic one-click navigation", () => {
  const stylesheetPosition = design.indexOf('<link rel="stylesheet" href="./styles.css"');
  const heroPreloadPosition = design.indexOf("hero-desktop-1920.avif");

  assert.ok(stylesheetPosition > -1 && stylesheetPosition < heroPreloadPosition);
  assert.match(design, /<link rel="stylesheet" href="\.\/styles\.css" \/>\s*<script src="\.\/navigation\.js"><\/script>/);
  assert.match(navigation, /document\.fonts\.ready/);
  assert.match(navigation, /scrollIntoView\(\{ behavior: "auto", block: "start" \}\)/);
  assert.match(navigation, /history\.(?:replaceState|pushState)/);
  assert.match(designTwo, /<link rel="stylesheet" href="\.\/styles\.css" \/>\s*<script src="\.\/experience\.js"><\/script>/);
  assert.match(experienceTwo, /document\.fonts\.ready/);
  assert.match(experienceTwo, /scrollIntoView\(\{ behavior: "auto", block: "start" \}\)/);
  assert.match(experienceTwo, /history\.(?:replaceState|pushState)/);
});

test("SHK showroom surfaces remain link-only and noindex", () => {
  assert.match(showroom, new RegExp(`<meta name="robots" content="${ROBOTS}"`));
  assert.match(design, new RegExp(`<meta name="robots" content="${ROBOTS}"`));
  assert.match(designTwo, new RegExp(`<meta name="robots" content="${ROBOTS}"`));
  assert.doesNotMatch(sitemap, /\/beispiele\//);

  const showroomHeaders = vercel.headers.find((entry) => entry.source === "/beispiele/(.*)");
  assert.ok(showroomHeaders, "Vercel must define headers for all showroom routes");
  assert.deepEqual(showroomHeaders.headers, [
    { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
  ]);
});

test("SHK calls to action use the approved Calendly event", () => {
  assert.ok(showroom.includes(CALENDLY));
  assert.ok(design.includes(CALENDLY));
  assert.ok(designTwo.includes(CALENDLY));
  assert.match(showroom, /href="\.\/design-1\/"/);
  assert.match(showroom, /href="\.\/design-2\/"/);
  assert.doesNotMatch(design, /href="(?:tel:|mailto:)/);
  assert.doesNotMatch(designTwo, /href="(?:tel:|mailto:)/);
  assert.doesNotMatch(showroom, /↗/);
  assert.doesNotMatch(design, /↗/);
  assert.doesNotMatch(designTwo, /↗/);
});

test("SHK demonstration identity remains fictional and safe", () => {
  assert.match(design, /IHR SHK-BETRIEB/);
  assert.match(design, /IHRE REGION/);
  assert.match(design, /IHRE TELEFONNUMMER/);
  assert.doesNotMatch(design, /Klartechnik|Klara Meister|GmbH/);
  assert.match(designTwo, /IHR SHK-BETRIEB/);
  assert.match(designTwo, /IHRE REGION/);
  assert.match(designTwo, /IHRE TELEFONNUMMER/);
  assert.doesNotMatch(designTwo, /Klartechnik|Klara Meister|GmbH/);
});

test("every SHK image referenced by the HTML exists", async () => {
  const html = `${showroom}\n${design}\n${designTwo}`;
  const references = new Set(
    [...html.matchAll(/(?:src|href)="([^"\s]+\.(?:avif|webp))"/g)].map((match) => match[1]),
  );

  for (const match of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) {
    for (const candidate of match[1].split(",")) {
      const [reference] = candidate.trim().split(/\s+/);
      if (/\.(?:avif|webp)$/.test(reference)) references.add(reference);
    }
  }

  assert.ok(references.size >= 24, "responsive image references should be discoverable");

  await Promise.all([...references].map(async (reference) => {
    const filePath = path.join(ROOT, reference.replace(/^\//, ""));
    await access(filePath);
  }));
});
