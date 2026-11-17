# Developer Guide

Everything a developer needs to take over the Hiraya website. Start with the [README](../README.md) for setup.

## 1. What this is

A static single-page marketing site, built with React 18 and Vite 5. It has no server, database, CMS, analytics or checkout. Ordering is handed off to Just Eat and Uber Eats through outbound links.

The site is multilingual (DE, FR, IT, EN). It picks the language from the browser, falls back to German, and remembers the visitor's choice in `localStorage` (`hiraya-lang`). A splash intro plays once per browser session (`sessionStorage` key `splash-seen`).

## 2. Code map

| File | Role |
|---|---|
| `index.html` | HTML shell. SEO and Open Graph tags (German), Google Fonts (Instrument Serif, Familjen Grotesk, DM Mono). |
| `src/main.jsx` | Mounts `<Website />` and loads `tokens.css`. |
| `src/components/website.jsx` (~1300 lines) | **Almost everything**: the `MENU` data, all page sections, ordering links, and the `Website` root component. |
| `src/i18n.js` (~790 lines) | `T` (UI strings per language), `MENU_I18N` (category labels and intros), `ITEM_I18N` (per-dish translations), the `t()` helper and the `useLang()` hook. |
| `src/components/system.jsx` | `Inabel`: the woven Filipino textile band used as a decorative divider. |
| `src/components/marks.jsx` | `DualGlyph`: logo glyph. |
| `src/tokens.css` | CSS variables (colours, fonts, radii), utility classes and keyframes. |

### Page structure

`Website` renders these sections in order:

`SplashIntro` → `Nav` → `Hero` → `MarqueeStrip` → `FusionStory` → `Menu` → `HowToOrder` → `LocationBlock` → `Catering` → `Story` → `Footer`

A `Featured` component exists in the file but is not rendered (dead code with a placeholder image).

### Conventions

- **Styling** is mostly inline `style={{…}}` objects that use the CSS variables from `tokens.css`. There is no CSS framework and no CSS modules.
- **Responsive** behaviour uses the `useIsMobile()` hook (breakpoint 768px), not media queries.
- **Scroll reveal** animation uses the `useReveal()` hook (IntersectionObserver).
- **Rich text**: i18n keys ending in `.html` are rendered through `<Rich>`, where `<i>…</i>` is coloured with the accent colour.
- **Brand tokens**: paper `#f4ead6`, ink `#1a1410`, clay `#c2492a`, saffron `#e5a430`, moss `#5b6c3a`, teal `#1d3a3f`. The `--tx-*` colours come from the Inabel weaving pattern.

## 3. The menu data model

Menu items are defined in two places that must stay in sync.

**`MENU` in `website.jsx`** holds four categories (`starters`, `rolls`, `sets`, `poke`) and 29 items in total. Each item looks like this:

```js
{ id: 'roll-dyn', name: 'Dynamite Roll', ingredients: 'Lachs · Mango · …',
  price: 10.50, priceFrom: true, kind: 'maki', tags: ['spicy','bestseller'],
  teaser: true, img: '/menu/roll-dyn.webp', cooking: 'R' }
```

| Field | Meaning |
|---|---|
| `id` | Unique key. **Must match a key in `ITEM_I18N`.** |
| `name`, `ingredients` | German base text, used as the fallback. |
| `price` | CHF number. `priceFrom: true` shows "ab / from". |
| `kind` | `side`, `maki`, `set`, `bowl` or `bento`. |
| `tags` | `bestseller`, `spicy`, `veg`, `vegan` (defined in `TAG_DEFS`). |
| `teaser` | The one item shown when the category is collapsed. If none is set, the first item is used. |
| `cooking` | `R` raw, `G` cooked, `F` flambéed (legend shown in the menu section). |
| `img` | Path under `public/`. If it is missing, a `FoodPlaceholder` is shown. |

**`ITEM_I18N` in `i18n.js`** is keyed by `id`, then by language, and gives `{ name, ingredients, desc }`. Category titles and intros are in `MENU_I18N`.

At the time of writing, every item id in `MENU` has a matching `ITEM_I18N` entry.

## 4. Common tasks

### Change a price or ingredient
1. Edit the item in `MENU` (`website.jsx`).
2. If ingredients changed, also edit all four languages in `ITEM_I18N`.
3. Prices must match Just Eat and Uber Eats, which are the source of truth.
4. A "from" price on a roll is the smallest piece-count variant, so check it against the delivery platforms.

### Add a dish
1. Add a photo (see "Images" below).
2. Add an entry to the right category in `MENU` with a **new unique id**.
3. Add `ITEM_I18N['<id>']` with all four languages.
4. Run `npm run build`, then check it with `npm run dev`.

### Remove a dish
Delete it from `MENU` and `ITEM_I18N`. Removed items are tracked in `docs/archive/` so they can be reintroduced later.

### Change UI text
Find the key in `T` in `i18n.js` and edit it in **all four languages**. A missing key falls back to German, then to the raw key name, which would show on the page.

### Change opening hours, phone, email, delivery terms
These are not in one place. After changing them, search the code for the old value.

| Item | Where |
|---|---|
| Hours `11:30–14 · 17–20`, Mon–Sat | `bar.openToday` and `loc.hours.*` in all 4 languages, plus `website.jsx` (location block and footer) |
| Phone `078 606 11 36` | `website.jsx`: `tel:` links in the location block and footer |
| Email `info@hiraya.ch` | `website.jsx`: catering section and footer |
| Address (Paradiesstrasse 2, 4102 Binningen) | `loc.address.*`, the Google Maps embed and link URLs in `website.jsx` |
| Delivery "Ø 25 min", "Min. CHF 30" | `hero.delivery`, `hero.minOrder`, `menu.cta.body` (all 4 languages) |
| Just Eat / Uber Eats URLs | Constants `JUST_EAT_URL` and `UBER_EATS_URL` at the top of `website.jsx` |
| Instagram / Facebook | Footer in `website.jsx` |

### Images
- The optimised `.webp` files in `public/menu/` are what the site uses. Reference them as `/menu/<name>.webp`.
- Full-size originals are in `public/originals/` (PNG/JPG). `sharp` is a dependency for converting them, but the repo has no conversion script, so use a one-off Node script or any image tool, then commit the `.webp`.
- Chef and storefront photos are `public/chef-gher.webp` and `public/hiraya-storefront.webp`.

## 5. Deployment

- Hosting is **GitHub Pages** with the custom domain **hiraya.ch** (`CNAME` in the repo root and in `public/`).
- `.github/workflows/deploy.yml` runs on every push to `main` and can also be started by hand (`workflow_dispatch`). It uses Node 20, `npm ci`, `npm run build`, then `actions/deploy-pages`.
- Check the **Actions** tab on GitHub if the live site does not update.
- Vite `base` is `/`, so the site only works at a domain root (a custom domain, not a `username.github.io/repo` path).
- There is no staging environment. Use `npm run preview` locally before merging.

## 6. Known issues and cleanup candidates

1. **`public/originals/` is deployed to production.** Vite copies all of `public/`, so the built `dist/` is about 82 MB and the full-size originals are publicly downloadable. Move them out of `public/` (for example to a top-level `assets-src/`). The site only needs the `.webp` files.
2. **Menu data lives inside the component file.** Moving `MENU` into its own `src/menu.js` would make price updates safer.
3. **Contact details and hours are duplicated** in many places (see the table above). Consider a single config object.
4. **`Featured` is dead code.**
5. **Heavy, mostly unneeded dependencies**: `playwright` and `puppeteer` are only used by `docs/archive/generate_pdf.mjs`. Every `npm ci` installs them.
6. **Unreferenced images**: `public/menu/set-mix1.webp`, `public/menu/set-mix3.webp`, `public/gerwin.webp`, and the duplicate `public/menu/set-sho.png` (the site uses `set-sho.webp`).
7. **No tests, no linter, no analytics, no cookie banner.** Fine for a static site. The site also has no imprint or privacy page; ask the owner whether one is needed.
8. **SEO and language**: the `index.html` meta tags are German only, and language switching is client-side, so search engines see only the German shell.
9. **Menu archive files** in `docs/archive/` are historical and may not match the live menu.

## 7. History

The repo has about 65 commits, all by one author, starting 2026-05-15. Many are "Add files via upload" (images added through the GitHub web UI). Major steps:

1. Initial site with an original menu of 8 rolls, 4 poke bowls and 5 sets (archived in [original-website-menu-2026-05.md](archive/original-website-menu-2026-05.md)).
2. 2026-05-18: menu replaced with the real Just Eat listing, then curated to 29 items ([renovation plan](archive/menu-renovation-plan-2026-05.md)).
3. Photos converted to WebP, real hero and chef photos, four languages, Uber Eats added alongside Just Eat, prices synced with Uber Eats (latest commit).
