import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Plus, Edit2, Trash2, Check, X, Printer, Eye, Wallet } from 'lucide-react';
import axios from 'axios';
import { todayISO } from '../utils';
import { buildBuyerBillHtml, groupBuyerRows, BILL_CSS, toIndianWords } from './BuyerList';
import ConfirmDialog from '../ConfirmDialog';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

const fmt = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
const MONTHS = [
  ['01', 'January'], ['02', 'February'], ['03', 'March'], ['04', 'April'],
  ['05', 'May'], ['06', 'June'], ['07', 'July'], ['08', 'August'],
  ['09', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December'],
];
const buyerLabourRate = (buyer) => Number(buyer?.labour_rate ?? 5) || 0;
const buyerExtraBags = (buyer) => Number(buyer?.extra_bags || 0) || 0;
const buyerExtraBagAmount = (buyer) => Number(buyer?.extra_bag_amount || 0) || 0;

// Pull the raw {seller, bag} rows for one buyer on one exact date(+material), in the
// same shape buildBuyerBillHtml expects — lets the ledger reprint any past day's bill
// without a server round-trip, since `sellers` is already loaded on this page.
function getBuyerSellerRows(sellers, buyerKey, date, material) {
  const rows = [];
  sellers.forEach(seller => {
    if (seller.entry_date !== date) return;
    if ((seller.material || 'GENERAL') !== material) return;
    let bags = [];
    try { bags = JSON.parse(seller.bag_data || '[]'); } catch {}
    bags.forEach((bag, idx) => {
      if (bag.buyer && bag.buyer.toUpperCase() === buyerKey.toUpperCase()) {
        rows.push({ seller, bag, bagIndex: idx + 1 });
      }
    });
  });
  rows.sort((a, b) => {
    const parseLot = r => { const [x, y] = (r.bag.lot || r.seller.lot_number || '').split('/').map(Number); return [isNaN(x) ? 0 : x, isNaN(y) ? 0 : y]; };
    const [aX, aY] = parseLot(a); const [bX, bY] = parseLot(b);
    if (aX !== bX) return aX - bX;
    if (aY !== bY) return aY - bY;
    return (a.bagIndex || 0) - (b.bagIndex || 0);
  });
  return groupBuyerRows(rows);
}

function PaymentRow({ payment, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(payment.amount));
  const [date, setDate] = useState(payment.payment_date);
  const [note, setNote] = useState(payment.note || '');

  const save = async () => {
    if (!amount || isNaN(Number(amount))) return toast.error('Enter valid amount');
    try {
      await API.put(`/api/buyer-payments/${payment.id}`, {
        amount: Number(amount), payment_date: date, note
      });
      setEditing(false);
      onSave();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to save'); }
  };

  const cancel = (e) => {
    e.stopPropagation();
    setAmount(String(payment.amount));
    setDate(payment.payment_date);
    setNote(payment.note || '');
    setEditing(false);
  };

  // Which bill this payment was recorded against, if the user paid it via the
  // "Pay" button on a specific purchase row (see PayBillModal) rather than a general payment.
  const billTag = payment.bill_date
    ? `For ${payment.bill_material} bill (${payment.bill_date})`
    : 'General payment';

  if (editing) {
    return (
      <tr style={{ background: 'var(--bg-hover)' }}>
        <td style={tdS}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            style={inputS} />
        </td>
        <td style={tdS}>
          <span style={badgeS('#22c55e')}>Payment</span>
        </td>
        <td style={tdS}>
          <input type="text" value={note} onChange={e => setNote(e.target.value)}
            style={inputS} placeholder="Note (optional)" />
        </td>
        <td style={{ ...tdS, textAlign: 'right', color: 'var(--text-muted)' }}>—</td>
        <td style={tdS}>
          <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
            style={{ ...inputS, textAlign: 'right' }} placeholder="Amount" />
        </td>
        <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 11.5 }}>{billTag}</td>
        <td style={tdS}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputS} />
        </td>
        <td style={{ ...tdS, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <button onClick={save} style={iconBtnS('#22c55e')}><Check size={14} /></button>
          <button onClick={cancel} style={{ ...iconBtnS('#ef4444'), marginLeft: 4 }}><X size={14} /></button>
        </td>
      </tr>
    );
  }

  return (
    <tr onClick={() => setEditing(true)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
      <td style={tdS}>{payment.payment_date}</td>
      <td style={tdS}><span style={badgeS('#22c55e')}>Payment</span></td>
      <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{payment.note || '—'}</td>
      <td style={{ ...tdS, textAlign: 'right', color: 'var(--text-muted)' }}>—</td>
      <td style={{ ...tdS, textAlign: 'right', fontWeight: 600, color: '#22c55e' }}>₹{fmt(payment.amount)}</td>
      <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 11.5 }}>{billTag}</td>
      <td style={tdS}>{payment.payment_date}</td>
      <td style={{ ...tdS, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <button onClick={() => setEditing(true)} style={iconBtnS('var(--accent)')}><Edit2 size={13} /></button>
        <button onClick={() => onDelete(payment.id)} style={{ ...iconBtnS('#ef4444'), marginLeft: 4 }}><Trash2 size={13} /></button>
      </td>
    </tr>
  );
}

// Popup opened by clicking "Pay" on a specific purchase row — ties the payment to that
// exact bill (date + material) so it's unambiguous which purchase the money is for,
// instead of a free-floating amount applied against the buyer's overall balance.
function PayBillModal({ buyer, buyerKey, billDate, billMaterial, billAmount, alreadyPaid, onClose, onSaved }) {
  const due = billAmount - alreadyPaid;
  const [amount, setAmount] = useState(due > 0 ? String(Math.round(due)) : '');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await API.post('/api/buyer-payments', {
        buyer_name: buyerKey, amount: Number(amount), payment_date: date, note,
        bill_date: billDate, bill_material: billMaterial,
      });
      onSaved();
      onClose();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to save payment'); }
    setSaving(false);
  };

  return (
    <div style={overlayS} onClick={onClose}>
      <div style={modalS} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Pay Bill — {billMaterial}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          {buyer.name} • Purchased on {billDate}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: 'var(--text-muted)' }}>Bill Amount</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{fmt(billAmount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: 'var(--text-muted)' }}>Already Paid (this bill)</span>
          <span style={{ fontWeight: 700, color: '#22c55e' }}>₹{fmt(alreadyPaid)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 14,
          paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Remaining Due</span>
          <span style={{ fontWeight: 800, color: due > 0 ? '#ef4444' : '#22c55e' }}>₹{fmt(Math.abs(due))}</span>
        </div>

        <label style={labelS}>Payment Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputS, marginBottom: 10 }} />
        <label style={labelS}>Amount Paid Now</label>
        <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
          style={{ ...inputS, marginBottom: 10, textAlign: 'right' }} placeholder="Amount ₹" autoFocus />
        <label style={labelS}>Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)}
          style={{ ...inputS, marginBottom: 18 }} placeholder="e.g. Paid in shop" />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={secondaryBtnS}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ ...primaryBtnS, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Popup opened by clicking "Pay" on an old-due row — ties the payment to that exact due
// entry (via due_id) the same way PayBillModal ties a payment to a specific bill, so an old
// due can be paid off (in full or partial installments) and tracked separately.
function PayDueModal({ buyer, buyerKey, due, alreadyPaid, onClose, onSaved }) {
  const remaining = due.amount - alreadyPaid;
  const [amount, setAmount] = useState(remaining > 0 ? String(Math.round(remaining)) : '');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await API.post('/api/buyer-payments', {
        buyer_name: buyerKey, amount: Number(amount), payment_date: date, note, due_id: due.id,
      });
      onSaved();
      onClose();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to save payment'); }
    setSaving(false);
  };

  return (
    <div style={overlayS} onClick={onClose}>
      <div style={modalS} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>Pay Old Due</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          {buyer.name} • {due.note || 'Opening balance'} ({due.due_date})
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: 'var(--text-muted)' }}>Due Amount</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{fmt(due.amount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
          <span style={{ color: 'var(--text-muted)' }}>Already Paid</span>
          <span style={{ fontWeight: 700, color: '#22c55e' }}>₹{fmt(alreadyPaid)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 14,
          paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)' }}>Remaining Due</span>
          <span style={{ fontWeight: 800, color: remaining > 0 ? '#ef4444' : '#22c55e' }}>₹{fmt(Math.abs(remaining))}</span>
        </div>

        <label style={labelS}>Payment Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputS, marginBottom: 10 }} />
        <label style={labelS}>Amount Paid Now</label>
        <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
          style={{ ...inputS, marginBottom: 10, textAlign: 'right' }} placeholder="Amount ₹" autoFocus />
        <label style={labelS}>Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)}
          style={{ ...inputS, marginBottom: 18 }} placeholder="e.g. Paid in shop" />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={secondaryBtnS}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ ...primaryBtnS, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Manual "old due" entry — represents a balance carried over from before this ledger was
// used (a paper register, a previous season, etc). Behaves like a debit: it adds straight
// onto the buyer's outstanding balance, separately from system-tracked purchases.
function DueRow({ due, paid, paidDates, onSave, onDelete, onPay }) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(due.amount));
  const [date, setDate] = useState(due.due_date);
  const [note, setNote] = useState(due.note || '');
  const remaining = due.amount - paid;

  const save = async () => {
    if (!amount || isNaN(Number(amount))) return toast.error('Enter valid amount');
    try {
      await API.put(`/api/buyer-dues/${due.id}`, {
        amount: Number(amount), due_date: date, note
      });
      setEditing(false);
      onSave();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to save'); }
  };

  const cancel = (e) => {
    e.stopPropagation();
    setAmount(String(due.amount));
    setDate(due.due_date);
    setNote(due.note || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <tr style={{ background: 'var(--bg-hover)' }}>
        <td style={tdS}>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputS} />
        </td>
        <td style={tdS}>
          <span style={badgeS('#f59e0b')}>Old Due</span>
        </td>
        <td style={tdS}>
          <input type="text" value={note} onChange={e => setNote(e.target.value)}
            style={inputS} placeholder="Note (optional)" />
        </td>
        <td style={tdS}>
          <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
            style={{ ...inputS, textAlign: 'right' }} placeholder="Amount" />
        </td>
        <td style={{ ...tdS, textAlign: 'right', color: paid > 0 ? '#22c55e' : 'var(--text-muted)' }}>{paid > 0 ? `₹${fmt(paid)}` : '—'}</td>
        <td style={{ ...tdS, textAlign: 'right', fontWeight: 600, color: '#f59e0b' }}>₹{fmt(Math.max(0, (Number(amount) || 0) - paid))}</td>
        <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 11.5 }}>—</td>
        <td style={{ ...tdS, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <button onClick={save} style={iconBtnS('#22c55e')}><Check size={14} /></button>
          <button onClick={cancel} style={{ ...iconBtnS('#ef4444'), marginLeft: 4 }}><X size={14} /></button>
        </td>
      </tr>
    );
  }

  return (
    <tr onClick={() => setEditing(true)} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
      <td style={tdS}>{due.due_date}</td>
      <td style={tdS}><span style={badgeS('#f59e0b')}>Old Due</span></td>
      <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{due.note || 'Opening balance'}</td>
      <td style={{ ...tdS, textAlign: 'right', fontWeight: 600 }}>₹{fmt(due.amount)}</td>
      <td style={{ ...tdS, textAlign: 'right', color: paid > 0 ? '#22c55e' : 'var(--text-muted)', fontWeight: paid > 0 ? 600 : 400 }}>
        {paid > 0 ? `₹${fmt(paid)}` : '—'}
      </td>
      <td style={{ ...tdS, textAlign: 'right', fontWeight: 600,
        color: remaining > 0 ? '#ef4444' : remaining < 0 ? '#f59e0b' : '#22c55e' }}>
        ₹{fmt(Math.abs(remaining))}
      </td>
      <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{paidDates && paidDates.length ? paidDates.join(', ') : '—'}</td>
      <td style={{ ...tdS, textAlign: 'center', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
        <button onClick={onPay} disabled={remaining <= 0}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
            background: remaining > 0 ? '#22c55e' : 'var(--bg-panel)', color: remaining > 0 ? '#fff' : 'var(--text-muted)',
            border: 'none', borderRadius: 6, padding: '3px 9px',
            cursor: remaining > 0 ? 'pointer' : 'default', fontSize: 11.5, fontWeight: 600 }}>
          <Wallet size={12} /> Pay
        </button>
        <button onClick={() => setEditing(true)} style={{ ...iconBtnS('var(--accent)'), marginLeft: 6 }}><Edit2 size={13} /></button>
        <button onClick={() => onDelete(due.id)} style={{ ...iconBtnS('#ef4444'), marginLeft: 4 }}><Trash2 size={13} /></button>
      </td>
    </tr>
  );
}

function AddDueRow({ buyerName, onAdded }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!amount || isNaN(Number(amount))) return toast.error('Enter valid amount');
    setSaving(true);
    try {
      await API.post('/api/buyer-dues', {
        buyer_name: buyerName, amount: Number(amount), due_date: date, note
      });
      setAmount(''); setNote(''); setDate(todayISO());
      onAdded();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to add due'); }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, padding: '10px 12px',
      background: 'rgba(245,158,11,0.06)', border: '1px dashed rgba(245,158,11,0.45)', borderRadius: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>
        <Plus size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} /> OLD DUE / OPENING BALANCE
      </span>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputS, width: 140 }} />
      <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
        style={{ ...inputS, width: 120, textAlign: 'right' }} placeholder="Amount ₹" />
      <input type="text" value={note} onChange={e => setNote(e.target.value)}
        style={{ ...inputS, flex: 1, minWidth: 140 }} placeholder="Note (optional, e.g. carried from old register)" />
      <button onClick={save} disabled={saving}
        style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px',
          cursor: saving ? 'default' : 'pointer', fontSize: 12.5, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving...' : 'Add Due'}
      </button>
    </div>
  );
}

function AddPaymentRow({ buyerName, onAdded }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!amount || isNaN(Number(amount))) return toast.error('Enter valid amount');
    setSaving(true);
    try {
      await API.post('/api/buyer-payments', {
        buyer_name: buyerName, amount: Number(amount), payment_date: date, note
      });
      setAmount(''); setNote(''); setDate(todayISO());
      onAdded();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to add payment'); }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 14, padding: '10px 12px',
      background: 'rgba(34,197,94,0.06)', border: '1px dashed rgba(34,197,94,0.45)', borderRadius: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', whiteSpace: 'nowrap' }}>
        <Plus size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} /> GENERAL PAYMENT
      </span>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputS, width: 140 }} />
      <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
        style={{ ...inputS, width: 120, textAlign: 'right' }} placeholder="Amount ₹" />
      <input type="text" value={note} onChange={e => setNote(e.target.value)}
        style={{ ...inputS, flex: 1, minWidth: 140 }} placeholder="Note (optional)" />
      <button onClick={save} disabled={saving}
        style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px',
          cursor: saving ? 'default' : 'pointer', fontSize: 12.5, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

function BuyerLedgerRow({ buyer, buyerKey, sellers, allPurchasesByDate, totalPurchased, totalPaid, balance, allPayments, allDues, onPaymentChange, onDeleteBuyer, isDuplicateName }) {
  const [expanded, setExpanded] = useState(false);
  const [payBillEntry, setPayBillEntry] = useState(null);
  const [payDueEntry, setPayDueEntry] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const payments = allPayments.filter(p => p.buyer_name === buyerKey);
  const dues = allDues.filter(d => d.buyer_name === buyerKey);
  const totalAllTime = totalPurchased;

  // How much has actually been paid against one specific bill (tied via PayBillModal) —
  // this is what answers "which bill did this payment go toward".
  const paidForBill = (entry) => payments
    .filter(p => p.bill_date === entry.date && p.bill_material === entry.material)
    .reduce((s, p) => s + Number(p.amount), 0);

  // Same idea, but for an old-due entry (tied via PayDueModal's due_id).
  const paidForDue = (entry) => payments
    .filter(p => p.due_id === entry.id)
    .reduce((s, p) => s + Number(p.amount), 0);

  const deletePayment = (id) => {
    setConfirm({
      title: 'Delete Payment?',
      message: 'This payment record will be permanently removed.',
      onConfirm: async () => {
        try {
          await API.delete(`/api/buyer-payments/${id}`);
          onPaymentChange();
        } catch { toast.error('Failed to delete'); }
      },
    });
  };

  const deleteDue = (id) => {
    setConfirm({
      title: 'Delete Old Due?',
      message: 'This old due / opening balance entry will be permanently removed.',
      onConfirm: async () => {
        try {
          await API.delete(`/api/buyer-dues/${id}`);
          onPaymentChange();
        } catch { toast.error('Failed to delete'); }
      },
    });
  };

  // A "purchase" row isn't its own record — it's an aggregate over bags inside one or more
  // sellers' bag_data that happen to be assigned to this buyer on this date+material. So
  // "delete" here means un-assigning the buyer from those specific bags (clearing bag.buyer)
  // rather than deleting anything — the seller's weight/rate/lot data is their own sale
  // record and stays intact, just no longer tied to this buyer. Blocked while any payment
  // is already recorded against the bill, so money already collected is never silently
  // orphaned — remove the payment(s) first via their own Delete button.
  const deletePurchase = (entry) => {
    if (paidForBill(entry) > 0) {
      toast.error('Delete the payment(s) recorded against this bill first');
      return;
    }
    setConfirm({
      title: 'Remove Purchase?',
      message: `This ${entry.material} purchase (₹${fmt(entry.amount)}) will be un-assigned from ${buyer.name} in the seller's record — the seller's weight/rate data stays intact and can be reassigned. This cannot be undone.`,
      onConfirm: async () => {
        try {
          const matching = sellers.filter(s => s.entry_date === entry.date && (s.material || 'GENERAL') === entry.material);
          for (const seller of matching) {
            let bags = [];
            try { bags = JSON.parse(seller.bag_data || '[]'); } catch {}
            let changed = false;
            const updated = bags.map(bag => {
              if (bag.buyer && bag.buyer.toUpperCase() === buyerKey.toUpperCase()) {
                changed = true;
                return { ...bag, buyer: '' };
              }
              return bag;
            });
            if (changed) await API.put(`/api/sellers/${seller.id}`, { bag_data: JSON.stringify(updated) });
          }
          toast.success('Purchase removed from ledger');
          onPaymentChange();
        } catch { toast.error('Failed to delete purchase'); }
      },
    });
  };

  const balanceColor = balance > 0 ? '#ef4444' : balance < 0 ? '#f59e0b' : '#22c55e';

  // Chronological old-due+purchase+payment list purely for ordering in the transaction
  // table. Old dues are usually backdated (carried from before this ledger existed), so
  // they naturally sort first and surface under their own heading below.
  const ledgerRows = [
    ...dues.map(d => ({ kind: 'due', sortKey: d.due_date, ...d })),
    ...allPurchasesByDate.map(d => ({ kind: 'purchase', sortKey: d.date, ...d })),
    ...payments.map(p => ({ kind: 'payment', sortKey: p.payment_date, ...p })),
  ].sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const viewBill = (e, date, material, includeExtraCharge) => {
    e.stopPropagation();
    const sellerRows = getBuyerSellerRows(sellers, buyerKey, date, material);
    if (sellerRows.length === 0) return toast.error('No purchase rows found for this date');
    const billBuyer = includeExtraCharge ? buyer : { ...buyer, extra_bags: 0, extra_bag_amount: 0 };
    const html = buildBuyerBillHtml({ buyer: billBuyer, sellerRows, advance: buyer.advance_amount || 0 });
    const w = window.open('', '_blank', 'width=480,height=700');
    w.document.write(html);
    w.document.close();
  };

  const printLedger = (e) => {
    e.stopPropagation();
    const fmtBillDate = (d) => {
      if (!d) return '—';
      const dt = new Date(d + 'T00:00:00');
      const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${String(dt.getDate()).padStart(2,'0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`;
    };

    // Same row-styling language as the buyer bill's items-table, with a colored
    // PURCHASE/PAYMENT tag per row (matching the orange/green badges shown on screen)
    // so the two transaction types stay visually distinct on paper too.
    const transactionRows = ledgerRows.length
      ? ledgerRows.map((r, i) => {
          const bg = i % 2 === 0 ? '#ffffff' : '#eff6ff';
          if (r.kind === 'due') {
            const duePaid = paidForDue(r);
            const dueRemaining = r.amount - duePaid;
            return `<tr style="background:${bg}">
              <td style="border:1px solid #b8cef0;padding:4px 6px;font-size:8.5px;color:#111">${fmtBillDate(r.due_date)}</td>
              <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:center"><span style="background:#fde68a;color:#92400e;font-weight:700;font-size:7.5px;padding:2px 6px;border-radius:8px;text-transform:uppercase">Old Due</span></td>
              <td style="border:1px solid #b8cef0;padding:4px 6px;font-size:8.5px;color:#111">${r.note || 'Opening balance'}</td>
              <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;font-weight:700;color:#92400e">&#8377; ${fmt(r.amount)}</td>
              <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;color:${duePaid>0?'#16a34a':'#999'}">${duePaid>0?'&#8377; '+fmt(duePaid):'—'}</td>
              <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;font-weight:700;color:${dueRemaining>0?'#dc2626':'#16a34a'}">&#8377; ${fmt(Math.abs(dueRemaining))}</td>
            </tr>`;
          }
          if (r.kind === 'purchase') {
            const paid = paidForBill(r);
            const due = r.amount - paid;
            return `<tr style="background:${bg}">
              <td style="border:1px solid #b8cef0;padding:4px 6px;font-size:8.5px;color:#111">${fmtBillDate(r.date)}</td>
              <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:center"><span style="background:#fed7aa;color:#9a3412;font-weight:700;font-size:7.5px;padding:2px 6px;border-radius:8px;text-transform:uppercase">Purchase</span></td>
              <td style="border:1px solid #b8cef0;padding:4px 6px;font-size:8.5px;color:#111"><b>${r.material}</b> — ${r.bags} bags, ${r.weight.toFixed(1)}kg</td>
              <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;font-weight:700;color:#1e40af">&#8377; ${fmt(r.amount)}</td>
              <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;color:${paid>0?'#16a34a':'#999'}">${paid>0?'&#8377; '+fmt(paid):'—'}</td>
              <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;font-weight:700;color:${due>0?'#dc2626':'#16a34a'}">&#8377; ${fmt(Math.abs(due))}</td>
            </tr>`;
          }
          return `<tr style="background:${bg}">
            <td style="border:1px solid #b8cef0;padding:4px 6px;font-size:8.5px;color:#111">${fmtBillDate(r.payment_date)}</td>
            <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:center"><span style="background:#bbf7d0;color:#166534;font-weight:700;font-size:7.5px;padding:2px 6px;border-radius:8px;text-transform:uppercase">Payment</span></td>
            <td style="border:1px solid #b8cef0;padding:4px 6px;font-size:8.5px;color:#111">${r.bill_date ? `For ${r.bill_material} bill (${fmtBillDate(r.bill_date)})` : 'General payment'}${r.note ? ' — ' + r.note : ''}</td>
            <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;color:#999">—</td>
            <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;font-weight:700;color:#16a34a">&#8377; ${fmt(r.amount)}</td>
            <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;color:#999">—</td>
          </tr>`;
        }).join('')
      : `<tr><td colspan="6" style="text-align:center;color:#999;padding:10px;border:1px solid #b8cef0">No transactions recorded</td></tr>`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ledger — ${buyer.name}</title>
  <style>${BILL_CSS}</style>
</head>
<body>
<div class="page-wrapper">
  <div class="header-box">
    <div class="header-props">
      <span style="text-align:left;line-height:1.4"><br></span>
      <div class="logo-circle">PH</div>
      <span style="text-align:right;line-height:1.4"><br></span>
    </div>
    <div class="firm-name">BUYER LEDGER</div>
    <div><span class="firm-badge"></span></div>
  </div>

  <div class="meta-table">
    <div class="meta-row">
      <span><strong>Buyer Name :</strong> ${buyer.name} (${buyer.serial_number || '—'})</span>
      <span><strong>Mobile :</strong> ${buyer.mobile || '—'}</span>
    </div>
    <div class="meta-row">
      <span><strong>Printed :</strong> ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
      <span><strong>Status :</strong> ${balance > 0 ? 'UNPAID' : balance < 0 ? 'OVERPAID' : 'SETTLED'}</span>
    </div>
  </div>

  <table class="items-table" style="margin-bottom:1px">
    <thead>
      <tr>
        <th style="width:13%">Date</th>
        <th style="width:13%">Type</th>
        <th style="width:34%">Particular</th>
        <th style="width:14%">Amount</th>
        <th style="width:13%">Paid</th>
        <th style="width:13%">Due</th>
      </tr>
    </thead>
    <tbody>${transactionRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="text-align:left;padding-left:7px;font-size:8.5px;font-weight:700">TOTAL</td>
        <td style="text-align:right;font-size:8.5px;font-weight:800;color:#1e40af">&#8377; ${fmt(totalAllTime)}</td>
        <td style="text-align:right;font-size:8.5px;font-weight:800;color:#16a34a">&#8377; ${fmt(totalPaid)}</td>
        <td style="text-align:right;font-size:8.5px;font-weight:800;color:${balance>0?'#dc2626':'#16a34a'}">&#8377; ${fmt(Math.abs(balance))}</td>
      </tr>
    </tfoot>
  </table>

  <table class="deduct-table" style="margin-top:2px">
    <tbody>
      <tr class="net-row">
        <td class="net-label">${balance > 0 ? 'AMOUNT DUE (BUYER OWES)' : balance < 0 ? 'OVERPAID' : 'SETTLED — NO DUE'}</td>
        <td class="net-value">&#8377; ${fmt(Math.abs(balance))}</td>
      </tr>
    </tbody>
  </table>

  <div class="in-words"><strong>In Words :</strong> ${toIndianWords(Math.abs(balance))} Only</div>
  <div class="eoae">(E.&amp;O.E.)</div>
</div>
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 300);
  };
<\/script>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=480,height=700');
    w.document.write(html);
    w.document.close();
  };

  return (
    <>
      <tr
        onClick={() => setExpanded(true)}
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; }}>
        <td style={{ ...tdS, fontWeight: 700 }}>
          {buyer.name}
          {isDuplicateName && (
            <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>({buyerKey})</span>
          )}
        </td>
        <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{buyer.serial_number}</td>
        <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{buyer.mobile}</td>
        <td style={{ ...tdS, textAlign: 'right', fontWeight: 600 }}>₹{fmt(totalPurchased)}</td>
        <td style={{ ...tdS, textAlign: 'right', fontWeight: 600, color: '#22c55e' }}>₹{fmt(totalPaid)}</td>
        <td style={{ ...tdS, textAlign: 'right', fontWeight: 700, color: balanceColor }}>₹{fmt(Math.abs(balance))}</td>
        <td style={{ ...tdS, textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 12,
            background: balance > 0 ? 'rgba(239,68,68,0.12)' : balance < 0 ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.12)',
            color: balanceColor }}>
            {balance > 0 ? 'UNPAID' : balance < 0 ? 'OVERPAID' : 'SETTLED'}
          </span>
        </td>
        <td style={{ ...tdS, textAlign: 'center', whiteSpace: 'nowrap' }}>
          <button onClick={e => { e.stopPropagation(); setExpanded(true); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            <Eye size={13} /> View
          </button>
          <button onClick={e => { e.stopPropagation(); onDeleteBuyer(buyerKey, buyer.name); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.4)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, marginLeft: 6 }}>
            <Trash2 size={13} /> Delete
          </button>
        </td>
      </tr>

      {expanded && (
        <div style={overlayS} onClick={() => setExpanded(false)}>
          <div style={{ ...modalS, width: 950, maxWidth: '95vw', maxHeight: '88vh', overflowY: 'auto', padding: 0 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{buyer.name} <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 13 }}>({buyer.serial_number})</span></div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{buyer.mobile}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={printLedger}
                    style={{ display:'flex', alignItems:'center', gap:6, background:'var(--accent)', color:'#fff',
                      border:'none', borderRadius:8, padding:'7px 14px', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                    <Printer size={14} /> Print / PDF
                  </button>
                  <button onClick={() => setExpanded(false)}
                    style={{ display:'flex', alignItems:'center', gap:6, background:'none', color:'var(--text-muted)',
                      border:'1px solid var(--border)', borderRadius:8, padding:'7px 10px', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                    <X size={14} /> Close
                  </button>
                </div>
              </div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              Transaction History
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)' }}>
                  <th style={thS}>Date</th>
                  <th style={thS}>Type</th>
                  <th style={thS}>Details</th>
                  <th style={{ ...thS, textAlign: 'right' }}>Amount</th>
                  <th style={{ ...thS, textAlign: 'right' }}>Paid</th>
                  <th style={{ ...thS, textAlign: 'right' }}>Due</th>
                  <th style={thS}>Paid Date</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ledgerRows.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...tdS, textAlign: 'center', color: 'var(--text-muted)' }}>No transactions yet</td></tr>
                ) : (() => {
                  let shownDueHeading = false;
                  let shownPurchaseHeading = false;
                  let shownPaymentHeading = false;
                  return ledgerRows.flatMap((e, i) => {
                    const rows = [];
                    if (e.kind === 'due' && !shownDueHeading) {
                      shownDueHeading = true;
                      rows.push(
                        <tr key={`h-due`}>
                          <td colSpan={8} style={sectionHeadingS('#f59e0b')}>Opening Balance / Old Dues</td>
                        </tr>
                      );
                    }
                    if (e.kind === 'purchase' && !shownPurchaseHeading) {
                      shownPurchaseHeading = true;
                      rows.push(
                        <tr key={`h-purchase`}>
                          <td colSpan={8} style={sectionHeadingS('var(--accent)')}>Purchase History</td>
                        </tr>
                      );
                    }
                    if (e.kind === 'payment' && !shownPaymentHeading) {
                      shownPaymentHeading = true;
                      rows.push(
                        <tr key={`h-payment`}>
                          <td colSpan={8} style={sectionHeadingS('#22c55e')}>Payment History</td>
                        </tr>
                      );
                    }
                    if (e.kind === 'due') {
                      const duePaidDates = payments.filter(p => p.due_id === e.id).map(p => p.payment_date);
                      rows.push(
                        <DueRow key={`due-${e.id}`} due={e} paid={paidForDue(e)} paidDates={duePaidDates}
                          onSave={onPaymentChange} onDelete={deleteDue} onPay={() => setPayDueEntry(e)} />
                      );
                      return rows;
                    }
                    if (e.kind === 'payment') {
                      rows.push(<PaymentRow key={`pay-${e.id}`} payment={e} onSave={onPaymentChange} onDelete={deletePayment} />);
                      return rows;
                    }
                    const paid = paidForBill(e);
                    const due = e.amount - paid;
                    const tiedDates = payments
                      .filter(p => p.bill_date === e.date && p.bill_material === e.material)
                      .map(p => p.payment_date);
                    rows.push(
                      <tr key={`pur-${i}`}
                        onClick={() => { if (due > 0) setPayBillEntry(e); }}
                        style={{ borderBottom: '1px solid var(--border)', cursor: due > 0 ? 'pointer' : 'default' }}
                        onMouseEnter={ev => { if (due > 0) ev.currentTarget.style.background = 'rgba(34,197,94,0.06)'; }}
                        onMouseLeave={ev => { ev.currentTarget.style.background = 'transparent'; }}>
                        <td style={tdS}>{e.date}</td>
                        <td style={tdS}><span style={badgeS('var(--accent)')}>Purchase</span></td>
                        <td style={{ ...tdS, color: 'var(--text-primary)', fontSize: 12.5 }}>
                          <b>{e.material}</b> — {e.bags} bags • {e.weight.toFixed(1)} kg
                          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>
                            Gross ₹{fmt(e.grossAmt)} + Labour ₹{fmt(e.labourAmt)} + Fee ₹{fmt(e.marketFee)}{e.extraAmt > 0 ? ` + Extra Bags ₹${fmt(e.extraAmt)}` : ''}
                          </div>
                        </td>
                        <td style={{ ...tdS, textAlign: 'right', fontWeight: 600 }}>₹{fmt(e.amount)}</td>
                        <td style={{ ...tdS, textAlign: 'right', color: paid > 0 ? '#22c55e' : 'var(--text-muted)', fontWeight: paid > 0 ? 600 : 400 }}>
                          {paid > 0 ? `₹${fmt(paid)}` : '—'}
                        </td>
                        <td style={{ ...tdS, textAlign: 'right', fontWeight: 600,
                          color: due > 0 ? '#ef4444' : due < 0 ? '#f59e0b' : '#22c55e' }}>
                          ₹{fmt(Math.abs(due))}
                        </td>
                        <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{tiedDates.length ? tiedDates.join(', ') : '—'}</td>
                        <td style={{ ...tdS, textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button onClick={ev => viewBill(ev, e.date, e.material, e.isFirstMaterialOfDay)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none',
                              border: '1px solid var(--border)', borderRadius: 6, padding: '3px 9px',
                              cursor: 'pointer', color: 'var(--accent)', fontSize: 11.5, fontWeight: 600 }}>
                            <Eye size={12} /> View Bill
                          </button>
                          <button onClick={ev => { ev.stopPropagation(); setPayBillEntry(e); }}
                            disabled={due <= 0}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: due > 0 ? '#22c55e' : 'var(--bg-panel)', color: due > 0 ? '#fff' : 'var(--text-muted)',
                              border: 'none', borderRadius: 6, padding: '3px 9px', marginLeft: 6,
                              cursor: due > 0 ? 'pointer' : 'default', fontSize: 11.5, fontWeight: 600 }}>
                            <Wallet size={12} /> Pay
                          </button>
                          <button onClick={ev => { ev.stopPropagation(); deletePurchase(e); }}
                            disabled={paid > 0}
                            title={paid > 0 ? 'Delete the payment(s) against this bill first' : ''}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                              background: 'none', color: paid > 0 ? 'var(--text-muted)' : '#ef4444',
                              border: `1px solid ${paid > 0 ? 'var(--border)' : 'rgba(239,68,68,0.4)'}`, borderRadius: 6, padding: '3px 9px', marginLeft: 6,
                              cursor: paid > 0 ? 'default' : 'pointer', fontSize: 11.5, fontWeight: 600 }}>
                            <Trash2 size={12} /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                    return rows;
                  });
                })()}
                <tr style={{ background: 'var(--bg-card)', fontWeight: 700 }}>
                  <td colSpan={3} style={tdS}>Totals — Purchased + Old Dues ₹{fmt(totalAllTime)} &nbsp;|&nbsp; Paid <span style={{ color: '#22c55e' }}>₹{fmt(totalPaid)}</span></td>
                  <td colSpan={5} style={{ ...tdS, textAlign: 'right', color: balanceColor }}>
                    {balance > 0 ? 'Due: ' : balance < 0 ? 'Overpaid: ' : 'Settled: '}₹{fmt(Math.abs(balance))}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Balance summary */}
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8,
              background: balance > 0 ? 'rgba(239,68,68,0.1)' : balance < 0 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${balance > 0 ? '#ef4444' : balance < 0 ? '#f59e0b' : '#22c55e'}40`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {balance > 0 ? 'Amount Due (Buyer owes)' : balance < 0 ? 'Overpaid' : 'Settled'}
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, color: balanceColor }}>₹{fmt(Math.abs(balance))}</span>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14, marginBottom: -6 }}>
              Use the <b>Pay</b> button on a purchase row above to settle a specific bill, add an old/manual due (e.g. a balance carried from a paper register), or record a general payment below:
            </div>
            <AddDueRow buyerName={buyerKey} onAdded={onPaymentChange} />
            <AddPaymentRow buyerName={buyerKey} onAdded={onPaymentChange} />
            </div>
          </div>
        </div>
      )}

      {payBillEntry && (
        <PayBillModal
          buyer={buyer}
          buyerKey={buyerKey}
          billDate={payBillEntry.date}
          billMaterial={payBillEntry.material}
          billAmount={payBillEntry.amount}
          alreadyPaid={paidForBill(payBillEntry)}
          onClose={() => setPayBillEntry(null)}
          onSaved={onPaymentChange}
        />
      )}

      {payDueEntry && (
        <PayDueModal
          buyer={buyer}
          buyerKey={buyerKey}
          due={payDueEntry}
          alreadyPaid={paidForDue(payDueEntry)}
          onClose={() => setPayDueEntry(null)}
          onSaved={onPaymentChange}
        />
      )}

      {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
    </>
  );
}

const tdS = { padding: '8px 10px', verticalAlign: 'middle' };
const thS = { padding: '8px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputS = { background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontSize: 12, width: '100%' };
const iconBtnS = (color) => ({ background: 'none', border: 'none', cursor: 'pointer', color, padding: '2px 4px', borderRadius: 4, display: 'inline-flex', alignItems: 'center' });
const badgeS = (color) => ({ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: `${color}20`, color, textTransform: 'uppercase', letterSpacing: '0.03em' });
const sectionHeadingS = (color) => ({ padding: '8px 10px', background: 'var(--bg-panel)', color, fontSize: 11.5,
  fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' });
const labelS = { display: 'block', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' };
const overlayS = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalS = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
  padding: 22, width: 360, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' };
const secondaryBtnS = { background: 'none', border: '1px solid var(--border)', borderRadius: 8,
  padding: '8px 16px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 };
const primaryBtnS = { background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8,
  padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700 };

// Lightweight "register a buyer right here" modal — for buyers who haven't bought
// anything yet but need an old/opening due recorded against their name.
function AddBuyerModal({ existingBuyers, onClose, onAdded }) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [mobile, setMobile] = useState('');
  const [entryDate, setEntryDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  const shortNameUpper = shortName.trim().toUpperCase();
  const conflict = shortNameUpper
    ? existingBuyers.find(b =>
        (b.lot_number || '').trim().toUpperCase() === shortNameUpper ||
        (b.serial_number || '').trim().toUpperCase() === shortNameUpper
      )
    : null;

  // Two different people can share a name (e.g. two "SUDHEER"s) — bills/receipts/prints
  // show just the name, so an exact duplicate is genuinely ambiguous there. Block it here
  // rather than letting the short name silently disambiguate everywhere downstream.
  const nameUpper = name.trim().toUpperCase();
  const nameConflict = nameUpper
    ? existingBuyers.find(b => (b.name || '').trim().toUpperCase() === nameUpper)
    : null;

  const save = async () => {
    if (!name.trim()) return toast.error('Enter buyer name');
    if (conflict) return toast.error(`Short name already used by ${conflict.name}`);
    if (nameConflict) return toast.error(`A buyer named "${name}" already exists — add an initial to tell them apart`);
    setSaving(true);
    try {
      const payload = {
        serial_number:  shortNameUpper || name.trim().toUpperCase().substring(0, 6) || todayISO(),
        name:           name.trim().toUpperCase(),
        mobile:         mobile.trim() || '0000000000',
        material:       'GENERAL',
        num_bags:       0,
        lot_number:     shortNameUpper || '—',
        weight:         0,
        advance_amount: 0,
        entry_date:     entryDate,
        bag_data:       '[]',
      };
      await API.post('/api/buyers', payload);
      toast.success(`${payload.name} added`);
      onAdded();
      onClose();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to add buyer'); }
    setSaving(false);
  };

  return (
    <div style={overlayS} onClick={onClose}>
      <div style={modalS} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Add New Buyer</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          For a buyer with no purchase history yet — e.g. to record an old/opening due.
        </div>

        <label style={labelS}>Buyer Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value.toUpperCase())}
          style={{ ...inputS, marginBottom: nameConflict ? 4 : 10, borderColor: nameConflict ? '#ef4444' : undefined }}
          placeholder="FULL NAME" autoFocus />
        {nameConflict && (
          <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 10 }}>
            A buyer named "{name}" already exists — add an initial (e.g. {name} K)
          </div>
        )}

        <label style={labelS}>Short Name / Nick Name</label>
        <input type="text" value={shortName} onChange={e => setShortName(e.target.value.toUpperCase())}
          style={{ ...inputS, marginBottom: conflict ? 4 : 10, borderColor: conflict ? '#ef4444' : undefined }}
          placeholder="e.g. RAJU, KUMAR" />
        {conflict && (
          <div style={{ fontSize: 11, color: '#ef4444', marginBottom: 10 }}>Already used by {conflict.name}</div>
        )}

        <label style={labelS}>Mobile Number</label>
        <input type="text" value={mobile} onChange={e => setMobile(e.target.value)}
          style={{ ...inputS, marginBottom: 10 }} placeholder="10-digit mobile" maxLength={10} />

        <label style={labelS}>Entry Date</label>
        <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)}
          style={{ ...inputS, marginBottom: 18 }} />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={secondaryBtnS}>Cancel</button>
          <button onClick={save} disabled={saving || !!conflict || !!nameConflict} style={{ ...primaryBtnS, opacity: (saving || conflict || nameConflict) ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Add Buyer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BuyerLedger() {
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddBuyer, setShowAddBuyer] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState(''); // empty = show full all-time history for every buyer
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [statusTab, setStatusTab] = useState('all'); // 'all' | 'unpaid' | 'settled'
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sellersRes, buyersRes] = await Promise.all([
        API.get('/api/sellers'),
        API.get('/api/buyers'),
      ]);
      setSellers(sellersRes.data.data || []);
      setBuyers(buyersRes.data.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load buyers');
    }
    try {
      const paymentsRes = await API.get('/api/buyer-payments');
      setPayments(paymentsRes.data.data || []);
    } catch {
      setPayments([]);
    }
    try {
      const duesRes = await API.get('/api/buyer-dues');
      setDues(duesRes.data.data || []);
    } catch {
      setDues([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Removes every `buyers` row under this key plus their payments/old dues — a buyer here
  // is really "everything filed under this short name/name", not a single row, so deleting
  // needs to clear all of it or the row would just reappear on refresh. Purchase history
  // embedded in sellers' bag_data is left alone; that's the seller's sale record, not the
  // buyer's, and rewriting it is out of scope for "delete this buyer".
  const deleteBuyer = (key, displayName) => {
    setConfirm({
      title: `Delete ${displayName}?`,
      message: `This removes their profile plus all payments and old dues recorded here. Their purchase history stays on the seller's records. This cannot be undone.`,
      onConfirm: async () => {
        try {
          await API.delete(`/api/buyers/by-key/${encodeURIComponent(key)}`);
          toast.success(`${displayName} deleted`);
          load();
        } catch (err) { toast.error(err?.response?.data?.error || 'Failed to delete buyer'); }
      },
    });
  };

  // Build purchase map: buyerKey → {date|material → {date, material, bags, weight, amount}}
  // Keyed by date+material (not just date) so a buyer who bought two materials on the same
  // market day shows two distinct purchase entries instead of one merged figure.
  const purchaseMap = {};
  sellers.forEach(seller => {
    let bagData = [];
    try { bagData = JSON.parse(seller.bag_data || '[]'); } catch {}
    const material = seller.material || 'GENERAL';
    bagData.forEach(bag => {
      if (!bag.buyer) return;
      const key = bag.buyer.toUpperCase();
      if (!purchaseMap[key]) purchaseMap[key] = {};
      const date = seller.entry_date;
      const mKey = `${date}|${material}`;
      if (!purchaseMap[key][mKey]) purchaseMap[key][mKey] = { date, material, bags: 0, weight: 0, amount: 0 };
      purchaseMap[key][mKey].bags   += 1;
      purchaseMap[key][mKey].weight += Number(bag.weight) || 0;
      purchaseMap[key][mKey].amount += Number(bag.amount) || 0;
    });
  });

  // Deduplicate buyers by name (keep first occurrence), match to purchaseMap key
  const seenNames = new Set();
  const uniqueBuyers = [];
  buyers.forEach(b => {
    const key = (b.lot_number && b.lot_number !== '—') ? b.lot_number.toUpperCase() : b.name.toUpperCase();
    if (!seenNames.has(key)) {
      seenNames.add(key);
      uniqueBuyers.push({ buyer: b, key });
    }
  });

  // Sort by name
  uniqueBuyers.sort((a, b) => a.buyer.name.localeCompare(b.buyer.name));

  // Every buyer's full all-time purchased/paid/balance — market days (Wed/Sun) generate
  // purchases, but payment can land weeks or months later (or on the spot), so these
  // totals always span every purchase and every payment ever recorded, never just "today".
  const withTotals = uniqueBuyers.map(({ buyer, key }) => {
    const byKey = purchaseMap[key] || {};
    const rawEntries = Object.values(byKey).sort((a, b) =>
      a.date.localeCompare(b.date) || a.material.localeCompare(b.material));
    // Mirrors BuyerList's same-day extra-charge convention: when a buyer bought more than
    // one material on the same date, only the alphabetically-first one carries the
    // buyer-level extra bag charge on its bill, to avoid double-counting it.
    const materialsByDate = {};
    rawEntries.forEach(e => {
      if (!materialsByDate[e.date]) materialsByDate[e.date] = [];
      materialsByDate[e.date].push(e.material);
    });
    Object.values(materialsByDate).forEach(arr => arr.sort());
    // Each entry's "amount" is the full bill total (gross + labour + market fee + extra
    // bag charge), the same figure printed as TOTAL AMOUNT on that day's bill — not just
    // the raw gross weight×rate amount — so purchased/due totals match what's billed.
    const labourRate    = buyerLabourRate(buyer);
    const extraBagTotal = buyerExtraBags(buyer) * buyerExtraBagAmount(buyer);
    const allPurchasesByDate = rawEntries.map(e => {
      const isFirstMaterialOfDay = materialsByDate[e.date][0] === e.material;
      const grossAmt  = e.amount;
      const labourAmt = e.bags * labourRate;
      const marketFee = Math.round(grossAmt * 0.01);
      const extraAmt  = isFirstMaterialOfDay ? extraBagTotal : 0;
      return { ...e, grossAmt, labourAmt, marketFee, extraAmt, amount: grossAmt + labourAmt + marketFee + extraAmt, isFirstMaterialOfDay };
    });
    // Manual "old due" entries (opening balances carried over from before this ledger was
    // used) are folded straight into the buyer's total owed, so Purchased − Paid = Balance
    // Due still holds everywhere this total is used (summary cards, print, status tabs).
    const purchasedFromBills = allPurchasesByDate.reduce((s, d) => s + d.amount, 0);
    const buyerDues      = dues.filter(d => d.buyer_name === key);
    const totalDues      = buyerDues.reduce((s, d) => s + Number(d.amount), 0);
    const totalPurchased = purchasedFromBills + totalDues;
    const buyerPayments  = payments.filter(p => p.buyer_name === key);
    const totalPaid      = buyerPayments.reduce((s, p) => s + Number(p.amount), 0);
    const balance        = totalPurchased - totalPaid;
    return { buyer, key, allPurchasesByDate, totalPurchased, totalPaid, balance, purchasedFromBills };
  });

  // Two different people can share the same full name (e.g. two "SUDHEER"s) — they're
  // already correctly kept as separate rows since each has its own short-name key, but
  // the Buyer Name column alone can't tell them apart at a glance. Flag any name that
  // appears more than once so those rows can show their short name inline for disambiguation.
  const nameCounts = {};
  withTotals.forEach(r => {
    const n = r.buyer.name.trim().toUpperCase();
    nameCounts[n] = (nameCounts[n] || 0) + 1;
  });

  // True grand totals — always across every buyer's full history, never affected by
  // the search box, status tabs, or the optional date lookup below.
  const grandPurchased   = withTotals.reduce((s, r) => s + r.totalPurchased, 0);
  const grandPaid        = withTotals.reduce((s, r) => s + r.totalPaid, 0);
  const grandBalanceDue  = withTotals.reduce((s, r) => s + Math.max(0, r.balance), 0);

  // Build set of buyer keys with purchase activity on the selected lookup date
  const activeDateKeys = new Set();
  if (filterDate) {
    sellers.filter(s => s.entry_date === filterDate).forEach(seller => {
      let bagData = [];
      try { bagData = JSON.parse(seller.bag_data || '[]'); } catch {}
      bagData.forEach(bag => { if (bag.buyer) activeDateKeys.add(bag.buyer.toUpperCase()); });
    });
  }

  // Years present in the seller data, for the Year filter dropdown.
  const years = Array.from(new Set(
    sellers.map(s => (s.entry_date || '').slice(0, 4)).filter(Boolean)
  )).sort((a, b) => b.localeCompare(a));

  // Build set of buyer keys with purchase activity in the selected month/year
  const activeMonthKeys = new Set();
  if (filterYear || filterMonth) {
    sellers.filter(s => {
      const [y, m] = (s.entry_date || '').split('-');
      if (filterYear && y !== filterYear) return false;
      if (filterMonth && m !== filterMonth) return false;
      return true;
    }).forEach(seller => {
      let bagData = [];
      try { bagData = JSON.parse(seller.bag_data || '[]'); } catch {}
      bagData.forEach(bag => { if (bag.buyer) activeMonthKeys.add(bag.buyer.toUpperCase()); });
    });
  }

  // Status tab + date/month/year lookup + search narrow down which buyers appear in the
  // table — the totals shown for each one are still their full all-time figures.
  const filtered = withTotals.filter(({ buyer, key, balance }) => {
    if (filterDate && !activeDateKeys.has(key)) return false;
    if ((filterYear || filterMonth) && !activeMonthKeys.has(key)) return false;
    if (statusTab === 'unpaid' && !(balance > 0)) return false;
    if (statusTab === 'settled' && !(balance <= 0)) return false;
    if (search && !buyer.name.toLowerCase().includes(search.toLowerCase()) &&
        !(buyer.serial_number || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const unpaidCount  = withTotals.filter(r => r.balance > 0).length;
  const settledCount = withTotals.filter(r => r.balance <= 0).length;

  // Buyers added purely through "Add Buyer" / an old-due entry — no actual purchase bill
  // behind them yet — are shown in their own section below the main purchase ledger, so
  // they don't get mixed in with buyers who actually bought something this season.
  const filteredWithPurchases = filtered.filter(r => r.purchasedFromBills > 0);
  const filteredManualOnly    = filtered.filter(r => r.purchasedFromBills === 0);

  // Print a master summary of every buyer currently shown (respects the active status
  // tab / search / date lookup) — purchased, paid and pending, in the same bill-style
  // template used elsewhere in the app, so it's one consistent printable look.
  const printAllBuyers = () => {
    const rowsHtml = filtered.map((r, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : '#eff6ff';
      const statusColor = r.balance > 0 ? '#dc2626' : r.balance < 0 ? '#b45309' : '#16a34a';
      const statusLabel = r.balance > 0 ? 'UNPAID' : r.balance < 0 ? 'OVERPAID' : 'SETTLED';
      return `<tr style="background:${bg}">
        <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:center;font-size:8.5px;color:#111;font-weight:600">${String(i+1).padStart(3,'0')}</td>
        <td style="border:1px solid #b8cef0;padding:4px 6px;font-size:8.5px;font-weight:700;color:#111">${r.buyer.name}</td>
        <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:center;font-size:8px;font-family:monospace;color:#111">${r.buyer.serial_number || '—'}</td>
        <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:center;font-size:8px;color:#111">${r.buyer.mobile || '—'}</td>
        <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;font-weight:700;color:#1e40af">&#8377; ${fmt(r.totalPurchased)}</td>
        <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;font-weight:700;color:#16a34a">&#8377; ${fmt(r.totalPaid)}</td>
        <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:right;font-size:8.5px;font-weight:700;color:${statusColor}">&#8377; ${fmt(Math.abs(r.balance))}</td>
        <td style="border:1px solid #b8cef0;padding:4px 6px;text-align:center"><span style="background:${statusColor}20;color:${statusColor};font-weight:700;font-size:7.5px;padding:2px 7px;border-radius:8px">${statusLabel}</span></td>
      </tr>`;
    }).join('') || `<tr><td colspan="8" style="text-align:center;color:#999;padding:10px;border:1px solid #b8cef0">No buyers found</td></tr>`;

    const sumPurchased = filtered.reduce((s, r) => s + r.totalPurchased, 0);
    const sumPaid      = filtered.reduce((s, r) => s + r.totalPaid, 0);
    const sumDue       = filtered.reduce((s, r) => s + Math.max(0, r.balance), 0);
    let tabLabel = statusTab === 'unpaid' ? 'Unpaid Buyers' : statusTab === 'settled' ? 'Settled Buyers' : 'All Buyers';
    if (filterMonth || filterYear) {
      const monthName = filterMonth ? MONTHS.find(([v]) => v === filterMonth)?.[1] : '';
      tabLabel += ` — ${[monthName, filterYear].filter(Boolean).join(' ')}`;
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Buyer Ledger Summary</title>
  <style>${BILL_CSS}</style>
</head>
<body>
<div class="page-wrapper" style="max-width:100%">
  <div class="header-box">
    <div class="header-props">
      <span style="text-align:left;line-height:1.4">Prop. Praveen V. Heggani<br>Cell : 9611635183</span>
      <div class="logo-circle">PH</div>
      <span style="text-align:right;line-height:1.4">Prop. Pramod V. Heggani<br>Cell : 9448349836</span>
    </div>
    <div class="firm-name">Mr. Praveen Heggani</div>
    <div><span class="firm-badge">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
    <div class="firm-type">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
    <div class="firm-addr">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
    <div><span style="display:inline-block;background:#1e40af;color:#fff;font-size:9px;font-weight:700;padding:3px 14px;border-radius:2px;margin-top:4px">BUYER LEDGER SUMMARY — ${tabLabel.toUpperCase()}</span></div>
  </div>

  <div class="meta-table">
    <div class="meta-row">
      <span><strong>Buyers Listed :</strong> ${filtered.length}</span>
      <span><strong>Printed :</strong> ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</span>
    </div>
  </div>

  <table class="items-table" style="margin-bottom:1px">
    <thead>
      <tr>
        <th style="width:6%">SrNo.</th>
        <th style="width:22%">Buyer Name</th>
        <th style="width:10%">Short Name</th>
        <th style="width:14%">Mobile</th>
        <th style="width:16%">Purchased</th>
        <th style="width:14%">Paid</th>
        <th style="width:14%">Due</th>
        <th style="width:10%">Status</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="text-align:left;padding-left:7px;font-size:8.5px;font-weight:700">TOTAL</td>
        <td style="text-align:right;font-size:8.5px;font-weight:800;color:#1e40af">&#8377; ${fmt(sumPurchased)}</td>
        <td style="text-align:right;font-size:8.5px;font-weight:800;color:#16a34a">&#8377; ${fmt(sumPaid)}</td>
        <td style="text-align:right;font-size:8.5px;font-weight:800;color:#dc2626">&#8377; ${fmt(sumDue)}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>

  <table class="deduct-table" style="margin-top:2px">
    <tbody>
      <tr class="net-row">
        <td class="net-label">TOTAL PENDING (${tabLabel})</td>
        <td class="net-value">&#8377; ${fmt(sumDue)}</td>
      </tr>
    </tbody>
  </table>

  <div class="in-words"><strong>In Words :</strong> ${toIndianWords(sumDue)} Only</div>
  <div class="eoae">(E.&amp;O.E.)</div>
</div>
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 300);
  };
<\/script>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=700,height=900');
    w.document.write(html);
    w.document.close();
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Buyer Ledger</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Payment tracking & balance for all buyers
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowAddBuyer(true)}
            style={{ display:'flex', alignItems:'center', gap:6, background:'#22c55e', color:'#fff',
              border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13, fontWeight:600 }}>
            <Plus size={14} /> Add Buyer
          </button>
          <button onClick={printAllBuyers}
            style={{ display:'flex', alignItems:'center', gap:6, background:'#f59e0b', color:'#fff',
              border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13, fontWeight:600 }}>
            <Printer size={14} /> Print / PDF
          </button>
          <button onClick={load}
            style={{ display:'flex', alignItems:'center', gap:6, background:'var(--accent)', color:'#fff',
              border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13, fontWeight:600 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {showAddBuyer && (
        <AddBuyerModal
          existingBuyers={buyers}
          onClose={() => setShowAddBuyer(false)}
          onAdded={load}
        />
      )}

      {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}

      {/* Summary cards — always all-time totals across every buyer, regardless of filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Purchased (All Buyers)', value: grandPurchased, color: 'var(--accent)' },
          { label: 'Total Paid (All Buyers)', value: grandPaid, color: '#22c55e' },
          { label: 'Total Balance Due', value: grandBalanceDue, color: grandBalanceDue > 0 ? '#ef4444' : '#22c55e' },
          { label: 'Buyers With Dues', value: unpaidCount, color: unpaidCount > 0 ? '#ef4444' : '#22c55e', isCount: true },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px 20px',
            border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{c.isCount ? c.value : `₹${fmt(c.value)}`}</div>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { id: 'all', label: `All Buyers (${withTotals.length})` },
          { id: 'unpaid', label: `Unpaid (${unpaidCount})` },
          { id: 'settled', label: `Settled (${settledCount})` },
        ].map(t => (
          <button key={t.id} onClick={() => setStatusTab(t.id)}
            style={{
              background: statusTab === t.id ? 'var(--accent)' : 'var(--bg-card)',
              color: statusTab === t.id ? '#fff' : 'var(--text-muted)',
              border: '1px solid ' + (statusTab === t.id ? 'var(--accent)' : 'var(--border)'),
              borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>PURCHASED ON</label>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '7px 12px', color: 'var(--text-primary)', fontSize: 13 }}
          />
          {filterDate && (
            <button onClick={() => setFilterDate('')}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                padding: '5px 10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
              Show All Dates
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>YEAR</label>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '7px 12px', color: 'var(--text-primary)', fontSize: 13 }}>
            <option value="">All</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>MONTH</label>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '7px 12px', color: 'var(--text-primary)', fontSize: 13 }}>
            <option value="">All</option>
            {MONTHS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
          {(filterYear || filterMonth) && (
            <button onClick={() => { setFilterYear(''); setFilterMonth(''); }}
              style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                padding: '5px 10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12 }}>
              Clear
            </button>
          )}
        </div>
        <input
          type="text"
          placeholder="Search buyer name or short name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
            padding: '7px 14px', color: 'var(--text-primary)', fontSize: 13, width: 260 }}
        />
      </div>
      {filterDate && (
        <div style={{ marginBottom: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          Showing buyers who purchased on <b>{filterDate}</b>. Totals below are still each buyer's full all-time figures — use this only to look up who came on a given market day.
        </div>
      )}
      {(filterYear || filterMonth) && (
        <div style={{ marginBottom: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          Showing buyers who purchased in <b>{[filterMonth && MONTHS.find(([v]) => v === filterMonth)?.[1], filterYear].filter(Boolean).join(' ')}</b>.
          Totals below are still each buyer's full all-time figures. Use <b>Print / PDF</b> above to print this filtered list.
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-panel)', borderBottom: '2px solid var(--border)' }}>
              <th style={thS}>Buyer Name</th>
              <th style={thS}>Short Name</th>
              <th style={thS}>Mobile</th>
              <th style={{ ...thS, textAlign: 'right' }}>Total Purchased</th>
              <th style={{ ...thS, textAlign: 'right' }}>Total Paid</th>
              <th style={{ ...thS, textAlign: 'right' }}>Balance Due</th>
              <th style={{ ...thS, textAlign: 'center' }}>Status</th>
              <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ ...tdS, textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading...</td></tr>
            ) : filteredWithPurchases.length === 0 ? (
              <tr><td colSpan={8} style={{ ...tdS, textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No buyers found</td></tr>
            ) : (
              filteredWithPurchases.map(({ buyer, key, allPurchasesByDate, totalPurchased, totalPaid, balance }) => (
                <BuyerLedgerRow
                  key={key}
                  buyer={buyer}
                  buyerKey={key}
                  sellers={sellers}
                  allPurchasesByDate={allPurchasesByDate}
                  totalPurchased={totalPurchased}
                  totalPaid={totalPaid}
                  balance={balance}
                  allPayments={payments}
                  allDues={dues}
                  onPaymentChange={load}
                  onDeleteBuyer={deleteBuyer}
                  isDuplicateName={nameCounts[buyer.name.trim().toUpperCase()] > 1}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filteredWithPurchases.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
          Showing {filteredWithPurchases.length} buyer{filteredWithPurchases.length !== 1 ? 's' : ''}
        </div>
      )}

      {!loading && filteredManualOnly.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '26px 0 12px' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Manually Added Buyers / Opening Balance Only
            </span>
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 10 }}>
            No purchase bills recorded yet for these buyers — totals below come only from manually entered old dues.
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid rgba(245,158,11,0.4)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '2px solid var(--border)' }}>
                  <th style={thS}>Buyer Name</th>
                  <th style={thS}>Short Name</th>
                  <th style={thS}>Mobile</th>
                  <th style={{ ...thS, textAlign: 'right' }}>Total Purchased</th>
                  <th style={{ ...thS, textAlign: 'right' }}>Total Paid</th>
                  <th style={{ ...thS, textAlign: 'right' }}>Balance Due</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Status</th>
                  <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredManualOnly.map(({ buyer, key, allPurchasesByDate, totalPurchased, totalPaid, balance }) => (
                  <BuyerLedgerRow
                    key={key}
                    buyer={buyer}
                    buyerKey={key}
                    sellers={sellers}
                    allPurchasesByDate={allPurchasesByDate}
                    totalPurchased={totalPurchased}
                    totalPaid={totalPaid}
                    balance={balance}
                    allPayments={payments}
                    allDues={dues}
                    onPaymentChange={load}
                    onDeleteBuyer={deleteBuyer}
                    isDuplicateName={nameCounts[buyer.name.trim().toUpperCase()] > 1}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
            Showing {filteredManualOnly.length} buyer{filteredManualOnly.length !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}
