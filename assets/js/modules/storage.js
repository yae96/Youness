/**
 * localStorage access that cannot throw.
 * Private windows, blocked site data and embedded previews all make the
 * storage accessor itself throw — an unguarded read kills every module
 * that loads after it.
 */
export function readKey(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeKey(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
