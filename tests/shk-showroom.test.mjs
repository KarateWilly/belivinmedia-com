import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const ROOT = process.cwd();
const SHOWROOM_PATH = path.join(ROOT, "beispiele/shk/index.html");
const DESIGN_PATH = path.join(ROOT, "beispiele/shk/design-1/index.html");
const CALENDLY = "https://calendly.com/mario-belivinmedia/kostenfreier-15-minuten-website-check";
const ROBOTS = "noindex,nofollow,noarchive,nosnippet,max-image-preview:large";

const [showroom, design, sitemap, vercel] = await Promise.all([
  readFile(SHOWROOM_PATH, "utf8"),
  readFile(DESIGN_PATH, "utf8"),
  readFile(path.join(ROOT, "sitemap.xml"), "utf8"),
  readFile(path.join(ROOT, "vercel.json"), "utf8").then(JSON.parse),
]);

test("SHK showroom surfaces remain link-only and noindex", () => {
  assert.match(showroom, new RegExp(`<meta name="robots" content="${ROBOTS}"`));
  assert.match(design, new RegExp(`<meta name="robots" content="${ROBOTS}"`));
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
  assert.match(showroom, /href="\.\/design-1\/"/);
  assert.doesNotMatch(design, /href="(?:tel:|mailto:)/);
});

test("SHK demonstration identity remains fictional and safe", () => {
  assert.match(design, /IHR SHK-BETRIEB/);
  assert.match(design, /IHRE REGION/);
  assert.match(design, /IHRE TELEFONNUMMER/);
  assert.doesNotMatch(design, /Klartechnik|Klara Meister|GmbH/);
});

test("every SHK image referenced by the HTML exists", async () => {
  const references = new Set(
    [...`${showroom}\n${design}`.matchAll(/(?:src|srcset|href)="([^"\s,]+\.(?:avif|webp))/g)]
      .map((match) => match[1]),
  );
  assert.ok(references.size >= 8, "responsive image references should be discoverable");

  await Promise.all([...references].map(async (reference) => {
    const filePath = path.join(ROOT, reference.replace(/^\//, ""));
    await access(filePath);
  }));
});
