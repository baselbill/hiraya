import './kasse.css'
import rawMenu from 'kasse:menu'
import { PIN } from './config.js'
import { buildCatalog, money } from './menu.js'
import { loadOrders, saveOrders, nextSeq, zurichDay, zurichTime } from './store.js'
import { pushOrder } from './sync.js'

const catalog = buildCatalog(rawMenu)
const PICKUP = [
  ['asap', 'Sofort'],
  ['+15', '+15 Min'],
  ['+30', '+30 Min'],
  ['+45', '+45 Min'],
]

const state = {
  unlocked: sessionStorage.getItem('hiraya-kasse-pin') === 'ok',
  pin: '',
  pinError: '',
  section: catalog[0]?.name || '',
  view: 'order',
  cartOpen: true,
  type: 'walkin',
  customer: '',
  pickup: 'asap',
  note: '',
  lines: [],
  orders: loadOrders(),
  openId: null,
  sizeFor: null,
}

const app = document.getElementById('app')
let suppressClick = false

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
}

function lineKey(item, size) {
  return item.key + '|' + size.id
}

function addLine(item, size) {
  const id = lineKey(item, size)
  const hit = state.lines.find(l => l.id === id)
  if (hit) hit.qty += 1
  else state.lines.push({
    id, key: item.key, name: item.name, size: size.label, unit: size.price, qty: 1,
  })
  state.cartOpen = true
  render()
}

function totalOf(lines) {
  return lines.reduce((sum, l) => sum + l.unit * l.qty, 0)
}

function todayOrders() {
  const day = zurichDay()
  return state.orders.filter(o => o.day === day && o.status !== 'cancelled')
}

function render() {
  const scroll = document.querySelector('.items')?.scrollTop || 0
  app.innerHTML = state.unlocked ? shell() : pinScreen()
  const items = document.querySelector('.items')
  if (items) items.scrollTop = scroll
  bind()
}

function pinScreen() {
  const dots = [0, 1, 2, 3].map(i => `<i class="${i < state.pin.length ? 'on' : ''}"></i>`).join('')
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']
    .map(k => `<button type="button" data-digit="${k}" class="${k === 'del' || k === 'ok' ? 'ghost' : ''}">${k === 'del' ? '⌫' : k === 'ok' ? 'OK' : k}</button>`)
    .join('')
  return `<div class="pin">
    <div class="mark" aria-hidden="true"><span>平</span><span>屋</span></div>
    <h1>Kasse</h1>
    <div class="dots" aria-label="PIN">${dots}</div>
    <div class="err">${esc(state.pinError)}</div>
    <div class="keys">${keys}</div>
  </div>`
}

function shell() {
  const wide = window.matchMedia('(min-width: 900px)').matches
  return `<div class="shell">
    <header class="top">
      <div class="brand"><div class="mark" aria-hidden="true"><span>平</span><span>屋</span></div><strong>Hira<em>ya</em></strong></div>
      <span class="preview-tag">Vorschau · kein SumUp</span>
      <button type="button" class="nav" data-view="order" aria-pressed="${state.view === 'order'}">Kasse</button>
      <button type="button" class="nav" data-view="open" aria-pressed="${state.view === 'open'}">Offen</button>
      <button type="button" class="nav" data-view="today" aria-pressed="${state.view === 'today'}">Heute</button>
      <button type="button" class="nav" data-lock>Sperren</button>
    </header>
    <div class="stage ${state.view === 'order' ? 'order' : ''} ${state.view === 'order' && wide ? 'wide' : ''}">
      ${state.view === 'order' ? orderView(wide) : state.view === 'open' ? openView() : state.view === 'detail' ? detailView() : todayView()}
    </div>
    ${state.sizeFor ? sizeSheet() : ''}
  </div>`
}

function orderView(wide) {
  const section = catalog.find(s => s.name === state.section) || catalog[0]
  const cards = (section?.items || []).map(itemCard).join('')
  const tabs = catalog.map(s => `<button type="button" data-section="${esc(s.name)}" aria-pressed="${s.name === section?.name}">${esc(s.name)}</button>`).join('')
  const collapsed = !wide && !state.cartOpen
  return `<div class="items">${cards || '<p>Keine Gerichte.</p>'}</div>
    <nav class="tabs" aria-label="Gruppen">${tabs}</nav>
    <aside class="ticket ${collapsed ? 'collapsed' : ''}">${ticketInner(wide)}</aside>`
}

function itemCard(item) {
  const [first, ...rest] = item.sizes
  const badges = [
    item.pick ? '<span class="badge">★ Gher</span>' : '',
    item.veg ? `<span class="badge v">${esc(item.veg)}</span>` : '',
    item.spicy ? '<span class="badge hot">scharf</span>' : '',
  ].join('')
  const chips = rest.map(s => `<button type="button" class="chip" data-size="${esc(item.key)}" data-size-id="${s.id}">${esc(s.label || 'Variante')} ${money(s.price)}</button>`).join('')
  return `<article class="item ${item.pick ? 'pick' : ''}" data-item="${esc(item.key)}">
    <div class="nm">${esc(item.name)}</div>
    ${badges ? `<div class="meta">${badges}</div>` : ''}
    ${item.note ? `<div class="note">${esc(item.note)}</div>` : ''}
    <div class="price-row">
      <button type="button" class="add-main" data-add="${esc(item.key)}" data-size-id="${first.id}">${esc(first.label ? first.label + ' · ' : '')}${money(first.price)}</button>
      ${chips}
    </div>
  </article>`
}

function ticketInner(wide) {
  const lines = state.lines.map(l => `<div class="line">
    <div><div class="who">${esc(l.name)}</div><div class="sz">${esc(l.size)} · ${money(l.unit)}</div></div>
    <div class="qty">
      <button type="button" data-qty="${esc(l.id)}" data-dir="-1" aria-label="weniger">−</button>
      <span>${l.qty}</span>
      <button type="button" data-qty="${esc(l.id)}" data-dir="1" aria-label="mehr">+</button>
    </div>
  </div>`).join('')
  const modes = [['walkin', 'Vor Ort'], ['phone', 'Telefon']]
    .map(([id, label]) => `<button type="button" data-type="${id}" aria-pressed="${state.type === id}">${label}</button>`).join('')
  const when = PICKUP.map(([id, label]) => `<button type="button" data-pickup="${id}" aria-pressed="${state.pickup === id}">${label}</button>`).join('')
  return `<header><div class="modes">${modes}</div></header>
    <div class="lines">${lines || '<div class="empty">Noch nichts gewählt.</div>'}</div>
    <div class="fields">
      <div class="when">${when}</div>
      <input data-customer placeholder="Name oder Telefon" value="${esc(state.customer)}" />
      <textarea data-note placeholder="Notiz" rows="2">${esc(state.note)}</textarea>
    </div>
    <div class="foot">
      ${wide ? '' : `<button type="button" class="wide-btn ghost" data-cart style="background:#2a221c;color:#f4ead6">${state.cartOpen ? 'Karte' : 'Liste'}</button>`}
      <div class="total">${money(totalOf(state.lines))}</div>
      <button type="button" class="save" data-save ${state.lines.length ? '' : 'disabled'}>Speichern</button>
    </div>`
}

function openView() {
  const open = state.orders.filter(o => o.status === 'open').sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const rows = open.map(o => `<button type="button" class="order-row" data-open="${esc(o.id)}">
    <span>Nr. ${o.seq} · ${o.type === 'phone' ? 'Telefon' : 'Vor Ort'} · ${zurichTime(o.createdAt)}</span>
    <span>${money(o.total)}</span>
  </button>`).join('')
  return `<div class="list-view"><h2>Offene Bestellungen</h2>${rows || '<p>Keine offenen Bestellungen.</p>'}</div>`
}

function detailView() {
  const o = state.orders.find(x => x.id === state.openId)
  if (!o) return `<div class="detail"><p>Bestellung nicht gefunden.</p></div>`
  const lines = o.lines.map(l => `<div class="line"><div><div class="who">${esc(l.name)}</div><div class="sz">${esc(l.size)} × ${l.qty}</div></div><strong>${money(l.unit * l.qty)}</strong></div>`).join('')
  return `<div class="detail">
    <button type="button" class="wide-btn ghost" data-view="open">Zurück</button>
    <div class="hint">Nr. ${o.seq} · ${esc(o.day)} ${zurichTime(o.createdAt)} · ${o.type === 'phone' ? 'Telefon' : 'Vor Ort'}</div>
    <div class="hint">In SumUp eingeben</div>
    <div class="sum">${money(o.total)}</div>
    ${o.customer ? `<div>${esc(o.customer)}</div>` : ''}
    ${o.note ? `<div>Notiz: ${esc(o.note)}</div>` : ''}
    <div class="hint">Abholung: ${esc(PICKUP.find(p => p[0] === o.pickup)?.[1] || o.pickup)}</div>
    <div class="lines">${lines}</div>
    <div class="actions">
      <button type="button" class="wide-btn" data-paid="${esc(o.id)}" ${o.status === 'paid' ? 'disabled' : ''}>Bezahlt</button>
      <button type="button" class="wide-btn ink" data-cancel="${esc(o.id)}" ${o.status === 'cancelled' ? 'disabled' : ''}>Stornieren</button>
    </div>
  </div>`
}

function todayView() {
  const day = zurichDay()
  const all = state.orders.filter(o => o.day === day)
  const open = all.filter(o => o.status === 'open')
  const paid = all.filter(o => o.status === 'paid')
  const sales = paid.reduce((s, o) => s + o.total, 0)
  return `<div class="today">
    <h2>Heute · ${esc(day)}</h2>
    <div class="stats">
      <div class="stat"><span>Bestellungen</span><b>${all.filter(o => o.status !== 'cancelled').length}</b></div>
      <div class="stat"><span>Offen</span><b>${open.length}</b></div>
      <div class="stat"><span>Bezahlt</span><b>${paid.length}</b></div>
      <div class="stat"><span>Umsatz</span><b>${money(sales)}</b></div>
    </div>
    <div class="actions">
      <button type="button" class="wide-btn" data-csv="orders">Bestellungen CSV</button>
      <button type="button" class="wide-btn ink" data-csv="lines">Zeilen CSV</button>
    </div>
  </div>`
}

function sizeSheet() {
  const item = findItem(state.sizeFor)
  if (!item) return ''
  const choices = item.sizes.map(s => `<button type="button" class="choice" data-size="${esc(item.key)}" data-size-id="${s.id}">${esc(s.label || item.name)} · ${money(s.price)}</button>`).join('')
  return `<div class="sheet" data-close-sheet><div class="panel" data-sheet>
    <h2>${esc(item.name)}</h2>
    ${choices}
    <button type="button" class="wide-btn ghost" data-close-sheet>Schliessen</button>
  </div></div>`
}

function findItem(key) {
  for (const section of catalog) {
    const hit = section.items.find(i => i.key === key)
    if (hit) return hit
  }
  return null
}

function bind() {
  app.querySelectorAll('[data-digit]').forEach(btn => btn.addEventListener('click', () => onDigit(btn.dataset.digit)))
  app.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => {
    state.view = btn.dataset.view
    state.sizeFor = null
    render()
  }))
  app.querySelector('[data-lock]')?.addEventListener('click', () => {
    sessionStorage.removeItem('hiraya-kasse-pin')
    state.unlocked = false
    state.pin = ''
    render()
  })
  app.querySelectorAll('[data-section]').forEach(btn => btn.addEventListener('click', () => {
    state.section = btn.dataset.section
    render()
  }))
  app.querySelectorAll('[data-add]').forEach(btn => {
    const item = findItem(btn.dataset.add)
    const size = item?.sizes.find(s => s.id === btn.dataset.sizeId)
    btn.addEventListener('pointerdown', (e) => armLongPress(e, item))
    btn.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return }
      if (item && size) addLine(item, size)
    })
  })
  app.querySelectorAll('[data-size]').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation()
    const item = findItem(btn.dataset.size)
    const size = item?.sizes.find(s => s.id === btn.dataset.sizeId)
    state.sizeFor = null
    if (item && size) addLine(item, size)
  }))
  app.querySelectorAll('[data-qty]').forEach(btn => btn.addEventListener('click', () => changeQty(btn.dataset.qty, Number(btn.dataset.dir))))
  app.querySelectorAll('[data-type]').forEach(btn => btn.addEventListener('click', () => { state.type = btn.dataset.type; render() }))
  app.querySelectorAll('[data-pickup]').forEach(btn => btn.addEventListener('click', () => { state.pickup = btn.dataset.pickup; render() }))
  app.querySelector('[data-customer]')?.addEventListener('input', (e) => { state.customer = e.target.value })
  app.querySelector('[data-note]')?.addEventListener('input', (e) => { state.note = e.target.value })
  app.querySelector('[data-cart]')?.addEventListener('click', () => { state.cartOpen = !state.cartOpen; render() })
  app.querySelector('[data-save]')?.addEventListener('click', saveOrder)
  app.querySelectorAll('[data-open]').forEach(btn => btn.addEventListener('click', () => {
    state.openId = btn.dataset.open
    state.view = 'detail'
    render()
  }))
  app.querySelectorAll('[data-paid]').forEach(btn => btn.addEventListener('click', () => setStatus(btn.dataset.paid, 'paid')))
  app.querySelectorAll('[data-cancel]').forEach(btn => btn.addEventListener('click', () => setStatus(btn.dataset.cancel, 'cancelled')))
  app.querySelectorAll('[data-csv]').forEach(btn => btn.addEventListener('click', () => downloadCsv(btn.dataset.csv)))
  app.querySelectorAll('[data-close-sheet]').forEach(el => el.addEventListener('click', (e) => {
    if (e.target.closest('[data-sheet]') && !e.target.closest('button')) return
    state.sizeFor = null
    render()
  }))
}

let pressTimer = 0
function armLongPress(event, item) {
  if (!item || item.sizes.length < 2) return
  clearTimeout(pressTimer)
  pressTimer = setTimeout(() => {
    suppressClick = true
    state.sizeFor = item.key
    render()
    setTimeout(() => { suppressClick = false }, 500)
  }, 450)
  const up = () => { clearTimeout(pressTimer); event.target.removeEventListener('pointerup', up); event.target.removeEventListener('pointerleave', up) }
  event.target.addEventListener('pointerup', up)
  event.target.addEventListener('pointerleave', up)
}

function onDigit(key) {
  if (key === 'del') state.pin = state.pin.slice(0, -1)
  else if (key === 'ok') checkPin()
  else if (state.pin.length < 4) {
    state.pin += key
    if (state.pin.length === 4) checkPin()
  }
  state.pinError = state.unlocked ? '' : state.pinError
  if (!state.unlocked) render()
}

function checkPin() {
  if (state.pin === PIN) {
    state.unlocked = true
    state.pinError = ''
    state.pin = ''
    sessionStorage.setItem('hiraya-kasse-pin', 'ok')
    render()
    return
  }
  state.pinError = 'Falsche PIN'
  state.pin = ''
}

function changeQty(id, dir) {
  const line = state.lines.find(l => l.id === id)
  if (!line) return
  line.qty += dir
  if (line.qty <= 0) state.lines = state.lines.filter(l => l.id !== id)
  render()
}

async function saveOrder() {
  if (!state.lines.length) return
  const day = zurichDay()
  const order = {
    id: crypto.randomUUID(),
    day,
    seq: nextSeq(state.orders, day),
    createdAt: new Date().toISOString(),
    paidAt: null,
    type: state.type,
    status: 'open',
    customer: state.customer.trim(),
    pickup: state.pickup,
    note: state.note.trim(),
    lines: state.lines.map(l => ({ ...l })),
    total: totalOf(state.lines),
    sync: 'local',
  }
  try {
    const result = await pushOrder(order)
    if (result.ok) order.sync = 'sent'
  } catch {
    order.sync = 'error'
  }
  state.orders.unshift(order)
  saveOrders(state.orders)
  state.lines = []
  state.customer = ''
  state.note = ''
  state.pickup = 'asap'
  state.openId = order.id
  state.view = 'detail'
  render()
}

function setStatus(id, status) {
  const order = state.orders.find(o => o.id === id)
  if (!order) return
  order.status = status
  order.paidAt = status === 'paid' ? new Date().toISOString() : null
  saveOrders(state.orders)
  pushOrder(order).catch(() => {})
  render()
}

function csvEscape(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function downloadCsv(kind) {
  const day = zurichDay()
  const rows = state.orders.filter(o => o.day === day)
  let csv
  if (kind === 'lines') {
    csv = ['order_id,line_no,item_key,item_name,size_label,unit_chf,qty,line_chf']
    for (const o of rows) o.lines.forEach((l, i) => {
      csv.push([o.id, i + 1, l.key, l.name, l.size, l.unit.toFixed(2), l.qty, (l.unit * l.qty).toFixed(2)].map(csvEscape).join(','))
    })
  } else {
    csv = ['order_id,day,seq,created_at,paid_at,type,status,customer,pickup,note,total_chf,sync']
    for (const o of rows) {
      csv.push([o.id, o.day, o.seq, o.createdAt, o.paidAt || '', o.type, o.status, o.customer, o.pickup, o.note, o.total.toFixed(2), o.sync].map(csvEscape).join(','))
    }
  }
  const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `hiraya-${kind}-${day}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

window.addEventListener('resize', () => { if (state.unlocked) render() })

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {})
}

render()
