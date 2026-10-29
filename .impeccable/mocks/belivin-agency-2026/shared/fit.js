// Fits [data-fit] lines to their measure, the way a poster sets its billing.
// data-fit="size": scale the font size until the line fills the width.
// data-fit="stretch": keep the font size, set the width axis (50–150 %) so the line fills
// the width; only fall back to resizing when the axis runs out.
// data-fit-above="720" / data-fit-below="900": fit only inside this viewport range;
// outside it the CSS sizes rule.
(() => {
  const targets = [...document.querySelectorAll('[data-fit]')];
  if (targets.length === 0) return;
  const range = document.createRange();

  const textWidth = el => {
    range.selectNodeContents(el);
    return range.getBoundingClientRect().width;
  };

  const room = el => {
    const style = getComputedStyle(el);
    return el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  };

  const fitSize = el => {
    const max = parseFloat(el.dataset.fitMax) || Infinity;
    el.style.fontSize = '100px';
    el.style.fontSize = `${Math.min(max, (100 * room(el)) / textWidth(el))}px`;
  };

  const fitStretch = el => {
    const width = room(el);
    let low = 50;
    let high = 150;
    for (let step = 0; step < 14; step += 1) {
      const middle = (low + high) / 2;
      el.style.fontStretch = `${middle}%`;
      if (textWidth(el) > width) high = middle;
      else low = middle;
    }
    el.style.fontStretch = `${low}%`;
    const filled = textWidth(el);
    if (filled > width || (low > 149.5 && filled < width * 0.995)) {
      el.style.fontSize = `${(parseFloat(getComputedStyle(el).fontSize) * width) / filled}px`;
    }
  };

  const fitAll = () => {
    for (const el of targets) {
      el.style.fontSize = '';
      el.style.fontStretch = '';
      const active = innerWidth >= (parseFloat(el.dataset.fitAbove) || 0)
        && innerWidth < (parseFloat(el.dataset.fitBelow) || Infinity);
      el.classList.toggle('is-fit', active);
      if (!active) continue;
      if (el.dataset.fit === 'stretch') fitStretch(el);
      else fitSize(el);
    }
    document.documentElement.classList.add('is-fitted');
  };

  let frame = 0;
  let lastWidth = innerWidth;
  document.fonts.ready.then(fitAll);
  addEventListener('resize', () => {
    if (innerWidth === lastWidth) return;
    lastWidth = innerWidth;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fitAll);
  });
})();
