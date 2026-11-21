// Date logic for the renovation closure and the "open today" header line.
// Dates live in src/config.js. Compare calendar days in Europe/Zurich, not UTC.
import { HOURS_SLOTS, OPEN_WEEKDAYS, RENOVATION } from './config.js';

const ZONE = 'Europe/Zurich';
const WEEKDAY_ISO = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
const DAY_MONTH_LOCALE = { de: 'de-CH', fr: 'fr-CH', it: 'it-CH', en: 'en-GB' };

export function zurichParts(date) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  });
  const bag = {};
  for (const part of dtf.formatToParts(date)) bag[part.type] = part.value;
  let hour = Number(bag.hour);
  if (hour === 24) hour = 0;
  return {
    iso: `${bag.year}-${bag.month}-${bag.day}`,
    minutes: hour * 60 + Number(bag.minute),
    isoWeekday: WEEKDAY_ISO[bag.weekday],
  };
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Last dining-room close, in minutes from midnight. Derived from HOURS_SLOTS. */
export function lastCloseMinutes() {
  return HOURS_SLOTS.reduce((max, [, end]) => Math.max(max, toMinutes(end)), -1);
}

/** A Date whose Europe/Zurich clock reads the given calendar day and time. */
export function atZurich(iso, hour, minute) {
  const [y, m, d] = iso.split('-').map(Number);
  let utc = Date.UTC(y, m - 1, d, hour - 1, minute, 0);
  const target = hour * 60 + minute;
  for (let i = 0; i < 4; i++) {
    const got = zurichParts(new Date(utc));
    const dayDelta = Math.round(
      (Date.parse(`${got.iso}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)) / 86400000
    );
    const minDelta = dayDelta * 1440 + (got.minutes - target);
    if (minDelta === 0) return new Date(utc);
    utc -= minDelta * 60 * 1000;
  }
  return new Date(utc);
}

/**
 * 'normal' | 'advance' | 'closed', from the Zurich calendar day of `now`.
 * advance: shop still open, notice is up. closed: no walk-in or pickup.
 */
export function closurePhase(now) {
  const iso = zurichParts(now).iso;
  if (iso < RENOVATION.noticeFrom) return 'normal';
  if (iso < RENOVATION.closedFrom) return 'advance';
  if (iso <= RENOVATION.closedThrough) return 'closed';
  return 'normal';
}

/**
 * 'open' when today is an open weekday and the last slot has not ended yet.
 * Before the first slot the shop is still "open today". After the last close,
 * and on any day not in OPEN_WEEKDAYS (Sunday), it is 'closed'.
 */
export function shopDayStatus(now) {
  const { minutes, isoWeekday } = zurichParts(now);
  if (!OPEN_WEEKDAYS.includes(isoWeekday)) return 'closed';
  const close = lastCloseMinutes();
  if (close < 0 || minutes >= close) return 'closed';
  return 'open';
}

const TODAY_RE = /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2}))?$/;

export function parseTodayOverride(raw) {
  if (!raw || !TODAY_RE.test(raw)) return null;
  const match = raw.match(TODAY_RE);
  const iso = match[1];
  const [y, m, d] = iso.split('-').map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) return null;
  if (match[2] == null) return atZurich(iso, 12, 0);
  const hour = Number(match[2]);
  const minute = Number(match[3]);
  if (hour > 23 || minute > 59) return null;
  return atZurich(iso, hour, minute);
}

export function readTodayParam(search) {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return q.get('today') || '';
}

/**
 * Clock used by the page. `?today=YYYY-MM-DD` or `YYYY-MM-DDTHH:mm` wins,
 * then the VITE_TODAY env value, then the real clock. A date with no time
 * is evaluated at 12:00 Europe/Zurich.
 */
export function resolveNow(search = '', envToday = '') {
  const fromQuery = parseTodayOverride(readTodayParam(search));
  if (fromQuery) return { now: fromQuery, override: true };
  const fromEnv = parseTodayOverride(envToday);
  if (fromEnv) return { now: fromEnv, override: true };
  return { now: new Date(), override: false };
}

/** "1. Februar" / "1 February" — the closure start, from RENOVATION.closedFrom. */
export function formatDayMonth(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const formatted = new Intl.DateTimeFormat(DAY_MONTH_LOCALE[lang] || 'de-CH', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
  // fr-CH formats the 1st as "1 février"; French wants "1er février".
  if (lang === 'fr' && d === 1) return formatted.replace(/^1(?!\d)/, '1er');
  return formatted;
}

/** Fill index.html JSON-LD placeholders from RENOVATION. Shared with Vite. */
export function applyClosureJsonLd(html) {
  return html
    .replaceAll('__RENOVATION_CLOSED_FROM__', RENOVATION.closedFrom)
    .replaceAll('__RENOVATION_CLOSED_THROUGH__', RENOVATION.closedThrough);
}
