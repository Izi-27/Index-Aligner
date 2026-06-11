/* ============================================================
   Index Aligner backend — SoSoValue Index (SSI) client
   ------------------------------------------------------------
   Reads an SSI index's CURRENT constituent weights and its index
   price/value from the SoSoValue API. This is the live source for
   an index's drifted composition.

   Confirmed against the docs (SoSoValue Index module):
     • GET /indices/{ticker}/constituents
         → [ { currency_id, symbol, weight } ]   (weight is 0..1)
     • GET /indices/{ticker}/market-snapshot
         → { price, "24h_change_pct", ... }
     Auth header: x-soso-api-key.
     Docs: https://sosovalue-1.gitbook.io/sosovalue-api-doc

   Gated by SOSOVALUE_API_KEY; callers fall back to demo data when
   `ssiAvailable()` is false or a ticker isn't mapped.
   ============================================================ */

const BASE = process.env.SOSOVALUE_API_BASE || 'https://openapi.sosovalue.com/openapi/v1';
const API_KEY = process.env.SOSOVALUE_API_KEY || '';

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

export const ssiAvailable = () => !!API_KEY;

async function api(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-soso-api-key': API_KEY, accept: 'application/json' }
  });
  if (!res.ok) throw new Error(`SoSoValue ${path} → ${res.status}`);
  return res.json();
}

function unwrap(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (json && typeof json.data === 'object' && json.data) return json.data;
  return json;
}

// Current constituent weights as { SYM: weightPercent }. Docs return 0..1, so ×100.
export async function getConstituentWeights(ticker) {
  const list = unwrap(await api(`/indices/${ticker}/constituents`));
  const out = {};
  for (const c of (Array.isArray(list) ? list : [])) {
    const sym = String(c.symbol || '').toUpperCase();
    if (!sym) continue;
    out[sym] = +(num(c.weight) * 100).toFixed(2);
  }
  return out;
}

// Index unit price (NAV) + 24h change.
export async function getIndexSnapshot(ticker) {
  const d = unwrap(await api(`/indices/${ticker}/market-snapshot`));
  return { price: num(d.price), change: num(d['24h_change_pct']) };
}
