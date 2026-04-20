// import React, { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import { Save, RotateCcw, CheckCircle, AlertCircle, Package } from 'lucide-react';
// import { createSeller } from '../api';
// import { MATERIALS, todayISO, toUpper } from '../utils';

// const emptyForm = () => ({
//   serial_number: '',
//   name: '',
//   mobile: '',
//   material: '',
//   num_bags: '',
//   advance_amount: '',
//   entry_date: todayISO(),
// });

// // ✅ OUTSIDE — prevents focus loss on re-render
// function Field({ label, required, error, children }) {
//   return (
//     <div className="form-group">
//       <label className="form-label">
//         {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
//       </label>
//       {children}
//       {error && (
//         <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--red)', marginTop: 3 }}>
//           <AlertCircle size={11} /> {error}
//         </div>
//       )}
//     </div>
//   );
// }

// export default function SellerRegistration() {
//   const [form,       setForm]       = useState(emptyForm());
//   const [bagWeights, setBagWeights] = useState([]); // array of { weight: string }
//   const [loading,    setLoading]    = useState(false);
//   const [lastSaved,  setLastSaved]  = useState(null);
//   const [errors,     setErrors]     = useState({});

//   const numBags  = parseInt(form.num_bags) || 0;
//   const lotLabel = numBags > 0 && form.serial_number
//     ? `${form.serial_number}/${numBags}`
//     : (form.serial_number ? `${form.serial_number}/?` : '?/?');

//   // Resize bag rows when num_bags changes — keep existing weights
//   useEffect(() => {
//     const n = parseInt(form.num_bags);
//     if (!isNaN(n) && n >= 1 && n <= 100) {
//       setBagWeights(prev => {
//         const rows = [];
//         for (let i = 0; i < n; i++) {
//           rows.push({ weight: prev[i]?.weight ?? '' });
//         }
//         return rows;
//       });
//     } else {
//       setBagWeights([]);
//     }
//   }, [form.num_bags]);

//   const handle = (e) => {
//     const { name, value } = e.target;
//     const processed = ['name', 'serial_number'].includes(name) ? toUpper(value) : value;
//     setForm(f => ({ ...f, [name]: processed }));
//     if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
//   };

//   // ✅ Direct array index update — no spread issues
//   const handleBagWeight = (index, value) => {
//     setBagWeights(prev => {
//       const next = prev.map((b, i) => i === index ? { weight: value } : b);
//       return next;
//     });
//     if (errors.bag_weights) setErrors(er => ({ ...er, bag_weights: undefined }));
//   };

//   const totalWeight = bagWeights.reduce((s, b) => s + (parseFloat(b.weight) || 0), 0);

//   const validate = () => {
//     const errs = {};
//     if (!form.serial_number.trim()) errs.serial_number = 'Required';
//     if (!form.name.trim())          errs.name          = 'Required';
//     if (!form.num_bags || numBags < 1) errs.num_bags   = 'Enter number of bags';
//     if (!form.entry_date)           errs.entry_date    = 'Required';
//     if (bagWeights.length > 0) {
//       const missing = bagWeights.some(b => !b.weight || parseFloat(b.weight) <= 0);
//       if (missing) errs.bag_weights = 'Enter weight for every bag';
//     }
//     return errs;
//   };

//   const reset = () => {
//     setForm(emptyForm());
//     setBagWeights([]);
//     setLastSaved(null);
//     setErrors({});
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     const errs = validate();
//     if (Object.keys(errs).length) {
//       setErrors(errs);
//       toast.error('Please fix the highlighted fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const lot_number = `${form.serial_number}/${numBags}`;

//       // ✅ Build bag_data with actual weights
//       const bagDataArray = bagWeights.map(b => ({
//         lot:    lot_number,
//         weight: parseFloat(b.weight) || 0,   // ← actual weight entered
//         rate:   0,                            // ← filled later after auction
//         amount: 0,                            // ← calculated after rate is set
//       }));

//       console.log('[Registration] Saving bag_data:', JSON.stringify(bagDataArray));

//       const payload = {
//         serial_number: form.serial_number,
//         name:          form.name,
//         mobile:        form.mobile || '0000000000',
//         material:      form.material || 'GENERAL',
//         num_bags:      numBags,
//         lot_number,
//         weight:        totalWeight,
//         advance_amount: parseFloat(form.advance_amount) || 0,
//         entry_date:    form.entry_date,
//         bag_data:      JSON.stringify(bagDataArray),  // ← sent to server
//       };

//       const res = await createSeller(payload);

//       if (res.data.success) {
//         toast.success(`${form.name} registered! Total: ${totalWeight.toFixed(2)} kg`);
//         setLastSaved({ ...form, weight: totalWeight, lot_number, id: res.data.id });
//         setForm(emptyForm());
//         setBagWeights([]);
//         setErrors({});
//       }
//     } catch (err) {
//       toast.error(err.message || 'Failed to register seller', { duration: 5000 });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const errStyle = (name) => errors[name] ? {
//     borderColor: 'var(--red)', boxShadow: '0 0 0 3px var(--red-dim)',
//   } : {};

//   return (
//     <div>
//       <div className="page-header">
//         <div>
//           <div className="page-title">Seller Registration</div>
//           <div className="page-subtitle">Register a new agricultural produce seller</div>
//         </div>
//       </div>

//       {lastSaved && (
//         <div style={{ background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'var(--radius)', padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:10, color:'var(--green)' }}>
//           <CheckCircle size={18} />
//           <span style={{ fontSize:13, fontWeight:600 }}>
//             ✓ <strong>{lastSaved.name}</strong> — Lot: <strong>{lastSaved.lot_number}</strong> | {lastSaved.num_bags} bags | Total: <strong>{Number(lastSaved.weight).toFixed(2)} kg</strong>
//           </span>
//         </div>
//       )}

//       <div className="card">
//         <div className="card-title">👨‍🌾 Seller Details</div>
//         <form onSubmit={submit} noValidate>
//           <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18, marginBottom:18 }}>

//             <Field label="Serial Number" required error={errors.serial_number}>
//               <input className="form-input" name="serial_number" value={form.serial_number}
//                 onChange={handle} placeholder="e.g. 1" style={errStyle('serial_number')} />
//             </Field>

//             <Field label="Seller Name" required error={errors.name}>
//               <input className="form-input" name="name" value={form.name}
//                 onChange={handle} placeholder="FULL NAME" style={errStyle('name')} />
//             </Field>

//             <Field label="Mobile Number">
//               <input className="form-input" name="mobile" value={form.mobile}
//                 onChange={handle} placeholder="10-digit mobile" maxLength={10}
//                 style={{ textTransform:'none' }} />
//             </Field>

//             <Field label="Material">
//               <select className="form-select" name="material" value={form.material} onChange={handle}>
//                 <option value="">— Select Material —</option>
//                 {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
//               </select>
//             </Field>

//             <Field label="Number of Bags" required error={errors.num_bags}>
//               <input className="form-input" type="number" name="num_bags" value={form.num_bags}
//                 onChange={handle} placeholder="e.g. 7" min="1" max="100"
//                 style={{ textTransform:'none', ...errStyle('num_bags') }} />
//             </Field>

//             <Field label="Advance Amount (₹)">
//               <input className="form-input" type="number" name="advance_amount" value={form.advance_amount}
//                 onChange={handle} placeholder="0.00" step="0.01" min="0"
//                 style={{ textTransform:'none' }} />
//             </Field>

//             <Field label="Entry Date" required error={errors.entry_date}>
//               <input className="form-input" type="date" name="entry_date" value={form.entry_date}
//                 onChange={handle} style={{ textTransform:'none', ...errStyle('entry_date') }} />
//             </Field>

//           </div>

//           {/* ── Bag Weight Entry ── */}
//           {numBags > 0 && bagWeights.length > 0 && (
//             <div style={{ marginTop:8 }}>
//               <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
//                 <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//                   <Package size={18} style={{ color:'var(--accent)' }} />
//                   <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>
//                     Bag-wise Weight Entry
//                   </span>
//                   <span style={{ fontSize:12, color:'var(--accent)', background:'var(--accent-dim)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:20, padding:'2px 12px', fontWeight:700 }}>
//                     {numBags} bags · Lot {lotLabel}
//                   </span>
//                 </div>
//                 {totalWeight > 0 && (
//                   <div style={{ fontSize:14, fontWeight:800, color:'var(--green)', fontFamily:'var(--font-display)' }}>
//                     Total: {totalWeight.toFixed(2)} kg
//                   </div>
//                 )}
//               </div>

//               {errors.bag_weights && (
//                 <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--red)', marginBottom:12, padding:'8px 14px', background:'var(--red-dim)', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)' }}>
//                   <AlertCircle size={13} /> {errors.bag_weights}
//                 </div>
//               )}

//               {/* Header */}
//               <div style={{ display:'grid', gridTemplateColumns:'48px 1fr 200px', gap:12, padding:'8px 16px', background:'var(--bg-panel)', borderRadius:'10px 10px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
//                 {['#', 'Lot Number', 'Weight (kg) *'].map(h => (
//                   <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
//                 ))}
//               </div>

//               {/* Rows */}
//               <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
//                 {bagWeights.map((bag, i) => (
//                   <div key={i} style={{ display:'grid', gridTemplateColumns:'48px 1fr 200px', gap:12, padding:'10px 16px', background: i%2===0 ? 'var(--bg-card)':'var(--bg-panel)', borderBottom: i<bagWeights.length-1 ? '1px solid var(--border)':'none', alignItems:'center' }}>
//                     {/* Badge */}
//                     <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:13, fontFamily:'var(--font-display)', border:'1px solid rgba(245,158,11,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
//                       {i + 1}
//                     </div>

//                     {/* Lot */}
//                     <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', fontFamily:'monospace' }}>
//                       {form.serial_number ? lotLabel : '?/?'}
//                     </div>

//                     {/* Weight input */}
//                     <input
//                       type="number"
//                       value={bag.weight}
//                       onChange={e => handleBagWeight(i, e.target.value)}
//                       placeholder="0.00"
//                       step="0.01"
//                       min="0.01"
//                       onWheel={e => e.target.blur()}
//                       style={{
//                         background: bag.weight ? 'rgba(59,130,246,0.08)':'var(--bg-panel)',
//                         border: `1px solid ${bag.weight ? 'rgba(59,130,246,0.5)' : (!bag.weight && errors.bag_weights ? 'var(--red)' : 'var(--border-light)')}`,
//                         borderRadius:8, padding:'9px 14px',
//                         color: bag.weight ? 'var(--blue)':'var(--text-primary)',
//                         fontFamily:'var(--font-body)', fontSize:14, fontWeight:700,
//                         outline:'none', width:'100%',
//                       }}
//                       onFocus={e => e.target.style.borderColor = 'var(--blue)'}
//                       onBlur={e => e.target.style.borderColor = bag.weight ? 'rgba(59,130,246,0.5)' : 'var(--border-light)'}
//                     />
//                   </div>
//                 ))}
//               </div>

//               {/* Total */}
//               {totalWeight > 0 && (
//                 <div style={{ display:'grid', gridTemplateColumns:'48px 1fr 200px', gap:12, padding:'12px 16px', marginTop:8, background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, alignItems:'center' }}>
//                   <div />
//                   <div style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>
//                     ✅ {bagWeights.filter(b => b.weight).length} / {numBags} bags filled
//                   </div>
//                   <div style={{ fontSize:16, fontWeight:800, color:'var(--green)', fontFamily:'var(--font-display)', textAlign:'right' }}>
//                     {totalWeight.toFixed(2)} kg
//                   </div>
//                 </div>
//               )}

//               <div style={{ marginTop:10, padding:'10px 14px', background:'var(--blue-dim)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:8, fontSize:12, color:'var(--blue)' }}>
//                 💡 Weights are saved now. After auction, go to <strong>Seller List → Edit</strong> to add rates per bag.
//               </div>
//             </div>
//           )}

//           {/* Preview */}
//           {form.name && (
//             <div style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 18px', marginTop:20, fontSize:13 }}>
//               <div style={{ fontWeight:700, color:'var(--text-secondary)', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>Preview</div>
//               <div style={{ display:'flex', flexWrap:'wrap', gap:16, color:'var(--text-primary)' }}>
//                 <span>👤 <strong>{form.name}</strong></span>
//                 {form.material && <span>📦 {form.material}</span>}
//                 {numBags > 0  && <span>🛍 {numBags} bags · Lot {lotLabel}</span>}
//                 {totalWeight > 0 && <span>⚖️ <strong>{totalWeight.toFixed(2)} kg</strong></span>}
//                 {form.advance_amount && <span>💳 Advance: ₹{form.advance_amount}</span>}
//               </div>
//             </div>
//           )}

//           <div className="form-actions">
//             <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
//               <Save size={16} /> {loading ? 'Registering...' : 'Register Seller'}
//             </button>
//             <button type="button" className="btn btn-secondary btn-lg" onClick={reset}>
//               <RotateCcw size={16} /> Clear Form
//             </button>
//           </div>
//         </form>
//       </div>

//       <style>{`
//         input[type=number]::-webkit-inner-spin-button,
//         input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
//         input[type=number] { -moz-appearance:textfield; }
//       `}</style>
//     </div>
//   );
// }


// -------------------------------------------------------------------------------------------------


// import React, { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import { Save, RotateCcw, CheckCircle, AlertCircle, Package } from 'lucide-react';
// import { createSeller } from '../api';
// import { MATERIALS, todayISO, toUpper } from '../utils';

// const emptyForm = () => ({
//   serial_number: '',
//   name: '',
//   mobile: '',
//   material: '',
//   num_bags: '',
//   advance_amount: '',
//   entry_date: todayISO(),
// });

// // ✅ OUTSIDE — prevents focus loss on re-render
// function Field({ label, required, error, children }) {
//   return (
//     <div className="form-group">
//       <label className="form-label">
//         {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
//       </label>
//       {children}
//       {error && (
//         <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--red)', marginTop: 3 }}>
//           <AlertCircle size={11} /> {error}
//         </div>
//       )}
//     </div>
//   );
// }

// export default function SellerRegistration() {
//   const [form,       setForm]       = useState(emptyForm());
//   const [bagWeights, setBagWeights] = useState([]); // array of { weight: string }
//   const [loading,    setLoading]    = useState(false);
//   const [lastSaved,  setLastSaved]  = useState(null);
//   const [errors,     setErrors]     = useState({});

//   const numBags  = parseInt(form.num_bags) || 0;
//   const lotLabel = numBags > 0 && form.serial_number
//     ? `${form.serial_number}/${numBags}`
//     : (form.serial_number ? `${form.serial_number}/?` : '?/?');

//   // Resize bag rows when num_bags changes — ALWAYS keep existing weights
//   // useEffect(() => {
//   //   const n = parseInt(form.num_bags);
//   //   if (!isNaN(n) && n >= 1 && n <= 100) {
//   //     setBagWeights(prev => {
//   //       if (prev.length === n) return prev; // no change needed
//   //       const rows = [];
//   //       for (let i = 0; i < n; i++) {
//   //         // Keep existing weight if available, otherwise empty
//   //         rows.push({ weight: prev[i]?.weight !== undefined ? prev[i].weight : '' });
//   //       }
//   //       return rows;
//   //     });
//   //   } else {
//   //     setBagWeights([]);
//   //   }
//   // }, [form.num_bags]);

//   useEffect(() => {
//     const n = parseInt(form.num_bags);
//     if (!isNaN(n) && n >= 1 && n <= 100) {
//       setBagWeights(prev => 
//         Array.from({ length: n }, (_, i) => 
//           prev[i] !== undefined ? prev[i] : { weight: '' }
//         )
//       );
//     } else {
//       setBagWeights([]);
//     }
//   }, [form.num_bags]);

//   const handle = (e) => {
//     const { name, value } = e.target;
//     const processed = ['name', 'serial_number'].includes(name) ? toUpper(value) : value;
//     setForm(f => ({ ...f, [name]: processed }));
//     if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
//   };

//   // ✅ Direct array index update — no spread issues
//   const handleBagWeight = (index, value) => {
//     setBagWeights(prev => {
//       const next = prev.map((b, i) => i === index ? { weight: value } : b);
//       return next;
//     });
//     if (errors.bag_weights) setErrors(er => ({ ...er, bag_weights: undefined }));
//   };

//   const totalWeight = bagWeights.reduce((s, b) => s + (parseFloat(b.weight) || 0), 0);

//   const validate = () => {
//     const errs = {};
//     if (!form.serial_number.trim()) errs.serial_number = 'Required';
//     if (!form.name.trim())          errs.name          = 'Required';
//     if (!form.num_bags || numBags < 1) errs.num_bags   = 'Enter number of bags';
//     if (!form.entry_date)           errs.entry_date    = 'Required';
//     if (bagWeights.length > 0) {
//       const missing = bagWeights.some(b => !b.weight || parseFloat(b.weight) <= 0);
//       if (missing) errs.bag_weights = 'Enter weight for every bag';
//     }
//     return errs;
//   };

//   const reset = () => {
//     setForm(emptyForm());
//     setBagWeights([]);
//     setLastSaved(null);
//     setErrors({});
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     const errs = validate();
//     if (Object.keys(errs).length) {
//       setErrors(errs);
//       toast.error('Please fix the highlighted fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const lot_number = `${form.serial_number}/${numBags}`;

//       // ✅ Build bag_data with actual weights
//       const bagDataArray = bagWeights.map(b => ({
//         lot:    lot_number,
//         weight: parseFloat(b.weight) || 0,   // ← actual weight entered
//         rate:   0,                            // ← filled later after auction
//         amount: 0,                            // ← calculated after rate is set
//       }));

//       console.log('[Registration] Saving bag_data:', JSON.stringify(bagDataArray));

//       const payload = {
//         serial_number: form.serial_number,
//         name:          form.name,
//         mobile:        form.mobile || '0000000000',
//         material:      form.material || 'GENERAL',
//         num_bags:      numBags,
//         lot_number,
//         weight:        totalWeight,
//         advance_amount: parseFloat(form.advance_amount) || 0,
//         entry_date:    form.entry_date,
//         bag_data:      JSON.stringify(bagDataArray),  // ← sent to server
//       };

//       const res = await createSeller(payload);

//       if (res.data.success) {
//         toast.success(`${form.name} registered! Total: ${totalWeight.toFixed(2)} kg`);
//         setLastSaved({ ...form, weight: totalWeight, lot_number, id: res.data.id });
//         setForm(emptyForm());
//         setBagWeights([]);
//         setErrors({});
//       }
//     } catch (err) {
//       toast.error(err.message || 'Failed to register seller', { duration: 5000 });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const errStyle = (name) => errors[name] ? {
//     borderColor: 'var(--red)', boxShadow: '0 0 0 3px var(--red-dim)',
//   } : {};

//   return (
//     <div>
//       <div className="page-header">
//         <div>
//           <div className="page-title">Seller Registration</div>
//           <div className="page-subtitle">Register a new agricultural produce seller</div>
//         </div>
//       </div>

//       {lastSaved && (
//         <div style={{ background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'var(--radius)', padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:10, color:'var(--green)' }}>
//           <CheckCircle size={18} />
//           <span style={{ fontSize:13, fontWeight:600 }}>
//             ✓ <strong>{lastSaved.name}</strong> — Lot: <strong>{lastSaved.lot_number}</strong> | {lastSaved.num_bags} bags | Total: <strong>{Number(lastSaved.weight).toFixed(2)} kg</strong>
//           </span>
//         </div>
//       )}

//       <div className="card">
//         <div className="card-title">👨‍🌾 Seller Details</div>
//         <form onSubmit={submit} noValidate>
//           <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18, marginBottom:18 }}>

//             <Field label="Serial Number" required error={errors.serial_number}>
//               <input className="form-input" name="serial_number" value={form.serial_number}
//                 onChange={handle} placeholder="e.g. 1" style={errStyle('serial_number')} />
//             </Field>

//             <Field label="Seller Name" required error={errors.name}>
//               <input className="form-input" name="name" value={form.name}
//                 onChange={handle} placeholder="FULL NAME" style={errStyle('name')} />
//             </Field>

//             <Field label="Mobile Number">
//               <input className="form-input" name="mobile" value={form.mobile}
//                 onChange={handle} placeholder="10-digit mobile" maxLength={10}
//                 style={{ textTransform:'none' }} />
//             </Field>

//             <Field label="Material">
//               <select className="form-select" name="material" value={form.material} onChange={handle}>
//                 <option value="">— Select Material —</option>
//                 {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
//               </select>
//             </Field>

//             <Field label="Number of Bags" required error={errors.num_bags}>
//               <input className="form-input" type="number" name="num_bags" value={form.num_bags}
//                 onChange={handle} placeholder="e.g. 7" min="1" max="100"
//                 style={{ textTransform:'none', ...errStyle('num_bags') }} />
//             </Field>

//             <Field label="Advance Amount (₹)">
//               <input className="form-input" type="number" name="advance_amount" value={form.advance_amount}
//                 onChange={handle} placeholder="0.00" step="0.01" min="0"
//                 style={{ textTransform:'none' }} />
//             </Field>

//             <Field label="Entry Date" required error={errors.entry_date}>
//               <input className="form-input" type="date" name="entry_date" value={form.entry_date}
//                 onChange={handle} style={{ textTransform:'none', ...errStyle('entry_date') }} />
//             </Field>

//           </div>

//           {/* ── Bag Weight Entry ── */}
//           {numBags > 0 && bagWeights.length > 0 && (
//             <div style={{ marginTop:8 }}>
//               <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
//                 <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//                   <Package size={18} style={{ color:'var(--accent)' }} />
//                   <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>
//                     Bag-wise Weight Entry
//                   </span>
//                   <span style={{ fontSize:12, color:'var(--accent)', background:'var(--accent-dim)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:20, padding:'2px 12px', fontWeight:700 }}>
//                     {numBags} bags · Lot {lotLabel}
//                   </span>
//                 </div>
//                 {totalWeight > 0 && (
//                   <div style={{ fontSize:14, fontWeight:800, color:'var(--green)', fontFamily:'var(--font-display)' }}>
//                     Total: {totalWeight.toFixed(2)} kg
//                   </div>
//                 )}
//               </div>

//               {errors.bag_weights && (
//                 <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--red)', marginBottom:12, padding:'8px 14px', background:'var(--red-dim)', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)' }}>
//                   <AlertCircle size={13} /> {errors.bag_weights}
//                 </div>
//               )}

//               {/* Header */}
//               <div style={{ display:'grid', gridTemplateColumns:'48px 1fr 200px', gap:12, padding:'8px 16px', background:'var(--bg-panel)', borderRadius:'10px 10px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
//                 {['#', 'Lot Number', 'Weight (kg) *'].map(h => (
//                   <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
//                 ))}
//               </div>

//               {/* Rows */}
//               <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
//                 {bagWeights.map((bag, i) => (
//                   <div key={i} style={{ display:'grid', gridTemplateColumns:'48px 1fr 200px', gap:12, padding:'10px 16px', background: i%2===0 ? 'var(--bg-card)':'var(--bg-panel)', borderBottom: i<bagWeights.length-1 ? '1px solid var(--border)':'none', alignItems:'center' }}>
//                     {/* Badge */}
//                     <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:13, fontFamily:'var(--font-display)', border:'1px solid rgba(245,158,11,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
//                       {i + 1}
//                     </div>

//                     {/* Lot */}
//                     <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', fontFamily:'monospace' }}>
//                       {form.serial_number ? lotLabel : '?/?'}
//                     </div>

//                     {/* Weight input */}
//                     <input
//                       type="number"
//                       value={bag.weight}
//                       onChange={e => handleBagWeight(i, e.target.value)}
//                       placeholder="0.00"
//                       step="0.01"
//                       min="0.01"
//                       onWheel={e => e.target.blur()}
//                       style={{
//                         background: bag.weight ? 'rgba(59,130,246,0.08)':'var(--bg-panel)',
//                         border: `1px solid ${bag.weight ? 'rgba(59,130,246,0.5)' : (!bag.weight && errors.bag_weights ? 'var(--red)' : 'var(--border-light)')}`,
//                         borderRadius:8, padding:'9px 14px',
//                         color: bag.weight ? 'var(--blue)':'var(--text-primary)',
//                         fontFamily:'var(--font-body)', fontSize:14, fontWeight:700,
//                         outline:'none', width:'100%',
//                       }}
//                       onFocus={e => e.target.style.borderColor = 'var(--blue)'}
//                       onBlur={e => e.target.style.borderColor = bag.weight ? 'rgba(59,130,246,0.5)' : 'var(--border-light)'}
//                     />
//                   </div>
//                 ))}
//               </div>

//               {/* Total */}
//               {totalWeight > 0 && (
//                 <div style={{ display:'grid', gridTemplateColumns:'48px 1fr 200px', gap:12, padding:'12px 16px', marginTop:8, background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, alignItems:'center' }}>
//                   <div />
//                   <div style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>
//                     ✅ {bagWeights.filter(b => b.weight).length} / {numBags} bags filled
//                   </div>
//                   <div style={{ fontSize:16, fontWeight:800, color:'var(--green)', fontFamily:'var(--font-display)', textAlign:'right' }}>
//                     {totalWeight.toFixed(2)} kg
//                   </div>
//                 </div>
//               )}

//               <div style={{ marginTop:10, padding:'10px 14px', background:'var(--blue-dim)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:8, fontSize:12, color:'var(--blue)' }}>
//                 💡 Weights are saved now. After auction, go to <strong>Seller List → Edit</strong> to add rates per bag.
//               </div>
//             </div>
//           )}

//           {/* Preview */}
//           {form.name && (
//             <div style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 18px', marginTop:20, fontSize:13 }}>
//               <div style={{ fontWeight:700, color:'var(--text-secondary)', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>Preview</div>
//               <div style={{ display:'flex', flexWrap:'wrap', gap:16, color:'var(--text-primary)' }}>
//                 <span>👤 <strong>{form.name}</strong></span>
//                 {form.material && <span>📦 {form.material}</span>}
//                 {numBags > 0  && <span>🛍 {numBags} bags · Lot {lotLabel}</span>}
//                 {totalWeight > 0 && <span>⚖️ <strong>{totalWeight.toFixed(2)} kg</strong></span>}
//                 {form.advance_amount && <span>💳 Advance: ₹{form.advance_amount}</span>}
//               </div>
//             </div>
//           )}

//           <div className="form-actions">
//             <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
//               <Save size={16} /> {loading ? 'Registering...' : 'Register Seller'}
//             </button>
//             <button type="button" className="btn btn-secondary btn-lg" onClick={reset}>
//               <RotateCcw size={16} /> Clear Form
//             </button>
//           </div>
//         </form>
//       </div>

//       <style>{`
//         input[type=number]::-webkit-inner-spin-button,
//         input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
//         input[type=number] { -moz-appearance:textfield; }
//       `}</style>
//     </div>
//   );
// }



// ----------------------------------------------------------------------------------------------------------------------


import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Save, RotateCcw, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { createSeller } from '../api';
import { MATERIALS, todayISO, toUpper } from '../utils';

const emptyForm = () => ({
  serial_number: '',
  name: '',
  mobile: '',
  material: '',
  num_bags: '',
  advance_amount: '',
  entry_date: todayISO(),
});

// ✅ OUTSIDE — prevents focus loss on re-render
function Field({ label, required, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--red)', marginTop: 3 }}>
          <AlertCircle size={11} /> {error}
        </div>
      )}
    </div>
  );
}

export default function SellerRegistration() {
  const [form,       setForm]       = useState(emptyForm());
  const [bagWeights, setBagWeights] = useState([]); // array of { weight: string }
  const [loading,    setLoading]    = useState(false);
  const [lastSaved,  setLastSaved]  = useState(null);
  const [errors,     setErrors]     = useState({});

  const numBags  = parseInt(form.num_bags) || 0;
  const isGinger = form.material === 'GINGER';
  const lotLabel = numBags > 0 && form.serial_number
    ? `${form.serial_number}/${numBags}`
    : (form.serial_number ? `${form.serial_number}/?` : '?/?');

  // Distribute n bags evenly across rows, remainder to first groups
  const redistributeGingerBags = (rows, n) => {
    const g = rows.length;
    return rows.map((r, i) => ({
      ...r,
      bags: Math.floor(n / g) + (i < (n % g) ? 1 : 0),
    }));
  };

  // NOTE: bag rows are updated via onBlur on the num_bags input, not useEffect
  // This prevents weights from being cleared while typing

  const handle = (e) => {
    const { name, value } = e.target;
    const processed = ['name', 'serial_number'].includes(name) ? toUpper(value) : value;
    setForm(f => ({ ...f, [name]: processed }));
    // When material changes, reset bag rows according to the new material mode
    if (name === 'material') {
      const n = parseInt(form.num_bags) || 0;
      if (n >= 1 && n <= 100) {
        if (value === 'GINGER') {
          setBagWeights([{ weight: '', bags: n }]);
        } else {
          setBagWeights(Array.from({ length: n }, () => ({ weight: '' })));
        }
      } else {
        setBagWeights([]);
      }
    }
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  };

  // ✅ Direct array index update — no spread issues
  const handleBagWeight = (index, value) => {
    setBagWeights(prev => {
      const next = prev.map((b, i) => i === index ? { ...b, weight: value } : b);
      return next;
    });
    if (errors.bag_weights) setErrors(er => ({ ...er, bag_weights: undefined }));
  };

  // Ginger-specific: edit the bags count for a group directly
  const handleGingerBags = (index, value) => {
    setBagWeights(prev => prev.map((b, i) => i === index ? { ...b, bags: parseInt(value) || 0 } : b));
  };

  // Ginger-specific: add a new group row (max = numBags groups)
  const addGingerGroup = () => {
    if (bagWeights.length < numBags) {
      setBagWeights(prev => redistributeGingerBags([...prev, { weight: '', bags: 0 }], numBags));
    }
  };

  // Ginger-specific: remove a group row (min = 1 group)
  const removeGingerGroup = (index) => {
    if (bagWeights.length > 1) {
      setBagWeights(prev => redistributeGingerBags(prev.filter((_, i) => i !== index), numBags));
    }
  };

  const totalWeight = bagWeights.reduce((s, b) => s + (parseFloat(b.weight) || 0), 0);

  const validate = () => {
    const errs = {};
    if (!form.serial_number.trim()) errs.serial_number = 'Required';
    if (!form.name.trim())          errs.name          = 'Required';
    if (!form.num_bags || numBags < 1) errs.num_bags   = 'Enter number of bags';
    if (!form.entry_date)           errs.entry_date    = 'Required';
    if (bagWeights.length > 0) {
      const missing = bagWeights.some(b => !b.weight || parseFloat(b.weight) <= 0);
      if (missing) errs.bag_weights = 'Enter weight for every bag';
    }
    return errs;
  };

  const reset = () => {
    setForm(emptyForm());
    setBagWeights([]);
    setLastSaved(null);
    setErrors({});
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix the highlighted fields');
      return;
    }

    setLoading(true);
    try {
      const lot_number = `${form.serial_number}/${numBags}`;

      // ✅ Build bag_data with actual weights
      // For GINGER: each group row is expanded into individual bag entries (weight split equally)
      let bagDataArray;
      if (isGinger) {
        bagDataArray = [];
        bagWeights.forEach((b) => {
          const bagsInGroup  = b.bags || 0;
          const groupWeight  = parseFloat(b.weight) || 0;
          const weightPerBag = bagsInGroup > 0 ? groupWeight / bagsInGroup : 0;
          for (let j = 0; j < bagsInGroup; j++) {
            bagDataArray.push({ lot: lot_number, weight: weightPerBag, rate: 0, amount: 0 });
          }
        });
      } else {
        bagDataArray = bagWeights.map(b => ({
          lot:    lot_number,
          weight: parseFloat(b.weight) || 0,   // ← actual weight entered
          rate:   0,                            // ← filled later after auction
          amount: 0,                            // ← calculated after rate is set
        }));
      }

      console.log('[Registration] Saving bag_data:', JSON.stringify(bagDataArray));

      const payload = {
        serial_number: form.serial_number,
        name:          form.name,
        mobile:        form.mobile || '0000000000',
        material:      form.material || 'GENERAL',
        num_bags:      numBags,
        lot_number,
        weight:        totalWeight,
        advance_amount: parseFloat(form.advance_amount) || 0,
        entry_date:    form.entry_date,
        bag_data:      JSON.stringify(bagDataArray),  // ← sent to server
      };

      const res = await createSeller(payload);

      if (res.data.success) {
        toast.success(`${form.name} registered! Total: ${totalWeight.toFixed(2)} kg`);
        setLastSaved({ ...form, weight: totalWeight, lot_number, id: res.data.id });
        setForm(emptyForm());
        setBagWeights([]);
        setErrors({});
      }
    } catch (err) {
      toast.error(err.message || 'Failed to register seller', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const errStyle = (name) => errors[name] ? {
    borderColor: 'var(--red)', boxShadow: '0 0 0 3px var(--red-dim)',
  } : {};

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Seller Registration</div>
          <div className="page-subtitle">Register a new agricultural produce seller</div>
        </div>
      </div>

      {lastSaved && (
        <div style={{ background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'var(--radius)', padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:10, color:'var(--green)' }}>
          <CheckCircle size={18} />
          <span style={{ fontSize:13, fontWeight:600 }}>
            ✓ <strong>{lastSaved.name}</strong> — Lot: <strong>{lastSaved.lot_number}</strong> | {lastSaved.num_bags} bags | Total: <strong>{Number(lastSaved.weight).toFixed(2)} kg</strong>
          </span>
        </div>
      )}

      <div className="card">
        <div className="card-title">👨‍🌾 Seller Details</div>
        <form onSubmit={submit} noValidate>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:18, marginBottom:18 }}>

            <Field label="Serial Number" required error={errors.serial_number}>
              <input className="form-input" name="serial_number" value={form.serial_number}
                onChange={handle} placeholder="e.g. 1" style={errStyle('serial_number')} />
            </Field>

            <Field label="Seller Name" required error={errors.name}>
              <input className="form-input" name="name" value={form.name}
                onChange={handle} placeholder="FULL NAME" style={errStyle('name')} />
            </Field>

            <Field label="Mobile Number">
              <input className="form-input" name="mobile" value={form.mobile}
                onChange={handle} placeholder="10-digit mobile" maxLength={10}
                style={{ textTransform:'none' }} />
            </Field>

            <Field label="Material">
              <select className="form-select" name="material" value={form.material} onChange={handle}>
                <option value="">— Select Material —</option>
                {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>

            <Field label="Number of Bags" required error={errors.num_bags}>
              <input className="form-input" type="number" name="num_bags" value={form.num_bags}
                onChange={handle}
                onBlur={e => {
                  const n = parseInt(e.target.value) || 0;
                  if (n >= 1 && n <= 100) {
                    if (isGinger) {
                      // Ginger: keep existing groups (capped to n), redistribute bags
                      setBagWeights(prev => {
                        const capped = prev.slice(0, Math.min(prev.length, n));
                        const base   = capped.length > 0 ? capped : [{ weight: '', bags: n }];
                        return redistributeGingerBags(base, n);
                      });
                    } else {
                      setBagWeights(prev => Array.from({ length: n }, (_, i) =>
                        prev[i] !== undefined ? prev[i] : { weight: '' }
                      ));
                    }
                  } else {
                    setBagWeights([]);
                  }
                }}
                placeholder="e.g. 7" min="1" max="100"
                style={{ textTransform:'none', ...errStyle('num_bags') }} />
            </Field>

            <Field label="Advance Amount (₹)">
              <input className="form-input" type="number" name="advance_amount" value={form.advance_amount}
                onChange={handle} placeholder="0.00" step="0.01" min="0"
                style={{ textTransform:'none' }} />
            </Field>

            <Field label="Entry Date" required error={errors.entry_date}>
              <input className="form-input" type="date" name="entry_date" value={form.entry_date}
                onChange={handle} style={{ textTransform:'none', ...errStyle('entry_date') }} />
            </Field>

          </div>

          {/* ── Bag Weight Entry ── */}
          {numBags > 0 && bagWeights.length > 0 && (
            <div style={{ marginTop:8 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <Package size={18} style={{ color:'var(--accent)' }} />
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:15, color:'var(--text-primary)' }}>
                    {isGinger ? 'Ginger Weight Entry' : 'Bag-wise Weight Entry'}
                  </span>
                  <span style={{ fontSize:12, color:'var(--accent)', background:'var(--accent-dim)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:20, padding:'2px 12px', fontWeight:700 }}>
                    {isGinger
                      ? `${numBags} bags · ${bagWeights.length} group${bagWeights.length > 1 ? 's' : ''} · Lot ${lotLabel}`
                      : `${numBags} bags · Lot ${lotLabel}`}
                  </span>
                </div>
                {totalWeight > 0 && (
                  <div style={{ fontSize:14, fontWeight:800, color:'var(--green)', fontFamily:'var(--font-display)' }}>
                    Total: {totalWeight.toFixed(2)} kg
                  </div>
                )}
              </div>

              {errors.bag_weights && (
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--red)', marginBottom:12, padding:'8px 14px', background:'var(--red-dim)', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)' }}>
                  <AlertCircle size={13} /> {errors.bag_weights}
                </div>
              )}

              {isGinger ? (
                /* ── GINGER MODE: group rows ── */
                <>
                  {/* Header */}
                  <div style={{ display:'grid', gridTemplateColumns:'48px 1fr 110px 200px 36px', gap:12, padding:'8px 16px', background:'var(--bg-panel)', borderRadius:'10px 10px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
                    {['#', 'Lot Number', 'Bags', 'Weight (kg) *', ''].map(h => (
                      <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
                    ))}
                  </div>

                  {/* Group Rows */}
                  <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
                    {bagWeights.map((bag, i) => {
                      return (
                        <div key={i} style={{ display:'grid', gridTemplateColumns:'48px 1fr 110px 200px 36px', gap:12, padding:'10px 16px', background: i%2===0 ? 'var(--bg-card)':'var(--bg-panel)', borderBottom: i<bagWeights.length-1 ? '1px solid var(--border)':'none', alignItems:'center' }}>
                          {/* Badge */}
                          <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:13, fontFamily:'var(--font-display)', border:'1px solid rgba(245,158,11,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {i + 1}
                          </div>

                          {/* Lot */}
                          <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', fontFamily:'monospace' }}>
                            {form.serial_number ? lotLabel : '?/?'}
                          </div>

                          {/* Bags in this group — editable */}
                          <input
                            type="number"
                            value={bag.bags ?? ''}
                            onChange={e => handleGingerBags(i, e.target.value)}
                            placeholder="bags"
                            min="1"
                            onWheel={e => e.target.blur()}
                            style={{ background:'var(--bg-panel)', border:'1px solid var(--border-light)', borderRadius:6, padding:'7px 10px', color:'var(--text-secondary)', fontFamily:'var(--font-body)', fontSize:13, fontWeight:700, outline:'none', width:'100%', textAlign:'center' }}
                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
                          />

                          {/* Weight input */}
                          <input
                            type="number"
                            value={bag.weight}
                            onChange={e => handleBagWeight(i, e.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            onWheel={e => e.target.blur()}
                            style={{
                              background: bag.weight ? 'rgba(59,130,246,0.08)':'var(--bg-panel)',
                              border: `1px solid ${bag.weight ? 'rgba(59,130,246,0.5)' : (!bag.weight && errors.bag_weights ? 'var(--red)' : 'var(--border-light)')}`,
                              borderRadius:8, padding:'9px 14px',
                              color: bag.weight ? 'var(--blue)':'var(--text-primary)',
                              fontFamily:'var(--font-body)', fontSize:14, fontWeight:700,
                              outline:'none', width:'100%',
                            }}
                            onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                            onBlur={e => e.target.style.borderColor = bag.weight ? 'rgba(59,130,246,0.5)' : 'var(--border-light)'}
                          />

                          {/* Remove group button */}
                          {bagWeights.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeGingerGroup(i)}
                              title="Remove this group"
                              style={{ width:30, height:30, borderRadius:6, border:'1px solid rgba(239,68,68,0.4)', background:'var(--red-dim)', color:'var(--red)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, lineHeight:1, flexShrink:0 }}
                            >×</button>
                          ) : <div />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Another button */}
                  {bagWeights.length < numBags && (
                    <button
                      type="button"
                      onClick={addGingerGroup}
                      style={{ marginTop:10, padding:'8px 18px', background:'var(--accent-dim)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:8, color:'var(--accent)', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}
                    >
                      + Add Another Group
                    </button>
                  )}

                  {/* Total */}
                  {totalWeight > 0 && (
                    <div style={{ display:'grid', gridTemplateColumns:'48px 1fr 110px 200px 36px', gap:12, padding:'12px 16px', marginTop:8, background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, alignItems:'center' }}>
                      <div /><div />
                      <div style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>
                        ✅ {bagWeights.filter(b => b.weight).length} / {bagWeights.length} filled
                      </div>
                      <div style={{ fontSize:16, fontWeight:800, color:'var(--green)', fontFamily:'var(--font-display)', textAlign:'right' }}>
                        {totalWeight.toFixed(2)} kg
                      </div>
                      <div />
                    </div>
                  )}

                  <div style={{ marginTop:10, padding:'10px 14px', background:'var(--blue-dim)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:8, fontSize:12, color:'var(--blue)' }}>
                    💡 Ginger bags share the same quality &amp; rate. Add groups only if different batches need separate weights. After auction, go to <strong>Seller List → Edit</strong> to set the rate.
                  </div>
                </>
              ) : (
                /* ── REGULAR MODE: one row per bag ── */
                <>
                  {/* Header */}
                  <div style={{ display:'grid', gridTemplateColumns:'48px 1fr 200px', gap:12, padding:'8px 16px', background:'var(--bg-panel)', borderRadius:'10px 10px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
                    {['#', 'Lot Number', 'Weight (kg) *'].map(h => (
                      <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
                    ))}
                  </div>

                  {/* Rows */}
                  <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
                    {bagWeights.map((bag, i) => (
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'48px 1fr 200px', gap:12, padding:'10px 16px', background: i%2===0 ? 'var(--bg-card)':'var(--bg-panel)', borderBottom: i<bagWeights.length-1 ? '1px solid var(--border)':'none', alignItems:'center' }}>
                        {/* Badge */}
                        <div style={{ width:32, height:32, borderRadius:8, background:'var(--accent-dim)', color:'var(--accent)', fontWeight:800, fontSize:13, fontFamily:'var(--font-display)', border:'1px solid rgba(245,158,11,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {i + 1}
                        </div>

                        {/* Lot */}
                        <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', fontFamily:'monospace' }}>
                          {form.serial_number ? lotLabel : '?/?'}
                        </div>

                        {/* Weight input */}
                        <input
                          type="number"
                          value={bag.weight}
                          onChange={e => handleBagWeight(i, e.target.value)}
                          placeholder="0.00"
                          step="0.01"
                          min="0.01"
                          onWheel={e => e.target.blur()}
                          style={{
                            background: bag.weight ? 'rgba(59,130,246,0.08)':'var(--bg-panel)',
                            border: `1px solid ${bag.weight ? 'rgba(59,130,246,0.5)' : (!bag.weight && errors.bag_weights ? 'var(--red)' : 'var(--border-light)')}`,
                            borderRadius:8, padding:'9px 14px',
                            color: bag.weight ? 'var(--blue)':'var(--text-primary)',
                            fontFamily:'var(--font-body)', fontSize:14, fontWeight:700,
                            outline:'none', width:'100%',
                          }}
                          onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                          onBlur={e => e.target.style.borderColor = bag.weight ? 'rgba(59,130,246,0.5)' : 'var(--border-light)'}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  {totalWeight > 0 && (
                    <div style={{ display:'grid', gridTemplateColumns:'48px 1fr 200px', gap:12, padding:'12px 16px', marginTop:8, background:'var(--green-dim)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:10, alignItems:'center' }}>
                      <div />
                      <div style={{ fontSize:13, fontWeight:700, color:'var(--green)' }}>
                        ✅ {bagWeights.filter(b => b.weight).length} / {numBags} bags filled
                      </div>
                      <div style={{ fontSize:16, fontWeight:800, color:'var(--green)', fontFamily:'var(--font-display)', textAlign:'right' }}>
                        {totalWeight.toFixed(2)} kg
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop:10, padding:'10px 14px', background:'var(--blue-dim)', border:'1px solid rgba(59,130,246,0.25)', borderRadius:8, fontSize:12, color:'var(--blue)' }}>
                    💡 Weights are saved now. After auction, go to <strong>Seller List → Edit</strong> to add rates per bag.
                  </div>
                </>
              )}
            </div>
          )}

          {/* Preview */}
          {form.name && (
            <div style={{ background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 18px', marginTop:20, fontSize:13 }}>
              <div style={{ fontWeight:700, color:'var(--text-secondary)', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', marginBottom:10 }}>Preview</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:16, color:'var(--text-primary)' }}>
                <span>👤 <strong>{form.name}</strong></span>
                {form.material && <span>📦 {form.material}</span>}
                {numBags > 0  && <span>🛍 {numBags} bags · Lot {lotLabel}</span>}
                {totalWeight > 0 && <span>⚖️ <strong>{totalWeight.toFixed(2)} kg</strong></span>}
                {form.advance_amount && <span>💳 Advance: ₹{form.advance_amount}</span>}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              <Save size={16} /> {loading ? 'Registering...' : 'Register Seller'}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={reset}>
              <RotateCcw size={16} /> Clear Form
            </button>
          </div>
        </form>
      </div>

      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        input[type=number] { -moz-appearance:textfield; }
      `}</style>
    </div>
  );
}