// Turn src/data/menu.json (the /menu board) into till sections.
// Prices and names come only from that file. Nothing is invented.

export function buildCatalog(raw) {
  const items = []
  const seen = new Set()
  const sectionOrder = []
  const sectionEn = new Map()

  function noteSectionEn(section, en) {
    const label = (en || '').trim()
    if (!section || !label) return
    if (!sectionEn.has(section)) sectionEn.set(section, new Set())
    sectionEn.get(section).add(label)
  }

  function visit(node) {
    if (!node || typeof node !== 'object') return
    const isGroup = !node.key && node.en && node.de && (node.items || node.cols || node.section)
    if (isGroup && node.section) noteSectionEn(node.section, node.en)
    if (isGroup && Array.isArray(node.items)) {
      const sections = [...new Set(node.items.map(item => item && item.section).filter(Boolean))]
      for (const section of sections) noteSectionEn(section, node.en)
    }
    if (node.key && node.section && Array.isArray(node.prices) && node.prices.length && !seen.has(node.key)) {
      const sizes = node.prices
        .map((p, i) => ({
          id: String(i),
          labelDe: (p.de || '').trim(),
          labelEn: (p.en || '').trim(),
          price: Number(p.chf),
        }))
        .filter(s => Number.isFinite(s.price))
      if (!sizes.length) return
      seen.add(node.key)
      if (!sectionOrder.includes(node.section)) sectionOrder.push(node.section)
      items.push({
        key: node.key,
        section: node.section,
        name: node.de || node.key,
        descDe: (node.de_desc || '').trim(),
        descEn: (node.en_desc || '').trim(),
        noteDe: (node.variants?.de || '').trim(),
        noteEn: (node.variants?.en || '').trim(),
        pick: !!node.pick,
        spicy: !!node.spicy,
        veg: node.veg || '',
        sizes,
      })
    }
    for (const value of Object.values(node)) visit(value)
  }

  visit(raw)

  return sectionOrder.map(name => {
    const labels = [...(sectionEn.get(name) || [])]
    return {
      id: name,
      name,
      en: labels.length === 1 ? labels[0] : '',
      items: items
        .filter(item => item.section === name)
        .sort((a, b) => Number(b.pick) - Number(a.pick)),
    }
  })
}

export function money(n) {
  return 'CHF ' + Number(n).toFixed(2)
}
