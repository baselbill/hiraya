# Developer Guide

Everything a developer needs to take over the Hiraya website. Start with the [README](../README.md) for setup.

## 1. What this is

A static single-page marketing site, built with React 18 and Vite 5. It has no server, database, CMS, analytics or checkout. Ordering is handed off to Just Eat and Uber Eats through outbound links.

The site is multilingual (DE, FR, IT, EN). It picks the language from the browser, falls back to German, and remembers the visitor's choice in `localStorage` (`hiraya-lang`). A splash intro plays once per browser session (`sessionStorage` key `splash-seen`).

## 2. Code map

| File | Role |
|---|---|
| `index.html` | HTML shell. SEO and Open Graph tags (German), JSON-LD restaurant markup, Google Fonts (Instrument Serif, Familjen Grotesk, DM Mono). |
| `src/main.jsx` | Mounts `<Website />` and loads `tokens.css`. |
| `src/menu.js` | The menu: `MENU` with all 29 dishes (German base text, prices, tags, photo paths). |
| `src/config.js` | Phone, email, address, map links, opening hours, Just Eat / Uber Eats / social URLs. |
| `src/components/website.jsx` (~1200 lines) | All page sections, the ordering links and the `Website` root component. |
| `src/i18n.js` (~790 lines) | `T` (UI strings per language), `MENU_I18N` (category labels and intros), `ITEM_I18N` (per-dish translations), the `t()` helper and the `useLang()` hook. |
| `src/components/system.jsx` | `Inabel`: the woven Filipino textile band used as a decorative divider. |
| `src/components/marks.jsx` | `DualGlyph`: logo glyph. |
| `src/tokens.css` | CSS variables (colours, fonts, radii), utility classes and keyframes. |

### Page structure

`Website` renders these sections in order:

`SplashIntro` → `Nav` → `Hero` → `MarqueeStrip` → `FusionStory` → `Menu` → `HowToOrder` → `LocationBlock` → `Catering` → `Story` → `Footer`


### Conventions

- **Styling** is mostly inline `style={{…}}` objects that use the CSS variables from `tokens.css`. There is no CSS framework and no CSS modules.
- **Responsive** behaviour uses the `useIsMobile()` hook (breakpoint 768px), not media queries.
- **Scroll reveal** animation uses the `useReveal()` hook (IntersectionObserver).
- **Rich text**: i18n keys ending in `.html` are rendered through `<Rich>`, where `<i>…</i>` is coloured with the accent colour.
- **Brand tokens**: paper `#f4ead6`, ink `#1a1410`, clay `#c2492a`, saffron `#e5a430`, moss `#5b6c3a`, teal `#1d3a3f`. The `--tx-*` colours come from the Inabel weaving pattern.

## 3. The menu data model

Menu items are defined in two places that must stay in sync.

**`MENU` in `src/menu.js`** holds four categories (`starters`, `rolls`, `sets`, `poke`) and 29 items in total. Each item looks like this:

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

`npm run check` fails if an item id is missing from `ITEM_I18N` (or the reverse), if a translation field is empty, or if a photo file does not exist.

## 4. Common tasks

### Change a price or ingredient
1. Edit the item in `MENU` (`src/menu.js`).
2. If ingredients changed, also edit all four languages in `ITEM_I18N`.
3. Prices must match Just Eat and Uber Eats, which are the source of truth.
4. A "from" price on a roll is the smallest piece-count variant, so check it against the delivery platforms.

### Add a dish
1. Add a photo (see "Images" below).
2. Add an entry to the right category in `MENU` with a **new unique id**.
3. Add `ITEM_I18N['<id>']` with all four languages.
4. Run `npm run check` (catches a missing translation or photo) and `npm run build`, then look at it with `npm run dev`.

### Remove a dish
Delete it from `MENU` and `ITEM_I18N`. Removed items are tracked in `docs/archive/` so they can be reintroduced later.

### Change UI text
Find the key in `T` in `i18n.js` and edit it in **all four languages**. `npm run check` fails if the four languages do not have the same keys. (At runtime a missing key falls back to German, then to the raw key name.)

### Change opening hours, phone, email, address, links
Edit **`src/config.js`**. It is used by the page and by the translated "open today" text. Three things are not covered by it, so check them after a change:

| Item | Where |
|---|---|
| Day range ("Mo–Sa") and "closed Sunday" | `loc.hours.days` / `loc.hours.closed` in all 4 languages in `i18n.js` |
| Search-engine markup (address, phone, hours, links) | JSON-LD block in `index.html` |
| Delivery claims "Ø 25 min", "Min. CHF 30", delivery area | Translated prose: `hero.delivery`, `hero.minOrder`, `menu.cta.body`, `how.s3.body`, `loc.hint` in all 4 languages |

### Images
- The optimised `.webp` files in `public/menu/` are what the site uses. Reference them as `/menu/<name>.webp`.
- Full-size originals live in `assets-src/originals/` (PNG/JPG). They are **not** published. Put a new original there, then run `npm run images -- <name>` (for example `npm run images -- roll-dyn`) to write `public/menu/<name>.webp`. `npm run images -- --all` converts every original.
- Then set the item's `img` in `src/menu.js` and run `npm run check`.
- Chef and storefront photos are `public/chef-gher.webp` and `public/hiraya-storefront.webp`.

## 5. Deployment

- Hosting is **GitHub Pages** with the custom domain **hiraya.ch** (`CNAME` in the repo root and in `public/`).
- `.github/workflows/deploy.yml` runs on every push to `main` and can also be started by hand (`workflow_dispatch`). It uses Node 20, `npm ci`, `npm run build`, then `actions/deploy-pages`.
- Pull requests run `.github/workflows/ci.yml` (`npm run check` and `npm run build`). The deploy workflow also runs `npm run check` before building, so a broken translation or missing photo blocks a deploy.
- Check the **Actions** tab on GitHub if the live site does not update.
- Vite `base` is `/`, so the site only works at a domain root (a custom domain, not a `username.github.io/repo` path).
- There is no staging environment. Use `npm run preview` locally before merging.

## 6. Known issues and possible next steps

Fixed during handoff (2026-11): full-size originals no longer published (moved to `assets-src/`), unused images and the dead `Featured` component removed, menu split into `src/menu.js`, contact details and hours centralised in `src/config.js`, unused dev dependencies removed, a consistency check and pull-request CI added, `<html lang>` follows the language selector, JSON-LD, `robots.txt` and `sitemap.xml` added.

Still open:

1. **No imprint or privacy page.** Needs legal details from the owner (see the handoff checklist). Required if analytics or similar are ever added.
2. **Originals remain in git history.** The repository is about 77 MB because of past commits of full-size photos. Rewriting history would fix it but is disruptive and was deliberately not done. If the repository is public, the originals are downloadable from GitHub.
3. **Delivery claims are translated prose** (see the table in section 4) and are not covered by `config.js`.
4. **JSON-LD in `index.html` duplicates `config.js`** (static HTML cannot import it). Update both together.
5. **Language is client-side.** Search engines see the German shell only. Real fixes (pre-rendering, per-language URLs) would be a larger rebuild and are probably not worth it for a one-page local site.
6. **`ITEM_I18N` and `MENU` are separate structures.** `npm run check` guards the link between them, but merging them would be tidier.
7. **`docs/archive/`** is historical and may not match the live menu.
8. **No linter, analytics or cookie banner.** Fine for a static site.

## 7. History

The repo has about 65 commits, all by one author, starting 2026-05-15. Many are "Add files via upload" (images added through the GitHub web UI). Major steps:

1. Initial site with an original menu of 8 rolls, 4 poke bowls and 5 sets (archived in [original-website-menu-2026-05.md](archive/original-website-menu-2026-05.md)).
2. 2026-05-18: menu replaced with the real Just Eat listing, then curated to 29 items ([renovation plan](archive/menu-renovation-plan-2026-05.md)).
3. Photos converted to WebP, real hero and chef photos, four languages, Uber Eats added alongside Just Eat, prices synced with Uber Eats (latest commit).
4. Handoff cleanup (see section 6): documentation, `src/menu.js`, `src/config.js`, `npm run check`, CI, and removal of the published originals.
