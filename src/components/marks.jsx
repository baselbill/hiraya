// DualGlyph — the 平屋 kanji stacked as the primary brand graphic element.
export const DualGlyph = ({ size = 92, color = 'var(--ink)' }) => (
  <div style={{
    display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
    fontFamily: '"Yu Mincho","Hiragino Mincho ProN","Noto Serif JP","Songti SC",serif',
    fontWeight: 400, color, lineHeight: 0.95,
  }}>
    <span style={{ fontSize: size }}>平</span>
    <span style={{ fontSize: size, marginTop: -size * 0.05 }}>屋</span>
  </div>
);
