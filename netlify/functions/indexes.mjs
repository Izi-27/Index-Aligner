/* ============================================================
   GET /api/indexes        → all indexes (composition + live prices)
   GET /api/indexes/:id     → a single index
   ============================================================ */
import { buildIndexes, getIndexById, ALL_SYMBOLS } from './_lib/indexes.mjs'
import { getPrices, usingMockData } from './_lib/sosovalue.mjs'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  })

export default async (req, context) => {
  try {
    const prices = await getPrices(ALL_SYMBOLS)
    const id = context.params?.id

    if (id) {
      const index = getIndexById(id, prices)
      if (!index) return json({ error: `Unknown index '${id}'` }, 404)
      return json({ index, mock: usingMockData() })
    }

    return json({ indexes: buildIndexes(prices), mock: usingMockData() })
  } catch (err) {
    console.error('indexes function error:', err)
    return json({ error: 'Failed to load indexes' }, 500)
  }
}

export const config = {
  path: ['/api/indexes', '/api/indexes/:id']
}
