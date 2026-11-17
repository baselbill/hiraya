# Handoff Checklist

Use this to complete the handover of the Hiraya website. Items marked **TO CONFIRM** could not be determined from the repository, so the person handing over needs to fill them in. Do not write passwords in this file; it is stored in a repository.

## 1. Accounts and ownership

| Asset | Current state | Action |
|---|---|---|
| GitHub repository `baselbill/hiraya` | Under the personal account `baselbill`; all 65 commits by that account | Transfer to an owner-controlled account or organisation, or add the owner as admin. **TO CONFIRM** |
| GitHub Pages hosting | Enabled via `.github/workflows/deploy.yml` | Pages settings travel with the repo when it is transferred. After the transfer, check Settings → Pages and confirm that the custom domain is still **hiraya.ch** and that HTTPS is enforced. |
| Domain `hiraya.ch` | Points at GitHub Pages (`CNAME`) | Registrar: **TO CONFIRM**. Registered owner: **TO CONFIRM**. Renewal date: **TO CONFIRM**. Renewal email: **TO CONFIRM** |
| DNS records | Not visible from the repo | Record where DNS is managed and export the current records. **TO CONFIRM** |
| Business email `info@hiraya.ch` | Used on the site | Who hosts it and who has access? **TO CONFIRM** |
| Just Eat restaurant account | Menu source of truth | Owner has the login? **TO CONFIRM** |
| Uber Eats restaurant account | Menu source of truth | Owner has the login? **TO CONFIRM** |
| Instagram `hiraya.basel`, Facebook page | Linked in the footer | Owner has admin access? **TO CONFIRM** |
| Google Maps listing | Linked and embedded on the site | Owner has the business profile? **TO CONFIRM** |
| Developer who maintains the site after handover | | **TO CONFIRM** |

Third-party services used by the site, none of which need an account: Google Fonts, Google Maps embed. There are no API keys, secrets or environment variables in the project.

## 2. Verification steps for the receiving developer

- [ ] `git clone https://github.com/baselbill/hiraya && cd hiraya && npm ci && npm run check && npm run build` succeeds.
- [ ] `npm run dev` shows the site in all four languages.
- [ ] A pull request shows a green "CI" check, and a test change builds and, once merged to `main`, appears on https://hiraya.ch after the Actions run.
- [ ] Settings → Pages shows the custom domain and "Enforce HTTPS" is on.
- [ ] Order buttons open the correct Just Eat and Uber Eats pages.
- [ ] Phone, email and map links work.

## 3. Content to verify with the owner

- [ ] Opening hours: the site says Mon–Sat, 11:30–14:00 and 17:00–20:00, closed Sunday.
- [ ] Delivery claims: "Ø 25 min", "Min. CHF 30", "Lieferung im Umkreis Binningen".
- [ ] Founding year: the site says 2025.
- [ ] Chef story text and photos are approved by the owner and chef.
- [ ] All 29 website prices match Just Eat and Uber Eats (last synced in the most recent commit, "Sync menu prices with Uber Eats").
- [ ] Allergen information: the site shows no allergen details. Confirm that this is acceptable.
- [ ] Imprint and privacy notice: the site has none. Confirm whether one is required.
- [ ] Photo rights: confirm the restaurant owns or is licensed to use all photos, including `gerwin` and the storefront picture.

## 4. Known issues to hand over

Most issues found during handoff review were fixed (see [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md#6-known-issues-and-possible-next-steps)). What remains:

1. **Imprint and privacy page**: missing. To write one the owner must provide: legal business name and form, registered address, owner/managing person, contact email, UID/VAT number if registered, and a decision on whether the site will ever use analytics, forms or cookies.
2. **Original photos are still in git history** (repository about 77 MB). They are no longer on the website. If the GitHub repository is public they are downloadable from there; the owner should decide whether the repository should be private.
3. **Delivery claims** ("Ø 25 min", "Min. CHF 30") are text in four languages and must be updated by hand if they change.

## 5. Documentation map

| File | Audience |
|---|---|
| [README.md](../README.md) | Anyone, entry point |
| [OWNER_GUIDE.md](OWNER_GUIDE.md) | Non-technical owner |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | Developer |
| [archive/](archive) | Historical menus and the marketing consultation (PDF and HTML) |
| [../CLAUDE.md](../CLAUDE.md) | AI coding assistants |
