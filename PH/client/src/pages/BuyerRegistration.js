// import React, { useState } from 'react';
// import toast from 'react-hot-toast';
// import { Save, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
// import axios from 'axios';
// import { todayISO, toUpper } from '../utils';

// const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });
// // const API = axios.create({ baseURL: process.env.NODE_ENV === 'production' ? 'http://localhost:5000' : '' });

// const emptyForm = () => ({
//   name:         '',
//   short_name:   '',
//   mobile:       '',
//   entry_date:   todayISO(),
// });

// function Field({ label, required, error, children }) {
//   return (
//     <div className="form-group">
//       <label className="form-label">
//         {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
//       </label>
//       {children}
//       {error && (
//         <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--red)', marginTop:3 }}>
//           <AlertCircle size={11} /> {error}
//         </div>
//       )}
//     </div>
//   );
// }

// export default function BuyerRegistration() {
//   const [form,      setForm]      = useState(emptyForm());
//   const [loading,   setLoading]   = useState(false);
//   const [lastSaved, setLastSaved] = useState(null);
//   const [errors,    setErrors]    = useState({});

//   const handle = (e) => {
//     const { name, value } = e.target;
//     const processed = ['name', 'short_name'].includes(name) ? toUpper(value) : value;
//     setForm(f => ({ ...f, [name]: processed }));
//     if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
//   };

//   const validate = () => ({});

//   const reset = () => { setForm(emptyForm()); setLastSaved(null); setErrors({}); };

//   const submit = async (e) => {
//     e.preventDefault();
//     const errs = validate();
//     // no mandatory fields

//     setLoading(true);
//     try {
//       // Use name as serial, short_name as lot_number, fill dummy values for required server fields
//       const payload = {
//         serial_number:  form.short_name || form.name.substring(0, 6) || todayISO(),
//         name:           form.name || '—',
//         mobile:         form.mobile || '0000000000',
//         material:       'GENERAL',
//         num_bags:       0,
//         lot_number:     form.short_name || '—',
//         weight:         0,
//         advance_amount: 0,
//         entry_date:     form.entry_date,
//         bag_data:       '[]',
//       };

//       const res = await API.post('/api/buyers', payload);
//       if (res.data.success) {
//         toast.success(`${form.name} registered successfully!`);
//         setLastSaved({ ...form });
//         setForm(emptyForm());
//         setErrors({});
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.error || err.message || 'Failed to register buyer', { duration: 5000 });
//     } finally { setLoading(false); }
//   };

//   const eb = (name) => errors[name] ? {
//     borderColor: 'var(--red)', boxShadow: '0 0 0 3px var(--red-dim)'
//   } : {};

//   return (
//     <div>
//       <div className="page-header">
//         <div>
//           <div className="page-title">Buyer Registration</div>
//           <div className="page-subtitle">Register a new buyer</div>
//         </div>
//       </div>

//       {lastSaved && (
//         <div style={{ background:'var(--blue-dim)', border:'1px solid rgba(59,130,246,0.3)', borderRadius:'var(--radius)', padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:10, color:'var(--blue)' }}>
//           <CheckCircle size={18} />
//           <span style={{ fontSize:13, fontWeight:600 }}>
//             ✓ <strong>{lastSaved.name}</strong> {lastSaved.short_name ? `(${lastSaved.short_name})` : ''} registered on <strong>{lastSaved.entry_date}</strong>
//           </span>
//         </div>
//       )}

//       <div className="card">
//         <div className="card-title">🛒 Buyer Details</div>
//         <form onSubmit={submit} noValidate>
//           <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>

//             <Field label="Buyer Name" error={errors.name}>
//               <input
//                 className="form-input"
//                 name="name"
//                 value={form.name}
//                 onChange={handle}
//                 placeholder="FULL NAME"
//                 style={eb('name')}
//               />
//             </Field>

//             <Field label="Short Name / Nick Name" error={errors.short_name}>
//               <input
//                 className="form-input"
//                 name="short_name"
//                 value={form.short_name}
//                 onChange={handle}
//                 placeholder="e.g. RAJU, KUMAR"
//               />
//             </Field>

//             <Field label="Mobile Number" error={errors.mobile}>
//               <input
//                 className="form-input"
//                 name="mobile"
//                 value={form.mobile}
//                 onChange={handle}
//                 placeholder="10-digit mobile"
//                 maxLength={10}
//                 style={{ textTransform:'none' }}
//               />
//             </Field>

//             <Field label="Entry Date" error={errors.entry_date}>
//               <input
//                 className="form-input"
//                 type="date"
//                 name="entry_date"
//                 value={form.entry_date}
//                 onChange={handle}
//                 style={{ textTransform:'none', ...eb('entry_date') }}
//               />
//             </Field>

//           </div>

//           <div className="form-actions">
//             <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
//               <Save size={16} /> {loading ? 'Registering...' : 'Register Buyer'}
//             </button>
//             <button type="button" className="btn btn-secondary btn-lg" onClick={reset}>
//               <RotateCcw size={16} /> Clear Form
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


// -------------------------------------------------------------------------------------------------------------


import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { todayISO, toUpper, MATERIALS } from '../utils';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

const emptyForm = () => ({
  name:         '',
  short_name:   '',
  mobile:       '',
  material:     '',
  entry_date:   todayISO(),
});

function Field({ label, required, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
      </label>
      {children}
      {error && (
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'var(--red)', marginTop:3 }}>
          <AlertCircle size={11} /> {error}
        </div>
      )}
    </div>
  );
}

export default function BuyerRegistration() {
  const [form,      setForm]      = useState(emptyForm());
  const [loading,   setLoading]   = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [errors,    setErrors]    = useState({});
  const [existingBuyers, setExistingBuyers] = useState([]);

  // Load existing buyers once so short names can be checked for duplicates
  useEffect(() => {
    API.get('/api/buyers').then(res => {
      setExistingBuyers(res.data?.data || []);
    }).catch(() => {});
  }, []);

  const shortNameUpper = form.short_name.trim().toUpperCase();
  const shortNameConflict = shortNameUpper
    ? existingBuyers.find(b =>
        (b.lot_number || '').trim().toUpperCase() === shortNameUpper ||
        (b.serial_number || '').trim().toUpperCase() === shortNameUpper
      )
    : null;

  // Two different people can share a name (e.g. two "SUDHEER"s) — bills, receipts and
  // ledger prints show just the name, so an exact duplicate is genuinely ambiguous there.
  // Block it here and make the shopkeeper add a distinguishing initial up front, rather
  // than relying on the short name to silently disambiguate everywhere downstream.
  const nameUpper = form.name.trim().toUpperCase();
  const nameConflict = nameUpper
    ? existingBuyers.find(b => (b.name || '').trim().toUpperCase() === nameUpper)
    : null;

  const handle = (e) => {
    const { name, value } = e.target;
    const processed = ['name', 'short_name'].includes(name) ? toUpper(value) : value;
    setForm(f => ({ ...f, [name]: processed }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (shortNameConflict) {
      errs.short_name = `Already used by ${shortNameConflict.name} — pick a different short name`;
    }
    if (nameConflict) {
      errs.name = `A buyer named "${form.name}" already exists — add an initial to tell them apart (e.g. ${form.name} K)`;
    }
    return errs;
  };

  const reset = () => { setForm(emptyForm()); setLastSaved(null); setErrors({}); };

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
      const payload = {
        serial_number:  form.short_name || form.name.substring(0, 6) || todayISO(),
        name:           form.name || '—',
        mobile:         form.mobile || '0000000000',
        material:       form.material || 'GENERAL',
        num_bags:       0,
        lot_number:     form.short_name || '—',
        weight:         0,
        advance_amount: 0,
        entry_date:     form.entry_date,
        bag_data:       '[]',
      };

      const res = await API.post('/api/buyers', payload);
      if (res.data.success) {
        toast.success(`${form.name} registered successfully!`);
        setLastSaved({ ...form });
        setExistingBuyers(prev => [...prev, payload]);
        setForm(emptyForm());
        setErrors({});
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to register buyer', { duration: 5000 });
    } finally { setLoading(false); }
  };

  const eb = (name) => errors[name] ? {
    borderColor: 'var(--red)', boxShadow: '0 0 0 3px var(--red-dim)'
  } : {};

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Buyer Registration</div>
          <div className="page-subtitle">Register a new buyer</div>
        </div>
      </div>

      {lastSaved && (
        <div style={{ background:'var(--blue-dim)', border:'1px solid rgba(59,130,246,0.3)', borderRadius:'var(--radius)', padding:'14px 20px', marginBottom:20, display:'flex', alignItems:'center', gap:10, color:'var(--blue)' }}>
          <CheckCircle size={18} />
          <span style={{ fontSize:13, fontWeight:600 }}>
            ✓ <strong>{lastSaved.name}</strong>
            {lastSaved.short_name ? ` (${lastSaved.short_name})` : ''}
            {lastSaved.material ? ` — ${lastSaved.material}` : ''}
            {' '}registered on <strong>{lastSaved.entry_date}</strong>
          </span>
        </div>
      )}

      <div className="card">
        <div className="card-title">🛒 Buyer Details</div>
        <form onSubmit={submit} noValidate>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>

            <Field
              label="Buyer Name"
              error={errors.name || (nameConflict ? `A buyer named "${form.name}" already exists — add an initial (e.g. ${form.name} K)` : undefined)}
            >
              <input
                className="form-input"
                name="name"
                value={form.name}
                onChange={handle}
                placeholder="FULL NAME"
                style={nameConflict ? { borderColor: 'var(--red)', boxShadow: '0 0 0 3px var(--red-dim)' } : eb('name')}
              />
            </Field>

            <Field
              label="Short Name / Nick Name"
              error={errors.short_name || (shortNameConflict ? `Already used by ${shortNameConflict.name}` : undefined)}
            >
              <input
                className="form-input"
                name="short_name"
                value={form.short_name}
                onChange={handle}
                placeholder="e.g. RAJU, KUMAR"
                style={shortNameConflict ? { borderColor: 'var(--red)', boxShadow: '0 0 0 3px var(--red-dim)' } : undefined}
              />
            </Field>

            <Field label="Mobile Number" error={errors.mobile}>
              <input
                className="form-input"
                name="mobile"
                value={form.mobile}
                onChange={handle}
                placeholder="10-digit mobile"
                maxLength={10}
                style={{ textTransform:'none' }}
              />
            </Field>

            <Field label="Material" error={errors.material}>
              <select
                className="form-select"
                name="material"
                value={form.material}
                onChange={handle}
                style={{
                  width: '100%',
                  background: form.material ? 'rgba(26,86,219,0.08)' : undefined,
                  borderColor: form.material ? 'rgba(26,86,219,0.5)' : undefined,
                  color: form.material ? 'var(--blue)' : undefined,
                  fontWeight: form.material ? 700 : undefined,
                }}
              >
                <option value="">— Select Material —</option>
                {MATERIALS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </Field>

            <Field label="Entry Date" error={errors.entry_date}>
              <input
                className="form-input"
                type="date"
                name="entry_date"
                value={form.entry_date}
                onChange={handle}
                style={{ textTransform:'none', ...eb('entry_date') }}
              />
            </Field>

          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !!shortNameConflict || !!nameConflict}>
              <Save size={16} /> {loading ? 'Registering...' : 'Register Buyer'}
            </button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={reset}>
              <RotateCcw size={16} /> Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}