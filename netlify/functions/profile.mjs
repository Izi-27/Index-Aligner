/* ============================================================
   GET /api/profile?address=0x..
   → { settings, history, mock }  (defaults if the wallet is new)
   ============================================================ */
import { getProfile, usingMemoryStore } from './_lib/store.mjs'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  })

export default async (req) => {
  try {
    const address = new URL(req.url).searchParams.get('address')
    if (!address) return json({ error: 'address query param required' }, 400)

    const { settings, history } = await getProfile(address)
    return json({ settings, history, mock: usingMemoryStore() })
  } catch (err) {
    console.error('profile function error:', err)
    return json({ error: 'Failed to load profile' }, 500)
  }
}

export const config = {
  path: '/api/profile'
}
