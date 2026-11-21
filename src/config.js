// Single source of truth for restaurant contact details, opening hours and outbound links.
// index.html also carries a copy of these facts as JSON-LD (search-engine markup); update it too.
// Edit here, not in website.jsx / i18n.js. Delivery terms ("Ø 25 min", "Min. CHF 30") are
// translated prose in i18n.js (keys hero.delivery, hero.minOrder, menu.cta.body, how.s3.body).

export const JUST_EAT_URL = 'https://www.just-eat.ch/en/menu/hiraya-asian-fusion-sushi';
export const UBER_EATS_URL = 'https://www.ubereats.com/ch/store/hiraya-asian-fusion-sushi/uEHR2Y59RlCMq_zwBLf5_g';

export const PHONE_DISPLAY = '078 606 11 36';
export const PHONE_TEL = '+41786061136';
export const EMAIL = 'info@hiraya.ch';

export const STREET = 'Paradiesstrasse 2';
export const POSTAL_CITY = '4102 Binningen';
export const MAPS_URL = 'https://maps.google.com/?q=Paradiesstrasse+2,+4102+Binningen';
export const MAPS_EMBED_URL = 'https://maps.google.com/maps?q=Hiraya+Asian+Fusion+Sushi,+Paradiesstrasse+2,+4102+Binningen,+Switzerland&output=embed&z=17';

export const INSTAGRAM_URL = 'https://www.instagram.com/hiraya.basel';
export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61585498220987';

// Dining-room hours. ISO weekdays: 1 = Monday … 7 = Sunday. The header "open today" line
// is computed from these in Europe/Zurich (see src/closure.js). The translated
// "Mo–Sa" / "closed Sunday" labels in i18n.js (loc.hours.days / loc.hours.closed)
// must still be updated if the open days change.
export const OPEN_WEEKDAYS = [1, 2, 3, 4, 5, 6];
export const HOURS_SLOTS = [['11:30', '14:00'], ['17:00', '20:00']];

// Shop closure for renovation. Inclusive calendar dates, compared in Europe/Zurich.
// noticeFrom–the day before closedFrom: advance notice (shop still open).
// closedFrom–closedThrough: dining room closed, delivery only.
// The next day the site goes back to normal on its own. Customer copy says
// "end of April 2027" and must not name a reopening day.
export const RENOVATION = {
  noticeFrom: '2027-01-15',
  closedFrom: '2027-02-01',
  closedThrough: '2027-04-30',
};
// "11:30–14 · 17–20"
export const HOURS_SHORT = HOURS_SLOTS.map(([a, b]) => `${a}–${b}`.replace(/:00/g, '')).join(' · ');
// "11:30–14:00   17:00–20:00"
export const HOURS_LONG = HOURS_SLOTS.map(([a, b]) => `${a}–${b}`).join(' \u00a0 ');
