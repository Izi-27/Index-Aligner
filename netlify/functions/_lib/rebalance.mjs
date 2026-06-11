/* ============================================================
   Index Aligner backend — rebalance math (authoritative)
   ------------------------------------------------------------
   Given an index (composition + live prices + current/target
   weights), compute the per-asset deviation and the exact Sell/Buy
   orders that bring it back to target. This is the binding version
   of the math the client shows live; at execution time the server's
   numbers are the source of truth.

   `computeRebalance` is the shared composition path used by the
   /api/rebalance, /api/quote and /api/execute functions: prices +
   index design (targets) + wallet holdings (current) → orders.

   Mirrors the client helpers in src/app/data.js so display and
   execution agree.
   ============================================================ */
import { getIndexById, ALL_SYMBOLS } from './indexes.mjs'
import { getPrices } from './sosovalue.mjs'
import { getHoldings } from './holdings.mjs'

// Per-asset computed rows.
export function rows(index, tolerance) {
  const tol = (tolerance == null) ? 5 : tolerance;
  return index.assets.map((a) => {
    const curUsd = (a.current / 100) * index.value;
    const tgtUsd = (a.target / 100) * index.value;
    const dev = +(a.current - a.target).toFixed(2);     // weight points
    const deltaUsd = +(tgtUsd - curUsd).toFixed(2);     // + => buy, - => sell
    let status = 'ok';
    if (Math.abs(dev) >= tol) status = dev > 0 ? 'over' : 'under';
    return {
      sym: a.sym, name: a.name, color: a.color, price: a.price, change: a.change,
      target: a.target, current: a.current,
      curUsd, tgtUsd, dev, deltaUsd, status,
      tokens: a.price ? +(Math.abs(deltaUsd) / a.price) : 0
    };
  });
}

// Orders worth acting on (above a small $ floor), biggest trades first.
export function orders(index, tolerance, floor = 1) {
  return rows(index, tolerance)
    .filter((r) => Math.abs(r.deltaUsd) >= floor)
    .map((r) => ({
      sym: r.sym, name: r.name, color: r.color, price: r.price,
      side: r.deltaUsd < 0 ? 'sell' : 'buy',
      usd: +Math.abs(r.deltaUsd).toFixed(2),
      tokens: r.tokens
    }))
    .sort((a, b) => b.usd - a.usd);
}

export function summary(index, tolerance) {
  const rs = rows(index, tolerance);
  const off = rs.filter((r) => r.status !== 'ok');
  const maxDev = rs.reduce((m, r) => Math.max(m, Math.abs(r.dev)), 0);
  const volume = rs.reduce((s, r) => s + Math.max(0, -r.deltaUsd), 0); // sell side = buy side
  const totalDrift = rs.reduce((s, r) => s + Math.abs(r.dev), 0);
  const score = Math.max(0, Math.round(100 - totalDrift * 1.6));
  return {
    offCount: off.length,
    maxDev: +maxDev.toFixed(1),
    volume: +volume.toFixed(2),
    score,
    balanced: off.length === 0,
    total: index.value
  };
}

/**
 * Shared composition: live prices + index design + (optional) wallet holdings
 * → { index, rows, orders, summary }. Returns null for an unknown index.
 */
export async function computeRebalance({ id, tolerance = 5, address }) {
  const prices = await getPrices(ALL_SYMBOLS);
  const index = getIndexById(id, prices);
  if (!index) return null;

  if (address) {
    const [h] = await getHoldings(address, id);
    if (h) {
      index.value = h.value ?? index.value;
      index.assets = index.assets.map((a) =>
        h.weights[a.sym] != null ? { ...a, current: h.weights[a.sym] } : a
      );
    }
  }

  return {
    index,
    rows: rows(index, tolerance),
    orders: orders(index, tolerance),
    summary: summary(index, tolerance)
  };
}
