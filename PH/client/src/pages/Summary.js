// import React, { useState, useEffect, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import { RefreshCw, TrendingUp, Users, ShoppingCart, Package, Download, Printer } from 'lucide-react';
// import axios from 'axios';
// import { fmtINR, fmtNum, todayISO } from '../utils';

// const API = axios.create({ baseURL: '' });

// const MATERIAL_COLORS = {
//   TAMARIND: { bg: 'var(--accent-dim)',    color: 'var(--accent)',  bar: '#f59e0b' },
//   GINGER:    { bg: 'var(--green-dim)',     color: 'var(--green)',   bar: '#10b981' },
//   ONION:    { bg: 'var(--blue-dim)',      color: 'var(--blue)',    bar: '#3b82f6' },
//   LEMONS:   { bg: 'rgba(139,92,246,0.15)', color: 'var(--purple)', bar: '#8b5cf6' },
// };
// const DEFAULT_COLOR = { bg: 'var(--accent-dim)', color: 'var(--accent)', bar: '#f59e0b' };

// const fmt2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// const fmtN = (v) => Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

// export default function Summary() {
//   const [data,       setData]       = useState(null);
//   const [sellers,    setSellers]    = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [filterDate, setFilterDate] = useState(todayISO());
//   const [showTable,  setShowTable]  = useState(true);

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = filterDate ? { date: filterDate } : {};
//       const [sumRes, selRes] = await Promise.all([
//         API.get('/api/summary', { params }),
//         API.get('/api/sellers',  { params }),
//       ]);
//       setData(sumRes.data.data);

//       // ✅ Sort ascending by serial_number numerically
//       const raw = selRes.data.data || [];
//       raw.sort((a, b) => {
//         const na = parseInt(a.serial_number) || 0;
//         const nb = parseInt(b.serial_number) || 0;
//         return na - nb;
//       });
//       setSellers(raw);
//     } catch (err) {
//       toast.error(err.message || 'Failed to load summary');
//     } finally {
//       setLoading(false);
//     }
//   }, [filterDate]);

//   useEffect(() => { load(); }, [load]);

//   const ss = data?.sellerStats  || {};
//   const bs = data?.buyerStats   || {};
//   const mb = data?.materialBreakdown || [];
//   const maxBags = mb.length ? Math.max(...mb.map(m => Number(m.bags) || 0), 1) : 1;
//   const sellerBalance = (Number(ss.total_amount) || 0) - (Number(ss.total_advance) || 0);
//   const buyerBalance  = (Number(bs.total_amount) || 0) - (Number(bs.total_advance) || 0);

//   // Build flat rows — one row per bag
//   const tableRows = [];
//   sellers.forEach((s, si) => {
//     let bags = [];
//     try { bags = JSON.parse(s.bag_data || '[]'); } catch {}
//     const numBags = parseInt(s.num_bags) || 0;

//     if (bags.length === 0) {
//       tableRows.push({
//         srno: si + 1, lot: s.lot_number || '—', name: s.name,
//         material: s.material && s.material !== 'GENERAL' ? s.material : '—',
//         bags: numBags, weight: s.weight, rate: s.rate_fixed || 0,
//         amount: s.amount || 0, buyer: '—',
//         isFirstBag: true, isLastBag: true, bagIdx: null,
//       });
//     } else {
//       bags.forEach((b, bi) => {
//         tableRows.push({
//           srno: si + 1,
//           lot: b.lot || s.lot_number || '—',
//           name: bi === 0 ? s.name : '',
//           material: bi === 0 ? (s.material && s.material !== 'GENERAL' ? s.material : '—') : '',
//           bags: bi === 0 ? numBags : '',
//           weight: Number(b.weight) || 0,
//           rate: Number(b.rate) || 0,
//           amount: Number(b.amount) || 0,
//           buyer: b.buyer || '—',
//           isFirstBag: bi === 0,
//           isLastBag: bi === bags.length - 1,
//           bagIdx: bi + 1,
//         });
//       });
//     }
//   });

//   const totalBags   = sellers.reduce((s, r) => s + (parseInt(r.num_bags) || 0), 0);
//   const totalWeight = sellers.reduce((s, r) => s + (Number(r.weight) || 0), 0);
//   const totalAmt    = sellers.reduce((s, r) => s + (Number(r.amount) || 0), 0);

//   // ✅ Export CSV
//   const exportCSV = () => {
//     const headers = ['Sr.No','Lot No','Name','Material','Bags','Weight(kg)','Rate(₹/100kg)','Amount(₹)','Buyer'];
//     const rows = tableRows.map(r => [r.srno, r.lot, r.name, r.material, r.bags, r.weight, r.rate, r.amount, r.buyer]);
//     const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url  = URL.createObjectURL(blob);
//     const a    = document.createElement('a');
//     a.href     = url;
//     a.download = `seller-summary-${filterDate || 'all'}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success('CSV exported!');
//   };

//   // ✅ Print full list — A4 landscape
//   const printTable = () => {
//     const dateLabel = filterDate
//       ? new Date(filterDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
//       : 'All Time';

//     // Build grouped print rows with rowspan
//     let rowsHtml = '';
//     const fmtNp = (v) => Number(v||0).toLocaleString('en-IN', {maximumFractionDigits:2});
//     const fmt2p = (v) => Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
//     sellers.forEach(function(seller, si) {
//       let bags = [];
//       try { bags = JSON.parse(seller.bag_data || '[]'); } catch(e) {}
//       const numBags = parseInt(seller.num_bags) || 0;
//       const mat = seller.material && seller.material !== 'GENERAL' ? seller.material : '—';
//       const rowBg = si % 2 === 0 ? '#ffffff' : '#f0f7ff';
//       const rc = bags.length > 0 ? bags.length : 1;
//       const P = 'padding:7px 8px;border:1px solid #b8cef0;';
//       const BR = '';

//       if (bags.length === 0) {
//         rowsHtml += '<tr style="background:' + rowBg + ';border-bottom:2px solid #93c5fd">' +
//           '<td style="' + P + 'font-weight:800;color:#d97706;text-align:center;font-size:11px;vertical-align:middle;' + BR + '">' + (si+1) + '</td>' +
//           '<td style="' + P + 'font-weight:700;font-size:11px;color:#1a1a1a;' + BR + '">' + seller.name + '</td>' +
//           '<td style="' + P + 'text-align:center;font-size:10px;color:#333;' + BR + '">' + mat + '</td>' +
//           '<td style="' + P + 'text-align:center;font-weight:700;font-size:11px;' + BR + '">' + numBags + '</td>' +
//           '<td style="' + P + 'font-family:monospace;font-weight:700;text-align:center;font-size:11px;color:#1e3a5f">' + (seller.lot_number||'—') + '</td>' +
//           '<td style="' + P + 'text-align:right;font-weight:700;font-size:11px;color:#1e40af">' + (seller.weight>0 ? fmtNp(seller.weight) : '—') + '</td>' +
//           '<td style="' + P + 'text-align:right;font-size:11px;color:#999">—</td>' +
//           '<td style="' + P + 'text-align:right;font-weight:800;font-size:11px;color:#1a56db">' + (seller.amount>0 ? '₹ '+fmt2p(seller.amount) : '—') + '</td>' +
//           '<td style="' + P + 'font-size:11px;color:#999">—</td></tr>';
//         return;
//       }

//       bags.forEach(function(bag, bi) {
//         const bdr = bi === bags.length-1 ? '2px solid #93c5fd' : '1px solid #e2e8f0';
//         const w = Number(bag.weight)||0;
//         const r = Number(bag.rate)||0;
//         const a = Number(bag.amount)||0;
//         const buyer = bag.buyer || '—';
//         rowsHtml += '<tr style="background:' + rowBg + ';border-bottom:' + bdr + '">';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'font-weight:800;color:#d97706;text-align:center;font-size:11px;vertical-align:middle;' + BR + '">' + (si+1) + '</td>';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'font-weight:700;font-size:11px;color:#1a1a1a;vertical-align:middle;' + '">' + seller.name + '</td>';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'text-align:center;font-size:10px;color:#333;vertical-align:middle;' + BR + '">' + mat + '</td>';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'text-align:center;font-weight:700;font-size:11px;vertical-align:middle;' + BR + '">' + numBags + '</td>';
//         rowsHtml += '<td style="' + P + 'font-family:monospace;font-weight:700;text-align:center;font-size:11px;color:#1e3a5f">' + (bag.lot||seller.lot_number||'—') + '</td>';
//         rowsHtml += '<td style="' + P + 'text-align:right;font-weight:700;font-size:11px;color:#1e40af">' + (w>0 ? fmtNp(w) : '—') + '</td>';
//         rowsHtml += '<td style="' + P + 'text-align:right;font-weight:700;font-size:11px;color:#166534">' + (r>0 ? fmtNp(r) : '—') + '</td>';
//         rowsHtml += '<td style="' + P + 'text-align:right;font-weight:800;font-size:11px;color:#1a56db">' + (a>0 ? '₹ '+fmt2p(a) : '—') + '</td>';
//         rowsHtml += '<td style="' + P + 'font-weight:' + (buyer!=='—'?700:400) + ';font-size:11px;color:' + (buyer!=='—'?'#7c3aed':'#999') + '">' + buyer + '</td></tr>';
//       });
//     });

//     const html = `<!DOCTYPE html>
// <html>
// <head>
//   <title>Seller Summary — ${filterDate || 'All'}</title>
//   <style>
//     @page { size: A4 landscape; margin: 6mm 8mm; }
//     * { box-sizing: border-box; margin: 0; padding: 0; }
//     body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }

//     /* Page border */
//     .page-wrap { border: 3px solid #1a56db; border-radius: 4px; padding: 10px 12px; position: relative; min-height: 97%; }
//     .page-wrap::after { content:''; position:absolute; top:4px; left:4px; right:4px; bottom:4px; border:1px solid #a0bbf0; border-radius:2px; pointer-events:none; }

//     /* Header */
//     .header { text-align:center; border-bottom:2.5px double #1a56db; padding-bottom:9px; margin-bottom:10px; }
//     .prop-row { display:flex; justify-content:space-between; align-items:center; font-size:9px; color:#444; margin-bottom:5px; }
//     .logo-circle { width:34px; height:34px; border-radius:50%; border:2.5px solid #1a56db; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:11px; color:#1a56db; background:#eff6ff; flex-shrink:0; }
//     .firm-name { font-size:20px; font-weight:900; color:#1a1a1a; line-height:1.1; margin:2px 0; }
//     .firm-badge { display:inline-block; background:#1a56db; color:#fff; font-size:8px; font-weight:700; letter-spacing:1.2px; padding:2px 12px; border-radius:2px; margin:2px 0 1px; }
//     .firm-type { font-size:10px; font-weight:700; color:#333; margin-top:1px; }
//     .firm-addr { font-size:9px; color:#666; margin-top:2px; }
//     .date-line { display:inline-block; background:#1a56db; color:#fff; font-size:10px; font-weight:700; padding:2px 16px; border-radius:2px; margin-top:6px; letter-spacing:0.5px; }

//     table { width:100%; border-collapse:collapse; }
//     thead th { background:#1a56db; color:#fff; padding:7px 8px; font-size:10px; font-weight:700; border:1px solid #1245b5; text-transform:uppercase; letter-spacing:0.5px; }
//     td { border:1px solid #b8cef0 !important; }
//     tfoot td { background:#dbeafe !important; font-weight:800; border-top:2px solid #1a56db !important; padding:8px; color:#1e40af; font-size:11px; }
//     .summary-box { margin-top:10px; border:1.5px solid #1a56db; border-radius:4px; padding:7px 14px; background:#f0f7ff; display:flex; gap:22px; align-items:center; }
//     .sum-item .sum-label { font-size:9px; color:#666; text-transform:uppercase; letter-spacing:0.5px; }
//     .sum-item .sum-val   { font-weight:900; color:#1a56db; font-size:13px; margin-top:1px; }
//     .foot-note { text-align:right; font-size:9px; color:#888; margin-top:5px; font-style:italic; }
//     @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
//   </style>
// </head>
// <body>
//   <div class="page-wrap">

//   <div class="header">
//     <div class="prop-row">
//       <span style="text-align:left">Prop. Praveen V. Heggani<br>Cell : 9611635183</span>
//       <div class="logo-circle">PH</div>
//       <span style="text-align:right">Prop. Pramod V. Heggani<br>Cell : 9448349836</span>
//     </div>
//     <div class="firm-name">Mr. Praveen Heggani</div>
//     <div><span class="firm-badge">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
//     <div class="firm-type">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
//     <div class="firm-addr">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
//     <div><span class="date-line">COMPLETE SUMMARY REPORT &nbsp;—&nbsp; ${dateLabel}</span></div>
//   </div>

//   <table>
//     <thead>
//       <tr>
//         <th style="width:44px;text-align:center">Sr.No</th>
//         <th style="width:120px">Name</th>
//         <th style="width:85px;text-align:center">Material</th>
//         <th style="width:46px;text-align:center">Bags</th>
//         <th style="width:68px;text-align:center">Lot No</th>
//         <th style="width:88px;text-align:right">Weight (kg)</th>
//         <th style="width:108px;text-align:right">Rate (₹/100kg)</th>
//         <th style="width:108px;text-align:right">Amount (₹)</th>
//         <th style="text-align:left">Buyer</th>
//       </tr>
//     </thead>
//     <tbody>${rowsHtml}</tbody>
//     <tfoot>
//       <tr>
//         <td colspan="4" style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:left">TOTALS · ${sellers.length} sellers</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:center">${totalBags}</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:right">${fmtN(totalWeight)} kg</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:right;font-size:9px;color:#666">Gross Amt.</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:right;color:#1a56db;font-size:14px">₹ ${fmt2(totalAmt)}</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe"></td>
//       </tr>
//     </tfoot>
//   </table>

//   <div class="summary-box">
//     <div class="sum-item"><div class="sum-label">Sellers</div><div class="sum-val">${sellers.length}</div></div>
//     <div class="sum-item"><div class="sum-label">Total Bags</div><div class="sum-val">${totalBags}</div></div>
//     <div class="sum-item"><div class="sum-label">Total Weight</div><div class="sum-val">${fmtN(totalWeight)} kg</div></div>
//     <div class="sum-item"><div class="sum-label">Gross Amount</div><div class="sum-val">₹ ${fmt2(totalAmt)}</div></div>
//     <div class="sum-item"><div class="sum-label">Advance Paid</div><div class="sum-val">₹ ${fmt2(ss.total_advance || 0)}</div></div>
//     <div class="sum-item"><div class="sum-label">Balance Due</div><div class="sum-val" style="color:#dc2626">₹ ${fmt2(sellerBalance)}</div></div>
//   </div>
//   <div class="foot-note">Printed: ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; (E.&amp;O.E.)</div>
//   <script>window.onload = function(){ window.print(); }<\/script>
// </body>
// </html>`;

//     const w = window.open('', '_blank', 'width=1100,height=750');
//     w.document.write(html);
//     w.document.close();
//   };

//   return (
//     <div>
//       {/* Header */}
//       <div className="page-header">
//         <div>
//           <div className="page-title">Summary Report</div>
//           <div className="page-subtitle">
//             {filterDate
//               ? `Market overview for ${new Date(filterDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`
//               : 'All-time market overview'}
//           </div>
//         </div>
//         <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
//           <input className="form-input" type="date" value={filterDate}
//             onChange={e => setFilterDate(e.target.value)}
//             style={{ textTransform:'none', width:170 }} />
//           <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate(todayISO())}>Today</button>
//           <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate('')}>All Time</button>
//           <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
//             <RefreshCw size={14}/> Refresh
//           </button>
//           {tableRows.length > 0 && (
//             <>
//               <button className="btn btn-green btn-sm" onClick={exportCSV}>
//                 <Download size={14}/> CSV
//               </button>
//               <button className="btn btn-primary btn-sm" onClick={printTable}>
//                 <Printer size={14}/> Print List
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div style={{ textAlign:'center', padding:80, color:'var(--text-muted)' }}>
//           <div style={{ fontSize:40, marginBottom:16 }}>📊</div>
//           <div>Loading summary...</div>
//         </div>
//       ) : (
//         <>
//           {/* Seller Stats */}
//           <div style={{ marginBottom:10, fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
//             <Users size={12}/> Seller Summary
//           </div>
//           <div className="stats-grid" style={{ marginBottom:24 }}>
//             {[
//               { label:'Total Sellers', value: ss.total_sellers||0,              color:'amber', icon:<Users size={20}/> },
//               { label:'Total Bags',    value: fmtNum(ss.total_bags, 0),          color:'green', icon:<Package size={20}/> },
//               { label:'Total Weight',  value: fmtNum(ss.total_weight)+' kg',     color:'blue',  icon:<TrendingUp size={20}/> },
//               { label:'Advance Paid',  value:'₹ '+fmtINR(ss.total_advance),     color:'purple',icon:'₹' },
//             ].map(s => (
//               <div key={s.label} className={`stat-card ${s.color}`}>
//                 <div className={`stat-icon ${s.color}`} style={s.color==='purple'?{background:'rgba(139,92,246,0.15)',color:'var(--purple)',fontWeight:800,fontSize:18}:{}}>{s.icon}</div>
//                 <div className="stat-value">{s.value}</div>
//                 <div className="stat-label">{s.label}</div>
//               </div>
//             ))}
//           </div>

//           {/* Buyer Stats */}
//           <div style={{ marginBottom:10, fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
//             <ShoppingCart size={12}/> Buyer Summary
//           </div>
//           <div className="stats-grid" style={{ marginBottom:24 }}>
//             {[
//               { label:'Total Buyers',  value: bs.total_buyers||0,               color:'amber', icon:<ShoppingCart size={20}/> },
//               { label:'Total Bags',    value: fmtNum(bs.total_bags, 0),          color:'green', icon:<Package size={20}/> },
//               { label:'Total Weight',  value: fmtNum(bs.total_weight)+' kg',     color:'blue',  icon:<TrendingUp size={20}/> },
//               { label:'Advance Recd.', value:'₹ '+fmtINR(bs.total_advance),     color:'purple',icon:'₹' },
//             ].map(s => (
//               <div key={s.label} className={`stat-card ${s.color}`}>
//                 <div className={`stat-icon ${s.color}`} style={s.color==='purple'?{background:'rgba(139,92,246,0.15)',color:'var(--purple)',fontWeight:800,fontSize:18}:{}}>{s.icon}</div>
//                 <div className="stat-value">{s.value}</div>
//                 <div className="stat-label">{s.label}</div>
//               </div>
//             ))}
//           </div>

//           {/* ── SELLER DETAIL TABLE ── */}
//           <div className="card" style={{ marginBottom:24, width:'100%' }}>
//             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
//               <div className="card-title" style={{ margin:0 }}>
//                 📋 Seller-wise Detail &nbsp;
//                 <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:400 }}>
//                   ({sellers.length} sellers · sorted by serial no.)
//                 </span>
//               </div>
//               <button onClick={() => setShowTable(t => !t)} className="btn btn-secondary btn-sm">
//                 {showTable ? 'Hide' : 'Show'} Table
//               </button>
//             </div>

//             {showTable && (
//               <div style={{ width:'100%', border:'1px solid var(--border)', borderRadius:10, overflow:'auto' }}>
//                 {sellers.length === 0 ? (
//                   <div className="empty-state" style={{ padding:40 }}>
//                     <div className="empty-state-icon">📋</div>
//                     <h3>No seller data for this period</h3>
//                   </div>
//                 ) : (
//                   <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, tableLayout:'fixed' }}>
//                     <colgroup>
//                       <col style={{ width:'46px' }}/>
//                       <col style={{ width:'130px' }}/>
//                       <col style={{ width:'105px' }}/>
//                       <col style={{ width:'54px' }}/>
//                       <col style={{ width:'72px' }}/>
//                       <col style={{ width:'100px' }}/>
//                       <col style={{ width:'115px' }}/>
//                       <col style={{ width:'120px' }}/>
//                       <col/>
//                     </colgroup>
//                     <thead>
//                       <tr style={{ background:'var(--bg-panel)' }}>
//                         {[
//                           { label:'Sr',            align:'center' },
//                           { label:'Name',          align:'left'   },
//                           { label:'Material',      align:'center' },
//                           { label:'Bags',          align:'center' },
//                           { label:'Lot No',        align:'center' },
//                           { label:'Weight (kg)',   align:'right'  },
//                           { label:'Rate (/100kg)', align:'right'  },
//                           { label:'Amount (₹)',    align:'right'  },
//                           { label:'Buyer',         align:'left'   },
//                         ].map(h => (
//                           <th key={h.label} style={{
//                             padding:'10px 10px', textAlign:h.align,
//                             fontSize:10, fontWeight:700, letterSpacing:0.8, textTransform:'uppercase',
//                             color:'var(--text-muted)',
//                             borderBottom:'2px solid var(--accent)',
//                             borderRight:'1px solid var(--border)',
//                           }}>{h.label}</th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {sellers.map((seller, si) => {
//                         let bags = [];
//                         try { bags = JSON.parse(seller.bag_data || '[]'); } catch {}
//                         const numBags = parseInt(seller.num_bags) || 0;
//                         const mat = seller.material && seller.material !== 'GENERAL' ? seller.material : '—';
//                         const rc = bags.length > 0 ? bags.length : 1;
//                         const rowBg = si % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-panel)';
//                         const cell = { borderRight:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'9px 10px', verticalAlign:'middle' };
//                         const merged = { ...cell, background:rowBg, borderBottom:'2px solid var(--accent)' };
//                         const badge = mat==='TAMARIND'?'badge-amber':mat==='GINGER'?'badge-green':mat==='ONION'?'badge-blue':mat==='LEMONS'?'badge-purple':'badge-amber';

//                         if (bags.length === 0) {
//                           const lb = '2px solid var(--accent)';
//                           return (
//                             <tr key={seller.id} style={{ background:rowBg }}>
//                               <td style={{ ...cell, fontWeight:800, color:'var(--accent)', textAlign:'center', fontSize:14, borderBottom:lb }}>{si+1}</td>
//                               <td style={{ ...cell, fontWeight:700, color:'var(--text-primary)', borderBottom:lb }}>{seller.name}</td>
//                               <td style={{ ...cell, textAlign:'center', borderBottom:lb }}>{mat!=='—'?<span className={'badge '+badge}>{mat}</span>:<span style={{color:'var(--text-muted)'}}>—</span>}</td>
//                               <td style={{ ...cell, textAlign:'center', fontWeight:700, borderBottom:lb }}>{numBags}</td>
//                               <td style={{ ...cell, fontFamily:'monospace', fontWeight:700, color:'var(--text-primary)', textAlign:'center', borderBottom:lb }}>{seller.lot_number||'—'}</td>
//                               <td style={{ ...cell, textAlign:'right', fontWeight:700, color:'var(--blue)', borderBottom:lb }}>{seller.weight>0?fmtNum(seller.weight):'—'}</td>
//                               <td style={{ ...cell, textAlign:'right', color:'var(--text-muted)', borderBottom:lb }}>—</td>
//                               <td style={{ ...cell, textAlign:'right', fontWeight:800, color:'var(--accent)', borderBottom:lb }}>{seller.amount>0?'₹ '+fmtINR(seller.amount):'—'}</td>
//                               <td style={{ ...cell, color:'var(--text-muted)', borderBottom:lb }}>—</td>
//                             </tr>
//                           );
//                         }

//                         return bags.map((bag, bi) => {
//                           const isLast = bi === bags.length - 1;
//                           const bdr = isLast ? '2px solid var(--accent)' : '1px solid var(--border)';
//                           const td = { ...cell, borderBottom: bdr };
//                           return (
//                             <tr key={seller.id+'-'+bi} style={{ background:rowBg }}>
//                               {/* Sr — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, fontWeight:800, color:'var(--accent)', textAlign:'center', fontSize:14 }}>{si+1}</td>}
//                               {/* Name — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, fontWeight:700, color:'var(--text-primary)' }}>{seller.name}</td>}
//                               {/* Material — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'center' }}>{mat!=='—'?<span className={'badge '+badge}>{mat}</span>:<span style={{color:'var(--text-muted)'}}>—</span>}</td>}
//                               {/* Bags — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'center', fontWeight:800, fontSize:14, color:'var(--text-primary)' }}>{numBags}</td>}
//                               {/* Lot No — per row */}
//                               <td style={{ ...td, fontFamily:'monospace', fontWeight:700, color:'var(--blue)', textAlign:'center', fontSize:12 }}>{bag.lot||seller.lot_number||'—'}</td>
//                               {/* Weight */}
//                               <td style={{ ...td, textAlign:'right', fontWeight:700, color:Number(bag.weight)>0?'var(--blue)':'var(--text-muted)' }}>{Number(bag.weight)>0?fmtNum(bag.weight):'—'}</td>
//                               {/* Rate */}
//                               <td style={{ ...td, textAlign:'right', fontWeight:700, color:Number(bag.rate)>0?'var(--green)':'var(--text-muted)' }}>{Number(bag.rate)>0?fmtNum(bag.rate):'—'}</td>
//                               {/* Amount */}
//                               <td style={{ ...td, textAlign:'right', fontWeight:800, color:Number(bag.amount)>0?'var(--accent)':'var(--text-muted)' }}>{Number(bag.amount)>0?'₹ '+fmtINR(bag.amount):'—'}</td>
//                               {/* Buyer */}
//                               <td style={{ ...td, fontWeight:bag.buyer&&bag.buyer!=='—'?700:400, color:bag.buyer&&bag.buyer!=='—'?'#a78bfa':'var(--text-muted)', fontSize:12 }}>{bag.buyer||'—'}</td>
//                             </tr>
//                           );
//                         });
//                       })}
//                     </tbody>
//                     <tfoot>
//                       <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--accent)' }}>
//                         <td colSpan={4} style={{ padding:'11px 10px', fontWeight:700, color:'var(--text-secondary)', fontSize:12, borderRight:'1px solid var(--border)' }}>
//                           TOTALS — {sellers.length} sellers
//                         </td>
//                         <td style={{ borderRight:'1px solid var(--border)' }}/>
//                         <td style={{ padding:'11px 10px', textAlign:'right', fontWeight:800, color:'var(--blue)', fontSize:13, borderRight:'1px solid var(--border)' }}>
//                           {fmtNum(totalWeight)} kg
//                         </td>
//                         <td style={{ borderRight:'1px solid var(--border)' }}/>
//                         <td style={{ padding:'11px 10px', textAlign:'right', fontWeight:800, color:'var(--accent)', fontSize:13, borderRight:'1px solid var(--border)' }}>
//                           ₹ {fmtINR(totalAmt)}
//                         </td>
//                         <td/>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Material Breakdown + Financial */}
//           <div className="two-col">
//             <div className="card">
//               <div className="card-title"><Package size={16} style={{ color:'var(--accent)' }}/> Material Breakdown (Sellers)</div>
//               {mb.length > 0 ? (
//                 <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
//                   {mb.map(m => {
//                     const mc  = MATERIAL_COLORS[m.material] || DEFAULT_COLOR;
//                     const pct = maxBags > 0 ? ((Number(m.bags)||0) / maxBags) * 100 : 0;
//                     return (
//                       <div key={m.material}>
//                         <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6, fontSize:13 }}>
//                           <span style={{ fontWeight:700, color:mc.color, background:mc.bg, padding:'2px 12px', borderRadius:20, border:`1px solid ${mc.bar}44` }}>{m.material}</span>
//                           <span style={{ color:'var(--text-secondary)', fontSize:12 }}>{m.count} sellers · {m.bags} bags · {fmtNum(m.weight)} kg</span>
//                         </div>
//                         <div style={{ background:'var(--bg-panel)', borderRadius:4, height:8, overflow:'hidden' }}>
//                           <div style={{ height:'100%', width:`${pct}%`, background:mc.bar, borderRadius:4, transition:'width 0.5s ease', minWidth:pct>0?6:0 }}/>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div className="empty-state" style={{ padding:32 }}>
//                   <div className="empty-state-icon">📊</div>
//                   <h3>No data for this period</h3>
//                 </div>
//               )}
//             </div>

//             <div className="card">
//               <div className="card-title"><TrendingUp size={16} style={{ color:'var(--green)' }}/> Financial Summary</div>

//               <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>👨‍🌾 Seller Financials</div>
//               <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
//                 {[
//                   { label:'Gross Amount', value:'₹ '+fmtINR(ss.total_amount),  color:'var(--accent)' },
//                   { label:'Advance Paid', value:'₹ '+fmtINR(ss.total_advance), color:'var(--text-secondary)' },
//                   { label:'Balance Due',  value:'₹ '+fmtINR(sellerBalance),    color: sellerBalance>0?'var(--red)':'var(--green)' },
//                 ].map(row => (
//                   <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg-panel)', borderRadius:8, border:'1px solid var(--border)' }}>
//                     <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{row.label}</span>
//                     <span style={{ fontSize:14, fontWeight:800, fontFamily:'var(--font-display)', color:row.color }}>{row.value}</span>
//                   </div>
//                 ))}
//               </div>

//               <div style={{ borderTop:'1px dashed var(--border)', marginBottom:16 }}/>

//               <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>🛒 Buyer Financials</div>
//               <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
//                 {[
//                   { label:'Gross Amount',     value:'₹ '+fmtINR(bs.total_amount),  color:'var(--blue)' },
//                   { label:'Advance Received', value:'₹ '+fmtINR(bs.total_advance), color:'var(--text-secondary)' },
//                   { label:'Balance Payable',  value:'₹ '+fmtINR(buyerBalance),      color: buyerBalance>0?'var(--red)':'var(--green)' },
//                 ].map(row => (
//                   <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg-panel)', borderRadius:8, border:'1px solid var(--border)' }}>
//                     <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{row.label}</span>
//                     <span style={{ fontSize:14, fontWeight:800, fontFamily:'var(--font-display)', color:row.color }}>{row.value}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


// -------------------------------------------------------------------------------------------------------------




// import React, { useState, useEffect, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import { RefreshCw, TrendingUp, Users, ShoppingCart, Package, Download, Printer } from 'lucide-react';
// import axios from 'axios';
// import { fmtINR, fmtNum, todayISO } from '../utils';

// // const API = axios.create({ baseURL: '' });
// const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

// const MATERIAL_COLORS = {
//   TAMARIND: { bg: 'var(--accent-dim)',    color: 'var(--accent)',  bar: '#f59e0b' },
//   GINGER:    { bg: 'var(--green-dim)',     color: 'var(--green)',   bar: '#10b981' },
//   ONION:    { bg: 'var(--blue-dim)',      color: 'var(--blue)',    bar: '#3b82f6' },
//   LEMONS:   { bg: 'rgba(139,92,246,0.15)', color: 'var(--purple)', bar: '#8b5cf6' },
// };
// const DEFAULT_COLOR = { bg: 'var(--accent-dim)', color: 'var(--accent)', bar: '#f59e0b' };

// const fmt2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// const fmtN = (v) => Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

// export default function Summary() {
//   const [data,       setData]       = useState(null);
//   const [sellers,    setSellers]    = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [filterDate, setFilterDate] = useState(todayISO());
//   const [showTable,  setShowTable]  = useState(true);

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = filterDate ? { date: filterDate } : {};
//       const [sumRes, selRes] = await Promise.all([
//         API.get('/api/summary', { params }),
//         API.get('/api/sellers',  { params }),
//       ]);
//       setData(sumRes.data.data);

//       // ✅ Sort ascending by serial_number numerically
//       const raw = selRes.data.data || [];
//       raw.sort((a, b) => {
//         const na = parseInt(a.serial_number) || 0;
//         const nb = parseInt(b.serial_number) || 0;
//         return na - nb;
//       });
//       setSellers(raw);
//     } catch (err) {
//       toast.error(err.message || 'Failed to load summary');
//     } finally {
//       setLoading(false);
//     }
//   }, [filterDate]);

//   useEffect(() => { load(); }, [load]);

//   const ss = data?.sellerStats  || {};
//   const bs = data?.buyerStats   || {};
//   const mb = data?.materialBreakdown || [];
//   const maxBags = mb.length ? Math.max(...mb.map(m => Number(m.bags) || 0), 1) : 1;
//   const sellerBalance = (Number(ss.total_amount) || 0) - (Number(ss.total_advance) || 0);
//   const buyerBalance  = (Number(bs.total_amount) || 0) - (Number(bs.total_advance) || 0);

//   // Build flat rows — one row per bag
//   const tableRows = [];
//   sellers.forEach((s, si) => {
//     let bags = [];
//     try { bags = JSON.parse(s.bag_data || '[]'); } catch {}
//     const numBags = parseInt(s.num_bags) || 0;

//     if (bags.length === 0) {
//       tableRows.push({
//         srno: si + 1, lot: s.lot_number || '—', name: s.name,
//         material: s.material && s.material !== 'GENERAL' ? s.material : '—',
//         bags: numBags, weight: s.weight, rate: s.rate_fixed || 0,
//         amount: s.amount || 0, buyer: '—',
//         isFirstBag: true, isLastBag: true, bagIdx: null,
//       });
//     } else {
//       bags.forEach((b, bi) => {
//         tableRows.push({
//           srno: si + 1,
//           lot: b.lot || s.lot_number || '—',
//           name: bi === 0 ? s.name : '',
//           material: bi === 0 ? (s.material && s.material !== 'GENERAL' ? s.material : '—') : '',
//           bags: bi === 0 ? numBags : '',
//           weight: Number(b.weight) || 0,
//           rate: Number(b.rate) || 0,
//           amount: Number(b.amount) || 0,
//           buyer: b.buyer || '—',
//           isFirstBag: bi === 0,
//           isLastBag: bi === bags.length - 1,
//           bagIdx: bi + 1,
//         });
//       });
//     }
//   });

//   const totalBags   = sellers.reduce((s, r) => s + (parseInt(r.num_bags) || 0), 0);
//   const totalWeight = sellers.reduce((s, r) => s + (Number(r.weight) || 0), 0);
//   const totalAmt    = sellers.reduce((s, r) => s + (Number(r.amount) || 0), 0);

//   // ✅ Export CSV
//   const exportCSV = () => {
//     const headers = ['Sr.No','Lot No','Name','Material','Bags','Weight(kg)','Rate(₹/100kg)','Amount(₹)','Buyer'];
//     const rows = tableRows.map(r => [r.srno, r.lot, r.name, r.material, r.bags, r.weight, r.rate, r.amount, r.buyer]);
//     const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url  = URL.createObjectURL(blob);
//     const a    = document.createElement('a');
//     a.href     = url;
//     a.download = `seller-summary-${filterDate || 'all'}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success('CSV exported!');
//   };

//   // ✅ Print full list — A4 landscape
//   const printTable = () => {

//     // Smart print: uses Electron IPC if running as desktop app, else window.open
//     const printHtml = (html) => {
//       if (window.electronAPI && window.electronAPI.printHTML) {
//         // Electron desktop app — use IPC to open native print dialog
//         window.electronAPI.printHTML(html);
//       } else {
//         // Browser — use window.open as usual
//         const w = window.open('', '_blank', 'width=900,height=750');
//         if (w && w.document) {
//           w.document.write(html);
//           w.document.close();
//         }
//       }
//     };

//     const dateLabel = filterDate
//       ? new Date(filterDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
//       : 'All Time';

//     // Build grouped print rows with rowspan
//     let rowsHtml = '';
//     const fmtNp = (v) => Number(v||0).toLocaleString('en-IN', {maximumFractionDigits:2});
//     const fmt2p = (v) => Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
//     sellers.forEach(function(seller, si) {
//       let bags = [];
//       try { bags = JSON.parse(seller.bag_data || '[]'); } catch(e) {}
//       const numBags = parseInt(seller.num_bags) || 0;
//       const mat = seller.material && seller.material !== 'GENERAL' ? seller.material : '—';
//       const rowBg = si % 2 === 0 ? '#ffffff' : '#f0f7ff';
//       const rc = bags.length > 0 ? bags.length : 1;
//       const P = 'padding:7px 8px;border:1px solid #b8cef0;';
//       const BR = '';

//       if (bags.length === 0) {
//         rowsHtml += '<tr style="background:' + rowBg + ';border-bottom:2px solid #93c5fd">' +
//           '<td style="' + P + 'font-weight:800;color:#d97706;text-align:center;font-size:11px;vertical-align:middle;' + BR + '">' + (si+1) + '</td>' +
//           '<td style="' + P + 'font-weight:700;font-size:11px;color:#1a1a1a;' + BR + '">' + seller.name + '</td>' +
//           '<td style="' + P + 'text-align:center;font-size:10px;color:#333;' + BR + '">' + mat + '</td>' +
//           '<td style="' + P + 'text-align:center;font-weight:700;font-size:11px;' + BR + '">' + numBags + '</td>' +
//           '<td style="' + P + 'font-family:monospace;font-weight:700;text-align:center;font-size:11px;color:#1e3a5f">' + (seller.lot_number||'—') + '</td>' +
//           '<td style="' + P + 'text-align:right;font-weight:700;font-size:11px;color:#1e40af">' + (seller.weight>0 ? fmtNp(seller.weight) : '—') + '</td>' +
//           '<td style="' + P + 'text-align:right;font-size:11px;color:#999">—</td>' +
//           '<td style="' + P + 'text-align:right;font-weight:800;font-size:11px;color:#1a56db">' + (seller.amount>0 ? '₹ '+fmt2p(seller.amount) : '—') + '</td>' +
//           '<td style="' + P + 'font-size:11px;color:#999">—</td></tr>';
//         return;
//       }

//       bags.forEach(function(bag, bi) {
//         const bdr = bi === bags.length-1 ? '2px solid #93c5fd' : '1px solid #e2e8f0';
//         const w = Number(bag.weight)||0;
//         const r = Number(bag.rate)||0;
//         const a = Number(bag.amount)||0;
//         const buyer = bag.buyer || '—';
//         rowsHtml += '<tr style="background:' + rowBg + ';border-bottom:' + bdr + '">';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'font-weight:800;color:#d97706;text-align:center;font-size:11px;vertical-align:middle;' + BR + '">' + (si+1) + '</td>';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'font-weight:700;font-size:11px;color:#1a1a1a;vertical-align:middle;' + '">' + seller.name + '</td>';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'text-align:center;font-size:10px;color:#333;vertical-align:middle;' + BR + '">' + mat + '</td>';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'text-align:center;font-weight:700;font-size:11px;vertical-align:middle;' + BR + '">' + numBags + '</td>';
//         rowsHtml += '<td style="' + P + 'font-family:monospace;font-weight:700;text-align:center;font-size:11px;color:#1e3a5f">' + (bag.lot||seller.lot_number||'—') + '</td>';
//         rowsHtml += '<td style="' + P + 'text-align:right;font-weight:700;font-size:11px;color:#1e40af">' + (w>0 ? fmtNp(w) : '—') + '</td>';
//         rowsHtml += '<td style="' + P + 'text-align:right;font-weight:700;font-size:11px;color:#166534">' + (r>0 ? fmtNp(r) : '—') + '</td>';
//         rowsHtml += '<td style="' + P + 'text-align:right;font-weight:800;font-size:11px;color:#1a56db">' + (a>0 ? '₹ '+fmt2p(a) : '—') + '</td>';
//         rowsHtml += '<td style="' + P + 'font-weight:' + (buyer!=='—'?700:400) + ';font-size:11px;color:' + (buyer!=='—'?'#7c3aed':'#999') + '">' + buyer + '</td></tr>';
//       });
//     });

//     const html = `<!DOCTYPE html>
// <html>
// <head>
//   <title>Seller Summary — ${filterDate || 'All'}</title>
//   <style>
//     @page { size: A4 landscape; margin: 6mm 8mm; }
//     * { box-sizing: border-box; margin: 0; padding: 0; }
//     body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }

//     /* Page border */
//     .page-wrap { border: 3px solid #1a56db; border-radius: 4px; padding: 10px 12px; position: relative; min-height: 97%; }
//     .page-wrap::after { content:''; position:absolute; top:4px; left:4px; right:4px; bottom:4px; border:1px solid #a0bbf0; border-radius:2px; pointer-events:none; }

//     /* Header */
//     .header { text-align:center; border-bottom:2.5px double #1a56db; padding-bottom:9px; margin-bottom:10px; }
//     .prop-row { display:flex; justify-content:space-between; align-items:center; font-size:9px; color:#444; margin-bottom:5px; }
//     .logo-circle { width:34px; height:34px; border-radius:50%; border:2.5px solid #1a56db; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:11px; color:#1a56db; background:#eff6ff; flex-shrink:0; }
//     .firm-name { font-size:20px; font-weight:900; color:#1a1a1a; line-height:1.1; margin:2px 0; }
//     .firm-badge { display:inline-block; background:#1a56db; color:#fff; font-size:8px; font-weight:700; letter-spacing:1.2px; padding:2px 12px; border-radius:2px; margin:2px 0 1px; }
//     .firm-type { font-size:10px; font-weight:700; color:#333; margin-top:1px; }
//     .firm-addr { font-size:9px; color:#666; margin-top:2px; }
//     .date-line { display:inline-block; background:#1a56db; color:#fff; font-size:10px; font-weight:700; padding:2px 16px; border-radius:2px; margin-top:6px; letter-spacing:0.5px; }

//     table { width:100%; border-collapse:collapse; }
//     thead th { background:#1a56db; color:#fff; padding:7px 8px; font-size:10px; font-weight:700; border:1px solid #1245b5; text-transform:uppercase; letter-spacing:0.5px; }
//     td { border:1px solid #b8cef0 !important; }
//     tfoot td { background:#dbeafe !important; font-weight:800; border-top:2px solid #1a56db !important; padding:8px; color:#1e40af; font-size:11px; }
//     .summary-box { margin-top:10px; border:1.5px solid #1a56db; border-radius:4px; padding:7px 14px; background:#f0f7ff; display:flex; gap:22px; align-items:center; }
//     .sum-item .sum-label { font-size:9px; color:#666; text-transform:uppercase; letter-spacing:0.5px; }
//     .sum-item .sum-val   { font-weight:900; color:#1a56db; font-size:13px; margin-top:1px; }
//     .foot-note { text-align:right; font-size:9px; color:#888; margin-top:5px; font-style:italic; }
//     @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
//   </style>
// </head>
// <body>
//   <div class="page-wrap">

//   <div class="header">
//     <div class="prop-row">
//       <span style="text-align:left">Prop. Praveen V. Heggani<br>Cell : 9611635183</span>
//       <div class="logo-circle">PH</div>
//       <span style="text-align:right">Prop. Pramod V. Heggani<br>Cell : 9448349836</span>
//     </div>
//     <div class="firm-name">Mr. Praveen Heggani</div>
//     <div><span class="firm-badge">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
//     <div class="firm-type">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
//     <div class="firm-addr">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
//     <div><span class="date-line">SELLER SUMMARY REPORT &nbsp;—&nbsp; ${dateLabel}</span></div>
//   </div>

//   <table>
//     <thead>
//       <tr>
//         <th style="width:44px;text-align:center">Sr.No</th>
//         <th style="width:120px">Name</th>
//         <th style="width:85px;text-align:center">Material</th>
//         <th style="width:46px;text-align:center">Bags</th>
//         <th style="width:68px;text-align:center">Lot No</th>
//         <th style="width:88px;text-align:right">Weight (kg)</th>
//         <th style="width:108px;text-align:right">Rate (₹/100kg)</th>
//         <th style="width:108px;text-align:right">Amount (₹)</th>
//         <th style="text-align:left">Buyer</th>
//       </tr>
//     </thead>
//     <tbody>${rowsHtml}</tbody>
//     <tfoot>
//       <tr>
//         <td colspan="4" style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:left">TOTALS · ${sellers.length} sellers</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:center">${totalBags}</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:right">${fmtN(totalWeight)} kg</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:right;font-size:9px;color:#666">Gross Amt.</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:right;color:#1a56db;font-size:14px">₹ ${fmt2(totalAmt)}</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe"></td>
//       </tr>
//     </tfoot>
//   </table>

//   <div class="summary-box">
//     <div class="sum-item"><div class="sum-label">Sellers</div><div class="sum-val">${sellers.length}</div></div>
//     <div class="sum-item"><div class="sum-label">Total Bags</div><div class="sum-val">${totalBags}</div></div>
//     <div class="sum-item"><div class="sum-label">Total Weight</div><div class="sum-val">${fmtN(totalWeight)} kg</div></div>
//     <div class="sum-item"><div class="sum-label">Gross Amount</div><div class="sum-val">₹ ${fmt2(totalAmt)}</div></div>
//     <div class="sum-item"><div class="sum-label">Advance Paid</div><div class="sum-val">₹ ${fmt2(ss.total_advance || 0)}</div></div>
//     <div class="sum-item"><div class="sum-label">Balance Due</div><div class="sum-val" style="color:#dc2626">₹ ${fmt2(sellerBalance)}</div></div>
//   </div>
//   <div class="foot-note">Printed: ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; (E.&amp;O.E.)</div>
//   <script>window.onload = function(){ window.print(); }<\/script>
// </body>
// </html>`;

//     printHtml(html);
//   };

//   return (
//     <div>
//       {/* Header */}
//       <div className="page-header">
//         <div>
//           <div className="page-title">Summary Report</div>
//           <div className="page-subtitle">
//             {filterDate
//               ? `Market overview for ${new Date(filterDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`
//               : 'All-time market overview'}
//           </div>
//         </div>
//         <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
//           <input className="form-input" type="date" value={filterDate}
//             onChange={e => setFilterDate(e.target.value)}
//             style={{ textTransform:'none', width:170 }} />
//           <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate(todayISO())}>Today</button>
//           <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate('')}>All Time</button>
//           <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
//             <RefreshCw size={14}/> Refresh
//           </button>
//           {tableRows.length > 0 && (
//             <>
//               <button className="btn btn-green btn-sm" onClick={exportCSV}>
//                 <Download size={14}/> CSV
//               </button>
//               <button className="btn btn-primary btn-sm" onClick={printTable}>
//                 <Printer size={14}/> Print List
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div style={{ textAlign:'center', padding:80, color:'var(--text-muted)' }}>
//           <div style={{ fontSize:40, marginBottom:16 }}>📊</div>
//           <div>Loading summary...</div>
//         </div>
//       ) : (
//         <>
//           {/* Seller Stats */}
//           <div style={{ marginBottom:10, fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
//             <Users size={12}/> Seller Summary
//           </div>
//           <div className="stats-grid" style={{ marginBottom:24 }}>
//             {[
//               { label:'Total Sellers', value: ss.total_sellers||0,              color:'amber', icon:<Users size={20}/> },
//               { label:'Total Bags',    value: fmtNum(ss.total_bags, 0),          color:'green', icon:<Package size={20}/> },
//               { label:'Total Weight',  value: fmtNum(ss.total_weight)+' kg',     color:'blue',  icon:<TrendingUp size={20}/> },
//               { label:'Advance Paid',  value:'₹ '+fmtINR(ss.total_advance),     color:'purple',icon:'₹' },
//             ].map(s => (
//               <div key={s.label} className={`stat-card ${s.color}`}>
//                 <div className={`stat-icon ${s.color}`} style={s.color==='purple'?{background:'rgba(139,92,246,0.15)',color:'var(--purple)',fontWeight:800,fontSize:18}:{}}>{s.icon}</div>
//                 <div className="stat-value">{s.value}</div>
//                 <div className="stat-label">{s.label}</div>
//               </div>
//             ))}
//           </div>

//           {/* Buyer Stats */}
//           <div style={{ marginBottom:10, fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
//             <ShoppingCart size={12}/> Buyer Summary
//           </div>
//           <div className="stats-grid" style={{ marginBottom:24 }}>
//             {[
//               { label:'Total Buyers',  value: bs.total_buyers||0,               color:'amber', icon:<ShoppingCart size={20}/> },
//               { label:'Total Bags',    value: fmtNum(bs.total_bags, 0),          color:'green', icon:<Package size={20}/> },
//               { label:'Total Weight',  value: fmtNum(bs.total_weight)+' kg',     color:'blue',  icon:<TrendingUp size={20}/> },
//               { label:'Advance Recd.', value:'₹ '+fmtINR(bs.total_advance),     color:'purple',icon:'₹' },
//             ].map(s => (
//               <div key={s.label} className={`stat-card ${s.color}`}>
//                 <div className={`stat-icon ${s.color}`} style={s.color==='purple'?{background:'rgba(139,92,246,0.15)',color:'var(--purple)',fontWeight:800,fontSize:18}:{}}>{s.icon}</div>
//                 <div className="stat-value">{s.value}</div>
//                 <div className="stat-label">{s.label}</div>
//               </div>
//             ))}
//           </div>

//           {/* ── SELLER DETAIL TABLE ── */}
//           <div className="card" style={{ marginBottom:24, width:'100%' }}>
//             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
//               <div className="card-title" style={{ margin:0 }}>
//                 📋 Seller-wise Detail &nbsp;
//                 <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:400 }}>
//                   ({sellers.length} sellers · sorted by serial no.)
//                 </span>
//               </div>
//               <button onClick={() => setShowTable(t => !t)} className="btn btn-secondary btn-sm">
//                 {showTable ? 'Hide' : 'Show'} Table
//               </button>
//             </div>

//             {showTable && (
//               <div style={{ width:'100%', border:'1px solid var(--border)', borderRadius:10, overflow:'auto' }}>
//                 {sellers.length === 0 ? (
//                   <div className="empty-state" style={{ padding:40 }}>
//                     <div className="empty-state-icon">📋</div>
//                     <h3>No seller data for this period</h3>
//                   </div>
//                 ) : (
//                   <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, tableLayout:'fixed' }}>
//                     <colgroup>
//                       <col style={{ width:'46px' }}/>
//                       <col style={{ width:'130px' }}/>
//                       <col style={{ width:'105px' }}/>
//                       <col style={{ width:'54px' }}/>
//                       <col style={{ width:'72px' }}/>
//                       <col style={{ width:'100px' }}/>
//                       <col style={{ width:'115px' }}/>
//                       <col style={{ width:'120px' }}/>
//                       <col/>
//                     </colgroup>
//                     <thead>
//                       <tr style={{ background:'var(--bg-panel)' }}>
//                         {[
//                           { label:'Sr',            align:'center' },
//                           { label:'Name',          align:'left'   },
//                           { label:'Material',      align:'center' },
//                           { label:'Bags',          align:'center' },
//                           { label:'Lot No',        align:'center' },
//                           { label:'Weight (kg)',   align:'right'  },
//                           { label:'Rate (/100kg)', align:'right'  },
//                           { label:'Amount (₹)',    align:'right'  },
//                           { label:'Buyer',         align:'left'   },
//                         ].map(h => (
//                           <th key={h.label} style={{
//                             padding:'10px 10px', textAlign:h.align,
//                             fontSize:10, fontWeight:700, letterSpacing:0.8, textTransform:'uppercase',
//                             color:'var(--text-muted)',
//                             borderBottom:'2px solid var(--accent)',
//                             borderRight:'1px solid var(--border)',
//                           }}>{h.label}</th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {sellers.map((seller, si) => {
//                         let bags = [];
//                         try { bags = JSON.parse(seller.bag_data || '[]'); } catch {}
//                         const numBags = parseInt(seller.num_bags) || 0;
//                         const mat = seller.material && seller.material !== 'GENERAL' ? seller.material : '—';
//                         const rc = bags.length > 0 ? bags.length : 1;
//                         const rowBg = si % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-panel)';
//                         const cell = { borderRight:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'9px 10px', verticalAlign:'middle' };
//                         const merged = { ...cell, background:rowBg, borderBottom:'2px solid var(--accent)' };
//                         const badge = mat==='TAMARIND'?'badge-amber':mat==='GINGER'?'badge-green':mat==='ONION'?'badge-blue':mat==='LEMONS'?'badge-purple':'badge-amber';

//                         if (bags.length === 0) {
//                           const lb = '2px solid var(--accent)';
//                           return (
//                             <tr key={seller.id} style={{ background:rowBg }}>
//                               <td style={{ ...cell, fontWeight:800, color:'var(--accent)', textAlign:'center', fontSize:14, borderBottom:lb }}>{si+1}</td>
//                               <td style={{ ...cell, fontWeight:700, color:'var(--text-primary)', borderBottom:lb }}>{seller.name}</td>
//                               <td style={{ ...cell, textAlign:'center', borderBottom:lb }}>{mat!=='—'?<span className={'badge '+badge}>{mat}</span>:<span style={{color:'var(--text-muted)'}}>—</span>}</td>
//                               <td style={{ ...cell, textAlign:'center', fontWeight:700, borderBottom:lb }}>{numBags}</td>
//                               <td style={{ ...cell, fontFamily:'monospace', fontWeight:700, color:'var(--text-primary)', textAlign:'center', borderBottom:lb }}>{seller.lot_number||'—'}</td>
//                               <td style={{ ...cell, textAlign:'right', fontWeight:700, color:'var(--blue)', borderBottom:lb }}>{seller.weight>0?fmtNum(seller.weight):'—'}</td>
//                               <td style={{ ...cell, textAlign:'right', color:'var(--text-muted)', borderBottom:lb }}>—</td>
//                               <td style={{ ...cell, textAlign:'right', fontWeight:800, color:'var(--accent)', borderBottom:lb }}>{seller.amount>0?'₹ '+fmtINR(seller.amount):'—'}</td>
//                               <td style={{ ...cell, color:'var(--text-muted)', borderBottom:lb }}>—</td>
//                             </tr>
//                           );
//                         }

//                         return bags.map((bag, bi) => {
//                           const isLast = bi === bags.length - 1;
//                           const bdr = isLast ? '2px solid var(--accent)' : '1px solid var(--border)';
//                           const td = { ...cell, borderBottom: bdr };
//                           return (
//                             <tr key={seller.id+'-'+bi} style={{ background:rowBg }}>
//                               {/* Sr — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, fontWeight:800, color:'var(--accent)', textAlign:'center', fontSize:14 }}>{si+1}</td>}
//                               {/* Name — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, fontWeight:700, color:'var(--text-primary)' }}>{seller.name}</td>}
//                               {/* Material — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'center' }}>{mat!=='—'?<span className={'badge '+badge}>{mat}</span>:<span style={{color:'var(--text-muted)'}}>—</span>}</td>}
//                               {/* Bags — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'center', fontWeight:800, fontSize:14, color:'var(--text-primary)' }}>{numBags}</td>}
//                               {/* Lot No — per row */}
//                               <td style={{ ...td, fontFamily:'monospace', fontWeight:700, color:'var(--blue)', textAlign:'center', fontSize:12 }}>{bag.lot||seller.lot_number||'—'}</td>
//                               {/* Weight */}
//                               <td style={{ ...td, textAlign:'right', fontWeight:700, color:Number(bag.weight)>0?'var(--blue)':'var(--text-muted)' }}>{Number(bag.weight)>0?fmtNum(bag.weight):'—'}</td>
//                               {/* Rate */}
//                               <td style={{ ...td, textAlign:'right', fontWeight:700, color:Number(bag.rate)>0?'var(--green)':'var(--text-muted)' }}>{Number(bag.rate)>0?fmtNum(bag.rate):'—'}</td>
//                               {/* Amount */}
//                               <td style={{ ...td, textAlign:'right', fontWeight:800, color:Number(bag.amount)>0?'var(--accent)':'var(--text-muted)' }}>{Number(bag.amount)>0?'₹ '+fmtINR(bag.amount):'—'}</td>
//                               {/* Buyer */}
//                               <td style={{ ...td, fontWeight:bag.buyer&&bag.buyer!=='—'?700:400, color:bag.buyer&&bag.buyer!=='—'?'#a78bfa':'var(--text-muted)', fontSize:12 }}>{bag.buyer||'—'}</td>
//                             </tr>
//                           );
//                         });
//                       })}
//                     </tbody>
//                     <tfoot>
//                       <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--accent)' }}>
//                         <td colSpan={4} style={{ padding:'11px 10px', fontWeight:700, color:'var(--text-secondary)', fontSize:12, borderRight:'1px solid var(--border)' }}>
//                           TOTALS — {sellers.length} sellers
//                         </td>
//                         <td style={{ borderRight:'1px solid var(--border)' }}/>
//                         <td style={{ padding:'11px 10px', textAlign:'right', fontWeight:800, color:'var(--blue)', fontSize:13, borderRight:'1px solid var(--border)' }}>
//                           {fmtNum(totalWeight)} kg
//                         </td>
//                         <td style={{ borderRight:'1px solid var(--border)' }}/>
//                         <td style={{ padding:'11px 10px', textAlign:'right', fontWeight:800, color:'var(--accent)', fontSize:13, borderRight:'1px solid var(--border)' }}>
//                           ₹ {fmtINR(totalAmt)}
//                         </td>
//                         <td/>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Material Breakdown + Financial */}
//           <div className="two-col">
//             <div className="card">
//               <div className="card-title"><Package size={16} style={{ color:'var(--accent)' }}/> Material Breakdown (Sellers)</div>
//               {mb.length > 0 ? (
//                 <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
//                   {mb.map(m => {
//                     const mc  = MATERIAL_COLORS[m.material] || DEFAULT_COLOR;
//                     const pct = maxBags > 0 ? ((Number(m.bags)||0) / maxBags) * 100 : 0;
//                     return (
//                       <div key={m.material}>
//                         <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6, fontSize:13 }}>
//                           <span style={{ fontWeight:700, color:mc.color, background:mc.bg, padding:'2px 12px', borderRadius:20, border:`1px solid ${mc.bar}44` }}>{m.material}</span>
//                           <span style={{ color:'var(--text-secondary)', fontSize:12 }}>{m.count} sellers · {m.bags} bags · {fmtNum(m.weight)} kg</span>
//                         </div>
//                         <div style={{ background:'var(--bg-panel)', borderRadius:4, height:8, overflow:'hidden' }}>
//                           <div style={{ height:'100%', width:`${pct}%`, background:mc.bar, borderRadius:4, transition:'width 0.5s ease', minWidth:pct>0?6:0 }}/>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div className="empty-state" style={{ padding:32 }}>
//                   <div className="empty-state-icon">📊</div>
//                   <h3>No data for this period</h3>
//                 </div>
//               )}
//             </div>

//             <div className="card">
//               <div className="card-title"><TrendingUp size={16} style={{ color:'var(--green)' }}/> Financial Summary</div>

//               <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>👨‍🌾 Seller Financials</div>
//               <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
//                 {[
//                   { label:'Gross Amount', value:'₹ '+fmtINR(ss.total_amount),  color:'var(--accent)' },
//                   { label:'Advance Paid', value:'₹ '+fmtINR(ss.total_advance), color:'var(--text-secondary)' },
//                   { label:'Balance Due',  value:'₹ '+fmtINR(sellerBalance),    color: sellerBalance>0?'var(--red)':'var(--green)' },
//                 ].map(row => (
//                   <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg-panel)', borderRadius:8, border:'1px solid var(--border)' }}>
//                     <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{row.label}</span>
//                     <span style={{ fontSize:14, fontWeight:800, fontFamily:'var(--font-display)', color:row.color }}>{row.value}</span>
//                   </div>
//                 ))}
//               </div>

//               <div style={{ borderTop:'1px dashed var(--border)', marginBottom:16 }}/>

//               <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>🛒 Buyer Financials</div>
//               <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
//                 {[
//                   { label:'Gross Amount',     value:'₹ '+fmtINR(bs.total_amount),  color:'var(--blue)' },
//                   { label:'Advance Received', value:'₹ '+fmtINR(bs.total_advance), color:'var(--text-secondary)' },
//                   { label:'Balance Payable',  value:'₹ '+fmtINR(buyerBalance),      color: buyerBalance>0?'var(--red)':'var(--green)' },
//                 ].map(row => (
//                   <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg-panel)', borderRadius:8, border:'1px solid var(--border)' }}>
//                     <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{row.label}</span>
//                     <span style={{ fontSize:14, fontWeight:800, fontFamily:'var(--font-display)', color:row.color }}>{row.value}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }



// ---------------------------------------------------------------------------------------------------------


// import React, { useState, useEffect, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import { RefreshCw, TrendingUp, Users, ShoppingCart, Package, Download, Printer } from 'lucide-react';
// import axios from 'axios';
// import { fmtINR, fmtNum, todayISO } from '../utils';

// const API = axios.create({ baseURL: '' });

// const MATERIAL_COLORS = {
//   TAMARIND: { bg: 'var(--accent-dim)',    color: 'var(--accent)',  bar: '#f59e0b' },
//   GINGER:    { bg: 'var(--green-dim)',     color: 'var(--green)',   bar: '#10b981' },
//   ONION:    { bg: 'var(--blue-dim)',      color: 'var(--blue)',    bar: '#3b82f6' },
//   LEMONS:   { bg: 'rgba(139,92,246,0.15)', color: 'var(--purple)', bar: '#8b5cf6' },
// };
// const DEFAULT_COLOR = { bg: 'var(--accent-dim)', color: 'var(--accent)', bar: '#f59e0b' };

// const fmt2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// const fmtN = (v) => Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

// export default function Summary() {
//   const [data,       setData]       = useState(null);
//   const [sellers,    setSellers]    = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [filterDate, setFilterDate] = useState(todayISO());
//   const [showTable,  setShowTable]  = useState(true);

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const params = filterDate ? { date: filterDate } : {};
//       const [sumRes, selRes] = await Promise.all([
//         API.get('/api/summary', { params }),
//         API.get('/api/sellers',  { params }),
//       ]);
//       setData(sumRes.data.data);

//       // ✅ Sort ascending by serial_number numerically
//       const raw = selRes.data.data || [];
//       raw.sort((a, b) => {
//         const na = parseInt(a.serial_number) || 0;
//         const nb = parseInt(b.serial_number) || 0;
//         return na - nb;
//       });
//       setSellers(raw);
//     } catch (err) {
//       toast.error(err.message || 'Failed to load summary');
//     } finally {
//       setLoading(false);
//     }
//   }, [filterDate]);

//   useEffect(() => { load(); }, [load]);

//   const ss = data?.sellerStats  || {};
//   const bs = data?.buyerStats   || {};
//   const mb = data?.materialBreakdown || [];
//   const maxBags = mb.length ? Math.max(...mb.map(m => Number(m.bags) || 0), 1) : 1;
//   const sellerBalance = (Number(ss.total_amount) || 0) - (Number(ss.total_advance) || 0);
//   const buyerBalance  = (Number(bs.total_amount) || 0) - (Number(bs.total_advance) || 0);

//   // Build flat rows — one row per bag
//   const tableRows = [];
//   sellers.forEach((s, si) => {
//     let bags = [];
//     try { bags = JSON.parse(s.bag_data || '[]'); } catch {}
//     const numBags = parseInt(s.num_bags) || 0;

//     if (bags.length === 0) {
//       tableRows.push({
//         srno: si + 1, lot: s.lot_number || '—', name: s.name,
//         material: s.material && s.material !== 'GENERAL' ? s.material : '—',
//         bags: numBags, weight: s.weight, rate: s.rate_fixed || 0,
//         amount: s.amount || 0, buyer: '—',
//         isFirstBag: true, isLastBag: true, bagIdx: null,
//       });
//     } else {
//       bags.forEach((b, bi) => {
//         tableRows.push({
//           srno: si + 1,
//           lot: b.lot || s.lot_number || '—',
//           name: bi === 0 ? s.name : '',
//           material: bi === 0 ? (s.material && s.material !== 'GENERAL' ? s.material : '—') : '',
//           bags: bi === 0 ? numBags : '',
//           weight: Number(b.weight) || 0,
//           rate: Number(b.rate) || 0,
//           amount: Number(b.amount) || 0,
//           buyer: b.buyer || '—',
//           isFirstBag: bi === 0,
//           isLastBag: bi === bags.length - 1,
//           bagIdx: bi + 1,
//         });
//       });
//     }
//   });

//   const totalBags   = sellers.reduce((s, r) => s + (parseInt(r.num_bags) || 0), 0);
//   const totalWeight = sellers.reduce((s, r) => s + (Number(r.weight) || 0), 0);
//   const totalAmt    = sellers.reduce((s, r) => s + (Number(r.amount) || 0), 0);

//   // ✅ Export CSV
//   const exportCSV = () => {
//     const headers = ['Sr.No','Lot No','Name','Material','Bags','Weight(kg)','Rate(₹/100kg)','Amount(₹)','Buyer'];
//     const rows = tableRows.map(r => [r.srno, r.lot, r.name, r.material, r.bags, r.weight, r.rate, r.amount, r.buyer]);
//     const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url  = URL.createObjectURL(blob);
//     const a    = document.createElement('a');
//     a.href     = url;
//     a.download = `seller-summary-${filterDate || 'all'}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success('CSV exported!');
//   };

//   // ✅ Print full list — A4 landscape
//   const printTable = () => {
//     const dateLabel = filterDate
//       ? new Date(filterDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
//       : 'All Time';

//     // Build grouped print rows with rowspan
//     let rowsHtml = '';
//     const fmtNp = (v) => Number(v||0).toLocaleString('en-IN', {maximumFractionDigits:2});
//     const fmt2p = (v) => Number(v||0).toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
//     sellers.forEach(function(seller, si) {
//       let bags = [];
//       try { bags = JSON.parse(seller.bag_data || '[]'); } catch(e) {}
//       const numBags = parseInt(seller.num_bags) || 0;
//       const mat = seller.material && seller.material !== 'GENERAL' ? seller.material : '—';
//       const rowBg = si % 2 === 0 ? '#ffffff' : '#f0f7ff';
//       const rc = bags.length > 0 ? bags.length : 1;
//       const P = 'padding:7px 8px;border:1px solid #b8cef0;';
//       const BR = '';

//       if (bags.length === 0) {
//         rowsHtml += '<tr style="background:' + rowBg + ';border-bottom:2px solid #93c5fd">' +
//           '<td style="' + P + 'font-weight:800;color:#d97706;text-align:center;font-size:11px;vertical-align:middle;' + BR + '">' + (si+1) + '</td>' +
//           '<td style="' + P + 'font-weight:700;font-size:11px;color:#1a1a1a;' + BR + '">' + seller.name + '</td>' +
//           '<td style="' + P + 'text-align:center;font-size:10px;color:#333;' + BR + '">' + mat + '</td>' +
//           '<td style="' + P + 'text-align:center;font-weight:700;font-size:11px;' + BR + '">' + numBags + '</td>' +
//           '<td style="' + P + 'font-family:monospace;font-weight:700;text-align:center;font-size:11px;color:#1e3a5f">' + (seller.lot_number||'—') + '</td>' +
//           '<td style="' + P + 'text-align:right;font-weight:700;font-size:11px;color:#1e40af">' + (seller.weight>0 ? fmtNp(seller.weight) : '—') + '</td>' +
//           '<td style="' + P + 'text-align:right;font-size:11px;color:#999">—</td>' +
//           '<td style="' + P + 'text-align:right;font-weight:800;font-size:11px;color:#1a56db">' + (seller.amount>0 ? '₹ '+fmt2p(seller.amount) : '—') + '</td>' +
//           '<td style="' + P + 'font-size:11px;color:#999">—</td></tr>';
//         return;
//       }

//       bags.forEach(function(bag, bi) {
//         const bdr = bi === bags.length-1 ? '2px solid #93c5fd' : '1px solid #e2e8f0';
//         const w = Number(bag.weight)||0;
//         const r = Number(bag.rate)||0;
//         const a = Number(bag.amount)||0;
//         const buyer = bag.buyer || '—';
//         rowsHtml += '<tr style="background:' + rowBg + ';border-bottom:' + bdr + '">';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'font-weight:800;color:#d97706;text-align:center;font-size:11px;vertical-align:middle;' + BR + '">' + (si+1) + '</td>';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'font-weight:700;font-size:11px;color:#1a1a1a;vertical-align:middle;' + '">' + seller.name + '</td>';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'text-align:center;font-size:10px;color:#333;vertical-align:middle;' + BR + '">' + mat + '</td>';
//         if (bi === 0) rowsHtml += '<td rowspan="' + rc + '" style="' + P + 'text-align:center;font-weight:700;font-size:11px;vertical-align:middle;' + BR + '">' + numBags + '</td>';
//         rowsHtml += '<td style="' + P + 'font-family:monospace;font-weight:700;text-align:center;font-size:11px;color:#1e3a5f">' + (bag.lot||seller.lot_number||'—') + '</td>';
//         rowsHtml += '<td style="' + P + 'text-align:right;font-weight:700;font-size:11px;color:#1e40af">' + (w>0 ? fmtNp(w) : '—') + '</td>';
//         rowsHtml += '<td style="' + P + 'text-align:right;font-weight:700;font-size:11px;color:#166534">' + (r>0 ? fmtNp(r) : '—') + '</td>';
//         rowsHtml += '<td style="' + P + 'text-align:right;font-weight:800;font-size:11px;color:#1a56db">' + (a>0 ? '₹ '+fmt2p(a) : '—') + '</td>';
//         rowsHtml += '<td style="' + P + 'font-weight:' + (buyer!=='—'?700:400) + ';font-size:11px;color:' + (buyer!=='—'?'#7c3aed':'#999') + '">' + buyer + '</td></tr>';
//       });
//     });

//     const html = `<!DOCTYPE html>
// <html>
// <head>
//   <title>Seller Summary — ${filterDate || 'All'}</title>
//   <style>
//     @page { size: A4 landscape; margin: 6mm 8mm; }
//     * { box-sizing: border-box; margin: 0; padding: 0; }
//     body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }

//     /* Page border */
//     .page-wrap { border: 3px solid #1a56db; border-radius: 4px; padding: 10px 12px; position: relative; min-height: 97%; }
//     .page-wrap::after { content:''; position:absolute; top:4px; left:4px; right:4px; bottom:4px; border:1px solid #a0bbf0; border-radius:2px; pointer-events:none; }

//     /* Header */
//     .header { text-align:center; border-bottom:2.5px double #1a56db; padding-bottom:9px; margin-bottom:10px; }
//     .prop-row { display:flex; justify-content:space-between; align-items:center; font-size:9px; color:#444; margin-bottom:5px; }
//     .logo-circle { width:34px; height:34px; border-radius:50%; border:2.5px solid #1a56db; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:11px; color:#1a56db; background:#eff6ff; flex-shrink:0; }
//     .firm-name { font-size:20px; font-weight:900; color:#1a1a1a; line-height:1.1; margin:2px 0; }
//     .firm-badge { display:inline-block; background:#1a56db; color:#fff; font-size:8px; font-weight:700; letter-spacing:1.2px; padding:2px 12px; border-radius:2px; margin:2px 0 1px; }
//     .firm-type { font-size:10px; font-weight:700; color:#333; margin-top:1px; }
//     .firm-addr { font-size:9px; color:#666; margin-top:2px; }
//     .date-line { display:inline-block; background:#1a56db; color:#fff; font-size:10px; font-weight:700; padding:2px 16px; border-radius:2px; margin-top:6px; letter-spacing:0.5px; }

//     table { width:100%; border-collapse:collapse; }
//     thead th { background:#1a56db; color:#fff; padding:7px 8px; font-size:10px; font-weight:700; border:1px solid #1245b5; text-transform:uppercase; letter-spacing:0.5px; }
//     td { border:1px solid #b8cef0 !important; }
//     tfoot td { background:#dbeafe !important; font-weight:800; border-top:2px solid #1a56db !important; padding:8px; color:#1e40af; font-size:11px; }
//     .summary-box { margin-top:10px; border:1.5px solid #1a56db; border-radius:4px; padding:7px 14px; background:#f0f7ff; display:flex; gap:22px; align-items:center; }
//     .sum-item .sum-label { font-size:9px; color:#666; text-transform:uppercase; letter-spacing:0.5px; }
//     .sum-item .sum-val   { font-weight:900; color:#1a56db; font-size:13px; margin-top:1px; }
//     .foot-note { text-align:right; font-size:9px; color:#888; margin-top:5px; font-style:italic; }
//     @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
//   </style>
// </head>
// <body>
//   <div class="page-wrap">

//   <div class="header">
//     <div class="prop-row">
//       <span style="text-align:left">Prop. Praveen V. Heggani<br>Cell : 9611635183</span>
//       <div class="logo-circle">PH</div>
//       <span style="text-align:right">Prop. Pramod V. Heggani<br>Cell : 9448349836</span>
//     </div>
//     <div class="firm-name">Mr. Praveen Heggani</div>
//     <div><span class="firm-badge">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
//     <div class="firm-type">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
//     <div class="firm-addr">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
//     <div><span class="date-line">COMPLETE SUMMARY REPORT &nbsp;—&nbsp; ${dateLabel}</span></div>
//   </div>

//   <table>
//     <thead>
//       <tr>
//         <th style="width:44px;text-align:center">Sr.No</th>
//         <th style="width:120px">Name</th>
//         <th style="width:85px;text-align:center">Material</th>
//         <th style="width:46px;text-align:center">Bags</th>
//         <th style="width:68px;text-align:center">Lot No</th>
//         <th style="width:88px;text-align:right">Weight (kg)</th>
//         <th style="width:108px;text-align:right">Rate (₹/100kg)</th>
//         <th style="width:108px;text-align:right">Amount (₹)</th>
//         <th style="text-align:left">Buyer</th>
//       </tr>
//     </thead>
//     <tbody>${rowsHtml}</tbody>
//     <tfoot>
//       <tr>
//         <td colspan="4" style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:left">TOTALS · ${sellers.length} sellers</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:center">${totalBags}</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:right">${fmtN(totalWeight)} kg</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:right;font-size:9px;color:#666">Gross Amt.</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe;padding:8px;font-weight:800;color:#1e40af;text-align:right;color:#1a56db;font-size:14px">₹ ${fmt2(totalAmt)}</td>
//         <td style="border:1px solid #b8cef0;background:#dbeafe"></td>
//       </tr>
//     </tfoot>
//   </table>

//   <div class="summary-box">
//     <div class="sum-item"><div class="sum-label">Sellers</div><div class="sum-val">${sellers.length}</div></div>
//     <div class="sum-item"><div class="sum-label">Total Bags</div><div class="sum-val">${totalBags}</div></div>
//     <div class="sum-item"><div class="sum-label">Total Weight</div><div class="sum-val">${fmtN(totalWeight)} kg</div></div>
//     <div class="sum-item"><div class="sum-label">Gross Amount</div><div class="sum-val">₹ ${fmt2(totalAmt)}</div></div>
//     <div class="sum-item"><div class="sum-label">Advance Paid</div><div class="sum-val">₹ ${fmt2(ss.total_advance || 0)}</div></div>
//     <div class="sum-item"><div class="sum-label">Balance Due</div><div class="sum-val" style="color:#dc2626">₹ ${fmt2(sellerBalance)}</div></div>
//   </div>
//   <div class="foot-note">Printed: ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; (E.&amp;O.E.)</div>
//   <script>window.onload = function(){ window.print(); }<\/script>
// </body>
// </html>`;

//     const w = window.open('', '_blank', 'width=1100,height=750');
//     w.document.write(html);
//     w.document.close();
//   };

//   return (
//     <div>
//       {/* Header */}
//       <div className="page-header">
//         <div>
//           <div className="page-title">Summary Report</div>
//           <div className="page-subtitle">
//             {filterDate
//               ? `Market overview for ${new Date(filterDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`
//               : 'All-time market overview'}
//           </div>
//         </div>
//         <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
//           <input className="form-input" type="date" value={filterDate}
//             onChange={e => setFilterDate(e.target.value)}
//             style={{ textTransform:'none', width:170 }} />
//           <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate(todayISO())}>Today</button>
//           <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate('')}>All Time</button>
//           <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
//             <RefreshCw size={14}/> Refresh
//           </button>
//           {tableRows.length > 0 && (
//             <>
//               <button className="btn btn-green btn-sm" onClick={exportCSV}>
//                 <Download size={14}/> CSV
//               </button>
//               <button className="btn btn-primary btn-sm" onClick={printTable}>
//                 <Printer size={14}/> Print List
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {loading ? (
//         <div style={{ textAlign:'center', padding:80, color:'var(--text-muted)' }}>
//           <div style={{ fontSize:40, marginBottom:16 }}>📊</div>
//           <div>Loading summary...</div>
//         </div>
//       ) : (
//         <>
//           {/* Seller Stats */}
//           <div style={{ marginBottom:10, fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
//             <Users size={12}/> Seller Summary
//           </div>
//           <div className="stats-grid" style={{ marginBottom:24 }}>
//             {[
//               { label:'Total Sellers', value: ss.total_sellers||0,              color:'amber', icon:<Users size={20}/> },
//               { label:'Total Bags',    value: fmtNum(ss.total_bags, 0),          color:'green', icon:<Package size={20}/> },
//               { label:'Total Weight',  value: fmtNum(ss.total_weight)+' kg',     color:'blue',  icon:<TrendingUp size={20}/> },
//               { label:'Advance Paid',  value:'₹ '+fmtINR(ss.total_advance),     color:'purple',icon:'₹' },
//             ].map(s => (
//               <div key={s.label} className={`stat-card ${s.color}`}>
//                 <div className={`stat-icon ${s.color}`} style={s.color==='purple'?{background:'rgba(139,92,246,0.15)',color:'var(--purple)',fontWeight:800,fontSize:18}:{}}>{s.icon}</div>
//                 <div className="stat-value">{s.value}</div>
//                 <div className="stat-label">{s.label}</div>
//               </div>
//             ))}
//           </div>

//           {/* Buyer Stats */}
//           <div style={{ marginBottom:10, fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
//             <ShoppingCart size={12}/> Buyer Summary
//           </div>
//           <div className="stats-grid" style={{ marginBottom:24 }}>
//             {[
//               { label:'Total Buyers',  value: bs.total_buyers||0,               color:'amber', icon:<ShoppingCart size={20}/> },
//               { label:'Total Bags',    value: fmtNum(bs.total_bags, 0),          color:'green', icon:<Package size={20}/> },
//               { label:'Total Weight',  value: fmtNum(bs.total_weight)+' kg',     color:'blue',  icon:<TrendingUp size={20}/> },
//               { label:'Advance Recd.', value:'₹ '+fmtINR(bs.total_advance),     color:'purple',icon:'₹' },
//             ].map(s => (
//               <div key={s.label} className={`stat-card ${s.color}`}>
//                 <div className={`stat-icon ${s.color}`} style={s.color==='purple'?{background:'rgba(139,92,246,0.15)',color:'var(--purple)',fontWeight:800,fontSize:18}:{}}>{s.icon}</div>
//                 <div className="stat-value">{s.value}</div>
//                 <div className="stat-label">{s.label}</div>
//               </div>
//             ))}
//           </div>

//           {/* ── SELLER DETAIL TABLE ── */}
//           <div className="card" style={{ marginBottom:24, width:'100%' }}>
//             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
//               <div className="card-title" style={{ margin:0 }}>
//                 📋 Seller-wise Detail &nbsp;
//                 <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:400 }}>
//                   ({sellers.length} sellers · sorted by serial no.)
//                 </span>
//               </div>
//               <button onClick={() => setShowTable(t => !t)} className="btn btn-secondary btn-sm">
//                 {showTable ? 'Hide' : 'Show'} Table
//               </button>
//             </div>

//             {showTable && (
//               <div style={{ width:'100%', border:'1px solid var(--border)', borderRadius:10, overflow:'auto' }}>
//                 {sellers.length === 0 ? (
//                   <div className="empty-state" style={{ padding:40 }}>
//                     <div className="empty-state-icon">📋</div>
//                     <h3>No seller data for this period</h3>
//                   </div>
//                 ) : (
//                   <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, tableLayout:'fixed' }}>
//                     <colgroup>
//                       <col style={{ width:'46px' }}/>
//                       <col style={{ width:'130px' }}/>
//                       <col style={{ width:'105px' }}/>
//                       <col style={{ width:'54px' }}/>
//                       <col style={{ width:'72px' }}/>
//                       <col style={{ width:'100px' }}/>
//                       <col style={{ width:'115px' }}/>
//                       <col style={{ width:'120px' }}/>
//                       <col/>
//                     </colgroup>
//                     <thead>
//                       <tr style={{ background:'var(--bg-panel)' }}>
//                         {[
//                           { label:'Sr',            align:'center' },
//                           { label:'Name',          align:'left'   },
//                           { label:'Material',      align:'center' },
//                           { label:'Bags',          align:'center' },
//                           { label:'Lot No',        align:'center' },
//                           { label:'Weight (kg)',   align:'right'  },
//                           { label:'Rate (/100kg)', align:'right'  },
//                           { label:'Amount (₹)',    align:'right'  },
//                           { label:'Buyer',         align:'left'   },
//                         ].map(h => (
//                           <th key={h.label} style={{
//                             padding:'10px 10px', textAlign:h.align,
//                             fontSize:10, fontWeight:700, letterSpacing:0.8, textTransform:'uppercase',
//                             color:'var(--text-muted)',
//                             borderBottom:'2px solid var(--accent)',
//                             borderRight:'1px solid var(--border)',
//                           }}>{h.label}</th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {sellers.map((seller, si) => {
//                         let bags = [];
//                         try { bags = JSON.parse(seller.bag_data || '[]'); } catch {}
//                         const numBags = parseInt(seller.num_bags) || 0;
//                         const mat = seller.material && seller.material !== 'GENERAL' ? seller.material : '—';
//                         const rc = bags.length > 0 ? bags.length : 1;
//                         const rowBg = si % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-panel)';
//                         const cell = { borderRight:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'9px 10px', verticalAlign:'middle' };
//                         const merged = { ...cell, background:rowBg, borderBottom:'2px solid var(--accent)' };
//                         const badge = mat==='TAMARIND'?'badge-amber':mat==='GINGER'?'badge-green':mat==='ONION'?'badge-blue':mat==='LEMONS'?'badge-purple':'badge-amber';

//                         if (bags.length === 0) {
//                           const lb = '2px solid var(--accent)';
//                           return (
//                             <tr key={seller.id} style={{ background:rowBg }}>
//                               <td style={{ ...cell, fontWeight:800, color:'var(--accent)', textAlign:'center', fontSize:14, borderBottom:lb }}>{si+1}</td>
//                               <td style={{ ...cell, fontWeight:700, color:'var(--text-primary)', borderBottom:lb }}>{seller.name}</td>
//                               <td style={{ ...cell, textAlign:'center', borderBottom:lb }}>{mat!=='—'?<span className={'badge '+badge}>{mat}</span>:<span style={{color:'var(--text-muted)'}}>—</span>}</td>
//                               <td style={{ ...cell, textAlign:'center', fontWeight:700, borderBottom:lb }}>{numBags}</td>
//                               <td style={{ ...cell, fontFamily:'monospace', fontWeight:700, color:'var(--text-primary)', textAlign:'center', borderBottom:lb }}>{seller.lot_number||'—'}</td>
//                               <td style={{ ...cell, textAlign:'right', fontWeight:700, color:'var(--blue)', borderBottom:lb }}>{seller.weight>0?fmtNum(seller.weight):'—'}</td>
//                               <td style={{ ...cell, textAlign:'right', color:'var(--text-muted)', borderBottom:lb }}>—</td>
//                               <td style={{ ...cell, textAlign:'right', fontWeight:800, color:'var(--accent)', borderBottom:lb }}>{seller.amount>0?'₹ '+fmtINR(seller.amount):'—'}</td>
//                               <td style={{ ...cell, color:'var(--text-muted)', borderBottom:lb }}>—</td>
//                             </tr>
//                           );
//                         }

//                         return bags.map((bag, bi) => {
//                           const isLast = bi === bags.length - 1;
//                           const bdr = isLast ? '2px solid var(--accent)' : '1px solid var(--border)';
//                           const td = { ...cell, borderBottom: bdr };
//                           return (
//                             <tr key={seller.id+'-'+bi} style={{ background:rowBg }}>
//                               {/* Sr — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, fontWeight:800, color:'var(--accent)', textAlign:'center', fontSize:14 }}>{si+1}</td>}
//                               {/* Name — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, fontWeight:700, color:'var(--text-primary)' }}>{seller.name}</td>}
//                               {/* Material — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'center' }}>{mat!=='—'?<span className={'badge '+badge}>{mat}</span>:<span style={{color:'var(--text-muted)'}}>—</span>}</td>}
//                               {/* Bags — merged */}
//                               {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'center', fontWeight:800, fontSize:14, color:'var(--text-primary)' }}>{numBags}</td>}
//                               {/* Lot No — per row */}
//                               <td style={{ ...td, fontFamily:'monospace', fontWeight:700, color:'var(--blue)', textAlign:'center', fontSize:12 }}>{bag.lot||seller.lot_number||'—'}</td>
//                               {/* Weight */}
//                               <td style={{ ...td, textAlign:'right', fontWeight:700, color:Number(bag.weight)>0?'var(--blue)':'var(--text-muted)' }}>{Number(bag.weight)>0?fmtNum(bag.weight):'—'}</td>
//                               {/* Rate */}
//                               <td style={{ ...td, textAlign:'right', fontWeight:700, color:Number(bag.rate)>0?'var(--green)':'var(--text-muted)' }}>{Number(bag.rate)>0?fmtNum(bag.rate):'—'}</td>
//                               {/* Amount */}
//                               <td style={{ ...td, textAlign:'right', fontWeight:800, color:Number(bag.amount)>0?'var(--accent)':'var(--text-muted)' }}>{Number(bag.amount)>0?'₹ '+fmtINR(bag.amount):'—'}</td>
//                               {/* Buyer */}
//                               <td style={{ ...td, fontWeight:bag.buyer&&bag.buyer!=='—'?700:400, color:bag.buyer&&bag.buyer!=='—'?'#a78bfa':'var(--text-muted)', fontSize:12 }}>{bag.buyer||'—'}</td>
//                             </tr>
//                           );
//                         });
//                       })}
//                     </tbody>
//                     <tfoot>
//                       <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--accent)' }}>
//                         <td colSpan={4} style={{ padding:'11px 10px', fontWeight:700, color:'var(--text-secondary)', fontSize:12, borderRight:'1px solid var(--border)' }}>
//                           TOTALS — {sellers.length} sellers
//                         </td>
//                         <td style={{ borderRight:'1px solid var(--border)' }}/>
//                         <td style={{ padding:'11px 10px', textAlign:'right', fontWeight:800, color:'var(--blue)', fontSize:13, borderRight:'1px solid var(--border)' }}>
//                           {fmtNum(totalWeight)} kg
//                         </td>
//                         <td style={{ borderRight:'1px solid var(--border)' }}/>
//                         <td style={{ padding:'11px 10px', textAlign:'right', fontWeight:800, color:'var(--accent)', fontSize:13, borderRight:'1px solid var(--border)' }}>
//                           ₹ {fmtINR(totalAmt)}
//                         </td>
//                         <td/>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Material Breakdown + Financial */}
//           <div className="two-col">
//             <div className="card">
//               <div className="card-title"><Package size={16} style={{ color:'var(--accent)' }}/> Material Breakdown (Sellers)</div>
//               {mb.length > 0 ? (
//                 <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
//                   {mb.map(m => {
//                     const mc  = MATERIAL_COLORS[m.material] || DEFAULT_COLOR;
//                     const pct = maxBags > 0 ? ((Number(m.bags)||0) / maxBags) * 100 : 0;
//                     return (
//                       <div key={m.material}>
//                         <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6, fontSize:13 }}>
//                           <span style={{ fontWeight:700, color:mc.color, background:mc.bg, padding:'2px 12px', borderRadius:20, border:`1px solid ${mc.bar}44` }}>{m.material}</span>
//                           <span style={{ color:'var(--text-secondary)', fontSize:12 }}>{m.count} sellers · {m.bags} bags · {fmtNum(m.weight)} kg</span>
//                         </div>
//                         <div style={{ background:'var(--bg-panel)', borderRadius:4, height:8, overflow:'hidden' }}>
//                           <div style={{ height:'100%', width:`${pct}%`, background:mc.bar, borderRadius:4, transition:'width 0.5s ease', minWidth:pct>0?6:0 }}/>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div className="empty-state" style={{ padding:32 }}>
//                   <div className="empty-state-icon">📊</div>
//                   <h3>No data for this period</h3>
//                 </div>
//               )}
//             </div>

//             <div className="card">
//               <div className="card-title"><TrendingUp size={16} style={{ color:'var(--green)' }}/> Financial Summary</div>

//               <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>👨‍🌾 Seller Financials</div>
//               <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
//                 {[
//                   { label:'Gross Amount', value:'₹ '+fmtINR(ss.total_amount),  color:'var(--accent)' },
//                   { label:'Advance Paid', value:'₹ '+fmtINR(ss.total_advance), color:'var(--text-secondary)' },
//                   { label:'Balance Due',  value:'₹ '+fmtINR(sellerBalance),    color: sellerBalance>0?'var(--red)':'var(--green)' },
//                 ].map(row => (
//                   <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg-panel)', borderRadius:8, border:'1px solid var(--border)' }}>
//                     <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{row.label}</span>
//                     <span style={{ fontSize:14, fontWeight:800, fontFamily:'var(--font-display)', color:row.color }}>{row.value}</span>
//                   </div>
//                 ))}
//               </div>

//               <div style={{ borderTop:'1px dashed var(--border)', marginBottom:16 }}/>

//               <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>🛒 Buyer Financials</div>
//               <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
//                 {[
//                   { label:'Gross Amount',     value:'₹ '+fmtINR(bs.total_amount),  color:'var(--blue)' },
//                   { label:'Advance Received', value:'₹ '+fmtINR(bs.total_advance), color:'var(--text-secondary)' },
//                   { label:'Balance Payable',  value:'₹ '+fmtINR(buyerBalance),      color: buyerBalance>0?'var(--red)':'var(--green)' },
//                 ].map(row => (
//                   <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg-panel)', borderRadius:8, border:'1px solid var(--border)' }}>
//                     <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{row.label}</span>
//                     <span style={{ fontSize:14, fontWeight:800, fontFamily:'var(--font-display)', color:row.color }}>{row.value}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }


// -------------------------------------------------------------------------------------------------------------




import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, TrendingUp, Users, ShoppingCart, Package, Download, Printer } from 'lucide-react';
import axios from 'axios';
import { fmtINR, fmtNum, todayISO } from '../utils';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

const MATERIAL_COLORS = {
  TAMARIND: { bg: 'var(--accent-dim)',    color: 'var(--accent)',  bar: '#f59e0b' },
  GINGER:    { bg: 'var(--green-dim)',     color: 'var(--green)',   bar: '#10b981' },
  ONION:    { bg: 'var(--blue-dim)',      color: 'var(--blue)',    bar: '#3b82f6' },
  LEMONS:   { bg: 'rgba(139,92,246,0.15)', color: 'var(--purple)', bar: '#8b5cf6' },
};
const DEFAULT_COLOR = { bg: 'var(--accent-dim)', color: 'var(--accent)', bar: '#f59e0b' };

const COMM_RATE = 0.08; // 8% commission

// const fmt2 = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// const fmtN = (v) => Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const fmt2 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
const fmtN = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');

// Helper: get gross amount from seller (sum of bag amounts, or seller.amount)
function getSellerGross(seller) {
  let bags = [];
  try { bags = JSON.parse(seller.bag_data || '[]'); } catch {}
  if (bags.length > 0) {
    return bags.reduce((s, b) => s + (Number(b.amount) || 0), 0);
  }
  return Number(seller.amount) || 0;
}

export default function Summary() {
  const [data,       setData]       = useState(null);
  const [sellers,    setSellers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filterDate, setFilterDate] = useState(todayISO());
  const [showTable,  setShowTable]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterDate ? { date: filterDate } : {};
      const [sumRes, selRes] = await Promise.all([
        API.get('/api/summary', { params }),
        API.get('/api/sellers',  { params }),
      ]);
      setData(sumRes.data.data);
      const raw = selRes.data.data || [];
      raw.sort((a, b) => {
        const na = parseInt(a.serial_number) || 0;
        const nb = parseInt(b.serial_number) || 0;
        return na - nb;
      });
      setSellers(raw);
    } catch (err) {
      toast.error(err.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => { load(); }, [load]);

  const ss = data?.sellerStats  || {};
  const bs = data?.buyerStats   || {};
  const mb = data?.materialBreakdown || [];
  const maxBags = mb.length ? Math.max(...mb.map(m => Number(m.bags) || 0), 1) : 1;

  // Totals using bag-level amounts
  const totalBags       = sellers.reduce((s, r) => s + (parseInt(r.num_bags) || 0), 0);
  const totalWeight     = sellers.reduce((s, r) => s + (Number(r.weight) || 0), 0);
  const totalGross      = sellers.reduce((s, r) => s + getSellerGross(r), 0);
  // const totalCommission = totalGross * COMM_RATE;
  const totalCommission = Math.round(totalGross * COMM_RATE);
  const totalAdvance    = sellers.reduce((s, r) => s + (Number(r.advance_amount) || 0), 0);
  // const totalPayable    = totalGross - totalCommission - totalAdvance;
  const totalPayable    = Math.round(totalGross - totalCommission - totalAdvance);

  const sellerBalance = totalGross - totalCommission - totalAdvance;
  const buyerBalance  = (Number(bs.total_amount) || 0) - (Number(bs.total_advance) || 0);

  // Build flat rows for CSV
  const tableRows = [];
  sellers.forEach((s, si) => {
    let bags = [];
    try { bags = JSON.parse(s.bag_data || '[]'); } catch {}
    const numBags = parseInt(s.num_bags) || 0;
    const gross = getSellerGross(s);
    const comm  = Math.round(gross * COMM_RATE);
    const adv   = Number(s.advance_amount) || 0;
    // const pay   = gross - comm - adv;
    const pay   = Math.round(gross - comm - adv);
    if (bags.length === 0) {
      tableRows.push({ srno: si+1, lot: s.lot_number||'—', name: s.name,
        material: s.material&&s.material!=='GENERAL'?s.material:'—',
        bags: numBags, weight: s.weight, rate: s.rate_fixed||0,
        amount: s.amount||0, gross, comm, adv, pay });
    } else {
      bags.forEach((b, bi) => {
        tableRows.push({ srno: si+1, lot: b.lot||s.lot_number||'—',
          name: bi===0?s.name:'', material: bi===0?(s.material&&s.material!=='GENERAL'?s.material:'—'):'',
          bags: bi===0?numBags:'', weight: Number(b.weight)||0,
          rate: Number(b.rate)||0, amount: Number(b.amount)||0,
          gross: bi===0?gross:'', comm: bi===0?comm:'', adv: bi===0?adv:'', pay: bi===0?pay:'' });
      });
    }
  });

  // ✅ Export CSV
  const exportCSV = () => {
    const headers = ['Sr.No','Name','Material','Bags','Lot No','Weight(kg)','Rate(₹/100kg)','Amount(₹)','Gross(₹)','Commission(₹)','Advance(₹)','Total Payable(₹)'];
    const rows = tableRows.map(r => [r.srno,r.name,r.material,r.bags,r.lot,r.weight,r.rate,r.amount,r.gross,r.comm,r.adv,r.pay]);
    const csv = [headers,...rows].map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url; a.download=`seller-summary-${filterDate||'all'}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  // ✅ Print
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
      ? new Date(filterDate+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
      : 'All Time';
    // const fmtNp = (v) => Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:2});
    // const fmt2p = (v) => Number(v||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});

    const fmtNp = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
    const fmt2p = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');

    let rowsHtml = '';
    sellers.forEach(function(seller, si) {
      let bags = []; try { bags = JSON.parse(seller.bag_data||'[]'); } catch(e) {}
      const numBags = parseInt(seller.num_bags)||0;
      const mat = seller.material&&seller.material!=='GENERAL'?seller.material:'—';
      const gross = getSellerGross(seller);
      const comm  = Math.round(gross * COMM_RATE);
      const adv   = Number(seller.advance_amount)||0;
      const pay   = gross - comm - adv;
      const rowBg = si%2===0?'#ffffff':'#f0f7ff';
      const rc = bags.length>0?bags.length:1;
      const P = 'padding:6px 7px;border:1px solid #b8cef0;font-size:10px;';
      if (bags.length===0) {
        rowsHtml += '<tr style="background:'+rowBg+';border-bottom:2px solid #93c5fd">'+
          '<td style="'+P+'font-weight:800;color:#d97706;text-align:center;vertical-align:middle" rowspan="1">'+(si+1)+'</td>'+
          '<td style="'+P+'font-weight:700;color:#1a1a1a" rowspan="1">'+seller.name+'</td>'+
          '<td style="'+P+'text-align:center;color:#333" rowspan="1">'+mat+'</td>'+
          '<td style="'+P+'text-align:center;font-weight:700" rowspan="1">'+numBags+'</td>'+
          '<td style="'+P+'font-family:monospace;font-weight:700;text-align:center;color:#1e3a5f">'+(seller.lot_number||'—')+'</td>'+
          '<td style="'+P+'text-align:right;font-weight:700;color:#1e40af">'+(seller.weight>0?fmtNp(seller.weight):'—')+'</td>'+
          '<td style="'+P+'text-align:right;color:#999">—</td>'+
          '<td style="'+P+'text-align:right;font-weight:700;color:#1a56db">'+(seller.weight>0?'—':'—')+'</td>'+
          '<td style="'+P+'text-align:right;font-weight:800;color:#1a56db;background:#eff6ff" rowspan="1">'+(gross>0?'₹ '+fmt2p(gross):'—')+'</td>'+
          '<td style="'+P+'text-align:right;font-weight:700;color:#dc2626;background:#fff5f5" rowspan="1">'+(gross>0?'₹ '+fmt2p(comm):'—')+'</td>'+
          '<td style="'+P+'text-align:right;font-weight:700;color:#555;background:#f9fafb" rowspan="1">'+(adv>0?'₹ '+fmt2p(adv):'—')+'</td>'+
          '<td style="'+P+'text-align:right;font-weight:800;color:#166534;background:#f0fdf4" rowspan="1">'+(gross>0?'₹ '+fmt2p(pay):'—')+'</td>'+
          '</tr>';
        return;
      }
      bags.forEach(function(bag, bi) {
        const bdr = bi===bags.length-1?'2px solid #93c5fd':'1px solid #e2e8f0';
        const w=Number(bag.weight)||0; const r=Number(bag.rate)||0; const a=Number(bag.amount)||0;
        rowsHtml += '<tr style="background:'+rowBg+';border-bottom:'+bdr+'">';
        if (bi===0) rowsHtml += '<td rowspan="'+rc+'" style="'+P+'font-weight:800;color:#d97706;text-align:center;vertical-align:middle">'+(si+1)+'</td>';
        if (bi===0) rowsHtml += '<td rowspan="'+rc+'" style="'+P+'font-weight:700;color:#1a1a1a;vertical-align:middle">'+seller.name+'</td>';
        if (bi===0) rowsHtml += '<td rowspan="'+rc+'" style="'+P+'text-align:center;vertical-align:middle">'+mat+'</td>';
        if (bi===0) rowsHtml += '<td rowspan="'+rc+'" style="'+P+'text-align:center;font-weight:700;vertical-align:middle">'+numBags+'</td>';
        rowsHtml += '<td style="'+P+'font-family:monospace;font-weight:700;text-align:center;color:#1e3a5f">'+(bag.lot||seller.lot_number||'—')+'</td>';
        rowsHtml += '<td style="'+P+'text-align:right;font-weight:700;color:#1e40af">'+(w>0?fmtNp(w):'—')+'</td>';
        rowsHtml += '<td style="'+P+'text-align:right;font-weight:700;color:#166534">'+(r>0?fmtNp(r):'—')+'</td>';
        rowsHtml += '<td style="'+P+'text-align:right;font-weight:700;color:#1a56db">'+(a>0?'₹ '+fmt2p(a):'—')+'</td>';
        if (bi===0) rowsHtml += '<td rowspan="'+rc+'" style="'+P+'text-align:right;font-weight:800;color:#1a56db;background:#eff6ff;vertical-align:middle">'+(gross>0?'₹ '+fmt2p(gross):'—')+'</td>';
        if (bi===0) rowsHtml += '<td rowspan="'+rc+'" style="'+P+'text-align:right;font-weight:700;color:#dc2626;background:#fff5f5;vertical-align:middle">'+(gross>0?'₹ '+fmt2p(comm):'—')+'</td>';
        if (bi===0) rowsHtml += '<td rowspan="'+rc+'" style="'+P+'text-align:right;font-weight:700;color:#555;background:#f9fafb;vertical-align:middle">'+(adv>0?'₹ '+fmt2p(adv):'—')+'</td>';
        if (bi===0) rowsHtml += '<td rowspan="'+rc+'" style="'+P+'text-align:right;font-weight:800;color:#166534;background:#f0fdf4;vertical-align:middle">'+(gross>0?'₹ '+fmt2p(pay):'—')+'</td>';
        rowsHtml += '</tr>';
      });
    });

    const html = `<!DOCTYPE html>
<html><head>
  <title>Seller Summary — ${filterDate||'All'}</title>
  <style>
    @page { size: A4 landscape; margin: 6mm 8mm; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Arial,sans-serif; font-size:10px; color:#111; background:#fff; }
    .page-wrap { border:3px solid #1a56db; border-radius:4px; padding:10px 12px; position:relative; min-height:97%; }
    .header { text-align:center; border-bottom:2.5px double #1a56db; padding-bottom:9px; margin-bottom:10px; }
    .prop-row { display:flex; justify-content:space-between; align-items:center; font-size:9px; color:#444; margin-bottom:5px; }
    .logo-circle { width:34px; height:34px; border-radius:50%; border:2.5px solid #1a56db; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:11px; color:#1a56db; background:#eff6ff; flex-shrink:0; }
    .firm-name { font-size:18px; font-weight:900; color:#1a1a1a; }
    .firm-badge { display:inline-block; background:#1a56db; color:#fff; font-size:8px; font-weight:700; letter-spacing:1.2px; padding:2px 12px; border-radius:2px; margin:2px 0 1px; }
    .firm-type { font-size:9px; font-weight:700; color:#333; }
    .firm-addr { font-size:8px; color:#666; }
    .date-line { display:inline-block; background:#1a56db; color:#fff; font-size:10px; font-weight:700; padding:2px 16px; border-radius:2px; margin-top:5px; }
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
      <span>Prop. Praveen V. Heggani<br>Cell : 9611635183</span>
      <div class="logo-circle">PH</div>
      <span>Prop. Pramod V. Heggani<br>Cell : 9448349836</span>
    </div>
    <div class="firm-name">Mr. Praveen Heggani</div>
    <div><span class="firm-badge">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
    <div class="firm-type">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
    <div class="firm-addr">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
    <div><span class="date-line">SELLER SUMMARY — ${dateLabel}</span></div>
  </div>
  <table>
    <thead><tr>
      <th style="width:36px;text-align:center">Sr</th>
      <th style="width:100px">Name</th>
      <th style="width:70px;text-align:center">Material</th>
      <th style="width:38px;text-align:center">Bags</th>
      <th style="width:60px;text-align:center">Lot No</th>
      <th style="width:72px;text-align:right">Weight(kg)</th>
      <th style="width:80px;text-align:right">Rate(/100kg)</th>
      <th style="width:85px;text-align:right">Amount(₹)</th>
      <th style="width:90px;text-align:right;background:#1e3a8a">Gross Amt(₹)</th>
      <th style="width:85px;text-align:right;background:#7f1d1d">Comm 8%(₹)</th>
      <th style="width:80px;text-align:right">Advance(₹)</th>
      <th style="text-align:right;background:#14532d">Total Payable(₹)</th>
    </tr></thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot><tr>
      <td colspan="4" style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af">TOTALS · ${sellers.length} sellers</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af;text-align:center">${totalBags}</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af;text-align:right">${fmtN(totalWeight)} kg</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px"></td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px"></td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1a56db;text-align:right;font-size:12px">₹ ${fmt2(totalGross)}</td>
      <td style="border:1px solid #b8cef0;background:#fee2e2;padding:7px;font-weight:800;color:#dc2626;text-align:right">₹ ${fmt2(totalCommission)}</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af;text-align:right">₹ ${fmt2(totalAdvance)}</td>
      <td style="border:1px solid #b8cef0;background:#dcfce7;padding:7px;font-weight:800;color:#166534;text-align:right;font-size:13px">₹ ${fmt2(totalPayable)}</td>
    </tr></tfoot>
  </table>
  <div class="summary-box">
    <div class="sum-item"><div class="sum-label">Sellers</div><div class="sum-val">${sellers.length}</div></div>
    <div class="sum-item"><div class="sum-label">Total Bags</div><div class="sum-val">${totalBags}</div></div>
    <div class="sum-item"><div class="sum-label">Total Weight</div><div class="sum-val">${fmtN(totalWeight)} kg</div></div>
    <div class="sum-item"><div class="sum-label">Gross Amount</div><div class="sum-val">₹ ${fmt2(totalGross)}</div></div>
    <div class="sum-item"><div class="sum-label">Commission (8%)</div><div class="sum-val" style="color:#dc2626">₹ ${fmt2(totalCommission)}</div></div>
    <div class="sum-item"><div class="sum-label">Advance Paid</div><div class="sum-val" style="color:#555">₹ ${fmt2(totalAdvance)}</div></div>
    <div class="sum-item"><div class="sum-label">Total Payable</div><div class="sum-val" style="color:#166534">₹ ${fmt2(totalPayable)}</div></div>
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
          <div className="page-title">Summary Report</div>
          <div className="page-subtitle">
            {filterDate
              ? `Market overview for ${new Date(filterDate+'T00:00:00').toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}`
              : 'All-time market overview'}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <input className="form-input" type="date" value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            style={{ textTransform:'none', width:170 }} />
          <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate(todayISO())}>Today</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate('')}>All Time</button>
          <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
            <RefreshCw size={14}/> Refresh
          </button>
          {tableRows.length > 0 && (
            <>
              <button className="btn btn-green btn-sm" onClick={exportCSV}>
                <Download size={14}/> CSV
              </button>
              <button className="btn btn-primary btn-sm" onClick={printTable}>
                <Printer size={14}/> Print List
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:80, color:'var(--text-muted)' }}>
          <div style={{ fontSize:40, marginBottom:16 }}>📊</div>
          <div>Loading summary...</div>
        </div>
      ) : (
        <>
          {/* Seller Stats */}
          <div style={{ marginBottom:10, fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
            <Users size={12}/> Seller Summary
          </div>
          <div className="stats-grid" style={{ marginBottom:24 }}>
            {[
              { label:'Total Sellers', value: ss.total_sellers||0,           color:'amber', icon:<Users size={20}/> },
              { label:'Total Bags',    value: fmtNum(totalBags, 0),           color:'green', icon:<Package size={20}/> },
              { label:'Total Weight',  value: fmtNum(totalWeight)+' kg',      color:'blue',  icon:<TrendingUp size={20}/> },
              { label:'Gross Amount',  value:'₹ '+fmtINR(totalGross),         color:'purple',icon:<span style={{fontWeight:800,fontSize:18}}>₹</span> },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className={`stat-icon ${s.color}`} style={s.color==='purple'?{background:'rgba(139,92,246,0.15)',color:'var(--purple)',fontWeight:800,fontSize:18}:{}}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Buyer Stats */}
          <div style={{ marginBottom:10, fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
            <ShoppingCart size={12}/> Buyer Summary
          </div>
          <div className="stats-grid" style={{ marginBottom:24 }}>
            {[
              { label:'Total Buyers',  value: ss.total_buyers||0,            color:'amber', icon:<ShoppingCart size={20}/> },
              { label:'Total Bags',    value: fmtNum(bs.total_bags, 0),       color:'green', icon:<Package size={20}/> },
              { label:'Total Weight',  value: fmtNum(bs.total_weight)+' kg',  color:'blue',  icon:<TrendingUp size={20}/> },
              { label:'Advance Recd.', value:'₹ '+fmtINR(bs.total_advance),  color:'purple',icon:<span style={{fontWeight:800,fontSize:18}}>₹</span> },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className={`stat-icon ${s.color}`} style={s.color==='purple'?{background:'rgba(139,92,246,0.15)',color:'var(--purple)',fontWeight:800,fontSize:18}:{}}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* SELLER DETAIL TABLE */}
          <div className="card" style={{ marginBottom:24, width:'100%' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div className="card-title" style={{ margin:0 }}>
                📋 Seller-wise Detail &nbsp;
                <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:400 }}>
                  ({sellers.length} sellers · sorted by serial no.)
                </span>
              </div>
              <button onClick={() => setShowTable(t => !t)} className="btn btn-secondary btn-sm">
                {showTable ? 'Hide' : 'Show'} Table
              </button>
            </div>

            {showTable && (
              <div style={{ width:'100%', border:'1px solid var(--border)', borderRadius:10, overflow:'auto' }}>
                {sellers.length === 0 ? (
                  <div className="empty-state" style={{ padding:40 }}>
                    <div className="empty-state-icon">📋</div>
                    <h3>No seller data for this period</h3>
                  </div>
                ) : (
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, tableLayout:'fixed' }}>
                    <colgroup>
                      <col style={{ width:'46px' }}/>
                      <col style={{ width:'120px' }}/>
                      <col style={{ width:'100px' }}/>
                      <col style={{ width:'50px' }}/>
                      <col style={{ width:'70px' }}/>
                      <col style={{ width:'90px' }}/>
                      <col style={{ width:'100px' }}/>
                      <col style={{ width:'105px' }}/>
                      <col style={{ width:'110px' }}/>
                      <col style={{ width:'105px' }}/>
                      <col style={{ width:'95px' }}/>
                      <col style={{ width:'115px' }}/>
                    </colgroup>
                    <thead>
                      <tr style={{ background:'var(--bg-panel)' }}>
                        {[
                          { label:'Sr',             align:'center' },
                          { label:'Name',           align:'left'   },
                          { label:'Material',       align:'center' },
                          { label:'Bags',           align:'center' },
                          { label:'Lot No',         align:'center' },
                          { label:'Weight (kg)',    align:'right'  },
                          { label:'Rate (/100kg)',  align:'right'  },
                          { label:'Amount (₹)',     align:'right'  },
                          { label:'Gross Amt (₹)',  align:'right'  },
                          { label:'Commission (₹)',    align:'right'  },
                          { label:'Advance (₹)',    align:'right'  },
                          { label:'Total Payable',  align:'right'  },
                        ].map(h => (
                          <th key={h.label} style={{
                            padding:'10px 8px', textAlign:h.align,
                            fontSize:10, fontWeight:700, letterSpacing:0.8, textTransform:'uppercase',
                            color:'var(--text-muted)',
                            borderBottom:'2px solid var(--accent)',
                            borderRight:'1px solid var(--border)',
                          }}>{h.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.map((seller, si) => {
                        let bags = [];
                        try { bags = JSON.parse(seller.bag_data || '[]'); } catch {}
                        const numBags = parseInt(seller.num_bags) || 0;
                        const mat = seller.material && seller.material !== 'GENERAL' ? seller.material : '—';
                        const rc = bags.length > 0 ? bags.length : 1;
                        const rowBg = si % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-panel)';
                        const cell = { borderRight:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'9px 8px', verticalAlign:'middle' };
                        const merged = { ...cell, background:rowBg, borderBottom:'2px solid var(--accent)' };
                        const badge = mat==='TAMARIND'?'badge-amber':mat==='GINGER'?'badge-green':mat==='ONION'?'badge-blue':mat==='LEMONS'?'badge-purple':'badge-amber';
                        const gross = getSellerGross(seller);
                        const comm  = Math.round(gross * COMM_RATE);
                        const adv   = Number(seller.advance_amount) || 0;
                        const pay   = gross - comm - adv;

                        if (bags.length === 0) {
                          const lb = '2px solid var(--accent)';
                          return (
                            <tr key={seller.id} style={{ background:rowBg }}>
                              <td style={{ ...cell, fontWeight:800, color:'var(--accent)', textAlign:'center', fontSize:14, borderBottom:lb }}>{si+1}</td>
                              <td style={{ ...cell, fontWeight:700, color:'var(--text-primary)', borderBottom:lb }}>{seller.name}</td>
                              <td style={{ ...cell, textAlign:'center', borderBottom:lb }}>{mat!=='—'?<span className={'badge '+badge}>{mat}</span>:<span style={{color:'var(--text-muted)'}}>—</span>}</td>
                              <td style={{ ...cell, textAlign:'center', fontWeight:700, borderBottom:lb }}>{numBags}</td>
                              <td style={{ ...cell, fontFamily:'monospace', fontWeight:700, textAlign:'center', borderBottom:lb }}>{seller.lot_number||'—'}</td>
                              <td style={{ ...cell, textAlign:'right', fontWeight:700, color:'var(--blue)', borderBottom:lb }}>{seller.weight>0?fmtNum(seller.weight):'—'}</td>
                              <td style={{ ...cell, textAlign:'right', color:'var(--text-muted)', borderBottom:lb }}>—</td>
                              <td style={{ ...cell, textAlign:'right', color:'var(--text-muted)', borderBottom:lb }}>—</td>
                              <td style={{ ...cell, textAlign:'right', fontWeight:800, color:'var(--accent)', borderBottom:lb, background:'rgba(245,158,11,0.06)' }}>{gross>0?'₹ '+fmtINR(gross):'—'}</td>
                              <td style={{ ...cell, textAlign:'right', fontWeight:700, color:'#dc2626', borderBottom:lb, background:'rgba(220,38,38,0.04)' }}>{gross>0?'₹ '+fmtINR(comm):'—'}</td>
                              <td style={{ ...cell, textAlign:'right', fontWeight:700, color:'var(--text-secondary)', borderBottom:lb }}>{adv>0?'₹ '+fmtINR(adv):'—'}</td>
                              <td style={{ ...cell, textAlign:'right', fontWeight:800, color:'var(--green)', borderBottom:lb, background:'rgba(16,185,129,0.06)' }}>{gross>0?'₹ '+fmtINR(pay):'—'}</td>
                            </tr>
                          );
                        }

                        return bags.map((bag, bi) => {
                          const isLast = bi === bags.length - 1;
                          const bdr = isLast ? '2px solid var(--accent)' : '1px solid var(--border)';
                          const td = { ...cell, borderBottom: bdr };
                          return (
                            <tr key={seller.id+'-'+bi} style={{ background:rowBg }}>
                              {bi===0 && <td rowSpan={rc} style={{ ...merged, fontWeight:800, color:'var(--accent)', textAlign:'center', fontSize:14 }}>{si+1}</td>}
                              {bi===0 && <td rowSpan={rc} style={{ ...merged, fontWeight:700, color:'var(--text-primary)' }}>{seller.name}</td>}
                              {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'center' }}>{mat!=='—'?<span className={'badge '+badge}>{mat}</span>:<span style={{color:'var(--text-muted)'}}>—</span>}</td>}
                              {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'center', fontWeight:800, fontSize:14 }}>{numBags}</td>}
                              <td style={{ ...td, fontFamily:'monospace', fontWeight:700, color:'var(--blue)', textAlign:'center', fontSize:12 }}>{bag.lot||seller.lot_number||'—'}</td>
                              <td style={{ ...td, textAlign:'right', fontWeight:700, color:Number(bag.weight)>0?'var(--blue)':'var(--text-muted)' }}>{Number(bag.weight)>0?fmtNum(bag.weight):'—'}</td>
                              <td style={{ ...td, textAlign:'right', fontWeight:700, color:Number(bag.rate)>0?'var(--green)':'var(--text-muted)' }}>{Number(bag.rate)>0?fmtNum(bag.rate):'—'}</td>
                              <td style={{ ...td, textAlign:'right', fontWeight:800, color:Number(bag.amount)>0?'var(--accent)':'var(--text-muted)' }}>{Number(bag.amount)>0?'₹ '+fmtINR(bag.amount):'—'}</td>
                              {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'right', fontWeight:800, color:'var(--accent)', background:'rgba(245,158,11,0.06)' }}>{gross>0?'₹ '+fmtINR(gross):'—'}</td>}
                              {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'right', fontWeight:700, color:'#dc2626', background:'rgba(220,38,38,0.04)' }}>{gross>0?'₹ '+fmtINR(comm):'—'}</td>}
                              {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'right', fontWeight:700, color:'var(--text-secondary)' }}>{adv>0?'₹ '+fmtINR(adv):'—'}</td>}
                              {bi===0 && <td rowSpan={rc} style={{ ...merged, textAlign:'right', fontWeight:800, color:'var(--green)', background:'rgba(16,185,129,0.06)' }}>{gross>0?'₹ '+fmtINR(pay):'—'}</td>}
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--accent)' }}>
                        <td colSpan={4} style={{ padding:'11px 8px', fontWeight:700, color:'var(--text-secondary)', fontSize:12, borderRight:'1px solid var(--border)' }}>
                          TOTALS — {sellers.length} sellers
                        </td>
                        <td style={{ borderRight:'1px solid var(--border)' }}/>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'var(--blue)', fontSize:13, borderRight:'1px solid var(--border)' }}>
                          {fmtNum(totalWeight)} kg
                        </td>
                        <td style={{ borderRight:'1px solid var(--border)' }}/>
                        <td style={{ borderRight:'1px solid var(--border)' }}/>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'var(--accent)', fontSize:13, borderRight:'1px solid var(--border)', background:'rgba(245,158,11,0.06)' }}>
                          ₹ {fmtINR(totalGross)}
                        </td>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'#dc2626', fontSize:13, borderRight:'1px solid var(--border)', background:'rgba(220,38,38,0.04)' }}>
                          ₹ {fmtINR(totalCommission)}
                        </td>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'var(--text-secondary)', fontSize:13, borderRight:'1px solid var(--border)' }}>
                          ₹ {fmtINR(totalAdvance)}
                        </td>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'var(--green)', fontSize:14, borderRight:'1px solid var(--border)', background:'rgba(16,185,129,0.06)' }}>
                          ₹ {fmtINR(totalPayable)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Material Breakdown + Financial */}
          <div className="two-col">
            <div className="card">
              <div className="card-title"><Package size={16} style={{ color:'var(--accent)' }}/> Material Breakdown (Sellers)</div>
              {mb.length > 0 ? (
                <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                  {mb.map(m => {
                    const mc  = MATERIAL_COLORS[m.material] || DEFAULT_COLOR;
                    const pct = maxBags > 0 ? ((Number(m.bags)||0) / maxBags) * 100 : 0;
                    return (
                      <div key={m.material}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6, fontSize:13 }}>
                          <span style={{ fontWeight:700, color:mc.color, background:mc.bg, padding:'2px 12px', borderRadius:20, border:`1px solid ${mc.bar}44` }}>{m.material}</span>
                          <span style={{ color:'var(--text-secondary)', fontSize:12 }}>{m.count} sellers · {m.bags} bags · {fmtNum(m.weight)} kg</span>
                        </div>
                        <div style={{ background:'var(--bg-panel)', borderRadius:4, height:8, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:mc.bar, borderRadius:4, transition:'width 0.5s ease', minWidth:pct>0?6:0 }}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state" style={{ padding:32 }}>
                  <div className="empty-state-icon">📊</div>
                  <h3>No data for this period</h3>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-title"><TrendingUp size={16} style={{ color:'var(--green)' }}/> Financial Summary</div>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>👨‍🌾 Seller Financials</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
                {[
                  { label:'Gross Amount',    value:'₹ '+fmtINR(totalGross),        color:'var(--accent)' },
                  { label:'Commission (8%)', value:'₹ '+fmtINR(totalCommission),   color:'#dc2626' },
                  { label:'Advance Paid',    value:'₹ '+fmtINR(totalAdvance),       color:'var(--text-secondary)' },
                  { label:'Total Payable',   value:'₹ '+fmtINR(totalPayable),      color:'var(--green)' },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg-panel)', borderRadius:8, border:'1px solid var(--border)' }}>
                    <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{row.label}</span>
                    <span style={{ fontSize:14, fontWeight:800, fontFamily:'var(--font-display)', color:row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop:'1px dashed var(--border)', marginBottom:16 }}/>

              <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:10 }}>🛒 Buyer Financials</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { label:'Gross Amount',     value:'₹ '+fmtINR(bs.total_amount),  color:'var(--blue)' },
                  { label:'Advance Received', value:'₹ '+fmtINR(bs.total_advance), color:'var(--text-secondary)' },
                  { label:'Balance Payable',  value:'₹ '+fmtINR(buyerBalance),     color: buyerBalance>0?'var(--red)':'var(--green)' },
                ].map(row => (
                  <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--bg-panel)', borderRadius:8, border:'1px solid var(--border)' }}>
                    <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{row.label}</span>
                    <span style={{ fontSize:14, fontWeight:800, fontFamily:'var(--font-display)', color:row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
