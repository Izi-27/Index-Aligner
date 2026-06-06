/* Shared theme helper — persists across pages via localStorage ('ia-theme'). */
const KEY = 'ia-theme';

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function apply(t) {
  document.documentElement.setAttribute('data-theme', t);
}

// initial (also inlined in <head> to avoid flash, but safe to re-run)
let saved = localStorage.getItem(KEY);
if (!saved) {
  saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
apply(saved);

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  apply(next);
  localStorage.setItem(KEY, next);
  window.dispatchEvent(new CustomEvent('ia-theme-change', { detail: next }));
  return next;
}
