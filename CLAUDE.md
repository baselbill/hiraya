# Hiraya website: notes for Claude / AI assistants

Single-page React + Vite site for a sushi restaurant, deployed to Cloudflare Pages (hiraya.ch). Read [README.md](README.md) and [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) first.

- Menu data lives in `src/menu.js` (German base text, prices). Translations live in `ITEM_I18N` in `src/i18n.js`. **Every item id must exist in both.**
- All UI strings go through `t(lang, key)`; add a key to all four languages (de, fr, it, en) in `T`.
- Prices must match Just Eat and Uber Eats, which are the source of truth for ordering.
- Pushing to `main` deploys to production (Cloudflare Pages builds `npm run check && npm run build`). Work on a branch and open a PR unless told otherwise.
- Phone, email, address, hours and ordering/social links live in `src/config.js`. `index.html` has a JSON-LD copy to keep in sync. Delivery claims are translated prose in `i18n.js`.
- Verify changes with `npm run check` (menu/translation/image/UI-key consistency) and `npm run build`. Full-size photos go in `assets-src/originals/` (not published); convert with `npm run images -- <name>`.
- Archived menus and strategy documents are in `docs/archive/`; they are reference only.
