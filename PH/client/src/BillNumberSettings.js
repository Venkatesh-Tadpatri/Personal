import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { X, Check } from 'lucide-react';

// Settings → Bill Number: format of seller bill numbers and the running counter.
// A number is issued the first time a seller's bill is opened or printed, then never changes.
const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

const format = (prefix, n, digits, suffix) =>
  `${prefix}${String(Math.max(0, parseInt(n) || 0)).padStart(Math.min(10, Math.max(1, parseInt(digits) || 1)), '0')}${suffix}`;

export default function BillNumberSettings({ onClose }) {
  const [form, setForm] = useState(null); // { prefix, suffix, start, digits }
  const [info, setInfo] = useState(null); // { next, nextBillNo, issued }
  const [resetCounter, setResetCounter] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get('/api/settings/bill-number')
      .then(res => {
        const d = res.data.data;
        setForm({ prefix: d.prefix, suffix: d.suffix, start: String(d.start), digits: String(d.digits) });
        setInfo(d);
      })
      .catch(() => toast.error('Could not load bill number settings — is the server running?'));
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  // Number the next bill will get once saved (same rule as the server)
  const nextNumber = form && info
    ? (resetCounter ? parseInt(form.start) || 0 : Math.max(info.next, parseInt(form.start) || 0))
    : 0;

  const save = async () => {
    const start = Number(form.start), digits = Number(form.digits);
    if (!Number.isInteger(start) || start < 0) return toast.error('Starting number must be a whole number');
    if (!Number.isInteger(digits) || digits < 1 || digits > 10) return toast.error('Number of digits must be 1–10');
    setSaving(true);
    try {
      await API.put('/api/settings/bill-number', { prefix: form.prefix, suffix: form.suffix, start, digits, resetCounter });
      toast.success('Bill number settings saved');
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save bill number settings');
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ marginBottom: 8 }}>
          <div className="modal-title">Bill Number</div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Used on seller bills. A seller gets the next number the first time their bill is opened or printed, and keeps it after that.
        </div>

        {!form ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Prefix</label>
                <input className="form-input" style={{ textTransform: 'none' }} value={form.prefix} onChange={set('prefix')} placeholder="e.g. PH/" maxLength={20} />
              </div>
              <div className="form-group">
                <label className="form-label">Suffix</label>
                <input className="form-input" style={{ textTransform: 'none' }} value={form.suffix} onChange={set('suffix')} placeholder="e.g. /25-26" maxLength={20} />
              </div>
              <div className="form-group">
                <label className="form-label">Starting Number</label>
                <input className="form-input" type="number" min="0" step="1" value={form.start} onChange={set('start')} onWheel={e => e.target.blur()} />
              </div>
              <div className="form-group">
                <label className="form-label">Number of Digits</label>
                <input className="form-input" type="number" min="1" max="10" step="1" value={form.digits} onChange={set('digits')} onWheel={e => e.target.blur()} />
              </div>
            </div>

            <div style={{ marginTop: 18, padding: '14px 16px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Next bill number</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{format(form.prefix, nextNumber, form.digits, form.suffix)}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {info.issued} bill{info.issued === 1 ? '' : 's'} issued so far · then {format(form.prefix, nextNumber + 1, form.digits, form.suffix)}, {format(form.prefix, nextNumber + 2, form.digits, form.suffix)}…
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 14, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={resetCounter} onChange={e => setResetCounter(e.target.checked)} style={{ marginTop: 3 }} />
              <span>
                Restart counter from the starting number
                <span style={{ display: 'block', fontSize: 11.5, color: 'var(--text-muted)' }}>
                  e.g. for a new financial year with a new prefix/suffix. Bills already issued keep their numbers; any number already used is skipped.
                </span>
              </span>
            </label>
          </>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving || !form}>
            <Check size={15} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
