import React, { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart2, RefreshCw, Printer, Download,
  TrendingUp, Package, Users, IndianRupee,
  ChevronDown, ChevronUp, Calendar, Filter
} from 'lucide-react';
import axios from 'axios';
import { fmtINR, todayISO } from '../utils';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

// const fmt2 = (v) =>
//   Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// const fmtN = (v) =>
//   Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const fmt2 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
const fmtN = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');

// ── Date helpers ──────────────────────────────────────────────────────────────
function getWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().slice(0, 10),
    to:   sunday.toISOString().slice(0, 10),
  };
}

function getMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from, to };
}

function getYearRange() {
  const y = new Date().getFullYear();
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

function getLastNDays(n) {
  const to   = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (n - 1));
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  };
}

const COMMISSION_RATE = 0.08; // 8%

// ── Fetch all sellers in a date range, group by date ────────────────────────
async function fetchSalesData(from, to) {
  let sellers = [];

  if (from && to && from === to) {
    // Single day — use the `date` param the server understands
    const res = await API.get('/api/sellers', { params: { date: from } });
    sellers = res.data.data || [];
  } else {
    // Range — fetch all and filter client-side (server may not support from/to)
    const res = await API.get('/api/sellers', { params: {} });
    const all = res.data.data || [];
    sellers = all.filter(s => {
      const d = (s.entry_date || '').slice(0, 10);
      if (from && d < from) return false;
      if (to   && d > to)   return false;
      return true;
    });
  }

  // Group sellers by entry_date
  const byDate = {};
  sellers.forEach(s => {
    const date = (s.entry_date || '').slice(0, 10);
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(s);
  });

  // Build one row per date
  const rows = Object.entries(byDate)
    .sort(([a], [b]) => b.localeCompare(a)) // newest first
    .map(([date, list]) => {
      const serialNumbers = [...new Set(list.map(s => s.serial_number).filter(Boolean))];
      const numSerials    = serialNumbers.length;
      const numBags       = list.reduce((s, r) => s + (parseInt(r.num_bags) || 0), 0);
      const totalWeight   = list.reduce((s, r) => s + (Number(r.weight)  || 0), 0);
      const totalAdvance  = list.reduce((s, r) => s + (Number(r.advance_amount) || 0), 0);

      // Auction amount = sum of all bag amounts
      let auctionAmount = 0;
      list.forEach(s => {
        try {
          const bags = JSON.parse(s.bag_data || '[]');
          bags.forEach(b => { auctionAmount += Number(b.amount) || 0; });
        } catch {}
        // also count top-level amount if bag_data empty
        if (!s.bag_data || s.bag_data === '[]') {
          auctionAmount += Number(s.amount) || 0;
        }
      });

      // const commission   = auctionAmount * COMMISSION_RATE;
      // const totalPayable = auctionAmount - commission; // amount payable to sellers after commission
      // const balance      = totalPayable - totalAdvance;

      const commission   = Math.round(auctionAmount * COMMISSION_RATE);
      const totalPayable = Math.round(auctionAmount - commission);
      const balance      = Math.round(totalPayable - totalAdvance);

      return {
        date,
        numSerials,
        serialList: serialNumbers.sort((a, b) => {
          const na = parseInt(a) || 0;
          const nb = parseInt(b) || 0;
          return na - nb;
        }).join(', '),
        numBags,
        totalWeight,
        totalAdvance,
        auctionAmount,
        commission,
        totalPayable,
        balance,
        sellers: list,
      };
    });

  return rows;
}

// ── Compact number formatter for stat cards ──────────────────────────────────
function compactINR(v) {
  const n = Number(v || 0);
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)     return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

// ── Summary card ────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  const colors = {
    amber:  { bg: 'var(--accent-dim)',          icon: 'var(--accent)',  border: 'rgba(245,158,11,0.25)' },
    green:  { bg: 'var(--green-dim)',            icon: 'var(--green)',   border: 'rgba(16,185,129,0.25)' },
    blue:   { bg: 'var(--blue-dim)',             icon: 'var(--blue)',    border: 'rgba(59,130,246,0.25)'  },
    purple: { bg: 'rgba(139,92,246,0.12)',       icon: 'var(--purple)',  border: 'rgba(139,92,246,0.25)' },
    red:    { bg: 'rgba(239,68,68,0.1)',         icon: 'var(--red)',     border: 'rgba(239,68,68,0.25)'   },
  };
  const c = colors[color] || colors.amber;
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`, borderRadius: 12,
      padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6,
      minWidth: 0, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: c.icon, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </div>
    </div>
  );
}

// ── Expandable row detail ────────────────────────────────────────────────────
function RowDetail({ row }) {
  return (
    <tr>
      <td colSpan={8} style={{ padding: 0, border: 'none' }}>
        <div style={{
          background: 'var(--bg-panel)', borderLeft: '3px solid var(--accent)',
          margin: '0 0 2px 0', padding: '14px 20px',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
            Sellers on {new Date(row.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)' }}>
                  {['Serial', 'Name', 'Material', 'Bags', 'Weight (kg)', 'Advance (₹)', 'Auction Amt (₹)', 'Commission 8%'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {row.sellers.map((s, i) => {
                  let auctAmt = 0;
                  try {
                    const bags = JSON.parse(s.bag_data || '[]');
                    bags.forEach(b => { auctAmt += Number(b.amount) || 0; });
                    if (bags.length === 0) auctAmt = Number(s.amount) || 0;
                  } catch { auctAmt = Number(s.amount) || 0; }

                  // const comm    = auctAmt * COMMISSION_RATE;
                  const comm    = Math.round(auctAmt * COMMISSION_RATE);
                  return (
                    <tr key={s.id || i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-card)' }}>
                      <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--accent)' }}>{s.serial_number}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{s.material || '—'}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{s.num_bags}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtN(s.weight)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--blue)', fontFamily: 'monospace' }}>₹{fmt2(s.advance_amount)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--green)', fontWeight: 700 }}>
                        {auctAmt > 0 ? `₹${fmt2(auctAmt)}` : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending</span>}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--red)' }}>
                        {auctAmt > 0 ? `₹${fmt2(comm)}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function SalesReport() {
  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [preset,      setPreset]      = useState('week');
  const [customFrom,  setCustomFrom]  = useState('');
  const [customTo,    setCustomTo]    = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortField,   setSortField]   = useState('date');
  const [sortDir,     setSortDir]     = useState('desc');
  const printRef = useRef();

  // Compute date range from preset
  const getRange = useCallback(() => {
    if (preset === 'today')   return { from: todayISO(), to: todayISO() };
    if (preset === 'week')    return getWeekRange();
    if (preset === 'month')   return getMonthRange();
    if (preset === 'year')    return getYearRange();
    if (preset === '30days')  return getLastNDays(30);
    if (preset === 'custom')  return { from: customFrom, to: customTo };
    return { from: '', to: '' };
  }, [preset, customFrom, customTo]);

  const load = useCallback(async () => {
    setLoading(true);
    setExpandedRow(null);
    try {
      const { from, to } = getRange();
      const data = await fetchSalesData(from, to);
      setRows(data);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to load sales report');
    } finally {
      setLoading(false);
    }
  }, [getRange]);

  useEffect(() => { load(); }, [load]);

  // Totals
  const totals = rows.reduce((acc, r) => ({
    numSerials:    acc.numSerials    + r.numSerials,
    numBags:       acc.numBags       + r.numBags,
    totalWeight:   acc.totalWeight   + r.totalWeight,
    totalAdvance:  acc.totalAdvance  + r.totalAdvance,
    auctionAmount: acc.auctionAmount + r.auctionAmount,
    commission:    acc.commission    + r.commission,
    totalPayable:  acc.totalPayable  + r.totalPayable,
    balance:       acc.balance       + r.balance,
  }), { numSerials: 0, numBags: 0, totalWeight: 0, totalAdvance: 0, auctionAmount: 0, commission: 0, totalPayable: 0, balance: 0 });

  // Sorting
  const sorted = [...rows].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const thStyle = (field) => ({
    padding: '10px 14px', textAlign: field === 'date' || field === 'numSerials' || field === 'serialList' ? 'left' : 'right',
    fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
    color: sortField === field ? 'var(--accent)' : 'var(--text-muted)',
    cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
    borderBottom: '2px solid var(--border)', background: 'var(--bg-panel)',
  });

  // CSV Export
  const exportCSV = () => {
    const headers = ['Date', 'Sellers', 'Bags', 'Weight (kg)', 'Advance (₹)', 'Auction Amount (₹)', 'Profit Amount'];
    const csvRows = sorted.map(r => [
      r.date, r.numSerials, r.numBags,
      r.totalWeight.toFixed(2), r.totalAdvance.toFixed(2),
      r.auctionAmount.toFixed(2), r.commission.toFixed(2),
    ]);
    const { from, to } = getRange();
    const csv = [headers, ...csvRows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sales-report-${from || 'all'}-to-${to || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  // Print
  const handlePrint = () => {
    const { from, to } = getRange();
    const dateLabel = from
      ? `${new Date(from + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} – ${new Date(to + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
      : 'All Time';

    const tableHTML = `
      <table>
        <thead>
          <tr>
            <th>#</th><th>Date</th><th>Sellers</th><th>Bags</th>
            <th>Weight (kg)</th><th>Advance (₹)</th><th>Auction Amt (₹)</th>
            <th>Profit Amount</th>
          </tr>
        </thead>
        <tbody>
          ${sorted.map((r, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              <td style="text-align:center">${r.numSerials}</td>
              <td style="text-align:center">${r.numBags}</td>
              <td style="text-align:right">${fmtN(r.totalWeight)}</td>
              <td style="text-align:right">${fmt2(r.totalAdvance)}</td>
              <td style="text-align:right; font-weight:700">${r.auctionAmount > 0 ? fmt2(r.auctionAmount) : 'Pending'}</td>
              <td style="text-align:right; color:#ef4444">${r.auctionAmount > 0 ? fmt2(r.commission) : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr style="font-weight:800; background:#f9fafb;">
            <td colspan="3">TOTALS (${sorted.length} days)</td>
            <td style="text-align:center">${totals.numBags}</td>
            <td style="text-align:right">${fmtN(totals.totalWeight)}</td>
            <td style="text-align:right">${fmt2(totals.totalAdvance)}</td>
            <td style="text-align:right">${fmt2(totals.auctionAmount)}</td>
            <td style="text-align:right; color:#ef4444">${fmt2(totals.commission)}</td>
          </tr>
        </tfoot>
      </table>
    `;

    const w = window.open('', '_blank', 'width=1100,height=750');
    w.document.write(`<!DOCTYPE html><html><head><title>Sales Report — ${dateLabel}</title>
    <style>
      * { box-sizing:border-box; margin:0; padding:0; }
      body { font-family:Arial,sans-serif; padding:32px; color:#111; font-size:12px; }
      .hdr { text-align:center; border-bottom:2px solid #222; padding-bottom:14px; margin-bottom:18px; }
      .hdr h1 { font-size:20px; margin-bottom:4px; }
      .hdr p  { font-size:12px; color:#555; }
      table { width:100%; border-collapse:collapse; margin-bottom:16px; }
      th,td { border:1px solid #ddd; padding:8px 11px; text-align:left; }
      th { background:#f5f5f5; font-weight:700; font-size:10px; text-transform:uppercase; letter-spacing:1px; }
      tr:nth-child(even) td { background:#fafafa; }
      tfoot tr td { background:#fffbeb; font-weight:800; }
      .summary { display:flex; gap:16px; margin-bottom:20px; flex-wrap:wrap; }
      .summary-box { border:1px solid #ddd; border-radius:8px; padding:12px 16px; flex:1; min-width:150px; }
      .summary-box .lbl { font-size:10px; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:4px; }
      .summary-box .val { font-size:18px; font-weight:800; }
      @media print { @page { size:A4 landscape; margin:15mm; } }
    </style></head><body>
      <div class="hdr"><h1>📊 Sales Report</h1><p>Period: ${dateLabel} | Generated: ${new Date().toLocaleDateString('en-IN')}</p></div>
      <div class="summary">
        <div class="summary-box"><div class="lbl">Total Days</div><div class="val">${sorted.length}</div></div>
        <div class="summary-box"><div class="lbl">Total Sellers</div><div class="val">${totals.numSerials}</div></div>
        <div class="summary-box"><div class="lbl">Total Bags</div><div class="val">${totals.numBags}</div></div>
        <div class="summary-box"><div class="lbl">Total Weight</div><div class="val">${fmtN(totals.totalWeight)} kg</div></div>
        <div class="summary-box"><div class="lbl">Auction Amount</div><div class="val">₹${fmt2(totals.auctionAmount)}</div></div>
        // <div class="summary-box"><div class="lbl">Total Advance</div><div class="val">₹${fmt2(totals.totalAdvance)}</div></div>
        // <div class="summary-box"><div class="lbl">Commission (8%)</div><div class="val" style="color:#ef4444">₹${fmt2(totals.commission)}</div></div>
      </div>
      ${tableHTML}
    <script>window.onload=function(){window.print();}<\/script></body></html>`);
    w.document.close();
  };

  const presetLabel = { today: 'Today', week: 'This Week', month: 'This Month', year: 'This Year', '30days': 'Last 30 Days', custom: 'Custom Range' };

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="page-title">Sales Report</div>
          <div className="page-subtitle">Daily auction sales summary with commission & payable amounts</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handlePrint} disabled={loading || rows.length === 0}>
            <Printer size={15} /> Print
          </button>
          <button className="btn btn-secondary" onClick={exportCSV} disabled={loading || rows.length === 0}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={load} disabled={loading}>
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            <Filter size={14} /> Filter Period
          </div>

          {/* Preset buttons */}
          {Object.entries(presetLabel).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPreset(key)}
              style={{
                padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', border: '1.5px solid',
                borderColor: preset === key ? 'var(--accent)' : 'var(--border)',
                background:   preset === key ? 'var(--accent-dim)' : 'var(--bg-panel)',
                color:        preset === key ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}

          {/* Custom range pickers */}
          {preset === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="form-input" style={{ width: 160, fontSize: 13, padding: '6px 10px' }}
              />
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>to</span>
              <input
                type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="form-input" style={{ width: 160, fontSize: 13, padding: '6px 10px' }}
              />
              <button className="btn btn-primary" onClick={load} style={{ padding: '7px 16px', fontSize: 12 }}>
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Summary stat cards ── */}
      {!loading && rows.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 22 }}>
          <StatCard label="Total Days"     value={rows.length}                            icon={<Calendar size={13} />}     color="amber"  />
          <StatCard label="Total Sellers"  value={totals.numSerials}                      icon={<Users size={13} />}         color="blue"   />
          <StatCard label="Total Bags"     value={totals.numBags}                         icon={<Package size={13} />}       color="green"  />
          <StatCard label="Total Weight"   value={`${Math.round(totals.totalWeight)} kg`} icon={<TrendingUp size={13} />}    color="purple" />
          <StatCard label="Auction Amount" value={compactINR(totals.auctionAmount)}       icon={<IndianRupee size={13} />}   color="green"  />
          {/* <StatCard label="Total Advance"  value={compactINR(totals.totalAdvance)}        icon={<IndianRupee size={13} />}   color="blue"   />
          <StatCard label="Commission 8%"  value={compactINR(totals.commission)}          icon={<BarChart2 size={13} />}     color="red"    /> */}
        </div>
      )}

      {/* ── Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="card-title" style={{ margin: 0 }}>
            📅 Day-wise Sales Summary
            {!loading && <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>({rows.length} days)</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Click a row to expand seller details
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
            Loading report…
          </div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No sales data found</div>
            <div style={{ fontSize: 13 }}>Try a different date range or register sellers first.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }} ref={printRef}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {[
                    { label: '#',                 field: null           },
                    { label: 'Date',              field: 'date'         },
                    { label: 'Sellers',           field: 'numSerials'   },
                    { label: 'Bags',              field: 'numBags'      },
                    { label: 'Weight (kg)',        field: 'totalWeight'  },
                    { label: 'Advance (₹)',        field: 'totalAdvance' },
                    { label: 'Auction Amt (₹)',    field: 'auctionAmount'},
                    { label: 'Profit Amount (₹)', field: 'commission'   },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      style={thStyle(field)}
                      onClick={() => field && toggleSort(field)}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {label} <SortIcon field={field} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => {
                  const isExpanded = expandedRow === row.date;
                  const isPending  = row.auctionAmount === 0;
                  return (
                    <React.Fragment key={row.date}>
                      <tr
                        onClick={() => setExpandedRow(isExpanded ? null : row.date)}
                        style={{
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border)',
                          background: isExpanded ? 'var(--accent-dim)' : (i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-panel)'),
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = isExpanded ? 'var(--accent-dim)' : (i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-panel)'); }}
                      >
                        {/* # */}
                        <td style={{ padding: '12px 14px', color: 'var(--text-muted)', width: 40 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        </td>

                        {/* Date */}
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          <div>{new Date(row.date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                            {new Date(row.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long' })}
                          </div>
                        </td>

                        {/* Sellers count */}
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--accent)' }}>
                            {row.numSerials}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            seller{row.numSerials !== 1 ? 's' : ''}
                          </div>
                        </td>

                        {/* Bags */}
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>{row.numBags}</td>

                        {/* Weight */}
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace' }}>{fmtN(row.totalWeight)}</td>

                        {/* Advance */}
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--blue)' }}>
                          ₹{fmt2(row.totalAdvance)}
                        </td>

                        {/* Auction Amount */}
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: isPending ? 'var(--text-muted)' : 'var(--green)' }}>
                          {isPending
                            ? <span style={{ fontSize: 11, fontStyle: 'italic' }}>Pending</span>
                            : `₹${fmt2(row.auctionAmount)}`}
                        </td>

                        {/* Commission */}
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--red)' }}>
                          {isPending ? '—' : `₹${fmt2(row.commission)}`}
                        </td>
                      </tr>

                      {/* Expanded detail */}
                      {isExpanded && <RowDetail row={row} />}
                    </React.Fragment>
                  );
                })}
              </tbody>

              <tfoot>
                <tr style={{ background: 'var(--accent-dim)', borderTop: '2px solid var(--accent)' }}>
                  <td colSpan={3} style={{ padding: '12px 14px', fontWeight: 800, fontSize: 13, color: 'var(--accent)' }}>
                    GRAND TOTAL — {sorted.length} day{sorted.length !== 1 ? 's' : ''}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800 }}>{totals.numBags}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, fontFamily: 'monospace' }}>{Math.round(totals.totalWeight).toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: 'var(--blue)' }}>₹{fmt2(totals.totalAdvance)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: 'var(--green)' }}>₹{fmt2(totals.auctionAmount)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, fontFamily: 'monospace', color: 'var(--red)' }}>₹{fmt2(totals.commission)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      {!loading && rows.length > 0 && (
        <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: 20 }}>
          <span>📌 <strong>Auction Amount</strong> = Sum of all bag sale amounts for the day</span>
          <span>📌 <strong>Commission 8%</strong> = 8% deducted from Auction Amount</span>
          <span>📌 <em>Pending</em> = Rates not yet entered in Seller List</span>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
