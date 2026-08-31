# Hiraya — Project Memory

## Original website rolls menu (pre–Just Eat sync, archived for evaluation)

These 8 rolls were on the website before being replaced by the Just Eat Fusion Rolls on 2026-05-18.
Prices were per-item (no variations). Keep for comparison/reintroduction if needed.

| ID | Name | Ingredients | Price | Tags |
|---|---|---|---|---|
| roll-spsal | Spicy Salmon Roll | spicy salmon · cream cheese · avocado · topped with marinated salmon · chili · sesame | CHF 18 | spicy, bestseller |
| roll-crunch | Crunch Roll | salmon · avocado · topped with cream cheese · tempura flakes | CHF 16 | — |
| roll-king | King Prawn Roll | tempura king prawn · cream cheese · avocado · topped with avocado · sesame | CHF 17 | — |
| roll-volc | Volcano Roll | tuna · salmon · king prawn tempura · avocado · cream cheese · topped with chili sauce · sesame | CHF 19 | spicy |
| roll-drag | Dragon Roll | tempura king prawn · cream cheese · topped with avocado · sesame | CHF 17 | — |
| roll-ebiko | Ebiko Roll | king prawn · avocado · cream cheese · topped with ebiko · chili | CHF 17 | spicy |
| roll-spider | Spider Roll | soft shell crab tempura · avocado · cream cheese · topped with sesame | CHF 18 | — |
| roll-vgf | Vegan Fusion Roll | avocado · cucumber · cream cheese · topped with avocado · sesame | CHF 14 | vegan |

## Original website poke menu (pre–Just Eat sync, archived for evaluation)

These 4 poke bowls were on the website before being replaced by the Just Eat Poke & Bento items on 2026-05-18.

| ID | Name | Ingredients | Price | Tags |
|---|---|---|---|---|
| poke-sal | Salmon Poke Bowl | salmon · avocado · edamame · cucumber · red cabbage · sesame · sweet soy | CHF 17 | bestseller |
| poke-tu | Tuna Poke Bowl | tuna · avocado · edamame · cucumber · red cabbage · sesame · sweet soy | CHF 17 | — |
| poke-pr | Prawn Poke Bowl | tiger prawn tempura · avocado · edamame · cucumber · red cabbage · sesame · sweet soy | CHF 17 | — |
| poke-vg | Vegan Poke Bowl | avocado · tofu · edamame · cucumber · red cabbage · sesame · sweet soy | CHF 15 | vegan |

## Original website sets menu (pre–Just Eat sync, archived for evaluation)

These 5 sets were on the website before being replaced by the Just Eat Sushi Set Menu on 2026-05-18.

| ID | Name | Ingredients | Price | Tags |
|---|---|---|---|---|
| set-hir | Hiraya Set | 30 pcs · hosomaki salmon & tuna · nigiri salmon & tuna · ebi nigiri · california maki | CHF 39 | bestseller |
| set-sal | Salmon & Tuna Set | 20 pcs · 4 nigiri salmon · 4 nigiri tuna · 6 hosomaki salmon · 6 hosomaki tuna | CHF 25 | — |
| set-rain | Rainbow Set | 20 pcs · nigiri salmon · nigiri tuna · nigiri avocado · hosomaki salmon · hosomaki tuna | CHF 25 | — |
| set-vg | Vegan Set | 20 pcs · hosomaki avocado/cucumber · nigiri avocado · hosomaki inari | CHF 20 | vegan |
| set-two | Maki & Sushi for Two | 40 pcs · chef's selection of rolls and nigiri | CHF 45 | — |

## Uber Eats integration (2026-08-31)

Added Uber Eats as a second ordering option next to every existing Just Eat CTA (nav, mobile drawer, hero, menu callout, menu bottom CTA, footer) — store URL `https://www.ubereats.com/ch/store/hiraya-asian-fusion-sushi/uEHR2Y59RlCMq_zwBLf5_g`. `JustEatLink` was refactored into a generic `OrderLink`/`OrderLinks` (provider-parameterized) in `src/components/website.jsx`; 4-language copy in `src/i18n.js` that previously named Just Eat as the sole platform was updated to mention both. Merged via PR #34.

## Menu price sync with Uber Eats (2026-08-31)

Compared the site `MENU` (`src/components/website.jsx`) against a live Uber Eats page snapshot and found 13 price mismatches, all with the site undercutting Uber Eats by CHF 1–5 (Poke Bowls/Bento were the worst offenders, +5 CHF on bento boxes). Synced site prices up to match. Merged via PR #35. All 11 Hiraya Fusion Rolls already matched exactly — untouched.

Categories on Uber Eats **intentionally** not on the site (the site's own "order online" menu callout already points customers to Just Eat/Uber Eats for these): Hosomaki (12 items), Nigiri (8 items) sold individually.

Categories/items on Uber Eats **not yet added** to the site (open question — not done, needs a decision):
- "Classic Sushi Rolls" category (5 items: California Roll, Lachs/Rainbow Salmon Roll, Veggie Uramaki, Tuna Rainbow Roll, Thunfisch Mousse Roll)
- "Getränke"/drinks category (10 items, CHF 3–4.50)
- Extra sets: Mix Sushi 1 (22), Mix Sushi No. 3 (30), Nigiri Supreme 8pc (25), Hana-Mix (25–26, platforms disagree)
- Extra starters/specials: Wakame-Salat (6), Temari (7), Fischtatar (16)

Aside: Uber Eats shows 4.7★ (7 reviews) vs. the site's "4.8 · Google/Just Eat rating" claim — not addressed, flagged only.

## Just Eat vs. site price check — INCOMPLETE, unresolved at end of session

Only got a partial Just Eat snapshot: item-level data existed for "Sushi Set Menu" and "Hiraya Fusion Rolls" only — Just Eat lazy-loads categories on scroll, so Poke Bowls & Bento, Classic Sushi Rolls, Hosomaki, Nigiri, Appetizer, Specials, and Beverages were only category headers with no items, and still need a fuller scroll-and-resave (or screenshots) to compare.

Sushi Set Menu on Just Eat now fully matches the (Uber-Eats-synced) site. But two Hiraya Fusion Rolls items disagree specifically on **Just Eat** even though they matched between the site and Uber Eats:
- **Tempura Roll**: site/Uber Eats CHF 9.50, Just Eat CHF 10.00
- **Kiwi Rainbow Uramaki**: site/Uber Eats CHF 10.00, Just Eat CHF 10.50

User was asked how to resolve (match Just Eat's higher price / keep matching Uber Eats / something else) — **no answer given before the session ended.** Ask again next time before touching these two prices.

## Process note: comparing menu data against Just Eat / Uber Eats

This environment's network egress blocks `hiraya.ch` and `ubereats.com` directly (WebFetch returns `EGRESS_BLOCKED` — an org policy denial, don't retry/route around it). Workaround that worked: ask the user to save the live page as `.mhtml` (Chrome: right-click → Save As → Webpage, Single File) and upload it — since it's saved from the already-rendered page, the DOM contains the loaded menu items/prices with no JS execution needed to read it.

Extraction recipe: Python `email.message_from_binary_file()` to parse the mhtml → find the `text/html` part → `get_payload(decode=True)` (handles quoted-printable) → BeautifulSoup `.get_text('\n')` for clean line-by-line item names/prices.

Caveat: infinite-scroll/lazy-loaded menus (Just Eat) only have DOM content for sections the user actually scrolled through before saving. Always check for category headers with no items following them, and report that as "not captured" rather than assuming the category is genuinely absent.
