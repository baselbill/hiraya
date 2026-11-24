# Hiraya Kasse (preview)

Unlisted tablet till for walk-in and phone orders. Gerwin taps items, the tablet adds up the total, and he types that total into SumUp himself. This preview does not take payment, talk to SumUp, or print.

Open it at `/kasse-7a6466ec/` after `npm run dev` or `npm run preview`. It is not linked from hiraya.ch. The PIN for this preview is `1234`, set in `src/kasse/config.js`.

Menu names and prices are generated from `src/data/menu.json`, the same file the in-store board at `/menu` uses. Pull request #42 (homepage price fixes, Evian/Valser water, Tamago Nigiri V) is not on `main`, so those edits are not in this preview.

## Google Sheet

The spreadsheet is **Hiraya orders**, id `1iBy05hc4RoZK7o3cN7QbzI_X6PoypJDg-Ymvk3nzLJc`. Tabs: `Orders`, `Order lines`, `Summary`.

`kasse-7a6466ec/apps-script/Code.gs` is the web app. It is not imported by the site build, so it is not published to hiraya.ch. `doPost` reads a JSON body sent as `text/plain` (no CORS preflight), checks `TOKEN` from Script Properties, and upserts by `order_id`. A retry or a status change updates that order and replaces its lines. It does not add a second row.

Until `ENDPOINT_URL` and `TOKEN` are filled in `src/kasse/config.js`, the till only stores orders in `localStorage` (`hiraya-kasse-orders-v1`) and the top bar says "Local" / "Nur hier". With both set, a save, "Mark paid", or "Cancel" joins an offline queue and is posted immediately, again when the browser comes online, and every 60 seconds. The top bar then says "Synced" or "N waiting".

The token is compiled into the public JavaScript. Treat it as a spam filter, not a password. `Code.gs` still checks types, lengths (customer 120, note 500), numeric totals, and a maximum of 100 lines.

### Deploy

1. Open the Hiraya orders spreadsheet. Extensions → Apps Script. Or create a standalone script at script.google.com. The file already contains the spreadsheet id.
2. Replace the script with `kasse-7a6466ec/apps-script/Code.gs`.
3. Project settings → Script properties → add `TOKEN` (a long random string).
4. Run `setup` once from the editor and approve the spreadsheet permission. That writes the header rows and the Summary formulas.
5. Deploy → New deployment → Web app. Execute as: **Me**. Who has access: **Anyone**. Copy the web app URL (it ends in `/exec`).
6. Put that URL in `ENDPOINT_URL` and the same token in `TOKEN` in `src/kasse/config.js`. Ship a new build of the site. Redeploy the web app (new version) after any later edit to `Code.gs`.

### Tab `Orders`

`order_id`, `order_no`, `created_at` (ISO), `date`, `time`, `type` (`walk-in` or `phone`), `customer`, `pickup_time`, `note`, `item_count`, `total_chf`, `status` (`open`, `paid`, or `cancelled`), `paid_at`, `cancelled_at`, `lang`, `device`.

### Tab `Order lines`

`order_id`, `order_no`, `date`, `line_no`, `section`, `item`, `size`, `qty`, `unit_price_chf`, `line_total_chf`. Size is the German label from the menu file.

### Tab `Summary`

`setup` writes two `QUERY` formulas over `Orders` (orders and sales per day, excluding cancelled; paid count and paid total per day) and one over `Order lines` (items by quantity and total).
