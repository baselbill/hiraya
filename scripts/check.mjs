// Consistency checks for content that is easy to break by hand. Run: npm run check
//  - every menu item has a translation in all four languages (and vice versa)
//  - every menu image exists in public/
//  - every language defines the same UI text keys
//  - every menu category has labels in all four languages
import { existsSync } from 'fs';
import { join } from 'path';
import { MENU } from '../src/menu.js';
import { T, ITEM_I18N, MENU_I18N, LANG_LIST } from '../src/i18n.js';

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

if (errors.length) {
  console.error(`${errors.length} problem(s):\n` + errors.map(e => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`OK: ${ids.size} menu items, ${langs.length} languages, ${baseKeys.size} UI keys.`);
