/* ============================================================
   PUT /api/settings   body: { address, settings }
   → { settings, mock }
   ============================================================ */
import { saveSettings, usingMemoryStore } from './_lib/store.mjs'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  })

export default async (req) => {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }
  try {
    const { address, settings } = await req.json()
    if (!address) return json({ error: 'address required' }, 400)
    if (!settings || typeof settings !== 'object') return json({ error: 'settings required' }, 400)

    const saved = await saveSettings(address, settings)
    return json({ settings: saved, mock: usingMemoryStore() })
  } catch (err) {
    console.error('settings function error:', err)
    return json({ error: 'Failed to save settings' }, 500)
  }
}

export const config = {
  path: '/api/settings'
}
