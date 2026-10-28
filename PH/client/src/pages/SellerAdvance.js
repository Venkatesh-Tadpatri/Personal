import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Plus, Edit2, Trash2, Check, X, Eye, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { todayISO } from '../utils';
import { useSort, SortTh } from '../sorting';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

const fmt = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');

// A "given" entry is cash handed to the seller ahead of produce; a "repaid" entry is cash
// the seller hands back (e.g. they decide not to bring produce after all). Outstanding =
// sum(given) − sum(repaid). This page is a pure ledger: who, how much, given or repaid,
// and when — it does not fetch or net against sales/seller-registration data.
function TypeToggle({ type, onChange }) {
  return (
    <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
      {['given', 'repaid'].map(t => (
        <button key={t} type="button" onClick={() => onChange(t)}
          style={{
            padding: '5px 10px', fontSize: 11.5, fontWeight: 700, border: 'none', cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: '0.03em',
            background: type === t ? (t === 'given' ? '#a855f7' : '#22c55e') : 'var(--bg-panel)',
            color: type === t ? '#fff' : 'var(--text-muted)',
          }}>
          {t === 'given' ? 'Given' : 'Repaid'}
        </button>
      ))}
    </div>
  );
}

function AdvanceRow({ advance, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(advance.amount));
  const [date, setDate] = useState(advance.advance_date);
  const [note, setNote] = useState(advance.note || '');
  const [type, setType] = useState(advance.type === 'repaid' ? 'repaid' : 'given');

  const save = async () => {
    if (!amount || isNaN(Number(amount))) return toast.error('Enter valid amount');
    try {
      await API.put(`/api/seller-advances/${advance.id}`, {
        amount: Number(amount), advance_date: date, note, type,
        village: advance.village || '', mobile: advance.mobile || '',
      });
      setEditing(false);
      onSave();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to save'); }
  };

  const cancel = (e) => {
    e.stopPropagation();
    setAmount(String(advance.amount));
    setDate(advance.advance_date);
    setNote(advance.note || '');
    setType(advance.type === 'repaid' ? 'repaid' : 'given');
    setEditing(false);
  };

  const isRepaid = advance.type === 'repaid';

  if (editing) {
    return (
      <tr style={{ background: 'var(--bg-hover)' }}>
        <td style={tdS}><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputS} /></td>
        <td style={tdS}><TypeToggle type={type} onChange={setType} /></td>
        <td style={tdS}>
          <input type="text" value={note} onChange={e => setNote(e.target.value)} style={inputS} placeholder="Note (optional)" />
        </td>
        <td style={tdS}>
          <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
            style={{ ...inputS, textAlign: 'right' }} placeholder="Amount" />
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
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
      <td style={tdS}>{advance.advance_date}</td>
      <td style={tdS}>
        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase',
          background: isRepaid ? '#22c55e20' : '#a855f720', color: isRepaid ? '#22c55e' : '#a855f7' }}>
          {isRepaid ? 'Repaid' : 'Given'}
        </span>
      </td>
      <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{advance.note || (isRepaid ? 'Advance repaid' : 'Advance given')}</td>
      <td style={{ ...tdS, textAlign: 'right', fontWeight: 600, color: isRepaid ? '#22c55e' : '#a855f7' }}>
        {isRepaid ? '−' : '+'} ₹{fmt(advance.amount)}
      </td>
      <td style={{ ...tdS, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <button onClick={() => setEditing(true)} style={iconBtnS('var(--accent)')}><Edit2 size={13} /></button>
        <button onClick={() => onDelete(advance.id)} style={{ ...iconBtnS('#ef4444'), marginLeft: 4 }}><Trash2 size={13} /></button>
      </td>
    </tr>
  );
}

function AddAdvanceRow({ sellerName, sellerVillage, sellerMobile, onAdded }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!amount || isNaN(Number(amount))) return toast.error('Enter valid amount');
    setSaving(true);
    try {
      await API.post('/api/seller-advances', {
        seller_name: sellerName, village: sellerVillage || '', mobile: sellerMobile || '',
        amount: Number(amount), advance_date: date, type: 'given', note
      });
      setAmount(''); setNote(''); setDate(todayISO());
      onAdded();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to add advance'); }
    setSaving(false);
  };

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, padding: '10px 12px',
      background: 'rgba(168,85,247,0.06)', border: '1px dashed rgba(168,85,247,0.45)', borderRadius: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#a855f7', whiteSpace: 'nowrap' }}>
        <Plus size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} /> ADVANCE GIVEN
      </span>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputS, width: 140 }} />
      <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
        style={{ ...inputS, width: 120, textAlign: 'right' }} placeholder="Amount ₹" />
      <input type="text" value={note} onChange={e => setNote(e.target.value)}
        style={{ ...inputS, flex: 1, minWidth: 140 }} placeholder="Note (optional, e.g. before harvest)" />
      <button onClick={save} disabled={saving}
        style={{ background: '#a855f7', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px',
          cursor: saving ? 'default' : 'pointer', fontSize: 12.5, fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
        {saving ? 'Saving...' : 'Add Advance'}
      </button>
    </div>
  );
}

// Quick, focused entry for logging a repayment against an already-known seller — reached
// via the "Repay" button on their row, not bundled into the Given/Repaid Add Advance flow.
function RepayModal({ sellerName, sellerVillage, sellerMobile, onClose, onAdded }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await API.post('/api/seller-advances', {
        seller_name: sellerName, village: sellerVillage || '', mobile: sellerMobile || '',
        amount: Number(amount), advance_date: date, type: 'repaid', note
      });
      toast.success('Repayment recorded');
      onAdded();
      onClose();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  return (
    <div style={overlayS} onClick={onClose}>
      <div style={modalS} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Record Repayment</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          Cash <b>{sellerName}</b> paid back against their advance.
        </div>

        <label style={labelS}>Repaid Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputS, marginBottom: 10 }} autoFocus />

        <label style={labelS}>Amount</label>
        <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
          style={{ ...inputS, marginBottom: 10, textAlign: 'right' }} placeholder="Amount ₹" />

        <label style={labelS}>Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)}
          style={{ ...inputS, marginBottom: 18 }} placeholder="e.g. Paid back in cash" />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={secondaryBtnS}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ ...primaryBtnS, opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Add Repayment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Lets an advance be recorded against any seller name (even one that's never sold anything
// yet) right from the main list — mirrors AddBuyerModal's "no history needed" entry point.
function AddAdvanceModal({ knownSellerNames, onClose, onAdded }) {
  const [name, setName] = useState('');
  const [village, setVillage] = useState('');
  const [mobile, setMobile] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return toast.error('Enter seller name');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return toast.error('Enter a valid amount');
    setSaving(true);
    try {
      await API.post('/api/seller-advances', {
        seller_name: name.trim().toUpperCase(), village: village.trim(), mobile: mobile.trim(),
        amount: Number(amount), advance_date: date, type: 'given', note
      });
      toast.success('Advance recorded');
      onAdded();
      onClose();
    } catch (err) { toast.error(err?.response?.data?.error || 'Failed to add advance'); }
    setSaving(false);
  };

  return (
    <div style={overlayS} onClick={onClose}>
      <div style={modalS} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Add Seller Advance</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
          Cash given to a seller before they bring produce to sell.
        </div>

        <label style={labelS}>Seller Name</label>
        <input type="text" list="seller-advance-names" value={name} onChange={e => setName(e.target.value.toUpperCase())}
          style={{ ...inputS, marginBottom: 10 }} placeholder="FULL NAME" autoFocus />
        <datalist id="seller-advance-names">
          {knownSellerNames.map(n => <option key={n} value={n} />)}
        </datalist>

        <label style={labelS}>Village</label>
        <input type="text" value={village} onChange={e => setVillage(e.target.value)}
          style={{ ...inputS, marginBottom: 10 }} placeholder="Village (optional)" />

        <label style={labelS}>Mobile Number</label>
        <input type="text" inputMode="numeric" value={mobile} onChange={e => setMobile(e.target.value)}
          style={{ ...inputS, marginBottom: 10 }} placeholder="Mobile number (optional)" />

        <label style={labelS}>Advance Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputS, marginBottom: 10 }} />

        <label style={labelS}>Amount</label>
        <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
          style={{ ...inputS, marginBottom: 10, textAlign: 'right' }} placeholder="Amount ₹" />

        <label style={labelS}>Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)}
          style={{ ...inputS, marginBottom: 18 }} placeholder="e.g. Given before harvest" />

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={secondaryBtnS}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ ...primaryBtnS, background: '#a855f7', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Add Advance'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SellerAdvanceRow({ slNo, sellerKey, displayName, village, mobile, advances, totalGiven, totalRepaid, outstanding, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const { sort, toggleSort, sortRows } = useSort('date', 'desc');
  const sortedAdvances = sortRows(advances, {
    date:   a => a.advance_date,
    type:   a => (a.type === 'repaid' ? 'Repaid' : 'Given'),
    note:   a => a.note,
    amount: a => Number(a.amount) || 0,
  });
  const [repaying, setRepaying] = useState(false);

  const deleteAdvance = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await API.delete(`/api/seller-advances/${id}`);
      onChange();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <>
      <tr onClick={() => setExpanded(true)}
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; }}>
        <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12, width: 44 }}>{slNo}</td>
        <td style={{ ...tdS, fontWeight: 700 }}>{displayName}</td>
        <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{village || '—'}</td>
        <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{mobile || '—'}</td>
        <td style={{ ...tdS, textAlign: 'right', fontWeight: 600, color: '#a855f7' }}>₹{fmt(totalGiven)}</td>
        <td style={{ ...tdS, textAlign: 'right', fontWeight: 600, color: '#22c55e' }}>{totalRepaid > 0 ? `₹${fmt(totalRepaid)}` : '—'}</td>
        <td style={{ ...tdS, textAlign: 'right', fontWeight: 700 }}>₹{fmt(outstanding)}</td>
        <td style={{ ...tdS, color: 'var(--text-muted)', fontSize: 12 }}>{advances.length}</td>
        <td style={{ ...tdS, textAlign: 'center', whiteSpace: 'nowrap' }}>
          <button onClick={e => { e.stopPropagation(); setExpanded(true); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            <Eye size={13} /> <span className="btn-text">View</span>
          </button>
          <button onClick={e => { e.stopPropagation(); setRepaying(true); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#22c55e', color: '#fff',
              border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginLeft: 6 }}>
            <RotateCcw size={13} /> <span className="btn-text">Repay</span>
          </button>
        </td>
      </tr>

      {repaying && (
        <RepayModal sellerName={sellerKey} sellerVillage={village} sellerMobile={mobile}
          onClose={() => setRepaying(false)} onAdded={onChange} />
      )}

      {expanded && (
        <div style={overlayS} onClick={() => setExpanded(false)}>
          <div style={{ ...modalS, width: 620, maxWidth: '95vw', maxHeight: '88vh', overflowY: 'auto', padding: 0 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{displayName}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {[village, mobile].filter(Boolean).join(' · ') || '—'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Given ₹{fmt(totalGiven)} &nbsp;−&nbsp; Repaid ₹{fmt(totalRepaid)} &nbsp;=&nbsp;
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}> Outstanding ₹{fmt(outstanding)}</span>
                  </div>
                </div>
                <button onClick={() => setExpanded(false)}
                  style={{ display:'flex', alignItems:'center', gap:6, background:'none', color:'var(--text-muted)',
                    border:'1px solid var(--border)', borderRadius:8, padding:'7px 10px', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                  <X size={14} /> Close
                </button>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>Advance History</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 6 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card)' }}>
                    <SortTh col="date" label="Date" style={thS} sort={sort} onSort={toggleSort} />
                    <SortTh col="type" label="Type" style={thS} sort={sort} onSort={toggleSort} />
                    <SortTh col="note" label="Note" style={thS} sort={sort} onSort={toggleSort} />
                    <SortTh col="amount" label="Amount" align="right" style={thS} sort={sort} onSort={toggleSort} />
                    <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {advances.length === 0 ? (
                    <tr><td colSpan={5} style={{ ...tdS, textAlign: 'center', color: 'var(--text-muted)' }}>No entries recorded yet</td></tr>
                  ) : (
                    sortedAdvances.map(a => (
                      <AdvanceRow key={a.id} advance={a} onSave={onChange} onDelete={deleteAdvance} />
                    ))
                  )}
                </tbody>
              </table>
              <AddAdvanceRow sellerName={sellerKey} sellerVillage={village} sellerMobile={mobile} onAdded={onChange} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SellerAdvance() {
  const [sellers, setSellers] = useState([]);
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddAdvance, setShowAddAdvance] = useState(false);
  const [search, setSearch] = useState('');
  const { sort: listSort, toggleSort: toggleListSort, sortRows: sortList } = useSort('name');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sellersRes = await API.get('/api/sellers');
      setSellers(sellersRes.data.data || []);
    } catch {
      setSellers([]);
    }
    try {
      const advRes = await API.get('/api/seller-advances');
      setAdvances(advRes.data.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load advances');
      setAdvances([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // This page is a pure ledger: it lists only sellers that have an advance/repaid entry,
  // and shows only what was actually recorded here. Seller Registration/sales data is
  // fetched solely to power the "known seller" autocomplete in the Add Advance modal —
  // nothing displayed here is computed from it.
  const knownSellerNames = Array.from(
    new Set(sellers.map(s => (s.name || '').toUpperCase().trim()).filter(Boolean))
  ).sort();

  const withTotals = Array.from(
    new Set(advances.map(a => (a.seller_name || '').toUpperCase().trim()).filter(Boolean))
  ).map(sellerKey => {
    const sellerAdvances = advances
      .filter(a => (a.seller_name || '').toUpperCase().trim() === sellerKey)
      .sort((a, b) => (b.advance_date || '').localeCompare(a.advance_date || ''));
    const displayName = sellerAdvances[0]?.seller_name || sellerKey;
    const village = sellerAdvances.find(a => a.village)?.village || '';
    const mobile = sellerAdvances.find(a => a.mobile)?.mobile || '';
    const totalGiven = sellerAdvances.filter(a => a.type !== 'repaid').reduce((s, a) => s + Number(a.amount || 0), 0);
    const totalRepaid = sellerAdvances.filter(a => a.type === 'repaid').reduce((s, a) => s + Number(a.amount || 0), 0);
    const outstanding = totalGiven - totalRepaid;
    return { sellerKey, displayName, village, mobile, advances: sellerAdvances, totalGiven, totalRepaid, outstanding };
  }).sort((a, b) => a.displayName.localeCompare(b.displayName));

  const grandGiven      = withTotals.reduce((s, r) => s + r.totalGiven, 0);
  const grandRepaid     = withTotals.reduce((s, r) => s + r.totalRepaid, 0);
  const grandOutstanding = withTotals.reduce((s, r) => s + r.outstanding, 0);

  const filtered = sortList(withTotals.filter(r =>
    !search || r.displayName.toLowerCase().includes(search.toLowerCase())
  ), {
    name:        r => r.displayName,
    village:     r => r.village,
    mobile:      r => r.mobile,
    given:       r => r.totalGiven,
    repaid:      r => r.totalRepaid,
    outstanding: r => r.outstanding,
    entries:     r => r.advances.length,
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Seller Advance List</div>
          <div className="page-subtitle">Cash given to sellers before they bring produce to sell — who, how much, and any repayments</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowAddAdvance(true)}
            style={{ display:'flex', alignItems:'center', gap:6, background:'#a855f7', color:'#fff',
              border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13, fontWeight:600 }}>
            <Plus size={14} /> Add Advance
          </button>
          <button onClick={load}
            style={{ display:'flex', alignItems:'center', gap:6, background:'var(--accent)', color:'#fff',
              border:'none', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13, fontWeight:600 }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {showAddAdvance && (
        <AddAdvanceModal knownSellerNames={knownSellerNames} onClose={() => setShowAddAdvance(false)} onAdded={load} />
      )}

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Given</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#a855f7' }}>₹{fmt(grandGiven)}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Total Repaid</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>₹{fmt(grandRepaid)}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Net Outstanding</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>₹{fmt(grandOutstanding)}</div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Sellers</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{withTotals.length}</div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <input
          type="text"
          placeholder="Search seller name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
            padding: '7px 14px', color: 'var(--text-primary)', fontSize: 13, width: 260 }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-panel)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ ...thS, width: 44 }}>#</th>
              <SortTh col="name" label="Seller Name" style={thS} sort={listSort} onSort={toggleListSort} />
              <SortTh col="village" label="Village" style={thS} sort={listSort} onSort={toggleListSort} />
              <SortTh col="mobile" label="Mobile" style={thS} sort={listSort} onSort={toggleListSort} />
              <SortTh col="given" label="Given" align="right" style={thS} sort={listSort} onSort={toggleListSort} />
              <SortTh col="repaid" label="Repaid" align="right" style={thS} sort={listSort} onSort={toggleListSort} />
              <SortTh col="outstanding" label="Outstanding" align="right" style={thS} sort={listSort} onSort={toggleListSort} />
              <SortTh col="entries" label="Entries" style={thS} sort={listSort} onSort={toggleListSort} />
              <th style={{ ...thS, textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ ...tdS, textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ ...tdS, textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                No advances recorded yet — click "Add Advance" to record one.
              </td></tr>
            ) : (
              filtered.map((r, i) => (
                <SellerAdvanceRow key={r.sellerKey} slNo={i + 1} {...r} onChange={load} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
          Showing {filtered.length} seller{filtered.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

const tdS = { padding: '8px 10px', verticalAlign: 'middle' };
const thS = { padding: '8px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputS = { background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', fontSize: 12, width: '100%' };
const iconBtnS = (color) => ({ background: 'none', border: 'none', cursor: 'pointer', color, padding: '2px 4px', borderRadius: 4, display: 'inline-flex', alignItems: 'center' });
const labelS = { display: 'block', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' };
const overlayS = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalS = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
  padding: 22, width: 360, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' };
const secondaryBtnS = { background: 'none', border: '1px solid var(--border)', borderRadius: 8,
  padding: '8px 16px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 };
const primaryBtnS = { background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8,
  padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 700 };
