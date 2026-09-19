/**
 * Scroll reveal.
 *
 * Elements are visible in CSS by default; this adds `anim-ready` to the root,
 * which is what actually hides them. If this module never runs, or the browser
 * lacks IntersectionObserver, every section still renders — the failure mode
 * is "no animation", never "blank page".
 */
export function initReveal() {
  const targets = document.querySelectorAll('.fade-in');
  if (!targets.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('anim-ready');

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((el) => observer.observe(el));
}
