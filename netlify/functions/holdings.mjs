/* ============================================================
   GET /api/holdings?address=0x..            → wallet position, all indexes
   GET /api/holdings?address=0x..&index=top10 → one index
   Returns { holdings: [ { indexId, name, value, weights } ], mock }
   ============================================================ */
import { getHoldings, usingMockHoldings } from './_lib/holdings.mjs'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  })

export default async (req) => {
  try {
    const url = new URL(req.url)
    const address = url.searchParams.get('address')
    const indexId = url.searchParams.get('index') || undefined

    if (!address) return json({ error: 'address query param required' }, 400)

    const holdings = await getHoldings(address, indexId)
    if (indexId && holdings.length === 0) return json({ error: `Unknown index '${indexId}'` }, 404)

    return json({ holdings, mock: usingMockHoldings() })
  } catch (err) {
    console.error('holdings function error:', err)
    return json({ error: 'Failed to load holdings' }, 500)
  }
}

export const config = {
  path: '/api/holdings'
}
