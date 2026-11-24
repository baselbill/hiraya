/**
 * Hiraya till → Google Sheet "Hiraya orders".
 * Not part of the website build. Deploy as a web app:
 * Execute as: Me, Who has access: Anyone.
 * Script property TOKEN must match src/kasse/config.js.
 * The token is only a spam filter; the browser bundle can be read.
 */
var SPREADSHEET_ID = '1iBy05hc4RoZK7o3cN7QbzI_X6PoypJDg-Ymvk3nzLJc';

var ORDER_HEADERS = [
  'order_id', 'order_no', 'created_at', 'date', 'time', 'type', 'customer',
  'pickup_time', 'note', 'item_count', 'total_chf', 'status', 'paid_at',
  'cancelled_at', 'lang', 'device'
];

var LINE_HEADERS = [
  'order_id', 'order_no', 'date', 'line_no', 'section', 'item', 'size',
  'qty', 'unit_price_chf', 'line_total_chf'
];

function setup() {
  var ss = ss_();
  var orders = ensureSheet_(ss, 'Orders', ORDER_HEADERS);
  var lines = ensureSheet_(ss, 'Order lines', LINE_HEADERS);
  var summary = ss.getSheetByName('Summary') || ss.insertSheet('Summary');
  summary.clear();
  summary.getRange('A1').setValue('Per day');
  summary.getRange('A2').setFormula(
    "QUERY(Orders!A:P,\"select D, count(A), sum(K) where D is not null and L <> 'cancelled' group by D label D 'date', count(A) 'orders', sum(K) 'sales'\", 1)"
  );
  summary.getRange('E1').setValue('Paid per day');
  summary.getRange('E2').setFormula(
    "QUERY(Orders!A:P,\"select D, count(A), sum(K) where L = 'paid' group by D label D 'date', count(A) 'paid_orders', sum(K) 'paid_total'\", 1)"
  );
  summary.getRange('A20').setValue('Top items');
  summary.getRange('A21').setFormula(
    "QUERY('Order lines'!A:J,\"select F, sum(H), sum(J) where F is not null group by F order by sum(J) desc label F 'item', sum(H) 'qty', sum(J) 'total'\", 1)"
  );
  summary.autoResizeColumns(1, 8);
  orders.setFrozenRows(1);
  lines.setFrozenRows(1);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var locked = false;
  try {
    lock.waitLock(30000);
    locked = true;
    var expected = PropertiesService.getScriptProperties().getProperty('TOKEN');
    var body = parseBody_(e);
    if (!expected || !body || body.token !== expected) return json_({ ok: false, error: 'unauthorized' });
    var order = body.order;
    var problem = validateOrder_(order);
    if (problem) return json_({ ok: false, error: problem });
    writeOrder_(order);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    if (locked) lock.releaseLock();
  }
}

function parseBody_(e) {
  var raw = e && e.postData && e.postData.contents;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (err) { return null; }
}

function validateOrder_(order) {
  if (!order || typeof order !== 'object') return 'missing order';
  if (!/^[A-Za-z0-9-]{8,80}$/.test(String(order.order_id || ''))) return 'bad order_id';
  if (String(order.order_no || '').length > 40) return 'bad order_no';
  if (String(order.created_at || '').length > 40) return 'bad created_at';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(order.date || ''))) return 'bad date';
  if (String(order.time || '').length > 16) return 'bad time';
  if (order.type !== 'walk-in' && order.type !== 'phone') return 'bad type';
  if (['open', 'paid', 'cancelled'].indexOf(order.status) === -1) return 'bad status';
  if (order.lang && order.lang !== 'en' && order.lang !== 'de') return 'bad lang';
  if (String(order.customer || '').length > 120) return 'customer too long';
  if (String(order.pickup_time || '').length > 40) return 'pickup too long';
  if (String(order.note || '').length > 500) return 'note too long';
  if (String(order.device || '').length > 40) return 'device too long';
  if (String(order.paid_at || '').length > 40 || String(order.cancelled_at || '').length > 40) return 'bad timestamp';
  if (!Array.isArray(order.lines) || order.lines.length > 100) return 'bad lines';
  if (order.lines.length !== Number(order.item_count)) return 'item_count mismatch';
  var sum = 0;
  for (var i = 0; i < order.lines.length; i++) {
    var line = order.lines[i];
    var qty = Number(line.qty);
    var unit = Number(line.unit_price_chf);
    var lineTotal = Number(line.line_total_chf);
    if (!Number.isFinite(qty) || qty < 1 || qty > 999 || Math.round(qty) !== qty) return 'bad qty';
    if (!Number.isFinite(unit) || unit < 0 || unit > 10000) return 'bad unit price';
    if (!Number.isFinite(lineTotal) || Math.abs(lineTotal - round2_(unit * qty)) > 0.02) return 'bad line total';
    if (String(line.section || '').length > 80) return 'section too long';
    if (!line.item || String(line.item).length > 160) return 'bad item';
    if (String(line.size || '').length > 80) return 'size too long';
    sum += lineTotal;
  }
  var total = Number(order.total_chf);
  if (!Number.isFinite(total) || total < 0 || total > 100000) return 'bad total';
  if (Math.abs(round2_(sum) - round2_(total)) > 0.05) return 'total mismatch';
  return '';
}

function writeOrder_(order) {
  var ss = ss_();
  var orders = ensureSheet_(ss, 'Orders', ORDER_HEADERS);
  var lines = ensureSheet_(ss, 'Order lines', LINE_HEADERS);
  var row = [
    String(order.order_id),
    String(order.order_no || ''),
    String(order.created_at || ''),
    String(order.date),
    String(order.time || ''),
    order.type,
    String(order.customer || ''),
    String(order.pickup_time || ''),
    String(order.note || ''),
    order.lines.length,
    round2_(order.total_chf),
    order.status,
    String(order.paid_at || ''),
    String(order.cancelled_at || ''),
    String(order.lang || ''),
    String(order.device || '')
  ];
  var found = findRow_(orders, String(order.order_id));
  if (found) orders.getRange(found, 1, 1, row.length).setValues([row]);
  else orders.appendRow(row);

  var existing = lines.getDataRange().getValues();
  for (var i = existing.length - 1; i >= 1; i--) {
    if (String(existing[i][0]) === String(order.order_id)) lines.deleteRow(i + 1);
  }
  if (!order.lines.length) return;
  var lineRows = order.lines.map(function (line, index) {
    return [
      String(order.order_id),
      String(order.order_no || ''),
      String(order.date),
      index + 1,
      String(line.section || ''),
      String(line.item),
      String(line.size || ''),
      Number(line.qty),
      round2_(line.unit_price_chf),
      round2_(line.line_total_chf)
    ];
  });
  lines.getRange(lines.getLastRow() + 1, 1, lineRows.length, lineRows[0].length).setValues(lineRows);
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  var first = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var missing = headers.some(function (header, i) { return first[i] !== header; });
  if (missing) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  return sheet;
}

function findRow_(sheet, orderId) {
  var ids = sheet.getRange(1, 1, sheet.getLastRow() || 1, 1).getValues();
  for (var i = 1; i < ids.length; i++) {
    if (String(ids[i][0]) === orderId) return i + 1;
  }
  return 0;
}

function ss_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function round2_(n) {
  return Math.round(Number(n) * 100) / 100;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
