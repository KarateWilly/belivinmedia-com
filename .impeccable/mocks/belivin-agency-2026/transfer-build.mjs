#!/usr/bin/env node

// Transfers the approved Kundenweg master into the production root. Only paths,
// cache keys, canonical, robots and favicon change; markup, styles and script
// stay byte-identical to the master.

import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const master = join(here, 'comp-kundenweg');
const fonts = ['funnel-display-latin-wght-normal.woff2', 'funnel-sans-latin-wght-normal.woff2', 'OFL-funnel-display.txt', 'OFL-funnel-sans.txt'];
const cacheKey = path => createHash('sha256').update(readFileSync(join(repo, path))).digest('hex').slice(0, 12);

mkdirSync(join(repo, 'public/site/fonts'), { recursive: true });
for (const file of fonts) copyFileSync(join(here, 'fonts', file), join(repo, 'public/site/fonts', file));

writeFileSync(join(repo, 'styles.css'), readFileSync(join(master, 'styles.css'), 'utf8').replaceAll('url("../fonts/', 'url("/public/site/fonts/'));
copyFileSync(join(master, 'kundenweg.js'), join(repo, 'site.js'));

let html = readFileSync(join(master, 'index.html'), 'utf8');
const replacements = [
  ['  <link rel="icon" href="data:,">\n', '  <meta name="robots" content="index,follow">\n  <link rel="canonical" href="https://belivinmedia.com/">\n  <link rel="icon" href="/favicon.svg" type="image/svg+xml">\n'],
  ['href="../fonts/funnel-display-latin-wght-normal.woff2"', 'href="/public/site/fonts/funnel-display-latin-wght-normal.woff2"'],
  ['href="../fonts/funnel-sans-latin-wght-normal.woff2"', 'href="/public/site/fonts/funnel-sans-latin-wght-normal.woff2"'],
  ['<link rel="stylesheet" href="styles.css">', `<link rel="stylesheet" href="styles.css?v=${cacheKey('styles.css')}">`],
  ['<script src="kundenweg.js" defer></script>', `<script src="site.js?v=${cacheKey('site.js')}" defer></script>`],
];
for (const [from, to] of replacements) {
  if (!html.includes(from)) throw new Error(`master no longer contains: ${from.trim()}`);
  html = html.replace(from, to);
}
writeFileSync(join(repo, 'index.html'), html);
process.stdout.write('Transferred master → index.html, styles.css, site.js, public/site/fonts\n');
