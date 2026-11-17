# Hiraya website

Marketing website for **Hiraya Asian Fusion Sushi**, a Filipino-Japanese fusion sushi and poke restaurant in Binningen (Basel), Switzerland. Live at **https://hiraya.ch**.

It is a single-page site in four languages (DE, FR, IT, EN). Customers read the menu here, then order through **Just Eat** or **Uber Eats**. The site has no checkout, database or backend.

| Document | For | Contents |
|---|---|---|
| [docs/OWNER_GUIDE.md](docs/OWNER_GUIDE.md) | Owner (non-technical) | What the website is, what it costs, who can change what, how to request changes |
| [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) | Developer | Architecture, code map, how to make common changes |
| [docs/HANDOFF_CHECKLIST.md](docs/HANDOFF_CHECKLIST.md) | Both | Accounts, access, domain, known issues, open items |
| [docs/archive/](docs/archive) | Reference | Old menus, menu strategy report, brainstorm |

## Quick start

Requires Node 20 or newer.

```bash
npm ci
npm run dev       # local dev server (Vite), usually http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run check     # consistency checks: menu <-> translations <-> images, UI keys in all 4 languages
npm run images -- <name>   # convert a photo from assets-src/originals to public/ as .webp
```

`npm run check` is the only automated test. It runs on every pull request and before every deploy.

## Tech stack

React 18 and Vite 5, plain CSS variables and inline styles. (Dev-only: `sharp` for image conversion.) There is no router, state library or CSS framework. Hosting is GitHub Pages on the custom domain hiraya.ch.

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which runs `npm ci`, then `npm run build`, then publishes `dist/` to GitHub Pages. Nothing else is needed. See the [developer guide](docs/DEVELOPER_GUIDE.md#deployment).

## Repository layout

```
index.html              page shell, SEO/social meta tags, Google Fonts
src/main.jsx            React entry point
src/menu.js            the menu: dishes, prices, tags, photos (German base text)
src/config.js          phone, email, address, hours, ordering and social links
src/i18n.js            all UI text and menu translations (DE/FR/IT/EN)
src/components/website.jsx   all page sections
src/components/system.jsx    Inabel textile pattern decoration
src/components/marks.jsx     logo glyph
src/tokens.css         colours, fonts, global CSS
public/                images (optimised .webp), robots.txt, sitemap.xml, CNAME
assets-src/originals/  full-size source photos (NOT published)
scripts/               check.mjs (consistency checks), optimize-images.mjs
docs/                  handoff documentation
```
