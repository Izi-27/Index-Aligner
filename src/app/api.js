/* ============================================================
   Index Aligner — frontend API client
   ------------------------------------------------------------
   Talks to the Netlify Functions backend (/api/*). Every call
   FAILS SOFT: if the functions aren't running (e.g. plain `vite`
   dev, or an outage) the caller catches and falls back to the
   bundled mock in data.js, so the app never breaks.
   ============================================================ */

async function getJSON(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  // Vite's SPA fallback can answer unknown paths with index.html; guard against
  // treating that HTML as data.
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) throw new Error(`${url} → non-JSON response`)
  return res.json()
}

async function sendJSON(url, body, method = 'POST') {
  const res = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body)
  })
  // Attach the HTTP status so callers can distinguish a real server error
  // (status present) from the functions being unreachable (network/non-JSON).
  if (!res.ok) {
    let detail = ''
    try { detail = (await res.json()).error || '' } catch { /* ignore */ }
    throw Object.assign(new Error(detail || `${url} → ${res.status}`), { status: res.status })
  }
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('application/json')) throw new Error(`${url} → non-JSON response`)
  return res.json()
}

// Full index composition + live prices.
export async function fetchIndexes() {
  const { indexes } = await getJSON('/api/indexes')
  return indexes
}

// Live marks: { SYM: { price, change } }. Omit symbols for all tracked assets.
export async function fetchPrices(symbols = []) {
  const q = symbols.length ? `?symbols=${encodeURIComponent(symbols.join(','))}` : ''
  const { prices } = await getJSON(`/api/prices${q}`)
  return prices
}

// Merge a price map into a list of indexes, updating ONLY price/change —
// never weights — so the user's current/rebalanced state is preserved.
export function mergePrices(indexes, prices) {
  return indexes.map(ix => ({
    ...ix,
    assets: ix.assets.map(a => {
      const p = prices[a.sym]
      return p ? { ...a, price: p.price, change: p.change } : a
    })
  }))
}

// Per-wallet profile (server-persisted settings + rebalance history).
export async function fetchProfile(address) {
  const { settings, history } = await getJSON(`/api/profile?address=${encodeURIComponent(address)}`)
  return { settings, history }
}

export async function saveSettings(address, settings) {
  const { settings: saved } = await sendJSON('/api/settings', { address, settings }, 'PUT')
  return saved
}

export async function appendHistory(address, entry) {
  const { history } = await sendJSON('/api/history', { address, entry }, 'POST')
  return history
}

// Authoritative rebalance: { index, tolerance, rows, orders, summary, mock }.
export async function fetchRebalance({ index, tolerance, address }) {
  const params = new URLSearchParams({ index, tolerance: String(tolerance) })
  if (address) params.set('address', address)
  return getJSON(`/api/rebalance?${params.toString()}`)
}

// SoDEX quote for a rebalance: { orders, summary, quote, mock }.
export async function fetchQuote({ index, tolerance, address }) {
  return sendJSON('/api/quote', { index, tolerance, address }, 'POST')
}

// Execute the rebalance via SoDEX (demo-guarded server-side): { result, summary, mock }.
export async function executeRebalance({ index, tolerance, address }) {
  return sendJSON('/api/execute', { index, tolerance, address }, 'POST')
}

// A connected wallet's real position: value + current constituent weights.
export async function fetchHoldings(address) {
  const { holdings } = await getJSON(`/api/holdings?address=${encodeURIComponent(address)}`)
  return holdings
}

// Overlay wallet holdings onto indexes: sets each index's value and the
// CURRENT weight of each asset. Targets, prices and metadata are untouched.
export function applyHoldings(indexes, holdings) {
  const byId = Object.fromEntries(holdings.map(h => [h.indexId, h]))
  return indexes.map(ix => {
    const h = byId[ix.id]
    if (!h) return ix
    return {
      ...ix,
      value: h.value ?? ix.value,
      assets: ix.assets.map(a => (h.weights[a.sym] != null ? { ...a, current: h.weights[a.sym] } : a))
    }
  })
}
