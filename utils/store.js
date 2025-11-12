// Tiny pub/sub store for small UI state
const state = {};
const subs = new Map();

export function setState(key, value) {
  state[key] = value;
  const handlers = subs.get(key) || [];
  handlers.forEach(h => h(value));
}

export function getState(key) {
  return state[key];
}

export function subscribe(key, handler) {
  const handlers = subs.get(key) || [];
  handlers.push(handler);
  subs.set(key, handlers);
  return () => {
    const list = subs.get(key) || [];
    subs.set(key, list.filter(h => h !== handler));
  };
}
