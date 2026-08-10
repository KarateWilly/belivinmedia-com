// @ts-check

/** @typedef {'nav' | 'hero' | 'closing'} CalendlyPlacement */
/** @typedef {'customer_proof'} CaseStudyPlacement */
/** @typedef {'footer'} EmailPlacement */
/** @typedef {'calendly_click' | 'case_study_click' | 'email_click'} AnalyticsEventName */
/**
 * @typedef {
 *   | { name: 'calendly_click', data: { placement: CalendlyPlacement } }
 *   | { name: 'case_study_click', data: { project: 'bestlife', placement: CaseStudyPlacement } }
 *   | { name: 'email_click', data: { placement: EmailPlacement } }
 * } AnalyticsPayload
 */
/** @typedef {(action: 'event', payload: AnalyticsPayload) => void} VercelAnalytics */

/** @type {readonly CalendlyPlacement[]} */
const CALENDLY_PLACEMENTS = Object.freeze(['nav', 'hero', 'closing']);
/** @type {readonly CaseStudyPlacement[]} */
const CASE_STUDY_PLACEMENTS = Object.freeze(['customer_proof']);
/** @type {readonly EmailPlacement[]} */
const EMAIL_PLACEMENTS = Object.freeze(['footer']);

/**
 * @template {string} T
 * @param {unknown} value
 * @param {readonly T[]} allowlist
 * @returns {value is T}
 */
function isAllowedValue(value, allowlist) {
  return typeof value === 'string' && allowlist.includes(/** @type {T} */ (value));
}

/**
 * Convert untrusted DOM metadata into one of the three permitted payloads.
 * Unknown fields are intentionally discarded so link text, URLs and personal
 * information can never leak into a custom event.
 *
 * @param {unknown} eventName
 * @param {Record<string, unknown>} rawData
 * @returns {AnalyticsPayload | null}
 */
export function sanitizeAnalyticsEvent(eventName, rawData) {
  if (eventName === 'calendly_click' && isAllowedValue(rawData.placement, CALENDLY_PLACEMENTS)) {
    return Object.freeze({
      name: 'calendly_click',
      data: Object.freeze({ placement: rawData.placement }),
    });
  }

  if (
    eventName === 'case_study_click'
    && rawData.project === 'bestlife'
    && isAllowedValue(rawData.placement, CASE_STUDY_PLACEMENTS)
  ) {
    return Object.freeze({
      name: 'case_study_click',
      data: Object.freeze({ project: 'bestlife', placement: rawData.placement }),
    });
  }

  if (eventName === 'email_click' && isAllowedValue(rawData.placement, EMAIL_PLACEMENTS)) {
    return Object.freeze({
      name: 'email_click',
      data: Object.freeze({ placement: rawData.placement }),
    });
  }

  return null;
}

/** @type {VercelAnalytics} */
function sendWithVercel(action, payload) {
  const analyticsWindow = /** @type {Window & typeof globalThis & { va?: VercelAnalytics }} */ (window);
  analyticsWindow.va?.(action, payload);
}

/**
 * @param {unknown} eventName
 * @param {Record<string, unknown>} rawData
 * @param {VercelAnalytics} [sender]
 * @returns {boolean}
 */
export function trackAnalyticsEvent(eventName, rawData, sender = sendWithVercel) {
  const payload = sanitizeAnalyticsEvent(eventName, rawData);
  if (!payload) return false;

  sender('event', payload);
  return true;
}

/**
 * @param {Document} root
 */
export function initAnalytics(root) {
  root.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const link = event.target.closest('a[data-analytics-event]');
    if (!(link instanceof HTMLAnchorElement)) return;

    trackAnalyticsEvent(link.dataset.analyticsEvent, {
      placement: link.dataset.analyticsPlacement,
      project: link.dataset.analyticsProject,
    });
  });
}

if (typeof document !== 'undefined') {
  initAnalytics(document);
}
