// Full-screen in-store board. Renders src/data/menu.json only.
// The public website still uses src/menu.js and does not read this file yet.
import '../tokens.css';
import './display.css';
import DATA from '../data/menu.json';
import { HOURS_SLOTS, STREET, POSTAL_CITY } from '../config.js';

const SLIDE_MS = 11000;
const RELOAD_MS = 30 * 60 * 1000;
const DEPLOY_POLL_MS = 5 * 60 * 1000;

const PHOTO_ROOT = {
  'chef-gher': '/chef-gher.webp',
  'hiraya-storefront': '/hiraya-storefront.webp',
};

const COOK = {
  Raw: ['roh', 'raw', 'raw'],
  Cooked: ['gegart', 'cooked', 'cooked'],
  'Flambéed': ['flambiert', 'flambéed', 'flam'],
};
const VEG = {
  V: ['vegetarisch', 'vegetarian', 'veg'],
  VG: ['vegan', 'vegan', 'vegan'],
};

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function photoUrl(key) {
  if (!key) return '';
  return PHOTO_ROOT[key] || `/menu/${key}.webp`;
}

function glyph(size, stack = true) {
  return `<span class="glyph" style="font-size:${size}px;${stack ? '' : 'flex-direction:row'}"><span>平</span><span>屋</span></span>`;
}

function brand() {
  return `<div class="brand">${glyph(46)}<div><div class="word">Hira<i>ya</i></div><div class="sub">Fusion Sushi &amp; Poke</div></div></div>`;
}

function footHTML() {
  const times = HOURS_SLOTS.map(([a, b]) => `${a}–${b}`).join(' · ');
  return `<div class="hrs"><div>Mo–Sa ${times} · So geschlossen</div><div class="en">Mon–Sat ${times} · Sun closed</div></div>
    <div class="addr"><div>${esc(STREET)} · ${esc(POSTAL_CITY)} · hiraya.ch</div><div class="en">Preise in CHF · prices in CHF</div></div>`;
}

function badges(it, opts = {}) {
  const b = [];
  if (it.pick && !opts.noPick) b.push(`<span class="b pick">★ Ghers Empfehlung · Gher's Pick</span>`);
  if (it.veg && VEG[it.veg]) {
    const v = VEG[it.veg];
    b.push(`<span class="b ${v[2]}">${it.veg === 'VG' ? 'VG · vegan' : 'V · ' + v[0] + ' / ' + v[1]}</span>`);
  }
  if (it.spicy) b.push(`<span class="b spicy">scharf · spicy</span>`);
  if (it.cook && COOK[it.cook]) {
    const c = COOK[it.cook];
    b.push(`<span class="b ${c[2]}">${c[0]} · ${c[1]}</span>`);
  }
  return b.length ? `<div class="badges">${b.join('')}</div>` : '';
}

function sizeHTML(p) {
  if (!p.de) return '';
  const m = p.de.match(/^(\d+) Stk$/);
  if (m) return `<span class="sz">${m[1]} <small>Stk/pcs</small></span>`;
  const en = p.en && p.en !== p.de ? ` <small>/ ${esc(p.en.replace(/^\d+ pcs(?: · )?/, ''))}</small>` : '';
  return `<span class="sz">${esc(p.de)}${en}</span>`;
}

function prices(it) {
  return `<div class="pr">${it.prices.map((p) => `<div class="p">${sizeHTML(p)}<span class="chf">${esc(p.chf)}</span></div>`).join('')}</div>`;
}

function names(it) {
  const en = it.en ? `<span class="en">${esc(it.en)}</span>` : '';
  const note = it.note ? `<span class="note">${esc(it.note[0])} · ${esc(it.note[1])}</span>` : '';
  return `<div class="nm"><span class="de">${esc(it.de)}</span>${en}${note}</div>`;
}

function descs(it) {
  let h = '';
  if (it.de_desc) h += `<div class="ds">${esc(it.de_desc)}</div>`;
  if (it.en_desc && it.en_desc !== it.de_desc) h += `<div class="ds en">${esc(it.en_desc)}</div>`;
  if (it.variants) {
    const en = it.variants.en !== it.variants.de ? ` <span style="opacity:.7">· ${esc(it.variants.en)}</span>` : '';
    h += `<div class="var">${esc(it.variants.de)}${en}</div>`;
  }
  return h;
}

function card(it) {
  const url = it.photo ? photoUrl(it.photo) : '';
  const ph = url
    ? `<div class="ph" style="background-image:url(${esc(url)})">${it.pick ? `<div class="pick"><span class="b pick">★ Gher's Pick</span></div>` : ''}</div>`
    : `<div class="ph none">${glyph(150, false)}</div>`;
  return `<div class="card">${ph}<div class="bd">${names(it)}${badges(it, { noPick: !!it.photo })}${descs(it)}${prices(it)}</div></div>`;
}

function legendTile() {
  const fine = DATA.showAllergenLine === false
    ? ''
    : `<div class="fine" data-allergen>${esc(DATA.allergen.de)}<br>${esc(DATA.allergen.en)}</div>`;
  return `<div class="legend"><h3>Legende · <i>legend</i></h3>
    <div class="row"><span class="b pick">★</span><span class="t">Ghers Empfehlung · Gher's Pick</span></div>
    <div class="row"><span class="b veg">V</span><span class="t">vegetarisch · vegetarian</span></div>
    <div class="row"><span class="b vegan">VG</span><span class="t">vegan</span></div>
    <div class="row"><span class="b spicy">scharf</span><span class="t">scharf · spicy</span></div>
    <div class="row"><span class="b raw">roh</span><span class="b cooked">gegart</span><span class="b flam">flambiert</span></div>
    <div class="row"><span class="t">raw · cooked · flambéed</span></div>
    ${fine}</div>`;
}

function hd(de, en, pg) {
  return `<div class="hd"><div class="t"><h1>${esc(de)}</h1><h2>${esc(en)}</h2>${pg ? `<span class="pg">${esc(pg)}</span>` : ''}</div>${brand()}</div>`;
}

function renderCards(s) {
  const n = s.items.length + (s.legend ? 1 : 0);
  const cols = n === 4 ? 2 : n <= 6 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  const tiles = s.items.map(card);
  if (s.legend) tiles.push(legendTile());
  return hd(s.de, s.en, s.page) + `<div class="grid ${n === 4 ? 'h' : ''}" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${rows},minmax(0,1fr))">${tiles.join('')}</div>`;
}

function listSize(p) {
  if (!p.de) return '';
  if (/^\d+ Stk$/.test(p.de)) return esc(p.de.replace('Stk', 'Stk/pcs'));
  // Show the English option when it is a different name, not a piece count or volume.
  const en = p.en && p.en !== p.de && !/\d/.test(p.en) ? ` <small>/ ${esc(p.en)}</small>` : '';
  return `${esc(p.de)}${en}`;
}

function li(it, compact) {
  const r = it.prices.map((p) => {
    const size = p.de ? `<span class="sz">${listSize(p)}</span>` : '';
    return `<div class="p">${size}<span class="chf">${esc(p.chf)}</span></div>`;
  }).join('');
  let body;
  if (compact) {
    const en = it.en_desc && it.en_desc !== it.de_desc ? ` · <i style="color:var(--ink-mute)">${esc(it.en_desc)}</i>` : '';
    const dd = it.de_desc || en ? `<div class="ds">${esc(it.de_desc)}${en}</div>` : '';
    const vv = it.variants
      ? `<div class="var">${esc(it.variants.de)}${it.variants.en !== it.variants.de ? ` <span style="opacity:.7">· ${esc(it.variants.en)}</span>` : ''}</div>`
      : '';
    body = `<div class="inl">${names(it)}${badges(it)}</div>${dd}${vv}`;
  } else {
    body = `<div class="inl">${names(it)}${badges(it)}</div>${descs(it)}`;
  }
  return `<div class="li ${compact ? 'compact' : ''}"><div class="l">${body}</div><div class="r">${r}</div></div>`;
}

function renderList(s) {
  const cols = s.cols.map((c) => {
    let h = `<div class="col"><div class="ch"><h3>${esc(c.de)}</h3><h4>${esc(c.en)}</h4>${c.page ? `<span class="pg">${esc(c.page)}</span>` : ''}<span class="unit">CHF</span></div>`;
    h += c.items.map((it) => li(it, c.compact)).join('');
    if (c.photos) {
      h += `<div class="thumbs">${c.photos.map((p) => `<div style="background-image:url(${esc(photoUrl(p))})"></div>`).join('')}</div>`;
    }
    return h + '</div>';
  }).join('');
  let side = '';
  if (s.sidecard) side = `<div class="sidecard">${card(s.sidecard)}</div>`;
  if (s.side === 'legend') {
    side = `<div class="sidelegend">${legendTile()}<div class="side" style="background-image:url(${esc(photoUrl('chef-gher'))});background-position:center 18%"><div class="cap">
      <div class="q">Ein einfaches Haus, voller Träume.</div><div class="q en">A simple house, full of dreams.</div>
      <div class="who">CHEF GHER · BINNINGEN</div></div></div></div>`;
  }
  return `<div class="hd" style="margin-bottom:18px"><div class="t"></div>${brand()}</div><div class="cols">${cols}${side}</div>`;
}

function renderWelcome() {
  return `<div class="welcome"><div class="l">
    <div class="eyebrow">Binningen · seit 2025 · Chef Gher</div>
    <h1>Zwei <i>Sprachen,</i><br>eine Rolle.</h1>
    <div class="enh">Two languages, one roll.</div>
    <div class="lead">Fusion-Sushi und Poke Bowls, frisch gerollt von Chef Gher. Filipinische Aromen treffen japanischen Reis.</div>
    <div class="lead en">Fusion sushi and poke bowls, hand-rolled by chef Gher. Filipino flavours meet Japanese rice.</div>
  </div><div class="r"><div class="circle" style="background-image:url(${esc(photoUrl('hero-rol'))})"></div>
    <div class="tag fil"><div class="lab">Filipino · hiraya</div><div class="big">ang bunga<br>ng pangarap</div><div class="gl">Frucht eines Traums · fruit of one's dream</div></div>
    <div class="tag jp">${glyph(70)}<div><div class="lab">日本語 · 平屋</div><div class="big">ein einfaches Haus</div><div class="gl">a simple house</div></div></div>
  </div></div>`;
}

const params = new URLSearchParams(location.search);
const PRINT = params.has('print');
const PIN = params.has('slide');

function build() {
  const host = document.getElementById('slides');
  host.innerHTML = DATA.slides.map((s, i) => {
    const inner = s.kind === 'welcome' ? renderWelcome() : s.kind === 'cards' ? renderCards(s) : renderList(s);
    return `<section class="slide" data-i="${i}">${inner}<div class="pfoot">${footHTML()}</div></section>`;
  }).join('');
  document.getElementById('ft').innerHTML = footHTML();
  document.getElementById('prog').innerHTML = DATA.slides.map(() => '<div class="seg"><i></i></div>').join('');
}

function viewportSize() {
  const vv = window.visualViewport;
  return {
    w: vv ? vv.width : window.innerWidth,
    h: vv ? vv.height : window.innerHeight,
  };
}

function fit() {
  if (PRINT) {
    document.getElementById('stage').style.height = 'auto';
    return;
  }
  const { w, h } = viewportSize();
  // 16:9 stays 1080 tall. Taller screens (16:10, 4:3) grow the stage so type is not cropped.
  const stageH = Math.max(1080, Math.round(1920 * h / w));
  const st = document.getElementById('stage');
  st.style.height = stageH + 'px';
  const sc = Math.min(w / 1920, h / stageH);
  st.style.transform = `translate(${(w - 1920 * sc) / 2}px,${(h - stageH * sc) / 2}px) scale(${sc})`;
}

let cur = 0;
let t0 = 0;
let raf = null;
let lastGuest = 0;
const IDLE_MS = 2 * 60 * 1000;

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function slideLabel(slide) {
  if (!slide || slide.kind === 'welcome') return 'Welcome';
  if (slide.de) return slide.page ? `${slide.de} ${slide.page}` : slide.de;
  return (slide.cols || []).map((col) => (col.page ? `${col.de} ${col.page}` : col.de)).join(' · ');
}

function slideSlug(slide) {
  if (!slide || slide.kind === 'welcome') return 'welcome';
  if (slide.de) return slug(slide.page ? `${slide.de} ${slide.page.split('/')[0]}` : slide.de);
  const parts = (slide.cols || []).map((col) => (col.page ? `${col.de} ${col.page.split('/')[0]}` : col.de));
  return slug(parts.join(' ')) || 'slide';
}

function track(path, title) {
  try {
    const count = window.goatcounter && window.goatcounter.count;
    if (typeof count !== 'function') return;
    count({ path, title, event: true });
  } catch {
    /* GoatCounter blocked or offline. Never break the board. */
  }
}

function noteActivity() {
  const now = Date.now();
  if (!lastGuest || now - lastGuest >= IDLE_MS) track('menu-session-start', 'Menu session');
  lastGuest = now;
}

function noteSection(index) {
  const slide = DATA.slides[index];
  track(`menu-section-${slideSlug(slide)}`, slideLabel(slide));
}

function show(i, guest) {
  const ss = [...document.querySelectorAll('.slide')];
  cur = (i + ss.length) % ss.length;
  if (guest) noteSection(cur);
  ss.forEach((s, k) => s.classList.toggle('on', k === cur));
  [...document.querySelectorAll('#prog .seg')].forEach((s, k) => {
    s.classList.toggle('done', k < cur);
    s.querySelector('i').style.transform = k < cur ? 'scaleX(1)' : 'scaleX(0)';
  });
  t0 = performance.now();
}

function tick(now) {
  const seg = document.querySelectorAll('#prog .seg')[cur];
  if (!PIN) {
    const f = Math.min(1, (now - t0) / SLIDE_MS);
    if (seg) seg.querySelector('i').style.transform = `scaleX(${f})`;
    if (f >= 1) show(cur + 1);
  }
  raf = requestAnimationFrame(tick);
}

function requestFullscreenOnce() {
  if (document.fullscreenElement) return;
  if (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches) return;
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (req) req.call(el).catch(() => {});
}

function holdWakeLock() {
  if (!('wakeLock' in navigator)) return;
  const ask = () => navigator.wakeLock.request('screen').catch(() => {});
  ask();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') ask();
  });
}

function watchForDeploy() {
  const current = [...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src')).join('|');
  setTimeout(() => location.reload(), RELOAD_MS);
  setInterval(async () => {
    try {
      const html = await fetch(`${location.pathname}?_=${Date.now()}`, { cache: 'no-store' }).then((r) => r.text());
      const next = [...html.matchAll(/\ssrc="([^"]+)"/g)].map((m) => m[1]).join('|');
      if (next && current && next !== current) location.reload();
    } catch {
      /* offline tablet: the 30-minute reload still retries */
    }
  }, DEPLOY_POLL_MS);
}

build();
fit();
addEventListener('resize', fit);
if (window.visualViewport) {
  visualViewport.addEventListener('resize', fit);
  visualViewport.addEventListener('scroll', fit);
}

if (PRINT) {
  document.querySelectorAll('.slide').forEach((s) => s.classList.add('on'));
} else {
  const start = PIN ? parseInt(params.get('slide'), 10) || 0 : 0;
  show(start);
  if (PIN) {
    document.querySelectorAll('#prog .seg').forEach((s, k) => {
      s.querySelector('i').style.transform = k <= cur ? 'scaleX(1)' : 'scaleX(0)';
    });
  }
  raf = requestAnimationFrame(tick);
  holdWakeLock();
  watchForDeploy();

  addEventListener('keydown', (e) => {
    noteActivity();
    if (e.key === 'ArrowRight' || e.key === ' ') show(cur + 1, true);
    else if (e.key === 'ArrowLeft') show(cur - 1, true);
  });

  let sx = 0;
  let sy = 0;
  let lastTouch = 0;
  addEventListener('touchstart', (e) => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  addEventListener('touchend', (e) => {
    requestFullscreenOnce();
    lastTouch = Date.now();
    noteActivity();
    const x = e.changedTouches[0].clientX;
    const dx = x - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) show(dx < 0 ? cur + 1 : cur - 1, true);
    else if (Math.abs(dx) < 24 && Math.abs(dy) < 24) show(x > viewportSize().w / 3 ? cur + 1 : cur - 1, true);
  }, { passive: true });
  addEventListener('click', (e) => {
    if (Date.now() - lastTouch < 800) return;
    requestFullscreenOnce();
    noteActivity();
    show(e.clientX > viewportSize().w / 3 ? cur + 1 : cur - 1, true);
  });
}

void raf;
