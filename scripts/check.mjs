// Consistency checks for content that is easy to break by hand. Run: npm run check
//  - every menu item has a translation in all four languages (and vice versa)
//  - every menu image exists in public/
//  - every language defines the same UI text keys
//  - every menu category has labels in all four languages
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { MENU } from '../src/menu.js';
import { T, ITEM_I18N, MENU_I18N, LANG_LIST } from '../src/i18n.js';
import { RENOVATION } from '../src/config.js';
import {
  closurePhase, shopDayStatus, atZurich, zurichParts, resolveNow, formatDayMonth, applyClosureJsonLd,
} from '../src/closure.js';

const langs = LANG_LIST.map(l => l.code);
const errors = [];
const fail = msg => errors.push(msg);

const ids = new Set();
for (const [cat, { items }] of Object.entries(MENU)) {
  if (!MENU_I18N[cat]) fail(`category "${cat}": missing in MENU_I18N`);
  else for (const field of ['label', 'sub', 'intro']) {
    for (const l of langs) if (!MENU_I18N[cat][field]?.[l]) fail(`MENU_I18N.${cat}.${field}: missing "${l}"`);
  }
  for (const item of items) {
    if (ids.has(item.id)) fail(`duplicate menu id "${item.id}"`);
    ids.add(item.id);
    if (typeof item.price !== 'number' || item.price <= 0) fail(`${item.id}: invalid price`);
    if (item.img && !existsSync(join('public', item.img))) fail(`${item.id}: image not found: public${item.img}`);
    const tr = ITEM_I18N[item.id];
    if (!tr) { fail(`${item.id}: no entry in ITEM_I18N`); continue; }
    for (const l of langs) {
      for (const field of ['name', 'ingredients', 'desc']) {
        if (!tr[l]?.[field]) fail(`ITEM_I18N.${item.id}.${l}: missing "${field}"`);
      }
    }
  }
}
for (const id of Object.keys(ITEM_I18N)) {
  if (!ids.has(id)) fail(`ITEM_I18N has "${id}" but it is not in MENU`);
}

const baseKeys = new Set(Object.keys(T.de));
for (const l of langs) {
  const keys = new Set(Object.keys(T[l] || {}));
  for (const k of baseKeys) if (!keys.has(k)) fail(`T.${l}: missing key "${k}"`);
  for (const k of keys) if (!baseKeys.has(k)) fail(`T.${l}: extra key "${k}" (not in de)`);
}

function expect(cond, msg) { if (!cond) fail(msg); }

for (const [iso, hour, minute, phase] of [
  ['2027-01-02', 23, 30, 'normal'],
  ['2027-01-03', 0, 10, 'advance'],
  ['2027-01-31', 23, 50, 'advance'],
  ['2027-02-01', 0, 10, 'closed'],
  ['2027-02-10', 12, 0, 'closed'],
  ['2027-04-30', 23, 50, 'closed'],
  ['2027-05-01', 0, 10, 'normal'],
]) {
  const got = closurePhase(atZurich(iso, hour, minute));
  expect(got === phase, `${iso} ${hour}:${String(minute).padStart(2, '0')} Zurich: expected ${phase}, got ${got}`);
}

// 23:30 UTC on 2 Jan is already 3 Jan in Zurich (CET, UTC+1) → advance notice.
expect(closurePhase(new Date('2027-01-02T23:30:00Z')) === 'advance', 'Zurich date, not UTC, decides the phase');
expect(closurePhase(new Date('2027-01-02T22:00:00Z')) === 'normal', '22:00 UTC on 2 Jan is still 2 Jan in Zurich');
expect(closurePhase(new Date('2027-04-30T22:30:00Z')) === 'normal', 'after midnight on 1 May Zurich the notice ends');

function findWeekday(wanted, yearMonth) {
  for (let day = 1; day <= 28; day++) {
    const iso = `${yearMonth}-${String(day).padStart(2, '0')}`;
    const at = atZurich(iso, 12, 0);
    const parts = zurichParts(at);
    if (parts.iso === iso && parts.isoWeekday === wanted) return iso;
  }
  fail(`no weekday ${wanted} in ${yearMonth}`);
  return null;
}
const monday = findWeekday(1, '2027-01');
const sunday = findWeekday(7, '2027-01');
expect(shopDayStatus(atZurich(monday, 10, 0)) === 'open', 'weekday morning is still open today');
expect(shopDayStatus(atZurich(monday, 15, 30)) === 'open', 'gap between slots is still open today');
expect(shopDayStatus(atZurich(monday, 19, 59)) === 'open', 'one minute before last close is open today');
expect(shopDayStatus(atZurich(monday, 20, 0)) === 'closed', 'at last close the day is over');
expect(shopDayStatus(atZurich(sunday, 12, 0)) === 'closed', 'Sunday is closed');
expect(closurePhase(atZurich('2027-01-02', 12, 0)) === 'normal', '2 Jan is the last day before the advance notice');
expect(closurePhase(atZurich('2027-01-03', 12, 0)) === 'advance', '3 Jan starts the advance notice');

const queryWins = resolveNow('?today=2027-02-10', '2027-01-10');
expect(queryWins.override && zurichParts(queryWins.now).iso === '2027-02-10', 'query ?today= wins');
expect(zurichParts(queryWins.now).minutes === 12 * 60, 'date-only override is noon Zurich');
expect(closurePhase(queryWins.now) === 'closed', '2027-02-10 is the closed phase');
const fromEnv = resolveNow('', '2027-01-20T21:30');
expect(closurePhase(fromEnv.now) === 'advance', 'VITE_TODAY can set the phase');
expect(shopDayStatus(fromEnv.now) === 'closed', 'VITE_TODAY time is honoured after closing');
const invalid = resolveNow('?today=2027-02-31', '2027-01-16T12:00');
expect(zurichParts(invalid.now).iso === '2027-01-16', 'invalid ?today= falls through to the env date');
expect(!resolveNow('?today=nope', '').override, 'invalid override does not stick');

expect(formatDayMonth(RENOVATION.closedFrom, 'de').includes('Februar'), 'German start date');
expect(formatDayMonth(RENOVATION.closedFrom, 'fr') === '1er février', 'French start date');
expect(formatDayMonth(RENOVATION.closedFrom, 'it').toLowerCase().includes('febbraio'), 'Italian start date');
expect(formatDayMonth(RENOVATION.closedFrom, 'en').includes('February'), 'English start date');

const endPhrase = {
  de: 'Ende April 2027',
  fr: 'fin avril 2027',
  it: 'fine aprile 2027',
  en: 'end of April 2027',
};
const startKeys = ['closure.advance.title', 'closure.advance.body', 'closure.closed.body', 'closure.hours.range'];
for (const l of langs) {
  const blob = ['closure.advance.body', 'closure.closed.body', 'closure.hours.range', 'closure.footer.line']
    .map(k => T[l][k]).join('\n');
  expect(blob.includes(endPhrase[l]), `${l} closure copy must say "${endPhrase[l]}"`);
  expect(!/1\.\s*Mai|1 May|1er mai|1° maggio|1 maggio|May 1|reopens on/i.test(blob), `${l} must not invent a reopening day`);
  for (const k of startKeys) expect(T[l][k].includes('{start}'), `${l} ${k} must take the start date from config`);
}

const rawHtml = readFileSync('index.html', 'utf8');
expect(rawHtml.includes('__RENOVATION_CLOSED_FROM__') && rawHtml.includes('__RENOVATION_CLOSED_THROUGH__'),
  'index.html closure dates must be placeholders filled from config');
expect(!rawHtml.includes('2027-05-01'), 'JSON-LD must not name 1 May as a reopening date');
const html = applyClosureJsonLd(rawHtml);
const jsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
expect(jsonMatch, 'JSON-LD block missing');
let jsonLd;
try { jsonLd = JSON.parse(jsonMatch[1]); }
catch (e) { fail(`JSON-LD does not parse after date injection: ${e.message}`); }
const special = jsonLd && (Array.isArray(jsonLd.specialOpeningHoursSpecification)
  ? jsonLd.specialOpeningHoursSpecification[0]
  : jsonLd.specialOpeningHoursSpecification);
expect(special, 'specialOpeningHoursSpecification missing');
expect(special.validFrom === RENOVATION.closedFrom, `JSON-LD validFrom should be ${RENOVATION.closedFrom}`);
expect(special.validThrough === RENOVATION.closedThrough, `JSON-LD validThrough should be ${RENOVATION.closedThrough}`);
expect(special.opens === '00:00' && special.closes === '00:00', 'JSON-LD closure must be closed all day (00:00–00:00)');

if (errors.length) {
  console.error(`${errors.length} problem(s):\n` + errors.map(e => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`OK: ${ids.size} menu items, ${langs.length} languages, ${baseKeys.size} UI keys, closure dates checked.`);
