/**
 * Entry point. Loaded as a module, so it is deferred by default and runs
 * after the document is parsed. Each feature is independent: if one throws,
 * the others still initialise and the page remains fully readable without
 * any of them.
 */
import { initTheme } from './modules/theme.js';
import { initReveal } from './modules/reveal.js';
import { initVitals } from './modules/vitals.js';
import { initContactForm } from './modules/contact.js';

const features = [
  ['theme', initTheme],
  ['reveal', initReveal],
  ['vitals', initVitals],
  ['contact form', initContactForm],
];

for (const [name, init] of features) {
  try {
    init();
  } catch (error) {
    console.error(`[portfolio] ${name} failed to initialise:`, error);
  }
}
