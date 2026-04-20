import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, ShoppingCart, Package, TrendingUp, Download, Printer } from 'lucide-react';
import axios from 'axios';
import { fmtINR, fmtNum, todayISO } from '../utils';
import { getBuyers } from '../api';
import mdLogo from '../assets/MD_logo.png';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

const REPORT_BRAND = {
  leftLine1: 'Prop. MD.Moinuddin',
  leftLine2: 'Cell : 9448890808',
  rightLine1: 'Cell: 8483270595',
  rightLine2: 'Cell : 8277388885',
  logoSrc: mdLogo,
  firmName: 'MD. Moinuddin',
  badge: 'GINGER, GARLIC, ONION,TAMARIND & VEGETABLES',
  firmType: 'ORDER SUPPLIER & COMMISSION AGENT',
  firmAddress: 'Shop No.2, Rajendra Prasad APMC Market Yard, Humnabad - 585 330 Dist. Bidar (KA)',
};

const fmt2 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
const fmtN = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');

async function fetchAllBuyerStats(date) {
  const params = date ? { date } : {};
  const res = await API.get('/api/sellers', { params });
  const sellers = res.data.data || [];
  const stats = {};
  sellers.forEach(seller => {
    let bags = [];
    try { bags = JSON.parse(seller.bag_data || '[]'); } catch {}
    bags.forEach(bag => {
      if (!bag.buyer) return;
      const key = bag.buyer.toUpperCase();
      if (!stats[key]) stats[key] = { bags: 0, weight: 0, amount: 0 };
      stats[key].bags   += 1;
      stats[key].weight += Number(bag.weight) || 0;
      stats[key].amount += Number(bag.amount) || 0;
    });
  });
  return stats;
}

export default function BuyerSummary() {
  const [buyers,     setBuyers]     = useState([]);
  const [stats,      setStats]      = useState({});
  const [loading,    setLoading]    = useState(true);
  const [filterDate, setFilterDate] = useState(todayISO());
  const [showTable,  setShowTable]  = useState(true);

  const getLiveStats = useCallback((b) => {
    const key = (b.lot_number && b.lot_number !== '—')
      ? b.lot_number.toUpperCase()
      : (b.name || '').toUpperCase();
    return stats[key] || { bags: 0, weight: 0, amount: 0 };
  }, [stats]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [buyerRes, buyerStats] = await Promise.all([
        getBuyers(''),
        fetchAllBuyerStats(filterDate),
      ]);
      setBuyers(buyerRes.data.data || []);
      setStats(buyerStats);
    } catch (err) {
      toast.error(err.message || 'Failed to load buyer summary');
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => { load(); }, [load]);

  // Only buyers with activity on the filtered date (or all if no date filter)
  const activeBuyers = filterDate
    ? buyers.filter(b => getLiveStats(b).bags > 0)
    : buyers;

  const totalBuyers  = activeBuyers.length;
  const totalBags    = activeBuyers.reduce((s, b) => s + getLiveStats(b).bags,   0);
  const totalWeight  = activeBuyers.reduce((s, b) => s + getLiveStats(b).weight, 0);
  const totalAmount  = activeBuyers.reduce((s, b) => s + getLiveStats(b).amount, 0);
  const totalAdvance = activeBuyers.reduce((s, b) => s + (Number(b.advance_amount) || 0), 0);
  const totalBalance = Math.round(totalAmount - totalAdvance);

  // Export CSV
  const exportCSV = () => {
    const headers = ['Sr.No', 'Short Name', 'Full Name', 'Material', 'Bags', 'Weight(kg)', 'Amount(₹)', 'Advance(₹)', 'Balance(₹)'];
    const rows = activeBuyers.map((b, i) => {
      const s   = getLiveStats(b);
      const adv = Number(b.advance_amount) || 0;
      const bal = Math.round(s.amount - adv);
      return [i + 1, b.serial_number || '—', b.name, b.material || '—', s.bags, Math.round(s.weight), Math.round(s.amount), adv, bal];
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `buyer-summary-${filterDate || 'all'}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  // Print
  const printTable = () => {
    const printHtml = (html) => {
      if (window.electronAPI && window.electronAPI.printHTML) {
        window.electronAPI.printHTML(html);
      } else {
        const w = window.open('', '_blank', 'width=1000,height=750');
        if (w && w.document) { w.document.write(html); w.document.close(); }
      }
    };

    const dateLabel = filterDate
      ? new Date(filterDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'All Time';

    const P = 'padding:6px 7px;border:1px solid #b8cef0;font-size:10px;';
    let rowsHtml = '';
    activeBuyers.forEach((buyer, i) => {
      const s   = getLiveStats(buyer);
      const adv = Number(buyer.advance_amount) || 0;
      const bal = Math.round(s.amount - adv);
      const rowBg = i % 2 === 0 ? '#ffffff' : '#f0f7ff';
      rowsHtml += `<tr style="background:${rowBg};border-bottom:2px solid #93c5fd">
        <td style="${P}font-weight:800;color:#d97706;text-align:center">${i + 1}</td>
        <td style="${P}font-family:monospace;font-weight:700;color:#4fa3ff;text-align:center">${buyer.serial_number || '—'}</td>
        <td style="${P}font-weight:700;color:#1a1a1a">${buyer.name}</td>
        <td style="${P}text-align:center;color:#333">${buyer.material && buyer.material !== 'GENERAL' ? buyer.material : '—'}</td>
        <td style="${P}text-align:center;font-weight:700">${s.bags > 0 ? s.bags : '—'}</td>
        <td style="${P}text-align:right;font-weight:700;color:#1e40af">${s.weight > 0 ? fmtN(s.weight) : '—'}</td>
        <td style="${P}text-align:right;font-weight:800;color:#1a56db;background:#eff6ff">${s.amount > 0 ? '₹ ' + fmt2(s.amount) : '—'}</td>
        <td style="${P}text-align:right;font-weight:700;color:#555;background:#f9fafb">${adv > 0 ? '₹ ' + fmt2(adv) : '—'}</td>
        <td style="${P}text-align:right;font-weight:800;color:${bal > 0 ? '#dc2626' : '#166534'};background:${bal > 0 ? '#fff5f5' : '#f0fdf4'}">${s.amount > 0 ? '₹ ' + fmt2(bal) : '—'}</td>
      </tr>`;
    });

    const html = `<!DOCTYPE html>
<html><head>
  <title>Buyer Summary — ${filterDate || 'All'}</title>
  <style>
    @page { size: A4 landscape; margin: 6mm 8mm; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Arial,sans-serif; font-size:10px; color:#111; background:#fff; }
    .page-wrap { border:2px solid #93c5fd; border-radius:4px; padding:10px 12px; position:relative; min-height:97%; }
    .header { text-align:center; border-bottom:2px solid #93c5fd; padding-bottom:9px; margin-bottom:10px; }
    .prop-row { display:flex; justify-content:space-between; align-items:center; font-size:9px; color:#444; margin-bottom:5px; }
    .logo-circle { width:34px; height:34px; border-radius:50%; border:2px solid #93c5fd; display:flex; align-items:center; justify-content:center; background:#eff6ff; overflow:hidden; flex-shrink:0; }
    .firm-name { font-size:18px; font-weight:900; color:#1a1a1a; }
    .firm-badge { display:inline-block; background:#dbeafe; color:#1e3a8a; font-size:8px; font-weight:700; letter-spacing:1.2px; padding:2px 12px; border-radius:2px; margin:2px 0 1px; }
    .firm-type { font-size:9px; font-weight:700; color:#333; }
    .firm-addr { font-size:8px; color:#666; }
    .date-line { display:inline-block; background:#dbeafe; color:#1e3a8a; font-size:10px; font-weight:700; padding:2px 16px; border-radius:2px; margin-top:5px; }
    table { width:100%; border-collapse:collapse; }
    thead th { background:#1a56db; color:#fff; padding:6px 7px; font-size:9px; font-weight:700; border:1px solid #1245b5; text-transform:uppercase; }
    tfoot td { background:#dbeafe !important; font-weight:800; border-top:2px solid #1a56db !important; padding:7px; color:#1e40af; font-size:10px; }
    .summary-box { margin-top:8px; border:1.5px solid #1a56db; border-radius:4px; padding:6px 12px; background:#f0f7ff; display:flex; gap:18px; flex-wrap:wrap; }
    .sum-item .sum-label { font-size:8px; color:#666; text-transform:uppercase; }
    .sum-item .sum-val { font-weight:900; color:#1a56db; font-size:12px; }
    .foot-note { text-align:right; font-size:8px; color:#888; margin-top:4px; font-style:italic; }
    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  </style>
</head><body>
<div class="page-wrap">
  <div class="header">
    <div class="prop-row">
      <span>${REPORT_BRAND.leftLine1}<br>${REPORT_BRAND.leftLine2}</span>
      <div class="logo-circle"><img src="${REPORT_BRAND.logoSrc}" alt="MD" style="width:100%;height:100%;object-fit:contain;" /></div>
      <span>${REPORT_BRAND.rightLine1}<br>${REPORT_BRAND.rightLine2}</span>
    </div>
    <div class="firm-name">${REPORT_BRAND.firmName}</div>
    <div><span class="firm-badge">${REPORT_BRAND.badge}</span></div>
    <div class="firm-type">${REPORT_BRAND.firmType}</div>
    <div class="firm-addr">${REPORT_BRAND.firmAddress}</div>
    <div><span class="date-line">BUYER SUMMARY — ${dateLabel}</span></div>
  </div>
  <table>
    <thead><tr>
      <th style="width:36px;text-align:center">Sr</th>
      <th style="width:70px;text-align:center">Short Name</th>
      <th style="width:120px">Full Name</th>
      <th style="width:80px;text-align:center">Material</th>
      <th style="width:46px;text-align:center">Bags</th>
      <th style="width:90px;text-align:right">Weight(kg)</th>
      <th style="text-align:right;background:#1e3a8a">Amount(₹)</th>
      <th style="width:90px;text-align:right">Advance(₹)</th>
      <th style="text-align:right;background:#7f1d1d">Balance(₹)</th>
    </tr></thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot><tr>
      <td colspan="4" style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af">TOTALS · ${totalBuyers} buyers</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af;text-align:center">${totalBags}</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af;text-align:right">${fmtN(totalWeight)} kg</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1a56db;text-align:right;font-size:12px">₹ ${fmt2(totalAmount)}</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af;text-align:right">₹ ${fmt2(totalAdvance)}</td>
      <td style="border:1px solid #b8cef0;background:${totalBalance > 0 ? '#fee2e2' : '#dcfce7'};padding:7px;font-weight:800;color:${totalBalance > 0 ? '#dc2626' : '#166534'};text-align:right;font-size:13px">₹ ${fmt2(totalBalance)}</td>
    </tr></tfoot>
  </table>
  <div class="summary-box">
    <div class="sum-item"><div class="sum-label">Buyers</div><div class="sum-val">${totalBuyers}</div></div>
    <div class="sum-item"><div class="sum-label">Total Bags</div><div class="sum-val">${totalBags}</div></div>
    <div class="sum-item"><div class="sum-label">Total Weight</div><div class="sum-val">${fmtN(totalWeight)} kg</div></div>
    <div class="sum-item"><div class="sum-label">Total Amount</div><div class="sum-val">₹ ${fmt2(totalAmount)}</div></div>
    <div class="sum-item"><div class="sum-label">Advance Recd.</div><div class="sum-val" style="color:#555">₹ ${fmt2(totalAdvance)}</div></div>
    <div class="sum-item"><div class="sum-label">Balance Due</div><div class="sum-val" style="color:${totalBalance > 0 ? '#dc2626' : '#166534'}">₹ ${fmt2(totalBalance)}</div></div>
  </div>
  <div class="foot-note">Printed: ${new Date().toLocaleString('en-IN')} | (E.&amp;O.E.)</div>
  <script>window.onload=function(){window.print();}<\/script>
</div></body></html>`;
    printHtml(html);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Buyer Summary</div>
          <div className="page-subtitle">
            {filterDate
              ? `Buyer overview for ${new Date(filterDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
              : 'All-time buyer overview'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="form-input" type="date" value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{ textTransform: 'none', width: 170 }} />
          <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate(todayISO())}>Today</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate('')}>All Time</button>
          <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
          {activeBuyers.length > 0 && (
            <>
              <button className="btn btn-green btn-sm" onClick={exportCSV}>
                <Download size={14} /> CSV
              </button>
              <button className="btn btn-primary btn-sm" onClick={printTable}>
                <Printer size={14} /> Print List
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🛒</div>
          <div>Loading buyer summary...</div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ marginBottom: 10, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={12} /> Buyer Summary
          </div>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Buyers',   value: totalBuyers,                        color: 'amber',  icon: <ShoppingCart size={20} /> },
              { label: 'Total Bags',     value: fmtNum(totalBags, 0),               color: 'green',  icon: <Package size={20} /> },
              { label: 'Total Weight',   value: fmtNum(totalWeight) + ' kg',        color: 'blue',   icon: <TrendingUp size={20} /> },
              { label: 'Total Amount',   value: '₹ ' + fmtINR(totalAmount),         color: 'purple', icon: <span style={{ fontWeight: 800, fontSize: 18 }}>₹</span> },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className={`stat-icon ${s.color}`} style={s.color === 'purple' ? { background: 'rgba(139,92,246,0.15)', color: 'var(--purple)', fontWeight: 800, fontSize: 18 } : {}}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Financial Summary Cards */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Amount',   value: '₹ ' + fmtINR(totalAmount),  color: 'var(--blue)'   },
              { label: 'Advance Recd.',  value: '₹ ' + fmtINR(totalAdvance), color: 'var(--text-secondary)' },
              { label: 'Balance Due',    value: '₹ ' + fmtINR(totalBalance), color: totalBalance > 0 ? '#dc2626' : 'var(--green)' },
            ].map(item => (
              <div key={item.label} style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: item.color, fontFamily: 'var(--font-display)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Buyer Detail Table */}
          <div className="card" style={{ marginBottom: 24, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="card-title" style={{ margin: 0 }}>
                🛒 Buyer-wise Detail &nbsp;
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>
                  ({activeBuyers.length} buyers{filterDate ? ' with purchases today' : ''})
                </span>
              </div>
              <button onClick={() => setShowTable(t => !t)} className="btn btn-secondary btn-sm">
                {showTable ? 'Hide' : 'Show'} Table
              </button>
            </div>

            {showTable && (
              <div style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 10, overflow: 'auto' }}>
                {activeBuyers.length === 0 ? (
                  <div className="empty-state" style={{ padding: 40 }}>
                    <div className="empty-state-icon">🛒</div>
                    <h3>No buyer data for this period</h3>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '46px' }} />
                      <col style={{ width: '80px' }} />
                      <col style={{ width: '130px' }} />
                      <col style={{ width: '100px' }} />
                      <col style={{ width: '60px' }} />
                      <col style={{ width: '100px' }} />
                      <col style={{ width: '115px' }} />
                      <col style={{ width: '100px' }} />
                      <col style={{ width: '115px' }} />
                    </colgroup>
                    <thead>
                      <tr style={{ background: 'var(--bg-panel)' }}>
                        {[
                          { label: 'Sr',          align: 'center' },
                          { label: 'Short Name',  align: 'center' },
                          { label: 'Name',        align: 'left'   },
                          { label: 'Material',    align: 'center' },
                          { label: 'Bags',        align: 'center' },
                          { label: 'Weight (kg)', align: 'right'  },
                          { label: 'Amount (₹)',  align: 'right'  },
                          { label: 'Advance (₹)', align: 'right'  },
                          { label: 'Balance (₹)', align: 'right'  },
                        ].map(h => (
                          <th key={h.label} style={{
                            padding: '10px 8px', textAlign: h.align,
                            fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            borderBottom: '2px solid var(--blue)',
                            borderRight: '1px solid var(--border)',
                          }}>{h.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeBuyers.map((buyer, i) => {
                        const s      = getLiveStats(buyer);
                        const adv    = Number(buyer.advance_amount) || 0;
                        const bal    = Math.round(s.amount - adv);
                        const rowBg  = i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-panel)';
                        const cell   = { borderRight: '1px solid var(--border)', borderBottom: '2px solid var(--blue)', padding: '9px 8px', verticalAlign: 'middle' };
                        const mat    = buyer.material && buyer.material !== 'GENERAL' ? buyer.material : '—';
                        const badge  = mat === 'TAMARIND' ? 'badge-amber' : mat === 'GINGER' ? 'badge-green' : mat === 'ONION' ? 'badge-blue' : mat === 'LEMONS' ? 'badge-purple' : 'badge-amber';
                        return (
                          <tr key={buyer.id} style={{ background: rowBg }}>
                            <td style={{ ...cell, fontWeight: 800, color: 'var(--blue)', textAlign: 'center', fontSize: 14 }}>{i + 1}</td>
                            <td style={{ ...cell, fontFamily: 'monospace', fontWeight: 800, color: '#4fa3ff', textAlign: 'center', fontSize: 12 }}>{buyer.serial_number || '—'}</td>
                            <td style={{ ...cell, fontWeight: 700, color: 'var(--text-primary)' }}>{buyer.name}</td>
                            <td style={{ ...cell, textAlign: 'center' }}>{mat !== '—' ? <span className={'badge ' + badge}>{mat}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                            <td style={{ ...cell, textAlign: 'center', fontWeight: 700 }}>{s.bags > 0 ? s.bags : <span style={{ color: 'var(--text-muted)' }}>0</span>}</td>
                            <td style={{ ...cell, textAlign: 'right', fontWeight: 700, color: 'var(--blue)' }}>{s.weight > 0 ? fmtNum(s.weight) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                            <td style={{ ...cell, textAlign: 'right', fontWeight: 800, color: 'var(--blue)', background: 'rgba(59,130,246,0.05)' }}>{s.amount > 0 ? '₹ ' + fmtINR(s.amount) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                            <td style={{ ...cell, textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)' }}>{adv > 0 ? '₹ ' + fmtINR(adv) : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                            <td style={{ ...cell, textAlign: 'right', fontWeight: 800, color: bal > 0 ? '#dc2626' : 'var(--green)', background: bal > 0 ? 'rgba(220,38,38,0.04)' : 'rgba(16,185,129,0.06)' }}>
                              {s.amount > 0 ? '₹ ' + fmtINR(bal) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: 'var(--bg-panel)', borderTop: '2px solid var(--blue)' }}>
                        <td colSpan={4} style={{ padding: '11px 8px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 12, borderRight: '1px solid var(--border)' }}>
                          TOTALS — {activeBuyers.length} buyers
                        </td>
                        <td style={{ padding: '11px 8px', textAlign: 'center', fontWeight: 800, color: 'var(--text-primary)', fontSize: 13, borderRight: '1px solid var(--border)' }}>
                          {totalBags}
                        </td>
                        <td style={{ padding: '11px 8px', textAlign: 'right', fontWeight: 800, color: 'var(--blue)', fontSize: 13, borderRight: '1px solid var(--border)' }}>
                          {fmtNum(totalWeight)} kg
                        </td>
                        <td style={{ padding: '11px 8px', textAlign: 'right', fontWeight: 800, color: 'var(--blue)', fontSize: 13, borderRight: '1px solid var(--border)', background: 'rgba(59,130,246,0.05)' }}>
                          ₹ {fmtINR(totalAmount)}
                        </td>
                        <td style={{ padding: '11px 8px', textAlign: 'right', fontWeight: 800, color: 'var(--text-secondary)', fontSize: 13, borderRight: '1px solid var(--border)' }}>
                          ₹ {fmtINR(totalAdvance)}
                        </td>
                        <td style={{ padding: '11px 8px', textAlign: 'right', fontWeight: 800, color: totalBalance > 0 ? '#dc2626' : 'var(--green)', fontSize: 14, borderRight: '1px solid var(--border)', background: totalBalance > 0 ? 'rgba(220,38,38,0.04)' : 'rgba(16,185,129,0.06)' }}>
                          ₹ {fmtINR(totalBalance)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
