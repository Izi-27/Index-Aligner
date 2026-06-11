/* ============================================================
   Index Aligner backend — SoSoValue price client
   ------------------------------------------------------------
   Fetches live market data (price + 24h change) for asset symbols.
   If SOSOVALUE_API_KEY is set it calls the real API; otherwise it
   returns mock marks so the whole app works without credentials.

   Confirmed against the docs (Currency & Pairs module):
     • GET /currencies                          → resolve symbol → currency_id
     • GET /currencies/{currency_id}/market-snapshot
         → { price, change_pct_24h, ... }
     Auth header: x-soso-api-key. Base: openapi.sosovalue.com/openapi/v1
     Docs: https://sosovalue-1.gitbook.io/sosovalue-api-doc

   NOTE: `change_pct_24h` is documented as a "percentage" (e.g. -0.12).
   We pass it through as the percent the UI displays. If a live key
   reveals it's actually a fraction, multiply by 100 in `num()` usage.
   ============================================================ */

const BASE = process.env.SOSOVALUE_API_BASE || 'https://openapi.sosovalue.com/openapi/v1';
const API_KEY = process.env.SOSOVALUE_API_KEY || '';

// June-2026 demo marks. Single global price per symbol. change = 24h % move.
const MOCK_PRICES = {
  BTC:  { price: 108240, change: 18.2 },
  ETH:  { price: 4218,   change: -9.4 },
  SOL:  { price: 184.6,  change: -2.1 },
  LINK: { price: 21.8,   change: -5.0 },
  AVAX: { price: 41.5,   change: -3.2 },
  UNI:  { price: 13.9,   change: -4.1 },
  AAVE: { price: 142.3,  change: -6.0 },
  MKR:  { price: 1948,   change: -3.5 },
  LDO:  { price: 2.42,   change: -7.2 },
  ARB:  { price: 1.08,   change: -8.8 },
  CRV:  { price: 0.71,   change: -0.9 },
  SNX:  { price: 2.31,   change: 0.2 }
};

export const usingMockData = () => !API_KEY;

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

function mockPrices(symbols) {
  const out = {};
  for (const s of symbols) if (MOCK_PRICES[s]) out[s] = { ...MOCK_PRICES[s] };
  return out;
}

async function api(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'x-soso-api-key': API_KEY, accept: 'application/json' }
  });
  if (!res.ok) throw new Error(`SoSoValue ${path} → ${res.status}`);
  return res.json();
}

// Confirmed examples are raw JSON, but list endpoints may wrap in {data}/{data:{list}}.
function unwrap(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.list)) return json.data.list;
  if (json && typeof json.data === 'object' && json.data) return json.data;
  return json;
}

// symbol (UPPER) -> { id, price?, change? }. Cached per cold start.
let _currencyMap = null;
async function currencyMap() {
  if (_currencyMap) return _currencyMap;
  const list = unwrap(await api('/currencies'));
  const map = {};
  for (const c of (Array.isArray(list) ? list : [])) {
    const sym = String(c.symbol || c.ticker || '').toUpperCase();
    if (!sym) continue;
    map[sym] = {
      id: c.currency_id || c.id || c.currencyId,
      // some list shapes include price inline; use it if present
      price: c.price != null ? num(c.price) : null,
      change: c.change_pct_24h != null ? num(c.change_pct_24h) : null
    };
  }
  _currencyMap = map;
  return map;
}

/**
 * Get { SYM: { price, change } } for the given symbols.
 * Falls back to mock data when no API key is configured or on any error.
 */
export async function getPrices(symbols) {
  const wanted = (symbols && symbols.length) ? symbols : Object.keys(MOCK_PRICES);
  if (!API_KEY) return mockPrices(wanted);

  try {
    const map = await currencyMap();
    const out = {};

    await Promise.all(wanted.map(async (s) => {
      const entry = map[s];
      // If the currency list already carried a price, use it directly.
      if (entry && entry.price != null) {
        out[s] = { price: entry.price, change: entry.change ?? 0 };
        return;
      }
      const id = entry?.id;
      if (!id) return; // unknown symbol → backfilled below
      try {
        const snap = unwrap(await api(`/currencies/${id}/market-snapshot`));
        out[s] = { price: num(snap.price), change: num(snap.change_pct_24h) };
      } catch {
        /* leave for backfill */
      }
    }));

    // Backfill anything missing so the UI stays whole.
    for (const s of wanted) if (!out[s] && MOCK_PRICES[s]) out[s] = { ...MOCK_PRICES[s] };
    return out;
  } catch (err) {
    console.error('SoSoValue price fetch failed, using mock:', err.message);
    return mockPrices(wanted);
  }
}
