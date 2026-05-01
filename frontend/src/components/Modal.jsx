export default function Modal({ show, title, message, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'overlayIn 0.2s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '32px 36px', maxWidth: 440, width: '90%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'scaleIn 0.25s ease',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#0f172a' }}>{title}</h3>
        <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.6, marginBottom: 28 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '10px 24px', borderRadius: 10, border: '1px solid #e2e8f0',
            background: '#fff', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>Cancelar</button>
          <button onClick={onConfirm} style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #0d9488, #0f766e)', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(13,148,136,0.3)',
            fontFamily: "'DM Sans', sans-serif",
          }}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
