import { useState } from 'react';
import { api, setToken } from '../services/api';

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: 10,
  border: '1.5px solid #e2e8f0', fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", color: '#1e293b',
  background: '#fff', outline: 'none',
};

export default function Login({ onLogin, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (isRegister) {
        if (!form.name) { setError('Nome é obrigatório.'); setLoading(false); return; }
        res = await api.register(form.name, form.email, form.password);
      } else {
        res = await api.login(form.email, form.password);
      }
      setToken(res.token);
      onLogin(res.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdfa 0%, #f1f5f9 50%, #eef2ff 100%)', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 420, width: '100%',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)', animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #0d9488, #0f766e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: 24, fontFamily: "'Sora', sans-serif",
          }}>S</div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
            Sub<span style={{ color: '#0d9488' }}>Control</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            {isRegister ? 'Crie sua conta' : 'Faça login para continuar'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Nome</label>
              <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Seu nome" />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Email</label>
            <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="seu@email.com" required />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 6 }}>Senha</label>
            <input style={inputStyle} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Sua senha" required />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff',
            fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
            fontFamily: "'Sora', sans-serif", boxShadow: '0 4px 16px rgba(13,148,136,0.3)',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Carregando...' : (isRegister ? 'Criar Conta' : 'Entrar')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
          {isRegister ? 'Já tem conta? ' : 'Não tem conta? '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{
            background: 'none', border: 'none', color: '#0d9488', fontWeight: 600,
            cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
          }}>
            {isRegister ? 'Fazer login' : 'Criar conta'}
          </button>
        </p>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#94a3b8' }}>
          Usuário demo: admin@subcontrol.com / admin123
        </p>
      </div>
    </div>
  );
}
