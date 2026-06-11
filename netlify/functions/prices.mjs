/* ============================================================
   GET /api/prices              → marks for every tracked symbol
   GET /api/prices?symbols=BTC,ETH → marks for the given symbols
   Returns { prices: { SYM: { price, change } }, mock }
   ============================================================ */
import { getPrices, usingMockData } from './_lib/sosovalue.mjs'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  })

export default async (req) => {
  try {
    const param = new URL(req.url).searchParams.get('symbols')
    const symbols = param
      ? param.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
      : []
    const prices = await getPrices(symbols)
    return json({ prices, mock: usingMockData() })
  } catch (err) {
    console.error('prices function error:', err)
    return json({ error: 'Failed to load prices' }, 500)
  }
}

export const config = {
  path: '/api/prices'
}
