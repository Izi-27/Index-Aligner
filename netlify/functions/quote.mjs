/* ============================================================
   POST /api/quote   body: { index, tolerance, address? }
   ------------------------------------------------------------
   Recomputes the authoritative orders, then prices the SoDEX
   route. Read-only — no funds move.
   Returns { orders, summary, quote, mock }
   ============================================================ */
import { computeRebalance } from './_lib/rebalance.mjs'
import { quote } from './_lib/sodex.mjs'
import { usingMockData } from './_lib/sosovalue.mjs'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  })

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const { index: id, tolerance = 5, address } = await req.json()
    if (!id) return json({ error: 'index required' }, 400)

    const data = await computeRebalance({ id, tolerance, address })
    if (!data) return json({ error: `Unknown index '${id}'` }, 404)

    return json({
      orders: data.orders,
      summary: data.summary,
      quote: quote(data.orders, data.summary),
      mock: usingMockData()
    })
  } catch (err) {
    console.error('quote function error:', err)
    return json({ error: 'Failed to build quote' }, 500)
  }
}

export const config = {
  path: '/api/quote'
}
