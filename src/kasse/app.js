import './kasse.css'
import rawMenu from 'kasse:menu'
import { PIN } from './config.js'
import { buildCatalog, money } from './menu.js'
import { loadOrders, saveOrders, nextSeq, zurichDay, zurichTime } from './store.js'
import { enqueueOrder, endpointReady, flushQueue, queueLength } from './sync.js'

const catalog = buildCatalog(rawMenu)
const PICKUP = ['asap', '+15', '+30', '+45']

const UI = {
  en: {
    title: 'Till', pinWrong: 'Wrong PIN', preview: 'Preview · no SumUp',
    till: 'Till', open: 'Open', today: 'Today', lock: 'Lock',
    walkin: 'Walk-in', phone: 'Phone', asap: 'ASAP',
    '+15': '+15 min', '+30': '+30 min', '+45': '+45 min',
    customer: 'Name or phone', note: 'Note', empty: 'Nothing selected yet.',
    cart: 'List', menu: 'Menu', save: 'Save', openOrders: 'Open orders',
    noneOpen: 'No open orders.', back: 'Back', sumup: 'Type into SumUp',
    notePrefix: 'Note', pickup: 'Pickup', paid: 'Mark paid', cancel: 'Cancel',
    orders: 'Orders', openStat: 'Open', paidStat: 'Paid', sales: 'Sales',
    csv: 'Export CSV', close: 'Close',
    noItems: 'No dishes.', spicy: 'spicy', nr: 'No.', notFound: 'Order not found.',
    less: 'less', more: 'more', local: 'Local', synced: 'Synced', waiting: 'waiting',
  },
  de: {
    title: 'Kasse', pinWrong: 'Falsche PIN', preview: 'Vorschau · kein SumUp',
    till: 'Kasse', open: 'Offen', today: 'Heute', lock: 'Sperren',
    walkin: 'Vor Ort', phone: 'Telefon', asap: 'Sofort',
    '+15': '+15 Min', '+30': '+30 Min', '+45': '+45 Min',
    customer: 'Name oder Telefon', note: 'Notiz', empty: 'Noch nichts gewählt.',
    cart: 'Liste', menu: 'Karte', save: 'Speichern', openOrders: 'Offene Bestellungen',
    noneOpen: 'Keine offenen Bestellungen.', back: 'Zurück', sumup: 'In SumUp eingeben',
    notePrefix: 'Notiz', pickup: 'Abholung', paid: 'Bezahlt', cancel: 'Stornieren',
    orders: 'Bestellungen', openStat: 'Offen', paidStat: 'Bezahlt', sales: 'Umsatz',
    csv: 'CSV exportieren', close: 'Schliessen',
    noItems: 'Keine Gerichte.', spicy: 'scharf', nr: 'Nr.', notFound: 'Bestellung nicht gefunden.',
    less: 'weniger', more: 'mehr', local: 'Nur hier', synced: 'Synchron', waiting: 'warten',
  },
}

function loadLang() {
  try {
    const stored = localStorage.getItem('hiraya-kasse-lang')
    if (stored === 'de' || stored === 'en') return stored
  } catch { /* private mode */ }
  return 'en'
}

function t(key) {
  return (UI[state.lang] || UI.en)[key] || UI.en[key] || key
}

const state = {
  lang: loadLang(),
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

function text(de, en) {
  if (state.lang === 'en' && en) return en
  return de || en || ''
}

function sectionLabel(section) {
  return text(section.name, section.en)
}

function sizeLabel(size) {
  return text(size.labelDe, size.labelEn)
}

function isDrink(item) {
  return item?.section === 'Getränke'
}

function shownSize(item, size) {
  if (isDrink(item)) return ''
  return sizeLabel(size)
}

function lineSize(line) {
  return text(line.sizeDe || line.size || '', line.sizeEn || '')
}

function langToggle() {
  return `<div class="lang" role="group" aria-label="EN DE">
    <button type="button" data-lang="en" aria-pressed="${state.lang === 'en'}">EN</button>
    <span class="bar" aria-hidden="true">|</span>
    <button type="button" data-lang="de" aria-pressed="${state.lang === 'de'}">DE</button>
  </div>`
}

function setLang(lang) {
  state.lang = lang
  try { localStorage.setItem('hiraya-kasse-lang', lang) } catch { /* ignore */ }
  document.documentElement.lang = lang
  render()
}

function lineKey(item, size) {
  return item.key + '|' + size.id
}

function addLine(item, size) {
  const id = lineKey(item, size)
  const hit = state.lines.find(l => l.id === id)
  if (hit) hit.qty += 1
  else state.lines.push({
    id, key: item.key, name: item.name, section: item.section,
    sizeDe: isDrink(item) ? '' : size.labelDe,
    sizeEn: isDrink(item) ? '' : size.labelEn,
    unit: size.price, qty: 1,
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
  document.documentElement.lang = state.lang
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
    ${langToggle()}
    <div class="mark" aria-hidden="true"><span>平</span><span>屋</span></div>
    <h1>${esc(t('title'))}</h1>
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
      <span class="preview-tag">${esc(t('preview'))}</span>
      <span class="sync" data-sync>${esc(syncLabel())}</span>
      ${langToggle()}
      <button type="button" class="nav" data-view="order" aria-pressed="${state.view === 'order'}">${esc(t('till'))}</button>
      <button type="button" class="nav" data-view="open" aria-pressed="${state.view === 'open'}">${esc(t('open'))}</button>
      <button type="button" class="nav" data-view="today" aria-pressed="${state.view === 'today'}">${esc(t('today'))}</button>
      <button type="button" class="nav" data-lock>${esc(t('lock'))}</button>
    </header>
    <div class="stage ${state.view === 'order' ? 'order' : ''} ${state.view === 'order' && wide ? 'wide' : ''}">
      ${state.view === 'order' ? orderView(wide) : state.view === 'open' ? openView() : state.view === 'detail' ? detailView() : todayView()}
    </div>
    ${state.sizeFor ? sizeSheet() : ''}
  </div>`
}

function orderView(wide) {
  const section = catalog.find(s => s.id === state.section) || catalog[0]
  const cards = (section?.items || []).map(itemCard).join('')
  const tabs = catalog.map(s => `<button type="button" data-section="${esc(s.id)}" aria-pressed="${s.id === section?.id}">${esc(sectionLabel(s))}</button>`).join('')
  const collapsed = !wide && !state.cartOpen
  return `<div class="items">${cards || `<p>${esc(t('noItems'))}</p>`}</div>
    <nav class="tabs" aria-label="${esc(t('till'))}">${tabs}</nav>
    <aside class="ticket ${collapsed ? 'collapsed' : ''}">${ticketInner(wide)}</aside>`
}

function itemCard(item) {
  const [first, ...rest] = item.sizes
  const badges = [
    item.pick ? '<span class="badge">★ Gher</span>' : '',
    item.veg ? `<span class="badge v">${esc(item.veg)}</span>` : '',
    item.spicy ? `<span class="badge hot">${esc(t('spicy'))}</span>` : '',
  ].join('')
  const desc = text(item.descDe, item.descEn)
  const note = text(item.noteDe, item.noteEn)
  const chips = rest.map(s => {
    const label = shownSize(item, s)
    return `<button type="button" class="chip" data-size="${esc(item.key)}" data-size-id="${s.id}">${esc(label ? label + ' ' : '')}${money(s.price)}</button>`
  }).join('')
  const mainLabel = shownSize(item, first)
  return `<article class="item ${item.pick ? 'pick' : ''}" data-item="${esc(item.key)}">
    <div class="nm">${esc(item.name)}</div>
    ${badges ? `<div class="meta">${badges}</div>` : ''}
    ${desc ? `<div class="desc">${esc(desc)}</div>` : ''}
    ${note ? `<div class="note">${esc(note)}</div>` : ''}
    <div class="price-row">
      <button type="button" class="add-main" data-add="${esc(item.key)}" data-size-id="${first.id}">${esc(mainLabel ? mainLabel + ' · ' : '')}${money(first.price)}</button>
      ${chips}
    </div>
  </article>`
}

function ticketInner(wide) {
  const lines = state.lines.map(l => `<div class="line">
    <div><div class="who">${esc(l.name)}</div><div class="sz">${esc(lineSize(l) ? lineSize(l) + ' · ' : '')}${money(l.unit)}</div></div>
    <div class="qty">
      <button type="button" data-qty="${esc(l.id)}" data-dir="-1" aria-label="${esc(t('less'))}">−</button>
      <span>${l.qty}</span>
      <button type="button" data-qty="${esc(l.id)}" data-dir="1" aria-label="${esc(t('more'))}">+</button>
    </div>
  </div>`).join('')
  const modes = [['walkin', 'walkin'], ['phone', 'phone']]
    .map(([id, key]) => `<button type="button" data-type="${id}" aria-pressed="${state.type === id}">${esc(t(key))}</button>`).join('')
  const when = PICKUP.map(id => `<button type="button" data-pickup="${id}" aria-pressed="${state.pickup === id}">${esc(t(id))}</button>`).join('')
  return `<header><div class="modes">${modes}</div></header>
    <div class="lines">${lines || `<div class="empty">${esc(t('empty'))}</div>`}</div>
    <div class="fields">
      <div class="when">${when}</div>
      <input data-customer placeholder="${esc(t('customer'))}" value="${esc(state.customer)}" />
      <textarea data-note placeholder="${esc(t('note'))}" rows="2">${esc(state.note)}</textarea>
    </div>
    <div class="foot">
      ${wide ? '' : `<button type="button" class="wide-btn ghost" data-cart style="background:#2a221c;color:#f4ead6">${state.cartOpen ? esc(t('menu')) : esc(t('cart'))}</button>`}
      <div class="total">${money(totalOf(state.lines))}</div>
      <button type="button" class="save" data-save ${state.lines.length ? '' : 'disabled'}>${esc(t('save'))}</button>
    </div>`
}

function openView() {
  const open = state.orders.filter(o => o.status === 'open').sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const rows = open.map(o => `<button type="button" class="order-row" data-open="${esc(o.id)}">
    <span>${esc(t('nr'))} ${o.seq} · ${o.type === 'phone' ? esc(t('phone')) : esc(t('walkin'))} · ${zurichTime(o.createdAt)}</span>
    <span>${money(o.total)}</span>
  </button>`).join('')
  return `<div class="list-view"><h2>${esc(t('openOrders'))}</h2>${rows || `<p>${esc(t('noneOpen'))}</p>`}</div>`
}

function detailView() {
  const o = state.orders.find(x => x.id === state.openId)
  if (!o) return `<div class="detail"><p>${esc(t('notFound'))}</p></div>`
  const lines = o.lines.map(l => `<div class="line"><div><div class="who">${esc(l.name)}</div><div class="sz">${esc(lineSize(l) ? lineSize(l) + ' × ' : '× ')}${l.qty}</div></div><strong>${money(l.unit * l.qty)}</strong></div>`).join('')
  return `<div class="detail">
    <button type="button" class="wide-btn ghost" data-view="open">${esc(t('back'))}</button>
    <div class="hint">${esc(t('nr'))} ${o.seq} · ${esc(o.day)} ${zurichTime(o.createdAt)} · ${o.type === 'phone' ? esc(t('phone')) : esc(t('walkin'))}</div>
    <div class="hint">${esc(t('sumup'))}</div>
    <div class="sum">${money(o.total)}</div>
    ${o.customer ? `<div>${esc(o.customer)}</div>` : ''}
    ${o.note ? `<div>${esc(t('notePrefix'))}: ${esc(o.note)}</div>` : ''}
    <div class="hint">${esc(t('pickup'))}: ${esc(t(o.pickup) || o.pickup)}</div>
    <div class="lines">${lines}</div>
    <div class="actions">
      <button type="button" class="wide-btn" data-paid="${esc(o.id)}" ${o.status === 'paid' ? 'disabled' : ''}>${esc(t('paid'))}</button>
      <button type="button" class="wide-btn ink" data-cancel="${esc(o.id)}" ${o.status === 'cancelled' ? 'disabled' : ''}>${esc(t('cancel'))}</button>
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
    <h2>${esc(t('today'))} · ${esc(day)}</h2>
    <div class="stats">
      <div class="stat"><span>${esc(t('orders'))}</span><b>${all.filter(o => o.status !== 'cancelled').length}</b></div>
      <div class="stat"><span>${esc(t('openStat'))}</span><b>${open.length}</b></div>
      <div class="stat"><span>${esc(t('paidStat'))}</span><b>${paid.length}</b></div>
      <div class="stat"><span>${esc(t('sales'))}</span><b>${money(sales)}</b></div>
    </div>
    <div class="actions">
      <button type="button" class="wide-btn" data-csv>${esc(t('csv'))}</button>
    </div>
  </div>`
}

function sizeSheet() {
  const item = findItem(state.sizeFor)
  if (!item) return ''
  const choices = item.sizes.map(s => {
    const label = shownSize(item, s)
    const choice = label ? `${label} · ${money(s.price)}` : money(s.price)
    return `<button type="button" class="choice" data-size="${esc(item.key)}" data-size-id="${s.id}">${esc(choice)}</button>`
  }).join('')
  return `<div class="sheet" data-close-sheet><div class="panel" data-sheet>
    <h2>${esc(item.name)}</h2>
    ${choices}
    <button type="button" class="wide-btn ghost" data-close-sheet>${esc(t('close'))}</button>
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
  app.querySelectorAll('[data-lang]').forEach(btn => btn.addEventListener('click', () => setLang(btn.dataset.lang)))
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
  app.querySelector('[data-csv]')?.addEventListener('click', downloadCsv)
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
  state.pinError = t('pinWrong')
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
    lang: state.lang,
    device: deviceLabel(),
    cancelledAt: null,
    sync: 'local',
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
  rememberSync(order)
}

function setStatus(id, status) {
  const order = state.orders.find(o => o.id === id)
  if (!order) return
  order.status = status
  order.paidAt = status === 'paid' ? new Date().toISOString() : order.paidAt
  order.cancelledAt = status === 'cancelled' ? new Date().toISOString() : order.cancelledAt
  saveOrders(state.orders)
  render()
  rememberSync(order)
}

function csvEscape(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function zurichClock(iso) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Zurich',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(iso))
}

function downloadCsv() {
  const day = zurichDay()
  const rows = state.orders.filter(o => o.day === day)
  const csv = ['order_id,order_no,created_at,date,time,type,customer,pickup_time,note,status,paid_at,cancelled_at,order_total_chf,line_no,section,item,size,qty,unit_price_chf,line_total_chf']
  for (const o of rows) {
    ;(o.lines || []).forEach((l, i) => {
      const qty = Number(l.qty) || 0
      const unit = Number(l.unit) || 0
      const lineTotal = Math.round(unit * qty * 100) / 100
      csv.push([
        o.id,
        o.seq,
        o.createdAt,
        o.day,
        zurichClock(o.createdAt),
        o.type === 'phone' ? 'phone' : 'walk-in',
        o.customer || '',
        o.pickup || '',
        o.note || '',
        o.status || '',
        o.paidAt || '',
        o.cancelledAt || '',
        Number(o.total).toFixed(2),
        i + 1,
        l.section || '',
        l.name || '',
        l.sizeDe || l.size || '',
        qty,
        unit.toFixed(2),
        lineTotal.toFixed(2),
      ].map(csvEscape).join(','))
    })
  }
  const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `hiraya-${day}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

function deviceLabel() {
  const ua = navigator.userAgent || ''
  if (/iPad|Tablet|Android/i.test(ua)) return 'tablet'
  if (/Mobile/i.test(ua)) return 'phone'
  return 'desktop'
}

function syncLabel() {
  if (!endpointReady()) return t('local')
  const waiting = queueLength()
  return waiting ? `${waiting} ${t('waiting')}` : t('synced')
}

function rememberSync(order) {
  enqueueOrder(order)
  flushQueue().then(paintSync).catch(paintSync)
}

function paintSync() {
  const el = document.querySelector('[data-sync]')
  if (el) el.textContent = syncLabel()
}

window.addEventListener('resize', () => { if (state.unlocked) render() })
window.addEventListener('online', () => { flushQueue().then(paintSync).catch(paintSync) })
setInterval(() => { flushQueue().then(paintSync).catch(paintSync) }, 60000)

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) {
      if (reg.scope.includes('/kasse-7a6466ec')) reg.unregister()
    }
  }).catch(() => {})
  navigator.serviceWorker.register('./sw.js').catch(() => {})
}

render()
