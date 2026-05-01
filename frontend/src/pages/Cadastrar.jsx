import React, { useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';

const CATEGORIES = ['Streaming', 'Música', 'Produtividade', 'Saúde/Academia', 'Armazenamento/Cloud', 'Educação', 'Jogos', 'Delivery', 'Seguros', 'Outros'];
const PERIODS = ['Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual'];
const PAYMENTS = ['Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Pix', 'Débito Automático'];
const STATUSES = ['Ativa', 'Pausada', 'Cancelada'];

const inputStyle = (hasError) => ({
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1.5px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
  fontSize: 14, fontFamily: "'DM Sans', sans-serif",
  color: '#1e293b', background: '#fff', outline: 'none',
});

const selectStyle = (hasError) => ({
  ...inputStyle(hasError), appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 36,
});

function Field({ label, required, error, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontWeight: 500 }}>{error}</p>}
      {hint && <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export default function Cadastrar({ showToast }) {
  const emptyForm = { name: '', category: '', value: '', period: '', startDate: '', renewalDate: '', payment: '', status: 'Ativa', notes: '' };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const todayStr = new Date().toISOString().split('T')[0];

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Campo obrigatório.';
    const val = parseFloat(form.value);
    if (!form.value || isNaN(val) || val <= 0) e.value = 'O valor informado é inválido. Informe um valor numérico positivo.';
    if (!form.period) e.period = 'Campo obrigatório.';
    if (!form.renewalDate) e.renewalDate = 'Campo obrigatório.';
    else if (form.renewalDate < todayStr) e.renewalDate = 'A data de renovação não pode ser anterior à data atual.';
    if (!form.status) e.status = 'Campo obrigatório.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => { if (validate()) setModal(true); };

  const confirm = async () => {
    setLoading(true);
    try {
      await api.createSubscription({
        name: form.name.trim(),
        category: form.category || 'Outros',
        value: parseFloat(form.value),
        period: form.period,
        start_date: form.startDate || null,
        renewal_date: form.renewalDate,
        payment: form.payment || '',
        status: form.status,
        notes: form.notes,
      });
      setModal(false);
      setForm(emptyForm);
      setErrors({});
      showToast('Assinatura cadastrada com sucesso.');
    } catch (err) {
      setModal(false);
      if (err.data?.errors) {
        const map = {};
        err.data.errors.forEach(e => { map[e.field] = e.message; });
        setErrors(map);
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Cadastrar Assinatura</h1>
      <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32 }}>Adicione uma nova assinatura de serviço recorrente.</p>

      <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Nome do Serviço" required error={errors.name}>
              <input style={inputStyle(errors.name)} maxLength={100} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Netflix, Spotify..." />
            </Field>
          </div>
          <Field label="Categoria">
            <select style={selectStyle()} value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Selecione (padrão: Outros)</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Valor (R$)" required error={errors.value}>
            <input style={inputStyle(errors.value)} type="number" step="0.01" min="0.01" value={form.value} onChange={e => set('value', e.target.value)} placeholder="0,00" />
          </Field>
          <Field label="Periodicidade" required error={errors.period}>
            <select style={selectStyle(errors.period)} value={form.period} onChange={e => set('period', e.target.value)}>
              <option value="">Selecione</option>
              {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Data de Início" hint="Formato DD/MM/AAAA">
            <input style={inputStyle()} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
          </Field>
          <Field label="Próxima Renovação" required error={errors.renewalDate}>
            <input style={inputStyle(errors.renewalDate)} type="date" value={form.renewalDate} onChange={e => set('renewalDate', e.target.value)} min={todayStr} />
          </Field>
          <Field label="Forma de Pagamento">
            <select style={selectStyle()} value={form.payment} onChange={e => set('payment', e.target.value)}>
              <option value="">Selecione</option>
              {PAYMENTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Status" required error={errors.status}>
            <select style={selectStyle(errors.status)} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Observações" hint={`${form.notes.length}/500 caracteres`}>
              <textarea style={{ ...inputStyle(), minHeight: 80, resize: 'vertical' }} maxLength={500} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Anotações adicionais..." />
            </Field>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={() => { setForm(emptyForm); setErrors({}); }} style={{
            padding: '12px 28px', borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            padding: '12px 28px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(13,148,136,0.3)', fontFamily: "'DM Sans', sans-serif",
          }}>Gravar Assinatura</button>
        </div>

        <p style={{
          marginTop: 24, padding: '14px 18px', background: '#f0fdfa', borderRadius: 10,
          fontSize: 13, color: '#0f766e', lineHeight: 1.5, border: '1px solid #99f6e4',
        }}>
          Após o cadastro, o sistema calcula automaticamente o valor mensal equivalente com base na periodicidade informada.
        </p>
      </div>

      <Modal show={modal} title="Confirmar Cadastro"
        message={`Deseja confirmar o cadastro da assinatura ${form.name}?`}
        onConfirm={confirm} onCancel={() => setModal(false)} />
    </div>
  );
}
