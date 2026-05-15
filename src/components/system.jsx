// Hiraya visual primitives — Inabel textile band + brand marks

export const MotifRow = ({ kind, color, width, height }) => {
  const items = [];
  if (kind === 'diamonds') {
    const step = 14;
    const n = Math.ceil(width / step) + 1;
    for (let i = 0; i < n; i++) {
      const cx = i * step + step / 2;
      const cy = height / 2;
      const r = Math.min(step / 2 - 1.2, height / 2 - 1.2);
      items.push(<path key={i} d={`M${cx} ${cy - r} L${cx + r} ${cy} L${cx} ${cy + r} L${cx - r} ${cy} Z`} fill="none" stroke={color} strokeWidth="1.1" />);
      items.push(<circle key={`d${i}`} cx={cx} cy={cy} r="0.7" fill={color} />);
    }
  } else if (kind === 'chevron') {
    const step = 10;
    const n = Math.ceil(width / step) + 1;
    for (let i = 0; i < n; i++) {
      const x = i * step;
      items.push(<path key={i} d={`M${x} ${height * 0.75} L${x + step / 2} ${height * 0.25} L${x + step} ${height * 0.75}`} fill="none" stroke={color} strokeWidth="1.3" />);
    }
  } else if (kind === 'x') {
    const step = 8;
    const n = Math.ceil(width / step) + 1;
    const m = 1.6;
    for (let i = 0; i < n; i++) {
      const x = i * step;
      items.push(<path key={i} d={`M${x + m} ${m} L${x + step - m} ${height - m} M${x + step - m} ${m} L${x + m} ${height - m}`} stroke={color} strokeWidth="1.1" />);
    }
  } else if (kind === 'dash') {
    const step = 6;
    const n = Math.ceil(width / step) + 1;
    for (let i = 0; i < n; i++) {
      items.push(<rect key={i} x={i * step + 1} y={height / 2 - 0.6} width="3" height="1.3" fill={color} />);
    }
  }
  return <g>{items}</g>;
};

export const Inabel = ({ height = 28, width = '100%', variant = 'full', seed = 0, style = {} }) => {
  const fullRows = [
    ['#b03a22', null,       null,      0.06],
    ['#221912', 'dash',     '#d99425', 0.05],
    ['#efe2c7', 'diamonds', '#b03a22', 0.18],
    ['#221912', null,       null,      0.03],
    ['#d99425', 'x',        '#221912', 0.08],
    ['#b03a22', 'chevron',  '#efe2c7', 0.14],
    ['#221912', null,       null,      0.04],
    ['#efe2c7', 'dash',     '#221912', 0.05],
    ['#b03a22', null,       null,      0.06],
    ['#221912', 'x',        '#d99425', 0.08],
    ['#efe2c7', 'diamonds', '#221912', 0.13],
    ['#b03a22', null,       null,      0.05],
    ['#221912', null,       null,      0.05],
  ];
  const slimRows = [
    ['#b03a22', null,       null,      0.16],
    ['#221912', 'dash',     '#d99425', 0.16],
    ['#efe2c7', 'diamonds', '#b03a22', 0.36],
    ['#221912', 'x',        '#d99425', 0.16],
    ['#b03a22', null,       null,      0.16],
  ];
  const inkRows = [
    ['#3a2f26', null,       null,      0.1],
    ['#f4ead6', 'dash',     '#3a2f26', 0.1],
    ['#3a2f26', 'diamonds', '#f4ead6', 0.5],
    ['#f4ead6', 'x',        '#3a2f26', 0.2],
    ['#3a2f26', null,       null,      0.1],
  ];

  const rows = variant === 'slim' ? slimRows : variant === 'ink' ? inkRows : fullRows;
  const totalR = rows.reduce((s, r) => s + r[3], 0);
  let y = 0;
  return (
    <svg width={width} height={height} viewBox="0 0 200 100" preserveAspectRatio="none" style={{ display: 'block', ...style }}>
      {rows.map((r, i) => {
        const [bg, mk, mc, h] = r;
        const rowH = (h / totalR) * 100;
        const yy = y;
        y += rowH;
        return (
          <g key={i}>
            <rect x="0" y={yy} width="200" height={rowH} fill={bg} />
            {mk && (
              <g transform={`translate(0 ${yy})`}>
                <MotifRow kind={mk} color={mc} width={200} height={rowH} />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
