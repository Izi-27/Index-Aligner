/* ============================================================
   GET /api/rebalance?index=top10&tolerance=5[&address=0x..]
   ------------------------------------------------------------
   Authoritative rebalance for an index: composes live prices +
   the index design (targets) + the wallet's current weights
   (holdings, if an address is given) and returns the binding
   orders, summary, and rows.

   Returns { index:{id,name,value}, tolerance, rows, orders,
             summary, mock }
   ============================================================ */
import { computeRebalance } from './_lib/rebalance.mjs'
import { usingMockData } from './_lib/sosovalue.mjs'
import { usingMockHoldings } from './_lib/holdings.mjs'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  })

export default async (req) => {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('index')
    const address = url.searchParams.get('address') || undefined
    const tolRaw = Number(url.searchParams.get('tolerance'))
    const tolerance = Number.isFinite(tolRaw) && tolRaw > 0 ? tolRaw : 5

    if (!id) return json({ error: 'index query param required' }, 400)

    const data = await computeRebalance({ id, tolerance, address })
    if (!data) return json({ error: `Unknown index '${id}'` }, 404)

    return json({
      index: { id: data.index.id, name: data.index.name, value: data.index.value },
      tolerance,
      rows: data.rows,
      orders: data.orders,
      summary: data.summary,
      mock: usingMockData() || usingMockHoldings()
    })
  } catch (err) {
    console.error('rebalance function error:', err)
    return json({ error: 'Failed to compute rebalance' }, 500)
  }
}

export const config = {
  path: '/api/rebalance'
}
