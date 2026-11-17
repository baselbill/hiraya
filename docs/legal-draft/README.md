# Legal page draft (Impressum + Datenschutz)

`legal.html` is a **draft, not legal advice, and not published**. It is deliberately outside `public/`, so it is not deployed. It is written in German and English. Add French and Italian if the owner wants all four site languages covered.

## What the owner must provide

Every `[[PLACEHOLDER]]` in `legal.html`:

| Needed | Used in |
|---|---|
| Legal business name and form (GmbH, sole proprietor, …) and the owner or authorised person | Impressum |
| UID (CHE-xxx.xxx.xxx), commercial register entry if any, VAT number if VAT-registered | Impressum |
| Who holds the rights to the photos and texts (the restaurant, a photographer, the chef) | Copyright |
| Date of the privacy statement | Datenschutz |
| Decision on two optional improvements (below) | Datenschutz §4, §5 |

Switzerland has no general imprint law like Germany's, but an identifiable operator (UWG Art. 3) and a privacy statement (nDSG, in force since 2023-09-01) are expected, especially because the site loads Google Fonts and an embedded Google Map. Have the finished text checked by someone qualified (a lawyer, or the owner's trade association or accountant).

## What the draft says about the current site (verified from the code)

- No forms, accounts, payments, analytics or cookies set by the site itself.
- Hosted on GitHub Pages, so GitHub processes visitor IP addresses.
- Google Fonts are loaded from Google (`index.html`), and a Google Maps iframe is embedded (`website.jsx`, location block). Both send the visitor's IP address to Google.
- `localStorage` key `hiraya-lang` and `sessionStorage` key `splash-seen` hold only the language and a flag.
- If any of this changes (analytics added, a contact form, a newsletter, Google Fonts self-hosted), update the text.

## Optional improvements that shorten the privacy text

1. **Self-host the fonts** (Instrument Serif, Familjen Grotesk, DM Mono). Then no visitor data goes to Google Fonts, and §4 can be deleted.
2. **Load the map only after a click.** Then no data goes to Google until the visitor asks for it. Edit §5 accordingly.

## How to publish once filled in

1. Fill every placeholder. Delete the `DRAFT` comment at the top and the `<meta name="robots" content="noindex" />` line.
2. Copy the file to `public/legal.html`. `npm run check` fails while any `[[…]]` placeholder is left in it, and CI and the deploy workflow run that check.
3. Add a footer link in `src/components/website.jsx` (Footer, next to the contact links) pointing at `/legal.html`. Add the label as a new key (for example `footer.legal`: "Impressum & Datenschutz" / "Mentions légales" / "Note legali" / "Legal notice & privacy") to all four languages in `src/i18n.js`. `npm run check` verifies that all four have it.
4. Add `<url><loc>https://hiraya.ch/legal.html</loc></url>` to `public/sitemap.xml`.
5. Run `npm run check` and `npm run build`, open the pull request, merge.
6. Update `docs/HANDOFF_CHECKLIST.md` (legal page item) and the "No imprint or privacy page" entry in `docs/DEVELOPER_GUIDE.md` section 6.
