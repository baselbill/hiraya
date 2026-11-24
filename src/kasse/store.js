// Preview storage. Orders stay on this tablet until a sync URL exists.
const KEY = 'hiraya-kasse-orders-v1'

export function zurichDay(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function zurichTime(iso) {
  return new Intl.DateTimeFormat('de-CH', {
    timeZone: 'Europe/Zurich',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function loadOrders() {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function saveOrders(orders) {
  localStorage.setItem(KEY, JSON.stringify(orders))
}

export function nextSeq(orders, day) {
  const seqs = orders.filter(o => o.day === day).map(o => o.seq || 0)
  return (seqs.length ? Math.max(...seqs) : 0) + 1
}
