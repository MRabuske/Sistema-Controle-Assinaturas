import React from 'react';

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => onRemove(t.id)} style={{
          animation: t.leaving ? 'toastOut 0.3s ease forwards' : 'toastIn 0.4s ease',
          background: t.type === 'error' ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'linear-gradient(135deg, #0d9488, #0f766e)',
          color: '#fff', padding: '14px 24px', borderRadius: 12,
          fontSize: 14, fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          cursor: 'pointer', maxWidth: 360, fontFamily: "'DM Sans', sans-serif",
        }}>{t.msg}</div>
      ))}
    </div>
  );
}
