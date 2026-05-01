export default function Navbar({ active, onChange, onLogout, userName }) {
  const tabs = [
    { id: 'cadastrar', label: 'Cadastrar', icon: '+' },
    { id: 'consultar', label: 'Consultar', icon: '◎' },
    { id: 'alertas', label: 'Alertas', icon: '🔔' },
  ];
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px) saturate(180%)',
      borderBottom: '1px solid #e2e8f0', padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #0d9488, #0f766e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: "'Sora', sans-serif",
          }}>S</div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 20, color: '#0f172a' }}>
            Sub<span style={{ color: '#0d9488' }}>Control</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => onChange(t.id)} style={{
              padding: '8px 20px', borderRadius: 10, border: 'none',
              background: active === t.id ? '#0d94880f' : 'transparent',
              color: active === t.id ? '#0d9488' : '#64748b',
              fontWeight: active === t.id ? 700 : 500,
              fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 8px' }} />
          <span style={{ fontSize: 13, color: '#64748b', marginRight: 8 }}>{userName}</span>
          <button onClick={onLogout} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: '#fff', color: '#ef4444', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
          }}>Sair</button>
        </div>
      </div>
    </nav>
  );
}
