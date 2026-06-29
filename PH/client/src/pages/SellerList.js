// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import toast from 'react-hot-toast';
// // import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package } from 'lucide-react';
// // import { getSellers, updateSeller, deleteSeller as apiDeleteSeller } from '../api';
// // import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// // import ConfirmDialog from '../ConfirmDialog';

// // // ─── Helper: parse bag_data safely ───────────────────────────
// // function parseBagData(seller) {
// //   const numBags  = parseInt(seller.num_bags) || 0;
// //   const lotLabel = seller.lot_number || (seller.serial_number + '/' + numBags);
// //   let parsed = [];

// //   try {
// //     const raw = seller.bag_data;
// //     if (raw && raw !== '[]' && raw !== '' && raw !== 'null') {
// //       parsed = JSON.parse(raw);
// //     }
// //   } catch (e) {
// //     console.warn('bag_data parse error:', e, 'raw:', seller.bag_data);
// //     parsed = [];
// //   }

// //   console.log('[parseBagData] seller id:', seller.id, 'num_bags:', numBags, 'parsed:', parsed);

// //   const rows = [];
// //   for (let i = 0; i < numBags; i++) {
// //     const saved = parsed[i];
// //     const w = saved ? Number(saved.weight) : 0;
// //     const r = saved ? Number(saved.rate)   : 0;
// //     const a = saved ? Number(saved.amount) : 0;
// //     rows.push({
// //       lot:    lotLabel,
// //       weight: w > 0 ? String(w) : '',
// //       rate:   r > 0 ? String(r) : '',
// //       amount: a > 0 ? String(a) : '',
// //     });
// //   }

// //   console.log('[parseBagData] final rows:', rows);
// //   return rows;

// // }

// // // Check if all weights in bag_data are zero/missing
// // function hasNoWeights(seller) {
// //   try {
// //     const parsed = JSON.parse(seller.bag_data || '[]');
// //     return parsed.length === 0 || parsed.every(b => !b.weight || Number(b.weight) === 0);
// //   } catch { return true; }
// // }

// // // ─── Bill Modal ───────────────────────────────────────────────
// // function BillModal({ seller, onClose }) {
// //   const printRef = useRef();

// //   const handlePrint = () => {
// //     const content = printRef.current.innerHTML;
// //     const w = window.open('', '_blank', 'width=850,height=700');
// //     w.document.write(`<!DOCTYPE html><html><head><title>Seller Bill — ${seller.name}</title>
// //     <style>
// //       * { box-sizing:border-box; margin:0; padding:0; }
// //       body { font-family:Arial,sans-serif; padding:40px; color:#111; font-size:13px; }
// //       .hdr { text-align:center; border-bottom:2px solid #222; padding-bottom:16px; margin-bottom:20px; }
// //       table { width:100%; border-collapse:collapse; margin-bottom:14px; }
// //       th,td { border:1px solid #ddd; padding:9px 13px; text-align:left; }
// //       th { background:#f5f5f5; font-weight:700; }
// //       tr:nth-child(even) td { background:#fafafa; }
// //       .foot { margin-top:32px; display:flex; justify-content:space-between; font-size:11px; color:#888; }
// //     </style></head><body>${content}
// //     <script>window.onload=function(){window.print();}<\/script></body></html>`);
// //     w.document.close();
// //   };

// //   const bags   = parseBagData(seller);
// //   const balance = (seller.amount || 0) - (seller.advance_amount || 0);

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth:720 }} onClick={e => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <div className="modal-title">🧾 Seller Bill</div>
// //           <div style={{ display:'flex', gap:8 }}>
// //             <button className="btn btn-primary btn-sm" onClick={handlePrint}><Printer size={14} /> Print / PDF</button>
// //             <button className="modal-close" onClick={onClose}><X size={20} /></button>
// //           </div>
// //         </div>
// //         <div ref={printRef}>
// //           <div className="hdr" style={{ textAlign:'center', borderBottom:'2px solid var(--border)', paddingBottom:16, marginBottom:20 }}>
// //             <div style={{ fontSize:24, fontWeight:800, fontFamily:'var(--font-display)', color:'var(--text-primary)' }}>🌾 AGRITRADER</div>
// //             <div style={{ color:'var(--text-muted)', fontSize:12, marginTop:4 }}>Agricultural Market Management System</div>
// //             <span className="badge badge-amber" style={{ marginTop:8, display:'inline-block' }}>SELLER RECEIPT</span>
// //           </div>
// //           <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, marginBottom:16 }}>
// //             <tbody>
// //               {[
// //                 ['Serial No.',  seller.serial_number],
// //                 ['Seller Name', seller.name],
// //                 ['Mobile',      seller.mobile && seller.mobile !== '0000000000' ? seller.mobile : '—'],
// //                 ['Material',    seller.material && seller.material !== 'GENERAL' ? seller.material : '—'],
// //                 ['Lot Number',  seller.lot_number],
// //                 ['Total Bags',  seller.num_bags],
// //                 ['Entry Date',  fmtDate(seller.entry_date)],
// //               ].map(([label, val], i) => (
// //                 <tr key={label} style={{ background: i%2===0 ? 'var(--bg-panel)':'transparent', borderBottom:'1px solid var(--border)' }}>
// //                   <td style={{ padding:'9px 14px', fontWeight:600, color:'var(--text-secondary)', width:'38%' }}>{label}</td>
// //                   <td style={{ padding:'9px 14px', color:'var(--text-primary)' }}>{val}</td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //           {bags.length > 0 && (
// //             <>
// //               <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--text-secondary)', marginBottom:8, letterSpacing:1, textTransform:'uppercase' }}>Bag-wise Breakdown</div>
// //               <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, marginBottom:16 }}>
// //                 <thead>
// //                   <tr style={{ background:'var(--bg-panel)' }}>
// //                     {['Bag #','Lot No','Weight (kg)','Rate (₹/100kg)','Amount (₹)'].map(h => (
// //                       <th key={h} style={{ padding:'9px 14px', color:'var(--text-muted)', fontWeight:700 }}>{h}</th>
// //                     ))}
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {bags.map((b, i) => (
// //                     <tr key={i} style={{ background: i%2===0 ? 'var(--bg-panel)':'transparent', borderBottom:'1px solid var(--border)' }}>
// //                       <td style={{ padding:'9px 14px', fontWeight:700, color:'var(--accent)' }}>{i+1}</td>
// //                       <td style={{ padding:'9px 14px', fontFamily:'monospace' }}>{b.lot}</td>
// //                       <td style={{ padding:'9px 14px' }}>{b.weight || '—'}</td>
// //                       <td style={{ padding:'9px 14px', color: b.rate ? 'var(--green)':'var(--text-muted)' }}>{b.rate ? `₹${fmtINR(b.rate)}` : '—'}</td>
// //                       <td style={{ padding:'9px 14px', fontWeight:700, color:'var(--accent)' }}>{b.amount ? `₹${fmtINR(b.amount)}` : '—'}</td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //                 <tfoot>
// //                   <tr style={{ background:'var(--accent-dim)', borderTop:'2px solid var(--border)' }}>
// //                     <td colSpan={2} style={{ padding:'11px 14px', fontWeight:700, color:'var(--text-secondary)' }}>TOTAL</td>
// //                     <td style={{ padding:'11px 14px', fontWeight:800 }}>{fmtNum(seller.weight)} kg</td>
// //                     <td />
// //                     <td style={{ padding:'11px 14px', fontWeight:800, color:'var(--accent)', fontSize:15 }}>₹ {fmtINR(seller.amount)}</td>
// //                   </tr>
// //                 </tfoot>
// //               </table>
// //             </>
// //           )}
// //           <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
// //             <tbody>
// //               <tr style={{ background:'var(--accent-dim)', borderBottom:'1px solid var(--border)' }}>
// //                 <td style={{ padding:'11px 14px', fontWeight:700, color:'var(--accent)' }}>Gross Amount</td>
// //                 <td style={{ padding:'11px 14px', fontWeight:800, color:'var(--accent)', fontSize:16 }}>₹ {fmtINR(seller.amount)}</td>
// //               </tr>
// //               <tr style={{ borderBottom:'1px solid var(--border)' }}>
// //                 <td style={{ padding:'10px 14px', fontWeight:600, color:'var(--text-secondary)' }}>Advance Paid</td>
// //                 <td style={{ padding:'10px 14px' }}>₹ {fmtINR(seller.advance_amount)}</td>
// //               </tr>
// //               <tr style={{ background: balance>0 ? 'var(--red-dim)':'var(--green-dim)' }}>
// //                 <td style={{ padding:'11px 14px', fontWeight:700, color: balance>0 ? 'var(--red)':'var(--green)' }}>Balance Due</td>
// //                 <td style={{ padding:'11px 14px', fontWeight:800, color: balance>0 ? 'var(--red)':'var(--green)', fontSize:16 }}>
// //                   ₹ {fmtINR(balance)} {balance<=0 && '✓ PAID'}
// //                 </td>
// //               </tr>
// //             </tbody>
// //           </table>
// //           <div style={{ marginTop:28, display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)' }}>
// //             <span>Printed: {new Date().toLocaleString('en-IN')}</span>
// //             <span style={{ borderTop:'1px solid var(--border)', paddingTop:6, width:140, textAlign:'center' }}>Authorised Signature</span>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Edit Modal ───────────────────────────────────────────────
// // function EditModal({ seller, onClose, onSave }) {
// //   const numBags  = parseInt(seller.num_bags) || 0;
// //   const lotLabel = seller.lot_number || `${seller.serial_number}/${numBags}`;

// //   // ✅ Synchronous lazy initializer — runs once, reads bag_data directly
// //   const [bags, setBags]               = useState(() => parseBagData(seller));
// //   const [numBagsEdit, setNumBagsEdit] = useState(String(numBags));
// //   const [advance,     setAdvance]     = useState(String(seller.advance_amount || ''));
// //   const [loading,     setLoading]     = useState(false);
// //   const [noWeights,   setNoWeights]   = useState(() => hasNoWeights(seller));
// //   const [repairWeights, setRepairWeights] = useState(
// //     () => Array.from({ length: parseInt(seller.num_bags)||0 }, () => '')
// //   );

// //   const applyRepairWeights = () => {
// //     const allFilled = repairWeights.every(w => w && parseFloat(w) > 0);
// //     if (!allFilled) { toast.error('Enter all bag weights to fix'); return; }
// //     const fixed = repairWeights.map(w => ({
// //       lot:    lotLabel,
// //       weight: String(parseFloat(w)),
// //       rate:   '',
// //       amount: '',
// //     }));
// //     setBags(fixed);
// //     setNoWeights(false);
// //     toast.success('Weights applied! Now enter rates and save.');
// //   };

// //   // Only resize when user explicitly changes num bags field
// //   const handleNumBagsChange = (val) => {
// //     setNumBagsEdit(val);
// //     const n = parseInt(val) || 0;
// //     setBags(prev => {
// //       const rows = [];
// //       for (let i = 0; i < n; i++) {
// //         rows.push(prev[i] || { lot: lotLabel, weight: '', rate: '', amount: '' });
// //       }
// //       return rows;
// //     });
// //   };

// //   // Update one field in one bag row; auto-calc amount
// //   const updateBag = (i, field, value) => {
// //     setBags(prev => prev.map((bag, idx) => {
// //       if (idx !== i) return bag;
// //       const updated = { ...bag, [field]: value };
// //       if (field === 'weight' || field === 'rate') {
// //         const w = parseFloat(field === 'weight' ? value : bag.weight) || 0;
// //         const r = parseFloat(field === 'rate'   ? value : bag.rate)   || 0;
// //         updated.amount = (w > 0 && r > 0) ? ((w * r) / 100).toFixed(2) : '';
// //       }
// //       return updated;
// //     }));
// //   };

// //   const totalWeight    = bags.reduce((s, b) => s + (parseFloat(b.weight) || 0), 0);
// //   const totalAmount    = bags.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
// //   const ratesSetCount  = bags.filter(b => parseFloat(b.rate) > 0).length;
// //   const weightsSetCount = bags.filter(b => parseFloat(b.weight) > 0).length;

// //   const save = async () => {
// //     if (bags.some(b => !b.weight || parseFloat(b.weight) <= 0)) {
// //       toast.error('Enter weight for all bags');
// //       return;
// //     }
// //     setLoading(true);
// //     try {
// //       const bagDataToSave = bags.map(b => ({
// //         lot:    lotLabel,
// //         weight: parseFloat(b.weight) || 0,
// //         rate:   parseFloat(b.rate)   || 0,
// //         amount: parseFloat(b.amount) || 0,
// //       }));

// //       await updateSeller(seller.id, {
// //         num_bags:       parseInt(numBagsEdit),
// //         weight:         totalWeight,
// //         amount:         totalAmount,
// //         advance_amount: parseFloat(advance) || 0,
// //         rate_fixed:     totalWeight > 0 && totalAmount > 0
// //                           ? parseFloat((totalAmount / totalWeight * 100).toFixed(2)) : 0,
// //         bag_data:       JSON.stringify(bagDataToSave),
// //       });

// //       toast.success('Seller updated!');
// //       onSave();
// //       onClose();
// //     } catch (err) {
// //       toast.error(err.message || 'Failed to update');
// //     } finally { setLoading(false); }
// //   };

// //   const inputStyle = (val, focusColor) => ({
// //     background:  val ? `${focusColor}11` : 'var(--bg-panel)',
// //     border:      `1px solid ${val ? `${focusColor}66` : 'var(--border-light)'}`,
// //     borderRadius: 7, padding: '8px 12px',
// //     color:       val ? focusColor : 'var(--text-muted)',
// //     fontFamily:  'var(--font-body)', fontSize: 13, fontWeight: 700,
// //     outline:     'none', width: '100%',
// //   });

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth:840, width:'95%' }} onClick={e => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
// //           <button className="modal-close" onClick={onClose}><X size={20} /></button>
// //         </div>

// //         {/* Info strip */}
// //         <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
// //           {[
// //             { label:'Serial No', value: seller.serial_number },
// //             { label:'Lot No',    value: lotLabel },
// //             { label:'Material',  value: seller.material && seller.material !== 'GENERAL' ? seller.material : '—' },
// //             { label:'Date',      value: fmtDate(seller.entry_date) },
// //           ].map(item => (
// //             <div key={item.label} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', fontSize:12 }}>
// //               <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{item.label}</div>
// //               <div style={{ fontWeight:700, color:'var(--text-primary)' }}>{item.value}</div>
// //             </div>
// //           ))}
// //         </div>

// //         {/* Top editable fields */}
// //         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
// //           <div className="form-group">
// //             <label className="form-label">Number of Bags</label>
// //             <input className="form-input" type="number" value={numBagsEdit}
// //               onChange={e => handleNumBagsChange(e.target.value)}
// //               min="1" max="100" style={{ textTransform:'none' }} />
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Advance Amount (₹)</label>
// //             <input className="form-input" type="number" value={advance}
// //               onChange={e => setAdvance(e.target.value)}
// //               placeholder="0.00" step="0.01" style={{ textTransform:'none' }} />
// //           </div>
// //         </div>

// //         {/* ── Weights missing banner ── */}
// //         {noWeights && bags.length > 0 && (
// //           <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:10, padding:'14px 18px', marginBottom:16 }}>
// //             <div style={{ fontWeight:700, color:'var(--accent)', fontSize:13, marginBottom:10 }}>
// //               ⚠️ This entry was saved before the weight-tracking update. Enter weights below to fix:
// //             </div>
// //             <div style={{ display:'grid', gridTemplateColumns: repairWeights.map(()=>'1fr').join(' '), gap:8, marginBottom:10 }}>
// //               {repairWeights.map((w, i) => (
// //                 <div key={i} style={{ textAlign:'center' }}>
// //                   <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:4, fontWeight:700 }}>BAG {i+1}</div>
// //                   <input
// //                     type="number" value={w}
// //                     onChange={e => setRepairWeights(prev => prev.map((v,j) => j===i ? e.target.value : v))}
// //                     placeholder="kg"
// //                     step="0.01" min="0.01"
// //                     onWheel={e => e.target.blur()}
// //                     style={{ background:'var(--bg-panel)', border:'1px solid var(--accent)', borderRadius:7, padding:'8px 10px', color:'var(--text-primary)', fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, outline:'none', width:'100%', textAlign:'center' }}
// //                   />
// //                 </div>
// //               ))}
// //             </div>
// //             <button
// //               onClick={applyRepairWeights}
// //               style={{ background:'var(--accent)', color:'#000', border:'none', borderRadius:8, padding:'9px 20px', fontWeight:700, fontSize:13, cursor:'pointer' }}
// //             >
// //               ✓ Apply Weights
// //             </button>
// //           </div>
// //         )}

// //         {/* Per-bag table */}
// //         {bags.length > 0 && (
// //           <div>
// //             {/* Section header */}
// //             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
// //               <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                 <Package size={16} style={{ color:'var(--accent)' }} />
// //                 <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>Bag-wise Details</span>
// //                 <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:20, padding:'2px 10px', fontWeight:700 }}>
// //                   Lot: {lotLabel}
// //                 </span>
// //                 <span style={{ fontSize:11, color: weightsSetCount === bags.length ? 'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
// //                   {weightsSetCount}/{bags.length} weights
// //                 </span>
// //               </div>
// //               <div style={{ fontSize:12, color:'var(--text-muted)' }}>
// //                 Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong>
// //               </div>
// //             </div>

// //             {/* Column headers */}
// //             <div style={{ display:'grid', gridTemplateColumns:'36px 70px 1fr 1fr 130px', gap:10, padding:'8px 14px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
// //               {['#','Lot No','Weight (kg)','Rate (₹/100kg)','Amount (₹)'].map(h => (
// //                 <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
// //               ))}
// //             </div>

// //             {/* Bag rows */}
// //             <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:340, overflowY:'auto' }}>
// //               {bags.map((bag, i) => (
// //                 <div key={i} style={{ display:'grid', gridTemplateColumns:'36px 70px 1fr 1fr 130px', gap:10, padding:'10px 14px', background: i%2===0 ? 'var(--bg-card)':'var(--bg-panel)', borderBottom: i<bags.length-1 ? '1px solid var(--border)':'none', alignItems:'center' }}>
// //                   {/* # */}
// //                   <div style={{ width:26, height:26, borderRadius:6, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>
// //                     {i+1}
// //                   </div>

// //                   {/* Lot */}
// //                   <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lotLabel}</div>

// //                   {/* Weight — pre-filled from registration */}
// //                   <input
// //                     type="number" value={bag.weight}
// //                     onChange={e => updateBag(i, 'weight', e.target.value)}
// //                     placeholder="Enter weight"
// //                     step="0.01" min="0.01"
// //                     onWheel={e => e.target.blur()}
// //                     style={inputStyle(bag.weight, '#3b82f6')}
// //                     onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'; }}
// //                     onBlur={e => { e.target.style.borderColor= bag.weight ? '#3b82f666':'var(--border-light)'; e.target.style.boxShadow='none'; }}
// //                   />

// //                   {/* Rate — entered after auction */}
// //                   <input
// //                     type="number" value={bag.rate}
// //                     onChange={e => updateBag(i, 'rate', e.target.value)}
// //                     placeholder="e.g. 3200"
// //                     step="0.01" min="0"
// //                     onWheel={e => e.target.blur()}
// //                     style={inputStyle(bag.rate, '#10b981')}
// //                     onFocus={e => { e.target.style.borderColor='#10b981'; e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'; }}
// //                     onBlur={e => { e.target.style.borderColor= bag.rate ? '#10b98166':'var(--border-light)'; e.target.style.boxShadow='none'; }}
// //                   />

// //                   {/* Auto-calculated amount */}
// //                   <div style={{ fontSize:13, fontWeight:800, color: bag.amount ? 'var(--accent)':'var(--text-muted)', textAlign:'right', paddingRight:4 }}>
// //                     {bag.amount ? `₹ ${fmtINR(bag.amount)}` : '—'}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             {/* Totals row */}
// //             <div style={{ display:'grid', gridTemplateColumns:'36px 70px 1fr 1fr 130px', gap:10, padding:'12px 14px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
// //               <div /><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalWeight.toFixed(2)} kg</div>
// //               <div style={{ fontSize:12, color: ratesSetCount===bags.length ? 'var(--green)':'var(--text-muted)' }}>
// //                 {ratesSetCount}/{bags.length} rates {ratesSetCount===bags.length ? '✓':'pending'}
// //               </div>
// //               <div style={{ fontSize:15, fontWeight:800, color:'var(--accent)', textAlign:'right', paddingRight:4 }}>
// //                 {totalAmount > 0 ? `₹ ${fmtINR(totalAmount)}` : '—'}
// //               </div>
// //             </div>

// //             {/* Formula hint */}
// //             <div style={{ marginTop:10, padding:'10px 14px', background:'var(--blue-dim)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:8, fontSize:12, color:'var(--blue)' }}>
// //               💡 <strong>Amount = (Weight × Rate) ÷ 100</strong> &nbsp;·&nbsp; e.g. 72 kg @ ₹3200/100kg = <strong>₹2,304</strong>
// //             </div>
// //           </div>
// //         )}

// //         <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
// //           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
// //           <button className="btn btn-primary" onClick={save} disabled={loading}>
// //             <Check size={15} /> {loading ? 'Saving...' : 'Save Changes'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Main Component ───────────────────────────────────────────
// // export default function SellerList() {
// //   const [sellers,        setSellers]        = useState([]);
// //   const [loading,        setLoading]        = useState(true);
// //   const [search,         setSearch]         = useState('');
// //   const [filterDate,     setFilterDate]     = useState('');
// //   const [filterMaterial, setFilterMaterial] = useState('');
// //   const [viewBill,       setViewBill]       = useState(null);
// //   const [editSeller,     setEditSeller]     = useState(null);
// //   const [confirm,        setConfirm]        = useState(null);

// //   const load = useCallback(async () => {
// //     setLoading(true);
// //     try {
// //       const res = await getSellers(filterDate);
// //       setSellers(res.data.data);
// //     } catch (err) {
// //       toast.error(err.message || 'Failed to load sellers');
// //     } finally { setLoading(false); }
// //   }, [filterDate]);

// //   useEffect(() => { load(); }, [load]);

// //   const handleDelete = (id, name) => {
// //     setConfirm({
// //       title: 'Delete Seller?',
// //       message: `"${name}" will be permanently removed.`,
// //       onConfirm: async () => {
// //         try { await apiDeleteSeller(id); toast.success(`${name} deleted`); load(); }
// //         catch (err) { toast.error(err.message || 'Delete failed'); }
// //       },
// //     });
// //   };

// //   const clearFilters = () => { setSearch(''); setFilterDate(''); setFilterMaterial(''); };
// //   const hasFilter = search || filterDate || filterMaterial;

// //   const filtered = sellers.filter(s => {
// //     const q = search.toLowerCase();
// //     return (!q || [s.name, s.mobile, s.lot_number, s.serial_number, s.material].some(v => v?.toLowerCase().includes(q)))
// //       && (!filterMaterial || s.material === filterMaterial);
// //   });

// //   const totals = filtered.reduce((a, s) => ({
// //     bags:    a.bags    + Number(s.num_bags       || 0),
// //     weight:  a.weight  + Number(s.weight         || 0),
// //     advance: a.advance + Number(s.advance_amount || 0),
// //     amount:  a.amount  + Number(s.amount         || 0),
// //   }), { bags:0, weight:0, advance:0, amount:0 });

// //   return (
// //     <div>
// //       <div className="page-header">
// //         <div>
// //           <div className="page-title">Seller List</div>
// //           <div className="page-subtitle">{loading ? 'Loading...' : `${sellers.length} sellers registered`}</div>
// //         </div>
// //         <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button>
// //       </div>

// //       {/* Filters */}
// //       <div className="filter-bar">
// //         <div className="search-box" style={{ flex:2 }}>
// //           <Search className="search-icon" size={16} />
// //           <input className="form-input" value={search} onChange={e => setSearch(e.target.value)}
// //             placeholder="Search name, mobile, lot no..." style={{ textTransform:'none' }} />
// //         </div>
// //         <input className="form-input" type="date" value={filterDate}
// //           onChange={e => setFilterDate(e.target.value)} style={{ textTransform:'none', flex:1 }} />
// //         <select className="form-select" value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)} style={{ flex:1 }}>
// //           <option value="">All Materials</option>
// //           {MATERIALS.map(m => <option key={m}>{m}</option>)}
// //         </select>
// //         {hasFilter && <button className="btn btn-secondary" onClick={clearFilters}><X size={14} /> Clear</button>}
// //       </div>

// //       {/* Summary strip */}
// //       {filtered.length > 0 && (
// //         <div style={{ display:'flex', gap:12, marginBottom:16 }}>
// //           {[
// //             { label:'Sellers',      value: filtered.length,              color:'var(--accent)' },
// //             { label:'Total Bags',   value: totals.bags,                  color:'var(--green)' },
// //             { label:'Total Weight', value: fmtNum(totals.weight)+' kg',  color:'var(--blue)' },
// //             { label:'Total Amount', value:'₹ '+fmtINR(totals.amount),    color:'var(--purple)' },
// //             { label:'Advance Paid', value:'₹ '+fmtINR(totals.advance),   color:'var(--text-secondary)' },
// //           ].map(item => (
// //             <div key={item.label} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px' }}>
// //               <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{item.label}</div>
// //               <div style={{ fontSize:15, fontWeight:800, color:item.color, fontFamily:'var(--font-display)' }}>{item.value}</div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* Table */}
// //       <div className="table-wrapper">
// //         {loading ? (
// //           <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading sellers...</div>
// //         ) : filtered.length === 0 ? (
// //           <div className="empty-state">
// //             <div className="empty-state-icon">👨‍🌾</div>
// //             <h3>No sellers found</h3>
// //             <p style={{ fontSize:12, marginTop:6 }}>{hasFilter ? 'Adjust filters' : 'Register a seller to get started'}</p>
// //             {hasFilter && <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ marginTop:14 }}>Clear Filters</button>}
// //           </div>
// //         ) : (
// //           <table>
// //             <thead>
// //               <tr>
// //                 <th>#</th><th>Sr No</th><th>Name</th><th>Mobile</th><th>Material</th>
// //                 <th>Bags</th><th>Lot No</th><th>Weight(kg)</th>
// //                 <th>Amount(₹)</th><th>Advance(₹)</th><th>Balance(₹)</th><th>Date</th>
// //                 <th style={{ textAlign:'center' }}>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {filtered.map((s, idx) => {
// //                 const balance = (s.amount||0) - (s.advance_amount||0);
// //                 let bags = [];
// //                 try { bags = s.bag_data ? JSON.parse(s.bag_data) : []; } catch {}
// //                 const ratesSet = bags.filter(b => Number(b.rate) > 0).length;

// //                 return (
// //                   <tr key={s.id}>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{idx+1}</td>
// //                     <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
// //                     <td style={{ fontWeight:600 }}>{s.name}</td>
// //                     <td className="td-muted">{s.mobile && s.mobile!=='0000000000' ? s.mobile : '—'}</td>
// //                     <td>{s.material && s.material!=='GENERAL'
// //                       ? <span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
// //                       : <span className="td-muted">—</span>}
// //                     </td>
// //                     <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
// //                     <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
// //                     <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
// //                     <td style={{ fontWeight:700, color:'var(--accent)' }}>
// //                       {s.amount ? `₹${fmtINR(s.amount)}` : (
// //                         bags.length > 0
// //                           ? <span style={{ fontSize:11, color:'var(--text-muted)' }}>{ratesSet}/{bags.length} rates</span>
// //                           : '—'
// //                       )}
// //                     </td>
// //                     <td className="td-muted">{s.advance_amount ? `₹${fmtINR(s.advance_amount)}` : '—'}</td>
// //                     <td style={{ fontWeight:600, color: balance>0 ? 'var(--red)':'var(--green)' }}>
// //                       {s.amount ? `₹${fmtINR(balance)}` : '—'}
// //                     </td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
// //                     <td>
// //                       <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
// //                         <button className="btn btn-blue btn-sm" onClick={() => setEditSeller(s)} title="Edit"><Edit2 size={13} /></button>
// //                         <button className="btn btn-green btn-sm" onClick={() => setViewBill(s)} title="View Bill"><Eye size={13} /></button>
// //                         <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={() => setViewBill(s)} title="Print"><Printer size={13} /></button>
// //                         <button className="btn btn-red btn-sm" onClick={() => handleDelete(s.id, s.name)} title="Delete"><Trash2 size={13} /></button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 );
// //               })}
// //             </tbody>
// //             {filtered.length > 1 && (
// //               <tfoot>
// //                 <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
// //                   <td colSpan={5} style={{ padding:'12px 16px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({filtered.length})</td>
// //                   <td style={{ padding:'12px 16px', fontWeight:800 }}>{totals.bags}</td>
// //                   <td />
// //                   <td style={{ padding:'12px 16px', fontWeight:800 }}>{fmtNum(totals.weight)}</td>
// //                   <td style={{ padding:'12px 16px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(totals.amount)}</td>
// //                   <td style={{ padding:'12px 16px', fontWeight:700 }}>₹{fmtINR(totals.advance)}</td>
// //                   <td style={{ padding:'12px 16px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(totals.amount-totals.advance)}</td>
// //                   <td colSpan={2} />
// //                 </tr>
// //               </tfoot>
// //             )}
// //           </table>
// //         )}
// //       </div>

// //       {viewBill   && <BillModal    seller={viewBill}   onClose={() => setViewBill(null)} />}
// //       {editSeller && <EditModal    seller={editSeller} onClose={() => setEditSeller(null)} onSave={load} />}
// //       {confirm    && <ConfirmDialog {...confirm}        onClose={() => setConfirm(null)} />}

// //       <style>{`
// //         input[type=number]::-webkit-inner-spin-button,
// //         input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
// //         input[type=number] { -moz-appearance:textfield; }
// //       `}</style>
// //     </div>
// //   );
// // }



// // -------------------------------------------------------------------------------------------------


// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import toast from 'react-hot-toast';
// // import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package } from 'lucide-react';
// // import axios from 'axios';
// // import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// // import ConfirmDialog from '../ConfirmDialog';

// // const API = axios.create({ baseURL: '' });

// // const todayISO = () => new Date().toISOString().split('T')[0];

// // // ─── Parse bag_data ───────────────────────────────────────────
// // function getBags(seller) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || `${seller.serial_number}/${num}`;
// //   let raw = [];
// //   try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
// //   return Array.from({ length: num }, (_, i) => {
// //     const b = raw[i] || {};
// //     return {
// //       lot,
// //       weight: Number(b.weight) > 0 ? String(b.weight) : '',
// //       rate:   Number(b.rate)   > 0 ? String(b.rate)   : '',
// //       amount: Number(b.amount) > 0 ? String(b.amount) : '',
// //       buyer:  b.buyer || '',
// //     };
// //   });
// // }

// // // ─── Number to Indian Words ───────────────────────────────────
// // function toIndianWords(amount) {
// //   const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
// //     'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
// //   const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
// //   function conv(n) {
// //     if (n === 0) return '';
// //     if (n < 20) return ones[n];
// //     if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
// //     if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+conv(n%100) : '');
// //     if (n < 100000) return conv(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' '+conv(n%1000) : '');
// //     if (n < 10000000) return conv(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' '+conv(n%100000) : '');
// //     return conv(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' '+conv(n%10000000) : '');
// //   }
// //   const intPart = Math.floor(Math.abs(amount));
// //   const decPart = Math.round((Math.abs(amount) - intPart) * 100);
// //   let words = conv(intPart) + ' Rupees';
// //   if (decPart > 0) words += ' and ' + conv(decPart) + ' Paise';
// //   return words || 'Zero Rupees';
// // }

// // const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // // ─── Bill Modal ───────────────────────────────────────────────
// // function BillModal({ seller, onClose }) {
// //   const printRef = useRef();
// //   const BLUE = '#1a56db';

// //   const totalBags = parseInt(seller.num_bags) || 0;
// //   let rawBags = [];
// //   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

// //   const bagRows = Array.from({ length: totalBags }, (_, i) => {
// //     const b = rawBags[i] || {};
// //     return {
// //       srno:     String(i + 1).padStart(3, '0'),
// //       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
// //       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
// //       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
// //       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
// //       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
// //       buyer:    b.buyer || '',
// //     };
// //   });

// //   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
// //   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
// //   const labourAmt   = 20 * totalBags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalExp    = parseFloat((labourAmt + commission).toFixed(2));
// //   const netAmount   = parseFloat((grossAmount - totalExp).toFixed(2));
// //   const advance     = parseFloat(seller.advance_amount) || 0;
// //   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

// //   const printBill = () => {
// //     const bagRowsHtml = bagRows.map((b, i) => `
// //       <tr style="background:${i%2===0?'#ffffff':'#eff6ff'}">
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;color:#333">${b.srno}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:left;font-size:10px;font-weight:700;color:#1a1a1a">${b.material}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-family:monospace;color:#444">${b.lot}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:600;color:#333">1</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#1e40af">${b.weight != null ? b.weight : '—'}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#166534">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:700;color:#555">${b.buyer || '—'}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:right;font-size:10px;font-weight:800;color:#1a56db">${b.amount != null ? inr(b.amount) : '—'}</td>
// //       </tr>`).join('');

// //     const html = `<!DOCTYPE html>
// // <html>
// // <head>
// //   <title>Bill — ${seller.name}</title>
// //   <style>
// //     @page { size: A5; margin: 8mm; }
// //     * { box-sizing: border-box; margin: 0; padding: 0; }
// //     body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }
// //     table { width: 100%; border-collapse: collapse; }
// //     .page-wrapper { border: 3px solid #1a56db; border-radius: 4px; padding: 10px; position: relative; min-height: 95%; }
// //     .page-wrapper::after { content: ''; display: block; position: absolute; top: 4px; left: 4px; right: 4px; bottom: 4px; border: 1px solid #a0bbf0; border-radius: 2px; pointer-events: none; }
// //     .header-box { text-align: center; border-bottom: 2.5px double #1a56db; padding-bottom: 8px; margin-bottom: 7px; }
// //     .header-props { display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #444; margin-bottom: 5px; }
// //     .logo-circle { width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid #1a56db; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; color: #1a56db; background: #eff6ff; }
// //     .firm-name { font-size: 20px; font-weight: 900; color: #1a1a1a; line-height: 1.1; margin: 3px 0; }
// //     .firm-badge { display: inline-block; background: #1a56db; color: #fff; font-size: 8px; font-weight: 700; letter-spacing: 1.2px; padding: 2px 12px; border-radius: 2px; margin: 3px 0 1px; }
// //     .firm-type { font-size: 10px; font-weight: 700; color: #333; }
// //     .firm-addr { font-size: 9px; color: #666; margin-top: 2px; }
// //     .meta-table { border: 1.5px solid #1a56db; border-radius: 3px; margin-bottom: 6px; overflow: hidden; }
// //     .meta-row { display: flex; justify-content: space-between; padding: 5px 9px; font-size: 10px; border-bottom: 1px solid #cfe2ff; }
// //     .meta-row:last-child { border-bottom: none; }
// //     .meta-row strong { color: #1a56db; }
// //     .items-table thead tr th { background: #1a56db; color: #fff; padding: 6px 4px; font-size: 9.5px; font-weight: 700; border: 1px solid #1245b5; text-align: center; }
// //     .items-table tfoot td { background: #dbeafe; border-top: 2px solid #1a56db; border: 1px solid #b8cef0; padding: 6px 4px; font-weight: 800; color: #1e40af; }
// //     .deduct-table td { border: 1px solid #b8cef0; padding: 6px 9px; font-size: 10px; }
// //     .deduct-label { background: #eff6ff; font-weight: 700; color: #1e40af; width: 58%; }
// //     .deduct-value { text-align: right; font-weight: 700; color: #dc2626; }
// //     .net-row td { background: #1a56db; color: #fff; padding: 9px 10px; font-weight: 900; }
// //     .net-label { font-size: 13px; }
// //     .net-value { text-align: right; font-size: 15px; letter-spacing: 0.3px; }
// //     .in-words { border: 1.5px solid #1a56db; border-radius: 3px; padding: 5px 9px; font-size: 10px; margin-top: 6px; background: #f8fbff; }
// //     .in-words strong { color: #1a56db; }
// //     .footer-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 18px; }
// //     .sign-box { text-align: center; border-top: 1px solid #555; padding-top: 4px; font-size: 9.5px; width: 120px; color: #444; }
// //     .for-firm { font-weight: 800; font-size: 11px; color: #1a1a1a; }
// //     .eoae { text-align: right; font-size: 9px; color: #888; margin-top: 3px; font-style: italic; }
// //     @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
// //   </style>
// // </head>
// // <body>
// // <div class="page-wrapper">
// //   <div class="header-box">
// //     <div class="header-props">
// //       <span style="text-align:left">Prop. Praveen Heggani<br>Cell : 9611635183</span>
// //       <div class="logo-circle">PH</div>
// //       <span style="text-align:right">Prop. Pramod V.Heggani<br>Cell : 9448349836</span>
// //     </div>
// //     <div class="firm-name">Mr. Praveen Heggani</div>
// //     <div><span class="firm-badge">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
// //     <div class="firm-type">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //     <div class="firm-addr">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //   </div>
// //   <div class="meta-table">
// //     <div class="meta-row">
// //       <span><strong>Bill No :</strong> ${seller.serial_number || '—'}</span>
// //       <span><strong>Date :</strong> ${fmtDate(seller.entry_date)}</span>
// //     </div>
// //     <div class="meta-row"><span><strong>Cust. Name :</strong> ${seller.name}</span></div>
// //   </div>
// //   <table class="items-table" style="margin-bottom:1px">
// //     <thead>
// //       <tr>
// //         <th>SrNo.</th><th>Particular</th><th>Lott No.</th><th>Bags</th>
// //         <th>Weight(KG)</th><th>RATE</th><th>Buyer</th><th>Amount</th>
// //       </tr>
// //     </thead>
// //     <tbody>${bagRowsHtml}</tbody>
// //     <tfoot>
// //       <tr>
// //         <td colspan="3" style="text-align:left;padding-left:9px;font-size:10px">TOTAL</td>
// //         <td style="text-align:center;font-size:11px">${totalBags}</td>
// //         <td style="text-align:center;font-size:11px">${totalWeight.toFixed(2)}</td>
// //         <td colspan="2" style="text-align:right;font-size:9px;color:#1e40af;font-weight:600">Gross Amt.</td>
// //         <td style="text-align:right;font-size:13px;color:#1a56db;padding-right:6px">&#8377; ${inr(grossAmount)}</td>
// //       </tr>
// //     </tfoot>
// //   </table>
// //   <table class="deduct-table" style="margin-top:2px">
// //     <tbody>
// //       <tr><td class="deduct-label">Other Charges </td><td class="deduct-value">− ₹ ${inr(commission)}</td></tr>
// //       <tr><td class="deduct-label">Hamali / Labour Charges</td><td class="deduct-value">− ₹ ${inr(labourAmt)}</td></tr>
// //       <tr><td class="deduct-label">Advance Paid</td><td class="deduct-value">− ₹ ${inr(advance)}</td></tr>
// //       <tr class="net-row">
// //         <td class="net-label">NET AMOUNT</td>
// //         <td class="net-value">&#8377; ${inr(Math.max(0, finalPay))}</td>
// //       </tr>
// //     </tbody>
// //   </table>
// //   <div class="in-words"><strong>In Words :</strong> ${toIndianWords(Math.max(0, finalPay))} Only</div>
// //   <div class="eoae">(E.&amp;O.E.)</div>
// //   <div class="footer-row">
// //     <div class="sign-box">Receiver's Sign.</div>
// //     <div class="for-firm">For – Mr. Praveen Heggani</div>
// //   </div>
// // </div>
// // <script>window.onload = function(){ window.print(); }<\/script>
// // </body></html>`;

// //     const w = window.open('', '_blank', 'width=700,height=900');
// //     w.document.write(html);
// //     w.document.close();
// //   };

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 580, width: '95%', padding: 0, overflow: 'hidden', borderRadius: 10 }} onClick={e => e.stopPropagation()}>
// //         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:BLUE, color:'#fff' }}>
// //           <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
// //           <div style={{ display:'flex', gap:8 }}>
// //             <button onClick={printBill} style={{ background:'#fff', color:BLUE, border:'none', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
// //               <Printer size={13} /> Print / PDF (A5)
// //             </button>
// //             <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}><X size={18} /></button>
// //           </div>
// //         </div>
// //         <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f0f4ff' }}>
// //           <div style={{ all:'initial', display:'block' }}>
// //           <div ref={printRef} style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'3px solid #1a56db', borderRadius:4, position:'relative' }}>
// //             <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #a0bbf0', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>
// //             <div style={{ textAlign:'center', borderBottom:'2.5px double #1a56db', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
// //                 <span style={{ textAlign:'left' }}>Prop. Praveen V. Heggani<br/>Cell : 9611635183</span>
// //                 <div style={{ width:40, height:40, borderRadius:'50%', border:'2.5px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1a56db', background:'#eff6ff' }}>PH</div>
// //                 <span style={{ textAlign:'right' }}>Prop. Pramod V.Heggani<br/>Cell : 9448349836</span>
// //               </div>
// //               <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>Mr. Praveen Heggani</div>
// //               <div><span style={{ display:'inline-block', background:'#1a56db', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}>TAMARIND,GINGER,GARLIC,ONION &amp; Vegetables</span></div>
// //               <div style={{ fontSize:11, fontWeight:700 }}>ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //               <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}>Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //             </div>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
// //                 <span><strong style={{ color:'#1a56db' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
// //                 <span><strong style={{ color:'#1a56db' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
// //               </div>
// //               <div style={{ padding:'4px 8px', fontSize:11 }}>
// //                 <strong style={{ color:'#1a56db' }}>Cust. Name :</strong> {seller.name}
// //               </div>
// //             </div>
// //             <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
// //               <thead>
// //                 <tr>
// //                   {['SrNo.','Particular','Lott No.','Bags','Weight(KG)','RATE','Buyer','Amount'].map(h => (
// //                     <th key={h} style={{ background:'#1a56db', color:'#fff', padding:'5px 4px', fontSize:9.5, fontWeight:700, border:'1px solid #1245b5', textAlign:'center' }}>{h}</th>
// //                   ))}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {bagRows.map((b, i) => (
// //                   <tr key={i} style={{ background: i%2===0 ? '#fff':'#eff6ff' }}>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, color:'#111' }}>{b.srno}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'left', fontSize:10, fontWeight:700, color:'#111' }}>{b.material}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontFamily:'monospace', color:'#333' }}>{b.lot}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:600, color:'#111' }}>1</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#1e40af' }}>{b.weight != null ? b.weight : '—'}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#166534' }}>{b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:700, color:'#7c3aed' }}>{b.buyer || '—'}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'right', fontSize:10, fontWeight:800, color:'#1a56db' }}>{b.amount != null ? inr(b.amount) : '—'}</td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //               <tfoot>
// //                 <tr style={{ background:'#dbeafe', borderTop:'2px solid #1a56db' }}>
// //                   <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#1e40af' }}>{totalWeight.toFixed(2)}</td>
// //                   <td colSpan={2} style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af' }}>Gross Amt.</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1a56db', fontSize:13 }}>₹ {inr(grossAmount)}</td>
// //                 </tr>
// //               </tfoot>
// //             </table>
// //             <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
// //               <tbody>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Comm. (8%)</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td></tr>
// //                 <tr style={{ background:'#1a56db' }}>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:900, fontSize:16, textAlign:'right' }}>₹ {inr(Math.max(0, finalPay))}</td>
// //                 </tr>
// //               </tbody>
// //             </table>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
// //               <strong style={{ color:'#1a56db' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
// //             </div>
// //             <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>
// //             <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
// //               <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
// //               <div style={{ fontWeight:800, fontSize:11 }}>For – Mr. Praveen Heggani</div>
// //             </div>
// //           </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Edit Modal ───────────────────────────────────────────────
// // function EditModal({ seller, onClose, onSave }) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || (seller.serial_number + '/' + num);

// //   const [rows,    setRows]    = useState(() => getBags(seller));
// //   const [nBags,   setNBags]   = useState(String(num));
// //   const [advance, setAdvance] = useState(String(seller.advance_amount || ''));
// //   const [labour,  setLabour]  = useState('20');
// //   const [saving,  setSaving]  = useState(false);
// //   const [buyers,  setBuyers]  = useState([]); // buyer list from DB

// //   // Load buyers on mount
// //   useEffect(() => {
// //     API.get('/api/buyers').then(res => {
// //       setBuyers(res.data.data || []);
// //     }).catch(() => {});
// //   }, []);

// //   const changeNBags = (v) => {
// //     setNBags(v);
// //     const n = parseInt(v) || 0;
// //     setRows(prev => Array.from({ length: n }, (_, i) =>
// //       prev[i] || { lot, weight: '', rate: '', amount: '', buyer: '' }
// //     ));
// //   };

// //   const update = (i, field, val) => {
// //     setRows(prev => prev.map((r, j) => {
// //       if (j !== i) return r;
// //       const next = { ...r, [field]: val };
// //       if (field === 'weight' || field === 'rate') {
// //         const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
// //         const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
// //         next.amount = w && rt ? ((w * rt) / 100).toFixed(2) : '';
// //       }
// //       return next;
// //     }));
// //   };

// //   const bags        = parseInt(nBags) || 0;
// //   const totalW      = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
// //   const grossAmount = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
// //   const labourAmt   = (parseFloat(labour) || 0) * bags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalDeduct = parseFloat((labourAmt + commission).toFixed(2));
// //   const netPayable  = parseFloat((grossAmount - totalDeduct).toFixed(2));
// //   const finalPay    = parseFloat((netPayable - (parseFloat(advance) || 0)).toFixed(2));

// //   const ratesDone = rows.filter(r => parseFloat(r.rate) > 0).length;
// //   const wtsDone   = rows.filter(r => parseFloat(r.weight) > 0).length;

// //   const save = async () => {
// //     if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
// //     setSaving(true);
// //     try {
// //       const bag_data = rows.map(r => ({
// //         lot,
// //         weight: parseFloat(r.weight) || 0,
// //         rate:   parseFloat(r.rate)   || 0,
// //         amount: parseFloat(r.amount) || 0,
// //         buyer:  r.buyer || '',
// //       }));
// //       await API.put('/api/sellers/' + seller.id, {
// //         num_bags:       bags,
// //         weight:         totalW,
// //         amount:         netPayable,
// //         advance_amount: parseFloat(advance) || 0,
// //         rate_fixed:     totalW > 0 && grossAmount > 0 ? parseFloat((grossAmount / totalW * 100).toFixed(2)) : 0,
// //         bag_data:       JSON.stringify(bag_data),
// //       });
// //       toast.success('Saved! Final payable: ₹' + fmtINR(finalPay));
// //       onSave(); onClose();
// //     } catch (err) {
// //       toast.error(err.response?.data?.error || err.message || 'Failed');
// //     } finally { setSaving(false); }
// //   };

// //   const iStyle = (val, col) => ({
// //     background:   val ? col + '11' : 'var(--bg-panel)',
// //     border:       '1px solid ' + (val ? col + '66' : 'var(--border-light)'),
// //     borderRadius: 7, padding: '8px 11px',
// //     color:        val ? col : 'var(--text-muted)',
// //     fontFamily:   'var(--font-body)', fontSize: 13, fontWeight: 700,
// //     outline: 'none', width: '100%',
// //   });

// //   // Buyer options: short_name if available, else name
// //   const buyerOptions = buyers.map(b => {
// //     const display = (b.lot_number && b.lot_number !== '—') ? b.lot_number : b.name;
// //     return { value: display, label: display, fullName: b.name };
// //   });

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 960, width: '95%' }} onClick={e => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
// //           <button className="modal-close" onClick={onClose}><X size={20} /></button>
// //         </div>

// //         <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
// //           {[['Serial No',seller.serial_number],['Lot No',lot],
// //             ['Material',seller.material&&seller.material!=='GENERAL'?seller.material:'—'],
// //             ['Date',fmtDate(seller.entry_date)]
// //           ].map(([l,v])=>(
// //             <div key={l} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 13px', fontSize:12 }}>
// //               <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{l}</div>
// //               <div style={{ fontWeight:700 }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>

// //         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:18 }}>
// //           <div className="form-group">
// //             <label className="form-label">Number of Bags</label>
// //             <input className="form-input" type="number" value={nBags} onChange={e=>changeNBags(e.target.value)} min="1" max="100" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Advance Paid (₹)</label>
// //             <input className="form-input" type="number" value={advance} onChange={e=>setAdvance(e.target.value)} placeholder="0.00" step="0.01" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Labour Rate (₹ per bag)</label>
// //             <input className="form-input" type="number" value={labour} onChange={e=>setLabour(e.target.value)} placeholder="20" step="1" min="0" style={{ textTransform:'none' }}/>
// //           </div>
// //         </div>

// //         {rows.length > 0 && (
// //           <>
// //             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
// //               <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                 <Package size={15} style={{ color:'var(--accent)' }}/>
// //                 <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Bag-wise Details</span>
// //                 <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>Lot: {lot}</span>
// //                 <span style={{ fontSize:11, color:wtsDone===rows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
// //                   {wtsDone}/{rows.length} weights
// //                 </span>
// //               </div>
// //               <span style={{ fontSize:11, color:'var(--text-muted)' }}>Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
// //             </div>

// //             {/* Column headers — 5 cols now with Buyer */}
// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
// //               {['#','Lot','Weight (kg)','Rate (₹/100kg)','Buyer','Amount (₹)'].map(h=>(
// //                 <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
// //               ))}
// //             </div>

// //             <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:300, overflowY:'auto' }}>
// //               {rows.map((r,i)=>(
// //                 <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<rows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
// //                   <div style={{ width:24, height:24, borderRadius:5, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>{i+1}</div>
// //                   <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lot}</div>

// //                   {/* Weight */}
// //                   <input type="number" value={r.weight} onChange={e=>update(i,'weight',e.target.value)}
// //                     placeholder="Enter weight" step="0.01" min="0.01" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.weight,'#3b82f6')}
// //                     onFocus={e=>{e.target.style.borderColor='#3b82f6';e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.weight?'#3b82f666':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />

// //                   {/* Rate */}
// //                   <input type="number" value={r.rate} onChange={e=>update(i,'rate',e.target.value)}
// //                     placeholder="e.g. 3200" step="0.01" min="0" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.rate,'#10b981')}
// //                     onFocus={e=>{e.target.style.borderColor='#10b981';e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.rate?'#10b98166':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />

// //                   {/* Buyer dropdown */}
// //                   <select
// //                     value={r.buyer || ''}
// //                     onChange={e => update(i, 'buyer', e.target.value)}
// //                     style={{
// //                       background: r.buyer ? 'rgba(139,92,246,0.1)' : 'var(--bg-panel)',
// //                       border: `1px solid ${r.buyer ? 'rgba(139,92,246,0.5)' : 'var(--border-light)'}`,
// //                       borderRadius: 7, padding: '8px 10px',
// //                       color: r.buyer ? '#a78bfa' : 'var(--text-muted)',
// //                       fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
// //                       outline: 'none', width: '100%', cursor: 'pointer',
// //                     }}
// //                   >
// //                     <option value="">— Select Buyer —</option>
// //                     {buyerOptions.map((b, idx) => (
// //                       <option key={idx} value={b.value}>{b.label}</option>
// //                     ))}
// //                   </select>

// //                   {/* Amount */}
// //                   <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
// //                     {r.amount?'₹'+fmtINR(r.amount):'—'}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
// //               <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
// //               <div style={{ fontSize:12, color:ratesDone===rows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{rows.length} rates {ratesDone===rows.length?'✓':''}</div>
// //               <div style={{ fontSize:11, color:'var(--text-muted)' }}>{rows.filter(r=>r.buyer).length}/{rows.length} buyers assigned</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
// //             </div>
// //           </>
// //         )}

// //         {grossAmount > 0 && (
// //           <div style={{ marginTop:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
// //             <div style={{ background:'var(--bg-panel)', padding:'10px 18px', borderBottom:'1px solid var(--border)' }}>
// //               <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>💰 Payment Calculation</span>
// //             </div>
// //             <div>
// //               {[
// //                 { label:'Gross Amount',          sub:`${rows.length} bags × Rate`,      val:`₹ ${fmtINR(grossAmount)}`,               color:'var(--accent)',         fs:16 },
// //                 { label:'− Labour / Hamali',     sub:`₹${labour||20} × ${bags} bags`,  val:`− ₹ ${fmtINR(labourAmt)}`,              color:'var(--red)',            fs:15 },
// //                 { label:'− Other Charges ', sub:`8% of ₹${fmtINR(grossAmount)}`, val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
// //                 { label:'Net Amount',            sub:'Gross − Labour − Commission',     val:`₹ ${fmtINR(netPayable)}`,               color:'var(--blue)',           fs:16, highlight:true },
// //                 { label:'− Advance Already Paid',sub:'',                               val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`, color:'var(--text-secondary)', fs:15 },
// //               ].map((row, i)=>(
// //                 <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
// //                   <div>
// //                     <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
// //                     {row.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
// //                   </div>
// //                   <div style={{ fontSize:row.fs, fontWeight:800, color:row.color, fontFamily:'var(--font-display)' }}>{row.val}</div>
// //                 </div>
// //               ))}
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px', background:finalPay>=0?'var(--green-dim)':'var(--red-dim)' }}>
// //                 <div>
// //                   <div style={{ fontSize:15, fontWeight:800, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                     {finalPay >= 0 ? '✅ Final Amount to Pay Seller' : '⚠️ Seller Owes Back'}
// //                   </div>
// //                   <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Net − Advance</div>
// //                 </div>
// //                 <div style={{ fontSize:24, fontWeight:900, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                   ₹ {fmtINR(Math.abs(finalPay))}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
// //           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
// //           <button className="btn btn-primary" onClick={save} disabled={saving}>
// //             <Check size={15}/> {saving?'Saving...':'Save Changes'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Main ─────────────────────────────────────────────────────
// // export default function SellerList() {
// //   const [sellers,  setSellers]  = useState([]);
// //   const [loading,  setLoading]  = useState(true);
// //   const [search,   setSearch]   = useState('');
// //   // ✅ Default to TODAY's date
// //   const [fDate,    setFDate]    = useState(todayISO());
// //   const [fMat,     setFMat]     = useState('');
// //   const [bill,     setBill]     = useState(null);
// //   const [editing,  setEditing]  = useState(null);
// //   const [confirm,  setConfirm]  = useState(null);

// //   const load = useCallback(async () => {
// //     setLoading(true);
// //     try {
// //       const res = await API.get('/api/sellers', { params: fDate ? { date: fDate } : {} });
// //       setSellers(res.data.data);
// //     } catch(err) { toast.error(err.message||'Load failed'); }
// //     finally { setLoading(false); }
// //   }, [fDate]);

// //   useEffect(() => { load(); }, [load]);

// //   const del = (id, name) => setConfirm({
// //     title: 'Delete Seller?',
// //     message: `"${name}" will be permanently removed.`,
// //     onConfirm: async () => {
// //       try { await API.delete(`/api/sellers/${id}`); toast.success('Deleted'); load(); }
// //       catch(err) { toast.error(err.message||'Failed'); }
// //     }
// //   });

// //   const clear = () => { setSearch(''); setFDate(todayISO()); setFMat(''); };

// //   const list = sellers.filter(s => {
// //     const q = search.toLowerCase();
// //     return (!q || [s.name,s.mobile,s.lot_number,s.serial_number,s.material].some(v=>v?.toLowerCase().includes(q)))
// //       && (!fMat || s.material===fMat);
// //   });

// //   const tot = list.reduce((a,s)=>({
// //     bags: a.bags+Number(s.num_bags||0), wt: a.wt+Number(s.weight||0),
// //     adv:  a.adv+Number(s.advance_amount||0), amt: a.amt+Number(s.amount||0),
// //   }),{ bags:0, wt:0, adv:0, amt:0 });

// //   return (
// //     <div>
// //       <div className="page-header">
// //         <div>
// //           <div className="page-title">Seller List</div>
// //           <div className="page-subtitle">
// //             {loading ? 'Loading...' : `${sellers.length} sellers${fDate ? ` for ${fDate}` : ''}`}
// //           </div>
// //         </div>
// //         <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
// //       </div>

// //       <div className="filter-bar">
// //         <div className="search-box" style={{ flex:2 }}>
// //           <Search className="search-icon" size={16}/>
// //           <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, lot no..." style={{ textTransform:'none' }}/>
// //         </div>
// //         {/* Date filter — defaults to today */}
// //         <input className="form-input" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{ textTransform:'none', flex:1 }}/>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())} title="Today">Today</button>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')} title="All dates">All</button>
// //         <select className="form-select" value={fMat} onChange={e=>setFMat(e.target.value)} style={{ flex:1 }}>
// //           <option value="">All Materials</option>
// //           {MATERIALS.map(m=><option key={m}>{m}</option>)}
// //         </select>
// //         {(search||fMat)&&<button className="btn btn-secondary" onClick={clear}><X size={14}/> Clear</button>}
// //       </div>

// //       {list.length>0&&(
// //         <div style={{ display:'flex', gap:12, marginBottom:16 }}>
// //           {[['Sellers',list.length,'var(--accent)'],['Bags',tot.bags,'var(--green)'],
// //             ['Weight',fmtNum(tot.wt)+' kg','var(--blue)'],['Amount','₹ '+fmtINR(tot.amt),'var(--purple)'],
// //             ['Advance','₹ '+fmtINR(tot.adv),'var(--text-secondary)']
// //           ].map(([l,v,c])=>(
// //             <div key={l} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
// //               <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{l}</div>
// //               <div style={{ fontSize:15, fontWeight:800, color:c, fontFamily:'var(--font-display)' }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       <div className="table-wrapper">
// //         {loading?<div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading...</div>
// //         :list.length===0?(
// //           <div className="empty-state">
// //             <div className="empty-state-icon">👨‍🌾</div>
// //             <h3>{fDate ? `No sellers registered for ${fDate}` : 'No sellers found'}</h3>
// //             <p style={{ fontSize:12, marginTop:6, color:'var(--text-muted)' }}>
// //               {fDate ? 'Click "All" to see all sellers, or change the date' : 'Register a seller to get started'}
// //             </p>
// //             {fDate && (
// //               <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'center' }}>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')}>Show All Sellers</button>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())}>Today</button>
// //               </div>
// //             )}
// //           </div>
// //         ):(
// //           <table>
// //             <thead>
// //               <tr>
// //                 <th>#</th><th>Sr</th><th>Name</th><th>Mobile</th><th>Material</th>
// //                 <th>Bags</th><th>Lot</th><th>Weight</th><th>Amount</th><th>Advance</th><th>Balance</th><th>Date</th>
// //                 <th style={{ textAlign:'center' }}>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {list.map((s,i)=>{
// //                 const bal=(s.amount||0)-(s.advance_amount||0);
// //                 let bags=[]; try{bags=JSON.parse(s.bag_data||'[]')}catch{}
// //                 const rd=bags.filter(b=>Number(b.rate)>0).length;
// //                 return(
// //                   <tr key={s.id}>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{i+1}</td>
// //                     <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
// //                     <td style={{ fontWeight:600 }}>{s.name}</td>
// //                     <td className="td-muted">{s.mobile&&s.mobile!=='0000000000'?s.mobile:'—'}</td>
// //                     <td>{s.material&&s.material!=='GENERAL'
// //                       ?<span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
// //                       :<span className="td-muted">—</span>}
// //                     </td>
// //                     <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
// //                     <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
// //                     <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
// //                     <td style={{ fontWeight:700, color:'var(--accent)' }}>
// //                       {s.amount?`₹${fmtINR(s.amount)}`:<span style={{ fontSize:11, color:'var(--text-muted)' }}>{rd}/{bags.length} rates</span>}
// //                     </td>
// //                     <td className="td-muted">{s.advance_amount?`₹${fmtINR(s.advance_amount)}`:'—'}</td>
// //                     <td style={{ fontWeight:600, color:bal>0?'var(--red)':'var(--green)' }}>{s.amount?`₹${fmtINR(bal)}`:'—'}</td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
// //                     <td>
// //                       <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
// //                         <button className="btn btn-blue btn-sm" onClick={()=>setEditing(s)} title="Edit"><Edit2 size={13}/></button>
// //                         <button className="btn btn-green btn-sm" onClick={()=>setBill(s)} title="Bill"><Eye size={13}/></button>
// //                         <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={()=>setBill(s)} title="Print"><Printer size={13}/></button>
// //                         <button className="btn btn-red btn-sm" onClick={()=>del(s.id,s.name)} title="Delete"><Trash2 size={13}/></button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 );
// //               })}
// //             </tbody>
// //             {list.length>1&&(
// //               <tfoot>
// //                 <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
// //                   <td colSpan={5} style={{ padding:'11px 15px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({list.length})</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{tot.bags}</td>
// //                   <td/>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{fmtNum(tot.wt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(tot.amt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700 }}>₹{fmtINR(tot.adv)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(tot.amt-tot.adv)}</td>
// //                   <td colSpan={2}/>
// //                 </tr>
// //               </tfoot>
// //             )}
// //           </table>
// //         )}
// //       </div>

// //       {bill    && <BillModal  seller={bill}    onClose={()=>setBill(null)}/>}
// //       {editing && <EditModal  seller={editing} onClose={()=>setEditing(null)} onSave={load}/>}
// //       {confirm && <ConfirmDialog {...confirm}  onClose={()=>setConfirm(null)}/>}

// //       <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>
// //     </div>
// //   );
// // }



// // ----------------------------------------------------------------------------------------------------------



// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import toast from 'react-hot-toast';
// // import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package, CheckSquare, Square } from 'lucide-react';
// // import axios from 'axios';
// // import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// // import ConfirmDialog from '../ConfirmDialog';

// // const API = axios.create({ baseURL: '' });

// // const todayISO = () => new Date().toISOString().split('T')[0];

// // // ─── Parse bag_data ───────────────────────────────────────────
// // function getBags(seller) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || `${seller.serial_number}/${num}`;
// //   let raw = [];
// //   try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
// //   return Array.from({ length: num }, (_, i) => {
// //     const b = raw[i] || {};
// //     return {
// //       lot,
// //       weight: Number(b.weight) > 0 ? String(b.weight) : '',
// //       rate:   Number(b.rate)   > 0 ? String(b.rate)   : '',
// //       amount: Number(b.amount) > 0 ? String(b.amount) : '',
// //       buyer:  b.buyer || '',
// //     };
// //   });
// // }

// // // ─── Number to Indian Words ───────────────────────────────────
// // function toIndianWords(amount) {
// //   const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
// //     'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
// //   const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
// //   function conv(n) {
// //     if (n === 0) return '';
// //     if (n < 20) return ones[n];
// //     if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
// //     if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+conv(n%100) : '');
// //     if (n < 100000) return conv(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' '+conv(n%1000) : '');
// //     if (n < 10000000) return conv(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' '+conv(n%100000) : '');
// //     return conv(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' '+conv(n%10000000) : '');
// //   }
// //   const intPart = Math.floor(Math.abs(amount));
// //   const decPart = Math.round((Math.abs(amount) - intPart) * 100);
// //   let words = conv(intPart) + ' Rupees';
// //   if (decPart > 0) words += ' and ' + conv(decPart) + ' Paise';
// //   return words || 'Zero Rupees';
// // }

// // const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // // ─── Build single bill HTML for one seller ────────────────────
// // function buildBillHTML(seller, isFirst = false) {
// //   const totalBags = parseInt(seller.num_bags) || 0;
// //   let rawBags = [];
// //   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

// //   const bagRows = Array.from({ length: totalBags }, (_, i) => {
// //     const b = rawBags[i] || {};
// //     return {
// //       srno:     String(i + 1).padStart(3, '0'),
// //       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
// //       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
// //       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
// //       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
// //       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
// //       buyer:    b.buyer || '',
// //     };
// //   });

// //   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
// //   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
// //   const labourAmt   = 20 * totalBags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalExp    = parseFloat((labourAmt + commission).toFixed(2));
// //   const netAmount   = parseFloat((grossAmount - totalExp).toFixed(2));
// //   const advance     = parseFloat(seller.advance_amount) || 0;
// //   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

// //   const bagRowsHtml = bagRows.map((b, i) => `
// //     <tr style="background:${i%2===0?'#ffffff':'#eff6ff'}">
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;color:#111;font-weight:600">${b.srno}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:left;font-size:10px;font-weight:700;color:#111">${b.material}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-family:monospace;color:#111;font-weight:600">${b.lot}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:700;color:#111">1</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#111">${b.weight != null ? b.weight : '—'}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#111">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:right;font-size:10px;font-weight:800;color:#1a56db">${b.amount != null ? inr(b.amount) : '—'}</td>
// //     </tr>`).join('');

// //   // page-break-before on every bill except the first
// //   const pageBreak = isFirst ? '' : 'page-break-before:always;';

// //   return `
// //     <div style="${pageBreak}font-family:Arial,sans-serif;font-size:11px;color:#111;background:#fff;padding:10mm 8mm;display:block;line-height:1.4;">
// //       <div style="border:3px solid #1a56db;border-radius:4px;padding:10px;position:relative;min-height:95%;">
// //         <div style="position:absolute;top:4px;left:4px;right:4px;bottom:4px;border:1px solid #a0bbf0;border-radius:2px;pointer-events:none;"></div>

// //         <!-- Header -->
// //         <div style="text-align:center;border-bottom:2.5px double #1a56db;padding-bottom:8px;margin-bottom:7px;position:relative;">
// //           <div style="display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#555;margin-bottom:4px;">
// //             <span style="text-align:left">Prop. Praveen V. Heggani<br>Cell : 9611635183</span>
// //             <div style="width:36px;height:36px;border-radius:50%;border:2.5px solid #1a56db;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#1a56db;background:#eff6ff;">PH</div>
// //             <span style="text-align:right">Prop. Pramod V.Heggani<br>Cell : 9448349836</span>
// //           </div>
// //           <div style="font-size:20px;font-weight:900;color:#1a1a1a;line-height:1.1;margin:2px 0;">Mr. Praveen Heggani</div>
// //           <div><span style="display:inline-block;background:#1a56db;color:#fff;font-size:8px;font-weight:700;letter-spacing:1.5px;padding:2px 12px;border-radius:2px;margin:3px 0;">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
// //           <div style="font-size:11px;font-weight:700;">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //           <div style="font-size:9.5px;color:#666;margin-top:2px;">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //         </div>

// //         <!-- Meta -->
// //         <div style="border:1.5px solid #1a56db;border-radius:3px;margin-bottom:8px;overflow:hidden;">
// //           <div style="display:flex;justify-content:space-between;border-bottom:1px solid #cfe2ff;padding:5px 8px;font-size:11px;">
// //             <span><strong style="color:#1a56db">Bill No :</strong> ${seller.serial_number || '—'}</span>
// //             <span><strong style="color:#1a56db">Date :</strong> ${fmtDate(seller.entry_date)}</span>
// //           </div>
// //           <div style="padding:4px 8px;font-size:11px;">
// //             <strong style="color:#1a56db">Cust. Name :</strong> ${seller.name}
// //           </div>
// //         </div>

// //         <!-- Items Table -->
// //         <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:1px;">
// //           <thead>
// //             <tr>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">SrNo.</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Particular</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Lott No.</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Bags</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Weight(KG)</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">RATE</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Amount</th>
// //             </tr>
// //           </thead>
// //           <tbody>${bagRowsHtml}</tbody>
// //           <tfoot>
// //             <tr style="background:#dbeafe;border-top:2px solid #1a56db;">
// //               <td colspan="3" style="border:1px solid #b8cef0;padding:5px 6px;font-weight:700;color:#1e40af;text-align:left;">TOTAL</td>
// //               <td style="border:1px solid #b8cef0;padding:5px 3px;text-align:center;font-weight:800;color:#111;">${totalBags}</td>
// //               <td style="border:1px solid #b8cef0;padding:5px 3px;text-align:center;font-weight:800;color:#111;">${totalWeight.toFixed(2)}</td>
// //               <td style="border:1px solid #b8cef0;padding:5px 3px;text-align:right;font-size:9.5px;color:#1e40af;font-weight:700;">Gross Amt.</td>
// //               <td style="border:1px solid #b8cef0;padding:5px 5px;text-align:right;font-weight:800;color:#1a56db;font-size:13px;">&#8377; ${inr(grossAmount)}</td>
// //             </tr>
// //           </tfoot>
// //         </table>

// //         <!-- Deductions -->
// //         <table style="width:100%;border-collapse:collapse;margin-top:2px;">
// //           <tbody>
// //             <tr>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;width:58%;">Other Charges </td>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:11px;">− ₹ ${inr(commission)}</td>
// //             </tr>
// //             <tr>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Hamali / Labour Charges</td>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:11px;">− ₹ ${inr(labourAmt)}</td>
// //             </tr>
// //             <tr>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Advance Paid</td>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:11px;">− ₹ ${inr(advance)}</td>
// //             </tr>
// //             <tr style="background:#1a56db;">
// //               <td style="padding:9px 10px;color:#fff;font-weight:800;font-size:13px;">NET AMOUNT</td>
// //               <td style="padding:9px 10px;color:#fff;font-weight:900;font-size:16px;text-align:right;">&#8377; ${inr(Math.max(0, finalPay))}</td>
// //             </tr>
// //           </tbody>
// //         </table>

// //         <!-- In Words -->
// //         <div style="border:1.5px solid #1a56db;border-radius:3px;padding:5px 8px;font-size:10.5px;margin-top:6px;background:#f8fbff;">
// //           <strong style="color:#1a56db">In Words :</strong> ${toIndianWords(Math.max(0, finalPay))} Only
// //         </div>
// //         <div style="text-align:right;font-size:9.5px;color:#777;margin-top:3px;font-style:italic;">(E.&amp;O.E.)</div>

// //         <!-- Footer -->
// //         <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:18px;">
// //           <div style="text-align:center;border-top:1px solid #333;padding-top:4px;font-size:10px;width:130px;color:#444;">Receiver's Sign.</div>
// //           <div style="font-weight:800;font-size:11px;">For – Mr. Praveen Heggani</div>
// //         </div>
// //       </div>
// //     </div>`;
// // }

// // // ─── Bulk Print All Selected Bills ───────────────────────────
// // function printAllBills(sellers, dateLabel) {
// //   const billsHTML = sellers
// //     .map((s, i) => buildBillHTML(s, i === 0))
// //     .join('\n');

// //   const html = `<!DOCTYPE html>
// // <html>
// // <head>
// //   <title>Bills — ${dateLabel}</title>
// //   <style>
// //     @page { size: A5; margin: 0; }
// //     * { box-sizing: border-box; margin: 0; padding: 0; }
// //     body { font-family: Arial, sans-serif; background: #fff; }
// //     @media print {
// //       body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
// //       div[style*="page-break-before"] { page-break-before: always; }
// //     }
// //   </style>
// // </head>
// // <body>
// // ${billsHTML}
// // <script>window.onload = function(){ window.print(); }<\/script>
// // </body>
// // </html>`;

// //   const w = window.open('', '_blank', 'width=700,height=900');
// //   w.document.write(html);
// //   w.document.close();
// // }

// // // ─── Bill Modal (single seller) ───────────────────────────────
// // function BillModal({ seller, onClose }) {
// //   const printRef = useRef();
// //   const BLUE = '#1a56db';

// //   const printBill = () => {
// //     const html = `<!DOCTYPE html>
// // <html>
// // <head>
// //   <title>Bill — ${seller.name}</title>
// //   <style>
// //     @page { size: A5; margin: 8mm; }
// //     * { box-sizing: border-box; margin: 0; padding: 0; }
// //     body { font-family: Arial, sans-serif; background: #fff; }
// //     @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
// //   </style>
// // </head>
// // <body>
// // ${buildBillHTML(seller, true)}
// // <script>window.onload = function(){ window.print(); }<\/script>
// // </body>
// // </html>`;
// //     const w = window.open('', '_blank', 'width=700,height=900');
// //     w.document.write(html);
// //     w.document.close();
// //   };

// //   const totalBags = parseInt(seller.num_bags) || 0;
// //   let rawBags = [];
// //   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

// //   const bagRows = Array.from({ length: totalBags }, (_, i) => {
// //     const b = rawBags[i] || {};
// //     return {
// //       srno:     String(i + 1).padStart(3, '0'),
// //       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
// //       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
// //       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
// //       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
// //       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
// //       buyer:    b.buyer || '',
// //     };
// //   });

// //   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
// //   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
// //   const labourAmt   = 20 * totalBags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
// //   const advance     = parseFloat(seller.advance_amount) || 0;
// //   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 580, width: '95%', padding: 0, overflow: 'hidden', borderRadius: 10 }} onClick={e => e.stopPropagation()}>
// //         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:BLUE, color:'#fff' }}>
// //           <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
// //           <div style={{ display:'flex', gap:8 }}>
// //             <button onClick={printBill} style={{ background:'#fff', color:BLUE, border:'none', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
// //               <Printer size={13} /> Print / PDF (A5)
// //             </button>
// //             <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}><X size={18} /></button>
// //           </div>
// //         </div>
// //         <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f0f4ff' }}>
// //           <div style={{ display:'block' }}>
// //           <div ref={printRef} style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'3px solid #1a56db', borderRadius:4, position:'relative' }}>
// //             <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #a0bbf0', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>
// //             <div style={{ textAlign:'center', borderBottom:'2.5px double #1a56db', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
// //                 <span style={{ textAlign:'left' }}>Prop. Praveen V. Heggani<br/>Cell : 9611635183</span>
// //                 <div style={{ width:40, height:40, borderRadius:'50%', border:'2.5px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1a56db', background:'#eff6ff' }}>PH</div>
// //                 <span style={{ textAlign:'right' }}>Prop. Pramod V.Heggani<br/>Cell : 9448349836</span>
// //               </div>
// //               <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>Mr. Praveen Heggani</div>
// //               <div><span style={{ display:'inline-block', background:'#1a56db', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}>TAMARIND,GINGER,GARLIC,ONION &amp; Vegetables</span></div>
// //               <div style={{ fontSize:11, fontWeight:700 }}>ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //               <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}>Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //             </div>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
// //                 <span><strong style={{ color:'#1a56db' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
// //                 <span><strong style={{ color:'#1a56db' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
// //               </div>
// //               <div style={{ padding:'4px 8px', fontSize:11 }}>
// //                 <strong style={{ color:'#1a56db' }}>Cust. Name :</strong> {seller.name}
// //               </div>
// //             </div>
// //             <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
// //               <thead>
// //                 <tr>
// //                   {['SrNo.','Particular','Lott No.','Bags','Weight(KG)','RATE','Amount'].map(h => (
// //                     <th key={h} style={{ background:'#1a56db', color:'#fff', padding:'5px 4px', fontSize:9.5, fontWeight:700, border:'1px solid #1245b5', textAlign:'center' }}>{h}</th>
// //                   ))}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {bagRows.map((b, i) => {
// //                   const bg = i%2===0 ? '#ffffff' : '#eff6ff';
// //                   const td = (extra) => ({ border:'1px solid #b8cef0', padding:'4px 3px', fontSize:10, color:'#111', backgroundColor:bg, ...extra });
// //                   return (
// //                     <tr key={i}>
// //                       <td style={td({ textAlign:'center', fontWeight:700 })}>{b.srno}</td>
// //                       <td style={td({ textAlign:'left', fontWeight:700, padding:'4px 5px' })}>{b.material}</td>
// //                       <td style={td({ textAlign:'center', fontWeight:600, fontFamily:'monospace' })}>{b.lot}</td>
// //                       <td style={td({ textAlign:'center', fontWeight:700 })}>1</td>
// //                       <td style={td({ textAlign:'center', fontWeight:800 })}>{b.weight != null ? b.weight : '—'}</td>
// //                       <td style={td({ textAlign:'center', fontWeight:800 })}>{b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //                       <td style={td({ textAlign:'right', fontWeight:800, color:'#1a56db', padding:'4px 5px' })}>{b.amount != null ? inr(b.amount) : '—'}</td>
// //                     </tr>
// //                   );
// //                 })}
// //               </tbody>
// //               <tfoot>
// //                 <tr style={{ background:'#dbeafe', borderTop:'2px solid #1a56db' }}>
// //                   <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalWeight.toFixed(2)}</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af', fontWeight:700 }}>Gross Amt.</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1a56db', fontSize:13 }}>₹ {inr(grossAmount)}</td>
// //                 </tr>
// //               </tfoot>
// //             </table>
// //             <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
// //               <tbody>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Comm. (8%)</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td></tr>
// //                 <tr style={{ background:'#1a56db' }}>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:900, fontSize:16, textAlign:'right' }}>₹ {inr(Math.max(0, finalPay))}</td>
// //                 </tr>
// //               </tbody>
// //             </table>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
// //               <strong style={{ color:'#1a56db' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
// //             </div>
// //             <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>
// //             <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
// //               <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
// //               <div style={{ fontWeight:800, fontSize:11 }}>For – Mr. Praveen Heggani</div>
// //             </div>
// //           </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Edit Modal ───────────────────────────────────────────────
// // function EditModal({ seller, onClose, onSave }) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || (seller.serial_number + '/' + num);

// //   const [rows,    setRows]    = useState(() => getBags(seller));
// //   const [nBags,   setNBags]   = useState(String(num));
// //   const [advance, setAdvance] = useState(String(seller.advance_amount || ''));
// //   const [labour,  setLabour]  = useState('20');
// //   const [saving,  setSaving]  = useState(false);
// //   const [buyers,  setBuyers]  = useState([]);

// //   useEffect(() => {
// //     API.get('/api/buyers').then(res => {
// //       setBuyers(res.data.data || []);
// //     }).catch(() => {});
// //   }, []);

// //   const changeNBags = (v) => {
// //     setNBags(v);
// //     const n = parseInt(v) || 0;
// //     setRows(prev => Array.from({ length: n }, (_, i) =>
// //       prev[i] || { lot, weight: '', rate: '', amount: '', buyer: '' }
// //     ));
// //   };

// //   const update = (i, field, val) => {
// //     setRows(prev => prev.map((r, j) => {
// //       if (j !== i) return r;
// //       const next = { ...r, [field]: val };
// //       if (field === 'weight' || field === 'rate') {
// //         const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
// //         const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
// //         next.amount = w && rt ? ((w * rt) / 100).toFixed(2) : '';
// //       }
// //       return next;
// //     }));
// //   };

// //   const bags        = parseInt(nBags) || 0;
// //   const totalW      = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
// //   const grossAmount = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
// //   const labourAmt   = (parseFloat(labour) || 0) * bags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalDeduct = parseFloat((labourAmt + commission).toFixed(2));
// //   const netPayable  = parseFloat((grossAmount - totalDeduct).toFixed(2));
// //   const finalPay    = parseFloat((netPayable - (parseFloat(advance) || 0)).toFixed(2));

// //   const ratesDone = rows.filter(r => parseFloat(r.rate) > 0).length;
// //   const wtsDone   = rows.filter(r => parseFloat(r.weight) > 0).length;

// //   const save = async () => {
// //     if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
// //     setSaving(true);
// //     try {
// //       const bag_data = rows.map(r => ({
// //         lot,
// //         weight: parseFloat(r.weight) || 0,
// //         rate:   parseFloat(r.rate)   || 0,
// //         amount: parseFloat(r.amount) || 0,
// //         buyer:  r.buyer || '',
// //       }));
// //       await API.put('/api/sellers/' + seller.id, {
// //         num_bags:       bags,
// //         weight:         totalW,
// //         amount:         netPayable,
// //         advance_amount: parseFloat(advance) || 0,
// //         rate_fixed:     totalW > 0 && grossAmount > 0 ? parseFloat((grossAmount / totalW * 100).toFixed(2)) : 0,
// //         bag_data:       JSON.stringify(bag_data),
// //       });
// //       toast.success('Saved! Final payable: ₹' + fmtINR(finalPay));
// //       onSave(); onClose();
// //     } catch (err) {
// //       toast.error(err.response?.data?.error || err.message || 'Failed');
// //     } finally { setSaving(false); }
// //   };

// //   const iStyle = (val, col) => ({
// //     background:   val ? col + '11' : 'var(--bg-panel)',
// //     border:       '1px solid ' + (val ? col + '66' : 'var(--border-light)'),
// //     borderRadius: 7, padding: '8px 11px',
// //     color:        val ? col : 'var(--text-muted)',
// //     fontFamily:   'var(--font-body)', fontSize: 13, fontWeight: 700,
// //     outline: 'none', width: '100%',
// //   });

// //   const buyerOptions = buyers.map(b => {
// //     const display = (b.lot_number && b.lot_number !== '—') ? b.lot_number : b.name;
// //     return { value: display, label: display, fullName: b.name };
// //   });

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 960, width: '95%' }} onClick={e => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
// //           <button className="modal-close" onClick={onClose}><X size={20} /></button>
// //         </div>

// //         <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
// //           {[['Serial No',seller.serial_number],['Lot No',lot],
// //             ['Material',seller.material&&seller.material!=='GENERAL'?seller.material:'—'],
// //             ['Date',fmtDate(seller.entry_date)]
// //           ].map(([l,v])=>(
// //             <div key={l} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 13px', fontSize:12 }}>
// //               <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{l}</div>
// //               <div style={{ fontWeight:700 }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>

// //         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:18 }}>
// //           <div className="form-group">
// //             <label className="form-label">Number of Bags</label>
// //             <input className="form-input" type="number" value={nBags} onChange={e=>changeNBags(e.target.value)} min="1" max="100" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Advance Paid (₹)</label>
// //             <input className="form-input" type="number" value={advance} onChange={e=>setAdvance(e.target.value)} placeholder="0.00" step="0.01" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Labour Rate (₹ per bag)</label>
// //             <input className="form-input" type="number" value={labour} onChange={e=>setLabour(e.target.value)} placeholder="20" step="1" min="0" style={{ textTransform:'none' }}/>
// //           </div>
// //         </div>

// //         {rows.length > 0 && (
// //           <>
// //             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
// //               <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                 <Package size={15} style={{ color:'var(--accent)' }}/>
// //                 <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Bag-wise Details</span>
// //                 <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>Lot: {lot}</span>
// //                 <span style={{ fontSize:11, color:wtsDone===rows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
// //                   {wtsDone}/{rows.length} weights
// //                 </span>
// //               </div>
// //               <span style={{ fontSize:11, color:'var(--text-muted)' }}>Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
// //             </div>

// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
// //               {['#','Lot','Weight (kg)','Rate (₹/100kg)','Buyer','Amount (₹)'].map(h=>(
// //                 <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
// //               ))}
// //             </div>

// //             <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:300, overflowY:'auto' }}>
// //               {rows.map((r,i)=>(
// //                 <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<rows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
// //                   <div style={{ width:24, height:24, borderRadius:5, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>{i+1}</div>
// //                   <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lot}</div>
// //                   <input type="number" value={r.weight} onChange={e=>update(i,'weight',e.target.value)}
// //                     placeholder="Enter weight" step="0.01" min="0.01" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.weight,'#3b82f6')}
// //                     onFocus={e=>{e.target.style.borderColor='#3b82f6';e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.weight?'#3b82f666':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />
// //                   <input type="number" value={r.rate} onChange={e=>update(i,'rate',e.target.value)}
// //                     placeholder="e.g. 3200" step="0.01" min="0" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.rate,'#10b981')}
// //                     onFocus={e=>{e.target.style.borderColor='#10b981';e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.rate?'#10b98166':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />
// //                   <select
// //                     value={r.buyer || ''}
// //                     onChange={e => update(i, 'buyer', e.target.value)}
// //                     style={{
// //                       background: r.buyer ? 'rgba(139,92,246,0.1)' : 'var(--bg-panel)',
// //                       border: `1px solid ${r.buyer ? 'rgba(139,92,246,0.5)' : 'var(--border-light)'}`,
// //                       borderRadius: 7, padding: '8px 10px',
// //                       color: r.buyer ? '#a78bfa' : 'var(--text-muted)',
// //                       fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
// //                       outline: 'none', width: '100%', cursor: 'pointer',
// //                     }}
// //                   >
// //                     <option value="">— Select Buyer —</option>
// //                     {buyerOptions.map((b, idx) => (
// //                       <option key={idx} value={b.value}>{b.label}</option>
// //                     ))}
// //                   </select>
// //                   <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
// //                     {r.amount?'₹'+fmtINR(r.amount):'—'}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
// //               <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
// //               <div style={{ fontSize:12, color:ratesDone===rows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{rows.length} rates {ratesDone===rows.length?'✓':''}</div>
// //               <div style={{ fontSize:11, color:'var(--text-muted)' }}>{rows.filter(r=>r.buyer).length}/{rows.length} buyers assigned</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
// //             </div>
// //           </>
// //         )}

// //         {grossAmount > 0 && (
// //           <div style={{ marginTop:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
// //             <div style={{ background:'var(--bg-panel)', padding:'10px 18px', borderBottom:'1px solid var(--border)' }}>
// //               <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>💰 Payment Calculation</span>
// //             </div>
// //             <div>
// //               {[
// //                 { label:'Gross Amount',          sub:`${rows.length} bags × Rate`,      val:`₹ ${fmtINR(grossAmount)}`,               color:'var(--accent)',         fs:16 },
// //                 { label:'− Labour / Hamali',     sub:`₹${labour||20} × ${bags} bags`,  val:`− ₹ ${fmtINR(labourAmt)}`,              color:'var(--red)',            fs:15 },
// //                 { label:'− Other Charges ', sub:`8% of ₹${fmtINR(grossAmount)}`, val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
// //                 { label:'Net Amount',            sub:'Gross − Labour − Commission',     val:`₹ ${fmtINR(netPayable)}`,               color:'var(--blue)',           fs:16, highlight:true },
// //                 { label:'− Advance Already Paid',sub:'',                               val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`, color:'var(--text-secondary)', fs:15 },
// //               ].map((row, i)=>(
// //                 <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
// //                   <div>
// //                     <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
// //                     {row.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
// //                   </div>
// //                   <div style={{ fontSize:row.fs, fontWeight:800, color:row.color, fontFamily:'var(--font-display)' }}>{row.val}</div>
// //                 </div>
// //               ))}
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px', background:finalPay>=0?'var(--green-dim)':'var(--red-dim)' }}>
// //                 <div>
// //                   <div style={{ fontSize:15, fontWeight:800, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                     {finalPay >= 0 ? '✅ Final Amount to Pay Seller' : '⚠️ Seller Owes Back'}
// //                   </div>
// //                   <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Net − Advance</div>
// //                 </div>
// //                 <div style={{ fontSize:24, fontWeight:900, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                   ₹ {fmtINR(Math.abs(finalPay))}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
// //           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
// //           <button className="btn btn-primary" onClick={save} disabled={saving}>
// //             <Check size={15}/> {saving?'Saving...':'Save Changes'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Main ─────────────────────────────────────────────────────
// // export default function SellerList() {
// //   const [sellers,   setSellers]   = useState([]);
// //   const [loading,   setLoading]   = useState(true);
// //   const [search,    setSearch]    = useState('');
// //   const [fDate,     setFDate]     = useState(todayISO());
// //   const [fMat,      setFMat]      = useState('');
// //   const [bill,      setBill]      = useState(null);
// //   const [editing,   setEditing]   = useState(null);
// //   const [confirm,   setConfirm]   = useState(null);
// //   // ✅ NEW: checkbox selection state
// //   const [selected,  setSelected]  = useState(new Set());

// //   const load = useCallback(async () => {
// //     setLoading(true);
// //     setSelected(new Set()); // clear selection on reload
// //     try {
// //       const res = await API.get('/api/sellers', { params: fDate ? { date: fDate } : {} });
// //       // Sort ascending by serial_number so newest entries appear at the bottom
// //       const sorted = [...(res.data.data || [])].sort((a, b) =>
// //         (parseInt(a.serial_number) || 0) - (parseInt(b.serial_number) || 0)
// //       );
// //       setSellers(sorted);
// //     } catch(err) { toast.error(err.message||'Load failed'); }
// //     finally { setLoading(false); }
// //   }, [fDate]);

// //   useEffect(() => { load(); }, [load]);

// //   const del = (id, name) => setConfirm({
// //     title: 'Delete Seller?',
// //     message: `"${name}" will be permanently removed.`,
// //     onConfirm: async () => {
// //       try { await API.delete(`/api/sellers/${id}`); toast.success('Deleted'); load(); }
// //       catch(err) { toast.error(err.message||'Failed'); }
// //     }
// //   });

// //   const clear = () => { setSearch(''); setFDate(todayISO()); setFMat(''); };

// //   const list = sellers.filter(s => {
// //     const q = search.toLowerCase();
// //     return (!q || [s.name,s.mobile,s.lot_number,s.serial_number,s.material].some(v=>v?.toLowerCase().includes(q)))
// //       && (!fMat || s.material===fMat);
// //   });

// //   // ─── Selection helpers ────────────────────────────────────
// //   const allIds        = list.map(s => s.id);
// //   const allSelected   = allIds.length > 0 && allIds.every(id => selected.has(id));
// //   const someSelected  = allIds.some(id => selected.has(id));
// //   const selectedCount = allIds.filter(id => selected.has(id)).length;

// //   const toggleAll = () => {
// //     if (allSelected) {
// //       // deselect all in current list
// //       setSelected(prev => {
// //         const next = new Set(prev);
// //         allIds.forEach(id => next.delete(id));
// //         return next;
// //       });
// //     } else {
// //       setSelected(prev => {
// //         const next = new Set(prev);
// //         allIds.forEach(id => next.add(id));
// //         return next;
// //       });
// //     }
// //   };

// //   const toggleOne = (id) => {
// //     setSelected(prev => {
// //       const next = new Set(prev);
// //       next.has(id) ? next.delete(id) : next.add(id);
// //       return next;
// //     });
// //   };

// //   // ─── Bulk print ───────────────────────────────────────────
// //   const handlePrintAll = () => {
// //     const toprint = list.filter(s => selected.has(s.id));
// //     if (toprint.length === 0) { toast.error('Select at least one seller to print'); return; }
// //     // Sort by serial number ascending
// //     const sorted = [...toprint].sort((a, b) =>
// //       (parseInt(a.serial_number) || 0) - (parseInt(b.serial_number) || 0)
// //     );
// //     const dateLabel = fDate || todayISO();
// //     printAllBills(sorted, dateLabel);
// //   };

// //   const tot = list.reduce((a,s)=>({
// //     bags: a.bags+Number(s.num_bags||0), wt: a.wt+Number(s.weight||0),
// //     adv:  a.adv+Number(s.advance_amount||0), amt: a.amt+Number(s.amount||0),
// //   }),{ bags:0, wt:0, adv:0, amt:0 });

// //   // Checkbox style
// //   const cbStyle = (checked) => ({
// //     width: 18, height: 18, cursor: 'pointer', accentColor: '#1a56db',
// //     flexShrink: 0,
// //   });

// //   return (
// //     <div>
// //       <div className="page-header">
// //         <div>
// //           <div className="page-title">Seller List</div>
// //           <div className="page-subtitle">
// //             {loading ? 'Loading...' : `${sellers.length} sellers${fDate ? ` for ${fDate}` : ''}`}
// //           </div>
// //         </div>
// //         <div style={{ display:'flex', gap:8, alignItems:'center' }}>
// //           {/* ✅ Print All button — only shows when something selected */}
// //           {selectedCount > 0 && (
// //             <button
// //               className="btn btn-primary"
// //               onClick={handlePrintAll}
// //               style={{ display:'flex', alignItems:'center', gap:6, background:'#1a56db', color:'#fff', fontWeight:700, fontSize:13, padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer' }}
// //             >
// //               <Printer size={15}/>
// //               Print All ({selectedCount}) Bills
// //             </button>
// //           )}
// //           <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
// //         </div>
// //       </div>

// //       <div className="filter-bar">
// //         <div className="search-box" style={{ flex:2 }}>
// //           <Search className="search-icon" size={16}/>
// //           <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, lot no..." style={{ textTransform:'none' }}/>
// //         </div>
// //         <input className="form-input" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{ textTransform:'none', flex:1 }}/>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())} title="Today">Today</button>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')} title="All dates">All</button>
// //         <select className="form-select" value={fMat} onChange={e=>setFMat(e.target.value)} style={{ flex:1 }}>
// //           <option value="">All Materials</option>
// //           {MATERIALS.map(m=><option key={m}>{m}</option>)}
// //         </select>
// //         {(search||fMat)&&<button className="btn btn-secondary" onClick={clear}><X size={14}/> Clear</button>}
// //       </div>

// //       {/* ✅ Selection info bar */}
// //       {list.length > 0 && (
// //         <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, padding:'8px 14px', background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8 }}>
// //           <button
// //             onClick={toggleAll}
// //             style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:'none', cursor:'pointer', color:'var(--text-primary)', fontWeight:700, fontSize:13, padding:0 }}
// //           >
// //             {allSelected
// //               ? <CheckSquare size={18} color="#1a56db"/>
// //               : someSelected
// //                 ? <CheckSquare size={18} color="#94a3b8"/>
// //                 : <Square size={18} color="#94a3b8"/>
// //             }
// //             {allSelected ? 'Deselect All' : 'Select All'}
// //           </button>
// //           {selectedCount > 0 && (
// //             <>
// //               <span style={{ color:'var(--text-muted)', fontSize:12 }}>|</span>
// //               <span style={{ fontSize:12, color:'#1a56db', fontWeight:600 }}>
// //                 {selectedCount} of {list.length} selected
// //               </span>
// //               <button
// //                 onClick={() => setSelected(new Set())}
// //                 style={{ fontSize:11, color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}
// //               >
// //                 Clear
// //               </button>
// //               <button
// //                 onClick={handlePrintAll}
// //                 style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5, background:'#1a56db', color:'#fff', border:'none', borderRadius:7, padding:'5px 14px', fontWeight:700, fontSize:12, cursor:'pointer' }}
// //               >
// //                 <Printer size={13}/> Print {selectedCount} Bill{selectedCount>1?'s':''}
// //               </button>
// //             </>
// //           )}
// //         </div>
// //       )}

// //       {list.length>0&&(
// //         <div style={{ display:'flex', gap:12, marginBottom:16 }}>
// //           {[['Sellers',list.length,'var(--accent)'],['Bags',tot.bags,'var(--green)'],
// //             ['Weight',fmtNum(tot.wt)+' kg','var(--blue)'],['Amount','₹ '+fmtINR(tot.amt),'var(--purple)'],
// //             ['Advance','₹ '+fmtINR(tot.adv),'var(--text-secondary)']
// //           ].map(([l,v,c])=>(
// //             <div key={l} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
// //               <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{l}</div>
// //               <div style={{ fontSize:15, fontWeight:800, color:c, fontFamily:'var(--font-display)' }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       <div className="table-wrapper">
// //         {loading?<div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading...</div>
// //         :list.length===0?(
// //           <div className="empty-state">
// //             <div className="empty-state-icon">👨‍🌾</div>
// //             <h3>{fDate ? `No sellers registered for ${fDate}` : 'No sellers found'}</h3>
// //             <p style={{ fontSize:12, marginTop:6, color:'var(--text-muted)' }}>
// //               {fDate ? 'Click "All" to see all sellers, or change the date' : 'Register a seller to get started'}
// //             </p>
// //             {fDate && (
// //               <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'center' }}>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')}>Show All Sellers</button>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())}>Today</button>
// //               </div>
// //             )}
// //           </div>
// //         ):(
// //           <table>
// //             <thead>
// //               <tr>
// //                 {/* ✅ Checkbox column header */}
// //                 <th style={{ width:38, textAlign:'center', padding:'10px 8px' }}>
// //                   <input
// //                     type="checkbox"
// //                     checked={allSelected}
// //                     ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
// //                     onChange={toggleAll}
// //                     style={cbStyle(allSelected)}
// //                     title="Select all"
// //                   />
// //                 </th>
// //                 <th>#</th><th>Sr</th><th>Name</th><th>Mobile</th><th>Material</th>
// //                 <th>Bags</th><th>Lot</th><th>Weight</th><th>Amount</th><th>Advance</th><th>Balance</th><th>Date</th>
// //                 <th style={{ textAlign:'center' }}>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {list.map((s,i)=>{
// //                 const bal=(s.amount||0)-(s.advance_amount||0);
// //                 let bags=[]; try{bags=JSON.parse(s.bag_data||'[]')}catch{}
// //                 const rd=bags.filter(b=>Number(b.rate)>0).length;
// //                 const isChecked = selected.has(s.id);
// //                 return(
// //                   <tr
// //                     key={s.id}
// //                     style={{ background: isChecked ? 'rgba(26,86,219,0.07)' : undefined, cursor:'default' }}
// //                   >
// //                     {/* ✅ Per-row checkbox */}
// //                     <td style={{ textAlign:'center', padding:'10px 8px' }}>
// //                       <input
// //                         type="checkbox"
// //                         checked={isChecked}
// //                         onChange={() => toggleOne(s.id)}
// //                         style={cbStyle(isChecked)}
// //                       />
// //                     </td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{i+1}</td>
// //                     <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
// //                     <td style={{ fontWeight:600 }}>{s.name}</td>
// //                     <td className="td-muted">{s.mobile&&s.mobile!=='0000000000'?s.mobile:'—'}</td>
// //                     <td>{s.material&&s.material!=='GENERAL'
// //                       ?<span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
// //                       :<span className="td-muted">—</span>}
// //                     </td>
// //                     <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
// //                     <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
// //                     <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
// //                     <td style={{ fontWeight:700, color:'var(--accent)' }}>
// //                       {s.amount?`₹${fmtINR(s.amount)}`:<span style={{ fontSize:11, color:'var(--text-muted)' }}>{rd}/{bags.length} rates</span>}
// //                     </td>
// //                     <td className="td-muted">{s.advance_amount?`₹${fmtINR(s.advance_amount)}`:'—'}</td>
// //                     <td style={{ fontWeight:600, color:bal>0?'var(--red)':'var(--green)' }}>{s.amount?`₹${fmtINR(bal)}`:'—'}</td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
// //                     <td>
// //                       <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
// //                         <button className="btn btn-blue btn-sm" onClick={()=>setEditing(s)} title="Edit"><Edit2 size={13}/></button>
// //                         <button className="btn btn-green btn-sm" onClick={()=>setBill(s)} title="Bill"><Eye size={13}/></button>
// //                         <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={()=>setBill(s)} title="Print"><Printer size={13}/></button>
// //                         <button className="btn btn-red btn-sm" onClick={()=>del(s.id,s.name)} title="Delete"><Trash2 size={13}/></button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 );
// //               })}
// //             </tbody>
// //             {list.length>1&&(
// //               <tfoot>
// //                 <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
// //                   <td colSpan={6} style={{ padding:'11px 15px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({list.length})</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{tot.bags}</td>
// //                   <td/>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{fmtNum(tot.wt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(tot.amt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700 }}>₹{fmtINR(tot.adv)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(tot.amt-tot.adv)}</td>
// //                   <td colSpan={2}/>
// //                 </tr>
// //               </tfoot>
// //             )}
// //           </table>
// //         )}
// //       </div>

// //       {bill    && <BillModal  seller={bill}    onClose={()=>setBill(null)}/>}
// //       {editing && <EditModal  seller={editing} onClose={()=>setEditing(null)} onSave={load}/>}
// //       {confirm && <ConfirmDialog {...confirm}  onClose={()=>setConfirm(null)}/>}

// //       <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>
// //     </div>
// //   );
// // }




// // --------------------------------------------------------------------------------------------------------


// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import toast from 'react-hot-toast';
// // import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package, CheckSquare } from 'lucide-react';
// // import axios from 'axios';
// // import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// // import ConfirmDialog from '../ConfirmDialog';

// // // const API = axios.create({ baseURL: '' });
// // const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

// // const todayISO = () => new Date().toISOString().split('T')[0];

// // // ─── Parse bag_data ───────────────────────────────────────────
// // function getBags(seller) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || `${seller.serial_number}/${num}`;
// //   let raw = [];
// //   try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
// //   return Array.from({ length: num }, (_, i) => {
// //     const b = raw[i] || {};
// //     return {
// //       lot,
// //       weight: Number(b.weight) > 0 ? String(b.weight) : '',
// //       rate:   Number(b.rate)   > 0 ? String(b.rate)   : '',
// //       amount: Number(b.amount) > 0 ? String(b.amount) : '',
// //       buyer:  b.buyer || '',
// //     };
// //   });
// // }

// // // ─── Number to Indian Words ───────────────────────────────────
// // function toIndianWords(amount) {
// //   const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
// //     'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
// //   const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
// //   function conv(n) {
// //     if (n === 0) return '';
// //     if (n < 20) return ones[n];
// //     if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
// //     if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+conv(n%100) : '');
// //     if (n < 100000) return conv(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' '+conv(n%1000) : '');
// //     if (n < 10000000) return conv(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' '+conv(n%100000) : '');
// //     return conv(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' '+conv(n%10000000) : '');
// //   }
// //   const intPart = Math.floor(Math.abs(amount));
// //   const decPart = Math.round((Math.abs(amount) - intPart) * 100);
// //   let words = conv(intPart) + ' Rupees';
// //   if (decPart > 0) words += ' and ' + conv(decPart) + ' Paise';
// //   return words || 'Zero Rupees';
// // }

// // const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // // ─── Build single bill HTML (no Buyer column) ─────────────────
// // function buildBillHTML(seller) {
// //   const totalBags = parseInt(seller.num_bags) || 0;
// //   let rawBags = [];
// //   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

// //   const bagRows = Array.from({ length: totalBags }, (_, i) => {
// //     const b = rawBags[i] || {};
// //     return {
// //       srno:     String(i + 1).padStart(3, '0'),
// //       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
// //       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
// //       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
// //       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
// //       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
// //     };
// //   });

// //   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
// //   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
// //   const labourAmt   = 20 * totalBags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalExp    = parseFloat((labourAmt + commission).toFixed(2));
// //   const netAmount   = parseFloat((grossAmount - totalExp).toFixed(2));
// //   const advance     = parseFloat(seller.advance_amount) || 0;
// //   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

// //   const bagRowsHtml = bagRows.map((b, i) => `
// //     <tr style="background:${i%2===0?'#ffffff':'#eff6ff'}">
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;color:#333">${b.srno}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:left;font-size:10px;font-weight:700;color:#1a1a1a">${b.material}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-family:monospace;color:#444">${b.lot}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:600;color:#333">1</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#1e40af">${b.weight != null ? b.weight : '—'}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#166534">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:right;font-size:10px;font-weight:800;color:#1a56db">${b.amount != null ? inr(b.amount) : '—'}</td>
// //     </tr>`).join('');

// //   return {
// //     html: `
// // <div class="page-wrapper" style="border:3px solid #1a56db;border-radius:4px;padding:10px;position:relative;margin-bottom:12px;page-break-after:always;">
// //   <div style="position:absolute;top:4px;left:4px;right:4px;bottom:4px;border:1px solid #a0bbf0;border-radius:2px;pointer-events:none;"></div>
// //   <div style="text-align:center;border-bottom:2.5px double #1a56db;padding-bottom:8px;margin-bottom:7px;">
// //     <div style="display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#444;margin-bottom:4px;">
// //       <span style="text-align:left">Prop. Praveen V. Heggani<br>Cell : 9611635183</span>
// //       <div style="width:36px;height:36px;border-radius:50%;border:2.5px solid #1a56db;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#1a56db;background:#eff6ff;">PH</div>
// //       <span style="text-align:right">Prop. Pramod V.Heggani<br>Cell : 9448349836</span>
// //     </div>
// //     <div style="font-size:20px;font-weight:900;color:#1a1a1a;line-height:1.1;margin:3px 0;">Mr. Praveen Heggani</div>
// //     <div><span style="display:inline-block;background:#1a56db;color:#fff;font-size:8px;font-weight:700;letter-spacing:1.2px;padding:2px 12px;border-radius:2px;margin:3px 0 1px;">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
// //     <div style="font-size:10px;font-weight:700;color:#333;">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //     <div style="font-size:9px;color:#666;margin-top:2px;">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //   </div>
// //   <div style="border:1.5px solid #1a56db;border-radius:3px;margin-bottom:6px;overflow:hidden;">
// //     <div style="display:flex;justify-content:space-between;padding:5px 9px;font-size:10px;border-bottom:1px solid #cfe2ff;">
// //       <span><strong style="color:#1a56db">Bill No :</strong> ${seller.serial_number || '—'}</span>
// //       <span><strong style="color:#1a56db">Date :</strong> ${fmtDate(seller.entry_date)}</span>
// //     </div>
// //     <div style="padding:4px 9px;font-size:10px;"><span><strong style="color:#1a56db">Cust. Name :</strong> ${seller.name}</span></div>
// //   </div>
// //   <table style="width:100%;border-collapse:collapse;margin-bottom:1px;">
// //     <thead>
// //       <tr>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">SrNo.</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Particular</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Lott No.</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Bags</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Weight(KG)</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">RATE</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Amount</th>
// //       </tr>
// //     </thead>
// //     <tbody>${bagRowsHtml}</tbody>
// //     <tfoot>
// //       <tr style="background:#dbeafe;border-top:2px solid #1a56db;">
// //         <td colspan="3" style="border:1px solid #b8cef0;padding:6px 6px;font-weight:800;color:#1e40af;text-align:left;">TOTAL</td>
// //         <td style="border:1px solid #b8cef0;padding:6px 4px;text-align:center;font-weight:800;color:#111;">${totalBags}</td>
// //         <td style="border:1px solid #b8cef0;padding:6px 4px;text-align:center;font-weight:800;color:#1e40af;">${totalWeight.toFixed(2)}</td>
// //         <td style="border:1px solid #b8cef0;padding:6px 4px;text-align:right;font-size:9px;color:#1e40af;font-weight:600;">Gross Amt.</td>
// //         <td style="border:1px solid #b8cef0;padding:6px 6px;text-align:right;font-weight:800;color:#1a56db;font-size:13px;">&#8377; ${inr(grossAmount)}</td>
// //       </tr>
// //     </tfoot>
// //   </table>
// //   <table style="width:100%;border-collapse:collapse;margin-top:2px;">
// //     <tbody>
// //       <tr><td style="border:1px solid #b8cef0;padding:6px 9px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;width:58%;">Other Charges </td><td style="border:1px solid #b8cef0;padding:6px 9px;text-align:right;font-weight:700;color:#dc2626;">− ₹ ${inr(commission)}</td></tr>
// //       <tr><td style="border:1px solid #b8cef0;padding:6px 9px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Hamali / Labour Charges</td><td style="border:1px solid #b8cef0;padding:6px 9px;text-align:right;font-weight:700;color:#dc2626;">− ₹ ${inr(labourAmt)}</td></tr>
// //       <tr><td style="border:1px solid #b8cef0;padding:6px 9px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Advance Paid</td><td style="border:1px solid #b8cef0;padding:6px 9px;text-align:right;font-weight:700;color:#dc2626;">− ₹ ${inr(advance)}</td></tr>
// //       <tr style="background:#1a56db;">
// //         <td style="padding:9px 10px;color:#fff;font-weight:900;font-size:13px;">NET AMOUNT</td>
// //         <td style="padding:9px 10px;color:#fff;font-weight:900;font-size:15px;text-align:right;">&#8377; ${inr(Math.max(0, finalPay))}</td>
// //       </tr>
// //     </tbody>
// //   </table>
// //   <div style="border:1.5px solid #1a56db;border-radius:3px;padding:5px 9px;font-size:10px;margin-top:6px;background:#f8fbff;">
// //     <strong style="color:#1a56db;">In Words :</strong> ${toIndianWords(Math.max(0, finalPay))} Only
// //   </div>
// //   <div style="text-align:right;font-size:9px;color:#888;margin-top:3px;font-style:italic;">(E.&amp;O.E.)</div>
// //   <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:18px;">
// //     <div style="text-align:center;border-top:1px solid #555;padding-top:4px;font-size:9.5px;width:120px;color:#444;">Receiver's Sign.</div>
// //     <div style="font-weight:800;font-size:11px;">For – Mr. Praveen Heggani</div>
// //   </div>
// // </div>`,
// //     finalPay,
// //   };
// // }

// // // ─── Bulk print all selected sellers ─────────────────────────
// // function printMultipleBills(sellers) {
// //   const billsHtml = sellers.map(s => buildBillHTML(s).html).join('');

// //   const fullHtml = `<!DOCTYPE html>
// // <html>
// // <head>
// //   <meta charset="UTF-8">
// //   <title>Bills — ${sellers.length} Sellers</title>
// //   <style>
// //     @page { size: A5; margin: 8mm; }
// //     * { box-sizing: border-box; margin: 0; padding: 0; }
// //     body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }
// //     @media print {
// //       body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
// //       .page-wrapper { page-break-after: always; }
// //       .page-wrapper:last-child { page-break-after: avoid; }
// //     }
// //   </style>
// // </head>
// // <body>
// // ${billsHtml}
// // <script>window.onload = function(){ window.print(); }<\/script>
// // </body>
// // </html>`;

// //   if (window.electronAPI && window.electronAPI.printHTML) {
// //     window.electronAPI.printHTML(fullHtml);
// //   } else {
// //     const w = window.open('', '_blank', 'width=900,height=750');
// //     if (w && w.document) {
// //       w.document.write(fullHtml);
// //       w.document.close();
// //     }
// //   }
// // }

// // // ─── Bill Modal (no Buyer column) ────────────────────────────
// // function BillModal({ seller, onClose }) {
// //   const BLUE = '#1a56db';

// //   const totalBags = parseInt(seller.num_bags) || 0;
// //   let rawBags = [];
// //   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

// //   const bagRows = Array.from({ length: totalBags }, (_, i) => {
// //     const b = rawBags[i] || {};
// //     return {
// //       srno:     String(i + 1).padStart(3, '0'),
// //       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
// //       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
// //       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
// //       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
// //       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
// //     };
// //   });

// //   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
// //   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
// //   const labourAmt   = 20 * totalBags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalExp    = parseFloat((labourAmt + commission).toFixed(2));
// //   const netAmount   = parseFloat((grossAmount - totalExp).toFixed(2));
// //   const advance     = parseFloat(seller.advance_amount) || 0;
// //   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

// //   const printBill = () => {
// //     const { html } = buildBillHTML(seller);
// //     const fullHtml = `<!DOCTYPE html>
// // <html>
// // <head>
// //   <meta charset="UTF-8">
// //   <title>Bill — ${seller.name}</title>
// //   <style>
// //     @page { size: A5; margin: 8mm; }
// //     * { box-sizing: border-box; margin: 0; padding: 0; }
// //     body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }
// //     @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
// //   </style>
// // </head>
// // <body>${html}
// // <script>window.onload = function(){ window.print(); }<\/script>
// // </body></html>`;

// //     if (window.electronAPI && window.electronAPI.printHTML) {
// //       window.electronAPI.printHTML(fullHtml);
// //     } else {
// //       const w = window.open('', '_blank', 'width=900,height=750');
// //       if (w && w.document) { w.document.write(fullHtml); w.document.close(); }
// //     }
// //   };

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 560, width: '95%', padding: 0, overflow: 'hidden', borderRadius: 10 }} onClick={e => e.stopPropagation()}>
// //         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:BLUE, color:'#fff' }}>
// //           <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
// //           <div style={{ display:'flex', gap:8 }}>
// //             <button onClick={printBill} style={{ background:'#fff', color:BLUE, border:'none', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
// //               <Printer size={13} /> Print / PDF (A5)
// //             </button>
// //             <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}><X size={18} /></button>
// //           </div>
// //         </div>
// //         <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f0f4ff' }}>
// //           <div style={{ all:'initial', display:'block' }}>
// //           <div style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'3px solid #1a56db', borderRadius:4, position:'relative' }}>
// //             <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #a0bbf0', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>
// //             <div style={{ textAlign:'center', borderBottom:'2.5px double #1a56db', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
// //                 <span style={{ textAlign:'left' }}>Prop. Praveen V. Heggani<br/>Cell : 9611635183</span>
// //                 <div style={{ width:40, height:40, borderRadius:'50%', border:'2.5px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1a56db', background:'#eff6ff' }}>PH</div>
// //                 <span style={{ textAlign:'right' }}>Prop. Pramod V.Heggani<br/>Cell : 9448349836</span>
// //               </div>
// //               <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>Mr. Praveen Heggani</div>
// //               <div><span style={{ display:'inline-block', background:'#1a56db', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}>TAMARIND,GINGER,GARLIC,ONION &amp; Vegetables</span></div>
// //               <div style={{ fontSize:11, fontWeight:700 }}>ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //               <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}>Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //             </div>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
// //                 <span><strong style={{ color:'#1a56db' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
// //                 <span><strong style={{ color:'#1a56db' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
// //               </div>
// //               <div style={{ padding:'4px 8px', fontSize:11 }}>
// //                 <strong style={{ color:'#1a56db' }}>Cust. Name :</strong> {seller.name}
// //               </div>
// //             </div>
// //             {/* Table — no Buyer column */}
// //             <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
// //               <thead>
// //                 <tr>
// //                   {['SrNo.','Particular','Lott No.','Bags','Weight(KG)','RATE','Amount'].map(h => (
// //                     <th key={h} style={{ background:'#1a56db', color:'#fff', padding:'5px 4px', fontSize:9.5, fontWeight:700, border:'1px solid #1245b5', textAlign:'center' }}>{h}</th>
// //                   ))}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {bagRows.map((b, i) => (
// //                   <tr key={i} style={{ background: i%2===0 ? '#fff':'#eff6ff' }}>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, color:'#111' }}>{b.srno}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'left', fontSize:10, fontWeight:700, color:'#111' }}>{b.material}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontFamily:'monospace', color:'#333' }}>{b.lot}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:600, color:'#111' }}>1</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#1e40af' }}>{b.weight != null ? b.weight : '—'}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#166534' }}>{b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'right', fontSize:10, fontWeight:800, color:'#1a56db' }}>{b.amount != null ? inr(b.amount) : '—'}</td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //               <tfoot>
// //                 <tr style={{ background:'#dbeafe', borderTop:'2px solid #1a56db' }}>
// //                   <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#1e40af' }}>{totalWeight.toFixed(2)}</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af' }}>Gross Amt.</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1a56db', fontSize:13 }}>₹ {inr(grossAmount)}</td>
// //                 </tr>
// //               </tfoot>
// //             </table>
// //             <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
// //               <tbody>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Other Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td></tr>
// //                 <tr style={{ background:'#1a56db' }}>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:900, fontSize:16, textAlign:'right' }}>₹ {inr(Math.max(0, finalPay))}</td>
// //                 </tr>
// //               </tbody>
// //             </table>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
// //               <strong style={{ color:'#1a56db' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
// //             </div>
// //             <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>
// //             <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
// //               <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
// //               <div style={{ fontWeight:800, fontSize:11 }}>For – Mr. Praveen V. Heggani</div>
// //             </div>
// //           </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Edit Modal ───────────────────────────────────────────────
// // function EditModal({ seller, onClose, onSave }) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || (seller.serial_number + '/' + num);

// //   const [rows,    setRows]    = useState(() => getBags(seller));
// //   const [nBags,   setNBags]   = useState(String(num));
// //   const [advance, setAdvance] = useState(String(seller.advance_amount || ''));
// //   const [labour,  setLabour]  = useState('20');
// //   const [saving,  setSaving]  = useState(false);
// //   const [buyers,  setBuyers]  = useState([]);

// //   useEffect(() => {
// //     API.get('/api/buyers').then(res => {
// //       setBuyers(res.data.data || []);
// //     }).catch(() => {});
// //   }, []);

// //   const changeNBags = (v) => {
// //     setNBags(v);
// //     const n = parseInt(v) || 0;
// //     setRows(prev => Array.from({ length: n }, (_, i) =>
// //       prev[i] || { lot, weight: '', rate: '', amount: '', buyer: '' }
// //     ));
// //   };

// //   const update = (i, field, val) => {
// //     setRows(prev => prev.map((r, j) => {
// //       if (j !== i) return r;
// //       const next = { ...r, [field]: val };
// //       if (field === 'weight' || field === 'rate') {
// //         const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
// //         const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
// //         next.amount = w && rt ? ((w * rt) / 100).toFixed(2) : '';
// //       }
// //       return next;
// //     }));
// //   };

// //   const bags        = parseInt(nBags) || 0;
// //   const totalW      = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
// //   const grossAmount = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
// //   const labourAmt   = (parseFloat(labour) || 0) * bags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalDeduct = parseFloat((labourAmt + commission).toFixed(2));
// //   const netPayable  = parseFloat((grossAmount - totalDeduct).toFixed(2));
// //   const finalPay    = parseFloat((netPayable - (parseFloat(advance) || 0)).toFixed(2));

// //   const ratesDone = rows.filter(r => parseFloat(r.rate) > 0).length;
// //   const wtsDone   = rows.filter(r => parseFloat(r.weight) > 0).length;

// //   const save = async () => {
// //     if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
// //     setSaving(true);
// //     try {
// //       const bag_data = rows.map(r => ({
// //         lot,
// //         weight: parseFloat(r.weight) || 0,
// //         rate:   parseFloat(r.rate)   || 0,
// //         amount: parseFloat(r.amount) || 0,
// //         buyer:  r.buyer || '',
// //       }));
// //       await API.put('/api/sellers/' + seller.id, {
// //         num_bags:       bags,
// //         weight:         totalW,
// //         amount:         netPayable,
// //         advance_amount: parseFloat(advance) || 0,
// //         rate_fixed:     totalW > 0 && grossAmount > 0 ? parseFloat((grossAmount / totalW * 100).toFixed(2)) : 0,
// //         bag_data:       JSON.stringify(bag_data),
// //       });
// //       toast.success('Saved! Final payable: ₹' + fmtINR(finalPay));
// //       onSave(); onClose();
// //     } catch (err) {
// //       toast.error(err.response?.data?.error || err.message || 'Failed');
// //     } finally { setSaving(false); }
// //   };

// //   const iStyle = (val, col) => ({
// //     background:   val ? col + '11' : 'var(--bg-panel)',
// //     border:       '1px solid ' + (val ? col + '66' : 'var(--border-light)'),
// //     borderRadius: 7, padding: '8px 11px',
// //     color:        val ? col : 'var(--text-muted)',
// //     fontFamily:   'var(--font-body)', fontSize: 13, fontWeight: 700,
// //     outline: 'none', width: '100%',
// //   });

// //   const buyerOptions = buyers.map(b => {
// //     const display = (b.lot_number && b.lot_number !== '—') ? b.lot_number : b.name;
// //     return { value: display, label: display, fullName: b.name };
// //   });

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 960, width: '95%' }} onClick={e => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
// //           <button className="modal-close" onClick={onClose}><X size={20} /></button>
// //         </div>

// //         <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
// //           {[['Serial No',seller.serial_number],['Lot No',lot],
// //             ['Material',seller.material&&seller.material!=='GENERAL'?seller.material:'—'],
// //             ['Date',fmtDate(seller.entry_date)]
// //           ].map(([l,v])=>(
// //             <div key={l} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 13px', fontSize:12 }}>
// //               <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{l}</div>
// //               <div style={{ fontWeight:700 }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>

// //         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:18 }}>
// //           <div className="form-group">
// //             <label className="form-label">Number of Bags</label>
// //             <input className="form-input" type="number" value={nBags} onChange={e=>changeNBags(e.target.value)} min="1" max="100" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Advance Paid (₹)</label>
// //             <input className="form-input" type="number" value={advance} onChange={e=>setAdvance(e.target.value)} placeholder="0.00" step="0.01" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Labour Rate (₹ per bag)</label>
// //             <input className="form-input" type="number" value={labour} onChange={e=>setLabour(e.target.value)} placeholder="20" step="1" min="0" style={{ textTransform:'none' }}/>
// //           </div>
// //         </div>

// //         {rows.length > 0 && (
// //           <>
// //             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
// //               <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                 <Package size={15} style={{ color:'var(--accent)' }}/>
// //                 <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Bag-wise Details</span>
// //                 <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>Lot: {lot}</span>
// //                 <span style={{ fontSize:11, color:wtsDone===rows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
// //                   {wtsDone}/{rows.length} weights
// //                 </span>
// //               </div>
// //               <span style={{ fontSize:11, color:'var(--text-muted)' }}>Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
// //             </div>

// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
// //               {['#','Lot','Weight (kg)','Rate (₹/100kg)','Buyer','Amount (₹)'].map(h=>(
// //                 <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
// //               ))}
// //             </div>

// //             <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:300, overflowY:'auto' }}>
// //               {rows.map((r,i)=>(
// //                 <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<rows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
// //                   <div style={{ width:24, height:24, borderRadius:5, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>{i+1}</div>
// //                   <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lot}</div>
// //                   <input type="number" value={r.weight} onChange={e=>update(i,'weight',e.target.value)}
// //                     placeholder="Enter weight" step="0.01" min="0.01" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.weight,'#3b82f6')}
// //                     onFocus={e=>{e.target.style.borderColor='#3b82f6';e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.weight?'#3b82f666':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />
// //                   <input type="number" value={r.rate} onChange={e=>update(i,'rate',e.target.value)}
// //                     placeholder="e.g. 3200" step="0.01" min="0" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.rate,'#10b981')}
// //                     onFocus={e=>{e.target.style.borderColor='#10b981';e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.rate?'#10b98166':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />
// //                   <select value={r.buyer || ''} onChange={e => update(i, 'buyer', e.target.value)}
// //                     style={{ background: r.buyer ? 'rgba(139,92,246,0.1)' : 'var(--bg-panel)', border: `1px solid ${r.buyer ? 'rgba(139,92,246,0.5)' : 'var(--border-light)'}`, borderRadius: 7, padding: '8px 10px', color: r.buyer ? '#a78bfa' : 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, outline: 'none', width: '100%', cursor: 'pointer' }}
// //                   >
// //                     <option value="">— Select Buyer —</option>
// //                     {buyerOptions.map((b, idx) => (
// //                       <option key={idx} value={b.value}>{b.label}</option>
// //                     ))}
// //                   </select>
// //                   <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
// //                     {r.amount?'₹'+fmtINR(r.amount):'—'}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
// //               <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
// //               <div style={{ fontSize:12, color:ratesDone===rows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{rows.length} rates {ratesDone===rows.length?'✓':''}</div>
// //               <div style={{ fontSize:11, color:'var(--text-muted)' }}>{rows.filter(r=>r.buyer).length}/{rows.length} buyers assigned</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
// //             </div>
// //           </>
// //         )}

// //         {grossAmount > 0 && (
// //           <div style={{ marginTop:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
// //             <div style={{ background:'var(--bg-panel)', padding:'10px 18px', borderBottom:'1px solid var(--border)' }}>
// //               <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>💰 Payment Calculation</span>
// //             </div>
// //             <div>
// //               {[
// //                 { label:'Gross Amount',          sub:`${rows.length} bags × Rate`,      val:`₹ ${fmtINR(grossAmount)}`,               color:'var(--accent)',         fs:16 },
// //                 { label:'− Labour / Hamali',     sub:`₹${labour||20} × ${bags} bags`,  val:`− ₹ ${fmtINR(labourAmt)}`,              color:'var(--red)',            fs:15 },
// //                 { label:'− Other Charges ', sub:`8% of ₹${fmtINR(grossAmount)}`, val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
// //                 { label:'Net Amount',            sub:'Gross − Labour − Commission',     val:`₹ ${fmtINR(netPayable)}`,               color:'var(--blue)',           fs:16, highlight:true },
// //                 { label:'− Advance Already Paid',sub:'',                               val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`, color:'var(--text-secondary)', fs:15 },
// //               ].map((row, i)=>(
// //                 <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
// //                   <div>
// //                     <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
// //                     {row.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
// //                   </div>
// //                   <div style={{ fontSize:row.fs, fontWeight:800, color:row.color, fontFamily:'var(--font-display)' }}>{row.val}</div>
// //                 </div>
// //               ))}
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px', background:finalPay>=0?'var(--green-dim)':'var(--red-dim)' }}>
// //                 <div>
// //                   <div style={{ fontSize:15, fontWeight:800, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                     {finalPay >= 0 ? '✅ Final Amount to Pay Seller' : '⚠️ Seller Owes Back'}
// //                   </div>
// //                   <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Net − Advance</div>
// //                 </div>
// //                 <div style={{ fontSize:24, fontWeight:900, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                   ₹ {fmtINR(Math.abs(finalPay))}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
// //           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
// //           <button className="btn btn-primary" onClick={save} disabled={saving}>
// //             <Check size={15}/> {saving?'Saving...':'Save Changes'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Checkbox style ───────────────────────────────────────────
// // const cbStyle = (checked) => ({
// //   width: 17, height: 17, borderRadius: 4, border: `2px solid ${checked ? '#1a56db' : 'var(--border)'}`,
// //   background: checked ? '#1a56db' : 'transparent', cursor: 'pointer', display: 'flex',
// //   alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
// // });

// // // ─── Main ─────────────────────────────────────────────────────
// // export default function SellerList() {
// //   const [sellers,  setSellers]  = useState([]);
// //   const [loading,  setLoading]  = useState(true);
// //   const [search,   setSearch]   = useState('');
// //   const [fDate,    setFDate]    = useState(todayISO());
// //   const [fMat,     setFMat]     = useState('');
// //   const [bill,     setBill]     = useState(null);
// //   const [editing,  setEditing]  = useState(null);
// //   const [confirm,  setConfirm]  = useState(null);
// //   // ✅ Selection state
// //   const [selected, setSelected] = useState(new Set());

// //   const load = useCallback(async () => {
// //     setLoading(true);
// //     setSelected(new Set()); // clear selection on reload
// //     try {
// //       const res = await API.get('/api/sellers', { params: fDate ? { date: fDate } : {} });
// //       setSellers(res.data.data);
// //     } catch(err) { toast.error(err.message||'Load failed'); }
// //     finally { setLoading(false); }
// //   }, [fDate]);

// //   useEffect(() => { load(); }, [load]);

// //   const del = (id, name) => setConfirm({
// //     title: 'Delete Seller?',
// //     message: `"${name}" will be permanently removed.`,
// //     onConfirm: async () => {
// //       try { await API.delete(`/api/sellers/${id}`); toast.success('Deleted'); load(); }
// //       catch(err) { toast.error(err.message||'Failed'); }
// //     }
// //   });

// //   const clear = () => { setSearch(''); setFDate(todayISO()); setFMat(''); };

// //   const list = sellers.filter(s => {
// //     const q = search.toLowerCase();
// //     return (!q || [s.name,s.mobile,s.lot_number,s.serial_number,s.material].some(v=>v?.toLowerCase().includes(q)))
// //       && (!fMat || s.material===fMat);
// //   });

// //   // ─── Selection helpers ────────────────────────────────────
// //   const allIds       = list.map(s => s.id);
// //   const allSelected  = allIds.length > 0 && allIds.every(id => selected.has(id));
// //   const someSelected = allIds.some(id => selected.has(id));
// //   const selectedCount = allIds.filter(id => selected.has(id)).length;

// //   const toggleAll = () => {
// //     if (allSelected) {
// //       setSelected(prev => { const next = new Set(prev); allIds.forEach(id => next.delete(id)); return next; });
// //     } else {
// //       setSelected(prev => { const next = new Set(prev); allIds.forEach(id => next.add(id)); return next; });
// //     }
// //   };

// //   const toggleOne = (id) => {
// //     setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
// //   };

// //   const printSelected = () => {
// //     const toprint = list.filter(s => selected.has(s.id));
// //     if (toprint.length === 0) { toast.error('Select at least one seller'); return; }
// //     printMultipleBills(toprint);
// //   };

// //   const tot = list.reduce((a,s)=>({
// //     bags: a.bags+Number(s.num_bags||0), wt: a.wt+Number(s.weight||0),
// //     adv:  a.adv+Number(s.advance_amount||0), amt: a.amt+Number(s.amount||0),
// //   }),{ bags:0, wt:0, adv:0, amt:0 });

// //   return (
// //     <div>
// //       <div className="page-header">
// //         <div>
// //           <div className="page-title">Seller List</div>
// //           <div className="page-subtitle">
// //             {loading ? 'Loading...' : `${sellers.length} sellers${fDate ? ` for ${fDate}` : ''}`}
// //           </div>
// //         </div>
// //         <div style={{ display:'flex', gap:8, alignItems:'center' }}>
// //           {/* ✅ Bulk print button — only shows when something is selected */}
// //           {selectedCount > 0 && (
// //             <button
// //               className="btn btn-primary"
// //               onClick={printSelected}
// //               style={{ display:'flex', alignItems:'center', gap:6, background:'#1a56db', color:'#fff', fontWeight:700, fontSize:13, padding:'7px 15px', borderRadius:8, border:'none', cursor:'pointer' }}
// //             >
// //               <Printer size={14}/>
// //               Print {selectedCount} Bill{selectedCount > 1 ? 's' : ''}
// //             </button>
// //           )}
// //           <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
// //         </div>
// //       </div>

// //       <div className="filter-bar">
// //         <div className="search-box" style={{ flex:2 }}>
// //           <Search className="search-icon" size={16}/>
// //           <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, lot no..." style={{ textTransform:'none' }}/>
// //         </div>
// //         <input className="form-input" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{ textTransform:'none', flex:1 }}/>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())} title="Today">Today</button>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')} title="All dates">All</button>
// //         <select className="form-select" value={fMat} onChange={e=>setFMat(e.target.value)} style={{ flex:1 }}>
// //           <option value="">All Materials</option>
// //           {MATERIALS.map(m=><option key={m}>{m}</option>)}
// //         </select>
// //         {(search||fMat)&&<button className="btn btn-secondary" onClick={clear}><X size={14}/> Clear</button>}
// //       </div>

// //       {list.length>0&&(
// //         <div style={{ display:'flex', gap:12, marginBottom:16 }}>
// //           {[['Sellers',list.length,'var(--accent)'],['Bags',tot.bags,'var(--green)'],
// //             ['Weight',fmtNum(tot.wt)+' kg','var(--blue)'],['Amount','₹ '+fmtINR(tot.amt),'var(--purple)'],
// //             ['Advance','₹ '+fmtINR(tot.adv),'var(--text-secondary)']
// //           ].map(([l,v,c])=>(
// //             <div key={l} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
// //               <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{l}</div>
// //               <div style={{ fontSize:15, fontWeight:800, color:c, fontFamily:'var(--font-display)' }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       <div className="table-wrapper">
// //         {loading?<div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading...</div>
// //         :list.length===0?(
// //           <div className="empty-state">
// //             <div className="empty-state-icon">👨‍🌾</div>
// //             <h3>{fDate ? `No sellers registered for ${fDate}` : 'No sellers found'}</h3>
// //             <p style={{ fontSize:12, marginTop:6, color:'var(--text-muted)' }}>
// //               {fDate ? 'Click "All" to see all sellers, or change the date' : 'Register a seller to get started'}
// //             </p>
// //             {fDate && (
// //               <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'center' }}>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')}>Show All Sellers</button>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())}>Today</button>
// //               </div>
// //             )}
// //           </div>
// //         ):(
// //           <table>
// //             <thead>
// //               <tr>
// //                 {/* ✅ Select-all checkbox */}
// //                 <th style={{ width:36, textAlign:'center', padding:'10px 8px' }}>
// //                   <div
// //                     onClick={toggleAll}
// //                     style={{ ...cbStyle(allSelected), margin:'0 auto', opacity: someSelected && !allSelected ? 0.6 : 1 }}
// //                     title={allSelected ? 'Deselect all' : 'Select all'}
// //                   >
// //                     {(allSelected || someSelected) && <Check size={11} color="#fff" strokeWidth={3}/>}
// //                   </div>
// //                 </th>
// //                 <th>#</th><th>Sr</th><th>Name</th><th>Mobile</th><th>Material</th>
// //                 <th>Bags</th><th>Lot</th><th>Weight</th><th>Amount</th><th>Advance</th><th>Balance</th><th>Date</th>
// //                 <th style={{ textAlign:'center' }}>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {list.map((s,i)=>{
// //                 const bal=(s.amount||0)-(s.advance_amount||0);
// //                 const isChecked = selected.has(s.id);
// //                 let bags=[]; try{bags=JSON.parse(s.bag_data||'[]')}catch{}
// //                 const rd=bags.filter(b=>Number(b.rate)>0).length;
// //                 return(
// //                   <tr key={s.id} style={{ background: isChecked ? 'rgba(26,86,219,0.06)' : undefined, cursor:'default' }}>
// //                     {/* ✅ Row checkbox */}
// //                     <td style={{ textAlign:'center', padding:'10px 8px' }}>
// //                       <div onClick={() => toggleOne(s.id)} style={{ ...cbStyle(isChecked), margin:'0 auto' }}>
// //                         {isChecked && <Check size={11} color="#fff" strokeWidth={3}/>}
// //                       </div>
// //                     </td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{i+1}</td>
// //                     <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
// //                     <td style={{ fontWeight:600 }}>{s.name}</td>
// //                     <td className="td-muted">{s.mobile&&s.mobile!=='0000000000'?s.mobile:'—'}</td>
// //                     <td>{s.material&&s.material!=='GENERAL'
// //                       ?<span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
// //                       :<span className="td-muted">—</span>}
// //                     </td>
// //                     <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
// //                     <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
// //                     <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
// //                     <td style={{ fontWeight:700, color:'var(--accent)' }}>
// //                       {s.amount?`₹${fmtINR(s.amount)}`:<span style={{ fontSize:11, color:'var(--text-muted)' }}>{rd}/{bags.length} rates</span>}
// //                     </td>
// //                     <td className="td-muted">{s.advance_amount?`₹${fmtINR(s.advance_amount)}`:'—'}</td>
// //                     <td style={{ fontWeight:600, color:bal>0?'var(--red)':'var(--green)' }}>{s.amount?`₹${fmtINR(bal)}`:'—'}</td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
// //                     <td>
// //                       <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
// //                         <button className="btn btn-blue btn-sm" onClick={()=>setEditing(s)} title="Edit"><Edit2 size={13}/></button>
// //                         <button className="btn btn-green btn-sm" onClick={()=>setBill(s)} title="Bill"><Eye size={13}/></button>
// //                         <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={()=>setBill(s)} title="Print"><Printer size={13}/></button>
// //                         <button className="btn btn-red btn-sm" onClick={()=>del(s.id,s.name)} title="Delete"><Trash2 size={13}/></button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 );
// //               })}
// //             </tbody>
// //             {list.length>1&&(
// //               <tfoot>
// //                 <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
// //                   <td colSpan={6} style={{ padding:'11px 15px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({list.length})</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{tot.bags}</td>
// //                   <td/>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{fmtNum(tot.wt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(tot.amt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700 }}>₹{fmtINR(tot.adv)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(tot.amt-tot.adv)}</td>
// //                   <td colSpan={2}/>
// //                 </tr>
// //               </tfoot>
// //             )}
// //           </table>
// //         )}
// //       </div>

// //       {bill    && <BillModal  seller={bill}    onClose={()=>setBill(null)}/>}
// //       {editing && <EditModal  seller={editing} onClose={()=>setEditing(null)} onSave={load}/>}
// //       {confirm && <ConfirmDialog {...confirm}  onClose={()=>setConfirm(null)}/>}

// //       <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>
// //     </div>
// //   );
// // }






// // -----------------------------------------------------------------------------------------------------




// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package, CheckSquare } from 'lucide-react';
// import axios from 'axios';
// import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// import ConfirmDialog from '../ConfirmDialog';

// const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

// const todayISO = () => new Date().toISOString().split('T')[0];

// // ─── Parse bag_data ───────────────────────────────────────────
// function getBags(seller) {
//   const num = parseInt(seller.num_bags) || 0;
//   const lot = seller.lot_number || `${seller.serial_number}/${num}`;
//   let raw = [];
//   try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
//   return Array.from({ length: num }, (_, i) => {
//     const b = raw[i] || {};
//     return {
//       lot,
//       weight: Number(b.weight) > 0 ? String(b.weight) : '',
//       rate:   Number(b.rate)   > 0 ? String(b.rate)   : '',
//       amount: Number(b.amount) > 0 ? String(b.amount) : '',
//       buyer:  b.buyer || '',
//     };
//   });
// }

// // ─── Number to Indian Words ───────────────────────────────────
// function toIndianWords(amount) {
//   const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
//     'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
//   const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
//   function conv(n) {
//     if (n === 0) return '';
//     if (n < 20) return ones[n];
//     if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
//     if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+conv(n%100) : '');
//     if (n < 100000) return conv(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' '+conv(n%1000) : '');
//     if (n < 10000000) return conv(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' '+conv(n%100000) : '');
//     return conv(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' '+conv(n%10000000) : '');
//   }
//   const intPart = Math.floor(Math.abs(amount));
//   const decPart = Math.round((Math.abs(amount) - intPart) * 100);
//   let words = conv(intPart) + ' Rupees';
//   if (decPart > 0) words += ' and ' + conv(decPart) + ' Paise';
//   return words || 'Zero Rupees';
// }

// const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // ─── Build single bill HTML — A5 optimised ───────────────────
// // A5 = 148mm × 210mm. @page margin: 5mm each side.
// // Usable width = 138mm. All font sizes in px tuned for A5 print.
// function buildBillHTML(seller) {
//   const totalBags = parseInt(seller.num_bags) || 0;
//   let rawBags = [];
//   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

//   const bagRows = Array.from({ length: totalBags }, (_, i) => {
//     const b = rawBags[i] || {};
//     return {
//       srno:     String(i + 1).padStart(3, '0'),
//       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
//       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
//       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
//       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
//       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
//     };
//   });

//   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
//   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
//   const labourAmt   = 20 * totalBags;
//   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
//   const advance     = parseFloat(seller.advance_amount) || 0;
//   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

//   // Row padding and font sizes reduced for A5 fit
//   const bagRowsHtml = bagRows.map((b, i) => `
//     <tr style="background:${i%2===0?'#ffffff':'#eff6ff'}">
//       <td style="border:1px solid #b8cef0;padding:2px 2px;text-align:center;font-size:8px;color:#333">${b.srno}</td>
//       <td style="border:1px solid #b8cef0;padding:2px 4px;text-align:left;font-size:8px;font-weight:700;color:#1a1a1a">${b.material}</td>
//       <td style="border:1px solid #b8cef0;padding:2px 2px;text-align:center;font-size:7.5px;font-family:monospace;color:#444">${b.lot}</td>
//       <td style="border:1px solid #b8cef0;padding:2px 2px;text-align:center;font-size:8px;font-weight:600;color:#333">1</td>
//       <td style="border:1px solid #b8cef0;padding:2px 2px;text-align:center;font-size:8px;font-weight:800;color:#1e40af">${b.weight != null ? b.weight : '—'}</td>
//       <td style="border:1px solid #b8cef0;padding:2px 2px;text-align:center;font-size:8px;font-weight:800;color:#166534">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
//       <td style="border:1px solid #b8cef0;padding:2px 4px;text-align:right;font-size:8px;font-weight:800;color:#1a56db">${b.amount != null ? inr(b.amount) : '—'}</td>
//     </tr>`).join('');

//   const html = `
// <div style="width:100%;font-family:Arial,sans-serif;font-size:8px;color:#111;background:#fff;line-height:1.3;border:2px solid #1a56db;border-radius:3px;padding:5px;box-sizing:border-box;position:relative;">
//   <div style="position:absolute;top:3px;left:3px;right:3px;bottom:3px;border:1px solid #a0bbf0;border-radius:2px;pointer-events:none;"></div>

//   <!-- Header -->
//   <div style="text-align:center;border-bottom:1.5px double #1a56db;padding-bottom:5px;margin-bottom:4px;">
//     <div style="display:flex;justify-content:space-between;align-items:center;font-size:7px;color:#444;margin-bottom:2px;">
//       <span style="text-align:left;line-height:1.4;">Prop. Praveen V. Heggani<br>Cell : 9611635183</span>
//       <div style="width:26px;height:26px;border-radius:50%;border:2px solid #1a56db;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:9px;color:#1a56db;background:#eff6ff;flex-shrink:0;">PH</div>
//       <span style="text-align:right;line-height:1.4;">Prop. Pramod V.Heggani<br>Cell : 9448349836</span>
//     </div>
//     <div style="font-size:14px;font-weight:900;color:#1a1a1a;line-height:1.1;margin:1px 0;">Mr. Praveen Heggani</div>
//     <div style="margin:1px 0;"><span style="display:inline-block;background:#1a56db;color:#fff;font-size:6.5px;font-weight:700;letter-spacing:0.8px;padding:1.5px 8px;border-radius:2px;">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
//     <div style="font-size:8px;font-weight:700;color:#333;">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
//     <div style="font-size:7px;color:#666;margin-top:1px;">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
//   </div>

//   <!-- Meta -->
//   <div style="border:1px solid #1a56db;border-radius:2px;margin-bottom:4px;overflow:hidden;">
//     <div style="display:flex;justify-content:space-between;padding:3px 6px;font-size:8px;border-bottom:1px solid #cfe2ff;">
//       <span><strong style="color:#1a56db">Bill No :</strong> ${seller.serial_number || '—'}</span>
//       <span><strong style="color:#1a56db">Date :</strong> ${fmtDate(seller.entry_date)}</span>
//     </div>
//     <div style="padding:2px 6px;font-size:8px;"><strong style="color:#1a56db">Cust. Name :</strong> ${seller.name}</div>
//   </div>

//   <!-- Items Table -->
//   <table style="width:100%;border-collapse:collapse;margin-bottom:1px;table-layout:fixed;">
//     <colgroup>
//       <col style="width:8%"><col style="width:18%"><col style="width:13%">
//       <col style="width:7%"><col style="width:13%"><col style="width:14%"><col style="width:27%">
//     </colgroup>
//     <thead>
//       <tr>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">SrNo.</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Particular</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Lott No.</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Bags</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Weight(KG)</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">RATE</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Amount</th>
//       </tr>
//     </thead>
//     <tbody>${bagRowsHtml}</tbody>
//     <tfoot>
//       <tr style="background:#dbeafe;border-top:1.5px solid #1a56db;">
//         <td colspan="3" style="border:1px solid #b8cef0;padding:3px 4px;font-weight:800;color:#1e40af;text-align:left;font-size:8px;">TOTAL</td>
//         <td style="border:1px solid #b8cef0;padding:3px 2px;text-align:center;font-weight:800;color:#111;font-size:8px;">${totalBags}</td>
//         <td style="border:1px solid #b8cef0;padding:3px 2px;text-align:center;font-weight:800;color:#1e40af;font-size:8px;">${totalWeight.toFixed(2)}</td>
//         <td style="border:1px solid #b8cef0;padding:3px 2px;text-align:right;font-size:7px;color:#1e40af;font-weight:600;">Gross Amt.</td>
//         <td style="border:1px solid #b8cef0;padding:3px 4px;text-align:right;font-weight:800;color:#1a56db;font-size:10px;">&#8377; ${inr(grossAmount)}</td>
//       </tr>
//     </tfoot>
//   </table>

//   <!-- Deductions -->
//   <table style="width:100%;border-collapse:collapse;margin-top:2px;table-layout:fixed;">
//     <colgroup><col style="width:60%"><col style="width:40%"></colgroup>
//     <tbody>
//       <tr><td style="border:1px solid #b8cef0;padding:3px 6px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7.5px;">Other Charges</td><td style="border:1px solid #b8cef0;padding:3px 6px;text-align:right;font-weight:700;color:#dc2626;font-size:8px;">− ₹ ${inr(commission)}</td></tr>
//       <tr><td style="border:1px solid #b8cef0;padding:3px 6px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7.5px;">Hamali / Labour Charges</td><td style="border:1px solid #b8cef0;padding:3px 6px;text-align:right;font-weight:700;color:#dc2626;font-size:8px;">− ₹ ${inr(labourAmt)}</td></tr>
//       <tr><td style="border:1px solid #b8cef0;padding:3px 6px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7.5px;">Advance Paid</td><td style="border:1px solid #b8cef0;padding:3px 6px;text-align:right;font-weight:700;color:#dc2626;font-size:8px;">− ₹ ${inr(advance)}</td></tr>
//       <tr style="background:#1a56db;">
//         <td style="padding:6px 8px;color:#fff;font-weight:900;font-size:10px;">NET AMOUNT</td>
//         <td style="padding:6px 8px;color:#fff;font-weight:900;font-size:12px;text-align:right;">&#8377; ${inr(Math.max(0, finalPay))}</td>
//       </tr>
//     </tbody>
//   </table>

//   <!-- In Words -->
//   <div style="border:1px solid #1a56db;border-radius:2px;padding:3px 6px;font-size:7.5px;margin-top:4px;background:#f8fbff;">
//     <strong style="color:#1a56db;">In Words :</strong> ${toIndianWords(Math.max(0, finalPay))} Only
//   </div>
//   <div style="text-align:right;font-size:7px;color:#888;margin-top:1px;font-style:italic;">(E.&amp;O.E.)</div>

//   <!-- Footer -->
//   <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px;">
//     <div style="text-align:center;border-top:1px solid #555;padding-top:3px;font-size:7.5px;width:90px;color:#444;">Receiver's Sign.</div>
//     <div style="font-weight:800;font-size:8px;">For – Mr. Praveen Heggani</div>
//   </div>
// </div>`;

//   return { html, finalPay };
// }

// // ─── Print HTML helper ────────────────────────────────────────
// function openPrintWindow(fullHtml) {
//   if (window.electronAPI && window.electronAPI.printHTML) {
//     window.electronAPI.printHTML(fullHtml);
//   } else {
//     const w = window.open('', '_blank', 'width=900,height=750');
//     if (w && w.document) { w.document.write(fullHtml); w.document.close(); }
//   }
// }

// // ─── Wrap bills in full A5 print page ────────────────────────
// function wrapInPrintPage(billsHtml, title) {
//   return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>${title}</title>
//   <style>
//     @page {
//       size: A5 portrait;
//       margin: 5mm;
//     }
//     * { box-sizing: border-box; margin: 0; padding: 0; }
//     html, body {
//       width: 100%;
//       background: #fff;
//       font-family: Arial, sans-serif;
//     }
//     body {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//     }
//     .bill-page {
//       width: 138mm;
//       max-width: 138mm;
//       page-break-after: always;
//     }
//     .bill-page:last-child {
//       page-break-after: avoid;
//     }
//     @media print {
//       body {
//         -webkit-print-color-adjust: exact;
//         print-color-adjust: exact;
//       }
//     }
//   </style>
// </head>
// <body>
// ${billsHtml}
// <script>window.onload = function(){ window.print(); }<\/script>
// </body>
// </html>`;
// }

// // ─── Bulk print all selected sellers ─────────────────────────
// function printMultipleBills(sellers) {
//   const billsHtml = sellers
//     .map(s => `<div class="bill-page">${buildBillHTML(s).html}</div>`)
//     .join('\n');
//   openPrintWindow(wrapInPrintPage(billsHtml, `Bills — ${sellers.length} Sellers`));
// }

// // ─── Bill Modal ───────────────────────────────────────────────
// function BillModal({ seller, onClose }) {
//   const BLUE = '#1a56db';

//   const totalBags = parseInt(seller.num_bags) || 0;
//   let rawBags = [];
//   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

//   const bagRows = Array.from({ length: totalBags }, (_, i) => {
//     const b = rawBags[i] || {};
//     return {
//       srno:     String(i + 1).padStart(3, '0'),
//       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
//       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
//       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
//       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
//       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
//     };
//   });

//   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
//   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
//   const labourAmt   = 20 * totalBags;
//   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
//   const advance     = parseFloat(seller.advance_amount) || 0;
//   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

//   const printBill = () => {
//     const { html } = buildBillHTML(seller);
//     const billsHtml = `<div class="bill-page">${html}</div>`;
//     openPrintWindow(wrapInPrintPage(billsHtml, `Bill — ${seller.name}`));
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" style={{ maxWidth: 560, width: '95%', padding: 0, overflow: 'hidden', borderRadius: 10 }} onClick={e => e.stopPropagation()}>
//         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:BLUE, color:'#fff' }}>
//           <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
//           <div style={{ display:'flex', gap:8 }}>
//             <button onClick={printBill} style={{ background:'#fff', color:BLUE, border:'none', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
//               <Printer size={13} /> Print / PDF (A5)
//             </button>
//             <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}><X size={18} /></button>
//           </div>
//         </div>
//         <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f0f4ff' }}>
//           <div style={{ all:'initial', display:'block' }}>
//           <div style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'3px solid #1a56db', borderRadius:4, position:'relative' }}>
//             <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #a0bbf0', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>
//             <div style={{ textAlign:'center', borderBottom:'2.5px double #1a56db', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
//               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
//                 <span style={{ textAlign:'left' }}>Prop. Praveen V. Heggani<br/>Cell : 9611635183</span>
//                 <div style={{ width:40, height:40, borderRadius:'50%', border:'2.5px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1a56db', background:'#eff6ff' }}>PH</div>
//                 <span style={{ textAlign:'right' }}>Prop. Pramod V.Heggani<br/>Cell : 9448349836</span>
//               </div>
//               <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>Mr. Praveen Heggani</div>
//               <div><span style={{ display:'inline-block', background:'#1a56db', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}>TAMARIND,GINGER,GARLIC,ONION &amp; Vegetables</span></div>
//               <div style={{ fontSize:11, fontWeight:700 }}>ORDER SUPPLIER &amp; COMMISSION AGENT</div>
//               <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}>Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
//             </div>
//             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
//               <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
//                 <span><strong style={{ color:'#1a56db' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
//                 <span><strong style={{ color:'#1a56db' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
//               </div>
//               <div style={{ padding:'4px 8px', fontSize:11 }}>
//                 <strong style={{ color:'#1a56db' }}>Cust. Name :</strong> {seller.name}
//               </div>
//             </div>
//             <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
//               <thead>
//                 <tr>
//                   {['SrNo.','Particular','Lott No.','Bags','Weight(KG)','RATE','Amount'].map(h => (
//                     <th key={h} style={{ background:'#1a56db', color:'#fff', padding:'5px 4px', fontSize:9.5, fontWeight:700, border:'1px solid #1245b5', textAlign:'center' }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {bagRows.map((b, i) => (
//                   <tr key={i} style={{ background: i%2===0 ? '#fff':'#eff6ff' }}>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, color:'#111' }}>{b.srno}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'left', fontSize:10, fontWeight:700, color:'#111' }}>{b.material}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontFamily:'monospace', color:'#333' }}>{b.lot}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:600, color:'#111' }}>1</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#1e40af' }}>{b.weight != null ? b.weight : '—'}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#166534' }}>{b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'right', fontSize:10, fontWeight:800, color:'#1a56db' }}>{b.amount != null ? inr(b.amount) : '—'}</td>
//                   </tr>
//                 ))}
//               </tbody>
//               <tfoot>
//                 <tr style={{ background:'#dbeafe', borderTop:'2px solid #1a56db' }}>
//                   <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
//                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
//                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#1e40af' }}>{totalWeight.toFixed(2)}</td>
//                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af' }}>Gross Amt.</td>
//                   <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1a56db', fontSize:13 }}>₹ {inr(grossAmount)}</td>
//                 </tr>
//               </tfoot>
//             </table>
//             <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
//               <tbody>
//                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Other Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td></tr>
//                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
//                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td></tr>
//                 <tr style={{ background:'#1a56db' }}>
//                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
//                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:900, fontSize:16, textAlign:'right' }}>₹ {inr(Math.max(0, finalPay))}</td>
//                 </tr>
//               </tbody>
//             </table>
//             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
//               <strong style={{ color:'#1a56db' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
//             </div>
//             <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>
//             <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
//               <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
//               <div style={{ fontWeight:800, fontSize:11 }}>For – Mr. Praveen Heggani</div>
//             </div>
//           </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Edit Modal ───────────────────────────────────────────────
// function EditModal({ seller, onClose, onSave }) {
//   const num = parseInt(seller.num_bags) || 0;
//   const lot = seller.lot_number || (seller.serial_number + '/' + num);

//   const [rows,    setRows]    = useState(() => getBags(seller));
//   const [nBags,   setNBags]   = useState(String(num));
//   const [advance, setAdvance] = useState(String(seller.advance_amount || ''));
//   const [labour,  setLabour]  = useState('20');
//   const [saving,  setSaving]  = useState(false);
//   const [buyers,  setBuyers]  = useState([]);

//   useEffect(() => {
//     API.get('/api/buyers').then(res => {
//       setBuyers(res.data.data || []);
//     }).catch(() => {});
//   }, []);

//   const changeNBags = (v) => {
//     setNBags(v);
//     const n = parseInt(v) || 0;
//     setRows(prev => Array.from({ length: n }, (_, i) =>
//       prev[i] || { lot, weight: '', rate: '', amount: '', buyer: '' }
//     ));
//   };

//   const update = (i, field, val) => {
//     setRows(prev => prev.map((r, j) => {
//       if (j !== i) return r;
//       const next = { ...r, [field]: val };
//       if (field === 'weight' || field === 'rate') {
//         const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
//         const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
//         next.amount = w && rt ? ((w * rt) / 100).toFixed(2) : '';
//       }
//       return next;
//     }));
//   };

//   const bags        = parseInt(nBags) || 0;
//   const totalW      = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
//   const grossAmount = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
//   const labourAmt   = (parseFloat(labour) || 0) * bags;
//   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   const totalDeduct = parseFloat((labourAmt + commission).toFixed(2));
//   const netPayable  = parseFloat((grossAmount - totalDeduct).toFixed(2));
//   const finalPay    = parseFloat((netPayable - (parseFloat(advance) || 0)).toFixed(2));

//   const ratesDone = rows.filter(r => parseFloat(r.rate) > 0).length;
//   const wtsDone   = rows.filter(r => parseFloat(r.weight) > 0).length;

//   const iStyle = (val, col) => ({
//     background:   val ? col + '11' : 'var(--bg-panel)',
//     border:       '1px solid ' + (val ? col + '66' : 'var(--border-light)'),
//     borderRadius: 7, padding: '8px 11px',
//     color:        val ? col : 'var(--text-muted)',
//     fontFamily:   'var(--font-body)', fontSize: 13, fontWeight: 700,
//     outline: 'none', width: '100%',
//   });

//   const buyerOptions = buyers.map(b => {
//     const display = (b.lot_number && b.lot_number !== '—') ? b.lot_number : b.name;
//     return { value: display, label: display, fullName: b.name };
//   });

//   const save = async () => {
//     if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
//     setSaving(true);
//     try {
//       const bag_data = rows.map(r => ({
//         lot,
//         weight: parseFloat(r.weight) || 0,
//         rate:   parseFloat(r.rate)   || 0,
//         amount: parseFloat(r.amount) || 0,
//         buyer:  r.buyer || '',
//       }));
//       await API.put('/api/sellers/' + seller.id, {
//         num_bags:       bags,
//         weight:         totalW,
//         amount:         netPayable,
//         advance_amount: parseFloat(advance) || 0,
//         rate_fixed:     totalW > 0 && grossAmount > 0 ? parseFloat((grossAmount / totalW * 100).toFixed(2)) : 0,
//         bag_data:       JSON.stringify(bag_data),
//       });
//       toast.success('Saved! Final payable: ₹' + fmtINR(finalPay));
//       onSave(); onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.error || err.message || 'Failed');
//     } finally { setSaving(false); }
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" style={{ maxWidth: 960, width: '95%' }} onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
//           <button className="modal-close" onClick={onClose}><X size={20} /></button>
//         </div>

//         <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
//           {[['Serial No',seller.serial_number],['Lot No',lot],
//             ['Material',seller.material&&seller.material!=='GENERAL'?seller.material:'—'],
//             ['Date',fmtDate(seller.entry_date)]
//           ].map(([l,v])=>(
//             <div key={l} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 13px', fontSize:12 }}>
//               <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{l}</div>
//               <div style={{ fontWeight:700 }}>{v}</div>
//             </div>
//           ))}
//         </div>

//         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:18 }}>
//           <div className="form-group">
//             <label className="form-label">Number of Bags</label>
//             <input className="form-input" type="number" value={nBags} onChange={e=>changeNBags(e.target.value)} min="1" max="100" style={{ textTransform:'none' }}/>
//           </div>
//           <div className="form-group">
//             <label className="form-label">Advance Paid (₹)</label>
//             <input className="form-input" type="number" value={advance} onChange={e=>setAdvance(e.target.value)} placeholder="0.00" step="0.01" style={{ textTransform:'none' }}/>
//           </div>
//           <div className="form-group">
//             <label className="form-label">Labour Rate (₹ per bag)</label>
//             <input className="form-input" type="number" value={labour} onChange={e=>setLabour(e.target.value)} placeholder="20" step="1" min="0" style={{ textTransform:'none' }}/>
//           </div>
//         </div>

//         {rows.length > 0 && (
//           <>
//             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
//               <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//                 <Package size={15} style={{ color:'var(--accent)' }}/>
//                 <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Bag-wise Details</span>
//                 <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>Lot: {lot}</span>
//                 <span style={{ fontSize:11, color:wtsDone===rows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
//                   {wtsDone}/{rows.length} weights
//                 </span>
//               </div>
//               <span style={{ fontSize:11, color:'var(--text-muted)' }}>Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
//             </div>

//             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
//               {['#','Lot','Weight (kg)','Rate (₹/100kg)','Buyer','Amount (₹)'].map(h=>(
//                 <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
//               ))}
//             </div>

//             <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:300, overflowY:'auto' }}>
//               {rows.map((r,i)=>(
//                 <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<rows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
//                   <div style={{ width:24, height:24, borderRadius:5, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>{i+1}</div>
//                   <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lot}</div>
//                   <input type="number" value={r.weight} onChange={e=>update(i,'weight',e.target.value)}
//                     placeholder="Enter weight" step="0.01" min="0.01" onWheel={e=>e.target.blur()}
//                     style={iStyle(r.weight,'#3b82f6')}
//                     onFocus={e=>{e.target.style.borderColor='#3b82f6';e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'}}
//                     onBlur={e=>{e.target.style.borderColor=r.weight?'#3b82f666':'var(--border-light)';e.target.style.boxShadow='none'}}
//                   />
//                   <input type="number" value={r.rate} onChange={e=>update(i,'rate',e.target.value)}
//                     placeholder="e.g. 3200" step="0.01" min="0" onWheel={e=>e.target.blur()}
//                     style={iStyle(r.rate,'#10b981')}
//                     onFocus={e=>{e.target.style.borderColor='#10b981';e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'}}
//                     onBlur={e=>{e.target.style.borderColor=r.rate?'#10b98166':'var(--border-light)';e.target.style.boxShadow='none'}}
//                   />
//                   <select value={r.buyer || ''} onChange={e => update(i, 'buyer', e.target.value)}
//                     style={{ background: r.buyer ? 'rgba(139,92,246,0.1)' : 'var(--bg-panel)', border: `1px solid ${r.buyer ? 'rgba(139,92,246,0.5)' : 'var(--border-light)'}`, borderRadius: 7, padding: '8px 10px', color: r.buyer ? '#a78bfa' : 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, outline: 'none', width: '100%', cursor: 'pointer' }}
//                   >
//                     <option value="">— Select Buyer —</option>
//                     {buyerOptions.map((b, idx) => (
//                       <option key={idx} value={b.value}>{b.label}</option>
//                     ))}
//                   </select>
//                   <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
//                     {r.amount?'₹'+fmtINR(r.amount):'—'}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
//               <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
//               <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
//               <div style={{ fontSize:12, color:ratesDone===rows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{rows.length} rates {ratesDone===rows.length?'✓':''}</div>
//               <div style={{ fontSize:11, color:'var(--text-muted)' }}>{rows.filter(r=>r.buyer).length}/{rows.length} buyers assigned</div>
//               <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
//             </div>
//           </>
//         )}

//         {grossAmount > 0 && (
//           <div style={{ marginTop:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
//             <div style={{ background:'var(--bg-panel)', padding:'10px 18px', borderBottom:'1px solid var(--border)' }}>
//               <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>💰 Payment Calculation</span>
//             </div>
//             <div>
//               {[
//                 { label:'Gross Amount',          sub:`${rows.length} bags × Rate`,      val:`₹ ${fmtINR(grossAmount)}`,               color:'var(--accent)',         fs:16 },
//                 { label:'− Labour / Hamali',     sub:`₹${labour||20} × ${bags} bags`,  val:`− ₹ ${fmtINR(labourAmt)}`,              color:'var(--red)',            fs:15 },
//                 { label:'− Other Charges', sub:`8% of ₹${fmtINR(grossAmount)}`, val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
//                 { label:'Net Amount',            sub:'Gross − Labour − Commission',     val:`₹ ${fmtINR(netPayable)}`,               color:'var(--blue)',           fs:16, highlight:true },
//                 { label:'− Advance Already Paid',sub:'',                               val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`, color:'var(--text-secondary)', fs:15 },
//               ].map((row, i)=>(
//                 <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
//                   <div>
//                     <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
//                     {row.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
//                   </div>
//                   <div style={{ fontSize:row.fs, fontWeight:800, color:row.color, fontFamily:'var(--font-display)' }}>{row.val}</div>
//                 </div>
//               ))}
//               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px', background:finalPay>=0?'var(--green-dim)':'var(--red-dim)' }}>
//                 <div>
//                   <div style={{ fontSize:15, fontWeight:800, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
//                     {finalPay >= 0 ? '✅ Final Amount to Pay Seller' : '⚠️ Seller Owes Back'}
//                   </div>
//                   <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Net − Advance</div>
//                 </div>
//                 <div style={{ fontSize:24, fontWeight:900, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
//                   ₹ {fmtINR(Math.abs(finalPay))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
//           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
//           <button className="btn btn-primary" onClick={save} disabled={saving}>
//             <Check size={15}/> {saving?'Saving...':'Save Changes'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Checkbox style ───────────────────────────────────────────
// const cbStyle = (checked) => ({
//   width: 17, height: 17, borderRadius: 4, border: `2px solid ${checked ? '#1a56db' : 'var(--border)'}`,
//   background: checked ? '#1a56db' : 'transparent', cursor: 'pointer', display: 'flex',
//   alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
// });

// // ─── Main ─────────────────────────────────────────────────────
// export default function SellerList() {
//   const [sellers,  setSellers]  = useState([]);
//   const [loading,  setLoading]  = useState(true);
//   const [search,   setSearch]   = useState('');
//   const [fDate,    setFDate]    = useState(todayISO());
//   const [fMat,     setFMat]     = useState('');
//   const [bill,     setBill]     = useState(null);
//   const [editing,  setEditing]  = useState(null);
//   const [confirm,  setConfirm]  = useState(null);
//   const [selected, setSelected] = useState(new Set());

//   const load = useCallback(async () => {
//     setLoading(true);
//     setSelected(new Set());
//     try {
//       const res = await API.get('/api/sellers', { params: fDate ? { date: fDate } : {} });
//       const sorted = [...(res.data.data || [])].sort(
//         (a, b) => (parseInt(a.serial_number) || 0) - (parseInt(b.serial_number) || 0)
//       );
//       setSellers(sorted);
//     } catch(err) { toast.error(err.message||'Load failed'); }
//     finally { setLoading(false); }
//   }, [fDate]);

//   useEffect(() => { load(); }, [load]);

//   const del = (id, name) => setConfirm({
//     title: 'Delete Seller?',
//     message: `"${name}" will be permanently removed.`,
//     onConfirm: async () => {
//       try { await API.delete(`/api/sellers/${id}`); toast.success('Deleted'); load(); }
//       catch(err) { toast.error(err.message||'Failed'); }
//     }
//   });

//   const clear = () => { setSearch(''); setFDate(todayISO()); setFMat(''); };

//   const list = sellers.filter(s => {
//     const q = search.toLowerCase();
//     return (!q || [s.name,s.mobile,s.lot_number,s.serial_number,s.material].some(v=>v?.toLowerCase().includes(q)))
//       && (!fMat || s.material===fMat);
//   });

//   const allIds       = list.map(s => s.id);
//   const allSelected  = allIds.length > 0 && allIds.every(id => selected.has(id));
//   const someSelected = allIds.some(id => selected.has(id));
//   const selectedCount = allIds.filter(id => selected.has(id)).length;

//   const toggleAll = () => {
//     if (allSelected) {
//       setSelected(prev => { const next = new Set(prev); allIds.forEach(id => next.delete(id)); return next; });
//     } else {
//       setSelected(prev => { const next = new Set(prev); allIds.forEach(id => next.add(id)); return next; });
//     }
//   };

//   const toggleOne = (id) => {
//     setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
//   };

//   const printSelected = () => {
//     const toprint = list.filter(s => selected.has(s.id));
//     if (toprint.length === 0) { toast.error('Select at least one seller'); return; }
//     printMultipleBills(toprint);
//   };

//   const tot = list.reduce((a,s)=>({
//     bags: a.bags+Number(s.num_bags||0), wt: a.wt+Number(s.weight||0),
//     adv:  a.adv+Number(s.advance_amount||0), amt: a.amt+Number(s.amount||0),
//   }),{ bags:0, wt:0, adv:0, amt:0 });

//   return (
//     <div>
//       <div className="page-header">
//         <div>
//           <div className="page-title">Seller List</div>
//           <div className="page-subtitle">
//             {loading ? 'Loading...' : `${sellers.length} sellers${fDate ? ` for ${fDate}` : ''}`}
//           </div>
//         </div>
//         <div style={{ display:'flex', gap:8, alignItems:'center' }}>
//           {selectedCount > 0 && (
//             <button
//               className="btn btn-primary"
//               onClick={printSelected}
//               style={{ display:'flex', alignItems:'center', gap:6, background:'#1a56db', color:'#fff', fontWeight:700, fontSize:13, padding:'7px 15px', borderRadius:8, border:'none', cursor:'pointer' }}
//             >
//               <Printer size={14}/>
//               Print {selectedCount} Bill{selectedCount > 1 ? 's' : ''}
//             </button>
//           )}
//           <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
//         </div>
//       </div>

//       <div className="filter-bar">
//         <div className="search-box" style={{ flex:2 }}>
//           <Search className="search-icon" size={16}/>
//           <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, lot no..." style={{ textTransform:'none' }}/>
//         </div>
//         <input className="form-input" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{ textTransform:'none', flex:1 }}/>
//         <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())} title="Today">Today</button>
//         <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')} title="All dates">All</button>
//         <select className="form-select" value={fMat} onChange={e=>setFMat(e.target.value)} style={{ flex:1 }}>
//           <option value="">All Materials</option>
//           {MATERIALS.map(m=><option key={m}>{m}</option>)}
//         </select>
//         {(search||fMat)&&<button className="btn btn-secondary" onClick={clear}><X size={14}/> Clear</button>}
//       </div>

//       {list.length>0&&(
//         <div style={{ display:'flex', gap:12, marginBottom:16 }}>
//           {[['Sellers',list.length,'var(--accent)'],['Bags',tot.bags,'var(--green)'],
//             ['Weight',fmtNum(tot.wt)+' kg','var(--blue)'],['Amount','₹ '+fmtINR(tot.amt),'var(--purple)'],
//             ['Advance','₹ '+fmtINR(tot.adv),'var(--text-secondary)']
//           ].map(([l,v,c])=>(
//             <div key={l} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
//               <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{l}</div>
//               <div style={{ fontSize:15, fontWeight:800, color:c, fontFamily:'var(--font-display)' }}>{v}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="table-wrapper">
//         {loading?<div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading...</div>
//         :list.length===0?(
//           <div className="empty-state">
//             <div className="empty-state-icon">👨‍🌾</div>
//             <h3>{fDate ? `No sellers registered for ${fDate}` : 'No sellers found'}</h3>
//             <p style={{ fontSize:12, marginTop:6, color:'var(--text-muted)' }}>
//               {fDate ? 'Click "All" to see all sellers, or change the date' : 'Register a seller to get started'}
//             </p>
//             {fDate && (
//               <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'center' }}>
//                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')}>Show All Sellers</button>
//                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())}>Today</button>
//               </div>
//             )}
//           </div>
//         ):(
//           <table>
//             <thead>
//               <tr>
//                 <th style={{ width:36, textAlign:'center', padding:'10px 8px' }}>
//                   <div
//                     onClick={toggleAll}
//                     style={{ ...cbStyle(allSelected), margin:'0 auto', opacity: someSelected && !allSelected ? 0.6 : 1 }}
//                     title={allSelected ? 'Deselect all' : 'Select all'}
//                   >
//                     {(allSelected || someSelected) && <Check size={11} color="#fff" strokeWidth={3}/>}
//                   </div>
//                 </th>
//                 <th>#</th><th>Sr</th><th>Name</th><th>Mobile</th><th>Material</th>
//                 <th>Bags</th><th>Lot</th><th>Weight</th><th>Amount</th><th>Advance</th><th>Balance</th><th>Date</th>
//                 <th style={{ textAlign:'center' }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {list.map((s,i)=>{
//                 const bal=(s.amount||0)-(s.advance_amount||0);
//                 const isChecked = selected.has(s.id);
//                 let bags=[]; try{bags=JSON.parse(s.bag_data||'[]')}catch{}
//                 const rd=bags.filter(b=>Number(b.rate)>0).length;
//                 return(
//                   <tr key={s.id} style={{ background: isChecked ? 'rgba(26,86,219,0.06)' : undefined }}>
//                     <td style={{ textAlign:'center', padding:'10px 8px' }}>
//                       <div onClick={() => toggleOne(s.id)} style={{ ...cbStyle(isChecked), margin:'0 auto' }}>
//                         {isChecked && <Check size={11} color="#fff" strokeWidth={3}/>}
//                       </div>
//                     </td>
//                     <td className="td-muted" style={{ fontSize:12 }}>{i+1}</td>
//                     <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
//                     <td style={{ fontWeight:600 }}>{s.name}</td>
//                     <td className="td-muted">{s.mobile&&s.mobile!=='0000000000'?s.mobile:'—'}</td>
//                     <td>{s.material&&s.material!=='GENERAL'
//                       ?<span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
//                       :<span className="td-muted">—</span>}
//                     </td>
//                     <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
//                     <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
//                     <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
//                     <td style={{ fontWeight:700, color:'var(--accent)' }}>
//                       {s.amount?`₹${fmtINR(s.amount)}`:<span style={{ fontSize:11, color:'var(--text-muted)' }}>{rd}/{bags.length} rates</span>}
//                     </td>
//                     <td className="td-muted">{s.advance_amount?`₹${fmtINR(s.advance_amount)}`:'—'}</td>
//                     <td style={{ fontWeight:600, color:bal>0?'var(--red)':'var(--green)' }}>{s.amount?`₹${fmtINR(bal)}`:'—'}</td>
//                     <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
//                     <td>
//                       <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
//                         <button className="btn btn-blue btn-sm" onClick={()=>setEditing(s)} title="Edit"><Edit2 size={13}/></button>
//                         <button className="btn btn-green btn-sm" onClick={()=>setBill(s)} title="Bill"><Eye size={13}/></button>
//                         <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={()=>setBill(s)} title="Print"><Printer size={13}/></button>
//                         <button className="btn btn-red btn-sm" onClick={()=>del(s.id,s.name)} title="Delete"><Trash2 size={13}/></button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//             {list.length>1&&(
//               <tfoot>
//                 <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
//                   <td colSpan={6} style={{ padding:'11px 15px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({list.length})</td>
//                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{tot.bags}</td>
//                   <td/>
//                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{fmtNum(tot.wt)}</td>
//                   <td style={{ padding:'11px 15px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(tot.amt)}</td>
//                   <td style={{ padding:'11px 15px', fontWeight:700 }}>₹{fmtINR(tot.adv)}</td>
//                   <td style={{ padding:'11px 15px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(tot.amt-tot.adv)}</td>
//                   <td colSpan={2}/>
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         )}
//       </div>

//       {bill    && <BillModal  seller={bill}    onClose={()=>setBill(null)}/>}
//       {editing && <EditModal  seller={editing} onClose={()=>setEditing(null)} onSave={load}/>}
//       {confirm && <ConfirmDialog {...confirm}  onClose={()=>setConfirm(null)}/>}

//       <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>
//     </div>
//   );
// }




// ---------------------------------------------------------------------------------------



// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package, CheckSquare } from 'lucide-react';
// import axios from 'axios';
// import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// import ConfirmDialog from '../ConfirmDialog';

// const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

// const todayISO = () => new Date().toISOString().split('T')[0];

// // ─── Parse bag_data ───────────────────────────────────────────
// function getBags(seller) {
//   const num = parseInt(seller.num_bags) || 0;
//   const lot = seller.lot_number || `${seller.serial_number}/${num}`;
//   let raw = [];
//   try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
//   return Array.from({ length: num }, (_, i) => {
//     const b = raw[i] || {};
//     return {
//       lot,
//       weight: Number(b.weight) > 0 ? String(b.weight) : '',
//       rate:   Number(b.rate)   > 0 ? String(b.rate)   : '',
//       amount: Number(b.amount) > 0 ? String(b.amount) : '',
//       buyer:  b.buyer || '',
//     };
//   });
// }

// // ─── Number to Indian Words ───────────────────────────────────
// function toIndianWords(amount) {
//   const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
//     'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
//   const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
//   function conv(n) {
//     if (n === 0) return '';
//     if (n < 20) return ones[n];
//     if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
//     if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+conv(n%100) : '');
//     if (n < 100000) return conv(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' '+conv(n%1000) : '');
//     if (n < 10000000) return conv(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' '+conv(n%100000) : '');
//     return conv(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' '+conv(n%10000000) : '');
//   }
//   const intPart = Math.floor(Math.abs(amount));
//   const decPart = Math.round((Math.abs(amount) - intPart) * 100);
//   let words = conv(intPart) + ' Rupees';
//   if (decPart > 0) words += ' and ' + conv(decPart) + ' Paise';
//   return words || 'Zero Rupees';
// }

// const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // ─── Build single bill HTML — A5 optimised ───────────────────
// function buildBillHTML(seller) {
//   const totalBags = parseInt(seller.num_bags) || 0;
//   let rawBags = [];
//   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

//   const bagRows = Array.from({ length: totalBags }, (_, i) => {
//     const b = rawBags[i] || {};
//     return {
//       srno:     String(i + 1).padStart(2, '0'),
//       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
//       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
//       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
//       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
//       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
//     };
//   });

//   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
//   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
//   const labourAmt   = 20 * totalBags;
//   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
//   const advance     = parseFloat(seller.advance_amount) || 0;
//   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

//   const bagRowsHtml = bagRows.map((b, i) => `
//     <tr style="background:${i%2===0?'#fff':'#eff6ff'}">
//       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;">${b.srno}</td>
//       <td style="border:1px solid #b8cef0;padding:1px 3px;text-align:left;font-size:7px;font-weight:700;">${b.material}</td>
//       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:6.5px;font-family:monospace;">${b.lot}</td>
//       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;">1</td>
//       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;font-weight:700;color:#1e40af;">${b.weight != null ? b.weight : '—'}</td>
//       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;font-weight:700;color:#166534;">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
//       <td style="border:1px solid #b8cef0;padding:1px 3px;text-align:right;font-size:7px;font-weight:700;color:#1a56db;">${b.amount != null ? inr(b.amount) : '—'}</td>
//     </tr>`).join('');

//   const html = `
// <div style="width:100%;font-family:Arial,sans-serif;font-size:7px;color:#111;background:#fff;
//   line-height:1.25;border:1.5px solid #1a56db;border-radius:2px;padding:4px 5px;
//   box-sizing:border-box;position:relative;">

//   <div style="position:absolute;top:2px;left:2px;right:2px;bottom:2px;
//     border:0.5px solid #a0bbf0;border-radius:1px;pointer-events:none;"></div>

//   <!-- HEADER -->
//   <div style="text-align:center;border-bottom:1.5px double #1a56db;padding-bottom:3px;margin-bottom:3px;">
//     <div style="display:flex;justify-content:space-between;align-items:center;font-size:6.5px;color:#444;margin-bottom:2px;">
//       <span style="text-align:left;line-height:1.4;"><br></span>
//       <div style="width:22px;height:22px;border-radius:50%;border:1.5px solid #1a56db;
//         display:inline-flex;align-items:center;justify-content:center;
//         font-weight:900;font-size:8px;color:#1a56db;background:#eff6ff;flex-shrink:0;">PH</div>
//       <span style="text-align:right;line-height:1.4;"><br></span>
//     </div>
//     <div style="font-size:12px;font-weight:900;color:#1a1a1a;line-height:1;margin:1px 0;">Mr.  Heggani</div>
//     <div style="margin:1px 0;">
//       <span style="display:inline-block;background:#1a56db;color:#fff;font-size:6px;font-weight:700;
//         letter-spacing:0.6px;padding:1px 6px;border-radius:1px;">
//         TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables
//       </span>
//     </div>
//     <div style="font-size:7px;font-weight:700;color:#333;">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
//     <div style="font-size:6px;color:#666;margin-top:1px;">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
//   </div>

//   <!-- META -->
//   <div style="border:1px solid #1a56db;border-radius:2px;margin-bottom:3px;overflow:hidden;">
//     <div style="display:flex;justify-content:space-between;padding:2px 5px;font-size:7.5px;border-bottom:1px solid #cfe2ff;">
//       <span><strong style="color:#1a56db">Bill No:</strong> ${seller.serial_number || '—'}</span>
//       <span><strong style="color:#1a56db">Date:</strong> ${fmtDate(seller.entry_date)}</span>
//     </div>
//     <div style="padding:2px 5px;font-size:7.5px;">
//       <strong style="color:#1a56db">Cust. Name:</strong> ${seller.name}
//     </div>
//   </div>

//   <!-- ITEMS TABLE -->
//   <table style="width:100%;border-collapse:collapse;margin-bottom:1px;table-layout:fixed;">
//     <colgroup>
//       <col style="width:6%">
//       <col style="width:18%">
//       <col style="width:12%">
//       <col style="width:6%">
//       <col style="width:13%">
//       <col style="width:13%">
//       <col style="width:32%">
//     </colgroup>
//     <thead>
//       <tr>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Sr.</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Particular</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Lot No.</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Bags</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Wt.(KG)</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">RATE</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Amount (&#8377;)</th>
//       </tr>
//     </thead>
//     <tbody>${bagRowsHtml}</tbody>
//     <tfoot>
//       <tr style="background:#dbeafe;border-top:1.5px solid #1a56db;">
//         <td colspan="3" style="border:1px solid #b8cef0;padding:2px 3px;font-weight:800;color:#1e40af;text-align:left;font-size:7px;">TOTAL</td>
//         <td style="border:1px solid #b8cef0;padding:2px 1px;text-align:center;font-weight:800;font-size:7px;">${totalBags}</td>
//         <td style="border:1px solid #b8cef0;padding:2px 1px;text-align:center;font-weight:800;color:#1e40af;font-size:7px;">${totalWeight.toFixed(2)}</td>
//         <td style="border:1px solid #b8cef0;padding:2px 1px;text-align:right;font-size:6.5px;color:#1e40af;font-weight:600;">Gross</td>
//         <td style="border:1px solid #b8cef0;padding:2px 3px;text-align:right;font-weight:800;color:#1a56db;font-size:9px;">&#8377; ${inr(grossAmount)}</td>
//       </tr>
//     </tfoot>
//   </table>

//   <!-- DEDUCTIONS -->
//   <table style="width:100%;border-collapse:collapse;margin-top:1px;table-layout:fixed;">
//     <colgroup><col style="width:62%"><col style="width:38%"></colgroup>
//     <tbody>
//       <tr>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7px;">Other Charges</td>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;text-align:right;font-weight:700;color:#dc2626;font-size:7.5px;">− &#8377; ${inr(commission)}</td>
//       </tr>
//       <tr>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7px;">Hamali / Labour Charges</td>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;text-align:right;font-weight:700;color:#dc2626;font-size:7.5px;">− &#8377; ${inr(labourAmt)}</td>
//       </tr>
//       <tr>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7px;">Advance Paid</td>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;text-align:right;font-weight:700;color:#dc2626;font-size:7.5px;">− &#8377; ${inr(advance)}</td>
//       </tr>
//       <tr style="background:#1a56db;">
//         <td style="padding:5px 7px;color:#fff;font-weight:900;font-size:10px;">NET AMOUNT</td>
//         <td style="padding:5px 7px;color:#fff;font-weight:900;font-size:12px;text-align:right;">&#8377; ${inr(Math.max(0, finalPay))}</td>
//       </tr>
//     </tbody>
//   </table>

//   <!-- IN WORDS -->
//   <div style="border:1px solid #1a56db;border-radius:2px;padding:2px 5px;font-size:7px;margin-top:3px;background:#f8fbff;line-height:1.4;">
//     <strong style="color:#1a56db;">In Words:</strong> ${toIndianWords(Math.max(0, finalPay))} Only
//   </div>
//   <div style="text-align:right;font-size:6.5px;color:#888;margin-top:1px;font-style:italic;">(E.&amp;O.E.)</div>

//   <!-- FOOTER -->
//   <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:8px;">
//     <div style="text-align:center;border-top:1px solid #555;padding-top:2px;font-size:7px;width:80px;color:#444;">Receiver's Sign.</div>
//     <div style="font-weight:800;font-size:7.5px;">For – Mr.</div>
//   </div>
// </div>`;

//   return { html, finalPay };
// }

// // ─── Print HTML helper ────────────────────────────────────────
// function openPrintWindow(fullHtml) {
//   if (window.electronAPI && window.electronAPI.printHTML) {
//     window.electronAPI.printHTML(fullHtml);
//   } else {
//     const w = window.open('', '_blank', 'width=900,height=750');
//     if (w && w.document) { w.document.write(fullHtml); w.document.close(); }
//   }
// }

// // ─── Wrap bills in full A5 print page ────────────────────────
// function wrapInPrintPage(billsHtml, title) {
//   return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>${title}</title>
//   <style>
//     @page {
//       size: A5 portrait;
//       margin: 3mm;
//     }
//     *, *::before, *::after {
//       box-sizing: border-box;
//       margin: 0;
//       padding: 0;
//     }
//     html, body {
//       width: 100%;
//       background: #fff;
//       font-family: Arial, sans-serif;
//     }
//     body {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//     }
//     .bill-page {
//       width: 142mm;
//       max-width: 142mm;
//       page-break-after: always;
//     }
//     .bill-page:last-child {
//       page-break-after: avoid;
//     }
//     @media print {
//       body {
//         -webkit-print-color-adjust: exact;
//         print-color-adjust: exact;
//       }
//     }
//   </style>
// </head>
// <body>
// ${billsHtml}
// <script>window.onload = function(){ window.print(); }<\/script>
// </body>
// </html>`;
// }

// // ─── Bulk print all selected sellers ─────────────────────────
// function printMultipleBills(sellers) {
//   const billsHtml = sellers
//     .map(s => `<div class="bill-page">${buildBillHTML(s).html}</div>`)
//     .join('\n');
//   openPrintWindow(wrapInPrintPage(billsHtml, `Bills — ${sellers.length} Sellers`));
// }

// // ─── Bill Modal ───────────────────────────────────────────────
// function BillModal({ seller, onClose }) {
//   const BLUE = '#1a56db';

//   const totalBags = parseInt(seller.num_bags) || 0;
//   let rawBags = [];
//   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

//   const bagRows = Array.from({ length: totalBags }, (_, i) => {
//     const b = rawBags[i] || {};
//     return {
//       srno:     String(i + 1).padStart(2, '0'),
//       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
//       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
//       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
//       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
//       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
//     };
//   });

//   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
//   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
//   const labourAmt   = 20 * totalBags;
//   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
//   const advance     = parseFloat(seller.advance_amount) || 0;
//   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

//   const printBill = () => {
//     const { html } = buildBillHTML(seller);
//     const billsHtml = `<div class="bill-page">${html}</div>`;
//     openPrintWindow(wrapInPrintPage(billsHtml, `Bill — ${seller.name}`));
//   };

//   // preview uses slightly larger sizes for on-screen readability
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" style={{ maxWidth:560, width:'95%', padding:0, overflow:'hidden', borderRadius:10 }} onClick={e=>e.stopPropagation()}>
//         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:BLUE, color:'#fff' }}>
//           <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
//           <div style={{ display:'flex', gap:8 }}>
//             <button onClick={printBill} style={{ background:'#fff', color:BLUE, border:'none', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
//               <Printer size={13}/> Print / PDF (A5)
//             </button>
//             <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}><X size={18}/></button>
//           </div>
//         </div>
//         <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f0f4ff' }}>
//           <div style={{ all:'initial', display:'block' }}>
//             <div style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'3px solid #1a56db', borderRadius:4, position:'relative' }}>
//               <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #a0bbf0', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>
//               <div style={{ textAlign:'center', borderBottom:'2.5px double #1a56db', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
//                 <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
//                   <span style={{ textAlign:'left' }}><br/></span>
//                   <div style={{ width:40, height:40, borderRadius:'50%', border:'2.5px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1a56db', background:'#eff6ff' }}>PH</div>
//                   <span style={{ textAlign:'right' }}><br/></span>
//                 </div>
//                 <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>SELLER BILL</div>
//                 <div><span style={{ display:'inline-block', background:'#1a56db', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}>TAMARIND,GINGER,GARLIC,ONION &amp; Vegetables</span></div>
//                 <div style={{ fontSize:11, fontWeight:700 }}>ORDER SUPPLIER &amp; COMMISSION AGENT</div>
//                 <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}>Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
//               </div>
//               <div style={{ border:'1.5px solid #1a56db', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
//                 <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
//                   <span><strong style={{ color:'#1a56db' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
//                   <span><strong style={{ color:'#1a56db' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
//                 </div>
//                 <div style={{ padding:'4px 8px', fontSize:11 }}>
//                   <strong style={{ color:'#1a56db' }}>Cust. Name :</strong> {seller.name}
//                 </div>
//               </div>
//               <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
//                 <thead>
//                   <tr>
//                     {['Sr.','Particular','Lot No.','Bags','Weight(KG)','RATE','Amount'].map(h=>(
//                       <th key={h} style={{ background:'#1a56db', color:'#fff', padding:'5px 4px', fontSize:9.5, fontWeight:700, border:'1px solid #1245b5', textAlign:'center' }}>{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {bagRows.map((b,i)=>(
//                     <tr key={i} style={{ background: i%2===0?'#fff':'#eff6ff' }}>
//                       <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, color:'#111' }}>{b.srno}</td>
//                       <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'left', fontSize:10, fontWeight:700, color:'#111' }}>{b.material}</td>
//                       <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontFamily:'monospace', color:'#333' }}>{b.lot}</td>
//                       <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:600, color:'#111' }}>1</td>
//                       <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#1e40af' }}>{b.weight!=null?b.weight:'—'}</td>
//                       <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#166534' }}>{b.rate!=null?Number(b.rate).toLocaleString('en-IN'):'—'}</td>
//                       <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'right', fontSize:10, fontWeight:800, color:'#1e40af' }}>{b.amount!=null?inr(b.amount):'—'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//                 <tfoot>
//                   <tr style={{ background:'#dbeafe', borderTop:'2px solid #1a56db' }}>
//                     <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#1e40af' }}>{totalWeight.toFixed(2)}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af' }}>Gross Amt.</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1a56db', fontSize:13 }}>₹ {inr(grossAmount)}</td>
//                   </tr>
//                 </tfoot>
//               </table>
//               <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
//                 <tbody>
//                   <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Other Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td></tr>
//                   <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
//                   <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td></tr>
//                   <tr style={{ background:'#1a56db' }}>
//                     <td style={{ padding:'9px 10px', color:'#fff', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
//                     <td style={{ padding:'9px 10px', color:'#fff', fontWeight:900, fontSize:16, textAlign:'right' }}>₹ {inr(Math.max(0, finalPay))}</td>
//                   </tr>
//                 </tbody>
//               </table>
//               <div style={{ border:'1.5px solid #1a56db', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
//                 <strong style={{ color:'#1a56db' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
//               </div>
//               <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>
//               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
//                 <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
//                 <div style={{ fontWeight:800, fontSize:11 }}>For – Praveen</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Edit Modal ───────────────────────────────────────────────
// function EditModal({ seller, onClose, onSave }) {
//   const num = parseInt(seller.num_bags) || 0;
//   const lot = seller.lot_number || (seller.serial_number + '/' + num);

//   const [rows,    setRows]    = useState(() => getBags(seller));
//   const [nBags,   setNBags]   = useState(String(num));
//   const [advance, setAdvance] = useState(String(seller.advance_amount || ''));
//   const [labour,  setLabour]  = useState('20');
//   const [saving,  setSaving]  = useState(false);
//   const [buyers,  setBuyers]  = useState([]);

//   useEffect(() => {
//     API.get('/api/buyers').then(res => {
//       setBuyers(res.data.data || []);
//     }).catch(() => {});
//   }, []);

//   const changeNBags = (v) => {
//     setNBags(v);
//     const n = parseInt(v) || 0;
//     setRows(prev => Array.from({ length: n }, (_, i) =>
//       prev[i] || { lot, weight: '', rate: '', amount: '', buyer: '' }
//     ));
//   };

//   const update = (i, field, val) => {
//     setRows(prev => prev.map((r, j) => {
//       if (j !== i) return r;
//       const next = { ...r, [field]: val };
//       if (field === 'weight' || field === 'rate') {
//         const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
//         const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
//         next.amount = w && rt ? ((w * rt) / 100).toFixed(2) : '';
//       }
//       return next;
//     }));
//   };

//   const bags        = parseInt(nBags) || 0;
//   const totalW      = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
//   const grossAmount = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
//   const labourAmt   = (parseFloat(labour) || 0) * bags;
//   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   const totalDeduct = parseFloat((labourAmt + commission).toFixed(2));
//   const netPayable  = parseFloat((grossAmount - totalDeduct).toFixed(2));
//   const finalPay    = parseFloat((netPayable - (parseFloat(advance) || 0)).toFixed(2));

//   const ratesDone = rows.filter(r => parseFloat(r.rate) > 0).length;
//   const wtsDone   = rows.filter(r => parseFloat(r.weight) > 0).length;

//   const iStyle = (val, col) => ({
//     background:   val ? col + '11' : 'var(--bg-panel)',
//     border:       '1px solid ' + (val ? col + '66' : 'var(--border-light)'),
//     borderRadius: 7, padding: '8px 11px',
//     color:        val ? col : 'var(--text-muted)',
//     fontFamily:   'var(--font-body)', fontSize: 13, fontWeight: 700,
//     outline: 'none', width: '100%',
//   });

//   const buyerOptions = buyers.map(b => {
//     const display = (b.lot_number && b.lot_number !== '—') ? b.lot_number : b.name;
//     return { value: display, label: display, fullName: b.name };
//   });

//   const save = async () => {
//     if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
//     setSaving(true);
//     try {
//       const bag_data = rows.map(r => ({
//         lot,
//         weight: parseFloat(r.weight) || 0,
//         rate:   parseFloat(r.rate)   || 0,
//         amount: parseFloat(r.amount) || 0,
//         buyer:  r.buyer || '',
//       }));
//       await API.put('/api/sellers/' + seller.id, {
//         num_bags:       bags,
//         weight:         totalW,
//         amount:         netPayable,
//         advance_amount: parseFloat(advance) || 0,
//         rate_fixed:     totalW > 0 && grossAmount > 0 ? parseFloat((grossAmount / totalW * 100).toFixed(2)) : 0,
//         bag_data:       JSON.stringify(bag_data),
//       });
//       toast.success('Saved! Final payable: ₹' + fmtINR(finalPay));
//       onSave(); onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.error || err.message || 'Failed');
//     } finally { setSaving(false); }
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" style={{ maxWidth:960, width:'95%' }} onClick={e=>e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
//           <button className="modal-close" onClick={onClose}><X size={20}/></button>
//         </div>

//         <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
//           {[['Serial No',seller.serial_number],['Lot No',lot],
//             ['Material',seller.material&&seller.material!=='GENERAL'?seller.material:'—'],
//             ['Date',fmtDate(seller.entry_date)]
//           ].map(([l,v])=>(
//             <div key={l} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 13px', fontSize:12 }}>
//               <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{l}</div>
//               <div style={{ fontWeight:700 }}>{v}</div>
//             </div>
//           ))}
//         </div>

//         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:18 }}>
//           <div className="form-group">
//             <label className="form-label">Number of Bags</label>
//             <input className="form-input" type="number" value={nBags} onChange={e=>changeNBags(e.target.value)} min="1" max="100" style={{ textTransform:'none' }}/>
//           </div>
//           <div className="form-group">
//             <label className="form-label">Advance Paid (₹)</label>
//             <input className="form-input" type="number" value={advance} onChange={e=>setAdvance(e.target.value)} placeholder="0.00" step="0.01" style={{ textTransform:'none' }}/>
//           </div>
//           <div className="form-group">
//             <label className="form-label">Labour Rate (₹ per bag)</label>
//             <input className="form-input" type="number" value={labour} onChange={e=>setLabour(e.target.value)} placeholder="20" step="1" min="0" style={{ textTransform:'none' }}/>
//           </div>
//         </div>

//         {rows.length > 0 && (
//           <>
//             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
//               <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//                 <Package size={15} style={{ color:'var(--accent)' }}/>
//                 <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Bag-wise Details</span>
//                 <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>Lot: {lot}</span>
//                 <span style={{ fontSize:11, color:wtsDone===rows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
//                   {wtsDone}/{rows.length} weights
//                 </span>
//               </div>
//               <span style={{ fontSize:11, color:'var(--text-muted)' }}>Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
//             </div>

//             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
//               {['#','Lot','Weight (kg)','Rate (₹/100kg)','Buyer','Amount (₹)'].map(h=>(
//                 <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
//               ))}
//             </div>

//             <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:300, overflowY:'auto' }}>
//               {rows.map((r,i)=>(
//                 <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<rows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
//                   <div style={{ width:24, height:24, borderRadius:5, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>{i+1}</div>
//                   <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lot}</div>
//                   <input type="number" value={r.weight} onChange={e=>update(i,'weight',e.target.value)}
//                     placeholder="Enter weight" step="0.01" min="0.01" onWheel={e=>e.target.blur()}
//                     style={iStyle(r.weight,'#3b82f6')}
//                     onFocus={e=>{e.target.style.borderColor='#3b82f6';e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'}}
//                     onBlur={e=>{e.target.style.borderColor=r.weight?'#3b82f666':'var(--border-light)';e.target.style.boxShadow='none'}}
//                   />
//                   <input type="number" value={r.rate} onChange={e=>update(i,'rate',e.target.value)}
//                     placeholder="e.g. 3200" step="0.01" min="0" onWheel={e=>e.target.blur()}
//                     style={iStyle(r.rate,'#10b981')}
//                     onFocus={e=>{e.target.style.borderColor='#10b981';e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'}}
//                     onBlur={e=>{e.target.style.borderColor=r.rate?'#10b98166':'var(--border-light)';e.target.style.boxShadow='none'}}
//                   />
//                   <select value={r.buyer||''} onChange={e=>update(i,'buyer',e.target.value)}
//                     style={{ background:r.buyer?'rgba(139,92,246,0.1)':'var(--bg-panel)', border:`1px solid ${r.buyer?'rgba(139,92,246,0.5)':'var(--border-light)'}`, borderRadius:7, padding:'8px 10px', color:r.buyer?'#a78bfa':'var(--text-muted)', fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, outline:'none', width:'100%', cursor:'pointer' }}
//                   >
//                     <option value="">— Select Buyer —</option>
//                     {buyerOptions.map((b,idx)=>(
//                       <option key={idx} value={b.value}>{b.label}</option>
//                     ))}
//                   </select>
//                   <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
//                     {r.amount?'₹'+fmtINR(r.amount):'—'}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
//               <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
//               <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
//               <div style={{ fontSize:12, color:ratesDone===rows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{rows.length} rates {ratesDone===rows.length?'✓':''}</div>
//               <div style={{ fontSize:11, color:'var(--text-muted)' }}>{rows.filter(r=>r.buyer).length}/{rows.length} buyers assigned</div>
//               <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
//             </div>
//           </>
//         )}

//         {grossAmount > 0 && (
//           <div style={{ marginTop:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
//             <div style={{ background:'var(--bg-panel)', padding:'10px 18px', borderBottom:'1px solid var(--border)' }}>
//               <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>💰 Payment Calculation</span>
//             </div>
//             <div>
//               {[
//                 { label:'Gross Amount',           sub:`${rows.length} bags × Rate`,      val:`₹ ${fmtINR(grossAmount)}`,               color:'var(--accent)',         fs:16 },
//                 { label:'− Labour / Hamali',      sub:`₹${labour||20} × ${bags} bags`,  val:`− ₹ ${fmtINR(labourAmt)}`,              color:'var(--red)',            fs:15 },
//                 { label:'− Other Charges',   sub:`8% of ₹${fmtINR(grossAmount)}`, val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
//                 { label:'Net Amount',             sub:'Gross − Labour − Commission',     val:`₹ ${fmtINR(netPayable)}`,               color:'var(--blue)',           fs:16, highlight:true },
//                 { label:'− Advance Already Paid', sub:'',                               val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`, color:'var(--text-secondary)', fs:15 },
//               ].map((row,i)=>(
//                 <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
//                   <div>
//                     <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
//                     {row.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
//                   </div>
//                   <div style={{ fontSize:row.fs, fontWeight:800, color:row.color, fontFamily:'var(--font-display)' }}>{row.val}</div>
//                 </div>
//               ))}
//               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px', background:finalPay>=0?'var(--green-dim)':'var(--red-dim)' }}>
//                 <div>
//                   <div style={{ fontSize:15, fontWeight:800, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
//                     {finalPay>=0?'✅ Final Amount to Pay Seller':'⚠️ Seller Owes Back'}
//                   </div>
//                   <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Net − Advance</div>
//                 </div>
//                 <div style={{ fontSize:24, fontWeight:900, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
//                   ₹ {fmtINR(Math.abs(finalPay))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
//           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
//           <button className="btn btn-primary" onClick={save} disabled={saving}>
//             <Check size={15}/> {saving?'Saving...':'Save Changes'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Checkbox style ───────────────────────────────────────────
// const cbStyle = (checked) => ({
//   width:17, height:17, borderRadius:4, border:`2px solid ${checked?'#1a56db':'var(--border)'}`,
//   background:checked?'#1a56db':'transparent', cursor:'pointer', display:'flex',
//   alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s',
// });

// // ─── Main ─────────────────────────────────────────────────────
// export default function SellerList() {
//   const [sellers,  setSellers]  = useState([]);
//   const [loading,  setLoading]  = useState(true);
//   const [search,   setSearch]   = useState('');
//   const [fDate,    setFDate]    = useState(todayISO());
//   const [fMat,     setFMat]     = useState('');
//   const [bill,     setBill]     = useState(null);
//   const [editing,  setEditing]  = useState(null);
//   const [confirm,  setConfirm]  = useState(null);
//   const [selected, setSelected] = useState(new Set());

//   const load = useCallback(async () => {
//     setLoading(true);
//     setSelected(new Set());
//     try {
//       const res = await API.get('/api/sellers', { params: fDate ? { date: fDate } : {} });
//       const sorted = [...(res.data.data || [])].sort(
//         (a,b) => (parseInt(a.serial_number)||0) - (parseInt(b.serial_number)||0)
//       );
//       setSellers(sorted);
//     } catch(err) { toast.error(err.message||'Load failed'); }
//     finally { setLoading(false); }
//   }, [fDate]);

//   useEffect(() => { load(); }, [load]);

//   const del = (id, name) => setConfirm({
//     title: 'Delete Seller?',
//     message: `"${name}" will be permanently removed.`,
//     onConfirm: async () => {
//       try { await API.delete(`/api/sellers/${id}`); toast.success('Deleted'); load(); }
//       catch(err) { toast.error(err.message||'Failed'); }
//     }
//   });

//   const clear = () => { setSearch(''); setFDate(todayISO()); setFMat(''); };

//   const list = sellers.filter(s => {
//     const q = search.toLowerCase();
//     return (!q || [s.name,s.mobile,s.lot_number,s.serial_number,s.material].some(v=>v?.toLowerCase().includes(q)))
//       && (!fMat || s.material===fMat);
//   });

//   const allIds       = list.map(s => s.id);
//   const allSelected  = allIds.length > 0 && allIds.every(id => selected.has(id));
//   const someSelected = allIds.some(id => selected.has(id));
//   const selectedCount = allIds.filter(id => selected.has(id)).length;

//   const toggleAll = () => {
//     if (allSelected) {
//       setSelected(prev => { const next = new Set(prev); allIds.forEach(id=>next.delete(id)); return next; });
//     } else {
//       setSelected(prev => { const next = new Set(prev); allIds.forEach(id=>next.add(id)); return next; });
//     }
//   };

//   const toggleOne = (id) => {
//     setSelected(prev => { const next = new Set(prev); next.has(id)?next.delete(id):next.add(id); return next; });
//   };

//   const printSelected = () => {
//     const toprint = list.filter(s => selected.has(s.id));
//     if (toprint.length === 0) { toast.error('Select at least one seller'); return; }
//     printMultipleBills(toprint);
//   };

//   const tot = list.reduce((a,s)=>({
//     bags: a.bags+Number(s.num_bags||0), wt: a.wt+Number(s.weight||0),
//     adv:  a.adv+Number(s.advance_amount||0), amt: a.amt+Number(s.amount||0),
//   }),{ bags:0, wt:0, adv:0, amt:0 });

//   return (
//     <div>
//       <div className="page-header">
//         <div>
//           <div className="page-title">Seller List</div>
//           <div className="page-subtitle">
//             {loading ? 'Loading...' : `${sellers.length} sellers${fDate ? ` for ${fDate}` : ''}`}
//           </div>
//         </div>
//         <div style={{ display:'flex', gap:8, alignItems:'center' }}>
//           {selectedCount > 0 && (
//             <button
//               className="btn btn-primary"
//               onClick={printSelected}
//               style={{ display:'flex', alignItems:'center', gap:6, background:'#1a56db', color:'#fff', fontWeight:700, fontSize:13, padding:'7px 15px', borderRadius:8, border:'none', cursor:'pointer' }}
//             >
//               <Printer size={14}/>
//               Print {selectedCount} Bill{selectedCount>1?'s':''}
//             </button>
//           )}
//           <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
//         </div>
//       </div>

//       <div className="filter-bar">
//         <div className="search-box" style={{ flex:2 }}>
//           <Search className="search-icon" size={16}/>
//           <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, lot no..." style={{ textTransform:'none' }}/>
//         </div>
//         <input className="form-input" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{ textTransform:'none', flex:1 }}/>
//         <button className="btn btn-secondary btn-sm" onClick={()=>setFDate(todayISO())}>Today</button>
//         <button className="btn btn-secondary btn-sm" onClick={()=>setFDate('')}>All</button>
//         <select className="form-select" value={fMat} onChange={e=>setFMat(e.target.value)} style={{ flex:1 }}>
//           <option value="">All Materials</option>
//           {MATERIALS.map(m=><option key={m}>{m}</option>)}
//         </select>
//         {(search||fMat)&&<button className="btn btn-secondary" onClick={clear}><X size={14}/> Clear</button>}
//       </div>

//       {list.length > 0 && (
//         <div style={{ display:'flex', gap:12, marginBottom:16 }}>
//           {[['Sellers',list.length,'var(--accent)'],['Bags',tot.bags,'var(--green)'],
//             ['Weight',fmtNum(tot.wt)+' kg','var(--blue)'],['Amount','₹ '+fmtINR(tot.amt),'var(--purple)'],
//             ['Advance','₹ '+fmtINR(tot.adv),'var(--text-secondary)']
//           ].map(([l,v,c])=>(
//             <div key={l} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
//               <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{l}</div>
//               <div style={{ fontSize:15, fontWeight:800, color:c, fontFamily:'var(--font-display)' }}>{v}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="table-wrapper">
//         {loading ? (
//           <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading...</div>
//         ) : list.length === 0 ? (
//           <div className="empty-state">
//             <div className="empty-state-icon">👨‍🌾</div>
//             <h3>{fDate ? `No sellers registered for ${fDate}` : 'No sellers found'}</h3>
//             <p style={{ fontSize:12, marginTop:6, color:'var(--text-muted)' }}>
//               {fDate ? 'Click "All" to see all sellers, or change the date' : 'Register a seller to get started'}
//             </p>
//             {fDate && (
//               <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'center' }}>
//                 <button className="btn btn-secondary btn-sm" onClick={()=>setFDate('')}>Show All Sellers</button>
//                 <button className="btn btn-secondary btn-sm" onClick={()=>setFDate(todayISO())}>Today</button>
//               </div>
//             )}
//           </div>
//         ) : (
//           <table>
//             <thead>
//               <tr>
//                 <th style={{ width:36, textAlign:'center', padding:'10px 8px' }}>
//                   <div
//                     onClick={toggleAll}
//                     style={{ ...cbStyle(allSelected), margin:'0 auto', opacity:someSelected&&!allSelected?0.6:1 }}
//                     title={allSelected?'Deselect all':'Select all'}
//                   >
//                     {(allSelected||someSelected) && <Check size={11} color="#fff" strokeWidth={3}/>}
//                   </div>
//                 </th>
//                 <th>#</th><th>Sr</th><th>Name</th><th>Mobile</th><th>Material</th>
//                 <th>Bags</th><th>Lot</th><th>Weight</th><th>Amount</th><th>Advance</th><th>Balance</th><th>Date</th>
//                 <th style={{ textAlign:'center' }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {list.map((s,i)=>{
//                 const bal = (s.amount||0) - (s.advance_amount||0);
//                 const isChecked = selected.has(s.id);
//                 let bags = []; try { bags = JSON.parse(s.bag_data||'[]'); } catch {}
//                 const rd = bags.filter(b=>Number(b.rate)>0).length;
//                 return (
//                   <tr key={s.id} style={{ background:isChecked?'rgba(26,86,219,0.06)':undefined }}>
//                     <td style={{ textAlign:'center', padding:'10px 8px' }}>
//                       <div onClick={()=>toggleOne(s.id)} style={{ ...cbStyle(isChecked), margin:'0 auto' }}>
//                         {isChecked && <Check size={11} color="#fff" strokeWidth={3}/>}
//                       </div>
//                     </td>
//                     <td className="td-muted" style={{ fontSize:12 }}>{i+1}</td>
//                     <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
//                     <td style={{ fontWeight:600 }}>{s.name}</td>
//                     <td className="td-muted">{s.mobile&&s.mobile!=='0000000000'?s.mobile:'—'}</td>
//                     <td>
//                       {s.material&&s.material!=='GENERAL'
//                         ? <span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
//                         : <span className="td-muted">—</span>}
//                     </td>
//                     <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
//                     <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
//                     <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
//                     <td style={{ fontWeight:700, color:'var(--accent)' }}>
//                       {s.amount
//                         ? `₹${fmtINR(s.amount)}`
//                         : <span style={{ fontSize:11, color:'var(--text-muted)' }}>{rd}/{bags.length} rates</span>}
//                     </td>
//                     <td className="td-muted">{s.advance_amount?`₹${fmtINR(s.advance_amount)}`:'—'}</td>
//                     <td style={{ fontWeight:600, color:bal>0?'var(--red)':'var(--green)' }}>
//                       {s.amount?`₹${fmtINR(bal)}`:'—'}
//                     </td>
//                     <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
//                     <td>
//                       <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
//                         <button className="btn btn-blue btn-sm" onClick={()=>setEditing(s)} title="Edit"><Edit2 size={13}/></button>
//                         <button className="btn btn-green btn-sm" onClick={()=>setBill(s)} title="Bill"><Eye size={13}/></button>
//                         <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={()=>setBill(s)} title="Print"><Printer size={13}/></button>
//                         <button className="btn btn-red btn-sm" onClick={()=>del(s.id,s.name)} title="Delete"><Trash2 size={13}/></button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//             {list.length > 1 && (
//               <tfoot>
//                 <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
//                   <td colSpan={6} style={{ padding:'11px 15px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({list.length})</td>
//                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{tot.bags}</td>
//                   <td/>
//                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{fmtNum(tot.wt)}</td>
//                   <td style={{ padding:'11px 15px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(tot.amt)}</td>
//                   <td style={{ padding:'11px 15px', fontWeight:700 }}>₹{fmtINR(tot.adv)}</td>
//                   <td style={{ padding:'11px 15px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(tot.amt-tot.adv)}</td>
//                   <td colSpan={2}/>
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         )}
//       </div>

//       {bill    && <BillModal  seller={bill}    onClose={()=>setBill(null)}/>}
//       {editing && <EditModal  seller={editing} onClose={()=>setEditing(null)} onSave={load}/>}
//       {confirm && <ConfirmDialog {...confirm}  onClose={()=>setConfirm(null)}/>}

//       <style>{`
//         input[type=number]::-webkit-inner-spin-button,
//         input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
//         input[type=number] { -moz-appearance:textfield; }
//       `}</style>
//     </div>
//   );
// }



// -----------------------------------------------------------------------------------------------------------



// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import toast from 'react-hot-toast';
// // import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package } from 'lucide-react';
// // import { getSellers, updateSeller, deleteSeller as apiDeleteSeller } from '../api';
// // import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// // import ConfirmDialog from '../ConfirmDialog';

// // // ─── Helper: parse bag_data safely ───────────────────────────
// // function parseBagData(seller) {
// //   const numBags  = parseInt(seller.num_bags) || 0;
// //   const lotLabel = seller.lot_number || (seller.serial_number + '/' + numBags);
// //   let parsed = [];

// //   try {
// //     const raw = seller.bag_data;
// //     if (raw && raw !== '[]' && raw !== '' && raw !== 'null') {
// //       parsed = JSON.parse(raw);
// //     }
// //   } catch (e) {
// //     console.warn('bag_data parse error:', e, 'raw:', seller.bag_data);
// //     parsed = [];
// //   }

// //   console.log('[parseBagData] seller id:', seller.id, 'num_bags:', numBags, 'parsed:', parsed);

// //   const rows = [];
// //   for (let i = 0; i < numBags; i++) {
// //     const saved = parsed[i];
// //     const w = saved ? Number(saved.weight) : 0;
// //     const r = saved ? Number(saved.rate)   : 0;
// //     const a = saved ? Number(saved.amount) : 0;
// //     rows.push({
// //       lot:    lotLabel,
// //       weight: w > 0 ? String(w) : '',
// //       rate:   r > 0 ? String(r) : '',
// //       amount: a > 0 ? String(a) : '',
// //     });
// //   }

// //   console.log('[parseBagData] final rows:', rows);
// //   return rows;

// // }

// // // Check if all weights in bag_data are zero/missing
// // function hasNoWeights(seller) {
// //   try {
// //     const parsed = JSON.parse(seller.bag_data || '[]');
// //     return parsed.length === 0 || parsed.every(b => !b.weight || Number(b.weight) === 0);
// //   } catch { return true; }
// // }

// // // ─── Bill Modal ───────────────────────────────────────────────
// // function BillModal({ seller, onClose }) {
// //   const printRef = useRef();

// //   const handlePrint = () => {
// //     const content = printRef.current.innerHTML;
// //     const w = window.open('', '_blank', 'width=850,height=700');
// //     w.document.write(`<!DOCTYPE html><html><head><title>Seller Bill — ${seller.name}</title>
// //     <style>
// //       * { box-sizing:border-box; margin:0; padding:0; }
// //       body { font-family:Arial,sans-serif; padding:40px; color:#111; font-size:13px; }
// //       .hdr { text-align:center; border-bottom:2px solid #222; padding-bottom:16px; margin-bottom:20px; }
// //       table { width:100%; border-collapse:collapse; margin-bottom:14px; }
// //       th,td { border:1px solid #ddd; padding:9px 13px; text-align:left; }
// //       th { background:#f5f5f5; font-weight:700; }
// //       tr:nth-child(even) td { background:#fafafa; }
// //       .foot { margin-top:32px; display:flex; justify-content:space-between; font-size:11px; color:#888; }
// //     </style></head><body>${content}
// //     <script>window.onload=function(){window.print();}<\/script></body></html>`);
// //     w.document.close();
// //   };

// //   const bags   = parseBagData(seller);
// //   const balance = (seller.amount || 0) - (seller.advance_amount || 0);

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth:720 }} onClick={e => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <div className="modal-title">🧾 Seller Bill</div>
// //           <div style={{ display:'flex', gap:8 }}>
// //             <button className="btn btn-primary btn-sm" onClick={handlePrint}><Printer size={14} /> Print / PDF</button>
// //             <button className="modal-close" onClick={onClose}><X size={20} /></button>
// //           </div>
// //         </div>
// //         <div ref={printRef}>
// //           <div className="hdr" style={{ textAlign:'center', borderBottom:'2px solid var(--border)', paddingBottom:16, marginBottom:20 }}>
// //             <div style={{ fontSize:24, fontWeight:800, fontFamily:'var(--font-display)', color:'var(--text-primary)' }}>🌾 AGRITRADER</div>
// //             <div style={{ color:'var(--text-muted)', fontSize:12, marginTop:4 }}>Agricultural Market Management System</div>
// //             <span className="badge badge-amber" style={{ marginTop:8, display:'inline-block' }}>SELLER RECEIPT</span>
// //           </div>
// //           <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, marginBottom:16 }}>
// //             <tbody>
// //               {[
// //                 ['Serial No.',  seller.serial_number],
// //                 ['Seller Name', seller.name],
// //                 ['Mobile',      seller.mobile && seller.mobile !== '0000000000' ? seller.mobile : '—'],
// //                 ['Material',    seller.material && seller.material !== 'GENERAL' ? seller.material : '—'],
// //                 ['Lot Number',  seller.lot_number],
// //                 ['Total Bags',  seller.num_bags],
// //                 ['Entry Date',  fmtDate(seller.entry_date)],
// //               ].map(([label, val], i) => (
// //                 <tr key={label} style={{ background: i%2===0 ? 'var(--bg-panel)':'transparent', borderBottom:'1px solid var(--border)' }}>
// //                   <td style={{ padding:'9px 14px', fontWeight:600, color:'var(--text-secondary)', width:'38%' }}>{label}</td>
// //                   <td style={{ padding:'9px 14px', color:'var(--text-primary)' }}>{val}</td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //           {bags.length > 0 && (
// //             <>
// //               <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, color:'var(--text-secondary)', marginBottom:8, letterSpacing:1, textTransform:'uppercase' }}>Bag-wise Breakdown</div>
// //               <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, marginBottom:16 }}>
// //                 <thead>
// //                   <tr style={{ background:'var(--bg-panel)' }}>
// //                     {['Bag #','Lot No','Weight (kg)','Rate (₹/100kg)','Amount (₹)'].map(h => (
// //                       <th key={h} style={{ padding:'9px 14px', color:'var(--text-muted)', fontWeight:700 }}>{h}</th>
// //                     ))}
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {bags.map((b, i) => (
// //                     <tr key={i} style={{ background: i%2===0 ? 'var(--bg-panel)':'transparent', borderBottom:'1px solid var(--border)' }}>
// //                       <td style={{ padding:'9px 14px', fontWeight:700, color:'var(--accent)' }}>{i+1}</td>
// //                       <td style={{ padding:'9px 14px', fontFamily:'monospace' }}>{b.lot}</td>
// //                       <td style={{ padding:'9px 14px' }}>{b.weight || '—'}</td>
// //                       <td style={{ padding:'9px 14px', color: b.rate ? 'var(--green)':'var(--text-muted)' }}>{b.rate ? `₹${fmtINR(b.rate)}` : '—'}</td>
// //                       <td style={{ padding:'9px 14px', fontWeight:700, color:'var(--accent)' }}>{b.amount ? `₹${fmtINR(b.amount)}` : '—'}</td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //                 <tfoot>
// //                   <tr style={{ background:'var(--accent-dim)', borderTop:'2px solid var(--border)' }}>
// //                     <td colSpan={2} style={{ padding:'11px 14px', fontWeight:700, color:'var(--text-secondary)' }}>TOTAL</td>
// //                     <td style={{ padding:'11px 14px', fontWeight:800 }}>{fmtNum(seller.weight)} kg</td>
// //                     <td />
// //                     <td style={{ padding:'11px 14px', fontWeight:800, color:'var(--accent)', fontSize:15 }}>₹ {fmtINR(seller.amount)}</td>
// //                   </tr>
// //                 </tfoot>
// //               </table>
// //             </>
// //           )}
// //           <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
// //             <tbody>
// //               <tr style={{ background:'var(--accent-dim)', borderBottom:'1px solid var(--border)' }}>
// //                 <td style={{ padding:'11px 14px', fontWeight:700, color:'var(--accent)' }}>Gross Amount</td>
// //                 <td style={{ padding:'11px 14px', fontWeight:800, color:'var(--accent)', fontSize:16 }}>₹ {fmtINR(seller.amount)}</td>
// //               </tr>
// //               <tr style={{ borderBottom:'1px solid var(--border)' }}>
// //                 <td style={{ padding:'10px 14px', fontWeight:600, color:'var(--text-secondary)' }}>Advance Paid</td>
// //                 <td style={{ padding:'10px 14px' }}>₹ {fmtINR(seller.advance_amount)}</td>
// //               </tr>
// //               <tr style={{ background: balance>0 ? 'var(--red-dim)':'var(--green-dim)' }}>
// //                 <td style={{ padding:'11px 14px', fontWeight:700, color: balance>0 ? 'var(--red)':'var(--green)' }}>Balance Due</td>
// //                 <td style={{ padding:'11px 14px', fontWeight:800, color: balance>0 ? 'var(--red)':'var(--green)', fontSize:16 }}>
// //                   ₹ {fmtINR(balance)} {balance<=0 && '✓ PAID'}
// //                 </td>
// //               </tr>
// //             </tbody>
// //           </table>
// //           <div style={{ marginTop:28, display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)' }}>
// //             <span>Printed: {new Date().toLocaleString('en-IN')}</span>
// //             <span style={{ borderTop:'1px solid var(--border)', paddingTop:6, width:140, textAlign:'center' }}>Authorised Signature</span>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Edit Modal ───────────────────────────────────────────────
// // function EditModal({ seller, onClose, onSave }) {
// //   const numBags  = parseInt(seller.num_bags) || 0;
// //   const lotLabel = seller.lot_number || `${seller.serial_number}/${numBags}`;

// //   // ✅ Synchronous lazy initializer — runs once, reads bag_data directly
// //   const [bags, setBags]               = useState(() => parseBagData(seller));
// //   const [numBagsEdit, setNumBagsEdit] = useState(String(numBags));
// //   const [advance,     setAdvance]     = useState(String(seller.advance_amount || ''));
// //   const [loading,     setLoading]     = useState(false);
// //   const [noWeights,   setNoWeights]   = useState(() => hasNoWeights(seller));
// //   const [repairWeights, setRepairWeights] = useState(
// //     () => Array.from({ length: parseInt(seller.num_bags)||0 }, () => '')
// //   );

// //   const applyRepairWeights = () => {
// //     const allFilled = repairWeights.every(w => w && parseFloat(w) > 0);
// //     if (!allFilled) { toast.error('Enter all bag weights to fix'); return; }
// //     const fixed = repairWeights.map(w => ({
// //       lot:    lotLabel,
// //       weight: String(parseFloat(w)),
// //       rate:   '',
// //       amount: '',
// //     }));
// //     setBags(fixed);
// //     setNoWeights(false);
// //     toast.success('Weights applied! Now enter rates and save.');
// //   };

// //   // Only resize when user explicitly changes num bags field
// //   const handleNumBagsChange = (val) => {
// //     setNumBagsEdit(val);
// //     const n = parseInt(val) || 0;
// //     setBags(prev => {
// //       const rows = [];
// //       for (let i = 0; i < n; i++) {
// //         rows.push(prev[i] || { lot: lotLabel, weight: '', rate: '', amount: '' });
// //       }
// //       return rows;
// //     });
// //   };

// //   // Update one field in one bag row; auto-calc amount
// //   const updateBag = (i, field, value) => {
// //     setBags(prev => prev.map((bag, idx) => {
// //       if (idx !== i) return bag;
// //       const updated = { ...bag, [field]: value };
// //       if (field === 'weight' || field === 'rate') {
// //         const w = parseFloat(field === 'weight' ? value : bag.weight) || 0;
// //         const r = parseFloat(field === 'rate'   ? value : bag.rate)   || 0;
// //         updated.amount = (w > 0 && r > 0) ? ((w * r) / 100).toFixed(2) : '';
// //       }
// //       return updated;
// //     }));
// //   };

// //   const totalWeight    = bags.reduce((s, b) => s + (parseFloat(b.weight) || 0), 0);
// //   const totalAmount    = bags.reduce((s, b) => s + (parseFloat(b.amount) || 0), 0);
// //   const ratesSetCount  = bags.filter(b => parseFloat(b.rate) > 0).length;
// //   const weightsSetCount = bags.filter(b => parseFloat(b.weight) > 0).length;

// //   const save = async () => {
// //     if (bags.some(b => !b.weight || parseFloat(b.weight) <= 0)) {
// //       toast.error('Enter weight for all bags');
// //       return;
// //     }
// //     setLoading(true);
// //     try {
// //       const bagDataToSave = bags.map(b => ({
// //         lot:    lotLabel,
// //         weight: parseFloat(b.weight) || 0,
// //         rate:   parseFloat(b.rate)   || 0,
// //         amount: parseFloat(b.amount) || 0,
// //       }));

// //       await updateSeller(seller.id, {
// //         num_bags:       parseInt(numBagsEdit),
// //         weight:         totalWeight,
// //         amount:         totalAmount,
// //         advance_amount: parseFloat(advance) || 0,
// //         rate_fixed:     totalWeight > 0 && totalAmount > 0
// //                           ? parseFloat((totalAmount / totalWeight * 100).toFixed(2)) : 0,
// //         bag_data:       JSON.stringify(bagDataToSave),
// //       });

// //       toast.success('Seller updated!');
// //       onSave();
// //       onClose();
// //     } catch (err) {
// //       toast.error(err.message || 'Failed to update');
// //     } finally { setLoading(false); }
// //   };

// //   const inputStyle = (val, focusColor) => ({
// //     background:  val ? `${focusColor}11` : 'var(--bg-panel)',
// //     border:      `1px solid ${val ? `${focusColor}66` : 'var(--border-light)'}`,
// //     borderRadius: 7, padding: '8px 12px',
// //     color:       val ? focusColor : 'var(--text-muted)',
// //     fontFamily:  'var(--font-body)', fontSize: 13, fontWeight: 700,
// //     outline:     'none', width: '100%',
// //   });

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth:840, width:'95%' }} onClick={e => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
// //           <button className="modal-close" onClick={onClose}><X size={20} /></button>
// //         </div>

// //         {/* Info strip */}
// //         <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
// //           {[
// //             { label:'Serial No', value: seller.serial_number },
// //             { label:'Lot No',    value: lotLabel },
// //             { label:'Material',  value: seller.material && seller.material !== 'GENERAL' ? seller.material : '—' },
// //             { label:'Date',      value: fmtDate(seller.entry_date) },
// //           ].map(item => (
// //             <div key={item.label} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', fontSize:12 }}>
// //               <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{item.label}</div>
// //               <div style={{ fontWeight:700, color:'var(--text-primary)' }}>{item.value}</div>
// //             </div>
// //           ))}
// //         </div>

// //         {/* Top editable fields */}
// //         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
// //           <div className="form-group">
// //             <label className="form-label">Number of Bags</label>
// //             <input className="form-input" type="number" value={numBagsEdit}
// //               onChange={e => handleNumBagsChange(e.target.value)}
// //               min="1" max="100" style={{ textTransform:'none' }} />
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Advance Amount (₹)</label>
// //             <input className="form-input" type="number" value={advance}
// //               onChange={e => setAdvance(e.target.value)}
// //               placeholder="0.00" step="0.01" style={{ textTransform:'none' }} />
// //           </div>
// //         </div>

// //         {/* ── Weights missing banner ── */}
// //         {noWeights && bags.length > 0 && (
// //           <div style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:10, padding:'14px 18px', marginBottom:16 }}>
// //             <div style={{ fontWeight:700, color:'var(--accent)', fontSize:13, marginBottom:10 }}>
// //               ⚠️ This entry was saved before the weight-tracking update. Enter weights below to fix:
// //             </div>
// //             <div style={{ display:'grid', gridTemplateColumns: repairWeights.map(()=>'1fr').join(' '), gap:8, marginBottom:10 }}>
// //               {repairWeights.map((w, i) => (
// //                 <div key={i} style={{ textAlign:'center' }}>
// //                   <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:4, fontWeight:700 }}>BAG {i+1}</div>
// //                   <input
// //                     type="number" value={w}
// //                     onChange={e => setRepairWeights(prev => prev.map((v,j) => j===i ? e.target.value : v))}
// //                     placeholder="kg"
// //                     step="0.01" min="0.01"
// //                     onWheel={e => e.target.blur()}
// //                     style={{ background:'var(--bg-panel)', border:'1px solid var(--accent)', borderRadius:7, padding:'8px 10px', color:'var(--text-primary)', fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, outline:'none', width:'100%', textAlign:'center' }}
// //                   />
// //                 </div>
// //               ))}
// //             </div>
// //             <button
// //               onClick={applyRepairWeights}
// //               style={{ background:'var(--accent)', color:'#000', border:'none', borderRadius:8, padding:'9px 20px', fontWeight:700, fontSize:13, cursor:'pointer' }}
// //             >
// //               ✓ Apply Weights
// //             </button>
// //           </div>
// //         )}

// //         {/* Per-bag table */}
// //         {bags.length > 0 && (
// //           <div>
// //             {/* Section header */}
// //             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
// //               <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                 <Package size={16} style={{ color:'var(--accent)' }} />
// //                 <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>Bag-wise Details</span>
// //                 <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:20, padding:'2px 10px', fontWeight:700 }}>
// //                   Lot: {lotLabel}
// //                 </span>
// //                 <span style={{ fontSize:11, color: weightsSetCount === bags.length ? 'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
// //                   {weightsSetCount}/{bags.length} weights
// //                 </span>
// //               </div>
// //               <div style={{ fontSize:12, color:'var(--text-muted)' }}>
// //                 Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong>
// //               </div>
// //             </div>

// //             {/* Column headers */}
// //             <div style={{ display:'grid', gridTemplateColumns:'36px 70px 1fr 1fr 130px', gap:10, padding:'8px 14px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
// //               {['#','Lot No','Weight (kg)','Rate (₹/100kg)','Amount (₹)'].map(h => (
// //                 <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
// //               ))}
// //             </div>

// //             {/* Bag rows */}
// //             <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:340, overflowY:'auto' }}>
// //               {bags.map((bag, i) => (
// //                 <div key={i} style={{ display:'grid', gridTemplateColumns:'36px 70px 1fr 1fr 130px', gap:10, padding:'10px 14px', background: i%2===0 ? 'var(--bg-card)':'var(--bg-panel)', borderBottom: i<bags.length-1 ? '1px solid var(--border)':'none', alignItems:'center' }}>
// //                   {/* # */}
// //                   <div style={{ width:26, height:26, borderRadius:6, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>
// //                     {i+1}
// //                   </div>

// //                   {/* Lot */}
// //                   <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lotLabel}</div>

// //                   {/* Weight — pre-filled from registration */}
// //                   <input
// //                     type="number" value={bag.weight}
// //                     onChange={e => updateBag(i, 'weight', e.target.value)}
// //                     placeholder="Enter weight"
// //                     step="0.01" min="0.01"
// //                     onWheel={e => e.target.blur()}
// //                     style={inputStyle(bag.weight, '#3b82f6')}
// //                     onFocus={e => { e.target.style.borderColor='#3b82f6'; e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'; }}
// //                     onBlur={e => { e.target.style.borderColor= bag.weight ? '#3b82f666':'var(--border-light)'; e.target.style.boxShadow='none'; }}
// //                   />

// //                   {/* Rate — entered after auction */}
// //                   <input
// //                     type="number" value={bag.rate}
// //                     onChange={e => updateBag(i, 'rate', e.target.value)}
// //                     placeholder="e.g. 3200"
// //                     step="0.01" min="0"
// //                     onWheel={e => e.target.blur()}
// //                     style={inputStyle(bag.rate, '#10b981')}
// //                     onFocus={e => { e.target.style.borderColor='#10b981'; e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'; }}
// //                     onBlur={e => { e.target.style.borderColor= bag.rate ? '#10b98166':'var(--border-light)'; e.target.style.boxShadow='none'; }}
// //                   />

// //                   {/* Auto-calculated amount */}
// //                   <div style={{ fontSize:13, fontWeight:800, color: bag.amount ? 'var(--accent)':'var(--text-muted)', textAlign:'right', paddingRight:4 }}>
// //                     {bag.amount ? `₹ ${fmtINR(bag.amount)}` : '—'}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             {/* Totals row */}
// //             <div style={{ display:'grid', gridTemplateColumns:'36px 70px 1fr 1fr 130px', gap:10, padding:'12px 14px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
// //               <div /><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalWeight.toFixed(2)} kg</div>
// //               <div style={{ fontSize:12, color: ratesSetCount===bags.length ? 'var(--green)':'var(--text-muted)' }}>
// //                 {ratesSetCount}/{bags.length} rates {ratesSetCount===bags.length ? '✓':'pending'}
// //               </div>
// //               <div style={{ fontSize:15, fontWeight:800, color:'var(--accent)', textAlign:'right', paddingRight:4 }}>
// //                 {totalAmount > 0 ? `₹ ${fmtINR(totalAmount)}` : '—'}
// //               </div>
// //             </div>

// //             {/* Formula hint */}
// //             <div style={{ marginTop:10, padding:'10px 14px', background:'var(--blue-dim)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:8, fontSize:12, color:'var(--blue)' }}>
// //               💡 <strong>Amount = (Weight × Rate) ÷ 100</strong> &nbsp;·&nbsp; e.g. 72 kg @ ₹3200/100kg = <strong>₹2,304</strong>
// //             </div>
// //           </div>
// //         )}

// //         <div style={{ display:'flex', gap:10, marginTop:24, justifyContent:'flex-end' }}>
// //           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
// //           <button className="btn btn-primary" onClick={save} disabled={loading}>
// //             <Check size={15} /> {loading ? 'Saving...' : 'Save Changes'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Main Component ───────────────────────────────────────────
// // export default function SellerList() {
// //   const [sellers,        setSellers]        = useState([]);
// //   const [loading,        setLoading]        = useState(true);
// //   const [search,         setSearch]         = useState('');
// //   const [filterDate,     setFilterDate]     = useState('');
// //   const [filterMaterial, setFilterMaterial] = useState('');
// //   const [viewBill,       setViewBill]       = useState(null);
// //   const [editSeller,     setEditSeller]     = useState(null);
// //   const [confirm,        setConfirm]        = useState(null);

// //   const load = useCallback(async () => {
// //     setLoading(true);
// //     try {
// //       const res = await getSellers(filterDate);
// //       setSellers(res.data.data);
// //     } catch (err) {
// //       toast.error(err.message || 'Failed to load sellers');
// //     } finally { setLoading(false); }
// //   }, [filterDate]);

// //   useEffect(() => { load(); }, [load]);

// //   const handleDelete = (id, name) => {
// //     setConfirm({
// //       title: 'Delete Seller?',
// //       message: `"${name}" will be permanently removed.`,
// //       onConfirm: async () => {
// //         try { await apiDeleteSeller(id); toast.success(`${name} deleted`); load(); }
// //         catch (err) { toast.error(err.message || 'Delete failed'); }
// //       },
// //     });
// //   };

// //   const clearFilters = () => { setSearch(''); setFilterDate(''); setFilterMaterial(''); };
// //   const hasFilter = search || filterDate || filterMaterial;

// //   const filtered = sellers.filter(s => {
// //     const q = search.toLowerCase();
// //     return (!q || [s.name, s.mobile, s.lot_number, s.serial_number, s.material].some(v => v?.toLowerCase().includes(q)))
// //       && (!filterMaterial || s.material === filterMaterial);
// //   });

// //   const totals = filtered.reduce((a, s) => ({
// //     bags:    a.bags    + Number(s.num_bags       || 0),
// //     weight:  a.weight  + Number(s.weight         || 0),
// //     advance: a.advance + Number(s.advance_amount || 0),
// //     amount:  a.amount  + Number(s.amount         || 0),
// //   }), { bags:0, weight:0, advance:0, amount:0 });

// //   return (
// //     <div>
// //       <div className="page-header">
// //         <div>
// //           <div className="page-title">Seller List</div>
// //           <div className="page-subtitle">{loading ? 'Loading...' : `${sellers.length} sellers registered`}</div>
// //         </div>
// //         <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15} /> Refresh</button>
// //       </div>

// //       {/* Filters */}
// //       <div className="filter-bar">
// //         <div className="search-box" style={{ flex:2 }}>
// //           <Search className="search-icon" size={16} />
// //           <input className="form-input" value={search} onChange={e => setSearch(e.target.value)}
// //             placeholder="Search name, mobile, lot no..." style={{ textTransform:'none' }} />
// //         </div>
// //         <input className="form-input" type="date" value={filterDate}
// //           onChange={e => setFilterDate(e.target.value)} style={{ textTransform:'none', flex:1 }} />
// //         <select className="form-select" value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)} style={{ flex:1 }}>
// //           <option value="">All Materials</option>
// //           {MATERIALS.map(m => <option key={m}>{m}</option>)}
// //         </select>
// //         {hasFilter && <button className="btn btn-secondary" onClick={clearFilters}><X size={14} /> Clear</button>}
// //       </div>

// //       {/* Summary strip */}
// //       {filtered.length > 0 && (
// //         <div style={{ display:'flex', gap:12, marginBottom:16 }}>
// //           {[
// //             { label:'Sellers',      value: filtered.length,              color:'var(--accent)' },
// //             { label:'Total Bags',   value: totals.bags,                  color:'var(--green)' },
// //             { label:'Total Weight', value: fmtNum(totals.weight)+' kg',  color:'var(--blue)' },
// //             { label:'Total Amount', value:'₹ '+fmtINR(totals.amount),    color:'var(--purple)' },
// //             { label:'Advance Paid', value:'₹ '+fmtINR(totals.advance),   color:'var(--text-secondary)' },
// //           ].map(item => (
// //             <div key={item.label} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px' }}>
// //               <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{item.label}</div>
// //               <div style={{ fontSize:15, fontWeight:800, color:item.color, fontFamily:'var(--font-display)' }}>{item.value}</div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* Table */}
// //       <div className="table-wrapper">
// //         {loading ? (
// //           <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading sellers...</div>
// //         ) : filtered.length === 0 ? (
// //           <div className="empty-state">
// //             <div className="empty-state-icon">👨‍🌾</div>
// //             <h3>No sellers found</h3>
// //             <p style={{ fontSize:12, marginTop:6 }}>{hasFilter ? 'Adjust filters' : 'Register a seller to get started'}</p>
// //             {hasFilter && <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ marginTop:14 }}>Clear Filters</button>}
// //           </div>
// //         ) : (
// //           <table>
// //             <thead>
// //               <tr>
// //                 <th>#</th><th>Sr No</th><th>Name</th><th>Mobile</th><th>Material</th>
// //                 <th>Bags</th><th>Lot No</th><th>Weight(kg)</th>
// //                 <th>Amount(₹)</th><th>Advance(₹)</th><th>Balance(₹)</th><th>Date</th>
// //                 <th style={{ textAlign:'center' }}>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {filtered.map((s, idx) => {
// //                 const balance = (s.amount||0) - (s.advance_amount||0);
// //                 let bags = [];
// //                 try { bags = s.bag_data ? JSON.parse(s.bag_data) : []; } catch {}
// //                 const ratesSet = bags.filter(b => Number(b.rate) > 0).length;

// //                 return (
// //                   <tr key={s.id}>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{idx+1}</td>
// //                     <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
// //                     <td style={{ fontWeight:600 }}>{s.name}</td>
// //                     <td className="td-muted">{s.mobile && s.mobile!=='0000000000' ? s.mobile : '—'}</td>
// //                     <td>{s.material && s.material!=='GENERAL'
// //                       ? <span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
// //                       : <span className="td-muted">—</span>}
// //                     </td>
// //                     <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
// //                     <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
// //                     <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
// //                     <td style={{ fontWeight:700, color:'var(--accent)' }}>
// //                       {s.amount ? `₹${fmtINR(s.amount)}` : (
// //                         bags.length > 0
// //                           ? <span style={{ fontSize:11, color:'var(--text-muted)' }}>{ratesSet}/{bags.length} rates</span>
// //                           : '—'
// //                       )}
// //                     </td>
// //                     <td className="td-muted">{s.advance_amount ? `₹${fmtINR(s.advance_amount)}` : '—'}</td>
// //                     <td style={{ fontWeight:600, color: balance>0 ? 'var(--red)':'var(--green)' }}>
// //                       {s.amount ? `₹${fmtINR(balance)}` : '—'}
// //                     </td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
// //                     <td>
// //                       <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
// //                         <button className="btn btn-blue btn-sm" onClick={() => setEditSeller(s)} title="Edit"><Edit2 size={13} /></button>
// //                         <button className="btn btn-green btn-sm" onClick={() => setViewBill(s)} title="View Bill"><Eye size={13} /></button>
// //                         <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={() => setViewBill(s)} title="Print"><Printer size={13} /></button>
// //                         <button className="btn btn-red btn-sm" onClick={() => handleDelete(s.id, s.name)} title="Delete"><Trash2 size={13} /></button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 );
// //               })}
// //             </tbody>
// //             {filtered.length > 1 && (
// //               <tfoot>
// //                 <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
// //                   <td colSpan={5} style={{ padding:'12px 16px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({filtered.length})</td>
// //                   <td style={{ padding:'12px 16px', fontWeight:800 }}>{totals.bags}</td>
// //                   <td />
// //                   <td style={{ padding:'12px 16px', fontWeight:800 }}>{fmtNum(totals.weight)}</td>
// //                   <td style={{ padding:'12px 16px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(totals.amount)}</td>
// //                   <td style={{ padding:'12px 16px', fontWeight:700 }}>₹{fmtINR(totals.advance)}</td>
// //                   <td style={{ padding:'12px 16px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(totals.amount-totals.advance)}</td>
// //                   <td colSpan={2} />
// //                 </tr>
// //               </tfoot>
// //             )}
// //           </table>
// //         )}
// //       </div>

// //       {viewBill   && <BillModal    seller={viewBill}   onClose={() => setViewBill(null)} />}
// //       {editSeller && <EditModal    seller={editSeller} onClose={() => setEditSeller(null)} onSave={load} />}
// //       {confirm    && <ConfirmDialog {...confirm}        onClose={() => setConfirm(null)} />}

// //       <style>{`
// //         input[type=number]::-webkit-inner-spin-button,
// //         input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
// //         input[type=number] { -moz-appearance:textfield; }
// //       `}</style>
// //     </div>
// //   );
// // }



// // -------------------------------------------------------------------------------------------------


// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import toast from 'react-hot-toast';
// // import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package } from 'lucide-react';
// // import axios from 'axios';
// // import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// // import ConfirmDialog from '../ConfirmDialog';

// // const API = axios.create({ baseURL: '' });

// // const todayISO = () => new Date().toISOString().split('T')[0];

// // // ─── Parse bag_data ───────────────────────────────────────────
// // function getBags(seller) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || `${seller.serial_number}/${num}`;
// //   let raw = [];
// //   try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
// //   return Array.from({ length: num }, (_, i) => {
// //     const b = raw[i] || {};
// //     return {
// //       lot,
// //       weight: Number(b.weight) > 0 ? String(b.weight) : '',
// //       rate:   Number(b.rate)   > 0 ? String(b.rate)   : '',
// //       amount: Number(b.amount) > 0 ? String(b.amount) : '',
// //       buyer:  b.buyer || '',
// //     };
// //   });
// // }

// // // ─── Number to Indian Words ───────────────────────────────────
// // function toIndianWords(amount) {
// //   const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
// //     'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
// //   const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
// //   function conv(n) {
// //     if (n === 0) return '';
// //     if (n < 20) return ones[n];
// //     if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
// //     if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+conv(n%100) : '');
// //     if (n < 100000) return conv(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' '+conv(n%1000) : '');
// //     if (n < 10000000) return conv(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' '+conv(n%100000) : '');
// //     return conv(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' '+conv(n%10000000) : '');
// //   }
// //   const intPart = Math.floor(Math.abs(amount));
// //   const decPart = Math.round((Math.abs(amount) - intPart) * 100);
// //   let words = conv(intPart) + ' Rupees';
// //   if (decPart > 0) words += ' and ' + conv(decPart) + ' Paise';
// //   return words || 'Zero Rupees';
// // }

// // const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // // ─── Bill Modal ───────────────────────────────────────────────
// // function BillModal({ seller, onClose }) {
// //   const printRef = useRef();
// //   const BLUE = '#1a56db';

// //   const totalBags = parseInt(seller.num_bags) || 0;
// //   let rawBags = [];
// //   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

// //   const bagRows = Array.from({ length: totalBags }, (_, i) => {
// //     const b = rawBags[i] || {};
// //     return {
// //       srno:     String(i + 1).padStart(3, '0'),
// //       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
// //       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
// //       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
// //       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
// //       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
// //       buyer:    b.buyer || '',
// //     };
// //   });

// //   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
// //   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
// //   const labourAmt   = 20 * totalBags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalExp    = parseFloat((labourAmt + commission).toFixed(2));
// //   const netAmount   = parseFloat((grossAmount - totalExp).toFixed(2));
// //   const advance     = parseFloat(seller.advance_amount) || 0;
// //   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

// //   const printBill = () => {
// //     const bagRowsHtml = bagRows.map((b, i) => `
// //       <tr style="background:${i%2===0?'#ffffff':'#eff6ff'}">
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;color:#333">${b.srno}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:left;font-size:10px;font-weight:700;color:#1a1a1a">${b.material}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-family:monospace;color:#444">${b.lot}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:600;color:#333">1</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#1e40af">${b.weight != null ? b.weight : '—'}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#166534">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:700;color:#555">${b.buyer || '—'}</td>
// //         <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:right;font-size:10px;font-weight:800;color:#1a56db">${b.amount != null ? inr(b.amount) : '—'}</td>
// //       </tr>`).join('');

// //     const html = `<!DOCTYPE html>
// // <html>
// // <head>
// //   <title>Bill — ${seller.name}</title>
// //   <style>
// //     @page { size: A5; margin: 8mm; }
// //     * { box-sizing: border-box; margin: 0; padding: 0; }
// //     body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }
// //     table { width: 100%; border-collapse: collapse; }
// //     .page-wrapper { border: 3px solid #1a56db; border-radius: 4px; padding: 10px; position: relative; min-height: 95%; }
// //     .page-wrapper::after { content: ''; display: block; position: absolute; top: 4px; left: 4px; right: 4px; bottom: 4px; border: 1px solid #a0bbf0; border-radius: 2px; pointer-events: none; }
// //     .header-box { text-align: center; border-bottom: 2.5px double #1a56db; padding-bottom: 8px; margin-bottom: 7px; }
// //     .header-props { display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #444; margin-bottom: 5px; }
// //     .logo-circle { width: 36px; height: 36px; border-radius: 50%; border: 2.5px solid #1a56db; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; color: #1a56db; background: #eff6ff; }
// //     .firm-name { font-size: 20px; font-weight: 900; color: #1a1a1a; line-height: 1.1; margin: 3px 0; }
// //     .firm-badge { display: inline-block; background: #1a56db; color: #fff; font-size: 8px; font-weight: 700; letter-spacing: 1.2px; padding: 2px 12px; border-radius: 2px; margin: 3px 0 1px; }
// //     .firm-type { font-size: 10px; font-weight: 700; color: #333; }
// //     .firm-addr { font-size: 9px; color: #666; margin-top: 2px; }
// //     .meta-table { border: 1.5px solid #1a56db; border-radius: 3px; margin-bottom: 6px; overflow: hidden; }
// //     .meta-row { display: flex; justify-content: space-between; padding: 5px 9px; font-size: 10px; border-bottom: 1px solid #cfe2ff; }
// //     .meta-row:last-child { border-bottom: none; }
// //     .meta-row strong { color: #1a56db; }
// //     .items-table thead tr th { background: #1a56db; color: #fff; padding: 6px 4px; font-size: 9.5px; font-weight: 700; border: 1px solid #1245b5; text-align: center; }
// //     .items-table tfoot td { background: #dbeafe; border-top: 2px solid #1a56db; border: 1px solid #b8cef0; padding: 6px 4px; font-weight: 800; color: #1e40af; }
// //     .deduct-table td { border: 1px solid #b8cef0; padding: 6px 9px; font-size: 10px; }
// //     .deduct-label { background: #eff6ff; font-weight: 700; color: #1e40af; width: 58%; }
// //     .deduct-value { text-align: right; font-weight: 700; color: #dc2626; }
// //     .net-row td { background: #1a56db; color: #fff; padding: 9px 10px; font-weight: 900; }
// //     .net-label { font-size: 13px; }
// //     .net-value { text-align: right; font-size: 15px; letter-spacing: 0.3px; }
// //     .in-words { border: 1.5px solid #1a56db; border-radius: 3px; padding: 5px 9px; font-size: 10px; margin-top: 6px; background: #f8fbff; }
// //     .in-words strong { color: #1a56db; }
// //     .footer-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 18px; }
// //     .sign-box { text-align: center; border-top: 1px solid #555; padding-top: 4px; font-size: 9.5px; width: 120px; color: #444; }
// //     .for-firm { font-weight: 800; font-size: 11px; color: #1a1a1a; }
// //     .eoae { text-align: right; font-size: 9px; color: #888; margin-top: 3px; font-style: italic; }
// //     @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
// //   </style>
// // </head>
// // <body>
// // <div class="page-wrapper">
// //   <div class="header-box">
// //     <div class="header-props">
// //       <span style="text-align:left">Prop. Praveen Heggani<br>Cell : 9611635183</span>
// //       <div class="logo-circle">PH</div>
// //       <span style="text-align:right">Prop. Pramod V.Heggani<br>Cell : 9448349836</span>
// //     </div>
// //     <div class="firm-name">Mr. Praveen Heggani</div>
// //     <div><span class="firm-badge">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
// //     <div class="firm-type">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //     <div class="firm-addr">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //   </div>
// //   <div class="meta-table">
// //     <div class="meta-row">
// //       <span><strong>Bill No :</strong> ${seller.serial_number || '—'}</span>
// //       <span><strong>Date :</strong> ${fmtDate(seller.entry_date)}</span>
// //     </div>
// //     <div class="meta-row"><span><strong>Cust. Name :</strong> ${seller.name}</span></div>
// //   </div>
// //   <table class="items-table" style="margin-bottom:1px">
// //     <thead>
// //       <tr>
// //         <th>SrNo.</th><th>Particular</th><th>Lott No.</th><th>Bags</th>
// //         <th>Weight(KG)</th><th>RATE</th><th>Buyer</th><th>Amount</th>
// //       </tr>
// //     </thead>
// //     <tbody>${bagRowsHtml}</tbody>
// //     <tfoot>
// //       <tr>
// //         <td colspan="3" style="text-align:left;padding-left:9px;font-size:10px">TOTAL</td>
// //         <td style="text-align:center;font-size:11px">${totalBags}</td>
// //         <td style="text-align:center;font-size:11px">${totalWeight.toFixed(2)}</td>
// //         <td colspan="2" style="text-align:right;font-size:9px;color:#1e40af;font-weight:600">Gross Amt.</td>
// //         <td style="text-align:right;font-size:13px;color:#1a56db;padding-right:6px">&#8377; ${inr(grossAmount)}</td>
// //       </tr>
// //     </tfoot>
// //   </table>
// //   <table class="deduct-table" style="margin-top:2px">
// //     <tbody>
// //       <tr><td class="deduct-label">Other Charges </td><td class="deduct-value">− ₹ ${inr(commission)}</td></tr>
// //       <tr><td class="deduct-label">Hamali / Labour Charges</td><td class="deduct-value">− ₹ ${inr(labourAmt)}</td></tr>
// //       <tr><td class="deduct-label">Advance Paid</td><td class="deduct-value">− ₹ ${inr(advance)}</td></tr>
// //       <tr class="net-row">
// //         <td class="net-label">NET AMOUNT</td>
// //         <td class="net-value">&#8377; ${inr(Math.max(0, finalPay))}</td>
// //       </tr>
// //     </tbody>
// //   </table>
// //   <div class="in-words"><strong>In Words :</strong> ${toIndianWords(Math.max(0, finalPay))} Only</div>
// //   <div class="eoae">(E.&amp;O.E.)</div>
// //   <div class="footer-row">
// //     <div class="sign-box">Receiver's Sign.</div>
// //     <div class="for-firm">For – Mr. Praveen Heggani</div>
// //   </div>
// // </div>
// // <script>window.onload = function(){ window.print(); }<\/script>
// // </body></html>`;

// //     const w = window.open('', '_blank', 'width=700,height=900');
// //     w.document.write(html);
// //     w.document.close();
// //   };

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 580, width: '95%', padding: 0, overflow: 'hidden', borderRadius: 10 }} onClick={e => e.stopPropagation()}>
// //         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:BLUE, color:'#fff' }}>
// //           <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
// //           <div style={{ display:'flex', gap:8 }}>
// //             <button onClick={printBill} style={{ background:'#fff', color:BLUE, border:'none', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
// //               <Printer size={13} /> Print / PDF (A5)
// //             </button>
// //             <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}><X size={18} /></button>
// //           </div>
// //         </div>
// //         <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f0f4ff' }}>
// //           <div style={{ all:'initial', display:'block' }}>
// //           <div ref={printRef} style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'3px solid #1a56db', borderRadius:4, position:'relative' }}>
// //             <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #a0bbf0', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>
// //             <div style={{ textAlign:'center', borderBottom:'2.5px double #1a56db', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
// //                 <span style={{ textAlign:'left' }}>Prop. Praveen V. Heggani<br/>Cell : 9611635183</span>
// //                 <div style={{ width:40, height:40, borderRadius:'50%', border:'2.5px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1a56db', background:'#eff6ff' }}>PH</div>
// //                 <span style={{ textAlign:'right' }}>Prop. Pramod V.Heggani<br/>Cell : 9448349836</span>
// //               </div>
// //               <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>Mr. Praveen Heggani</div>
// //               <div><span style={{ display:'inline-block', background:'#1a56db', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}>TAMARIND,GINGER,GARLIC,ONION &amp; Vegetables</span></div>
// //               <div style={{ fontSize:11, fontWeight:700 }}>ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //               <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}>Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //             </div>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
// //                 <span><strong style={{ color:'#1a56db' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
// //                 <span><strong style={{ color:'#1a56db' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
// //               </div>
// //               <div style={{ padding:'4px 8px', fontSize:11 }}>
// //                 <strong style={{ color:'#1a56db' }}>Cust. Name :</strong> {seller.name}
// //               </div>
// //             </div>
// //             <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
// //               <thead>
// //                 <tr>
// //                   {['SrNo.','Particular','Lott No.','Bags','Weight(KG)','RATE','Buyer','Amount'].map(h => (
// //                     <th key={h} style={{ background:'#1a56db', color:'#fff', padding:'5px 4px', fontSize:9.5, fontWeight:700, border:'1px solid #1245b5', textAlign:'center' }}>{h}</th>
// //                   ))}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {bagRows.map((b, i) => (
// //                   <tr key={i} style={{ background: i%2===0 ? '#fff':'#eff6ff' }}>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, color:'#111' }}>{b.srno}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'left', fontSize:10, fontWeight:700, color:'#111' }}>{b.material}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontFamily:'monospace', color:'#333' }}>{b.lot}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:600, color:'#111' }}>1</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#1e40af' }}>{b.weight != null ? b.weight : '—'}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#166534' }}>{b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:700, color:'#7c3aed' }}>{b.buyer || '—'}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'right', fontSize:10, fontWeight:800, color:'#1a56db' }}>{b.amount != null ? inr(b.amount) : '—'}</td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //               <tfoot>
// //                 <tr style={{ background:'#dbeafe', borderTop:'2px solid #1a56db' }}>
// //                   <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#1e40af' }}>{totalWeight.toFixed(2)}</td>
// //                   <td colSpan={2} style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af' }}>Gross Amt.</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1a56db', fontSize:13 }}>₹ {inr(grossAmount)}</td>
// //                 </tr>
// //               </tfoot>
// //             </table>
// //             <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
// //               <tbody>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Comm. (8%)</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td></tr>
// //                 <tr style={{ background:'#1a56db' }}>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:900, fontSize:16, textAlign:'right' }}>₹ {inr(Math.max(0, finalPay))}</td>
// //                 </tr>
// //               </tbody>
// //             </table>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
// //               <strong style={{ color:'#1a56db' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
// //             </div>
// //             <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>
// //             <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
// //               <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
// //               <div style={{ fontWeight:800, fontSize:11 }}>For – Mr. Praveen Heggani</div>
// //             </div>
// //           </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Edit Modal ───────────────────────────────────────────────
// // function EditModal({ seller, onClose, onSave }) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || (seller.serial_number + '/' + num);

// //   const [rows,    setRows]    = useState(() => getBags(seller));
// //   const [nBags,   setNBags]   = useState(String(num));
// //   const [advance, setAdvance] = useState(String(seller.advance_amount || ''));
// //   const [labour,  setLabour]  = useState('20');
// //   const [saving,  setSaving]  = useState(false);
// //   const [buyers,  setBuyers]  = useState([]); // buyer list from DB

// //   // Load buyers on mount
// //   useEffect(() => {
// //     API.get('/api/buyers').then(res => {
// //       setBuyers(res.data.data || []);
// //     }).catch(() => {});
// //   }, []);

// //   const changeNBags = (v) => {
// //     setNBags(v);
// //     const n = parseInt(v) || 0;
// //     setRows(prev => Array.from({ length: n }, (_, i) =>
// //       prev[i] || { lot, weight: '', rate: '', amount: '', buyer: '' }
// //     ));
// //   };

// //   const update = (i, field, val) => {
// //     setRows(prev => prev.map((r, j) => {
// //       if (j !== i) return r;
// //       const next = { ...r, [field]: val };
// //       if (field === 'weight' || field === 'rate') {
// //         const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
// //         const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
// //         next.amount = w && rt ? ((w * rt) / 100).toFixed(2) : '';
// //       }
// //       return next;
// //     }));
// //   };

// //   const bags        = parseInt(nBags) || 0;
// //   const totalW      = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
// //   const grossAmount = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
// //   const labourAmt   = (parseFloat(labour) || 0) * bags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalDeduct = parseFloat((labourAmt + commission).toFixed(2));
// //   const netPayable  = parseFloat((grossAmount - totalDeduct).toFixed(2));
// //   const finalPay    = parseFloat((netPayable - (parseFloat(advance) || 0)).toFixed(2));

// //   const ratesDone = rows.filter(r => parseFloat(r.rate) > 0).length;
// //   const wtsDone   = rows.filter(r => parseFloat(r.weight) > 0).length;

// //   const save = async () => {
// //     if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
// //     setSaving(true);
// //     try {
// //       const bag_data = rows.map(r => ({
// //         lot,
// //         weight: parseFloat(r.weight) || 0,
// //         rate:   parseFloat(r.rate)   || 0,
// //         amount: parseFloat(r.amount) || 0,
// //         buyer:  r.buyer || '',
// //       }));
// //       await API.put('/api/sellers/' + seller.id, {
// //         num_bags:       bags,
// //         weight:         totalW,
// //         amount:         netPayable,
// //         advance_amount: parseFloat(advance) || 0,
// //         rate_fixed:     totalW > 0 && grossAmount > 0 ? parseFloat((grossAmount / totalW * 100).toFixed(2)) : 0,
// //         bag_data:       JSON.stringify(bag_data),
// //       });
// //       toast.success('Saved! Final payable: ₹' + fmtINR(finalPay));
// //       onSave(); onClose();
// //     } catch (err) {
// //       toast.error(err.response?.data?.error || err.message || 'Failed');
// //     } finally { setSaving(false); }
// //   };

// //   const iStyle = (val, col) => ({
// //     background:   val ? col + '11' : 'var(--bg-panel)',
// //     border:       '1px solid ' + (val ? col + '66' : 'var(--border-light)'),
// //     borderRadius: 7, padding: '8px 11px',
// //     color:        val ? col : 'var(--text-muted)',
// //     fontFamily:   'var(--font-body)', fontSize: 13, fontWeight: 700,
// //     outline: 'none', width: '100%',
// //   });

// //   // Buyer options: short_name if available, else name
// //   const buyerOptions = buyers.map(b => {
// //     const display = (b.lot_number && b.lot_number !== '—') ? b.lot_number : b.name;
// //     return { value: display, label: display, fullName: b.name };
// //   });

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 960, width: '95%' }} onClick={e => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
// //           <button className="modal-close" onClick={onClose}><X size={20} /></button>
// //         </div>

// //         <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
// //           {[['Serial No',seller.serial_number],['Lot No',lot],
// //             ['Material',seller.material&&seller.material!=='GENERAL'?seller.material:'—'],
// //             ['Date',fmtDate(seller.entry_date)]
// //           ].map(([l,v])=>(
// //             <div key={l} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 13px', fontSize:12 }}>
// //               <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{l}</div>
// //               <div style={{ fontWeight:700 }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>

// //         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:18 }}>
// //           <div className="form-group">
// //             <label className="form-label">Number of Bags</label>
// //             <input className="form-input" type="number" value={nBags} onChange={e=>changeNBags(e.target.value)} min="1" max="100" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Advance Paid (₹)</label>
// //             <input className="form-input" type="number" value={advance} onChange={e=>setAdvance(e.target.value)} placeholder="0.00" step="0.01" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Labour Rate (₹ per bag)</label>
// //             <input className="form-input" type="number" value={labour} onChange={e=>setLabour(e.target.value)} placeholder="20" step="1" min="0" style={{ textTransform:'none' }}/>
// //           </div>
// //         </div>

// //         {rows.length > 0 && (
// //           <>
// //             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
// //               <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                 <Package size={15} style={{ color:'var(--accent)' }}/>
// //                 <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Bag-wise Details</span>
// //                 <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>Lot: {lot}</span>
// //                 <span style={{ fontSize:11, color:wtsDone===rows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
// //                   {wtsDone}/{rows.length} weights
// //                 </span>
// //               </div>
// //               <span style={{ fontSize:11, color:'var(--text-muted)' }}>Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
// //             </div>

// //             {/* Column headers — 5 cols now with Buyer */}
// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
// //               {['#','Lot','Weight (kg)','Rate (₹/100kg)','Buyer','Amount (₹)'].map(h=>(
// //                 <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
// //               ))}
// //             </div>

// //             <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:300, overflowY:'auto' }}>
// //               {rows.map((r,i)=>(
// //                 <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<rows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
// //                   <div style={{ width:24, height:24, borderRadius:5, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>{i+1}</div>
// //                   <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lot}</div>

// //                   {/* Weight */}
// //                   <input type="number" value={r.weight} onChange={e=>update(i,'weight',e.target.value)}
// //                     placeholder="Enter weight" step="0.01" min="0.01" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.weight,'#3b82f6')}
// //                     onFocus={e=>{e.target.style.borderColor='#3b82f6';e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.weight?'#3b82f666':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />

// //                   {/* Rate */}
// //                   <input type="number" value={r.rate} onChange={e=>update(i,'rate',e.target.value)}
// //                     placeholder="e.g. 3200" step="0.01" min="0" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.rate,'#10b981')}
// //                     onFocus={e=>{e.target.style.borderColor='#10b981';e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.rate?'#10b98166':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />

// //                   {/* Buyer dropdown */}
// //                   <select
// //                     value={r.buyer || ''}
// //                     onChange={e => update(i, 'buyer', e.target.value)}
// //                     style={{
// //                       background: r.buyer ? 'rgba(139,92,246,0.1)' : 'var(--bg-panel)',
// //                       border: `1px solid ${r.buyer ? 'rgba(139,92,246,0.5)' : 'var(--border-light)'}`,
// //                       borderRadius: 7, padding: '8px 10px',
// //                       color: r.buyer ? '#a78bfa' : 'var(--text-muted)',
// //                       fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
// //                       outline: 'none', width: '100%', cursor: 'pointer',
// //                     }}
// //                   >
// //                     <option value="">— Select Buyer —</option>
// //                     {buyerOptions.map((b, idx) => (
// //                       <option key={idx} value={b.value}>{b.label}</option>
// //                     ))}
// //                   </select>

// //                   {/* Amount */}
// //                   <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
// //                     {r.amount?'₹'+fmtINR(r.amount):'—'}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
// //               <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
// //               <div style={{ fontSize:12, color:ratesDone===rows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{rows.length} rates {ratesDone===rows.length?'✓':''}</div>
// //               <div style={{ fontSize:11, color:'var(--text-muted)' }}>{rows.filter(r=>r.buyer).length}/{rows.length} buyers assigned</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
// //             </div>
// //           </>
// //         )}

// //         {grossAmount > 0 && (
// //           <div style={{ marginTop:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
// //             <div style={{ background:'var(--bg-panel)', padding:'10px 18px', borderBottom:'1px solid var(--border)' }}>
// //               <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>💰 Payment Calculation</span>
// //             </div>
// //             <div>
// //               {[
// //                 { label:'Gross Amount',          sub:`${rows.length} bags × Rate`,      val:`₹ ${fmtINR(grossAmount)}`,               color:'var(--accent)',         fs:16 },
// //                 { label:'− Labour / Hamali',     sub:`₹${labour||20} × ${bags} bags`,  val:`− ₹ ${fmtINR(labourAmt)}`,              color:'var(--red)',            fs:15 },
// //                 { label:'− Other Charges ', sub:`8% of ₹${fmtINR(grossAmount)}`, val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
// //                 { label:'Net Amount',            sub:'Gross − Labour − Commission',     val:`₹ ${fmtINR(netPayable)}`,               color:'var(--blue)',           fs:16, highlight:true },
// //                 { label:'− Advance Already Paid',sub:'',                               val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`, color:'var(--text-secondary)', fs:15 },
// //               ].map((row, i)=>(
// //                 <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
// //                   <div>
// //                     <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
// //                     {row.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
// //                   </div>
// //                   <div style={{ fontSize:row.fs, fontWeight:800, color:row.color, fontFamily:'var(--font-display)' }}>{row.val}</div>
// //                 </div>
// //               ))}
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px', background:finalPay>=0?'var(--green-dim)':'var(--red-dim)' }}>
// //                 <div>
// //                   <div style={{ fontSize:15, fontWeight:800, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                     {finalPay >= 0 ? '✅ Final Amount to Pay Seller' : '⚠️ Seller Owes Back'}
// //                   </div>
// //                   <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Net − Advance</div>
// //                 </div>
// //                 <div style={{ fontSize:24, fontWeight:900, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                   ₹ {fmtINR(Math.abs(finalPay))}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
// //           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
// //           <button className="btn btn-primary" onClick={save} disabled={saving}>
// //             <Check size={15}/> {saving?'Saving...':'Save Changes'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Main ─────────────────────────────────────────────────────
// // export default function SellerList() {
// //   const [sellers,  setSellers]  = useState([]);
// //   const [loading,  setLoading]  = useState(true);
// //   const [search,   setSearch]   = useState('');
// //   // ✅ Default to TODAY's date
// //   const [fDate,    setFDate]    = useState(todayISO());
// //   const [fMat,     setFMat]     = useState('');
// //   const [bill,     setBill]     = useState(null);
// //   const [editing,  setEditing]  = useState(null);
// //   const [confirm,  setConfirm]  = useState(null);

// //   const load = useCallback(async () => {
// //     setLoading(true);
// //     try {
// //       const res = await API.get('/api/sellers', { params: fDate ? { date: fDate } : {} });
// //       setSellers(res.data.data);
// //     } catch(err) { toast.error(err.message||'Load failed'); }
// //     finally { setLoading(false); }
// //   }, [fDate]);

// //   useEffect(() => { load(); }, [load]);

// //   const del = (id, name) => setConfirm({
// //     title: 'Delete Seller?',
// //     message: `"${name}" will be permanently removed.`,
// //     onConfirm: async () => {
// //       try { await API.delete(`/api/sellers/${id}`); toast.success('Deleted'); load(); }
// //       catch(err) { toast.error(err.message||'Failed'); }
// //     }
// //   });

// //   const clear = () => { setSearch(''); setFDate(todayISO()); setFMat(''); };

// //   const list = sellers.filter(s => {
// //     const q = search.toLowerCase();
// //     return (!q || [s.name,s.mobile,s.lot_number,s.serial_number,s.material].some(v=>v?.toLowerCase().includes(q)))
// //       && (!fMat || s.material===fMat);
// //   });

// //   const tot = list.reduce((a,s)=>({
// //     bags: a.bags+Number(s.num_bags||0), wt: a.wt+Number(s.weight||0),
// //     adv:  a.adv+Number(s.advance_amount||0), amt: a.amt+Number(s.amount||0),
// //   }),{ bags:0, wt:0, adv:0, amt:0 });

// //   return (
// //     <div>
// //       <div className="page-header">
// //         <div>
// //           <div className="page-title">Seller List</div>
// //           <div className="page-subtitle">
// //             {loading ? 'Loading...' : `${sellers.length} sellers${fDate ? ` for ${fDate}` : ''}`}
// //           </div>
// //         </div>
// //         <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
// //       </div>

// //       <div className="filter-bar">
// //         <div className="search-box" style={{ flex:2 }}>
// //           <Search className="search-icon" size={16}/>
// //           <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, lot no..." style={{ textTransform:'none' }}/>
// //         </div>
// //         {/* Date filter — defaults to today */}
// //         <input className="form-input" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{ textTransform:'none', flex:1 }}/>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())} title="Today">Today</button>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')} title="All dates">All</button>
// //         <select className="form-select" value={fMat} onChange={e=>setFMat(e.target.value)} style={{ flex:1 }}>
// //           <option value="">All Materials</option>
// //           {MATERIALS.map(m=><option key={m}>{m}</option>)}
// //         </select>
// //         {(search||fMat)&&<button className="btn btn-secondary" onClick={clear}><X size={14}/> Clear</button>}
// //       </div>

// //       {list.length>0&&(
// //         <div style={{ display:'flex', gap:12, marginBottom:16 }}>
// //           {[['Sellers',list.length,'var(--accent)'],['Bags',tot.bags,'var(--green)'],
// //             ['Weight',fmtNum(tot.wt)+' kg','var(--blue)'],['Amount','₹ '+fmtINR(tot.amt),'var(--purple)'],
// //             ['Advance','₹ '+fmtINR(tot.adv),'var(--text-secondary)']
// //           ].map(([l,v,c])=>(
// //             <div key={l} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
// //               <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{l}</div>
// //               <div style={{ fontSize:15, fontWeight:800, color:c, fontFamily:'var(--font-display)' }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       <div className="table-wrapper">
// //         {loading?<div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading...</div>
// //         :list.length===0?(
// //           <div className="empty-state">
// //             <div className="empty-state-icon">👨‍🌾</div>
// //             <h3>{fDate ? `No sellers registered for ${fDate}` : 'No sellers found'}</h3>
// //             <p style={{ fontSize:12, marginTop:6, color:'var(--text-muted)' }}>
// //               {fDate ? 'Click "All" to see all sellers, or change the date' : 'Register a seller to get started'}
// //             </p>
// //             {fDate && (
// //               <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'center' }}>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')}>Show All Sellers</button>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())}>Today</button>
// //               </div>
// //             )}
// //           </div>
// //         ):(
// //           <table>
// //             <thead>
// //               <tr>
// //                 <th>#</th><th>Sr</th><th>Name</th><th>Mobile</th><th>Material</th>
// //                 <th>Bags</th><th>Lot</th><th>Weight</th><th>Amount</th><th>Advance</th><th>Balance</th><th>Date</th>
// //                 <th style={{ textAlign:'center' }}>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {list.map((s,i)=>{
// //                 const bal=(s.amount||0)-(s.advance_amount||0);
// //                 let bags=[]; try{bags=JSON.parse(s.bag_data||'[]')}catch{}
// //                 const rd=bags.filter(b=>Number(b.rate)>0).length;
// //                 return(
// //                   <tr key={s.id}>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{i+1}</td>
// //                     <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
// //                     <td style={{ fontWeight:600 }}>{s.name}</td>
// //                     <td className="td-muted">{s.mobile&&s.mobile!=='0000000000'?s.mobile:'—'}</td>
// //                     <td>{s.material&&s.material!=='GENERAL'
// //                       ?<span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
// //                       :<span className="td-muted">—</span>}
// //                     </td>
// //                     <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
// //                     <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
// //                     <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
// //                     <td style={{ fontWeight:700, color:'var(--accent)' }}>
// //                       {s.amount?`₹${fmtINR(s.amount)}`:<span style={{ fontSize:11, color:'var(--text-muted)' }}>{rd}/{bags.length} rates</span>}
// //                     </td>
// //                     <td className="td-muted">{s.advance_amount?`₹${fmtINR(s.advance_amount)}`:'—'}</td>
// //                     <td style={{ fontWeight:600, color:bal>0?'var(--red)':'var(--green)' }}>{s.amount?`₹${fmtINR(bal)}`:'—'}</td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
// //                     <td>
// //                       <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
// //                         <button className="btn btn-blue btn-sm" onClick={()=>setEditing(s)} title="Edit"><Edit2 size={13}/></button>
// //                         <button className="btn btn-green btn-sm" onClick={()=>setBill(s)} title="Bill"><Eye size={13}/></button>
// //                         <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={()=>setBill(s)} title="Print"><Printer size={13}/></button>
// //                         <button className="btn btn-red btn-sm" onClick={()=>del(s.id,s.name)} title="Delete"><Trash2 size={13}/></button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 );
// //               })}
// //             </tbody>
// //             {list.length>1&&(
// //               <tfoot>
// //                 <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
// //                   <td colSpan={5} style={{ padding:'11px 15px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({list.length})</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{tot.bags}</td>
// //                   <td/>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{fmtNum(tot.wt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(tot.amt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700 }}>₹{fmtINR(tot.adv)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(tot.amt-tot.adv)}</td>
// //                   <td colSpan={2}/>
// //                 </tr>
// //               </tfoot>
// //             )}
// //           </table>
// //         )}
// //       </div>

// //       {bill    && <BillModal  seller={bill}    onClose={()=>setBill(null)}/>}
// //       {editing && <EditModal  seller={editing} onClose={()=>setEditing(null)} onSave={load}/>}
// //       {confirm && <ConfirmDialog {...confirm}  onClose={()=>setConfirm(null)}/>}

// //       <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>
// //     </div>
// //   );
// // }



// // ----------------------------------------------------------------------------------------------------------



// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import toast from 'react-hot-toast';
// // import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package, CheckSquare, Square } from 'lucide-react';
// // import axios from 'axios';
// // import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// // import ConfirmDialog from '../ConfirmDialog';

// // const API = axios.create({ baseURL: '' });

// // const todayISO = () => new Date().toISOString().split('T')[0];

// // // ─── Parse bag_data ───────────────────────────────────────────
// // function getBags(seller) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || `${seller.serial_number}/${num}`;
// //   let raw = [];
// //   try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
// //   return Array.from({ length: num }, (_, i) => {
// //     const b = raw[i] || {};
// //     return {
// //       lot,
// //       weight: Number(b.weight) > 0 ? String(b.weight) : '',
// //       rate:   Number(b.rate)   > 0 ? String(b.rate)   : '',
// //       amount: Number(b.amount) > 0 ? String(b.amount) : '',
// //       buyer:  b.buyer || '',
// //     };
// //   });
// // }

// // // ─── Number to Indian Words ───────────────────────────────────
// // function toIndianWords(amount) {
// //   const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
// //     'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
// //   const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
// //   function conv(n) {
// //     if (n === 0) return '';
// //     if (n < 20) return ones[n];
// //     if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
// //     if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+conv(n%100) : '');
// //     if (n < 100000) return conv(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' '+conv(n%1000) : '');
// //     if (n < 10000000) return conv(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' '+conv(n%100000) : '');
// //     return conv(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' '+conv(n%10000000) : '');
// //   }
// //   const intPart = Math.floor(Math.abs(amount));
// //   const decPart = Math.round((Math.abs(amount) - intPart) * 100);
// //   let words = conv(intPart) + ' Rupees';
// //   if (decPart > 0) words += ' and ' + conv(decPart) + ' Paise';
// //   return words || 'Zero Rupees';
// // }

// // const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // // ─── Build single bill HTML for one seller ────────────────────
// // function buildBillHTML(seller, isFirst = false) {
// //   const totalBags = parseInt(seller.num_bags) || 0;
// //   let rawBags = [];
// //   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

// //   const bagRows = Array.from({ length: totalBags }, (_, i) => {
// //     const b = rawBags[i] || {};
// //     return {
// //       srno:     String(i + 1).padStart(3, '0'),
// //       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
// //       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
// //       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
// //       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
// //       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
// //       buyer:    b.buyer || '',
// //     };
// //   });

// //   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
// //   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
// //   const labourAmt   = 20 * totalBags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalExp    = parseFloat((labourAmt + commission).toFixed(2));
// //   const netAmount   = parseFloat((grossAmount - totalExp).toFixed(2));
// //   const advance     = parseFloat(seller.advance_amount) || 0;
// //   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

// //   const bagRowsHtml = bagRows.map((b, i) => `
// //     <tr style="background:${i%2===0?'#ffffff':'#eff6ff'}">
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;color:#111;font-weight:600">${b.srno}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:left;font-size:10px;font-weight:700;color:#111">${b.material}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-family:monospace;color:#111;font-weight:600">${b.lot}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:700;color:#111">1</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#111">${b.weight != null ? b.weight : '—'}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#111">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:right;font-size:10px;font-weight:800;color:#1a56db">${b.amount != null ? inr(b.amount) : '—'}</td>
// //     </tr>`).join('');

// //   // page-break-before on every bill except the first
// //   const pageBreak = isFirst ? '' : 'page-break-before:always;';

// //   return `
// //     <div style="${pageBreak}font-family:Arial,sans-serif;font-size:11px;color:#111;background:#fff;padding:10mm 8mm;display:block;line-height:1.4;">
// //       <div style="border:3px solid #1a56db;border-radius:4px;padding:10px;position:relative;min-height:95%;">
// //         <div style="position:absolute;top:4px;left:4px;right:4px;bottom:4px;border:1px solid #a0bbf0;border-radius:2px;pointer-events:none;"></div>

// //         <!-- Header -->
// //         <div style="text-align:center;border-bottom:2.5px double #1a56db;padding-bottom:8px;margin-bottom:7px;position:relative;">
// //           <div style="display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#555;margin-bottom:4px;">
// //             <span style="text-align:left">Prop. Praveen V. Heggani<br>Cell : 9611635183</span>
// //             <div style="width:36px;height:36px;border-radius:50%;border:2.5px solid #1a56db;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#1a56db;background:#eff6ff;">PH</div>
// //             <span style="text-align:right">Prop. Pramod V.Heggani<br>Cell : 9448349836</span>
// //           </div>
// //           <div style="font-size:20px;font-weight:900;color:#1a1a1a;line-height:1.1;margin:2px 0;">Mr. Praveen Heggani</div>
// //           <div><span style="display:inline-block;background:#1a56db;color:#fff;font-size:8px;font-weight:700;letter-spacing:1.5px;padding:2px 12px;border-radius:2px;margin:3px 0;">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
// //           <div style="font-size:11px;font-weight:700;">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //           <div style="font-size:9.5px;color:#666;margin-top:2px;">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //         </div>

// //         <!-- Meta -->
// //         <div style="border:1.5px solid #1a56db;border-radius:3px;margin-bottom:8px;overflow:hidden;">
// //           <div style="display:flex;justify-content:space-between;border-bottom:1px solid #cfe2ff;padding:5px 8px;font-size:11px;">
// //             <span><strong style="color:#1a56db">Bill No :</strong> ${seller.serial_number || '—'}</span>
// //             <span><strong style="color:#1a56db">Date :</strong> ${fmtDate(seller.entry_date)}</span>
// //           </div>
// //           <div style="padding:4px 8px;font-size:11px;">
// //             <strong style="color:#1a56db">Cust. Name :</strong> ${seller.name}
// //           </div>
// //         </div>

// //         <!-- Items Table -->
// //         <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:1px;">
// //           <thead>
// //             <tr>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">SrNo.</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Particular</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Lott No.</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Bags</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Weight(KG)</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">RATE</th>
// //               <th style="background:#1a56db;color:#fff;padding:5px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Amount</th>
// //             </tr>
// //           </thead>
// //           <tbody>${bagRowsHtml}</tbody>
// //           <tfoot>
// //             <tr style="background:#dbeafe;border-top:2px solid #1a56db;">
// //               <td colspan="3" style="border:1px solid #b8cef0;padding:5px 6px;font-weight:700;color:#1e40af;text-align:left;">TOTAL</td>
// //               <td style="border:1px solid #b8cef0;padding:5px 3px;text-align:center;font-weight:800;color:#111;">${totalBags}</td>
// //               <td style="border:1px solid #b8cef0;padding:5px 3px;text-align:center;font-weight:800;color:#111;">${totalWeight.toFixed(2)}</td>
// //               <td style="border:1px solid #b8cef0;padding:5px 3px;text-align:right;font-size:9.5px;color:#1e40af;font-weight:700;">Gross Amt.</td>
// //               <td style="border:1px solid #b8cef0;padding:5px 5px;text-align:right;font-weight:800;color:#1a56db;font-size:13px;">&#8377; ${inr(grossAmount)}</td>
// //             </tr>
// //           </tfoot>
// //         </table>

// //         <!-- Deductions -->
// //         <table style="width:100%;border-collapse:collapse;margin-top:2px;">
// //           <tbody>
// //             <tr>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;width:58%;">Other Charges </td>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:11px;">− ₹ ${inr(commission)}</td>
// //             </tr>
// //             <tr>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Hamali / Labour Charges</td>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:11px;">− ₹ ${inr(labourAmt)}</td>
// //             </tr>
// //             <tr>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Advance Paid</td>
// //               <td style="border:1px solid #b8cef0;padding:6px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:11px;">− ₹ ${inr(advance)}</td>
// //             </tr>
// //             <tr style="background:#1a56db;">
// //               <td style="padding:9px 10px;color:#fff;font-weight:800;font-size:13px;">NET AMOUNT</td>
// //               <td style="padding:9px 10px;color:#fff;font-weight:900;font-size:16px;text-align:right;">&#8377; ${inr(Math.max(0, finalPay))}</td>
// //             </tr>
// //           </tbody>
// //         </table>

// //         <!-- In Words -->
// //         <div style="border:1.5px solid #1a56db;border-radius:3px;padding:5px 8px;font-size:10.5px;margin-top:6px;background:#f8fbff;">
// //           <strong style="color:#1a56db">In Words :</strong> ${toIndianWords(Math.max(0, finalPay))} Only
// //         </div>
// //         <div style="text-align:right;font-size:9.5px;color:#777;margin-top:3px;font-style:italic;">(E.&amp;O.E.)</div>

// //         <!-- Footer -->
// //         <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:18px;">
// //           <div style="text-align:center;border-top:1px solid #333;padding-top:4px;font-size:10px;width:130px;color:#444;">Receiver's Sign.</div>
// //           <div style="font-weight:800;font-size:11px;">For – Mr. Praveen Heggani</div>
// //         </div>
// //       </div>
// //     </div>`;
// // }

// // // ─── Bulk Print All Selected Bills ───────────────────────────
// // function printAllBills(sellers, dateLabel) {
// //   const billsHTML = sellers
// //     .map((s, i) => buildBillHTML(s, i === 0))
// //     .join('\n');

// //   const html = `<!DOCTYPE html>
// // <html>
// // <head>
// //   <title>Bills — ${dateLabel}</title>
// //   <style>
// //     @page { size: A5; margin: 0; }
// //     * { box-sizing: border-box; margin: 0; padding: 0; }
// //     body { font-family: Arial, sans-serif; background: #fff; }
// //     @media print {
// //       body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
// //       div[style*="page-break-before"] { page-break-before: always; }
// //     }
// //   </style>
// // </head>
// // <body>
// // ${billsHTML}
// // <script>window.onload = function(){ window.print(); }<\/script>
// // </body>
// // </html>`;

// //   const w = window.open('', '_blank', 'width=700,height=900');
// //   w.document.write(html);
// //   w.document.close();
// // }

// // // ─── Bill Modal (single seller) ───────────────────────────────
// // function BillModal({ seller, onClose }) {
// //   const printRef = useRef();
// //   const BLUE = '#1a56db';

// //   const printBill = () => {
// //     const html = `<!DOCTYPE html>
// // <html>
// // <head>
// //   <title>Bill — ${seller.name}</title>
// //   <style>
// //     @page { size: A5; margin: 8mm; }
// //     * { box-sizing: border-box; margin: 0; padding: 0; }
// //     body { font-family: Arial, sans-serif; background: #fff; }
// //     @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
// //   </style>
// // </head>
// // <body>
// // ${buildBillHTML(seller, true)}
// // <script>window.onload = function(){ window.print(); }<\/script>
// // </body>
// // </html>`;
// //     const w = window.open('', '_blank', 'width=700,height=900');
// //     w.document.write(html);
// //     w.document.close();
// //   };

// //   const totalBags = parseInt(seller.num_bags) || 0;
// //   let rawBags = [];
// //   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

// //   const bagRows = Array.from({ length: totalBags }, (_, i) => {
// //     const b = rawBags[i] || {};
// //     return {
// //       srno:     String(i + 1).padStart(3, '0'),
// //       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
// //       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
// //       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
// //       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
// //       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
// //       buyer:    b.buyer || '',
// //     };
// //   });

// //   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
// //   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
// //   const labourAmt   = 20 * totalBags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
// //   const advance     = parseFloat(seller.advance_amount) || 0;
// //   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 580, width: '95%', padding: 0, overflow: 'hidden', borderRadius: 10 }} onClick={e => e.stopPropagation()}>
// //         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:BLUE, color:'#fff' }}>
// //           <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
// //           <div style={{ display:'flex', gap:8 }}>
// //             <button onClick={printBill} style={{ background:'#fff', color:BLUE, border:'none', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
// //               <Printer size={13} /> Print / PDF (A5)
// //             </button>
// //             <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}><X size={18} /></button>
// //           </div>
// //         </div>
// //         <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f0f4ff' }}>
// //           <div style={{ display:'block' }}>
// //           <div ref={printRef} style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'3px solid #1a56db', borderRadius:4, position:'relative' }}>
// //             <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #a0bbf0', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>
// //             <div style={{ textAlign:'center', borderBottom:'2.5px double #1a56db', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
// //                 <span style={{ textAlign:'left' }}>Prop. Praveen V. Heggani<br/>Cell : 9611635183</span>
// //                 <div style={{ width:40, height:40, borderRadius:'50%', border:'2.5px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1a56db', background:'#eff6ff' }}>PH</div>
// //                 <span style={{ textAlign:'right' }}>Prop. Pramod V.Heggani<br/>Cell : 9448349836</span>
// //               </div>
// //               <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>Mr. Praveen Heggani</div>
// //               <div><span style={{ display:'inline-block', background:'#1a56db', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}>TAMARIND,GINGER,GARLIC,ONION &amp; Vegetables</span></div>
// //               <div style={{ fontSize:11, fontWeight:700 }}>ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //               <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}>Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //             </div>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
// //                 <span><strong style={{ color:'#1a56db' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
// //                 <span><strong style={{ color:'#1a56db' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
// //               </div>
// //               <div style={{ padding:'4px 8px', fontSize:11 }}>
// //                 <strong style={{ color:'#1a56db' }}>Cust. Name :</strong> {seller.name}
// //               </div>
// //             </div>
// //             <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
// //               <thead>
// //                 <tr>
// //                   {['SrNo.','Particular','Lott No.','Bags','Weight(KG)','RATE','Amount'].map(h => (
// //                     <th key={h} style={{ background:'#1a56db', color:'#fff', padding:'5px 4px', fontSize:9.5, fontWeight:700, border:'1px solid #1245b5', textAlign:'center' }}>{h}</th>
// //                   ))}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {bagRows.map((b, i) => {
// //                   const bg = i%2===0 ? '#ffffff' : '#eff6ff';
// //                   const td = (extra) => ({ border:'1px solid #b8cef0', padding:'4px 3px', fontSize:10, color:'#111', backgroundColor:bg, ...extra });
// //                   return (
// //                     <tr key={i}>
// //                       <td style={td({ textAlign:'center', fontWeight:700 })}>{b.srno}</td>
// //                       <td style={td({ textAlign:'left', fontWeight:700, padding:'4px 5px' })}>{b.material}</td>
// //                       <td style={td({ textAlign:'center', fontWeight:600, fontFamily:'monospace' })}>{b.lot}</td>
// //                       <td style={td({ textAlign:'center', fontWeight:700 })}>1</td>
// //                       <td style={td({ textAlign:'center', fontWeight:800 })}>{b.weight != null ? b.weight : '—'}</td>
// //                       <td style={td({ textAlign:'center', fontWeight:800 })}>{b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //                       <td style={td({ textAlign:'right', fontWeight:800, color:'#1a56db', padding:'4px 5px' })}>{b.amount != null ? inr(b.amount) : '—'}</td>
// //                     </tr>
// //                   );
// //                 })}
// //               </tbody>
// //               <tfoot>
// //                 <tr style={{ background:'#dbeafe', borderTop:'2px solid #1a56db' }}>
// //                   <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalWeight.toFixed(2)}</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af', fontWeight:700 }}>Gross Amt.</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1a56db', fontSize:13 }}>₹ {inr(grossAmount)}</td>
// //                 </tr>
// //               </tfoot>
// //             </table>
// //             <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
// //               <tbody>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Comm. (8%)</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td></tr>
// //                 <tr style={{ background:'#1a56db' }}>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:900, fontSize:16, textAlign:'right' }}>₹ {inr(Math.max(0, finalPay))}</td>
// //                 </tr>
// //               </tbody>
// //             </table>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
// //               <strong style={{ color:'#1a56db' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
// //             </div>
// //             <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>
// //             <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
// //               <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
// //               <div style={{ fontWeight:800, fontSize:11 }}>For – Mr. Praveen Heggani</div>
// //             </div>
// //           </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Edit Modal ───────────────────────────────────────────────
// // function EditModal({ seller, onClose, onSave }) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || (seller.serial_number + '/' + num);

// //   const [rows,    setRows]    = useState(() => getBags(seller));
// //   const [nBags,   setNBags]   = useState(String(num));
// //   const [advance, setAdvance] = useState(String(seller.advance_amount || ''));
// //   const [labour,  setLabour]  = useState('20');
// //   const [saving,  setSaving]  = useState(false);
// //   const [buyers,  setBuyers]  = useState([]);

// //   useEffect(() => {
// //     API.get('/api/buyers').then(res => {
// //       setBuyers(res.data.data || []);
// //     }).catch(() => {});
// //   }, []);

// //   const changeNBags = (v) => {
// //     setNBags(v);
// //     const n = parseInt(v) || 0;
// //     setRows(prev => Array.from({ length: n }, (_, i) =>
// //       prev[i] || { lot, weight: '', rate: '', amount: '', buyer: '' }
// //     ));
// //   };

// //   const update = (i, field, val) => {
// //     setRows(prev => prev.map((r, j) => {
// //       if (j !== i) return r;
// //       const next = { ...r, [field]: val };
// //       if (field === 'weight' || field === 'rate') {
// //         const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
// //         const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
// //         next.amount = w && rt ? ((w * rt) / 100).toFixed(2) : '';
// //       }
// //       return next;
// //     }));
// //   };

// //   const bags        = parseInt(nBags) || 0;
// //   const totalW      = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
// //   const grossAmount = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
// //   const labourAmt   = (parseFloat(labour) || 0) * bags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalDeduct = parseFloat((labourAmt + commission).toFixed(2));
// //   const netPayable  = parseFloat((grossAmount - totalDeduct).toFixed(2));
// //   const finalPay    = parseFloat((netPayable - (parseFloat(advance) || 0)).toFixed(2));

// //   const ratesDone = rows.filter(r => parseFloat(r.rate) > 0).length;
// //   const wtsDone   = rows.filter(r => parseFloat(r.weight) > 0).length;

// //   const save = async () => {
// //     if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
// //     setSaving(true);
// //     try {
// //       const bag_data = rows.map(r => ({
// //         lot,
// //         weight: parseFloat(r.weight) || 0,
// //         rate:   parseFloat(r.rate)   || 0,
// //         amount: parseFloat(r.amount) || 0,
// //         buyer:  r.buyer || '',
// //       }));
// //       await API.put('/api/sellers/' + seller.id, {
// //         num_bags:       bags,
// //         weight:         totalW,
// //         amount:         netPayable,
// //         advance_amount: parseFloat(advance) || 0,
// //         rate_fixed:     totalW > 0 && grossAmount > 0 ? parseFloat((grossAmount / totalW * 100).toFixed(2)) : 0,
// //         bag_data:       JSON.stringify(bag_data),
// //       });
// //       toast.success('Saved! Final payable: ₹' + fmtINR(finalPay));
// //       onSave(); onClose();
// //     } catch (err) {
// //       toast.error(err.response?.data?.error || err.message || 'Failed');
// //     } finally { setSaving(false); }
// //   };

// //   const iStyle = (val, col) => ({
// //     background:   val ? col + '11' : 'var(--bg-panel)',
// //     border:       '1px solid ' + (val ? col + '66' : 'var(--border-light)'),
// //     borderRadius: 7, padding: '8px 11px',
// //     color:        val ? col : 'var(--text-muted)',
// //     fontFamily:   'var(--font-body)', fontSize: 13, fontWeight: 700,
// //     outline: 'none', width: '100%',
// //   });

// //   const buyerOptions = buyers.map(b => {
// //     const display = (b.lot_number && b.lot_number !== '—') ? b.lot_number : b.name;
// //     return { value: display, label: display, fullName: b.name };
// //   });

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 960, width: '95%' }} onClick={e => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
// //           <button className="modal-close" onClick={onClose}><X size={20} /></button>
// //         </div>

// //         <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
// //           {[['Serial No',seller.serial_number],['Lot No',lot],
// //             ['Material',seller.material&&seller.material!=='GENERAL'?seller.material:'—'],
// //             ['Date',fmtDate(seller.entry_date)]
// //           ].map(([l,v])=>(
// //             <div key={l} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 13px', fontSize:12 }}>
// //               <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{l}</div>
// //               <div style={{ fontWeight:700 }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>

// //         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:18 }}>
// //           <div className="form-group">
// //             <label className="form-label">Number of Bags</label>
// //             <input className="form-input" type="number" value={nBags} onChange={e=>changeNBags(e.target.value)} min="1" max="100" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Advance Paid (₹)</label>
// //             <input className="form-input" type="number" value={advance} onChange={e=>setAdvance(e.target.value)} placeholder="0.00" step="0.01" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Labour Rate (₹ per bag)</label>
// //             <input className="form-input" type="number" value={labour} onChange={e=>setLabour(e.target.value)} placeholder="20" step="1" min="0" style={{ textTransform:'none' }}/>
// //           </div>
// //         </div>

// //         {rows.length > 0 && (
// //           <>
// //             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
// //               <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                 <Package size={15} style={{ color:'var(--accent)' }}/>
// //                 <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Bag-wise Details</span>
// //                 <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>Lot: {lot}</span>
// //                 <span style={{ fontSize:11, color:wtsDone===rows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
// //                   {wtsDone}/{rows.length} weights
// //                 </span>
// //               </div>
// //               <span style={{ fontSize:11, color:'var(--text-muted)' }}>Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
// //             </div>

// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
// //               {['#','Lot','Weight (kg)','Rate (₹/100kg)','Buyer','Amount (₹)'].map(h=>(
// //                 <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
// //               ))}
// //             </div>

// //             <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:300, overflowY:'auto' }}>
// //               {rows.map((r,i)=>(
// //                 <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<rows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
// //                   <div style={{ width:24, height:24, borderRadius:5, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>{i+1}</div>
// //                   <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lot}</div>
// //                   <input type="number" value={r.weight} onChange={e=>update(i,'weight',e.target.value)}
// //                     placeholder="Enter weight" step="0.01" min="0.01" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.weight,'#3b82f6')}
// //                     onFocus={e=>{e.target.style.borderColor='#3b82f6';e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.weight?'#3b82f666':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />
// //                   <input type="number" value={r.rate} onChange={e=>update(i,'rate',e.target.value)}
// //                     placeholder="e.g. 3200" step="0.01" min="0" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.rate,'#10b981')}
// //                     onFocus={e=>{e.target.style.borderColor='#10b981';e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.rate?'#10b98166':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />
// //                   <select
// //                     value={r.buyer || ''}
// //                     onChange={e => update(i, 'buyer', e.target.value)}
// //                     style={{
// //                       background: r.buyer ? 'rgba(139,92,246,0.1)' : 'var(--bg-panel)',
// //                       border: `1px solid ${r.buyer ? 'rgba(139,92,246,0.5)' : 'var(--border-light)'}`,
// //                       borderRadius: 7, padding: '8px 10px',
// //                       color: r.buyer ? '#a78bfa' : 'var(--text-muted)',
// //                       fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700,
// //                       outline: 'none', width: '100%', cursor: 'pointer',
// //                     }}
// //                   >
// //                     <option value="">— Select Buyer —</option>
// //                     {buyerOptions.map((b, idx) => (
// //                       <option key={idx} value={b.value}>{b.label}</option>
// //                     ))}
// //                   </select>
// //                   <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
// //                     {r.amount?'₹'+fmtINR(r.amount):'—'}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
// //               <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
// //               <div style={{ fontSize:12, color:ratesDone===rows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{rows.length} rates {ratesDone===rows.length?'✓':''}</div>
// //               <div style={{ fontSize:11, color:'var(--text-muted)' }}>{rows.filter(r=>r.buyer).length}/{rows.length} buyers assigned</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
// //             </div>
// //           </>
// //         )}

// //         {grossAmount > 0 && (
// //           <div style={{ marginTop:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
// //             <div style={{ background:'var(--bg-panel)', padding:'10px 18px', borderBottom:'1px solid var(--border)' }}>
// //               <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>💰 Payment Calculation</span>
// //             </div>
// //             <div>
// //               {[
// //                 { label:'Gross Amount',          sub:`${rows.length} bags × Rate`,      val:`₹ ${fmtINR(grossAmount)}`,               color:'var(--accent)',         fs:16 },
// //                 { label:'− Labour / Hamali',     sub:`₹${labour||20} × ${bags} bags`,  val:`− ₹ ${fmtINR(labourAmt)}`,              color:'var(--red)',            fs:15 },
// //                 { label:'− Other Charges ', sub:`8% of ₹${fmtINR(grossAmount)}`, val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
// //                 { label:'Net Amount',            sub:'Gross − Labour − Commission',     val:`₹ ${fmtINR(netPayable)}`,               color:'var(--blue)',           fs:16, highlight:true },
// //                 { label:'− Advance Already Paid',sub:'',                               val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`, color:'var(--text-secondary)', fs:15 },
// //               ].map((row, i)=>(
// //                 <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
// //                   <div>
// //                     <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
// //                     {row.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
// //                   </div>
// //                   <div style={{ fontSize:row.fs, fontWeight:800, color:row.color, fontFamily:'var(--font-display)' }}>{row.val}</div>
// //                 </div>
// //               ))}
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px', background:finalPay>=0?'var(--green-dim)':'var(--red-dim)' }}>
// //                 <div>
// //                   <div style={{ fontSize:15, fontWeight:800, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                     {finalPay >= 0 ? '✅ Final Amount to Pay Seller' : '⚠️ Seller Owes Back'}
// //                   </div>
// //                   <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Net − Advance</div>
// //                 </div>
// //                 <div style={{ fontSize:24, fontWeight:900, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                   ₹ {fmtINR(Math.abs(finalPay))}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
// //           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
// //           <button className="btn btn-primary" onClick={save} disabled={saving}>
// //             <Check size={15}/> {saving?'Saving...':'Save Changes'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Main ─────────────────────────────────────────────────────
// // export default function SellerList() {
// //   const [sellers,   setSellers]   = useState([]);
// //   const [loading,   setLoading]   = useState(true);
// //   const [search,    setSearch]    = useState('');
// //   const [fDate,     setFDate]     = useState(todayISO());
// //   const [fMat,      setFMat]      = useState('');
// //   const [bill,      setBill]      = useState(null);
// //   const [editing,   setEditing]   = useState(null);
// //   const [confirm,   setConfirm]   = useState(null);
// //   // ✅ NEW: checkbox selection state
// //   const [selected,  setSelected]  = useState(new Set());

// //   const load = useCallback(async () => {
// //     setLoading(true);
// //     setSelected(new Set()); // clear selection on reload
// //     try {
// //       const res = await API.get('/api/sellers', { params: fDate ? { date: fDate } : {} });
// //       // Sort ascending by serial_number so newest entries appear at the bottom
// //       const sorted = [...(res.data.data || [])].sort((a, b) =>
// //         (parseInt(a.serial_number) || 0) - (parseInt(b.serial_number) || 0)
// //       );
// //       setSellers(sorted);
// //     } catch(err) { toast.error(err.message||'Load failed'); }
// //     finally { setLoading(false); }
// //   }, [fDate]);

// //   useEffect(() => { load(); }, [load]);

// //   const del = (id, name) => setConfirm({
// //     title: 'Delete Seller?',
// //     message: `"${name}" will be permanently removed.`,
// //     onConfirm: async () => {
// //       try { await API.delete(`/api/sellers/${id}`); toast.success('Deleted'); load(); }
// //       catch(err) { toast.error(err.message||'Failed'); }
// //     }
// //   });

// //   const clear = () => { setSearch(''); setFDate(todayISO()); setFMat(''); };

// //   const list = sellers.filter(s => {
// //     const q = search.toLowerCase();
// //     return (!q || [s.name,s.mobile,s.lot_number,s.serial_number,s.material].some(v=>v?.toLowerCase().includes(q)))
// //       && (!fMat || s.material===fMat);
// //   });

// //   // ─── Selection helpers ────────────────────────────────────
// //   const allIds        = list.map(s => s.id);
// //   const allSelected   = allIds.length > 0 && allIds.every(id => selected.has(id));
// //   const someSelected  = allIds.some(id => selected.has(id));
// //   const selectedCount = allIds.filter(id => selected.has(id)).length;

// //   const toggleAll = () => {
// //     if (allSelected) {
// //       // deselect all in current list
// //       setSelected(prev => {
// //         const next = new Set(prev);
// //         allIds.forEach(id => next.delete(id));
// //         return next;
// //       });
// //     } else {
// //       setSelected(prev => {
// //         const next = new Set(prev);
// //         allIds.forEach(id => next.add(id));
// //         return next;
// //       });
// //     }
// //   };

// //   const toggleOne = (id) => {
// //     setSelected(prev => {
// //       const next = new Set(prev);
// //       next.has(id) ? next.delete(id) : next.add(id);
// //       return next;
// //     });
// //   };

// //   // ─── Bulk print ───────────────────────────────────────────
// //   const handlePrintAll = () => {
// //     const toprint = list.filter(s => selected.has(s.id));
// //     if (toprint.length === 0) { toast.error('Select at least one seller to print'); return; }
// //     // Sort by serial number ascending
// //     const sorted = [...toprint].sort((a, b) =>
// //       (parseInt(a.serial_number) || 0) - (parseInt(b.serial_number) || 0)
// //     );
// //     const dateLabel = fDate || todayISO();
// //     printAllBills(sorted, dateLabel);
// //   };

// //   const tot = list.reduce((a,s)=>({
// //     bags: a.bags+Number(s.num_bags||0), wt: a.wt+Number(s.weight||0),
// //     adv:  a.adv+Number(s.advance_amount||0), amt: a.amt+Number(s.amount||0),
// //   }),{ bags:0, wt:0, adv:0, amt:0 });

// //   // Checkbox style
// //   const cbStyle = (checked) => ({
// //     width: 18, height: 18, cursor: 'pointer', accentColor: '#1a56db',
// //     flexShrink: 0,
// //   });

// //   return (
// //     <div>
// //       <div className="page-header">
// //         <div>
// //           <div className="page-title">Seller List</div>
// //           <div className="page-subtitle">
// //             {loading ? 'Loading...' : `${sellers.length} sellers${fDate ? ` for ${fDate}` : ''}`}
// //           </div>
// //         </div>
// //         <div style={{ display:'flex', gap:8, alignItems:'center' }}>
// //           {/* ✅ Print All button — only shows when something selected */}
// //           {selectedCount > 0 && (
// //             <button
// //               className="btn btn-primary"
// //               onClick={handlePrintAll}
// //               style={{ display:'flex', alignItems:'center', gap:6, background:'#1a56db', color:'#fff', fontWeight:700, fontSize:13, padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer' }}
// //             >
// //               <Printer size={15}/>
// //               Print All ({selectedCount}) Bills
// //             </button>
// //           )}
// //           <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
// //         </div>
// //       </div>

// //       <div className="filter-bar">
// //         <div className="search-box" style={{ flex:2 }}>
// //           <Search className="search-icon" size={16}/>
// //           <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, lot no..." style={{ textTransform:'none' }}/>
// //         </div>
// //         <input className="form-input" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{ textTransform:'none', flex:1 }}/>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())} title="Today">Today</button>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')} title="All dates">All</button>
// //         <select className="form-select" value={fMat} onChange={e=>setFMat(e.target.value)} style={{ flex:1 }}>
// //           <option value="">All Materials</option>
// //           {MATERIALS.map(m=><option key={m}>{m}</option>)}
// //         </select>
// //         {(search||fMat)&&<button className="btn btn-secondary" onClick={clear}><X size={14}/> Clear</button>}
// //       </div>

// //       {/* ✅ Selection info bar */}
// //       {list.length > 0 && (
// //         <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, padding:'8px 14px', background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8 }}>
// //           <button
// //             onClick={toggleAll}
// //             style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:'none', cursor:'pointer', color:'var(--text-primary)', fontWeight:700, fontSize:13, padding:0 }}
// //           >
// //             {allSelected
// //               ? <CheckSquare size={18} color="#1a56db"/>
// //               : someSelected
// //                 ? <CheckSquare size={18} color="#94a3b8"/>
// //                 : <Square size={18} color="#94a3b8"/>
// //             }
// //             {allSelected ? 'Deselect All' : 'Select All'}
// //           </button>
// //           {selectedCount > 0 && (
// //             <>
// //               <span style={{ color:'var(--text-muted)', fontSize:12 }}>|</span>
// //               <span style={{ fontSize:12, color:'#1a56db', fontWeight:600 }}>
// //                 {selectedCount} of {list.length} selected
// //               </span>
// //               <button
// //                 onClick={() => setSelected(new Set())}
// //                 style={{ fontSize:11, color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}
// //               >
// //                 Clear
// //               </button>
// //               <button
// //                 onClick={handlePrintAll}
// //                 style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:5, background:'#1a56db', color:'#fff', border:'none', borderRadius:7, padding:'5px 14px', fontWeight:700, fontSize:12, cursor:'pointer' }}
// //               >
// //                 <Printer size={13}/> Print {selectedCount} Bill{selectedCount>1?'s':''}
// //               </button>
// //             </>
// //           )}
// //         </div>
// //       )}

// //       {list.length>0&&(
// //         <div style={{ display:'flex', gap:12, marginBottom:16 }}>
// //           {[['Sellers',list.length,'var(--accent)'],['Bags',tot.bags,'var(--green)'],
// //             ['Weight',fmtNum(tot.wt)+' kg','var(--blue)'],['Amount','₹ '+fmtINR(tot.amt),'var(--purple)'],
// //             ['Advance','₹ '+fmtINR(tot.adv),'var(--text-secondary)']
// //           ].map(([l,v,c])=>(
// //             <div key={l} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
// //               <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{l}</div>
// //               <div style={{ fontSize:15, fontWeight:800, color:c, fontFamily:'var(--font-display)' }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       <div className="table-wrapper">
// //         {loading?<div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading...</div>
// //         :list.length===0?(
// //           <div className="empty-state">
// //             <div className="empty-state-icon">👨‍🌾</div>
// //             <h3>{fDate ? `No sellers registered for ${fDate}` : 'No sellers found'}</h3>
// //             <p style={{ fontSize:12, marginTop:6, color:'var(--text-muted)' }}>
// //               {fDate ? 'Click "All" to see all sellers, or change the date' : 'Register a seller to get started'}
// //             </p>
// //             {fDate && (
// //               <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'center' }}>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')}>Show All Sellers</button>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())}>Today</button>
// //               </div>
// //             )}
// //           </div>
// //         ):(
// //           <table>
// //             <thead>
// //               <tr>
// //                 {/* ✅ Checkbox column header */}
// //                 <th style={{ width:38, textAlign:'center', padding:'10px 8px' }}>
// //                   <input
// //                     type="checkbox"
// //                     checked={allSelected}
// //                     ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
// //                     onChange={toggleAll}
// //                     style={cbStyle(allSelected)}
// //                     title="Select all"
// //                   />
// //                 </th>
// //                 <th>#</th><th>Sr</th><th>Name</th><th>Mobile</th><th>Material</th>
// //                 <th>Bags</th><th>Lot</th><th>Weight</th><th>Amount</th><th>Advance</th><th>Balance</th><th>Date</th>
// //                 <th style={{ textAlign:'center' }}>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {list.map((s,i)=>{
// //                 const bal=(s.amount||0)-(s.advance_amount||0);
// //                 let bags=[]; try{bags=JSON.parse(s.bag_data||'[]')}catch{}
// //                 const rd=bags.filter(b=>Number(b.rate)>0).length;
// //                 const isChecked = selected.has(s.id);
// //                 return(
// //                   <tr
// //                     key={s.id}
// //                     style={{ background: isChecked ? 'rgba(26,86,219,0.07)' : undefined, cursor:'default' }}
// //                   >
// //                     {/* ✅ Per-row checkbox */}
// //                     <td style={{ textAlign:'center', padding:'10px 8px' }}>
// //                       <input
// //                         type="checkbox"
// //                         checked={isChecked}
// //                         onChange={() => toggleOne(s.id)}
// //                         style={cbStyle(isChecked)}
// //                       />
// //                     </td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{i+1}</td>
// //                     <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
// //                     <td style={{ fontWeight:600 }}>{s.name}</td>
// //                     <td className="td-muted">{s.mobile&&s.mobile!=='0000000000'?s.mobile:'—'}</td>
// //                     <td>{s.material&&s.material!=='GENERAL'
// //                       ?<span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
// //                       :<span className="td-muted">—</span>}
// //                     </td>
// //                     <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
// //                     <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
// //                     <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
// //                     <td style={{ fontWeight:700, color:'var(--accent)' }}>
// //                       {s.amount?`₹${fmtINR(s.amount)}`:<span style={{ fontSize:11, color:'var(--text-muted)' }}>{rd}/{bags.length} rates</span>}
// //                     </td>
// //                     <td className="td-muted">{s.advance_amount?`₹${fmtINR(s.advance_amount)}`:'—'}</td>
// //                     <td style={{ fontWeight:600, color:bal>0?'var(--red)':'var(--green)' }}>{s.amount?`₹${fmtINR(bal)}`:'—'}</td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
// //                     <td>
// //                       <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
// //                         <button className="btn btn-blue btn-sm" onClick={()=>setEditing(s)} title="Edit"><Edit2 size={13}/></button>
// //                         <button className="btn btn-green btn-sm" onClick={()=>setBill(s)} title="Bill"><Eye size={13}/></button>
// //                         <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={()=>setBill(s)} title="Print"><Printer size={13}/></button>
// //                         <button className="btn btn-red btn-sm" onClick={()=>del(s.id,s.name)} title="Delete"><Trash2 size={13}/></button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 );
// //               })}
// //             </tbody>
// //             {list.length>1&&(
// //               <tfoot>
// //                 <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
// //                   <td colSpan={6} style={{ padding:'11px 15px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({list.length})</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{tot.bags}</td>
// //                   <td/>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{fmtNum(tot.wt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(tot.amt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700 }}>₹{fmtINR(tot.adv)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(tot.amt-tot.adv)}</td>
// //                   <td colSpan={2}/>
// //                 </tr>
// //               </tfoot>
// //             )}
// //           </table>
// //         )}
// //       </div>

// //       {bill    && <BillModal  seller={bill}    onClose={()=>setBill(null)}/>}
// //       {editing && <EditModal  seller={editing} onClose={()=>setEditing(null)} onSave={load}/>}
// //       {confirm && <ConfirmDialog {...confirm}  onClose={()=>setConfirm(null)}/>}

// //       <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>
// //     </div>
// //   );
// // }




// // --------------------------------------------------------------------------------------------------------


// // import React, { useState, useEffect, useRef, useCallback } from 'react';
// // import toast from 'react-hot-toast';
// // import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package, CheckSquare } from 'lucide-react';
// // import axios from 'axios';
// // import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// // import ConfirmDialog from '../ConfirmDialog';

// // // const API = axios.create({ baseURL: '' });
// // const API = axios.create({ baseURL: 'http://localhost:5000' });

// // const todayISO = () => new Date().toISOString().split('T')[0];

// // // ─── Parse bag_data ───────────────────────────────────────────
// // function getBags(seller) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || `${seller.serial_number}/${num}`;
// //   let raw = [];
// //   try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
// //   return Array.from({ length: num }, (_, i) => {
// //     const b = raw[i] || {};
// //     return {
// //       lot,
// //       weight: Number(b.weight) > 0 ? String(b.weight) : '',
// //       rate:   Number(b.rate)   > 0 ? String(b.rate)   : '',
// //       amount: Number(b.amount) > 0 ? String(b.amount) : '',
// //       buyer:  b.buyer || '',
// //     };
// //   });
// // }

// // // ─── Number to Indian Words ───────────────────────────────────
// // function toIndianWords(amount) {
// //   const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
// //     'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
// //   const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
// //   function conv(n) {
// //     if (n === 0) return '';
// //     if (n < 20) return ones[n];
// //     if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
// //     if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+conv(n%100) : '');
// //     if (n < 100000) return conv(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' '+conv(n%1000) : '');
// //     if (n < 10000000) return conv(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' '+conv(n%100000) : '');
// //     return conv(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' '+conv(n%10000000) : '');
// //   }
// //   const intPart = Math.floor(Math.abs(amount));
// //   const decPart = Math.round((Math.abs(amount) - intPart) * 100);
// //   let words = conv(intPart) + ' Rupees';
// //   if (decPart > 0) words += ' and ' + conv(decPart) + ' Paise';
// //   return words || 'Zero Rupees';
// // }

// // const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // // ─── Build single bill HTML (no Buyer column) ─────────────────
// // function buildBillHTML(seller) {
// //   const totalBags = parseInt(seller.num_bags) || 0;
// //   let rawBags = [];
// //   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

// //   const bagRows = Array.from({ length: totalBags }, (_, i) => {
// //     const b = rawBags[i] || {};
// //     return {
// //       srno:     String(i + 1).padStart(3, '0'),
// //       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
// //       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
// //       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
// //       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
// //       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
// //     };
// //   });

// //   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
// //   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
// //   const labourAmt   = 20 * totalBags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalExp    = parseFloat((labourAmt + commission).toFixed(2));
// //   const netAmount   = parseFloat((grossAmount - totalExp).toFixed(2));
// //   const advance     = parseFloat(seller.advance_amount) || 0;
// //   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

// //   const bagRowsHtml = bagRows.map((b, i) => `
// //     <tr style="background:${i%2===0?'#ffffff':'#eff6ff'}">
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;color:#333">${b.srno}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:left;font-size:10px;font-weight:700;color:#1a1a1a">${b.material}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-family:monospace;color:#444">${b.lot}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:600;color:#333">1</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#1e40af">${b.weight != null ? b.weight : '—'}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#166534">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //       <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:right;font-size:10px;font-weight:800;color:#1a56db">${b.amount != null ? inr(b.amount) : '—'}</td>
// //     </tr>`).join('');

// //   return {
// //     html: `
// // <div class="page-wrapper" style="border:3px solid #1a56db;border-radius:4px;padding:10px;position:relative;margin-bottom:12px;page-break-after:always;">
// //   <div style="position:absolute;top:4px;left:4px;right:4px;bottom:4px;border:1px solid #a0bbf0;border-radius:2px;pointer-events:none;"></div>
// //   <div style="text-align:center;border-bottom:2.5px double #1a56db;padding-bottom:8px;margin-bottom:7px;">
// //     <div style="display:flex;justify-content:space-between;align-items:center;font-size:9px;color:#444;margin-bottom:4px;">
// //       <span style="text-align:left">Prop. Praveen V. Heggani<br>Cell : 9611635183</span>
// //       <div style="width:36px;height:36px;border-radius:50%;border:2.5px solid #1a56db;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#1a56db;background:#eff6ff;">PH</div>
// //       <span style="text-align:right">Prop. Pramod V.Heggani<br>Cell : 9448349836</span>
// //     </div>
// //     <div style="font-size:20px;font-weight:900;color:#1a1a1a;line-height:1.1;margin:3px 0;">Mr. Praveen Heggani</div>
// //     <div><span style="display:inline-block;background:#1a56db;color:#fff;font-size:8px;font-weight:700;letter-spacing:1.2px;padding:2px 12px;border-radius:2px;margin:3px 0 1px;">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
// //     <div style="font-size:10px;font-weight:700;color:#333;">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //     <div style="font-size:9px;color:#666;margin-top:2px;">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //   </div>
// //   <div style="border:1.5px solid #1a56db;border-radius:3px;margin-bottom:6px;overflow:hidden;">
// //     <div style="display:flex;justify-content:space-between;padding:5px 9px;font-size:10px;border-bottom:1px solid #cfe2ff;">
// //       <span><strong style="color:#1a56db">Bill No :</strong> ${seller.serial_number || '—'}</span>
// //       <span><strong style="color:#1a56db">Date :</strong> ${fmtDate(seller.entry_date)}</span>
// //     </div>
// //     <div style="padding:4px 9px;font-size:10px;"><span><strong style="color:#1a56db">Cust. Name :</strong> ${seller.name}</span></div>
// //   </div>
// //   <table style="width:100%;border-collapse:collapse;margin-bottom:1px;">
// //     <thead>
// //       <tr>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">SrNo.</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Particular</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Lott No.</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Bags</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Weight(KG)</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">RATE</th>
// //         <th style="background:#1a56db;color:#fff;padding:6px 4px;font-size:9.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Amount</th>
// //       </tr>
// //     </thead>
// //     <tbody>${bagRowsHtml}</tbody>
// //     <tfoot>
// //       <tr style="background:#dbeafe;border-top:2px solid #1a56db;">
// //         <td colspan="3" style="border:1px solid #b8cef0;padding:6px 6px;font-weight:800;color:#1e40af;text-align:left;">TOTAL</td>
// //         <td style="border:1px solid #b8cef0;padding:6px 4px;text-align:center;font-weight:800;color:#111;">${totalBags}</td>
// //         <td style="border:1px solid #b8cef0;padding:6px 4px;text-align:center;font-weight:800;color:#1e40af;">${totalWeight.toFixed(2)}</td>
// //         <td style="border:1px solid #b8cef0;padding:6px 4px;text-align:right;font-size:9px;color:#1e40af;font-weight:600;">Gross Amt.</td>
// //         <td style="border:1px solid #b8cef0;padding:6px 6px;text-align:right;font-weight:800;color:#1a56db;font-size:13px;">&#8377; ${inr(grossAmount)}</td>
// //       </tr>
// //     </tfoot>
// //   </table>
// //   <table style="width:100%;border-collapse:collapse;margin-top:2px;">
// //     <tbody>
// //       <tr><td style="border:1px solid #b8cef0;padding:6px 9px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;width:58%;">Other Charges </td><td style="border:1px solid #b8cef0;padding:6px 9px;text-align:right;font-weight:700;color:#dc2626;">− ₹ ${inr(commission)}</td></tr>
// //       <tr><td style="border:1px solid #b8cef0;padding:6px 9px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Hamali / Labour Charges</td><td style="border:1px solid #b8cef0;padding:6px 9px;text-align:right;font-weight:700;color:#dc2626;">− ₹ ${inr(labourAmt)}</td></tr>
// //       <tr><td style="border:1px solid #b8cef0;padding:6px 9px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Advance Paid</td><td style="border:1px solid #b8cef0;padding:6px 9px;text-align:right;font-weight:700;color:#dc2626;">− ₹ ${inr(advance)}</td></tr>
// //       <tr style="background:#1a56db;">
// //         <td style="padding:9px 10px;color:#fff;font-weight:900;font-size:13px;">NET AMOUNT</td>
// //         <td style="padding:9px 10px;color:#fff;font-weight:900;font-size:15px;text-align:right;">&#8377; ${inr(Math.max(0, finalPay))}</td>
// //       </tr>
// //     </tbody>
// //   </table>
// //   <div style="border:1.5px solid #1a56db;border-radius:3px;padding:5px 9px;font-size:10px;margin-top:6px;background:#f8fbff;">
// //     <strong style="color:#1a56db;">In Words :</strong> ${toIndianWords(Math.max(0, finalPay))} Only
// //   </div>
// //   <div style="text-align:right;font-size:9px;color:#888;margin-top:3px;font-style:italic;">(E.&amp;O.E.)</div>
// //   <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:18px;">
// //     <div style="text-align:center;border-top:1px solid #555;padding-top:4px;font-size:9.5px;width:120px;color:#444;">Receiver's Sign.</div>
// //     <div style="font-weight:800;font-size:11px;">For – Mr. Praveen Heggani</div>
// //   </div>
// // </div>`,
// //     finalPay,
// //   };
// // }

// // // ─── Bulk print all selected sellers ─────────────────────────
// // function printMultipleBills(sellers) {
// //   const billsHtml = sellers.map(s => buildBillHTML(s).html).join('');

// //   const fullHtml = `<!DOCTYPE html>
// // <html>
// // <head>
// //   <meta charset="UTF-8">
// //   <title>Bills — ${sellers.length} Sellers</title>
// //   <style>
// //     @page { size: A5; margin: 8mm; }
// //     * { box-sizing: border-box; margin: 0; padding: 0; }
// //     body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }
// //     @media print {
// //       body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
// //       .page-wrapper { page-break-after: always; }
// //       .page-wrapper:last-child { page-break-after: avoid; }
// //     }
// //   </style>
// // </head>
// // <body>
// // ${billsHtml}
// // <script>window.onload = function(){ window.print(); }<\/script>
// // </body>
// // </html>`;

// //   if (window.electronAPI && window.electronAPI.printHTML) {
// //     window.electronAPI.printHTML(fullHtml);
// //   } else {
// //     const w = window.open('', '_blank', 'width=900,height=750');
// //     if (w && w.document) {
// //       w.document.write(fullHtml);
// //       w.document.close();
// //     }
// //   }
// // }

// // // ─── Bill Modal (no Buyer column) ────────────────────────────
// // function BillModal({ seller, onClose }) {
// //   const BLUE = '#1a56db';

// //   const totalBags = parseInt(seller.num_bags) || 0;
// //   let rawBags = [];
// //   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

// //   const bagRows = Array.from({ length: totalBags }, (_, i) => {
// //     const b = rawBags[i] || {};
// //     return {
// //       srno:     String(i + 1).padStart(3, '0'),
// //       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
// //       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
// //       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
// //       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
// //       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
// //     };
// //   });

// //   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
// //   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
// //   const labourAmt   = 20 * totalBags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalExp    = parseFloat((labourAmt + commission).toFixed(2));
// //   const netAmount   = parseFloat((grossAmount - totalExp).toFixed(2));
// //   const advance     = parseFloat(seller.advance_amount) || 0;
// //   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

// //   const printBill = () => {
// //     const { html } = buildBillHTML(seller);
// //     const fullHtml = `<!DOCTYPE html>
// // <html>
// // <head>
// //   <meta charset="UTF-8">
// //   <title>Bill — ${seller.name}</title>
// //   <style>
// //     @page { size: A5; margin: 8mm; }
// //     * { box-sizing: border-box; margin: 0; padding: 0; }
// //     body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }
// //     @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
// //   </style>
// // </head>
// // <body>${html}
// // <script>window.onload = function(){ window.print(); }<\/script>
// // </body></html>`;

// //     if (window.electronAPI && window.electronAPI.printHTML) {
// //       window.electronAPI.printHTML(fullHtml);
// //     } else {
// //       const w = window.open('', '_blank', 'width=900,height=750');
// //       if (w && w.document) { w.document.write(fullHtml); w.document.close(); }
// //     }
// //   };

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 560, width: '95%', padding: 0, overflow: 'hidden', borderRadius: 10 }} onClick={e => e.stopPropagation()}>
// //         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:BLUE, color:'#fff' }}>
// //           <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
// //           <div style={{ display:'flex', gap:8 }}>
// //             <button onClick={printBill} style={{ background:'#fff', color:BLUE, border:'none', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
// //               <Printer size={13} /> Print / PDF (A5)
// //             </button>
// //             <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}><X size={18} /></button>
// //           </div>
// //         </div>
// //         <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f0f4ff' }}>
// //           <div style={{ all:'initial', display:'block' }}>
// //           <div style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'3px solid #1a56db', borderRadius:4, position:'relative' }}>
// //             <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #a0bbf0', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>
// //             <div style={{ textAlign:'center', borderBottom:'2.5px double #1a56db', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
// //                 <span style={{ textAlign:'left' }}>Prop. Praveen V. Heggani<br/>Cell : 9611635183</span>
// //                 <div style={{ width:40, height:40, borderRadius:'50%', border:'2.5px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1a56db', background:'#eff6ff' }}>PH</div>
// //                 <span style={{ textAlign:'right' }}>Prop. Pramod V.Heggani<br/>Cell : 9448349836</span>
// //               </div>
// //               <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>Mr. Praveen Heggani</div>
// //               <div><span style={{ display:'inline-block', background:'#1a56db', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}>TAMARIND,GINGER,GARLIC,ONION &amp; Vegetables</span></div>
// //               <div style={{ fontSize:11, fontWeight:700 }}>ORDER SUPPLIER &amp; COMMISSION AGENT</div>
// //               <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}>Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
// //             </div>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
// //               <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
// //                 <span><strong style={{ color:'#1a56db' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
// //                 <span><strong style={{ color:'#1a56db' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
// //               </div>
// //               <div style={{ padding:'4px 8px', fontSize:11 }}>
// //                 <strong style={{ color:'#1a56db' }}>Cust. Name :</strong> {seller.name}
// //               </div>
// //             </div>
// //             {/* Table — no Buyer column */}
// //             <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
// //               <thead>
// //                 <tr>
// //                   {['SrNo.','Particular','Lott No.','Bags','Weight(KG)','RATE','Amount'].map(h => (
// //                     <th key={h} style={{ background:'#1a56db', color:'#fff', padding:'5px 4px', fontSize:9.5, fontWeight:700, border:'1px solid #1245b5', textAlign:'center' }}>{h}</th>
// //                   ))}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {bagRows.map((b, i) => (
// //                   <tr key={i} style={{ background: i%2===0 ? '#fff':'#eff6ff' }}>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, color:'#111' }}>{b.srno}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'left', fontSize:10, fontWeight:700, color:'#111' }}>{b.material}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontFamily:'monospace', color:'#333' }}>{b.lot}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:600, color:'#111' }}>1</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#1e40af' }}>{b.weight != null ? b.weight : '—'}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#166534' }}>{b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'right', fontSize:10, fontWeight:800, color:'#1a56db' }}>{b.amount != null ? inr(b.amount) : '—'}</td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //               <tfoot>
// //                 <tr style={{ background:'#dbeafe', borderTop:'2px solid #1a56db' }}>
// //                   <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#1e40af' }}>{totalWeight.toFixed(2)}</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af' }}>Gross Amt.</td>
// //                   <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1a56db', fontSize:13 }}>₹ {inr(grossAmount)}</td>
// //                 </tr>
// //               </tfoot>
// //             </table>
// //             <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
// //               <tbody>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Other Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
// //                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td></tr>
// //                 <tr style={{ background:'#1a56db' }}>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
// //                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:900, fontSize:16, textAlign:'right' }}>₹ {inr(Math.max(0, finalPay))}</td>
// //                 </tr>
// //               </tbody>
// //             </table>
// //             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
// //               <strong style={{ color:'#1a56db' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
// //             </div>
// //             <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>
// //             <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
// //               <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
// //               <div style={{ fontWeight:800, fontSize:11 }}>For – Mr. Praveen V. Heggani</div>
// //             </div>
// //           </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Edit Modal ───────────────────────────────────────────────
// // function EditModal({ seller, onClose, onSave }) {
// //   const num = parseInt(seller.num_bags) || 0;
// //   const lot = seller.lot_number || (seller.serial_number + '/' + num);

// //   const [rows,    setRows]    = useState(() => getBags(seller));
// //   const [nBags,   setNBags]   = useState(String(num));
// //   const [advance, setAdvance] = useState(String(seller.advance_amount || ''));
// //   const [labour,  setLabour]  = useState('20');
// //   const [saving,  setSaving]  = useState(false);
// //   const [buyers,  setBuyers]  = useState([]);

// //   useEffect(() => {
// //     API.get('/api/buyers').then(res => {
// //       setBuyers(res.data.data || []);
// //     }).catch(() => {});
// //   }, []);

// //   const changeNBags = (v) => {
// //     setNBags(v);
// //     const n = parseInt(v) || 0;
// //     setRows(prev => Array.from({ length: n }, (_, i) =>
// //       prev[i] || { lot, weight: '', rate: '', amount: '', buyer: '' }
// //     ));
// //   };

// //   const update = (i, field, val) => {
// //     setRows(prev => prev.map((r, j) => {
// //       if (j !== i) return r;
// //       const next = { ...r, [field]: val };
// //       if (field === 'weight' || field === 'rate') {
// //         const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
// //         const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
// //         next.amount = w && rt ? ((w * rt) / 100).toFixed(2) : '';
// //       }
// //       return next;
// //     }));
// //   };

// //   const bags        = parseInt(nBags) || 0;
// //   const totalW      = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
// //   const grossAmount = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
// //   const labourAmt   = (parseFloat(labour) || 0) * bags;
// //   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
// //   const totalDeduct = parseFloat((labourAmt + commission).toFixed(2));
// //   const netPayable  = parseFloat((grossAmount - totalDeduct).toFixed(2));
// //   const finalPay    = parseFloat((netPayable - (parseFloat(advance) || 0)).toFixed(2));

// //   const ratesDone = rows.filter(r => parseFloat(r.rate) > 0).length;
// //   const wtsDone   = rows.filter(r => parseFloat(r.weight) > 0).length;

// //   const save = async () => {
// //     if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
// //     setSaving(true);
// //     try {
// //       const bag_data = rows.map(r => ({
// //         lot,
// //         weight: parseFloat(r.weight) || 0,
// //         rate:   parseFloat(r.rate)   || 0,
// //         amount: parseFloat(r.amount) || 0,
// //         buyer:  r.buyer || '',
// //       }));
// //       await API.put('/api/sellers/' + seller.id, {
// //         num_bags:       bags,
// //         weight:         totalW,
// //         amount:         netPayable,
// //         advance_amount: parseFloat(advance) || 0,
// //         rate_fixed:     totalW > 0 && grossAmount > 0 ? parseFloat((grossAmount / totalW * 100).toFixed(2)) : 0,
// //         bag_data:       JSON.stringify(bag_data),
// //       });
// //       toast.success('Saved! Final payable: ₹' + fmtINR(finalPay));
// //       onSave(); onClose();
// //     } catch (err) {
// //       toast.error(err.response?.data?.error || err.message || 'Failed');
// //     } finally { setSaving(false); }
// //   };

// //   const iStyle = (val, col) => ({
// //     background:   val ? col + '11' : 'var(--bg-panel)',
// //     border:       '1px solid ' + (val ? col + '66' : 'var(--border-light)'),
// //     borderRadius: 7, padding: '8px 11px',
// //     color:        val ? col : 'var(--text-muted)',
// //     fontFamily:   'var(--font-body)', fontSize: 13, fontWeight: 700,
// //     outline: 'none', width: '100%',
// //   });

// //   const buyerOptions = buyers.map(b => {
// //     const display = (b.lot_number && b.lot_number !== '—') ? b.lot_number : b.name;
// //     return { value: display, label: display, fullName: b.name };
// //   });

// //   return (
// //     <div className="modal-overlay" onClick={onClose}>
// //       <div className="modal" style={{ maxWidth: 960, width: '95%' }} onClick={e => e.stopPropagation()}>
// //         <div className="modal-header">
// //           <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
// //           <button className="modal-close" onClick={onClose}><X size={20} /></button>
// //         </div>

// //         <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
// //           {[['Serial No',seller.serial_number],['Lot No',lot],
// //             ['Material',seller.material&&seller.material!=='GENERAL'?seller.material:'—'],
// //             ['Date',fmtDate(seller.entry_date)]
// //           ].map(([l,v])=>(
// //             <div key={l} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 13px', fontSize:12 }}>
// //               <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{l}</div>
// //               <div style={{ fontWeight:700 }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>

// //         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:18 }}>
// //           <div className="form-group">
// //             <label className="form-label">Number of Bags</label>
// //             <input className="form-input" type="number" value={nBags} onChange={e=>changeNBags(e.target.value)} min="1" max="100" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Advance Paid (₹)</label>
// //             <input className="form-input" type="number" value={advance} onChange={e=>setAdvance(e.target.value)} placeholder="0.00" step="0.01" style={{ textTransform:'none' }}/>
// //           </div>
// //           <div className="form-group">
// //             <label className="form-label">Labour Rate (₹ per bag)</label>
// //             <input className="form-input" type="number" value={labour} onChange={e=>setLabour(e.target.value)} placeholder="20" step="1" min="0" style={{ textTransform:'none' }}/>
// //           </div>
// //         </div>

// //         {rows.length > 0 && (
// //           <>
// //             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
// //               <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                 <Package size={15} style={{ color:'var(--accent)' }}/>
// //                 <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Bag-wise Details</span>
// //                 <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>Lot: {lot}</span>
// //                 <span style={{ fontSize:11, color:wtsDone===rows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
// //                   {wtsDone}/{rows.length} weights
// //                 </span>
// //               </div>
// //               <span style={{ fontSize:11, color:'var(--text-muted)' }}>Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
// //             </div>

// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
// //               {['#','Lot','Weight (kg)','Rate (₹/100kg)','Buyer','Amount (₹)'].map(h=>(
// //                 <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
// //               ))}
// //             </div>

// //             <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:300, overflowY:'auto' }}>
// //               {rows.map((r,i)=>(
// //                 <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<rows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
// //                   <div style={{ width:24, height:24, borderRadius:5, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>{i+1}</div>
// //                   <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lot}</div>
// //                   <input type="number" value={r.weight} onChange={e=>update(i,'weight',e.target.value)}
// //                     placeholder="Enter weight" step="0.01" min="0.01" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.weight,'#3b82f6')}
// //                     onFocus={e=>{e.target.style.borderColor='#3b82f6';e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.weight?'#3b82f666':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />
// //                   <input type="number" value={r.rate} onChange={e=>update(i,'rate',e.target.value)}
// //                     placeholder="e.g. 3200" step="0.01" min="0" onWheel={e=>e.target.blur()}
// //                     style={iStyle(r.rate,'#10b981')}
// //                     onFocus={e=>{e.target.style.borderColor='#10b981';e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'}}
// //                     onBlur={e=>{e.target.style.borderColor=r.rate?'#10b98166':'var(--border-light)';e.target.style.boxShadow='none'}}
// //                   />
// //                   <select value={r.buyer || ''} onChange={e => update(i, 'buyer', e.target.value)}
// //                     style={{ background: r.buyer ? 'rgba(139,92,246,0.1)' : 'var(--bg-panel)', border: `1px solid ${r.buyer ? 'rgba(139,92,246,0.5)' : 'var(--border-light)'}`, borderRadius: 7, padding: '8px 10px', color: r.buyer ? '#a78bfa' : 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, outline: 'none', width: '100%', cursor: 'pointer' }}
// //                   >
// //                     <option value="">— Select Buyer —</option>
// //                     {buyerOptions.map((b, idx) => (
// //                       <option key={idx} value={b.value}>{b.label}</option>
// //                     ))}
// //                   </select>
// //                   <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
// //                     {r.amount?'₹'+fmtINR(r.amount):'—'}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>

// //             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
// //               <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
// //               <div style={{ fontSize:12, color:ratesDone===rows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{rows.length} rates {ratesDone===rows.length?'✓':''}</div>
// //               <div style={{ fontSize:11, color:'var(--text-muted)' }}>{rows.filter(r=>r.buyer).length}/{rows.length} buyers assigned</div>
// //               <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
// //             </div>
// //           </>
// //         )}

// //         {grossAmount > 0 && (
// //           <div style={{ marginTop:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
// //             <div style={{ background:'var(--bg-panel)', padding:'10px 18px', borderBottom:'1px solid var(--border)' }}>
// //               <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>💰 Payment Calculation</span>
// //             </div>
// //             <div>
// //               {[
// //                 { label:'Gross Amount',          sub:`${rows.length} bags × Rate`,      val:`₹ ${fmtINR(grossAmount)}`,               color:'var(--accent)',         fs:16 },
// //                 { label:'− Labour / Hamali',     sub:`₹${labour||20} × ${bags} bags`,  val:`− ₹ ${fmtINR(labourAmt)}`,              color:'var(--red)',            fs:15 },
// //                 { label:'− Other Charges ', sub:`8% of ₹${fmtINR(grossAmount)}`, val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
// //                 { label:'Net Amount',            sub:'Gross − Labour − Commission',     val:`₹ ${fmtINR(netPayable)}`,               color:'var(--blue)',           fs:16, highlight:true },
// //                 { label:'− Advance Already Paid',sub:'',                               val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`, color:'var(--text-secondary)', fs:15 },
// //               ].map((row, i)=>(
// //                 <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
// //                   <div>
// //                     <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
// //                     {row.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
// //                   </div>
// //                   <div style={{ fontSize:row.fs, fontWeight:800, color:row.color, fontFamily:'var(--font-display)' }}>{row.val}</div>
// //                 </div>
// //               ))}
// //               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px', background:finalPay>=0?'var(--green-dim)':'var(--red-dim)' }}>
// //                 <div>
// //                   <div style={{ fontSize:15, fontWeight:800, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                     {finalPay >= 0 ? '✅ Final Amount to Pay Seller' : '⚠️ Seller Owes Back'}
// //                   </div>
// //                   <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Net − Advance</div>
// //                 </div>
// //                 <div style={{ fontSize:24, fontWeight:900, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
// //                   ₹ {fmtINR(Math.abs(finalPay))}
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
// //           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
// //           <button className="btn btn-primary" onClick={save} disabled={saving}>
// //             <Check size={15}/> {saving?'Saving...':'Save Changes'}
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ─── Checkbox style ───────────────────────────────────────────
// // const cbStyle = (checked) => ({
// //   width: 17, height: 17, borderRadius: 4, border: `2px solid ${checked ? '#1a56db' : 'var(--border)'}`,
// //   background: checked ? '#1a56db' : 'transparent', cursor: 'pointer', display: 'flex',
// //   alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
// // });

// // // ─── Main ─────────────────────────────────────────────────────
// // export default function SellerList() {
// //   const [sellers,  setSellers]  = useState([]);
// //   const [loading,  setLoading]  = useState(true);
// //   const [search,   setSearch]   = useState('');
// //   const [fDate,    setFDate]    = useState(todayISO());
// //   const [fMat,     setFMat]     = useState('');
// //   const [bill,     setBill]     = useState(null);
// //   const [editing,  setEditing]  = useState(null);
// //   const [confirm,  setConfirm]  = useState(null);
// //   // ✅ Selection state
// //   const [selected, setSelected] = useState(new Set());

// //   const load = useCallback(async () => {
// //     setLoading(true);
// //     setSelected(new Set()); // clear selection on reload
// //     try {
// //       const res = await API.get('/api/sellers', { params: fDate ? { date: fDate } : {} });
// //       setSellers(res.data.data);
// //     } catch(err) { toast.error(err.message||'Load failed'); }
// //     finally { setLoading(false); }
// //   }, [fDate]);

// //   useEffect(() => { load(); }, [load]);

// //   const del = (id, name) => setConfirm({
// //     title: 'Delete Seller?',
// //     message: `"${name}" will be permanently removed.`,
// //     onConfirm: async () => {
// //       try { await API.delete(`/api/sellers/${id}`); toast.success('Deleted'); load(); }
// //       catch(err) { toast.error(err.message||'Failed'); }
// //     }
// //   });

// //   const clear = () => { setSearch(''); setFDate(todayISO()); setFMat(''); };

// //   const list = sellers.filter(s => {
// //     const q = search.toLowerCase();
// //     return (!q || [s.name,s.mobile,s.lot_number,s.serial_number,s.material].some(v=>v?.toLowerCase().includes(q)))
// //       && (!fMat || s.material===fMat);
// //   });

// //   // ─── Selection helpers ────────────────────────────────────
// //   const allIds       = list.map(s => s.id);
// //   const allSelected  = allIds.length > 0 && allIds.every(id => selected.has(id));
// //   const someSelected = allIds.some(id => selected.has(id));
// //   const selectedCount = allIds.filter(id => selected.has(id)).length;

// //   const toggleAll = () => {
// //     if (allSelected) {
// //       setSelected(prev => { const next = new Set(prev); allIds.forEach(id => next.delete(id)); return next; });
// //     } else {
// //       setSelected(prev => { const next = new Set(prev); allIds.forEach(id => next.add(id)); return next; });
// //     }
// //   };

// //   const toggleOne = (id) => {
// //     setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
// //   };

// //   const printSelected = () => {
// //     const toprint = list.filter(s => selected.has(s.id));
// //     if (toprint.length === 0) { toast.error('Select at least one seller'); return; }
// //     printMultipleBills(toprint);
// //   };

// //   const tot = list.reduce((a,s)=>({
// //     bags: a.bags+Number(s.num_bags||0), wt: a.wt+Number(s.weight||0),
// //     adv:  a.adv+Number(s.advance_amount||0), amt: a.amt+Number(s.amount||0),
// //   }),{ bags:0, wt:0, adv:0, amt:0 });

// //   return (
// //     <div>
// //       <div className="page-header">
// //         <div>
// //           <div className="page-title">Seller List</div>
// //           <div className="page-subtitle">
// //             {loading ? 'Loading...' : `${sellers.length} sellers${fDate ? ` for ${fDate}` : ''}`}
// //           </div>
// //         </div>
// //         <div style={{ display:'flex', gap:8, alignItems:'center' }}>
// //           {/* ✅ Bulk print button — only shows when something is selected */}
// //           {selectedCount > 0 && (
// //             <button
// //               className="btn btn-primary"
// //               onClick={printSelected}
// //               style={{ display:'flex', alignItems:'center', gap:6, background:'#1a56db', color:'#fff', fontWeight:700, fontSize:13, padding:'7px 15px', borderRadius:8, border:'none', cursor:'pointer' }}
// //             >
// //               <Printer size={14}/>
// //               Print {selectedCount} Bill{selectedCount > 1 ? 's' : ''}
// //             </button>
// //           )}
// //           <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
// //         </div>
// //       </div>

// //       <div className="filter-bar">
// //         <div className="search-box" style={{ flex:2 }}>
// //           <Search className="search-icon" size={16}/>
// //           <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, lot no..." style={{ textTransform:'none' }}/>
// //         </div>
// //         <input className="form-input" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{ textTransform:'none', flex:1 }}/>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())} title="Today">Today</button>
// //         <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')} title="All dates">All</button>
// //         <select className="form-select" value={fMat} onChange={e=>setFMat(e.target.value)} style={{ flex:1 }}>
// //           <option value="">All Materials</option>
// //           {MATERIALS.map(m=><option key={m}>{m}</option>)}
// //         </select>
// //         {(search||fMat)&&<button className="btn btn-secondary" onClick={clear}><X size={14}/> Clear</button>}
// //       </div>

// //       {list.length>0&&(
// //         <div style={{ display:'flex', gap:12, marginBottom:16 }}>
// //           {[['Sellers',list.length,'var(--accent)'],['Bags',tot.bags,'var(--green)'],
// //             ['Weight',fmtNum(tot.wt)+' kg','var(--blue)'],['Amount','₹ '+fmtINR(tot.amt),'var(--purple)'],
// //             ['Advance','₹ '+fmtINR(tot.adv),'var(--text-secondary)']
// //           ].map(([l,v,c])=>(
// //             <div key={l} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
// //               <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{l}</div>
// //               <div style={{ fontSize:15, fontWeight:800, color:c, fontFamily:'var(--font-display)' }}>{v}</div>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       <div className="table-wrapper">
// //         {loading?<div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading...</div>
// //         :list.length===0?(
// //           <div className="empty-state">
// //             <div className="empty-state-icon">👨‍🌾</div>
// //             <h3>{fDate ? `No sellers registered for ${fDate}` : 'No sellers found'}</h3>
// //             <p style={{ fontSize:12, marginTop:6, color:'var(--text-muted)' }}>
// //               {fDate ? 'Click "All" to see all sellers, or change the date' : 'Register a seller to get started'}
// //             </p>
// //             {fDate && (
// //               <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'center' }}>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')}>Show All Sellers</button>
// //                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())}>Today</button>
// //               </div>
// //             )}
// //           </div>
// //         ):(
// //           <table>
// //             <thead>
// //               <tr>
// //                 {/* ✅ Select-all checkbox */}
// //                 <th style={{ width:36, textAlign:'center', padding:'10px 8px' }}>
// //                   <div
// //                     onClick={toggleAll}
// //                     style={{ ...cbStyle(allSelected), margin:'0 auto', opacity: someSelected && !allSelected ? 0.6 : 1 }}
// //                     title={allSelected ? 'Deselect all' : 'Select all'}
// //                   >
// //                     {(allSelected || someSelected) && <Check size={11} color="#fff" strokeWidth={3}/>}
// //                   </div>
// //                 </th>
// //                 <th>#</th><th>Sr</th><th>Name</th><th>Mobile</th><th>Material</th>
// //                 <th>Bags</th><th>Lot</th><th>Weight</th><th>Amount</th><th>Advance</th><th>Balance</th><th>Date</th>
// //                 <th style={{ textAlign:'center' }}>Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {list.map((s,i)=>{
// //                 const bal=(s.amount||0)-(s.advance_amount||0);
// //                 const isChecked = selected.has(s.id);
// //                 let bags=[]; try{bags=JSON.parse(s.bag_data||'[]')}catch{}
// //                 const rd=bags.filter(b=>Number(b.rate)>0).length;
// //                 return(
// //                   <tr key={s.id} style={{ background: isChecked ? 'rgba(26,86,219,0.06)' : undefined, cursor:'default' }}>
// //                     {/* ✅ Row checkbox */}
// //                     <td style={{ textAlign:'center', padding:'10px 8px' }}>
// //                       <div onClick={() => toggleOne(s.id)} style={{ ...cbStyle(isChecked), margin:'0 auto' }}>
// //                         {isChecked && <Check size={11} color="#fff" strokeWidth={3}/>}
// //                       </div>
// //                     </td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{i+1}</td>
// //                     <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
// //                     <td style={{ fontWeight:600 }}>{s.name}</td>
// //                     <td className="td-muted">{s.mobile&&s.mobile!=='0000000000'?s.mobile:'—'}</td>
// //                     <td>{s.material&&s.material!=='GENERAL'
// //                       ?<span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
// //                       :<span className="td-muted">—</span>}
// //                     </td>
// //                     <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
// //                     <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
// //                     <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
// //                     <td style={{ fontWeight:700, color:'var(--accent)' }}>
// //                       {s.amount?`₹${fmtINR(s.amount)}`:<span style={{ fontSize:11, color:'var(--text-muted)' }}>{rd}/{bags.length} rates</span>}
// //                     </td>
// //                     <td className="td-muted">{s.advance_amount?`₹${fmtINR(s.advance_amount)}`:'—'}</td>
// //                     <td style={{ fontWeight:600, color:bal>0?'var(--red)':'var(--green)' }}>{s.amount?`₹${fmtINR(bal)}`:'—'}</td>
// //                     <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
// //                     <td>
// //                       <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
// //                         <button className="btn btn-blue btn-sm" onClick={()=>setEditing(s)} title="Edit"><Edit2 size={13}/></button>
// //                         <button className="btn btn-green btn-sm" onClick={()=>setBill(s)} title="Bill"><Eye size={13}/></button>
// //                         <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={()=>setBill(s)} title="Print"><Printer size={13}/></button>
// //                         <button className="btn btn-red btn-sm" onClick={()=>del(s.id,s.name)} title="Delete"><Trash2 size={13}/></button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 );
// //               })}
// //             </tbody>
// //             {list.length>1&&(
// //               <tfoot>
// //                 <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
// //                   <td colSpan={6} style={{ padding:'11px 15px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({list.length})</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{tot.bags}</td>
// //                   <td/>
// //                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{fmtNum(tot.wt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(tot.amt)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700 }}>₹{fmtINR(tot.adv)}</td>
// //                   <td style={{ padding:'11px 15px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(tot.amt-tot.adv)}</td>
// //                   <td colSpan={2}/>
// //                 </tr>
// //               </tfoot>
// //             )}
// //           </table>
// //         )}
// //       </div>

// //       {bill    && <BillModal  seller={bill}    onClose={()=>setBill(null)}/>}
// //       {editing && <EditModal  seller={editing} onClose={()=>setEditing(null)} onSave={load}/>}
// //       {confirm && <ConfirmDialog {...confirm}  onClose={()=>setConfirm(null)}/>}

// //       <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>
// //     </div>
// //   );
// // }






// // -----------------------------------------------------------------------------------------------------




// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package, CheckSquare } from 'lucide-react';
// import axios from 'axios';
// import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// import ConfirmDialog from '../ConfirmDialog';

// const API = axios.create({ baseURL: 'http://localhost:5000' });

// const todayISO = () => new Date().toISOString().split('T')[0];

// // ─── Parse bag_data ───────────────────────────────────────────
// function getBags(seller) {
//   const num = parseInt(seller.num_bags) || 0;
//   const lot = seller.lot_number || `${seller.serial_number}/${num}`;
//   let raw = [];
//   try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
//   return Array.from({ length: num }, (_, i) => {
//     const b = raw[i] || {};
//     return {
//       lot,
//       weight: Number(b.weight) > 0 ? String(b.weight) : '',
//       rate:   Number(b.rate)   > 0 ? String(b.rate)   : '',
//       amount: Number(b.amount) > 0 ? String(b.amount) : '',
//       buyer:  b.buyer || '',
//     };
//   });
// }

// // ─── Number to Indian Words ───────────────────────────────────
// function toIndianWords(amount) {
//   const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
//     'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
//   const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
//   function conv(n) {
//     if (n === 0) return '';
//     if (n < 20) return ones[n];
//     if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
//     if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+conv(n%100) : '');
//     if (n < 100000) return conv(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' '+conv(n%1000) : '');
//     if (n < 10000000) return conv(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' '+conv(n%100000) : '');
//     return conv(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' '+conv(n%10000000) : '');
//   }
//   const intPart = Math.floor(Math.abs(amount));
//   const decPart = Math.round((Math.abs(amount) - intPart) * 100);
//   let words = conv(intPart) + ' Rupees';
//   if (decPart > 0) words += ' and ' + conv(decPart) + ' Paise';
//   return words || 'Zero Rupees';
// }

// const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// // ─── Build single bill HTML — A5 optimised ───────────────────
// // A5 = 148mm × 210mm. @page margin: 5mm each side.
// // Usable width = 138mm. All font sizes in px tuned for A5 print.
// function buildBillHTML(seller) {
//   const totalBags = parseInt(seller.num_bags) || 0;
//   let rawBags = [];
//   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

//   const bagRows = Array.from({ length: totalBags }, (_, i) => {
//     const b = rawBags[i] || {};
//     return {
//       srno:     String(i + 1).padStart(3, '0'),
//       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
//       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
//       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
//       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
//       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
//     };
//   });

//   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
//   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
//   const labourAmt   = 20 * totalBags;
//   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
//   const advance     = parseFloat(seller.advance_amount) || 0;
//   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

//   // Row padding and font sizes reduced for A5 fit
//   const bagRowsHtml = bagRows.map((b, i) => `
//     <tr style="background:${i%2===0?'#ffffff':'#eff6ff'}">
//       <td style="border:1px solid #b8cef0;padding:2px 2px;text-align:center;font-size:8px;color:#333">${b.srno}</td>
//       <td style="border:1px solid #b8cef0;padding:2px 4px;text-align:left;font-size:8px;font-weight:700;color:#1a1a1a">${b.material}</td>
//       <td style="border:1px solid #b8cef0;padding:2px 2px;text-align:center;font-size:7.5px;font-family:monospace;color:#444">${b.lot}</td>
//       <td style="border:1px solid #b8cef0;padding:2px 2px;text-align:center;font-size:8px;font-weight:600;color:#333">1</td>
//       <td style="border:1px solid #b8cef0;padding:2px 2px;text-align:center;font-size:8px;font-weight:800;color:#1e40af">${b.weight != null ? b.weight : '—'}</td>
//       <td style="border:1px solid #b8cef0;padding:2px 2px;text-align:center;font-size:8px;font-weight:800;color:#166534">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
//       <td style="border:1px solid #b8cef0;padding:2px 4px;text-align:right;font-size:8px;font-weight:800;color:#1a56db">${b.amount != null ? inr(b.amount) : '—'}</td>
//     </tr>`).join('');

//   const html = `
// <div style="width:100%;font-family:Arial,sans-serif;font-size:8px;color:#111;background:#fff;line-height:1.3;border:2px solid #1a56db;border-radius:3px;padding:5px;box-sizing:border-box;position:relative;">
//   <div style="position:absolute;top:3px;left:3px;right:3px;bottom:3px;border:1px solid #a0bbf0;border-radius:2px;pointer-events:none;"></div>

//   <!-- Header -->
//   <div style="text-align:center;border-bottom:1.5px double #1a56db;padding-bottom:5px;margin-bottom:4px;">
//     <div style="display:flex;justify-content:space-between;align-items:center;font-size:7px;color:#444;margin-bottom:2px;">
//       <span style="text-align:left;line-height:1.4;">Prop. Praveen V. Heggani<br>Cell : 9611635183</span>
//       <div style="width:26px;height:26px;border-radius:50%;border:2px solid #1a56db;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:9px;color:#1a56db;background:#eff6ff;flex-shrink:0;">PH</div>
//       <span style="text-align:right;line-height:1.4;">Prop. Pramod V.Heggani<br>Cell : 9448349836</span>
//     </div>
//     <div style="font-size:14px;font-weight:900;color:#1a1a1a;line-height:1.1;margin:1px 0;">Mr. Praveen Heggani</div>
//     <div style="margin:1px 0;"><span style="display:inline-block;background:#1a56db;color:#fff;font-size:6.5px;font-weight:700;letter-spacing:0.8px;padding:1.5px 8px;border-radius:2px;">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
//     <div style="font-size:8px;font-weight:700;color:#333;">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
//     <div style="font-size:7px;color:#666;margin-top:1px;">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
//   </div>

//   <!-- Meta -->
//   <div style="border:1px solid #1a56db;border-radius:2px;margin-bottom:4px;overflow:hidden;">
//     <div style="display:flex;justify-content:space-between;padding:3px 6px;font-size:8px;border-bottom:1px solid #cfe2ff;">
//       <span><strong style="color:#1a56db">Bill No :</strong> ${seller.serial_number || '—'}</span>
//       <span><strong style="color:#1a56db">Date :</strong> ${fmtDate(seller.entry_date)}</span>
//     </div>
//     <div style="padding:2px 6px;font-size:8px;"><strong style="color:#1a56db">Cust. Name :</strong> ${seller.name}</div>
//   </div>

//   <!-- Items Table -->
//   <table style="width:100%;border-collapse:collapse;margin-bottom:1px;table-layout:fixed;">
//     <colgroup>
//       <col style="width:8%"><col style="width:18%"><col style="width:13%">
//       <col style="width:7%"><col style="width:13%"><col style="width:14%"><col style="width:27%">
//     </colgroup>
//     <thead>
//       <tr>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">SrNo.</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Particular</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Lott No.</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Bags</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Weight(KG)</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">RATE</th>
//         <th style="background:#1a56db;color:#fff;padding:3px 2px;font-size:7.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Amount</th>
//       </tr>
//     </thead>
//     <tbody>${bagRowsHtml}</tbody>
//     <tfoot>
//       <tr style="background:#dbeafe;border-top:1.5px solid #1a56db;">
//         <td colspan="3" style="border:1px solid #b8cef0;padding:3px 4px;font-weight:800;color:#1e40af;text-align:left;font-size:8px;">TOTAL</td>
//         <td style="border:1px solid #b8cef0;padding:3px 2px;text-align:center;font-weight:800;color:#111;font-size:8px;">${totalBags}</td>
//         <td style="border:1px solid #b8cef0;padding:3px 2px;text-align:center;font-weight:800;color:#1e40af;font-size:8px;">${totalWeight.toFixed(2)}</td>
//         <td style="border:1px solid #b8cef0;padding:3px 2px;text-align:right;font-size:7px;color:#1e40af;font-weight:600;">Gross Amt.</td>
//         <td style="border:1px solid #b8cef0;padding:3px 4px;text-align:right;font-weight:800;color:#1a56db;font-size:10px;">&#8377; ${inr(grossAmount)}</td>
//       </tr>
//     </tfoot>
//   </table>

//   <!-- Deductions -->
//   <table style="width:100%;border-collapse:collapse;margin-top:2px;table-layout:fixed;">
//     <colgroup><col style="width:60%"><col style="width:40%"></colgroup>
//     <tbody>
//       <tr><td style="border:1px solid #b8cef0;padding:3px 6px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7.5px;">Other Charges</td><td style="border:1px solid #b8cef0;padding:3px 6px;text-align:right;font-weight:700;color:#dc2626;font-size:8px;">− ₹ ${inr(commission)}</td></tr>
//       <tr><td style="border:1px solid #b8cef0;padding:3px 6px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7.5px;">Hamali / Labour Charges</td><td style="border:1px solid #b8cef0;padding:3px 6px;text-align:right;font-weight:700;color:#dc2626;font-size:8px;">− ₹ ${inr(labourAmt)}</td></tr>
//       <tr><td style="border:1px solid #b8cef0;padding:3px 6px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7.5px;">Advance Paid</td><td style="border:1px solid #b8cef0;padding:3px 6px;text-align:right;font-weight:700;color:#dc2626;font-size:8px;">− ₹ ${inr(advance)}</td></tr>
//       <tr style="background:#1a56db;">
//         <td style="padding:6px 8px;color:#fff;font-weight:900;font-size:10px;">NET AMOUNT</td>
//         <td style="padding:6px 8px;color:#fff;font-weight:900;font-size:12px;text-align:right;">&#8377; ${inr(Math.max(0, finalPay))}</td>
//       </tr>
//     </tbody>
//   </table>

//   <!-- In Words -->
//   <div style="border:1px solid #1a56db;border-radius:2px;padding:3px 6px;font-size:7.5px;margin-top:4px;background:#f8fbff;">
//     <strong style="color:#1a56db;">In Words :</strong> ${toIndianWords(Math.max(0, finalPay))} Only
//   </div>
//   <div style="text-align:right;font-size:7px;color:#888;margin-top:1px;font-style:italic;">(E.&amp;O.E.)</div>

//   <!-- Footer -->
//   <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:10px;">
//     <div style="text-align:center;border-top:1px solid #555;padding-top:3px;font-size:7.5px;width:90px;color:#444;">Receiver's Sign.</div>
//     <div style="font-weight:800;font-size:8px;">For – Mr. Praveen Heggani</div>
//   </div>
// </div>`;

//   return { html, finalPay };
// }

// // ─── Print HTML helper ────────────────────────────────────────
// function openPrintWindow(fullHtml) {
//   if (window.electronAPI && window.electronAPI.printHTML) {
//     window.electronAPI.printHTML(fullHtml);
//   } else {
//     const w = window.open('', '_blank', 'width=900,height=750');
//     if (w && w.document) { w.document.write(fullHtml); w.document.close(); }
//   }
// }

// // ─── Wrap bills in full A5 print page ────────────────────────
// function wrapInPrintPage(billsHtml, title) {
//   return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>${title}</title>
//   <style>
//     @page {
//       size: A5 portrait;
//       margin: 5mm;
//     }
//     * { box-sizing: border-box; margin: 0; padding: 0; }
//     html, body {
//       width: 100%;
//       background: #fff;
//       font-family: Arial, sans-serif;
//     }
//     body {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//     }
//     .bill-page {
//       width: 138mm;
//       max-width: 138mm;
//       page-break-after: always;
//     }
//     .bill-page:last-child {
//       page-break-after: avoid;
//     }
//     @media print {
//       body {
//         -webkit-print-color-adjust: exact;
//         print-color-adjust: exact;
//       }
//     }
//   </style>
// </head>
// <body>
// ${billsHtml}
// <script>window.onload = function(){ window.print(); }<\/script>
// </body>
// </html>`;
// }

// // ─── Bulk print all selected sellers ─────────────────────────
// function printMultipleBills(sellers) {
//   const billsHtml = sellers
//     .map(s => `<div class="bill-page">${buildBillHTML(s).html}</div>`)
//     .join('\n');
//   openPrintWindow(wrapInPrintPage(billsHtml, `Bills — ${sellers.length} Sellers`));
// }

// // ─── Bill Modal ───────────────────────────────────────────────
// function BillModal({ seller, onClose }) {
//   const BLUE = '#1a56db';

//   const totalBags = parseInt(seller.num_bags) || 0;
//   let rawBags = [];
//   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

//   const bagRows = Array.from({ length: totalBags }, (_, i) => {
//     const b = rawBags[i] || {};
//     return {
//       srno:     String(i + 1).padStart(3, '0'),
//       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
//       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
//       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
//       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
//       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
//     };
//   });

//   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
//   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
//   const labourAmt   = 20 * totalBags;
//   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
//   const advance     = parseFloat(seller.advance_amount) || 0;
//   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

//   const printBill = () => {
//     const { html } = buildBillHTML(seller);
//     const billsHtml = `<div class="bill-page">${html}</div>`;
//     openPrintWindow(wrapInPrintPage(billsHtml, `Bill — ${seller.name}`));
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" style={{ maxWidth: 560, width: '95%', padding: 0, overflow: 'hidden', borderRadius: 10 }} onClick={e => e.stopPropagation()}>
//         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:BLUE, color:'#fff' }}>
//           <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
//           <div style={{ display:'flex', gap:8 }}>
//             <button onClick={printBill} style={{ background:'#fff', color:BLUE, border:'none', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
//               <Printer size={13} /> Print / PDF (A5)
//             </button>
//             <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}><X size={18} /></button>
//           </div>
//         </div>
//         <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f0f4ff' }}>
//           <div style={{ all:'initial', display:'block' }}>
//           <div style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'3px solid #1a56db', borderRadius:4, position:'relative' }}>
//             <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #a0bbf0', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>
//             <div style={{ textAlign:'center', borderBottom:'2.5px double #1a56db', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
//               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
//                 <span style={{ textAlign:'left' }}>Prop. Praveen V. Heggani<br/>Cell : 9611635183</span>
//                 <div style={{ width:40, height:40, borderRadius:'50%', border:'2.5px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1a56db', background:'#eff6ff' }}>PH</div>
//                 <span style={{ textAlign:'right' }}>Prop. Pramod V.Heggani<br/>Cell : 9448349836</span>
//               </div>
//               <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>Mr. Praveen Heggani</div>
//               <div><span style={{ display:'inline-block', background:'#1a56db', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}>TAMARIND,GINGER,GARLIC,ONION &amp; Vegetables</span></div>
//               <div style={{ fontSize:11, fontWeight:700 }}>ORDER SUPPLIER &amp; COMMISSION AGENT</div>
//               <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}>Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
//             </div>
//             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
//               <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
//                 <span><strong style={{ color:'#1a56db' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
//                 <span><strong style={{ color:'#1a56db' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
//               </div>
//               <div style={{ padding:'4px 8px', fontSize:11 }}>
//                 <strong style={{ color:'#1a56db' }}>Cust. Name :</strong> {seller.name}
//               </div>
//             </div>
//             <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
//               <thead>
//                 <tr>
//                   {['SrNo.','Particular','Lott No.','Bags','Weight(KG)','RATE','Amount'].map(h => (
//                     <th key={h} style={{ background:'#1a56db', color:'#fff', padding:'5px 4px', fontSize:9.5, fontWeight:700, border:'1px solid #1245b5', textAlign:'center' }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {bagRows.map((b, i) => (
//                   <tr key={i} style={{ background: i%2===0 ? '#fff':'#eff6ff' }}>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, color:'#111' }}>{b.srno}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'left', fontSize:10, fontWeight:700, color:'#111' }}>{b.material}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontFamily:'monospace', color:'#333' }}>{b.lot}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:600, color:'#111' }}>1</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#1e40af' }}>{b.weight != null ? b.weight : '—'}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#166534' }}>{b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'right', fontSize:10, fontWeight:800, color:'#1a56db' }}>{b.amount != null ? inr(b.amount) : '—'}</td>
//                   </tr>
//                 ))}
//               </tbody>
//               <tfoot>
//                 <tr style={{ background:'#dbeafe', borderTop:'2px solid #1a56db' }}>
//                   <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
//                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
//                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#1e40af' }}>{totalWeight.toFixed(2)}</td>
//                   <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af' }}>Gross Amt.</td>
//                   <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1a56db', fontSize:13 }}>₹ {inr(grossAmount)}</td>
//                 </tr>
//               </tfoot>
//             </table>
//             <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
//               <tbody>
//                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Other Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td></tr>
//                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
//                 <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td></tr>
//                 <tr style={{ background:'#1a56db' }}>
//                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
//                   <td style={{ padding:'9px 10px', color:'#fff', fontWeight:900, fontSize:16, textAlign:'right' }}>₹ {inr(Math.max(0, finalPay))}</td>
//                 </tr>
//               </tbody>
//             </table>
//             <div style={{ border:'1.5px solid #1a56db', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
//               <strong style={{ color:'#1a56db' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
//             </div>
//             <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>
//             <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
//               <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
//               <div style={{ fontWeight:800, fontSize:11 }}>For – Mr. Praveen Heggani</div>
//             </div>
//           </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Edit Modal ───────────────────────────────────────────────
// function EditModal({ seller, onClose, onSave }) {
//   const num = parseInt(seller.num_bags) || 0;
//   const lot = seller.lot_number || (seller.serial_number + '/' + num);

//   const [rows,    setRows]    = useState(() => getBags(seller));
//   const [nBags,   setNBags]   = useState(String(num));
//   const [advance, setAdvance] = useState(String(seller.advance_amount || ''));
//   const [labour,  setLabour]  = useState('20');
//   const [saving,  setSaving]  = useState(false);
//   const [buyers,  setBuyers]  = useState([]);

//   useEffect(() => {
//     API.get('/api/buyers').then(res => {
//       setBuyers(res.data.data || []);
//     }).catch(() => {});
//   }, []);

//   const changeNBags = (v) => {
//     setNBags(v);
//     const n = parseInt(v) || 0;
//     setRows(prev => Array.from({ length: n }, (_, i) =>
//       prev[i] || { lot, weight: '', rate: '', amount: '', buyer: '' }
//     ));
//   };

//   const update = (i, field, val) => {
//     setRows(prev => prev.map((r, j) => {
//       if (j !== i) return r;
//       const next = { ...r, [field]: val };
//       if (field === 'weight' || field === 'rate') {
//         const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
//         const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
//         next.amount = w && rt ? ((w * rt) / 100).toFixed(2) : '';
//       }
//       return next;
//     }));
//   };

//   const bags        = parseInt(nBags) || 0;
//   const totalW      = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
//   const grossAmount = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
//   const labourAmt   = (parseFloat(labour) || 0) * bags;
//   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   const totalDeduct = parseFloat((labourAmt + commission).toFixed(2));
//   const netPayable  = parseFloat((grossAmount - totalDeduct).toFixed(2));
//   const finalPay    = parseFloat((netPayable - (parseFloat(advance) || 0)).toFixed(2));

//   const ratesDone = rows.filter(r => parseFloat(r.rate) > 0).length;
//   const wtsDone   = rows.filter(r => parseFloat(r.weight) > 0).length;

//   const iStyle = (val, col) => ({
//     background:   val ? col + '11' : 'var(--bg-panel)',
//     border:       '1px solid ' + (val ? col + '66' : 'var(--border-light)'),
//     borderRadius: 7, padding: '8px 11px',
//     color:        val ? col : 'var(--text-muted)',
//     fontFamily:   'var(--font-body)', fontSize: 13, fontWeight: 700,
//     outline: 'none', width: '100%',
//   });

//   const buyerOptions = buyers.map(b => {
//     const display = (b.lot_number && b.lot_number !== '—') ? b.lot_number : b.name;
//     return { value: display, label: display, fullName: b.name };
//   });

//   const save = async () => {
//     if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
//     setSaving(true);
//     try {
//       const bag_data = rows.map(r => ({
//         lot,
//         weight: parseFloat(r.weight) || 0,
//         rate:   parseFloat(r.rate)   || 0,
//         amount: parseFloat(r.amount) || 0,
//         buyer:  r.buyer || '',
//       }));
//       await API.put('/api/sellers/' + seller.id, {
//         num_bags:       bags,
//         weight:         totalW,
//         amount:         netPayable,
//         advance_amount: parseFloat(advance) || 0,
//         rate_fixed:     totalW > 0 && grossAmount > 0 ? parseFloat((grossAmount / totalW * 100).toFixed(2)) : 0,
//         bag_data:       JSON.stringify(bag_data),
//       });
//       toast.success('Saved! Final payable: ₹' + fmtINR(finalPay));
//       onSave(); onClose();
//     } catch (err) {
//       toast.error(err.response?.data?.error || err.message || 'Failed');
//     } finally { setSaving(false); }
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" style={{ maxWidth: 960, width: '95%' }} onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
//           <button className="modal-close" onClick={onClose}><X size={20} /></button>
//         </div>

//         <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
//           {[['Serial No',seller.serial_number],['Lot No',lot],
//             ['Material',seller.material&&seller.material!=='GENERAL'?seller.material:'—'],
//             ['Date',fmtDate(seller.entry_date)]
//           ].map(([l,v])=>(
//             <div key={l} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 13px', fontSize:12 }}>
//               <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{l}</div>
//               <div style={{ fontWeight:700 }}>{v}</div>
//             </div>
//           ))}
//         </div>

//         <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:18 }}>
//           <div className="form-group">
//             <label className="form-label">Number of Bags</label>
//             <input className="form-input" type="number" value={nBags} onChange={e=>changeNBags(e.target.value)} min="1" max="100" style={{ textTransform:'none' }}/>
//           </div>
//           <div className="form-group">
//             <label className="form-label">Advance Paid (₹)</label>
//             <input className="form-input" type="number" value={advance} onChange={e=>setAdvance(e.target.value)} placeholder="0.00" step="0.01" style={{ textTransform:'none' }}/>
//           </div>
//           <div className="form-group">
//             <label className="form-label">Labour Rate (₹ per bag)</label>
//             <input className="form-input" type="number" value={labour} onChange={e=>setLabour(e.target.value)} placeholder="20" step="1" min="0" style={{ textTransform:'none' }}/>
//           </div>
//         </div>

//         {rows.length > 0 && (
//           <>
//             <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
//               <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//                 <Package size={15} style={{ color:'var(--accent)' }}/>
//                 <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Bag-wise Details</span>
//                 <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>Lot: {lot}</span>
//                 <span style={{ fontSize:11, color:wtsDone===rows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
//                   {wtsDone}/{rows.length} weights
//                 </span>
//               </div>
//               <span style={{ fontSize:11, color:'var(--text-muted)' }}>Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
//             </div>

//             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
//               {['#','Lot','Weight (kg)','Rate (₹/100kg)','Buyer','Amount (₹)'].map(h=>(
//                 <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
//               ))}
//             </div>

//             <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:300, overflowY:'auto' }}>
//               {rows.map((r,i)=>(
//                 <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<rows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
//                   <div style={{ width:24, height:24, borderRadius:5, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>{i+1}</div>
//                   <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lot}</div>
//                   <input type="number" value={r.weight} onChange={e=>update(i,'weight',e.target.value)}
//                     placeholder="Enter weight" step="0.01" min="0.01" onWheel={e=>e.target.blur()}
//                     style={iStyle(r.weight,'#3b82f6')}
//                     onFocus={e=>{e.target.style.borderColor='#3b82f6';e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'}}
//                     onBlur={e=>{e.target.style.borderColor=r.weight?'#3b82f666':'var(--border-light)';e.target.style.boxShadow='none'}}
//                   />
//                   <input type="number" value={r.rate} onChange={e=>update(i,'rate',e.target.value)}
//                     placeholder="e.g. 3200" step="0.01" min="0" onWheel={e=>e.target.blur()}
//                     style={iStyle(r.rate,'#10b981')}
//                     onFocus={e=>{e.target.style.borderColor='#10b981';e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'}}
//                     onBlur={e=>{e.target.style.borderColor=r.rate?'#10b98166':'var(--border-light)';e.target.style.boxShadow='none'}}
//                   />
//                   <select value={r.buyer || ''} onChange={e => update(i, 'buyer', e.target.value)}
//                     style={{ background: r.buyer ? 'rgba(139,92,246,0.1)' : 'var(--bg-panel)', border: `1px solid ${r.buyer ? 'rgba(139,92,246,0.5)' : 'var(--border-light)'}`, borderRadius: 7, padding: '8px 10px', color: r.buyer ? '#a78bfa' : 'var(--text-muted)', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, outline: 'none', width: '100%', cursor: 'pointer' }}
//                   >
//                     <option value="">— Select Buyer —</option>
//                     {buyerOptions.map((b, idx) => (
//                       <option key={idx} value={b.value}>{b.label}</option>
//                     ))}
//                   </select>
//                   <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
//                     {r.amount?'₹'+fmtINR(r.amount):'—'}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
//               <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
//               <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
//               <div style={{ fontSize:12, color:ratesDone===rows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{rows.length} rates {ratesDone===rows.length?'✓':''}</div>
//               <div style={{ fontSize:11, color:'var(--text-muted)' }}>{rows.filter(r=>r.buyer).length}/{rows.length} buyers assigned</div>
//               <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
//             </div>
//           </>
//         )}

//         {grossAmount > 0 && (
//           <div style={{ marginTop:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
//             <div style={{ background:'var(--bg-panel)', padding:'10px 18px', borderBottom:'1px solid var(--border)' }}>
//               <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>💰 Payment Calculation</span>
//             </div>
//             <div>
//               {[
//                 { label:'Gross Amount',          sub:`${rows.length} bags × Rate`,      val:`₹ ${fmtINR(grossAmount)}`,               color:'var(--accent)',         fs:16 },
//                 { label:'− Labour / Hamali',     sub:`₹${labour||20} × ${bags} bags`,  val:`− ₹ ${fmtINR(labourAmt)}`,              color:'var(--red)',            fs:15 },
//                 { label:'− Other Charges', sub:`8% of ₹${fmtINR(grossAmount)}`, val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
//                 { label:'Net Amount',            sub:'Gross − Labour − Commission',     val:`₹ ${fmtINR(netPayable)}`,               color:'var(--blue)',           fs:16, highlight:true },
//                 { label:'− Advance Already Paid',sub:'',                               val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`, color:'var(--text-secondary)', fs:15 },
//               ].map((row, i)=>(
//                 <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
//                   <div>
//                     <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
//                     {row.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
//                   </div>
//                   <div style={{ fontSize:row.fs, fontWeight:800, color:row.color, fontFamily:'var(--font-display)' }}>{row.val}</div>
//                 </div>
//               ))}
//               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px', background:finalPay>=0?'var(--green-dim)':'var(--red-dim)' }}>
//                 <div>
//                   <div style={{ fontSize:15, fontWeight:800, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
//                     {finalPay >= 0 ? '✅ Final Amount to Pay Seller' : '⚠️ Seller Owes Back'}
//                   </div>
//                   <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Net − Advance</div>
//                 </div>
//                 <div style={{ fontSize:24, fontWeight:900, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
//                   ₹ {fmtINR(Math.abs(finalPay))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
//           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
//           <button className="btn btn-primary" onClick={save} disabled={saving}>
//             <Check size={15}/> {saving?'Saving...':'Save Changes'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Checkbox style ───────────────────────────────────────────
// const cbStyle = (checked) => ({
//   width: 17, height: 17, borderRadius: 4, border: `2px solid ${checked ? '#1a56db' : 'var(--border)'}`,
//   background: checked ? '#1a56db' : 'transparent', cursor: 'pointer', display: 'flex',
//   alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s',
// });

// // ─── Main ─────────────────────────────────────────────────────
// export default function SellerList() {
//   const [sellers,  setSellers]  = useState([]);
//   const [loading,  setLoading]  = useState(true);
//   const [search,   setSearch]   = useState('');
//   const [fDate,    setFDate]    = useState(todayISO());
//   const [fMat,     setFMat]     = useState('');
//   const [bill,     setBill]     = useState(null);
//   const [editing,  setEditing]  = useState(null);
//   const [confirm,  setConfirm]  = useState(null);
//   const [selected, setSelected] = useState(new Set());

//   const load = useCallback(async () => {
//     setLoading(true);
//     setSelected(new Set());
//     try {
//       const res = await API.get('/api/sellers', { params: fDate ? { date: fDate } : {} });
//       const sorted = [...(res.data.data || [])].sort(
//         (a, b) => (parseInt(a.serial_number) || 0) - (parseInt(b.serial_number) || 0)
//       );
//       setSellers(sorted);
//     } catch(err) { toast.error(err.message||'Load failed'); }
//     finally { setLoading(false); }
//   }, [fDate]);

//   useEffect(() => { load(); }, [load]);

//   const del = (id, name) => setConfirm({
//     title: 'Delete Seller?',
//     message: `"${name}" will be permanently removed.`,
//     onConfirm: async () => {
//       try { await API.delete(`/api/sellers/${id}`); toast.success('Deleted'); load(); }
//       catch(err) { toast.error(err.message||'Failed'); }
//     }
//   });

//   const clear = () => { setSearch(''); setFDate(todayISO()); setFMat(''); };

//   const list = sellers.filter(s => {
//     const q = search.toLowerCase();
//     return (!q || [s.name,s.mobile,s.lot_number,s.serial_number,s.material].some(v=>v?.toLowerCase().includes(q)))
//       && (!fMat || s.material===fMat);
//   });

//   const allIds       = list.map(s => s.id);
//   const allSelected  = allIds.length > 0 && allIds.every(id => selected.has(id));
//   const someSelected = allIds.some(id => selected.has(id));
//   const selectedCount = allIds.filter(id => selected.has(id)).length;

//   const toggleAll = () => {
//     if (allSelected) {
//       setSelected(prev => { const next = new Set(prev); allIds.forEach(id => next.delete(id)); return next; });
//     } else {
//       setSelected(prev => { const next = new Set(prev); allIds.forEach(id => next.add(id)); return next; });
//     }
//   };

//   const toggleOne = (id) => {
//     setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
//   };

//   const printSelected = () => {
//     const toprint = list.filter(s => selected.has(s.id));
//     if (toprint.length === 0) { toast.error('Select at least one seller'); return; }
//     printMultipleBills(toprint);
//   };

//   const tot = list.reduce((a,s)=>({
//     bags: a.bags+Number(s.num_bags||0), wt: a.wt+Number(s.weight||0),
//     adv:  a.adv+Number(s.advance_amount||0), amt: a.amt+Number(s.amount||0),
//   }),{ bags:0, wt:0, adv:0, amt:0 });

//   return (
//     <div>
//       <div className="page-header">
//         <div>
//           <div className="page-title">Seller List</div>
//           <div className="page-subtitle">
//             {loading ? 'Loading...' : `${sellers.length} sellers${fDate ? ` for ${fDate}` : ''}`}
//           </div>
//         </div>
//         <div style={{ display:'flex', gap:8, alignItems:'center' }}>
//           {selectedCount > 0 && (
//             <button
//               className="btn btn-primary"
//               onClick={printSelected}
//               style={{ display:'flex', alignItems:'center', gap:6, background:'#1a56db', color:'#fff', fontWeight:700, fontSize:13, padding:'7px 15px', borderRadius:8, border:'none', cursor:'pointer' }}
//             >
//               <Printer size={14}/>
//               Print {selectedCount} Bill{selectedCount > 1 ? 's' : ''}
//             </button>
//           )}
//           <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
//         </div>
//       </div>

//       <div className="filter-bar">
//         <div className="search-box" style={{ flex:2 }}>
//           <Search className="search-icon" size={16}/>
//           <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, lot no..." style={{ textTransform:'none' }}/>
//         </div>
//         <input className="form-input" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{ textTransform:'none', flex:1 }}/>
//         <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())} title="Today">Today</button>
//         <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')} title="All dates">All</button>
//         <select className="form-select" value={fMat} onChange={e=>setFMat(e.target.value)} style={{ flex:1 }}>
//           <option value="">All Materials</option>
//           {MATERIALS.map(m=><option key={m}>{m}</option>)}
//         </select>
//         {(search||fMat)&&<button className="btn btn-secondary" onClick={clear}><X size={14}/> Clear</button>}
//       </div>

//       {list.length>0&&(
//         <div style={{ display:'flex', gap:12, marginBottom:16 }}>
//           {[['Sellers',list.length,'var(--accent)'],['Bags',tot.bags,'var(--green)'],
//             ['Weight',fmtNum(tot.wt)+' kg','var(--blue)'],['Amount','₹ '+fmtINR(tot.amt),'var(--purple)'],
//             ['Advance','₹ '+fmtINR(tot.adv),'var(--text-secondary)']
//           ].map(([l,v,c])=>(
//             <div key={l} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
//               <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{l}</div>
//               <div style={{ fontSize:15, fontWeight:800, color:c, fontFamily:'var(--font-display)' }}>{v}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="table-wrapper">
//         {loading?<div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading...</div>
//         :list.length===0?(
//           <div className="empty-state">
//             <div className="empty-state-icon">👨‍🌾</div>
//             <h3>{fDate ? `No sellers registered for ${fDate}` : 'No sellers found'}</h3>
//             <p style={{ fontSize:12, marginTop:6, color:'var(--text-muted)' }}>
//               {fDate ? 'Click "All" to see all sellers, or change the date' : 'Register a seller to get started'}
//             </p>
//             {fDate && (
//               <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'center' }}>
//                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate('')}>Show All Sellers</button>
//                 <button className="btn btn-secondary btn-sm" onClick={() => setFDate(todayISO())}>Today</button>
//               </div>
//             )}
//           </div>
//         ):(
//           <table>
//             <thead>
//               <tr>
//                 <th style={{ width:36, textAlign:'center', padding:'10px 8px' }}>
//                   <div
//                     onClick={toggleAll}
//                     style={{ ...cbStyle(allSelected), margin:'0 auto', opacity: someSelected && !allSelected ? 0.6 : 1 }}
//                     title={allSelected ? 'Deselect all' : 'Select all'}
//                   >
//                     {(allSelected || someSelected) && <Check size={11} color="#fff" strokeWidth={3}/>}
//                   </div>
//                 </th>
//                 <th>#</th><th>Sr</th><th>Name</th><th>Mobile</th><th>Material</th>
//                 <th>Bags</th><th>Lot</th><th>Weight</th><th>Amount</th><th>Advance</th><th>Balance</th><th>Date</th>
//                 <th style={{ textAlign:'center' }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {list.map((s,i)=>{
//                 const bal=(s.amount||0)-(s.advance_amount||0);
//                 const isChecked = selected.has(s.id);
//                 let bags=[]; try{bags=JSON.parse(s.bag_data||'[]')}catch{}
//                 const rd=bags.filter(b=>Number(b.rate)>0).length;
//                 return(
//                   <tr key={s.id} style={{ background: isChecked ? 'rgba(26,86,219,0.06)' : undefined }}>
//                     <td style={{ textAlign:'center', padding:'10px 8px' }}>
//                       <div onClick={() => toggleOne(s.id)} style={{ ...cbStyle(isChecked), margin:'0 auto' }}>
//                         {isChecked && <Check size={11} color="#fff" strokeWidth={3}/>}
//                       </div>
//                     </td>
//                     <td className="td-muted" style={{ fontSize:12 }}>{i+1}</td>
//                     <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
//                     <td style={{ fontWeight:600 }}>{s.name}</td>
//                     <td className="td-muted">{s.mobile&&s.mobile!=='0000000000'?s.mobile:'—'}</td>
//                     <td>{s.material&&s.material!=='GENERAL'
//                       ?<span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
//                       :<span className="td-muted">—</span>}
//                     </td>
//                     <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
//                     <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
//                     <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
//                     <td style={{ fontWeight:700, color:'var(--accent)' }}>
//                       {s.amount?`₹${fmtINR(s.amount)}`:<span style={{ fontSize:11, color:'var(--text-muted)' }}>{rd}/{bags.length} rates</span>}
//                     </td>
//                     <td className="td-muted">{s.advance_amount?`₹${fmtINR(s.advance_amount)}`:'—'}</td>
//                     <td style={{ fontWeight:600, color:bal>0?'var(--red)':'var(--green)' }}>{s.amount?`₹${fmtINR(bal)}`:'—'}</td>
//                     <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
//                     <td>
//                       <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
//                         <button className="btn btn-blue btn-sm" onClick={()=>setEditing(s)} title="Edit"><Edit2 size={13}/></button>
//                         <button className="btn btn-green btn-sm" onClick={()=>setBill(s)} title="Bill"><Eye size={13}/></button>
//                         <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={()=>setBill(s)} title="Print"><Printer size={13}/></button>
//                         <button className="btn btn-red btn-sm" onClick={()=>del(s.id,s.name)} title="Delete"><Trash2 size={13}/></button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//             {list.length>1&&(
//               <tfoot>
//                 <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
//                   <td colSpan={6} style={{ padding:'11px 15px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({list.length})</td>
//                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{tot.bags}</td>
//                   <td/>
//                   <td style={{ padding:'11px 15px', fontWeight:800 }}>{fmtNum(tot.wt)}</td>
//                   <td style={{ padding:'11px 15px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(tot.amt)}</td>
//                   <td style={{ padding:'11px 15px', fontWeight:700 }}>₹{fmtINR(tot.adv)}</td>
//                   <td style={{ padding:'11px 15px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(tot.amt-tot.adv)}</td>
//                   <td colSpan={2}/>
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         )}
//       </div>

//       {bill    && <BillModal  seller={bill}    onClose={()=>setBill(null)}/>}
//       {editing && <EditModal  seller={editing} onClose={()=>setEditing(null)} onSave={load}/>}
//       {confirm && <ConfirmDialog {...confirm}  onClose={()=>setConfirm(null)}/>}

//       <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>
//     </div>
//   );
// }




// ---------------------------------------------------------------------------------------



import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package, CheckSquare } from 'lucide-react';
import axios from 'axios';
import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
import ConfirmDialog from '../ConfirmDialog';

const API = axios.create({ baseURL: 'http://localhost:5000' });

const todayISO = () => new Date().toISOString().split('T')[0];

// ─── Parse bag_data ───────────────────────────────────────────
function getBags(seller) {
  const num = parseInt(seller.num_bags) || 0;
  const lot = seller.lot_number || `${seller.serial_number}/${num}`;
  let raw = [];
  try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
  return Array.from({ length: num }, (_, i) => {
    const b = raw[i] || {};
    return {
      lot,
      weight: Number(b.weight) > 0 ? String(b.weight) : '',
      rate:   Number(b.rate)   > 0 ? String(b.rate)   : '',
      amount: Number(b.amount) > 0 ? String(b.amount) : '',
      buyer:  b.buyer || '',
    };
  });
}

const isGroupedSellerMaterial = (material) => ['GINGER', 'ONION'].includes(material);
const usesGroupLabour = () => false;
const materialTitle = (material) =>
  material ? material.charAt(0) + material.slice(1).toLowerCase() : 'Grouped';

// ─── Reconstruct ginger groups from bag_data ──────────────────
// Consecutive entries with the same per-bag weight → same group
function getGingerGroups(seller) {
  const lot = seller.lot_number || `${seller.serial_number}/${parseInt(seller.num_bags)||0}`;
  let raw = [];
  try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
  if (raw.length === 0) return [{ lot, bags: parseInt(seller.num_bags)||0, weight: '', rate: '', amount: '', buyer: '', rateMode: 'PER_100KG' }];

  const groups = [];
  let cur = null;
  raw.forEach(bag => {
    const w = Number(bag.weight);
    const rateMode = bag.rate_mode || bag.rateMode || 'PER_100KG';
    if (
      !cur ||
      Math.abs(w - cur._perBag) > 0.00001 ||
      cur.rateMode !== rateMode ||
      Number(cur.rate) !== Number(bag.rate) ||
      (cur.buyer || '') !== (bag.buyer || '')
    ) {
      cur = { _perBag: w, _sumW: w, bags: 1, rate: bag.rate, buyer: bag.buyer || '', lot, rateMode };
      groups.push(cur);
    } else {
      cur.bags++;
      cur._sumW += w;
    }
  });

  return groups.map(g => {
    const totalW = parseFloat(g._sumW.toFixed(4));
    const rt     = Number(g.rate) > 0 ? String(g.rate) : '';
    const amt    = rt
      ? String(Math.round(g.rateMode === 'PER_BAG' ? g.bags * parseFloat(rt) : totalW * parseFloat(rt) / 100))
      : '';
    return { lot: g.lot, bags: g.bags, weight: totalW > 0 ? String(totalW) : '', rate: rt, amount: amt, buyer: g.buyer, rateMode: g.rateMode };
  });
}

// ─── Number to Indian Words ───────────────────────────────────
function getSellerBillRows(seller) {
  const totalBags = parseInt(seller.num_bags) || 0;
  const material = seller.material && seller.material !== 'GENERAL' ? seller.material : 'TAMARIND';

  if (isGroupedSellerMaterial(seller.material)) {
    return getGingerGroups(seller).map((g, i) => ({
      srno: String(i + 1),
      material,
      lot: g.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
      bags: parseInt(g.bags) || 0,
      weight: Number(g.weight) > 0 ? Number(g.weight) : null,
      rate: Number(g.rate) > 0 ? Number(g.rate) : null,
      amount: Number(g.amount) > 0 ? Number(g.amount) : null,
    }));
  }

  let rawBags = [];
  try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

  return Array.from({ length: totalBags }, (_, i) => {
    const b = rawBags[i] || {};
    return {
      srno: String(i + 1),
      material,
      lot: b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
      bags: 1,
      weight: Number(b.weight) > 0 ? Number(b.weight) : null,
      rate: Number(b.rate) > 0 ? Number(b.rate) : null,
      amount: Number(b.amount) > 0 ? Number(b.amount) : null,
    };
  });
}

function toIndianWords(amount) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function conv(n) {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
    if (n < 1000) return ones[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' '+conv(n%100) : '');
    if (n < 100000) return conv(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' '+conv(n%1000) : '');
    if (n < 10000000) return conv(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' '+conv(n%100000) : '');
    return conv(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' '+conv(n%10000000) : '');
  }
  const intPart = Math.floor(Math.abs(amount));
  const decPart = Math.round((Math.abs(amount) - intPart) * 100);
  let words = conv(intPart) + ' Rupees';
  if (decPart > 0) words += ' and ' + conv(decPart) + ' Paise';
  return words || 'Zero Rupees';
}

// const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const inr = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');

// ─── Build single bill HTML — A5 optimised ───────────────────
// function buildBillHTML(seller) {
//   const totalBags = parseInt(seller.num_bags) || 0;
//   let rawBags = [];
//   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

//   const bagRows = Array.from({ length: totalBags }, (_, i) => {
//     const b = rawBags[i] || {};
//     return {
//       srno:     String(i + 1).padStart(2, '0'),
//       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
//       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
//       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
//       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
//       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
//     };
//   });

//   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
//   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
//   const labourAmt   = 20 * totalBags;
//   const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
//   const advance     = parseFloat(seller.advance_amount) || 0;
//   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

//   const bagRowsHtml = bagRows.map((b, i) => `
//     <tr style="background:${i%2===0?'#fff':'#eff6ff'}">
//       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;">${b.srno}</td>
//       <td style="border:1px solid #b8cef0;padding:1px 3px;text-align:left;font-size:7px;font-weight:700;">${b.material}</td>
//       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:6.5px;font-family:monospace;">${b.lot}</td>
//       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;">1</td>
//       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;font-weight:700;color:#1e40af;">${b.weight != null ? b.weight : '—'}</td>
//       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;font-weight:700;color:#166534;">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
//       <td style="border:1px solid #b8cef0;padding:1px 3px;text-align:right;font-size:7px;font-weight:700;color:#1a56db;">${b.amount != null ? inr(b.amount) : '—'}</td>
//     </tr>`).join('');

//   const html = `
// <div style="width:100%;font-family:Arial,sans-serif;font-size:7px;color:#111;background:#fff;
//   line-height:1.25;border:1.5px solid #1a56db;border-radius:2px;padding:4px 5px;
//   box-sizing:border-box;position:relative;">

//   <div style="position:absolute;top:2px;left:2px;right:2px;bottom:2px;
//     border:0.5px solid #a0bbf0;border-radius:1px;pointer-events:none;"></div>

//   <!-- HEADER -->
//   <div style="text-align:center;border-bottom:1.5px double #1a56db;padding-bottom:3px;margin-bottom:3px;">
//     <div style="display:flex;justify-content:space-between;align-items:center;font-size:6.5px;color:#444;margin-bottom:2px;">
//       <span style="text-align:left;line-height:1.4;"><br></span>
//       <div style="width:22px;height:22px;border-radius:50%;border:1.5px solid #1a56db;
//         display:inline-flex;align-items:center;justify-content:center;
//         font-weight:900;font-size:8px;color:#1a56db;background:#eff6ff;flex-shrink:0;">PH</div>
//       <span style="text-align:right;line-height:1.4;"><br></span>
//     </div>
//     <div style="font-size:12px;font-weight:900;color:#1a1a1a;line-height:1;margin:1px 0;">SELLERS BILL</div>
//     <div style="margin:1px 0;">
//       <span style="display:inline-block;background:#1a56db;color:#fff;font-size:6px;font-weight:700;
//         letter-spacing:0.6px;padding:1px 6px;border-radius:1px;">
        
//       </span>
//     </div>
//     <div style="font-size:7px;font-weight:700;color:#333;"></div>
//     <div style="font-size:6px;color:#666;margin-top:1px;"></div>
//   </div>

//   <!-- META -->
//   <div style="border:1px solid #1a56db;border-radius:2px;margin-bottom:3px;overflow:hidden;">
//     <div style="display:flex;justify-content:space-between;padding:2px 5px;font-size:7.5px;border-bottom:1px solid #cfe2ff;">
//       <span><strong style="color:#1a56db">Bill No:</strong> ${seller.serial_number || '—'}</span>
//       <span><strong style="color:#1a56db">Date:</strong> ${fmtDate(seller.entry_date)}</span>
//     </div>
//     <div style="padding:2px 5px;font-size:7.5px;">
//       <strong style="color:#1a56db">Cust. Name:</strong> ${seller.name}
//     </div>
//   </div>

//   <!-- ITEMS TABLE -->
//   <table style="width:100%;border-collapse:collapse;margin-bottom:1px;table-layout:fixed;">
//     <colgroup>
//       <col style="width:6%">
//       <col style="width:18%">
//       <col style="width:12%">
//       <col style="width:6%">
//       <col style="width:13%">
//       <col style="width:13%">
//       <col style="width:32%">
//     </colgroup>
//     <thead>
//       <tr>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Sr.</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Particular</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Lot No.</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Bags</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Wt.(KG)</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">RATE</th>
//         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Amount (&#8377;)</th>
//       </tr>
//     </thead>
//     <tbody>${bagRowsHtml}</tbody>
//     <tfoot>
//       <tr style="background:#dbeafe;border-top:1.5px solid #1a56db;">
//         <td colspan="3" style="border:1px solid #b8cef0;padding:2px 3px;font-weight:800;color:#1e40af;text-align:left;font-size:7px;">TOTAL</td>
//         <td style="border:1px solid #b8cef0;padding:2px 1px;text-align:center;font-weight:800;font-size:7px;">${totalBags}</td>
//         <td style="border:1px solid #b8cef0;padding:2px 1px;text-align:center;font-weight:800;color:#1e40af;font-size:7px;">${totalWeight.toFixed(2)}</td>
//         <td style="border:1px solid #b8cef0;padding:2px 1px;text-align:right;font-size:6.5px;color:#1e40af;font-weight:600;">Gross</td>
//         <td style="border:1px solid #b8cef0;padding:2px 3px;text-align:right;font-weight:800;color:#1a56db;font-size:9px;">&#8377; ${inr(grossAmount)}</td>
//       </tr>
//     </tfoot>
//   </table>

//   <!-- DEDUCTIONS -->
//   <table style="width:100%;border-collapse:collapse;margin-top:1px;table-layout:fixed;">
//     <colgroup><col style="width:62%"><col style="width:38%"></colgroup>
//     <tbody>
//       <tr>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7px;">Other Charges </td>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;text-align:right;font-weight:700;color:#dc2626;font-size:7.5px;">− &#8377; ${inr(commission)}</td>
//       </tr>
//       <tr>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7px;">Hamali / Labour Charges</td>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;text-align:right;font-weight:700;color:#dc2626;font-size:7.5px;">− &#8377; ${inr(labourAmt)}</td>
//       </tr>
//       <tr>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7px;">Advance Paid</td>
//         <td style="border:1px solid #b8cef0;padding:2px 5px;text-align:right;font-weight:700;color:#dc2626;font-size:7.5px;">− &#8377; ${inr(advance)}</td>
//       </tr>
//       <tr style="background:#1a56db;">
//         <td style="padding:5px 7px;color:#fff;font-weight:900;font-size:10px;">NET AMOUNT</td>
//         <td style="padding:5px 7px;color:#fff;font-weight:900;font-size:12px;text-align:right;">&#8377; ${inr(Math.max(0, finalPay))}</td>
//       </tr>
//     </tbody>
//   </table>

//   <!-- IN WORDS -->
//   <div style="border:1px solid #1a56db;border-radius:2px;padding:2px 5px;font-size:7px;margin-top:3px;background:#f8fbff;line-height:1.4;">
//     <strong style="color:#1a56db;">In Words:</strong> ${toIndianWords(Math.max(0, finalPay))} Only
//   </div>
//   <div style="text-align:right;font-size:6.5px;color:#888;margin-top:1px;font-style:italic;">(E.&amp;O.E.)</div>

//   <!-- FOOTER -->
//   <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:8px;">
//     <div style="text-align:center;border-top:1px solid #555;padding-top:2px;font-size:7px;width:80px;color:#444;">Receiver's Sign.</div>
//     <div style="font-weight:800;font-size:7.5px;">For – Mr. Praveen Heggani</div>
//   </div>
// </div>`;

//   return { html, finalPay };
// }


function buildBillHTML(seller) {
  const bagRows = getSellerBillRows(seller);
  const totalBags = bagRows.reduce((s, b) => s + (Number(b.bags) || 0), 0);
  const labourUnits = totalBags;
 
  const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
  const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
  // const labourAmt   = 20 * totalBags;
  // const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
  // const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
  // const advance     = parseFloat(seller.advance_amount) || 0;
  // const finalPay    = parseFloat((netAmount - advance).toFixed(2));

  const labourRate  = Number(seller.labour_rate || 20);
  const labourAmt   = labourRate * labourUnits;
  const commission  = Math.round(grossAmount * 8 / 100);
  const netAmount   = Math.round(grossAmount - labourAmt - commission);
  const advance     = Math.round(parseFloat(seller.advance_amount) || 0);
  const finalPay    = Math.round(netAmount - advance);
 
  const bagRowsHtml = bagRows.map((b, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#eff6ff'};">
      <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:10px;">${b.srno}</td>
      <td style="border:1px solid #b8cef0;padding:4px 5px;text-align:left;font-size:10px;font-weight:700;">${b.material}</td>
      <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:9.5px;font-family:monospace;">${b.lot}</td>
      <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:10px;">${b.bags || 1}</td>
      <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:10px;font-weight:700;color:#1e40af;">${b.weight != null ? b.weight : '—'}</td>
      <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:10px;font-weight:700;color:#166534;">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
      <td style="border:1px solid #b8cef0;padding:4px 5px;text-align:right;font-size:10px;font-weight:700;color:#1e40af;">${b.amount != null ? inr(b.amount) : '—'}</td>
    </tr>`).join('');

  const html = `
<div style="width:100%;font-family:Arial,sans-serif;font-size:10px;color:#111;
  background:#fff;line-height:1.35;border:2px solid #93c5fd;border-radius:3px;
  padding:6px 8px;box-sizing:border-box;">

  <!-- HEADER -->
  <div style="text-align:center;border-bottom:2px double #93c5fd;padding-bottom:5px;">
    <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:3px;">
      
    </div>
    <div style="font-size:17px;font-weight:900;color:#1a1a1a;line-height:1;letter-spacing:0.5px;">SELLERS BILL</div>
    <div style="margin:3px 0;">
      <span style="display:inline-block;background:#dbeafe;color:#1e3a8a;font-size:8px;font-weight:700;
        letter-spacing:1px;padding:2px 10px;border-radius:2px;">
      </span>
    </div>
    <div style="font-size:9.5px;font-weight:700;color:#333;margin-top:1px;"></div>
    <div style="font-size:8.5px;color:#555;margin-top:1px;"></div>
  </div>

  <!-- META ROW -->
  <div style="border:1px solid #93c5fd;border-radius:3px;overflow:hidden;">
    <div style="display:flex;justify-content:space-between;padding:4px 8px;font-size:10.5px;border-bottom:1px solid #cfe2ff;background:#f0f6ff;">
      <span><strong style="color:#1e40af;">Bill No:</strong> ${seller.serial_number || '—'}</span>
      <span><strong style="color:#1e40af;">Date:</strong> ${fmtDate(seller.entry_date)}</span>
    </div>
    <div style="padding:4px 8px;font-size:10.5px;">
      <strong style="color:#1e40af;">Cust. Name:</strong> ${seller.name}
    </div>
  </div>

  <!-- ITEMS TABLE -->
  <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:4px;">
    <colgroup>
      <col style="width:6%">
      <col style="width:19%">
      <col style="width:13%">
      <col style="width:6%">
      <col style="width:13%">
      <col style="width:13%">
      <col style="width:30%">
    </colgroup>
    <thead>
      <tr>
        <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Sr.</th>
        <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Particular</th>
        <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Lot No.</th>
        <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Bags</th>
        <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Wt.(KG)</th>
        <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">RATE</th>
        <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Amount (&#8377;)</th>
      </tr>
    </thead>
    <tbody>
      ${bagRowsHtml}
      <tr style="background:#f0f7ff;border-top:1.5px solid #93c5fd;page-break-inside:avoid;">
        <td colspan="3" style="border:1px solid #b8cef0;padding:4px 5px;font-weight:800;color:#1e40af;text-align:left;font-size:10px;">TOTAL</td>
        <td style="border:1px solid #b8cef0;padding:4px 2px;text-align:center;font-weight:800;font-size:10px;">${totalBags}</td>
        <td style="border:1px solid #b8cef0;padding:4px 2px;text-align:center;font-weight:800;color:#1e40af;font-size:10px;">${totalWeight.toFixed(2)}</td>
        <td style="border:1px solid #b8cef0;padding:4px 2px;text-align:right;font-size:9px;color:#1e40af;font-weight:600;">Gross</td>
        <td style="border:1px solid #b8cef0;padding:4px 5px;text-align:right;font-weight:800;color:#1e40af;font-size:12px;">&#8377; ${inr(grossAmount)}</td>
      </tr>
    </tbody>
  </table>

  <!-- DEDUCTIONS + FOOTER: kept together, won't split across pages -->
  <div class="bill-summary" style="page-break-inside:avoid;">
  <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:4px;">
    <colgroup><col style="width:62%"><col style="width:38%"></colgroup>
    <tbody>
      <tr>
        <td style="border:1px solid #b8cef0;padding:4px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Other Charges</td>
        <td style="border:1px solid #b8cef0;padding:4px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:10.5px;">− &#8377; ${inr(commission)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #b8cef0;padding:4px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Hamali / Labour Charges${usesGroupLabour(seller.material) ? '' : ` (₹ ${inr(labourRate)} × ${totalBags})`}</td>
        <td style="border:1px solid #b8cef0;padding:4px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:10.5px;">− &#8377; ${inr(labourAmt)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #b8cef0;padding:4px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Advance Paid</td>
        <td style="border:1px solid #b8cef0;padding:4px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:10.5px;">− &#8377; ${inr(advance)}</td>
      </tr>
      <tr style="background:#dbeafe;">
        <td style="padding:7px 10px;color:#1e3a8a;font-weight:900;font-size:13px;">NET AMOUNT</td>
        <td style="padding:7px 10px;color:#1e3a8a;font-weight:900;font-size:15px;text-align:right;">&#8377; ${inr(Math.max(0, finalPay))}</td>
      </tr>
    </tbody>
  </table>

  <!-- IN WORDS -->
  <div style="border:1px solid #93c5fd;border-radius:3px;padding:4px 8px;font-size:9.5px;background:#f8fbff;line-height:1.5;margin-top:4px;">
    <strong style="color:#1e40af;">In Words:</strong> ${toIndianWords(Math.max(0, finalPay))} Only
  </div>
  <div style="text-align:right;font-size:8.5px;color:#888;font-style:italic;margin-top:2px;">(E.&amp;O.E.)</div>

  <!-- FOOTER -->
  <div style="display:flex;justify-content:space-between;align-items:flex-end;padding-top:10px;">
    <div style="text-align:center;border-top:1px solid #555;padding-top:3px;font-size:9.5px;width:90px;color:#444;">Receiver's Sign.</div>
    <div style="font-weight:800;font-size:10px;"></div>
  </div>
  </div>
</div>`;
 
  return { html, finalPay };
}

// ─── Print HTML helper ────────────────────────────────────────
function openPrintWindow(fullHtml) {
  if (window.electronAPI && window.electronAPI.printHTML) {
    window.electronAPI.printHTML(fullHtml);
  } else {
    const w = window.open('', '_blank', 'width=900,height=750');
    if (w && w.document) { w.document.write(fullHtml); w.document.close(); }
  }
}

// ─── Wrap bills in full A5 print page ────────────────────────
// function wrapInPrintPage(billsHtml, title) {
//   return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>${title}</title>
//   <style>
//     @page {
//       size: A5 portrait;
//       margin: 3mm;
//     }
//     *, *::before, *::after {
//       box-sizing: border-box;
//       margin: 0;
//       padding: 0;
//     }
//     html, body {
//       width: 100%;
//       background: #fff;
//       font-family: Arial, sans-serif;
//     }
//     body {
//       display: flex;
//       flex-direction: column;
//       align-items: center;
//     }
//     .bill-page {
//       width: 142mm;
//       max-width: 142mm;
//       page-break-after: always;
//     }
//     .bill-page:last-child {
//       page-break-after: avoid;
//     }
//     @media print {
//       body {
//         -webkit-print-color-adjust: exact;
//         print-color-adjust: exact;
//       }
//     }
//   </style>
// </head>
// <body>
// ${billsHtml}
// <script>window.onload = function(){ window.print(); }<\/script>
// </body>
// </html>`;
// }


function wrapInPrintPage(billsHtml, title) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A5 portrait;
      margin: 8mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 100%;
      background: #fff;
      font-family: Arial, sans-serif;
    }
    .bill-page {
      width: 100%;
      page-break-after: always;
    }
    .bill-page:last-child {
      page-break-after: avoid;
    }
    table { border-collapse: collapse; width: 100%; table-layout: fixed; }
    thead { display: table-header-group; }
    tbody tr { page-break-inside: avoid; }
    .bill-summary { page-break-inside: avoid; }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
${billsHtml}
<script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`;
}

// ─── Bulk print all selected sellers ─────────────────────────
function printMultipleBills(sellers) {
  const billsHtml = sellers
    .map(s => `<div class="bill-page">${buildBillHTML(s).html}</div>`)
    .join('\n');
  openPrintWindow(wrapInPrintPage(billsHtml, `Bills — ${sellers.length} Sellers`));
}

// ─── Bill Modal ───────────────────────────────────────────────
export function BillModal({ seller, onClose }) {

  const bagRows = getSellerBillRows(seller);
  const totalBags = bagRows.reduce((s, b) => s + (Number(b.bags) || 0), 0);
  const labourUnits = totalBags;

  const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
  const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
  // const labourAmt   = 20 * totalBags;
  // const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
  // const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
  // const advance     = parseFloat(seller.advance_amount) || 0;
  // const finalPay    = parseFloat((netAmount - advance).toFixed(2));

  const labourRate  = Number(seller.labour_rate || 20);
  const labourAmt   = labourRate * labourUnits;
  const commission  = Math.round(grossAmount * 8 / 100);
  const netAmount   = Math.round(grossAmount - labourAmt - commission);
  const advance     = Math.round(parseFloat(seller.advance_amount) || 0);
  const finalPay    = Math.round(netAmount - advance);

  const printBill = () => {
    const { html } = buildBillHTML(seller);
    const billsHtml = `<div class="bill-page">${html}</div>`;
    openPrintWindow(wrapInPrintPage(billsHtml, `Bill — ${seller.name}`));
  };

  // preview uses slightly larger sizes for on-screen readability
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:560, width:'95%', padding:0, overflow:'hidden', borderRadius:10 }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:'#dbeafe', color:'#1e3a8a' }}>
          <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={printBill} style={{ background:'#fff', color:'#1e40af', border:'1px solid #93c5fd', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
              <Printer size={13}/> Print / PDF (A5)
            </button>
            <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#1e3a8a', cursor:'pointer' }}><X size={18}/></button>
          </div>
        </div>
        <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f5f8ff' }}>
          <div style={{ all:'initial', display:'block' }}>
            <div style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'2px solid #93c5fd', borderRadius:4, position:'relative' }}>
              <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #dbeafe', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>
              <div style={{ textAlign:'center', borderBottom:'2px double #93c5fd', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
                  <span style={{ textAlign:'left' }}><br/></span>
                  {/* <div style={{ width:40, height:40, borderRadius:'50%', border:'2px solid #93c5fd', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1e40af', background:'#eff6ff' }}>PH</div> */}
                  <span style={{ textAlign:'right' }}><br/></span>
                </div>
                <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>SELLER BILL</div>
                <div><span style={{ display:'inline-block', background:'#dbeafe', color:'#1e3a8a', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}> </span></div>
                <div style={{ fontSize:11, fontWeight:700 }}></div>
                <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}></div>
              </div>
              <div style={{ border:'1px solid #93c5fd', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
                  <span><strong style={{ color:'#1e40af' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
                  <span><strong style={{ color:'#1e40af' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
                </div>
                <div style={{ padding:'4px 8px', fontSize:11 }}>
                  <strong style={{ color:'#1e40af' }}>Cust. Name :</strong> {seller.name}
                </div>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
                <thead>
                  <tr>
                    {['Sr.','Particular','Lot No.','Bags','Weight(KG)','RATE','Amount'].map(h=>(
                      <th key={h} style={{ background:'#dbeafe', color:'#1e3a8a', padding:'5px 4px', fontSize:9.5, fontWeight:700, border:'1px solid #93c5fd', textAlign:'center' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bagRows.map((b,i)=>(
                    <tr key={i} style={{ background: i%2===0?'#fff':'#eff6ff' }}>
                      <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, color:'#111' }}>{b.srno}</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'left', fontSize:10, fontWeight:700, color:'#111' }}>{b.material}</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontFamily:'monospace', color:'#333' }}>{b.lot}</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:600, color:'#111' }}>{b.bags || 1}</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#1e40af' }}>{b.weight!=null?b.weight:'—'}</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#166534' }}>{b.rate!=null?Number(b.rate).toLocaleString('en-IN'):'—'}</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'right', fontSize:10, fontWeight:800, color:'#1e40af' }}>{b.amount!=null?inr(b.amount):'—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background:'#f0f7ff', borderTop:'1.5px solid #93c5fd' }}>
                    <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
                    <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
                    <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#1e40af' }}>{totalWeight.toFixed(2)}</td>
                    <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af' }}>Gross Amt.</td>
                    <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1e40af', fontSize:13 }}>₹ {inr(grossAmount)}</td>
                  </tr>
                </tfoot>
              </table>
              <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
                <tbody>
                  <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Other Charges </td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td></tr>
                  <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges{usesGroupLabour(seller.material) ? '' : ` (₹ ${inr(labourRate)} × ${totalBags})`}</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
                  <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td></tr>
                  <tr style={{ background:'#dbeafe' }}>
                    <td style={{ padding:'9px 10px', color:'#1e3a8a', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
                    <td style={{ padding:'9px 10px', color:'#1e3a8a', fontWeight:900, fontSize:16, textAlign:'right' }}>₹ {inr(Math.max(0, finalPay))}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ border:'1px solid #93c5fd', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
                <strong style={{ color:'#1e40af' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
              </div>
              <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
                <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
                <div style={{ fontWeight:800, fontSize:11 }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────
function EditModal({ seller, onClose, onSave }) {
  const num      = parseInt(seller.num_bags) || 0;
  const lot      = seller.lot_number || (seller.serial_number + '/' + num);
  const isGroupedMaterial = isGroupedSellerMaterial(seller.material);
  const groupedMaterialLabel = materialTitle(seller.material);

  const [rows,       setRows]       = useState(() => isGroupedMaterial ? [] : getBags(seller));
  const [gingerRows, setGingerRows] = useState(() => isGroupedMaterial ? getGingerGroups(seller) : []);
  const [sellerName, setSellerName] = useState(seller.name || '');
  const [nBags,      setNBags]      = useState(String(num));
  const [advance,    setAdvance]    = useState(String(seller.advance_amount || ''));
  const [labour,     setLabour]     = useState(String(seller.labour_rate || 20));
  const [saving,     setSaving]     = useState(false);
  const [buyers,     setBuyers]     = useState([]);

  useEffect(() => {
    API.get('/api/buyers').then(res => {
      setBuyers(res.data.data || []);
    }).catch(() => {});
  }, []);

  const calcGingerAmount = (row) => {
    const bagCount = parseInt(row.bags) || 0;
    const weight = parseFloat(row.weight) || 0;
    const rate = parseFloat(row.rate) || 0;
    if (!rate) return '';
    if (row.rateMode === 'PER_BAG') return bagCount ? String(Math.round(bagCount * rate)) : '';
    return weight ? String(Math.round((weight * rate) / 100)) : '';
  };

  // Redistribute bags across ginger groups given total n
  const redistributeGinger = (groups, n) => {
    const g = groups.length;
    return groups.map((r, i) => {
      const bagCount = Math.floor(n / g) + (i < (n % g) ? 1 : 0);
      const next = { ...r, bags: bagCount };
      return { ...next, amount: calcGingerAmount(next) };
    });
  };

  const changeNBags = (v) => {
    setNBags(v);
    const n = parseInt(v) || 0;
    if (n > 0) {
      if (isGroupedMaterial) {
        setGingerRows(prev => redistributeGinger(prev, n));
      } else {
        setRows(prev => Array.from({ length: n }, (_, i) =>
          prev[i] ? { ...prev[i] } : { lot, weight: '', rate: '', amount: '', buyer: '' }
        ));
      }
    }
  };

  // Regular bag update
  const update = (i, field, val) => {
    setRows(prev => prev.map((r, j) => {
      if (j !== i) return r;
      const next = { ...r, [field]: val };
      if (field === 'weight' || field === 'rate') {
        const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
        const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
        next.amount = w && rt ? String(Math.round((w * rt) / 100)) : '';
      }
      return next;
    }));
  };

  // Ginger group update
  const updateGinger = (i, field, val) => {
    setGingerRows(prev => prev.map((r, j) => {
      if (j !== i) return r;
      const next = { ...r, [field]: val };
      if (['bags', 'weight', 'rate', 'rateMode'].includes(field)) {
        next.amount = calcGingerAmount(next);
      }
      return next;
    }));
  };

  const addGingerRow = () => {
    const n = parseInt(nBags) || 0;
    if (gingerRows.length < n) {
      setGingerRows(prev => {
        const newRows = [...prev, { lot, bags: 0, weight: '', rate: '', amount: '', buyer: '', rateMode: 'PER_100KG' }];
        return redistributeGinger(newRows, n);
      });
    }
  };

  const addGingerPerBagRow = () => {
    const n = parseInt(nBags) || 0;
    if (gingerRows.length < n) {
      setGingerRows(prev => {
        const newRows = [...prev, { lot, bags: 0, weight: '', rate: '', amount: '', buyer: '', rateMode: 'PER_BAG' }];
        return redistributeGinger(newRows, n);
      });
    }
  };

  const removeGingerRow = (idx) => {
    if (gingerRows.length <= 1) return;
    setGingerRows(prev => {
      const newRows = prev.filter((_, i) => i !== idx);
      return redistributeGinger(newRows, parseInt(nBags) || 0);
    });
  };

  const bags        = parseInt(nBags) || 0;
  const totalW      = isGroupedMaterial
    ? gingerRows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0)
    : rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
  const grossAmount = isGroupedMaterial
    ? gingerRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)
    : rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const labourUnits = bags;
  const labourAmt   = (parseFloat(labour) || 0) * labourUnits;
  const commission  = Math.round(grossAmount * 8 / 100);
  const totalDeduct = labourAmt + commission;
  const netPayable  = Math.round(grossAmount - totalDeduct);
  const finalPay    = Math.round(netPayable - (parseFloat(advance) || 0));

  const displayRows = isGroupedMaterial ? gingerRows : rows;
  const ratesDone   = displayRows.filter(r => parseFloat(r.rate)   > 0).length;
  const wtsDone     = displayRows.filter(r => parseFloat(r.weight) > 0).length;

  const iStyle = (val, col) => ({
    background:   val ? col + '11' : 'var(--bg-panel)',
    border:       '1px solid ' + (val ? col + '66' : 'var(--border-light)'),
    borderRadius: 7, padding: '8px 11px',
    color:        val ? col : 'var(--text-muted)',
    fontFamily:   'var(--font-body)', fontSize: 13, fontWeight: 700,
    outline: 'none', width: '100%',
  });

  const buyerOptions = buyers.map(b => {
    const display = (b.lot_number && b.lot_number !== '—') ? b.lot_number : b.name;
    return { value: display, label: display };
  });

  const save = async () => {
    if (isGroupedMaterial) {
      if (gingerRows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all groups'); return; }
    } else {
      if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
    }
    setSaving(true);
    try {
      let bag_data;
      if (isGroupedMaterial) {
        // Expand each group to individual bag entries
        bag_data = [];
        gingerRows.forEach(r => {
          const bagsInGroup  = r.bags || 0;
          const groupW       = parseFloat(r.weight) || 0;
          const rate         = parseFloat(r.rate)   || 0;
          const rateMode     = r.rateMode || 'PER_100KG';
          const weightPerBag = bagsInGroup > 0 ? groupW / bagsInGroup : 0;
          const amtPerBag    = rate > 0
            ? Math.round(rateMode === 'PER_BAG' ? rate : weightPerBag * rate / 100)
            : 0;
          for (let j = 0; j < bagsInGroup; j++) {
            bag_data.push({ lot, weight: weightPerBag, rate, amount: amtPerBag, buyer: r.buyer || '', rate_mode: rateMode });
          }
        });
      } else {
        bag_data = rows.map(r => ({
          lot,
          weight: parseFloat(r.weight) || 0,
          rate:   parseFloat(r.rate)   || 0,
          amount: parseFloat(r.amount) || 0,
          buyer:  r.buyer || '',
        }));
      }

      await API.put('/api/sellers/' + seller.id, {
        name:           sellerName.trim() || seller.name,
        num_bags:       bags,
        weight:         Math.round(totalW * 100) / 100,
        amount:         netPayable,
        advance_amount: parseFloat(advance) || 0,
        labour_rate:    parseFloat(labour) || 0,
        rate_fixed:     totalW > 0 && grossAmount > 0 ? Math.round(grossAmount / totalW * 100) : 0,
        bag_data:       JSON.stringify(bag_data),
      });

      toast.success('Saved! Final payable: ₹' + fmtINR(finalPay));
      onSave(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:960, width:'95%' }} onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">✏️ Edit Seller — {sellerName || seller.name}</div>
          <button className="modal-close" onClick={onClose}><X size={20}/></button>
        </div>

        <div style={{ display:'flex', gap:10, marginBottom:18, flexWrap:'wrap' }}>
          {[['Serial No',seller.serial_number],['Lot No',lot],
            ['Material',seller.material&&seller.material!=='GENERAL'?seller.material:'—'],
            ['Date',fmtDate(seller.entry_date)]
          ].map(([l,v])=>(
            <div key={l} style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, padding:'7px 13px', fontSize:12 }}>
              <div style={{ color:'var(--text-muted)', marginBottom:2 }}>{l}</div>
              <div style={{ fontWeight:700 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr', gap:14, marginBottom:18 }}>
          <div className="form-group">
            <label className="form-label">Seller Name</label>
            <input className="form-input" type="text" value={sellerName} onChange={e=>setSellerName(e.target.value)} placeholder="Seller name" style={{ textTransform:'uppercase' }}/>
          </div>
          <div className="form-group">
            <label className="form-label">Number of Bags</label>
            <input className="form-input" type="number" value={nBags} onChange={e=>changeNBags(e.target.value)} min="1" max="100" style={{ textTransform:'none' }}/>
          </div>
          <div className="form-group">
            <label className="form-label">Advance Paid (₹)</label>
            <input className="form-input" type="number" value={advance} onChange={e=>setAdvance(e.target.value)} placeholder="0.00" step="0.01" style={{ textTransform:'none' }}/>
          </div>
          <div className="form-group">
            <label className="form-label">Labour Rate (₹ per bag)</label>
            <input className="form-input" type="number" value={labour} onChange={e=>setLabour(e.target.value)} placeholder="20" step="1" min="0" style={{ textTransform:'none' }}/>
          </div>
        </div>

        {isGroupedMaterial ? (
          /* ── GINGER: group rows ── */
          gingerRows.length > 0 && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Package size={15} style={{ color:'var(--accent)' }}/>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>{groupedMaterialLabel} Group Details</span>
                  <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>
                    Lot: {lot}
                  </span>
                  <span style={{ fontSize:11, color:wtsDone===gingerRows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
                    {wtsDone}/{gingerRows.length} groups filled
                  </span>
                </div>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>Default rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
              </div>

              {/* Ginger header */}
              <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 150px 110px 30px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
                {['#','Bags','Weight (kg)','Rate (₹)','Buyer','Amount (₹)',''].map(h=>(
                  <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
                ))}
              </div>

              {/* Ginger rows */}
              <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:300, overflowY:'auto' }}>
                {gingerRows.map((r,i)=>(
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 150px 110px 30px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<gingerRows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
                    <div style={{ width:24, height:24, borderRadius:5, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>{i+1}</div>
                    {/* Bags — editable */}
                    <input
                      type="text"
                      inputMode="numeric"
                      value={r.bags ? String(parseInt(r.bags, 10)) : ''}
                      onChange={e => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 2);
                        updateGinger(i, 'bags', digits ? Math.min(parseInt(digits, 10), 99) : '');
                      }}
                      placeholder="bags"
                      maxLength={2}
                      onWheel={e => e.target.blur()}
                      style={{ background:'var(--bg-panel)', border:'1px solid var(--border-light)', borderRadius:6, padding:'6px 8px', color:'var(--text-secondary)', fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, outline:'none', width:'100%', textAlign:'center' }}
                      onFocus={e=>{e.target.style.borderColor='var(--accent)'}}
                      onBlur={e=>{e.target.style.borderColor='var(--border-light)'}}
                    />
                    {/* Weight */}
                    <input type="number" value={r.weight} onChange={e=>updateGinger(i,'weight',e.target.value)}
                      placeholder="Total weight" step="0.01" min="0.01" onWheel={e=>e.target.blur()}
                      style={iStyle(r.weight,'#3b82f6')}
                      onFocus={e=>{e.target.style.borderColor='#3b82f6';e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'}}
                      onBlur={e=>{e.target.style.borderColor=r.weight?'#3b82f666':'var(--border-light)';e.target.style.boxShadow='none'}}
                    />
                    {/* Rate */}
                    <input type="number" value={r.rate} onChange={e=>updateGinger(i,'rate',e.target.value)}
                      placeholder={r.rateMode === 'PER_BAG' ? 'fixed / bag' : 'e.g. 3200 /100kg'} step="0.01" min="0" onWheel={e=>e.target.blur()}
                      style={iStyle(r.rate,'#10b981')}
                      onFocus={e=>{e.target.style.borderColor='#10b981';e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'}}
                      onBlur={e=>{e.target.style.borderColor=r.rate?'#10b98166':'var(--border-light)';e.target.style.boxShadow='none'}}
                    />
                    {/* Buyer */}
                    <select value={r.buyer||''} onChange={e=>updateGinger(i,'buyer',e.target.value)}
                      style={{ background:r.buyer?'rgba(139,92,246,0.1)':'var(--bg-panel)', border:`1px solid ${r.buyer?'rgba(139,92,246,0.5)':'var(--border-light)'}`, borderRadius:7, padding:'8px 10px', color:r.buyer?'#a78bfa':'var(--text-muted)', fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, outline:'none', width:'100%', cursor:'pointer' }}
                    >
                      <option value="">— Select Buyer —</option>
                      {buyerOptions.map((b,idx)=>(
                        <option key={idx} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                    {/* Amount */}
                    <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
                      {r.amount?'₹'+fmtINR(r.amount):'—'}
                    </div>
                    {/* Remove */}
                    {gingerRows.length > 1
                      ? <button type="button" onClick={()=>removeGingerRow(i)} style={{ width:24, height:24, borderRadius:5, border:'1px solid rgba(239,68,68,0.4)', background:'var(--red-dim)', color:'var(--red)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, flexShrink:0 }}>×</button>
                      : <div/>
                    }
                  </div>
                ))}
              </div>

              {/* Add Another Group */}
              {gingerRows.length < bags && (
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                  <button type="button" onClick={addGingerRow}
                    style={{ padding:'7px 16px', background:'var(--accent-dim)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:8, color:'var(--accent)', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                    + Add Another Group
                  </button>
                  <button type="button" onClick={addGingerPerBagRow}
                    style={{ padding:'7px 16px', background:'var(--blue-dim)', border:'1px solid rgba(59,130,246,0.4)', borderRadius:8, color:'var(--blue)', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                    + Add Rate / Bag Group
                  </button>
                </div>
              )}

              {/* Ginger total row */}
              <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 150px 110px 30px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
                <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
                <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
                <div style={{ fontSize:12, color:ratesDone===gingerRows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{gingerRows.length} rates {ratesDone===gingerRows.length?'✓':''}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{gingerRows.filter(r=>r.buyer).length}/{gingerRows.length} buyers assigned</div>
                <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
                <div/>
              </div>
            </>
          )
        ) : (
          /* ── REGULAR: one row per bag ── */
          rows.length > 0 && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Package size={15} style={{ color:'var(--accent)' }}/>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Bag-wise Details</span>
                  <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>Lot: {lot}</span>
                  <span style={{ fontSize:11, color:wtsDone===rows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
                    {wtsDone}/{rows.length} weights
                  </span>
                </div>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
                {['#','Lot','Weight (kg)','Rate (₹/100kg)','Buyer','Amount (₹)'].map(h=>(
                  <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
                ))}
              </div>

              <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:300, overflowY:'auto' }}>
                {rows.map((r,i)=>(
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<rows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
                    <div style={{ width:24, height:24, borderRadius:5, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(245,158,11,0.3)' }}>{i+1}</div>
                    <div style={{ fontSize:12, fontWeight:700, fontFamily:'monospace', color:'var(--text-secondary)' }}>{lot}</div>
                    <input type="number" value={r.weight} onChange={e=>update(i,'weight',e.target.value)}
                      placeholder="Enter weight" step="0.01" min="0.01" onWheel={e=>e.target.blur()}
                      style={iStyle(r.weight,'#3b82f6')}
                      onFocus={e=>{e.target.style.borderColor='#3b82f6';e.target.style.boxShadow='0 0 0 2px rgba(59,130,246,0.2)'}}
                      onBlur={e=>{e.target.style.borderColor=r.weight?'#3b82f666':'var(--border-light)';e.target.style.boxShadow='none'}}
                    />
                    <input type="number" value={r.rate} onChange={e=>update(i,'rate',e.target.value)}
                      placeholder="e.g. 3200" step="0.01" min="0" onWheel={e=>e.target.blur()}
                      style={iStyle(r.rate,'#10b981')}
                      onFocus={e=>{e.target.style.borderColor='#10b981';e.target.style.boxShadow='0 0 0 2px rgba(16,185,129,0.2)'}}
                      onBlur={e=>{e.target.style.borderColor=r.rate?'#10b98166':'var(--border-light)';e.target.style.boxShadow='none'}}
                    />
                    <select value={r.buyer||''} onChange={e=>update(i,'buyer',e.target.value)}
                      style={{ background:r.buyer?'rgba(139,92,246,0.1)':'var(--bg-panel)', border:`1px solid ${r.buyer?'rgba(139,92,246,0.5)':'var(--border-light)'}`, borderRadius:7, padding:'8px 10px', color:r.buyer?'#a78bfa':'var(--text-muted)', fontFamily:'var(--font-body)', fontSize:12, fontWeight:700, outline:'none', width:'100%', cursor:'pointer' }}
                    >
                      <option value="">— Select Buyer —</option>
                      {buyerOptions.map((b,idx)=>(
                        <option key={idx} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                    <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
                      {r.amount?'₹'+fmtINR(r.amount):'—'}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 160px 120px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
                <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
                <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
                <div style={{ fontSize:12, color:ratesDone===rows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{rows.length} rates {ratesDone===rows.length?'✓':''}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>{rows.filter(r=>r.buyer).length}/{rows.length} buyers assigned</div>
                <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
              </div>
            </>
          )
        )}

        {grossAmount > 0 && (
          <div style={{ marginTop:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ background:'var(--bg-panel)', padding:'10px 18px', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>💰 Payment Calculation</span>
            </div>
            <div>
              {[
                { label:'Gross Amount',           sub: isGroupedMaterial ? `${gingerRows.length} group${gingerRows.length>1?'s':''} · ${bags} bags` : `${rows.length} bags × Rate`, val:`₹ ${fmtINR(grossAmount)}`,               color:'var(--accent)',         fs:16 },
                { label:'− Labour / Hamali',      sub:`₹${labour||20} × ${bags} bags`,                                                                                    val:`− ₹ ${fmtINR(labourAmt)}`,              color:'var(--red)',            fs:15 },
                { label:'− Other Charges',        sub:`8% of ₹${fmtINR(grossAmount)}`,                                                                                    val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
                { label:'Net Amount',             sub:'Gross − Labour − Commission',                                                                                       val:`₹ ${fmtINR(netPayable)}`,               color:'var(--blue)',           fs:16, highlight:true },
                { label:'− Advance Already Paid', sub:'',                                                                                                                  val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`, color:'var(--text-secondary)', fs:15 },
              ].map((row,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
                    {row.sub && !(usesGroupLabour(seller.material) && row.label.includes('Labour')) && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
                  </div>
                  <div style={{ fontSize:row.fs, fontWeight:800, color:row.color, fontFamily:'var(--font-display)' }}>{row.val}</div>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px', background:finalPay>=0?'var(--green-dim)':'var(--red-dim)' }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
                    {finalPay>=0?'✅ Final Amount to Pay Seller':'⚠️ Seller Owes Back'}
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Net − Advance</div>
                </div>
                <div style={{ fontSize:24, fontWeight:900, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
                  ₹ {fmtINR(Math.abs(finalPay))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display:'flex', gap:10, marginTop:20, justifyContent:'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <Check size={15}/> {saving?'Saving...':'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Checkbox style ───────────────────────────────────────────
const cbStyle = (checked) => ({
  width:17, height:17, borderRadius:4, border:`2px solid ${checked?'#1a56db':'var(--border)'}`,
  background:checked?'#1a56db':'transparent', cursor:'pointer', display:'flex',
  alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s',
});

// ─── Main ─────────────────────────────────────────────────────
export default function SellerList() {
  const [sellers,  setSellers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [fDate,    setFDate]    = useState(todayISO());
  const [fMat,     setFMat]     = useState('');
  const [bill,     setBill]     = useState(null);
  const [editing,  setEditing]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);
  const [selected, setSelected] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setSelected(new Set());
    try {
      const res = await API.get('/api/sellers', { params: fDate ? { date: fDate } : {} });
      const sorted = [...(res.data.data || [])].sort(
        (a,b) => (parseInt(a.serial_number)||0) - (parseInt(b.serial_number)||0)
      );
      setSellers(sorted);
    } catch(err) { toast.error(err.message||'Load failed'); }
    finally { setLoading(false); }
  }, [fDate]);

  useEffect(() => { load(); }, [load]);

  const del = (id, name) => setConfirm({
    title: 'Delete Seller?',
    message: `"${name}" will be permanently removed.`,
    onConfirm: async () => {
      try { await API.delete(`/api/sellers/${id}`); toast.success('Deleted'); load(); }
      catch(err) { toast.error(err.message||'Failed'); }
    }
  });

  const clear = () => { setSearch(''); setFDate(todayISO()); setFMat(''); };

  const list = sellers.filter(s => {
    const q = search.toLowerCase();
    return (!q || [s.name,s.mobile,s.lot_number,s.serial_number,s.material].some(v=>v?.toLowerCase().includes(q)))
      && (!fMat || s.material===fMat);
  });

  const allIds       = list.map(s => s.id);
  const allSelected  = allIds.length > 0 && allIds.every(id => selected.has(id));
  const someSelected = allIds.some(id => selected.has(id));
  const selectedCount = allIds.filter(id => selected.has(id)).length;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const next = new Set(prev); allIds.forEach(id=>next.delete(id)); return next; });
    } else {
      setSelected(prev => { const next = new Set(prev); allIds.forEach(id=>next.add(id)); return next; });
    }
  };

  const toggleOne = (id) => {
    setSelected(prev => { const next = new Set(prev); next.has(id)?next.delete(id):next.add(id); return next; });
  };

  const printSelected = () => {
    const toprint = list.filter(s => selected.has(s.id));
    if (toprint.length === 0) { toast.error('Select at least one seller'); return; }
    printMultipleBills(toprint);
  };

  const tot = list.reduce((a,s)=>({
    bags: a.bags+Number(s.num_bags||0), wt: a.wt+Number(s.weight||0),
    adv:  a.adv+Number(s.advance_amount||0), amt: a.amt+Number(s.amount||0),
  }),{ bags:0, wt:0, adv:0, amt:0 });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Seller List</div>
          <div className="page-subtitle">
            {loading ? 'Loading...' : `${sellers.length} sellers${fDate ? ` for ${fDate}` : ''}`}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {selectedCount > 0 && (
            <button
              className="btn btn-primary"
              onClick={printSelected}
              style={{ display:'flex', alignItems:'center', gap:6, background:'#1a56db', color:'#fff', fontWeight:700, fontSize:13, padding:'7px 15px', borderRadius:8, border:'none', cursor:'pointer' }}
            >
              <Printer size={14}/>
              Print {selectedCount} Bill{selectedCount>1?'s':''}
            </button>
          )}
          <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{ flex:2 }}>
          <Search className="search-icon" size={16}/>
          <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, lot no..." style={{ textTransform:'none' }}/>
        </div>
        <input className="form-input" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{ textTransform:'none', flex:1 }}/>
        <button className="btn btn-secondary btn-sm" onClick={()=>setFDate(todayISO())}>Today</button>
        <button className="btn btn-secondary btn-sm" onClick={()=>setFDate('')}>All</button>
        <select className="form-select" value={fMat} onChange={e=>setFMat(e.target.value)} style={{ flex:1 }}>
          <option value="">All Materials</option>
          {MATERIALS.map(m=><option key={m}>{m}</option>)}
        </select>
        {(search||fMat)&&<button className="btn btn-secondary" onClick={clear}><X size={14}/> Clear</button>}
      </div>

      {list.length > 0 && (
        <div style={{ display:'flex', gap:12, marginBottom:16 }}>
          {[['Sellers',list.length,'var(--accent)'],['Bags',tot.bags,'var(--green)'],
            ['Weight',fmtNum(tot.wt)+' kg','var(--blue)'],['Amount','₹ '+fmtINR(tot.amt),'var(--purple)'],
            ['Advance','₹ '+fmtINR(tot.adv),'var(--text-secondary)']
          ].map(([l,v,c])=>(
            <div key={l} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 13px' }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:15, fontWeight:800, color:c, fontFamily:'var(--font-display)' }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div className="table-wrapper">
        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading...</div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍🌾</div>
            <h3>{fDate ? `No sellers registered for ${fDate}` : 'No sellers found'}</h3>
            <p style={{ fontSize:12, marginTop:6, color:'var(--text-muted)' }}>
              {fDate ? 'Click "All" to see all sellers, or change the date' : 'Register a seller to get started'}
            </p>
            {fDate && (
              <div style={{ display:'flex', gap:8, marginTop:14, justifyContent:'center' }}>
                <button className="btn btn-secondary btn-sm" onClick={()=>setFDate('')}>Show All Sellers</button>
                <button className="btn btn-secondary btn-sm" onClick={()=>setFDate(todayISO())}>Today</button>
              </div>
            )}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width:36, textAlign:'center', padding:'10px 8px' }}>
                  <div
                    onClick={toggleAll}
                    style={{ ...cbStyle(allSelected), margin:'0 auto', opacity:someSelected&&!allSelected?0.6:1 }}
                    title={allSelected?'Deselect all':'Select all'}
                  >
                    {(allSelected||someSelected) && <Check size={11} color="#fff" strokeWidth={3}/>}
                  </div>
                </th>
                <th>#</th><th>Serial Number</th><th>Name</th><th>Material</th>
                <th>Bags</th><th>Weight(KG)</th><th>Amount(₹)</th><th>Total(₹)</th><th>Date</th>
                <th style={{ textAlign:'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s,i)=>{
                const bal = (s.amount||0) - (s.advance_amount||0);
                const isChecked = selected.has(s.id);
                let bags = []; try { bags = JSON.parse(s.bag_data||'[]'); } catch {}
                const rd = bags.filter(b=>Number(b.rate)>0).length;
                return (
                  <tr key={s.id} style={{ background:isChecked?'rgba(26,86,219,0.06)':undefined, cursor:'pointer' }} onClick={() => setEditing(s)}>
                    <td style={{ textAlign:'center', padding:'10px 8px' }}>
                      <div onClick={e=>{ e.stopPropagation(); toggleOne(s.id); }} style={{ ...cbStyle(isChecked), margin:'0 auto' }}>
                        {isChecked && <Check size={11} color="#fff" strokeWidth={3}/>}
                      </div>
                    </td>
                    <td className="td-muted" style={{ fontSize:12 }}>{i+1}</td>
                    <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
                    <td style={{ fontWeight:600 }}>{s.name||'—'}</td>
                    <td>
                      {s.material&&s.material!=='GENERAL'
                        ? <span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
                        : <span className="td-muted">—</span>}
                    </td>
                    <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
                    <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
                    <td style={{ fontWeight:700, color:'var(--blue)' }}>
                      {s.amount
                        ? `₹${fmtINR(s.amount)}`
                        : <span style={{ fontSize:11, color:'var(--text-muted)' }}>{rd}/{bags.length} rates</span>}
                    </td>
                    <td style={{ fontWeight:600, color:'var(--red)' }}>
                      {s.amount?`₹${fmtINR(bal)}`:'—'}
                    </td>
                    <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
                    <td>
                      <div style={{ display:'flex', gap:5, justifyContent:'center' }} onClick={e=>e.stopPropagation()}>
                        <button className="btn btn-green btn-sm" onClick={()=>setBill(s)} title="View Bill" style={{ display:'flex', alignItems:'center', gap:4 }}><Eye size={13}/> View</button>
                        <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={()=>setBill(s)} title="Print"><Printer size={13}/></button>
                        <button className="btn btn-blue btn-sm" onClick={()=>setEditing(s)} title="Edit"><Edit2 size={13}/></button>
                        <button className="btn btn-red btn-sm" onClick={()=>del(s.id,s.name)} title="Delete"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {list.length > 1 && (
              <tfoot>
                <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
                  <td colSpan={5} style={{ padding:'11px 15px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({list.length})</td>
                  <td style={{ padding:'11px 15px', fontWeight:800 }}>{tot.bags}</td>
                  <td style={{ padding:'11px 15px', fontWeight:800 }}>{fmtNum(tot.wt)}</td>
                  <td style={{ padding:'11px 15px', fontWeight:800, color:'var(--blue)' }}>₹{fmtINR(tot.amt)}</td>
                  <td style={{ padding:'11px 15px', fontWeight:700, color:'var(--red)' }}>₹{fmtINR(tot.amt-tot.adv)}</td>
                  <td colSpan={2}/>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>

      {bill    && <BillModal  seller={bill}    onClose={()=>setBill(null)}/>}
      {editing && <EditModal  seller={editing} onClose={()=>setEditing(null)} onSave={load}/>}
      {confirm && <ConfirmDialog {...confirm}  onClose={()=>setConfirm(null)}/>}
    </div>
  );
}
