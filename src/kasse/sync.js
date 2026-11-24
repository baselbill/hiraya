import { APPS_SCRIPT_URL } from './config.js'

// Stub. When APPS_SCRIPT_URL is set, each saved or updated order is POSTed
// as JSON. The script is expected to append the Orders row and the Order lines.
// Apps Script web apps accept text/plain without a CORS preflight.
export async function pushOrder(order) {
  if (!APPS_SCRIPT_URL) return { ok: false, skipped: true }
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ kind: 'order', order }),
  })
  if (!res.ok) throw new Error('sync ' + res.status)
  return { ok: true }
}
