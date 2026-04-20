import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Usage:
 *   const [confirm, setConfirm] = useState(null);
 *
 *   setConfirm({
 *     title: 'Delete Seller?',
 *     message: `"${name}" will be permanently removed.`,
 *     onConfirm: () => doDelete(id),
 *   });
 *
 *   {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
 */
export default function ConfirmDialog({ title, message, onConfirm, onClose, danger = true }) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: 400, padding: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: danger ? 'var(--red-dim)' : 'var(--accent-dim)',
            border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: danger ? 'var(--red)' : 'var(--accent)',
          }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: 8
            }}>
              {title}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {message}
            </div>
          </div>
          <button className="modal-close" onClick={onClose} style={{ marginTop: -4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? 'btn-red' : 'btn-primary'}`}
            onClick={handleConfirm}
          >
            {danger ? '🗑 Delete' : '✓ Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
