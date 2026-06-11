/* ============================================================
   Index Aligner backend — per-wallet profile store
   ------------------------------------------------------------
   Persists each wallet's settings and rebalance history using
   Netlify Blobs (auto-configured in the Netlify runtime and
   `netlify dev`). Falls back to a process-memory map when Blobs
   isn't available (plain `node`, tests), so nothing crashes.

   Keys: `settings:<address>`, `history:<address>` in store
   "profiles".
   ============================================================ */
import { getStore } from '@netlify/blobs'

export const DEFAULT_SETTINGS = { tolerance: 5, alerts: false, email: '', autoExec: false };

// Seed history shown to a wallet that has never rebalanced (demo continuity).
export const SEED_HISTORY = [
  { id: 'h1', index: 'SSI Top 10 Index', date: 'May 2, 2026 · 09:14', trades: 6, volume: 84.20, drift: 9.1, status: 'completed' },
  { id: 'h2', index: 'SSI DeFi Blue Chip', date: 'Apr 18, 2026 · 16:40', trades: 4, volume: 31.50, drift: 6.4, status: 'completed' },
  { id: 'h3', index: 'SSI Top 10 Index', date: 'Mar 30, 2026 · 11:02', trades: 7, volume: 122.75, drift: 12.8, status: 'completed' }
];

const mem = new Map();      // process-memory fallback
let blobsOk = true;

async function blobGet(key) {
  if (blobsOk) {
    try { return await getStore('profiles').get(key, { type: 'json' }); }
    catch (e) { blobsOk = false; console.error('Blobs unavailable, using memory:', e.message); }
  }
  return mem.has(key) ? mem.get(key) : null;
}

async function blobSet(key, value) {
  mem.set(key, value);      // keep memory in sync as a cache
  if (blobsOk) {
    try { await getStore('profiles').setJSON(key, value); }
    catch (e) { blobsOk = false; console.error('Blobs set failed, using memory:', e.message); }
  }
}

export const usingMemoryStore = () => !blobsOk;

export async function getProfile(address) {
  const settings = (await blobGet(`settings:${address}`)) || { ...DEFAULT_SETTINGS };
  const history = (await blobGet(`history:${address}`)) || SEED_HISTORY;
  return { settings, history };
}

export async function saveSettings(address, settings) {
  const merged = { ...DEFAULT_SETTINGS, ...settings };
  await blobSet(`settings:${address}`, merged);
  return merged;
}

export async function appendHistory(address, entry) {
  const history = (await blobGet(`history:${address}`)) || SEED_HISTORY;
  const next = [entry, ...history];
  await blobSet(`history:${address}`, next);
  return next;
}
