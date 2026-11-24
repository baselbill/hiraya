import { ENDPOINT_URL, TOKEN } from './config.js'
import { zurichDay } from './store.js'

const QUEUE_KEY = 'hiraya-kasse-sync-queue-v1'

export function endpointReady() {
  return Boolean(ENDPOINT_URL && TOKEN)
}

export function queueLength() {
  return loadQueue().length
}

export function enqueueOrder(order) {
  if (!endpointReady()) return
  const payload = toPayload(order)
  const queue = loadQueue().filter(row => row.order_id !== payload.order_id)
  queue.push(payload)
  saveQueue(queue)
}

export async function flushQueue() {
  if (!endpointReady()) return { skipped: true, waiting: 0 }
  const queue = loadQueue()
  const remain = []
  for (let i = 0; i < queue.length; i++) {
    const posted = await postOrder(queue[i])
    if (!posted) {
      remain.push(...queue.slice(i))
      break
    }
  }
  saveQueue(remain)
  return { skipped: false, waiting: remain.length }
}

// Apps Script answers the POST with a 302 to script.googleusercontent.com.
// A text/plain body is a simple request, so fetch follows that redirect.
// If the final response is opaque, the upsert already ran and is idempotent.
async function postOrder(order) {
  const init = {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ token: TOKEN, order }),
  }
  try {
    const res = await fetch(ENDPOINT_URL, init)
    if (res.type === 'opaque' || res.status === 0) return true
    const data = await res.json().catch(() => null)
    return !!(res.ok && data && data.ok === true)
  } catch {
    try {
      const res = await fetch(ENDPOINT_URL, { ...init, mode: 'no-cors' })
      return res.type === 'opaque' || res.status === 0 || res.ok
    } catch {
      return false
    }
  }
}

export function toPayload(order) {
  const when = zurichParts(order.createdAt)
  const lines = (order.lines || []).map((line, index) => {
    const qty = Number(line.qty) || 0
    const unit = round2(line.unit)
    return {
      order_id: order.id,
      order_no: String(order.seq),
      date: when.date,
      line_no: index + 1,
      section: line.section || '',
      item: line.name || '',
      size: line.sizeDe || line.size || '',
      qty,
      unit_price_chf: unit,
      line_total_chf: round2(unit * qty),
    }
  })
  return {
    order_id: order.id,
    order_no: String(order.seq),
    created_at: order.createdAt,
    date: when.date,
    time: when.time,
    type: order.type === 'phone' ? 'phone' : 'walk-in',
    customer: order.customer || '',
    pickup_time: order.pickup || '',
    note: order.note || '',
    item_count: lines.length,
    total_chf: round2(lines.reduce((sum, line) => sum + line.line_total_chf, 0)),
    status: order.status,
    paid_at: order.paidAt || '',
    cancelled_at: order.cancelledAt || '',
    lang: order.lang || '',
    device: order.device || '',
    lines,
  }
}

function zurichParts(iso) {
  const date = new Date(iso)
  return {
    date: zurichDay(date),
    time: new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Zurich',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).format(date),
  }
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100
}

function loadQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}
