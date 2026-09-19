import { readKey, writeKey } from './storage.js';

const STORAGE_KEY = 'theme';
const ORDER = ['system', 'dark', 'light'];
const GLYPH = { system: '◑', dark: '☾', light: '☀' };
const LABEL = { system: 'System', dark: 'Dark', light: 'Light' };

/**
 * Three-state theme control: system (no stamp) -> dark -> light.
 * "system" removes the attribute entirely so prefers-color-scheme decides,
 * which is the state most visitors are in.
 */
export function initTheme(root = document.documentElement) {
  const button = document.getElementById('themeToggle');
  if (!button) return;

  const stored = readKey(STORAGE_KEY);
  let current = ORDER.includes(stored) ? stored : 'system';

  const apply = (theme) => {
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);

    button.textContent = GLYPH[theme];
    button.title = `Theme: ${LABEL[theme]}`;
    button.setAttribute('aria-label', `Switch theme (currently ${LABEL[theme].toLowerCase()})`);
    writeKey(STORAGE_KEY, theme);
  };

  apply(current);

  button.addEventListener('click', () => {
    current = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    apply(current);
  });
}
