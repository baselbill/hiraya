# Hiraya Kasse (preview)

Unlisted tablet till for walk-in and phone orders. Gerwin taps items, the tablet adds up the total, and he types that total into SumUp himself. This preview does not take payment, talk to SumUp, or print.

Open it at `/kasse-7a6466ec/` after `npm run dev` or `npm run preview`. It is not linked from hiraya.ch. The PIN for this preview is `1234`, set in `src/kasse/config.js`.

Menu names and prices are generated from `src/data/menu.json`, the same file the in-store board at `/menu` uses. Pull request #42 (homepage price fixes, Evian/Valser water, Tamago Nigiri V) is not on `main`, so those edits are not in this preview.

## Later: Google Sheet

`src/kasse/sync.js` posts one JSON body per save when `APPS_SCRIPT_URL` is set. Until then every order stays in `localStorage` on the tablet (`hiraya-kasse-orders-v1`). No script URL or secret is stored here.

The web app should append to a spreadsheet named **Hiraya orders**.

### Tab `Orders`

| Column | Meaning |
|---|---|
| order_id | Stable id from the tablet |
| day | Zurich date `YYYY-MM-DD` |
| seq | Daily sequence, starting at 1 |
| created_at | ISO timestamp |
| paid_at | ISO timestamp, empty until marked paid |
| type | `walkin` or `phone` |
| status | `open`, `paid`, or `cancelled` |
| customer | Name or phone, optional |
| pickup | `asap`, `+15`, `+30`, or `+45` |
| note | Optional |
| total_chf | Sum of the lines, two decimals |
| sync | `local` until the POST succeeds |
| lang | `en` or `de`, the till language when the order was saved. Optional. |

### Tab `Order lines`

| Column | Meaning |
|---|---|
| order_id | Same as the order |
| line_no | 1-based |
| item_key | Key from `src/data/menu.json` |
| item_name | German name shown on the till |
| size_label | Size or variant label, empty if the item has one price and no size |
| unit_chf | Price for one |
| qty | Count |
| line_chf | `unit_chf * qty` |

One order row, then one line row per item. Updates (paid, cancelled) send the order again with the same `order_id`; the script should replace that order and its lines rather than append a second copy.
