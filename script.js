const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');

function closeMenu({ returnFocus = false } = {}) {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menü';
  mobileNav.hidden = true;
  if (returnFocus) menuButton.focus();
}

function openMenu() {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.textContent = 'Schließen';
  mobileNav.hidden = false;
  mobileNav.querySelector('a')?.focus();
}

closeMenu();

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  if (isOpen) closeMenu();
  else openMenu();
});

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => closeMenu());
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') {
    closeMenu({ returnFocus: true });
  }
});

document.addEventListener('click', (event) => {
  if (!mobileNav || !menuButton || mobileNav.hidden) return;
  if (mobileNav.contains(event.target) || menuButton.contains(event.target)) return;
  closeMenu();
});

const desktopMedia = window.matchMedia('(min-width: 901px)');
desktopMedia.addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = [...document.querySelectorAll('.reveal')];

if (reducedMotion.matches || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => {
    element.dataset.visible = 'true';
  });
} else {
  document.documentElement.classList.add('motion-ready');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.dataset.visible = 'true';
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.12,
  });

  revealElements.forEach((element) => observer.observe(element));
}
