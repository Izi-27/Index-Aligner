/* ============================================================
   POST /api/execute   body: { index, tolerance, address }
   ------------------------------------------------------------
   Recomputes the authoritative orders (never trusts client-sent
   orders for a money-moving call) and routes them through SoDEX.
   Demo-guarded: simulates unless live creds + EXECUTION_ENABLED.
   Returns { result, summary, mock }
   ============================================================ */
import { computeRebalance } from './_lib/rebalance.mjs'
import { execute, usingMockExecution } from './_lib/sodex.mjs'

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
    if (!address) return json({ error: 'address required' }, 400)

    const data = await computeRebalance({ id, tolerance, address })
    if (!data) return json({ error: `Unknown index '${id}'` }, 404)
    if (!data.orders.length) return json({ error: 'Nothing to rebalance' }, 409)

    const result = await execute({ address, orders: data.orders, summary: data.summary })
    return json({ result, summary: data.summary, mock: usingMockExecution() })
  } catch (err) {
    console.error('execute function error:', err)
    // Real execution failures surface as 502 so the UI shows the failed state.
    return json({ error: err.message || 'Execution failed' }, 502)
  }
}

export const config = {
  path: '/api/execute'
}
