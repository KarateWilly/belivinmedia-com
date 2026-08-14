function settleFonts() {
  if (!document.fonts?.ready) return Promise.resolve();

  return Promise.race([
    document.fonts.ready,
    new Promise((resolve) => window.setTimeout(resolve, 1500)),
  ]);
}

function nextPaint() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
  });
}

function updateFragment(hash) {
  if (window.location.hash === hash) {
    window.history.replaceState(null, "", hash);
  } else {
    window.history.pushState(null, "", hash);
  }
}

async function stabilizeFragment(target) {
  await settleFonts();
  await nextPaint();

  if (Math.abs(target.getBoundingClientRect().top) > 1) {
    target.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function navigateToFragment(link) {
  const hash = link.hash;
  const target = hash && document.querySelector(hash);
  if (!target) return;

  updateFragment(hash);
  target.scrollIntoView({ behavior: "auto", block: "start" });
  void stabilizeFragment(target);
}

function initializeFragmentNavigation() {
  const fragmentLinks = [...document.querySelectorAll('a[href^="#"]')];

  for (const link of fragmentLinks) {
    link.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();
      navigateToFragment(link);
    });
  }
}

function initializeSupplyProgress() {
  const map = document.querySelector("[data-supply-map]");
  if (!map || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let scheduled = false;

  const render = () => {
    scheduled = false;
    const rect = map.getBoundingClientRect();
    const journey = rect.height + window.innerHeight;
    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / journey));
    map.style.setProperty("--supply-progress", progress.toFixed(3));
  };

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(render);
  };

  render();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function initializeExperience() {
  initializeFragmentNavigation();
  initializeSupplyProgress();
}

document.addEventListener("DOMContentLoaded", initializeExperience, { once: true });

window.addEventListener("popstate", () => {
  const target = window.location.hash && document.querySelector(window.location.hash);
  if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
});
