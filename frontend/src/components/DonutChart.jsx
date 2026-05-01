import React from 'react';

export default function DonutChart({ data, total }) {
  const size = 220, cx = size / 2, cy = size / 2, r = 80;
  const fmtBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  let cumAngle = -90;
  const slices = data.map(d => {
    const angle = (d.value / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    return { ...d, startAngle: start, angle };
  });
  const polar = (cx, cy, r, deg) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => {
          if (s.angle <= 0) return null;
          const a = s.angle >= 360 ? 359.99 : s.angle;
          const start = polar(cx, cy, r, s.startAngle);
          const end = polar(cx, cy, r, s.startAngle + a);
          const large = a > 180 ? 1 : 0;
          const d = `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
          return <path key={i} d={d} fill="none" stroke={s.color} strokeWidth={32} />;
        })}
        <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}>Total</text>
        <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fill: '#0f172a', fontWeight: 700 }}>{fmtBRL(total)}</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color, flexShrink: 0 }} />
            <span style={{ color: '#475569', minWidth: 130 }}>{d.label}</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{d.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
