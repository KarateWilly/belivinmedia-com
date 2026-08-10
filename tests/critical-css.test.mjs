import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const stylesheet = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

function mobileFontSize(source, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(
    `@media\\s*\\(max-width:\\s*360px\\)\\s*\\{[\\s\\S]*?${escapedSelector}\\s*\\{[^}]*font-size\\s*:\\s*([^;}]+)`,
  ));

  assert.ok(match, `missing 360px critical rule for ${selector}`);
  return match[1].trim();
}

test('the delayed stylesheet cannot resize the mobile hero copy', () => {
  const parityBlock = html.match(/<style data-critical-parity>([\s\S]*?)<\/style>/)?.[1];
  assert.ok(parityBlock, 'missing critical parity block');

  for (const selector of ['.hero h1', '.hero-copy > p']) {
    assert.equal(
      mobileFontSize(parityBlock, selector),
      mobileFontSize(stylesheet, selector),
      `${selector} differs between critical and full CSS`,
    );
  }
});
