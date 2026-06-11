/* ============================================================
   POST /api/history   body: { address, entry }
   → { history, mock }   (entry prepended to the wallet's log)
   ============================================================ */
import { appendHistory, usingMemoryStore } from './_lib/store.mjs'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  })

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const { address, entry } = await req.json()
    if (!address) return json({ error: 'address required' }, 400)
    if (!entry || typeof entry !== 'object') return json({ error: 'entry required' }, 400)

    const history = await appendHistory(address, entry)
    return json({ history, mock: usingMemoryStore() })
  } catch (err) {
    console.error('history function error:', err)
    return json({ error: 'Failed to append history' }, 500)
  }
}

export const config = {
  path: '/api/history'
}
