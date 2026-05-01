import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';

const CATEGORY_COLORS = {
  'Streaming': '#ef4444', 'Música': '#8b5cf6', 'Produtividade': '#3b82f6',
  'Saúde/Academia': '#22c55e', 'Armazenamento/Cloud': '#06b6d4', 'Educação': '#f59e0b',
  'Jogos': '#ec4899', 'Delivery': '#f97316', 'Seguros': '#6366f1', 'Outros': '#64748b',
};
const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const fmtDate = (s) => { const d = new Date(s + 'T00:00:00'); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; };
const diffDays = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date(); now.setHours(0,0,0,0);
  return Math.ceil((d - now) / 86400000);
};

export default function Alertas({ showToast }) {
  const [subs, setSubs] = useState([]);
  const [globalDays, setGlobalDays] = useState(3);
  const [globalError, setGlobalError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [subsData, settings] = await Promise.all([api.getSubscriptions(), api.getSettings()]);
        setSubs(subsData);
        setGlobalDays(settings.default_alert_days || 3);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const upcoming = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);
    const limit = new Date(now); limit.setDate(limit.getDate() + 30);
    return subs
      .filter(s => s.status !== 'Cancelada')
      .filter(s => new Date(s.renewal_date + 'T00:00:00') <= limit)
      .sort((a, b) => a.renewal_date.localeCompare(b.renewal_date));
  }, [subs]);

  const handleGlobalChange = (v) => {
    setGlobalDays(v);
    const n = parseInt(v);
    if (isNaN(n) || n < 1 || n > 30) {
      setGlobalError('A antecedência do alerta deve ser um valor entre 1 e 30 dias.');
    } else {
      setGlobalError('');
    }
  };

  const updateSubAlert = async (id, updates) => {
    try {
      const updated = await api.updateAlert(id, updates);
      setSubs(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err) { showToast(err.message, 'error'); }
  };

  const getAlertStatus = (sub) => {
    if (!sub.alert_enabled) return 'Desativado';
    const days = diffDays(sub.renewal_date);
    const alertD = sub.alert_days || globalDays;
    if (days <= alertD) return 'Enviado';
    return 'Pendente';
  };

  const alertStatusColors = {
    Enviado: { bg: '#dcfce7', color: '#16a34a' },
    Pendente: { bg: '#fef9c3', color: '#a16207' },
    Desativado: { bg: '#f1f5f9', color: '#64748b' },
  };

  const getUrgencyBg = (days) => {
    if (days < 0) return '#fff1f2';
    if (days <= 3) return '#fee2e2';
    if (days <= 7) return '#fef3c7';
    return 'transparent';
  };

  const handleSave = async () => {
    try {
      await api.updateGlobalAlert(parseInt(globalDays));
      showToast('Configuração de alerta salva com sucesso.');
    } catch (err) { showToast(err.message, 'error'); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: 900, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Alertas de Renovação</h1>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>Configure alertas para ser notificado antes das renovações.</p>

      <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 14, padding: 28, color: '#fff', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Alerta Padrão Global</h3>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>Defina a antecedência padrão para todos os alertas.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="number" min="1" max="30" value={globalDays}
              onChange={e => handleGlobalChange(e.target.value)}
              style={{
                width: 80, padding: '12px 8px', borderRadius: 12,
                border: `2px solid ${globalError ? '#ef4444' : '#334155'}`,
                background: '#1e293b', color: '#fff',
                fontSize: 28, fontWeight: 800, fontFamily: "'Sora', sans-serif",
                textAlign: 'center', outline: 'none',
              }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: '#94a3b8' }}>dias antes</span>
          </div>
        </div>
        {globalError && <p style={{ color: '#f87171', fontSize: 13, marginTop: 8 }}>{globalError}</p>}
      </div>

      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Próximos Vencimentos (30 dias)</h3>

      {upcoming.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, padding: 48, textAlign: 'center', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
          Nenhuma assinatura vencendo nos próximos 30 dias.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
          {upcoming.map((s, i) => {
            const days = diffDays(s.renewal_date);
            const alertSt = getAlertStatus(s);
            const stColors = alertStatusColors[alertSt];
            return (
              <div key={s.id} style={{
                background: getUrgencyBg(days) || '#fff', borderRadius: 14, padding: '18px 20px',
                border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                animation: `slideInRight 0.3s ease ${i * 0.06}s both`,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: (CATEGORY_COLORS[s.category] || '#64748b') + '18',
                  color: CATEGORY_COLORS[s.category] || '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 15, fontFamily: "'Sora', sans-serif", flexShrink: 0,
                }}>{initials(s.name)}</div>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Renova em {fmtDate(s.renewal_date)}</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 70 }}>
                  <div style={{
                    fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, lineHeight: 1,
                    color: days < 0 ? '#dc2626' : days <= 3 ? '#dc2626' : days <= 7 ? '#d97706' : '#0d9488',
                  }}>{days}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{days < 0 ? 'vencido' : 'dias'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
                  <input type="number" min="1" max="30"
                    value={s.alert_days || globalDays}
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      if (v >= 1 && v <= 30) updateSubAlert(s.id, { alert_days: v, alert_enabled: s.alert_enabled });
                    }}
                    style={{
                      width: 52, padding: '8px 4px', borderRadius: 8,
                      border: '1.5px solid #e2e8f0', fontSize: 15, fontWeight: 700,
                      fontFamily: "'Sora', sans-serif", textAlign: 'center',
                      color: '#0f172a', background: '#fff', outline: 'none',
                    }} />
                  <span style={{ fontSize: 12, color: '#64748b' }}>dias</span>
                </div>
                <button onClick={() => updateSubAlert(s.id, { alert_days: s.alert_days, alert_enabled: !s.alert_enabled })}
                  style={{
                    width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                    background: s.alert_enabled ? '#0d9488' : '#cbd5e1',
                    position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                  }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 3,
                    left: s.alert_enabled ? 25 : 3, transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
                <span style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  background: stColors.bg, color: stColors.color, minWidth: 80, textAlign: 'center',
                }}>{alertSt}</span>
              </div>
            );
          })}
        </div>
      )}

      <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Timeline</h3>
      <div style={{ background: '#fff', borderRadius: 14, padding: '24px 20px', border: '1px solid #e2e8f0', marginBottom: 28 }}>
        {upcoming.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center' }}>Sem vencimentos nos próximos 30 dias.</p>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 7, top: 4, bottom: 4, width: 2, background: '#e2e8f0', borderRadius: 1 }} />
            {upcoming.map((s, i) => {
              const days = diffDays(s.renewal_date);
              const dotColor = days < 0 ? '#dc2626' : days <= 3 ? '#dc2626' : days <= 7 ? '#eab308' : '#94a3b8';
              return (
                <div key={s.id} style={{ position: 'relative', paddingBottom: i < upcoming.length - 1 ? 20 : 0, animation: `fadeIn 0.3s ease ${i * 0.06}s both` }}>
                  <div style={{
                    position: 'absolute', left: -24, top: 4,
                    width: 14, height: 14, borderRadius: '50%',
                    background: dotColor, border: '3px solid #fff', boxShadow: `0 0 0 2px ${dotColor}33`,
                  }} />
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: '#0f172a', minWidth: 80 }}>{fmtDate(s.renewal_date)}</span>
                    <span style={{ fontSize: 14, color: '#475569', fontWeight: 500 }}>{s.name}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                      color: days < 0 ? '#dc2626' : days <= 3 ? '#dc2626' : days <= 7 ? '#d97706' : '#64748b',
                      background: days < 0 ? '#fee2e2' : days <= 3 ? '#fee2e2' : days <= 7 ? '#fef3c7' : '#f1f5f9',
                    }}>{days < 0 ? `${Math.abs(days)}d atrás` : `em ${days}d`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} style={{
          padding: '14px 32px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff',
          fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Sora', sans-serif",
          boxShadow: '0 4px 20px rgba(13,148,136,0.3)',
        }}>Salvar Configuração</button>
      </div>
    </div>
  );
}
