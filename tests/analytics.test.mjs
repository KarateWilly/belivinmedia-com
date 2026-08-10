import assert from 'node:assert/strict';
import test from 'node:test';

import {
  sanitizeAnalyticsEvent,
  trackAnalyticsEvent,
} from '../analytics.js';

test('only the approved calendly placement is emitted', () => {
  const payload = sanitizeAnalyticsEvent('calendly_click', {
    placement: 'hero',
    email: 'visitor@example.test',
    href: 'https://example.test/private?token=secret',
  });

  assert.deepEqual(payload, {
    name: 'calendly_click',
    data: { placement: 'hero' },
  });
});

test('case-study events are locked to BestLife and customer proof', () => {
  assert.deepEqual(
    sanitizeAnalyticsEvent('case_study_click', {
      project: 'bestlife',
      placement: 'customer_proof',
      customer: 'Cristina Hubrath',
    }),
    {
      name: 'case_study_click',
      data: { project: 'bestlife', placement: 'customer_proof' },
    },
  );

  assert.equal(
    sanitizeAnalyticsEvent('case_study_click', {
      project: 'another-project',
      placement: 'customer_proof',
    }),
    null,
  );
});

test('unknown names and values never reach Vercel', () => {
  const calls = [];
  const sender = (...args) => calls.push(args);

  assert.equal(trackAnalyticsEvent('email_click', { placement: 'legal' }, sender), false);
  assert.equal(trackAnalyticsEvent('form_submit', { placement: 'footer' }, sender), false);
  assert.deepEqual(calls, []);
});

test('an approved event is sent once with no extra properties', () => {
  const calls = [];
  const sender = (...args) => calls.push(args);

  assert.equal(
    trackAnalyticsEvent(
      'email_click',
      { placement: 'footer', email: 'mario@belivinmedia.com', label: 'E-Mail' },
      sender,
    ),
    true,
  );

  assert.deepEqual(calls, [[
    'event',
    { name: 'email_click', data: { placement: 'footer' } },
  ]]);
});
