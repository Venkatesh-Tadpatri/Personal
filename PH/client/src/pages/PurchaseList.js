import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Save, RotateCcw, RefreshCw, Search, Edit2, Trash2, Check, X, Wallet, ChevronRight, ChevronDown } from 'lucide-react';
import axios from 'axios';
import ConfirmDialog from '../ConfirmDialog';
import { useSort, SortTh } from '../sorting';
import { todayISO, fmtDate, fmtINR } from '../utils';
import { useMaterials, withCurrent } from '../materials';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

const emptyForm = () => ({
  purchased_from: '',
  material: '',
  purchase_date: todayISO(),
  num_bags: '',
  weight: '',
  amount: '',
  note: '',
});

const fmtKg = (n) => Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

// Average price per kg = Amount ÷ Weight (null when either is missing)
const avgPerKg = (amount, weight) => {
  const a = Number(amount), w = Number(weight);
  return a > 0 && w > 0 ? a / w : null;
};
const fmtAvg = (v) => (v === null ? '—' : '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

// Read-only box that updates as Amount / Weight are typed
function AvgPerKg({ amount, weight }) {
  const v = avgPerKg(amount, weight);
  return (
    <div className="form-input" title="Calculated: Amount ÷ Weight"
      style={{ background: 'var(--bg-deep)', color: v === null ? 'var(--text-muted)' : 'var(--green)', fontWeight: 700, cursor: 'default', textTransform: 'none' }}>
      {v === null ? 'Enter amount & weight' : fmtAvg(v)}
    </div>
  );
}

// Returns an error message, or null when the entry is valid
const validate = (f) => {
  if (!f.purchased_from.trim()) return 'Enter who it was purchased from';
  if (!f.material) return 'Select material';
  if (!f.purchase_date) return 'Select date';
  if (f.num_bags !== '' && (!Number.isInteger(Number(f.num_bags)) || Number(f.num_bags) < 0)) return 'Number of bags must be a whole number';
  if (f.weight !== '' && (isNaN(Number(f.weight)) || Number(f.weight) < 0)) return 'Enter valid weight';
  if (f.amount === '' || isNaN(Number(f.amount)) || Number(f.amount) < 0) return 'Enter valid amount';
  return null;
};

const toPayload = (f) => ({
  purchased_from: f.purchased_from.trim().toUpperCase(),
  material:       f.material,
  purchase_date:  f.purchase_date,
  num_bags:       parseInt(f.num_bags) || 0,
  weight:         Number(f.weight) || 0,
  amount:         Number(f.amount),
  note:           f.note.trim(),
});

function Field({ label, required, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color:'var(--red)' }}> *</span>}</label>
      {children}
    </div>
  );
}

function EditPurchaseModal({ purchase, onClose, onSaved }) {
  const { materials: MATERIALS } = useMaterials();
  const [form, setForm] = useState({
    purchased_from: purchase.purchased_from || '',
    material:       purchase.material || '',
    purchase_date:  purchase.purchase_date || todayISO(),
    num_bags:       Number(purchase.num_bags) > 0 ? String(purchase.num_bags) : '',
    weight:         Number(purchase.weight) > 0 ? String(purchase.weight) : '',
    amount:         String(purchase.amount ?? ''),
    note:           purchase.note || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: k === 'purchased_from' ? e.target.value.toUpperCase() : e.target.value }));

  const save = async () => {
    const err = validate(form);
    if (err) return toast.error(err);
    setSaving(true);
    try {
      await API.put(`/api/purchases/${purchase.id}`, toPayload(form));
      toast.success('Purchase updated');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to update purchase');
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">✏️ Edit Purchase</div>
          <button className="modal-close" onClick={onClose}><X size={20}/></button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Field label="Purchased From" required>
            <input className="form-input" value={form.purchased_from} onChange={set('purchased_from')} placeholder="NAME / PARTY" />
          </Field>
          <Field label="Material" required>
            <select className="form-select" value={form.material} onChange={set('material')}>
              <option value="">— Select Material —</option>
              {withCurrent(MATERIALS, form.material).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Date" required>
            <input className="form-input" type="date" value={form.purchase_date} onChange={set('purchase_date')} />
          </Field>
          <Field label="Number of Bags">
            <input className="form-input" type="number" value={form.num_bags} onChange={set('num_bags')} placeholder="0" min="0" step="1" onWheel={e => e.target.blur()} />
          </Field>
          <Field label="Weight (kg)">
            <input className="form-input" type="number" value={form.weight} onChange={set('weight')} placeholder="0" min="0" step="0.01" onWheel={e => e.target.blur()} />
          </Field>
          <Field label="Amount (₹)" required>
            <input className="form-input" type="number" value={form.amount} onChange={set('amount')} placeholder="0" min="0" onWheel={e => e.target.blur()} />
          </Field>
          <Field label="Avg / kg (₹)">
            <AvgPerKg amount={form.amount} weight={form.weight} />
          </Field>
          <Field label="Note">
            <input className="form-input" value={form.note} onChange={set('note')} placeholder="Optional" />
          </Field>
        </div>
        <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <Check size={15}/> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Paid / balance / status for one purchase
const paymentStatus = (p) => {
  const amount = Number(p.amount) || 0;
  const paid = Number(p.paid) || 0;
  const balance = Math.max(0, amount - paid);
  const status = paid <= 0 ? 'UNPAID' : balance <= 0.001 ? 'PAID' : 'PARTIAL';
  return { amount, paid, balance, status };
};

const STATUS_BADGE = { UNPAID: 'badge-red', PARTIAL: 'badge-amber', PAID: 'badge-green' };

// Pay against a purchase: history of payments + add a partial or full payment
function PayPurchaseModal({ purchase, onClose, onChanged }) {
  const { amount, paid, balance, status } = paymentStatus(purchase);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const loadPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const res = await API.get(`/api/purchases/${purchase.id}/payments`);
      setPayments(res.data.data || []);
    } catch { setPayments([]); }
    setLoadingPayments(false);
  }, [purchase.id]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const save = async () => {
    const amt = Number(payAmount);
    if (!payAmount || isNaN(amt) || amt <= 0) return toast.error('Enter the amount paid');
    if (amt > balance + 0.001) return toast.error(`Can't pay more than the balance ₹${fmtINR(balance)}`);
    if (!payDate) return toast.error('Select the payment date');
    setSaving(true);
    try {
      await API.post(`/api/purchases/${purchase.id}/payments`, { amount: amt, payment_date: payDate, note: note.trim() });
      toast.success(amt >= balance - 0.001 ? `Fully paid — ₹${fmtINR(amt)}` : `₹${fmtINR(amt)} paid — ₹${fmtINR(balance - amt)} balance`);
      onChanged();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to save payment');
    }
    setSaving(false);
  };

  const removePayment = (pay) => setConfirm({
    title: 'Delete Payment?',
    message: `Payment of ₹${fmtINR(pay.amount)} on ${fmtDate(pay.payment_date)} will be removed and added back to the balance.`,
    onConfirm: async () => {
      try {
        await API.delete(`/api/purchase-payments/${pay.id}`);
        toast.success('Payment deleted');
        onChanged();
        onClose();
      } catch (err) {
        toast.error(err?.response?.data?.error || 'Failed to delete payment');
      }
    },
  });

  const summaryCell = (label, value, color) => (
    <div style={{ flex: 1, minWidth: 120, background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 800, color }}>{value}</div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 640, width: '95%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ marginBottom: 14 }}>
          <div>
            <div className="modal-title">💳 Pay — {purchase.purchased_from}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {purchase.material} · {fmtDate(purchase.purchase_date)}{Number(purchase.weight) > 0 ? ` · ${fmtKg(purchase.weight)} kg` : ''}
              {' · '}<span className={`badge ${STATUS_BADGE[status]}`} style={{ fontSize: 10 }}>{status}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          {summaryCell('Purchase Amount', `₹${fmtINR(amount)}`, 'var(--accent)')}
          {summaryCell('Paid', `₹${fmtINR(paid)}`, 'var(--green)')}
          {summaryCell('Balance', `₹${fmtINR(balance)}`, balance > 0 ? 'var(--red)' : 'var(--green)')}
        </div>

        {balance > 0 ? (
          <div style={{ border: '1px dashed rgba(16,185,129,0.45)', background: 'var(--green-dim)', borderRadius: 10, padding: 14, marginBottom: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <Field label="Amount Paid (₹)" required>
                <input className="form-input" type="number" min="0" value={payAmount} onChange={e => setPayAmount(e.target.value)} onWheel={e => e.target.blur()} autoFocus
                  placeholder={`Up to ₹${fmtINR(balance)}`} onKeyDown={e => { if (e.key === 'Enter') save(); }} />
              </Field>
              <Field label="Payment Date" required>
                <input className="form-input" type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
              </Field>
              <Field label="Note">
                <input className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Cash / UPI" style={{ textTransform: 'none' }} />
              </Field>
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px 14px', background: 'var(--green-dim)', color: 'var(--green)', borderRadius: 10, fontWeight: 700, fontSize: 13, marginBottom: 18 }}>
            ✅ Fully paid
          </div>
        )}

        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Payment History</div>
        <div className="table-wrapper" style={{ maxHeight: 220, overflowY: 'auto' }}>
          {loadingPayments ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>Loading…</div>
          ) : payments.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No payments yet</div>
          ) : (
            <table>
              <thead><tr><th>#</th><th>Date</th><th style={{ textAlign: 'right' }}>Amount</th><th>Note</th><th /></tr></thead>
              <tbody>
                {payments.map((pay, i) => (
                  <tr key={pay.id}>
                    <td className="td-muted" style={{ fontSize: 12 }}>{i + 1}</td>
                    <td>{fmtDate(pay.payment_date)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--green)' }}>₹{fmtINR(pay.amount)}</td>
                    <td className="td-muted" style={{ fontSize: 12 }}>{pay.note || '—'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-red btn-sm" onClick={() => removePayment(pay)} title="Delete payment"><Trash2 size={12} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>{balance > 0 ? 'Cancel' : 'Close'}</button>
          {balance > 0 && (
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              <Wallet size={15} /> {saving ? 'Saving...' : 'Save Payment'}
            </button>
          )}
        </div>
        {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
      </div>
    </div>
  );
}

export default function PurchaseList() {
  const { materials: MATERIALS } = useMaterials();
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [filterDate, setFilterDate] = useState(''); // empty = all dates
  const [editing, setEditing] = useState(null);
  const [paying, setPaying] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set()); // parties (Purchased From) showing their purchases
  const toggleExpanded = (name) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(name)) next.delete(name); else next.add(name);
    return next;
  });
  const [filterStatus, setFilterStatus] = useState(''); // '' | UNPAID | PARTIAL | PAID
  const [confirm, setConfirm] = useState(null);
  const { sort, toggleSort, sortRows } = useSort('date', 'desc');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/purchases');
      setPurchases(res.data.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load purchases');
      setPurchases([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: k === 'purchased_from' ? e.target.value.toUpperCase() : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const err = validate(form);
    if (err) return toast.error(err);
    setSaving(true);
    try {
      await API.post('/api/purchases', toPayload(form));
      toast.success(`Purchase from ${form.purchased_from.trim().toUpperCase()} added — ₹${fmtINR(form.amount)}`);
      // Keep material and date for quick entry of several purchases in a row
      setForm(f => ({ ...emptyForm(), material: f.material, purchase_date: f.purchase_date }));
      load();
    } catch (e2) {
      toast.error(e2?.response?.data?.error || 'Failed to add purchase');
    }
    setSaving(false);
  };

  const remove = (p) => setConfirm({
    title: 'Delete Purchase?',
    message: `Purchase from "${p.purchased_from}" on ${fmtDate(p.purchase_date)} (₹${fmtINR(p.amount)}) will be permanently removed.`,
    onConfirm: async () => {
      try {
        await API.delete(`/api/purchases/${p.id}`);
        toast.success('Purchase deleted');
        load();
      } catch (e) {
        toast.error(e?.response?.data?.error || 'Failed to delete purchase');
      }
    },
  });

  const q = search.trim().toUpperCase();
  const filtered = purchases.filter(p =>
    (!q || (p.purchased_from || '').toUpperCase().includes(q) || (p.note || '').toUpperCase().includes(q)) &&
    (!filterMaterial || p.material === filterMaterial) &&
    (!filterDate || p.purchase_date === filterDate) &&
    (!filterStatus || paymentStatus(p).status === filterStatus)
  );
  const sorted = sortRows(filtered, {
    date:     p => p.purchase_date,
    from:     p => p.purchased_from,
    material: p => p.material,
    bags:     p => Number(p.num_bags) || 0,
    weight:   p => Number(p.weight) || 0,
    amount:   p => Number(p.amount) || 0,
    avg:      p => avgPerKg(p.amount, p.weight),
    paid:     p => paymentStatus(p).paid,
    balance:  p => paymentStatus(p).balance,
    status:   p => ['UNPAID', 'PARTIAL', 'PAID'].indexOf(paymentStatus(p).status),
    note:     p => p.note,
  });
  const groupMap = new Map();
  sorted.forEach(p => {
    const name = (p.purchased_from || '').trim().toUpperCase();
    if (!groupMap.has(name)) groupMap.set(name, []);
    groupMap.get(name).push(p);
  });
  const groups = [...groupMap].map(([name, list]) => {
    const sum = (f) => list.reduce((s, p) => s + f(p), 0);
    const paid = sum(p => paymentStatus(p).paid);
    const balance = sum(p => paymentStatus(p).balance);
    return {
      name, purchases: list,
      latestDate: list.map(p => p.purchase_date).sort().reverse()[0],
      materials: [...new Set(list.map(p => p.material))],
      bags: sum(p => Number(p.num_bags) || 0),
      weight: sum(p => Number(p.weight) || 0),
      amount: sum(p => Number(p.amount) || 0),
      paid, balance,
      status: balance <= 0.001 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'UNPAID',
    };
  });
  const sortedGroups = sortRows(groups, {
    date:     g => g.latestDate,
    from:     g => g.name,
    material: g => g.materials.join(', '),
    bags:     g => g.bags,
    weight:   g => g.weight,
    amount:   g => g.amount,
    avg:      g => avgPerKg(g.amount, g.weight),
    paid:     g => g.paid,
    balance:  g => g.balance,
    status:   g => ['UNPAID', 'PARTIAL', 'PAID'].indexOf(g.status),
    note:     g => (g.purchases.length === 1 ? g.purchases[0].note : ''),
  });
  // Cells shared by a single-purchase row and a purchase inside an expanded party
  const purchaseCells = (p, name) => {
    const pay = paymentStatus(p);
    return (
      <>
        <td style={{ fontWeight:600 }}>{name}</td>
        <td><span className="badge badge-purple">{p.material}</span></td>
        <td style={{ textAlign:'right' }}>{Number(p.num_bags) > 0 ? p.num_bags : '—'}</td>
        <td style={{ textAlign:'right' }}>{Number(p.weight) > 0 ? fmtKg(p.weight) : '—'}</td>
        <td style={{ textAlign:'right', fontWeight:700, color:'var(--accent)' }}>₹{fmtINR(p.amount)}</td>
        <td style={{ textAlign:'right', color:'var(--text-secondary)' }}>{fmtAvg(avgPerKg(p.amount, p.weight))}</td>
        <td style={{ textAlign:'right', fontWeight:600, color: pay.paid > 0 ? 'var(--green)' : 'var(--text-muted)' }}>{pay.paid > 0 ? '₹' + fmtINR(pay.paid) : '—'}</td>
        <td style={{ textAlign:'right', fontWeight:700, color: pay.balance > 0 ? 'var(--red)' : 'var(--green)' }}>₹{fmtINR(pay.balance)}</td>
        <td style={{ textAlign:'center' }}><span className={`badge ${STATUS_BADGE[pay.status]}`}>{pay.status}</span></td>
        <td className="td-muted" style={{ fontSize:12, whiteSpace:'normal', maxWidth:260 }}>{p.note || '—'}</td>
        <td style={{ textAlign:'center' }}>
          <div style={{ display:'inline-flex', gap:8 }}>
            <button className="btn btn-green btn-sm" onClick={() => setPaying(p)} title={pay.balance > 0 ? 'Pay' : 'View payments'}>
              <Wallet size={13} /> <span className="btn-text">{pay.balance > 0 ? 'Pay' : 'Paid'}</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(p)} title="Edit">
              <Edit2 size={13} />
            </button>
            <button className="btn btn-red btn-sm" onClick={() => remove(p)} title="Delete">
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </>
    );
  };
  const totalBags   = filtered.reduce((s, p) => s + (Number(p.num_bags) || 0), 0);
  const totalWeight = filtered.reduce((s, p) => s + (Number(p.weight) || 0), 0);
  const totalAmount = filtered.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalPaid    = filtered.reduce((s, p) => s + paymentStatus(p).paid, 0);
  const totalBalance = filtered.reduce((s, p) => s + paymentStatus(p).balance, 0);
  const hasFilter = !!(q || filterMaterial || filterDate || filterStatus);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Purchase List</div>
          <div className="page-subtitle">Record stock you purchased and view all purchases</div>
        </div>
        <button className="btn btn-secondary" onClick={load} type="button">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Add purchase */}
      <div className="card" style={{ marginBottom:24 }}>
        <div className="card-title">🧾 Add Purchase</div>
        <form onSubmit={submit} noValidate>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:18, marginBottom:18 }}>
            <Field label="Purchased From" required>
              <input className="form-input" value={form.purchased_from} onChange={set('purchased_from')} placeholder="NAME / PARTY" />
            </Field>
            <Field label="Material" required>
              <select className="form-select" value={form.material} onChange={set('material')}>
                <option value="">— Select Material —</option>
                {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Date" required>
              <input className="form-input" type="date" value={form.purchase_date} onChange={set('purchase_date')} />
            </Field>
            <Field label="Number of Bags">
              <input className="form-input" type="number" value={form.num_bags} onChange={set('num_bags')} placeholder="e.g. 10" min="0" step="1" onWheel={e => e.target.blur()} />
            </Field>
            <Field label="Weight (kg)">
              <input className="form-input" type="number" value={form.weight} onChange={set('weight')} placeholder="e.g. 250" min="0" step="0.01" onWheel={e => e.target.blur()} />
            </Field>
            <Field label="Amount (₹)" required>
              <input className="form-input" type="number" value={form.amount} onChange={set('amount')} placeholder="e.g. 15000" min="0" onWheel={e => e.target.blur()} />
            </Field>
            <Field label="Avg / kg (₹)">
              <AvgPerKg amount={form.amount} weight={form.weight} />
            </Field>
            <Field label="Note">
              <input className="form-input" value={form.note} onChange={set('note')} placeholder="Optional" />
            </Field>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={15} /> {saving ? 'Saving...' : 'Add Purchase'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setForm(emptyForm())}>
              <RotateCcw size={15} /> Clear Form
            </button>
          </div>
        </form>
      </div>

      {/* Totals for the current filter */}
      <div className="stats-grid">
        <div className="stat-card amber">
          <div className="stat-value">{filtered.length}</div>
          <div className="stat-label">Purchases</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-value">{fmtKg(totalWeight)} kg</div>
          <div className="stat-label">Total Weight</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">₹{fmtINR(totalAmount)}</div>
          <div className="stat-label">Total Amount</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value" style={{ color:'var(--green)' }}>₹{fmtINR(totalPaid)}</div>
          <div className="stat-label">Paid</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-value" style={{ color: totalBalance > 0 ? 'var(--red)' : 'var(--green)' }}>₹{fmtINR(totalBalance)}</div>
          <div className="stat-label">Balance Due</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-box">
          <Search className="search-icon" />
          <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search purchased from or note..." />
        </div>
        <input className="form-input" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{ width:180 }} />
        <button className="btn btn-secondary btn-sm" type="button" onClick={() => setFilterDate(todayISO())}>Today</button>
        <button className="btn btn-secondary btn-sm" type="button" onClick={() => setFilterDate('')}>All</button>
        <select className="form-select" value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)} style={{ width:200 }}>
          <option value="">ALL MATERIALS</option>
          {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width:170 }}>
          <option value="">ALL STATUS</option>
          <option value="UNPAID">UNPAID</option>
          <option value="PARTIAL">PARTIAL</option>
          <option value="PAID">PAID</option>
        </select>
      </div>

      {/* List */}
      <div className="table-wrapper">
        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading purchases...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧾</div>
            <h3>No purchases found</h3>
            <p style={{ fontSize:12, marginTop:6 }}>
              {hasFilter ? 'Adjust or clear the filters' : 'Add your first purchase using the form above'}
            </p>
            {hasFilter && (
              <button className="btn btn-secondary btn-sm" style={{ marginTop:14 }}
                onClick={() => { setSearch(''); setFilterMaterial(''); setFilterDate(''); setFilterStatus(''); }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <SortTh col="date" label="Date" sort={sort} onSort={toggleSort} />
                <SortTh col="from" label="Purchased From" sort={sort} onSort={toggleSort} />
                <SortTh col="material" label="Material" sort={sort} onSort={toggleSort} />
                <SortTh col="bags" label="Bags" align="right" sort={sort} onSort={toggleSort} />
                <SortTh col="weight" label="Weight (kg)" align="right" sort={sort} onSort={toggleSort} />
                <SortTh col="amount" label="Amount (₹)" align="right" sort={sort} onSort={toggleSort} />
                <SortTh col="avg" label="Avg / kg (₹)" align="right" sort={sort} onSort={toggleSort} />
                <SortTh col="paid" label="Paid (₹)" align="right" sort={sort} onSort={toggleSort} />
                <SortTh col="balance" label="Balance (₹)" align="right" sort={sort} onSort={toggleSort} />
                <SortTh col="status" label="Status" align="center" sort={sort} onSort={toggleSort} />
                <SortTh col="note" label="Note" sort={sort} onSort={toggleSort} />
                <th style={{ textAlign:'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedGroups.map((g, i) => {
                const multi = g.purchases.length > 1;
                const isOpen = multi && expanded.has(g.name);
                const rowNo = <td className="td-muted" style={{ fontSize:12 }}>{i + 1}</td>;
                // One purchase → a normal row with its own actions
                if (!multi) {
                  const p = g.purchases[0];
                  return <tr key={'p' + p.id}>{rowNo}<td>{fmtDate(p.purchase_date)}</td>{purchaseCells(p, p.purchased_from)}</tr>;
                }
                // Several purchases from the same party → one summary row, expandable
                return (
                  <React.Fragment key={'g' + g.name}>
                    <tr onClick={() => toggleExpanded(g.name)} style={{ cursor:'pointer', background: isOpen ? 'var(--bg-hover)' : undefined }}
                      title={isOpen ? 'Hide purchases' : 'Show purchases'}>
                      {rowNo}
                      <td>{fmtDate(g.latestDate)}</td>
                      <td style={{ fontWeight:700 }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                          {isOpen ? <ChevronDown size={14} style={{ color:'var(--accent)' }} /> : <ChevronRight size={14} />}
                          {g.name}
                          <span className="badge badge-blue" style={{ fontSize:10, padding:'1px 7px' }}>{g.purchases.length}</span>
                        </span>
                      </td>
                      <td>
                        <span style={{ display:'inline-flex', gap:4, flexWrap:'wrap' }}>
                          {g.materials.map(m => <span key={m} className="badge badge-purple">{m}</span>)}
                        </span>
                      </td>
                      <td style={{ textAlign:'right', fontWeight:700 }}>{g.bags > 0 ? g.bags : '—'}</td>
                      <td style={{ textAlign:'right', fontWeight:700 }}>{g.weight > 0 ? fmtKg(g.weight) : '—'}</td>
                      <td style={{ textAlign:'right', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(g.amount)}</td>
                      <td style={{ textAlign:'right', color:'var(--text-secondary)' }}>{fmtAvg(avgPerKg(g.amount, g.weight))}</td>
                      <td style={{ textAlign:'right', fontWeight:700, color: g.paid > 0 ? 'var(--green)' : 'var(--text-muted)' }}>{g.paid > 0 ? '₹' + fmtINR(g.paid) : '—'}</td>
                      <td style={{ textAlign:'right', fontWeight:800, color: g.balance > 0 ? 'var(--red)' : 'var(--green)' }}>₹{fmtINR(g.balance)}</td>
                      <td style={{ textAlign:'center' }}><span className={`badge ${STATUS_BADGE[g.status]}`}>{g.status}</span></td>
                      <td className="td-muted" style={{ fontSize:12 }}>—</td>
                      <td style={{ textAlign:'center' }}>
                        <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); toggleExpanded(g.name); }}>
                          {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />} <span className="btn-text">{isOpen ? 'Hide' : g.purchases.length + ' purchases'}</span>
                        </button>
                      </td>
                    </tr>
                    {isOpen && g.purchases.map((p, j) => (
                      <tr key={'p' + p.id} style={{ background:'var(--bg-deep)' }}>
                        <td className="td-muted" style={{ fontSize:11, paddingLeft:18 }}>{i + 1}.{j + 1}</td>
                        <td>{fmtDate(p.purchase_date)}</td>
                        {purchaseCells(p, <span style={{ color:'var(--text-secondary)', paddingLeft:8 }}>↳ {p.purchased_from}</span>)}
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
              <tr style={{ background:'var(--bg-panel)' }}>
                <td />
                <td colSpan={3} style={{ fontWeight:700, color:'var(--text-muted)', fontSize:12 }}>TOTAL</td>
                <td style={{ textAlign:'right', fontWeight:800 }}>{totalBags || '—'}</td>
                <td style={{ textAlign:'right', fontWeight:800, color:'var(--blue)' }}>{fmtKg(totalWeight)}</td>
                <td style={{ textAlign:'right', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(totalAmount)}</td>
                <td style={{ textAlign:'right', fontWeight:800, color:'var(--text-secondary)' }} title="Overall: total amount ÷ total weight">{fmtAvg(avgPerKg(totalAmount, totalWeight))}</td>
                <td style={{ textAlign:'right', fontWeight:800, color:'var(--green)' }}>₹{fmtINR(totalPaid)}</td>
                <td style={{ textAlign:'right', fontWeight:800, color: totalBalance > 0 ? 'var(--red)' : 'var(--green)' }}>₹{fmtINR(totalBalance)}</td>
                <td colSpan={3} />
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {editing && <EditPurchaseModal purchase={editing} onClose={() => setEditing(null)} onSaved={load} />}
      {paying && <PayPurchaseModal purchase={paying} onClose={() => setPaying(null)} onChanged={load} />}
      {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
    </div>
  );
}
