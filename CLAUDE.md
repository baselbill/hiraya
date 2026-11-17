# Hiraya website: notes for Claude / AI assistants

Single-page React + Vite site for a sushi restaurant, deployed to GitHub Pages (hiraya.ch). Read [README.md](README.md) and [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) first.

- Menu data lives in `MENU` in `src/components/website.jsx` (German base text, prices). Translations live in `ITEM_I18N` in `src/i18n.js`. **Every item id must exist in both.**
- All UI strings go through `t(lang, key)`; add a key to all four languages (de, fr, it, en) in `T`.
- Prices must match Just Eat and Uber Eats, which are the source of truth for ordering.
- Pushing to `main` deploys to production. Work on a branch and open a PR unless told otherwise.
- Restaurant contact details (phone, email, address, hours) are hard-coded in `website.jsx` and `i18n.js`.
- Verify changes with `npm run build`. There are no tests.
- Archived menus and strategy documents are in `docs/archive/`; they are reference only.
