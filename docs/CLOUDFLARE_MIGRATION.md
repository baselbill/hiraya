# Moving hosting from GitHub Pages to Cloudflare Pages

Why: GitHub Pages cannot serve from a private repository on a free GitHub plan. Cloudflare Pages is free, supports private repositories, and the site stays public. Cloudflare Pages is free as of writing; check Cloudflare's current free-tier terms before starting.

This is done in two stages so that the live site is never at risk:

1. **Stage 1: prepare and test** on a temporary `*.pages.dev` address. The live site (GitHub Pages, hiraya.ch) is untouched.
2. **Stage 2: cut over** the domain, then retire GitHub Pages.

The repository changes for Cloudflare are on the branch `cutover-cloudflare`. **Do not merge it until step 12.** Before then, `main` must keep deploying to GitHub Pages, because that is the live site.

Who: the account owner (the restaurant owner, ideally) for Cloudflare. Whoever holds the Namecheap login for the DNS steps. Allow about 1 hour of work and up to a few hours of waiting.

## What can go wrong

| Risk | Prevention |
|---|---|
| **Email `info@hiraya.ch` stops working** | Email lives in DNS records (MX, SPF, DKIM, DMARC). Moving the nameservers to Cloudflare only keeps email working if those records are copied across. Steps 5 and 10 cover this. |
| Site unreachable after the nameserver change | Keep GitHub Pages running until step 11. DNSSEC must be switched off first (step 8). |
| Nobody can log in to renew the domain | Step 14: put the domain under the owner's control. |

## Stage 1: prepare (no impact on the live site)

1. **Cloudflare account.** Create it at https://dash.cloudflare.com with the owner's email address and enable two-factor authentication.
2. **Record the current state** (screenshots or export):
   - Namecheap → Domain List → hiraya.ch → **Advanced DNS**: every record (A, AAAA, CNAME, MX, TXT, etc.).
   - Which service handles `info@hiraya.ch` email (Namecheap Private Email, Google Workspace, Microsoft 365, forwarding only?). This matters in step 9.
   - The domain's registration expiry date and whether DNSSEC is on (Namecheap → Advanced DNS).
3. **Connect the repository.** Cloudflare dashboard → **Workers & Pages** → Create → **Pages** → **Connect to Git** → authorise GitHub and select `baselbill/hiraya`. If your dashboard only shows the newer "Workers" flow, follow Cloudflare's current static-site instructions with the same settings. Use these settings:

   | Setting | Value |
   |---|---|
   | Production branch | `main` |
   | Build command | `npm run check && npm run build` |
   | Build output directory | `dist` |
   | Node version | 20 (the repo has a `.node-version` file; or set the environment variable `NODE_VERSION=20`) |

   For testing, set the production branch to `cutover-cloudflare` for now.
4. **Open the `*.pages.dev` address** that Cloudflare gives you and compare with https://hiraya.ch: language switch, menu photos, order buttons, map, phone and email links. Check the browser console for errors.
5. **Add the domain in Cloudflare** (Websites → Add a domain → `hiraya.ch` → Free plan). Cloudflare scans and imports the existing DNS records. **Compare the list with your Step 2 record.** Anything missing, especially **MX and TXT records**, must be added by hand. Do not change nameservers yet.

## Stage 2: cut over

Pick a quiet time (for example Sunday, when the restaurant is closed).

6. **Lower risk:** tell the owner and staff that email or the website may be briefly unavailable.
7. **In Cloudflare**, open your Pages project → **Custom domains** → add `hiraya.ch` (and `www.hiraya.ch`, redirecting to `hiraya.ch`). It will show as "pending" until the nameservers change.
8. **Namecheap: switch DNSSEC off** (Domain List → hiraya.ch → Advanced DNS → DNSSEC), if it is on. Leaving it on while changing nameservers can make the site unreachable for many visitors.
9. **Namecheap: change nameservers.** Domain List → Manage → **Nameservers** → **Custom DNS**, and enter the two nameservers Cloudflare assigned (shown in the Cloudflare dashboard after step 5). Save.
10. **Wait** for Cloudflare to report the domain as **Active** (usually minutes, sometimes a few hours). Then check:
    - https://hiraya.ch loads from Cloudflare (the response has a `server: cloudflare` header).
    - https://www.hiraya.ch redirects to https://hiraya.ch.
    - **Send a test email to `info@hiraya.ch` and send one out from it.** If this fails, fix the MX/TXT records in Cloudflare DNS immediately using your step 2 record.
    - In Cloudflare → SSL/TLS, set the mode to **Full** (or Full strict).
    - If Cloudflare offers DNSSEC, enable it and add the DS record at Namecheap as shown.
11. **Keep GitHub Pages as the fallback** for at least a few days.
12. **Merge the repository changes.** Set the Cloudflare production branch back to `main`. Merge `cutover-cloudflare` into `main` (it removes the GitHub Pages deploy workflow and CNAME files, adds Cloudflare headers, and updates the docs). Confirm a Cloudflare production deployment succeeds.
13. **Retire GitHub Pages**: GitHub → repository Settings → Pages → unpublish the site (or just leave the workflow removed).

## Afterwards

14. **Ownership.** The domain is currently on a personal Namecheap account. The owner should hold it. Namecheap supports moving a domain to another Namecheap account; the owner creates a Namecheap account and the current holder starts the transfer. Check that this works for `.ch` domains in your Namecheap panel. Then update the registrar, owner and renewal date in [HANDOFF_CHECKLIST.md](HANDOFF_CHECKLIST.md). Do the same for the Cloudflare account and the GitHub repository.
15. **Make the GitHub repository private** (Settings → General → Danger Zone → Change visibility). The site stays up because Cloudflare serves it. Cloudflare's GitHub app keeps access to the private repo; re-authorise it if a build fails with an access error.
16. **Publish the legal page** with the Cloudflare hosting text (see [legal-draft](legal-draft/README.md)).

## Rollback

Before step 12: set the Namecheap nameservers back to "Namecheap BasicDNS" (and DNSSEC back on if it was). The site returns to GitHub Pages. After step 12: revert the merge commit on `main`, restore the nameservers, and re-enable Pages. Because the Namecheap DNS records are untouched, nothing is lost.

## Day-to-day after migration

- Every push to a branch creates a preview address (visible in the Cloudflare dashboard and on the GitHub pull request); a push to `main` updates hiraya.ch.
- If the build fails, `npm run check` or `npm run build` failed. The Cloudflare dashboard shows the log; the problem is the same as a failing CI check on GitHub.
