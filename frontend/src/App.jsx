import React, { useState, useCallback } from 'react';
import { clearToken } from './services/api';
import Login from './pages/Login';
import Cadastrar from './pages/Cadastrar';
import Consultar from './pages/Consultar';
import Alertas from './pages/Alertas';
import Navbar from './components/Navbar';
import ToastContainer from './components/Toast';

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f1f5f9; color: #1e293b; min-height: 100vh; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes toastIn { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
  @keyframes toastOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }
  @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
  input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }
  input[type="number"] { -moz-appearance: textfield; }
  ::selection { background: #0d948833; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('consultar');
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x));
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 350);
    }, 3000);
  }, []);

  const handleLogout = () => { clearToken(); setUser(null); setPage('consultar'); };
  const goToAlerts = () => setPage('alertas');

  return (
    <>
      <style>{globalStyles}</style>
      {!user ? (
        <Login onLogin={setUser} showToast={showToast} />
      ) : (
        <div>
          <Navbar active={page} onChange={setPage} onLogout={handleLogout} userName={user.name} />
          {page === 'cadastrar' && <Cadastrar showToast={showToast} />}
          {page === 'consultar' && <Consultar goToAlerts={goToAlerts} />}
          {page === 'alertas' && <Alertas showToast={showToast} />}
        </div>
      )}
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(t => t.filter(x => x.id !== id))} />
    </>
  );
}
