import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { useMaterials } from './materials';
import { DEFAULT_COMMISSION, DEFAULT_LABOUR } from './utils';

// Settings → Materials: the list shown in every material picklist, with the seller
// commission (%) and labour charge (₹ per bag) applied when a seller is registered.
// Removing a material only hides it from picklists — existing records keep their material,
// and changing a rate only affects sellers registered afterwards.
const rateInputS = { padding: '7px 9px', fontSize: 13, textAlign: 'right' };

export default function MaterialsSettings({ onClose }) {
  const { materialConfig, saveMaterials } = useMaterials();
  const [list, setList] = useState(() => materialConfig.map(m => ({ ...m, commission: String(m.commission), labour: String(m.labour) })));
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const add = () => {
    const name = newName.trim().toUpperCase();
    if (!name) return;
    if (list.some(m => m.name === name)) return toast.error(`${name} is already in the list`);
    if (name.length > 30) return toast.error('Keep the name to 30 characters or less');
    setList(l => [...l, { name, commission: String(DEFAULT_COMMISSION), labour: String(DEFAULT_LABOUR) }]);
    setNewName('');
  };

  const update = (i, field, value) => setList(l => l.map((m, k) => (k === i ? { ...m, [field]: value } : m)));

  const move = (i, dir) => setList(l => {
    const j = i + dir;
    if (j < 0 || j >= l.length) return l;
    const next = [...l];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });

  const remove = (i) => setList(l => l.filter((_, k) => k !== i));

  const save = async () => {
    if (!list.length) return toast.error('Keep at least one material');
    for (const m of list) {
      const c = Number(m.commission), lb = Number(m.labour);
      if (m.commission === '' || isNaN(c) || c < 0 || c > 100) return toast.error(`Enter commission 0–100% for ${m.name}`);
      if (m.labour === '' || isNaN(lb) || lb < 0) return toast.error(`Enter a valid labour charge for ${m.name}`);
    }
    setSaving(true);
    try {
      await saveMaterials(list.map(m => ({ name: m.name, commission: Number(m.commission), labour: Number(m.labour) })));
      toast.success('Materials saved');
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save materials');
    }
    setSaving(false);
  };

  const cols = '24px 1fr 96px 108px 30px 30px 34px';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ marginBottom: 8 }}>
          <div className="modal-title">Materials</div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Shown in every material dropdown, in this order. Commission and labour are applied to a seller when they're registered with that material —
          changing a rate affects new sellers only. Removing a material hides it from dropdowns; existing records keep it.
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input className="form-input" value={newName} placeholder="New material, e.g. GARLIC"
            onChange={e => setNewName(e.target.value.toUpperCase())}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
          <button className="btn btn-secondary" type="button" onClick={add}><Plus size={15} /> Add</button>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 8, padding: '8px 12px', background: 'var(--bg-panel)',
            borderBottom: '1px solid var(--border)', fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            <span>#</span><span>Material</span><span style={{ textAlign: 'right' }}>Commission %</span><span style={{ textAlign: 'right' }}>Labour ₹/bag</span><span /><span /><span />
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {list.map((m, i) => (
              <div key={m.name} style={{ display: 'grid', gridTemplateColumns: cols, gap: 8, alignItems: 'center', padding: '8px 12px',
                background: i % 2 ? 'var(--bg-panel)' : 'var(--bg-card)', borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{i + 1}</span>
                <span style={{ fontWeight: 600 }}>{m.name}</span>
                <input className="form-input" type="number" min="0" max="100" step="0.01" style={rateInputS}
                  value={m.commission} onChange={e => update(i, 'commission', e.target.value)} onWheel={e => e.target.blur()} />
                <input className="form-input" type="number" min="0" step="0.5" style={rateInputS}
                  value={m.labour} onChange={e => update(i, 'labour', e.target.value)} onWheel={e => e.target.blur()} />
                <button className="icon-btn" style={{ width: 30, height: 30 }} title="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} /></button>
                <button className="icon-btn" style={{ width: 30, height: 30 }} title="Move down" disabled={i === list.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} /></button>
                <button className="btn btn-red btn-sm" style={{ padding: '7px 9px' }} title="Remove" disabled={list.length === 1} onClick={() => remove(i)}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <Check size={15} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
