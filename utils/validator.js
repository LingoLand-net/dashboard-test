// Small validation helpers used across the app
export function isEmail(v) {
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v));
}

export function isPhone(v) {
  if (!v) return false;
  return /[0-9+\-()\s]{6,}/.test(String(v));
}
