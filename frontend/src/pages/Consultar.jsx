import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import DonutChart from '../components/DonutChart';

const CATEGORIES = ['Streaming', 'Música', 'Produtividade', 'Saúde/Academia', 'Armazenamento/Cloud', 'Educação', 'Jogos', 'Delivery', 'Seguros', 'Outros'];
const PERIODS = ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'];
const STATUSES = ['Ativa', 'Pausada', 'Cancelada'];
const CATEGORY_COLORS = {
  'Streaming': '#ef4444', 'Música': '#8b5cf6', 'Produtividade': '#3b82f6',
  'Saúde/Academia': '#22c55e', 'Armazenamento/Cloud': '#06b6d4', 'Educação': '#f59e0b',
  'Jogos': '#ec4899', 'Delivery': '#f97316', 'Seguros': '#6366f1', 'Outros': '#64748b',
};
const STATUS_COLORS = { Ativa: '#16a34a', Pausada: '#eab308', Cancelada: '#dc2626' };
const STATUS_BG = { Ativa: '#dcfce7', Pausada: '#fef9c3', Cancelada: '#fee2e2' };

const inputStyle = () => ({
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1.5px solid #e2e8f0', fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", color: '#1e293b', background: '#fff', outline: 'none',
});
const selectStyle = () => ({
  ...inputStyle(), appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36,
});

const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
const fmtBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (s) => { const d = new Date(s + 'T00:00:00'); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; };

export default function Consultar({ goToAlerts }) {
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, monthly: 0, annual: 0 });
  const [statusTab, setStatusTab] = useState('Todas');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');
  const [sortCol, setSortCol] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const fetchData = async () => {
    try {
      const params = {};
      if (statusTab !== 'Todas') params.status = statusTab;
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      if (minVal) params.min_value = minVal;
      if (maxVal) params.max_value = maxVal;
      const [subsData, statsData] = await Promise.all([api.getSubscriptions(params), api.getStats()]);
      setSubs(subsData);
      setStats(statsData);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, [statusTab, search, catFilter, minVal, maxVal]);

  const sorted = useMemo(() => {
    if (!sortCol) return subs;
    return [...subs].sort((a, b) => {
      let va, vb;
      switch (sortCol) {
        case 'name': va = a.name.toLowerCase(); vb = b.name.toLowerCase(); break;
        case 'value': va = a.value; vb = b.value; break;
        case 'period': va = PERIODS.indexOf(a.period); vb = PERIODS.indexOf(b.period); break;
        case 'monthly': va = a.monthly_value; vb = b.monthly_value; break;
        case 'renewal': va = a.renewal_date; vb = b.renewal_date; break;
        case 'status': va = STATUSES.indexOf(a.status); vb = STATUSES.indexOf(b.status); break;
        default: return 0;
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [subs, sortCol, sortAsc]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  const activeSubs = useMemo(() => subs.filter(s => s.status === 'Ativa'), [subs]);

  const chartData = useMemo(() => {
    const map = {};
    activeSubs.forEach(s => { map[s.category] = (map[s.category] || 0) + s.monthly_value; });
    const total = activeSubs.reduce((sum, s) => sum + s.monthly_value, 0);
    return Object.entries(map).map(([label, value]) => ({
      label, value, color: CATEGORY_COLORS[label] || '#64748b',
      pct: total > 0 ? (value / total) * 100 : 0,
    })).sort((a, b) => b.value - a.value);
  }, [activeSubs]);

  const nextRenewal = useMemo(() => {
    const valid = subs.filter(s => s.status !== 'Cancelada').sort((a, b) => a.renewal_date.localeCompare(b.renewal_date));
    return valid[0] || null;
  }, [subs]);
  const highest = useMemo(() => activeSubs.reduce((m, s) => s.monthly_value > (m?.monthly_value || 0) ? s : m, null), [activeSubs]);
  const lowest = useMemo(() => activeSubs.reduce((m, s) => s.monthly_value < (m?.monthly_value || Infinity) ? s : m, null), [activeSubs]);
  const pausedSavings = subs.filter(s => s.status === 'Pausada').reduce((sum, s) => sum + s.monthly_value, 0);

  const clearFilters = () => { setSearch(''); setCatFilter(''); setMinVal(''); setMaxVal(''); setStatusTab('Todas'); };

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span style={{ opacity: 0.3, fontSize: 11 }}> ↕</span>;
    return <span style={{ fontSize: 11, color: '#0d9488' }}> {sortAsc ? '↑' : '↓'}</span>;
  };

  const thStyle = {
    padding: '12px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600,
    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px',
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
    borderBottom: '2px solid #e2e8f0',
  };
  const tdStyle = { padding: '14px 14px', fontSize: 14, color: '#334155', borderBottom: '1px solid #f1f5f9' };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Consultar Assinaturas</h1>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>Visualize, filtre e analise suas assinaturas.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Assinaturas Ativas', value: `${stats.active} de ${stats.total}`, sub: 'cadastradas', color: '#16a34a' },
          { label: 'Gasto Mensal', value: fmtBRL(stats.monthly), sub: 'total ativas', color: '#0d9488' },
          { label: 'Gasto Anual Estimado', value: fmtBRL(stats.annual), sub: 'projeção 12 meses', color: '#6366f1' },
        ].map((c, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '24px 20px',
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            animation: `slideUp 0.4s ease ${i * 0.1}s both`,
          }}>
            <p style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 8 }}>{c.label}</p>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: c.color }}>{c.value}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{c.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid #e2e8f0', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {['Todas', 'Ativa', 'Pausada', 'Cancelada'].map(t => (
            <button key={t} onClick={() => setStatusTab(t)} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: statusTab === t ? '#0d9488' : '#f1f5f9',
              color: statusTab === t ? '#fff' : '#64748b',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>{t === 'Todas' ? 'Todas' : t + 's'}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>BUSCAR</label>
            <input style={inputStyle()} placeholder="Nome do serviço..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>CATEGORIA</label>
            <select style={selectStyle()} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">Todas</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>VALOR MIN</label>
            <input style={inputStyle()} type="number" min="0" step="0.01" value={minVal} onChange={e => setMinVal(e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>VALOR MAX</label>
            <input style={inputStyle()} type="number" min="0" step="0.01" value={maxVal} onChange={e => setMaxVal(e.target.value)} placeholder="0,00" />
          </div>
          <button onClick={clearFilters} style={{
            padding: '10px 18px', borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#fff', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Limpar</button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'auto', marginBottom: 28 }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Nenhuma assinatura encontrada para os filtros selecionados.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle} onClick={() => toggleSort('name')}>Serviço<SortIcon col="name" /></th>
                <th style={thStyle} onClick={() => toggleSort('value')}>Valor<SortIcon col="value" /></th>
                <th style={thStyle} onClick={() => toggleSort('period')}>Período<SortIcon col="period" /></th>
                <th style={thStyle} onClick={() => toggleSort('monthly')}>Mensal Eq.<SortIcon col="monthly" /></th>
                <th style={thStyle} onClick={() => toggleSort('renewal')}>Renovação<SortIcon col="renewal" /></th>
                <th style={thStyle} onClick={() => toggleSort('status')}>Status<SortIcon col="status" /></th>
                <th style={{ ...thStyle, cursor: 'default' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr key={s.id} style={{ animation: `slideUp 0.3s ease ${i * 0.04}s both` }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: (CATEGORY_COLORS[s.category] || '#64748b') + '18',
                        color: CATEGORY_COLORS[s.category] || '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 13, fontFamily: "'Sora', sans-serif", flexShrink: 0,
                      }}>{initials(s.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, fontFamily: "'Sora', sans-serif" }}>{fmtBRL(s.value)}</td>
                  <td style={tdStyle}>{s.period}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#0d9488', fontFamily: "'Sora', sans-serif" }}>{fmtBRL(s.monthly_value)}</td>
                  <td style={tdStyle}>{s.renewal_date ? fmtDate(s.renewal_date) : '—'}</td>
                  <td style={tdStyle}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: STATUS_BG[s.status], color: STATUS_COLORS[s.status],
                    }}>{s.status}</span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => goToAlerts()} style={{
                      background: 'none', border: 'none', color: '#0d9488',
                      fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      textDecoration: 'underline', textUnderlineOffset: 2,
                    }}>Configurar Alerta</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>Distribuição por Categoria</h3>
          {chartData.length > 0 ? <DonutChart data={chartData} total={stats.monthly} /> : <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', padding: 32 }}>Sem dados para exibir.</p>}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 14, padding: 28, color: '#fff' }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Resumo Rápido</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Próxima Renovação</p>
              <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
                {nextRenewal ? `${fmtDate(nextRenewal.renewal_date)} — ${nextRenewal.name}` : '—'}
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Maior Gasto</p>
                <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: '#f87171' }}>
                  {highest ? `${fmtBRL(highest.monthly_value)}/mês` : '—'}
                </p>
                <p style={{ fontSize: 12, color: '#64748b' }}>{highest?.name || ''}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Menor Gasto</p>
                <p style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: '#34d399' }}>
                  {lowest ? `${fmtBRL(lowest.monthly_value)}/mês` : '—'}
                </p>
                <p style={{ fontSize: 12, color: '#64748b' }}>{lowest?.name || ''}</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #334155', paddingTop: 16 }}>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' }}>Economia se cancelar pausadas</p>
              <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: '#fbbf24' }}>
                {fmtBRL(pausedSavings)}<span style={{ fontSize: 14, fontWeight: 500 }}>/mês</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
