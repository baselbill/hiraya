// Turn src/data/menu.json (the /menu board) into till sections.
// Prices and names come only from that file. Nothing is invented.

export function buildCatalog(raw) {
  const items = []
  const seen = new Set()
  const sectionOrder = []

  function visit(node) {
    if (!node || typeof node !== 'object') return
    if (node.key && node.section && Array.isArray(node.prices) && node.prices.length && !seen.has(node.key)) {
      const sizes = node.prices
        .map((p, i) => ({ id: String(i), label: (p.de || '').trim(), price: Number(p.chf) }))
        .filter(s => Number.isFinite(s.price))
      if (!sizes.length) return
      seen.add(node.key)
      if (!sectionOrder.includes(node.section)) sectionOrder.push(node.section)
      items.push({
        key: node.key,
        section: node.section,
        name: node.de || node.key,
        note: node.variants?.de || '',
        pick: !!node.pick,
        spicy: !!node.spicy,
        veg: node.veg || '',
        sizes,
      })
    }
    for (const value of Object.values(node)) visit(value)
  }

  visit(raw)

  return sectionOrder.map(name => ({
    name,
    items: items
      .filter(item => item.section === name)
      .sort((a, b) => Number(b.pick) - Number(a.pick)),
  }))
}

export function money(n) {
  return 'CHF ' + Number(n).toFixed(2)
}
