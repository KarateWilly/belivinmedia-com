import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const deploySources = ['index.html', 'styles.css', 'legal.css', 'impressum.html', 'datenschutz.html'];

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8');
}

function hash(relativePath) {
  return createHash('sha256').update(readFileSync(resolve(root, relativePath))).digest('hex');
}

test('deployable surfaces never reference Vercel-excluded Impeccable artifacts', () => {
  assert.match(read('.vercelignore'), /^\.impeccable\/$/m);
  for (const relativePath of deploySources) {
    assert.doesNotMatch(
      read(relativePath),
      /\/\.impeccable\//,
      `${relativePath} references a path excluded from the Vercel deployment`,
    );
  }
});

test('every public asset referenced by deployable surfaces exists and is non-empty', () => {
  const references = new Set();
  for (const relativePath of deploySources) {
    const source = read(relativePath);
    for (const match of source.matchAll(/(?:src|href)=["'](\/public\/[^"'#?]+)|url\(["']?(\/public\/[^"')#?]+)/g)) {
      references.add(match[1] || match[2]);
    }
  }

  assert.ok(references.size > 0, 'no public deployment assets were discovered');
  for (const reference of references) {
    const assetPath = resolve(root, reference.slice(1));
    assert.ok(existsSync(assetPath), `missing deployment asset: ${reference}`);
    assert.ok(statSync(assetPath).isFile(), `deployment asset is not a file: ${reference}`);
    assert.ok(statSync(assetPath).size > 0, `deployment asset is empty: ${reference}`);
  }
});

test('main and legal stylesheets use content-derived cache keys', () => {
  const surfaces = [
    { html: 'index.html', css: 'styles.css' },
    { html: 'impressum.html', css: 'legal.css' },
    { html: 'datenschutz.html', css: 'legal.css' },
  ];

  for (const { html, css } of surfaces) {
    const href = read(html).match(/<link rel="stylesheet" href="([^"]+)"/)?.[1];
    assert.ok(href, `${html} has no stylesheet link`);
    const [path, version] = href.split('?v=');
    assert.equal(path.replace(/^\//, ''), css, `${html} links the wrong stylesheet`);
    assert.equal(version, hash(css).slice(0, 12), `${html} has a stale stylesheet cache key`);
  }
});
