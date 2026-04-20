import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package } from 'lucide-react';
import axios from 'axios';
import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
import ConfirmDialog from '../ConfirmDialog';

const API = axios.create({ baseURL: '' });

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
    };
  });
}

// ─── Number to Indian Words ───────────────────────────────────
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

const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Bill Modal ───────────────────────────────────────────────
function BillModal({ seller, onClose }) {
  const printRef = useRef();
  const BLUE = '#1a56db';

  const totalBags = parseInt(seller.num_bags) || 0;
  let rawBags = [];
  try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

  const bagRows = Array.from({ length: totalBags }, (_, i) => {
    const b = rawBags[i] || {};
    return {
      srno:     String(i + 1).padStart(3, '0'),
      material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
      lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
      weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
      rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
      amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
    };
  });

  const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
  const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
  const labourAmt   = 20 * totalBags;
  const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
  const totalExp    = parseFloat((labourAmt + commission).toFixed(2));
  const netAmount   = parseFloat((grossAmount - totalExp).toFixed(2));
  const advance     = parseFloat(seller.advance_amount) || 0;
  const finalPay    = parseFloat((netAmount - advance).toFixed(2));

  const printBill = () => {
    const bagRowsHtml = bagRows.map((b, i) => `
      <tr style="background:${i%2===0?'#ffffff':'#eff6ff'}">
        <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;color:#333">${b.srno}</td>
        <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:left;font-size:10px;font-weight:700;color:#1a1a1a">${b.material}</td>
        <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-family:monospace;color:#444">${b.lot}</td>
        <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:600;color:#333">1</td>
        <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#1e40af">${b.weight != null ? b.weight : '—'}</td>
        <td style="border:1px solid #b8cef0;padding:5px 4px;text-align:center;font-size:10px;font-weight:800;color:#166534">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
        <td style="border:1px solid #b8cef0;padding:5px 6px;text-align:right;font-size:10px;font-weight:800;color:#1a56db">${b.amount != null ? inr(b.amount) : '—'}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Bill — ${seller.name}</title>
  <style>
    @page {
      size: A5;
      margin: 8mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #111;
      background: #fff;
    }
    table { width: 100%; border-collapse: collapse; }

    /* Outer page border */
    .page-wrapper {
      border: 3px solid #1a56db;
      border-radius: 4px;
      padding: 10px;
      position: relative;
      min-height: 95%;
    }
    /* Inner decorative border */
    .page-wrapper::after {
      content: '';
      display: block;
      position: absolute;
      top: 4px; left: 4px; right: 4px; bottom: 4px;
      border: 1px solid #a0bbf0;
      border-radius: 2px;
      pointer-events: none;
    }

    /* Header section */
    .header-box {
      text-align: center;
      border-bottom: 2.5px double #1a56db;
      padding-bottom: 8px;
      margin-bottom: 7px;
    }
    .header-props {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #444;
      margin-bottom: 5px;
    }
    .logo-circle {
      width: 36px; height: 36px;
      border-radius: 50%;
      border: 2.5px solid #1a56db;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 12px; color: #1a56db;
      background: #eff6ff;
    }
    .firm-name {
      font-size: 20px; font-weight: 900;
      color: #1a1a1a; line-height: 1.1; margin: 3px 0;
    }
    .firm-badge {
      display: inline-block;
      background: #1a56db; color: #fff;
      font-size: 8px; font-weight: 700;
      letter-spacing: 1.2px; padding: 2px 12px;
      border-radius: 2px; margin: 3px 0 1px;
    }
    .firm-type { font-size: 10px; font-weight: 700; color: #333; }
    .firm-addr { font-size: 9px; color: #666; margin-top: 2px; }

    /* Bill meta */
    .meta-table {
      border: 1.5px solid #1a56db;
      border-radius: 3px;
      margin-bottom: 6px;
      overflow: hidden;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 9px;
      font-size: 10px;
      border-bottom: 1px solid #cfe2ff;
    }
    .meta-row:last-child { border-bottom: none; }
    .meta-row strong { color: #1a56db; }

    /* Section label */
    .section-label {
      background: linear-gradient(90deg, #1a56db 0%, #2563eb 100%);
      color: #fff; font-size: 9px; font-weight: 700;
      letter-spacing: 1px; padding: 3px 9px;
      text-transform: uppercase;
    }

    /* Items table */
    .items-table thead tr th {
      background: #1a56db;
      color: #fff;
      padding: 6px 4px;
      font-size: 9.5px;
      font-weight: 700;
      border: 1px solid #1245b5;
      text-align: center;
    }
    .items-table tfoot td {
      background: #dbeafe;
      border-top: 2px solid #1a56db;
      border: 1px solid #b8cef0;
      padding: 6px 4px;
      font-weight: 800;
      color: #1e40af;
    }

    /* Deductions */
    .deduct-table td {
      border: 1px solid #b8cef0;
      padding: 6px 9px;
      font-size: 10px;
    }
    .deduct-label {
      background: #eff6ff;
      font-weight: 700;
      color: #1e40af;
      width: 58%;
    }
    .deduct-value {
      text-align: right;
      font-weight: 700;
      color: #dc2626;
    }

    /* Net amount row */
    .net-row td {
      background: #1a56db;
      color: #fff;
      padding: 9px 10px;
      font-weight: 900;
    }
    .net-label { font-size: 13px; }
    .net-value { text-align: right; font-size: 15px; letter-spacing: 0.3px; }

    /* In words */
    .in-words {
      border: 1.5px solid #1a56db;
      border-radius: 3px;
      padding: 5px 9px;
      font-size: 10px;
      margin-top: 6px;
      background: #f8fbff;
    }
    .in-words strong { color: #1a56db; }

    /* Footer */
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 18px;
    }
    .sign-box {
      text-align: center;
      border-top: 1px solid #555;
      padding-top: 4px;
      font-size: 9.5px;
      width: 120px;
      color: #444;
    }
    .for-firm { font-weight: 800; font-size: 11px; color: #1a1a1a; }
    .eoae { text-align: right; font-size: 9px; color: #888; margin-top: 3px; font-style: italic; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
<div class="page-wrapper">

  <!-- HEADER -->
  <div class="header-box">
    <div class="header-props">
      <span style="text-align:left">Prop. Praveen Heggani<br>Cell : 9611635183</span>
      <div class="logo-circle">PH</div>
      <span style="text-align:right">Prop. Pramod V.Heggani<br>Cell : 9448349836</span>
    </div>
    <div class="firm-name">Mr. Praveen Heggani</div>
    <div><span class="firm-badge">TAMARIND, GINGER, GARLIC, ONION &amp; Vegetables</span></div>
    <div class="firm-type">ORDER SUPPLIER &amp; COMMISSION AGENT</div>
    <div class="firm-addr">Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
  </div>

  <!-- META -->
  <div class="meta-table">
    <div class="meta-row">
      <span><strong>Bill No :</strong> ${seller.serial_number || '—'}</span>
      <span><strong>Date :</strong> ${fmtDate(seller.entry_date)}</span>
    </div>
    <div class="meta-row">
      <span><strong>Cust. Name :</strong> ${seller.name}</span>
    </div>
  </div>

  <!-- ITEMS TABLE -->
  <table class="items-table" style="margin-bottom:1px">
    <thead>
      <tr>
        <th>SrNo.</th>
        <th>Particular</th>
        <th>Lott No.</th>
        <th>Bags</th>
        <th>Weight (KG)</th>
        <th>RATE</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>${bagRowsHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="text-align:left;padding-left:9px;font-size:10px">TOTAL</td>
        <td style="text-align:center;font-size:11px">${totalBags}</td>
        <td style="text-align:center;font-size:11px">${totalWeight.toFixed(2)}</td>
        <td style="text-align:right;font-size:9px;color:#1e40af;font-weight:600">Gross Amt.</td>
        <td style="text-align:right;font-size:13px;color:#1a56db;padding-right:6px">&#8377; ${inr(grossAmount)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- DEDUCTIONS -->
  <table class="deduct-table" style="margin-top:2px">
    <tbody>
      <tr>
        <td class="deduct-label">Other Charges</td>
        <td class="deduct-value">− ₹ ${commission > 0 ? inr(commission) : '0.00'}</td>
      </tr>
      <tr>
        <td class="deduct-label">Hamali / Labour Charges</td>
        <td class="deduct-value">− ₹ ${labourAmt > 0 ? inr(labourAmt) : '0.00'}</td>
      </tr>
      <tr>
        <td class="deduct-label">Advance Paid</td>
        <td class="deduct-value">− ₹ ${advance > 0 ? inr(advance) : '0.00'}</td>
      </tr>
      <tr class="net-row">
        <td class="net-label">NET AMOUNT</td>
        <td class="net-value">&#8377; ${inr(Math.max(0, finalPay))}</td>
      </tr>
    </tbody>
  </table>

  <!-- IN WORDS -->
  <div class="in-words">
    <strong>In Words :</strong> ${toIndianWords(Math.max(0, finalPay))} Only
  </div>
  <div class="eoae">(E.&amp;O.E.)</div>

  <!-- FOOTER -->
  <div class="footer-row">
    <div class="sign-box">Receiver's Sign.</div>
    <div class="for-firm">For – Mr. Praveen Heggani</div>
  </div>

</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=700,height=900');
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580, width: '95%', padding: 0, overflow: 'hidden', borderRadius: 10 }} onClick={e => e.stopPropagation()}>

        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:BLUE, color:'#fff' }}>
          <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={printBill} style={{ background:'#fff', color:BLUE, border:'none', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
              <Printer size={13} /> Print / PDF (A5)
            </button>
            <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#fff', cursor:'pointer' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Preview — isolated from dark theme */}
        <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f0f4ff' }}>
          <div style={{ all:'initial', display:'block' }}>
          <div ref={printRef} style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'3px solid #1a56db', borderRadius:4, position:'relative' }}>

            {/* Inner decorative border on preview */}
            <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #a0bbf0', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>

            {/* Header */}
            <div style={{ textAlign:'center', borderBottom:'2.5px double #1a56db', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
                <span style={{ textAlign:'left' }}>Prop. Praveen V. Heggani<br/>Cell : 9611635183</span>
                <div style={{ width:40, height:40, borderRadius:'50%', border:'2.5px solid #1a56db', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1a56db', background:'#eff6ff' }}>PH</div>
                <span style={{ textAlign:'right' }}>Mohd. Pramod V.Heggani<br/>Cell : 9448349836</span>
              </div>
              <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>Mr. Praveen Heggani</div>
              <div><span style={{ display:'inline-block', background:'#1a56db', color:'#fff', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}>TAMARIND,GINGER,GARLIC,ONION &amp; Vegetables</span></div>
              <div style={{ fontSize:11, fontWeight:700 }}>ORDER SUPPLIER &amp; COMMISSION AGENT</div>
              <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}>Shop No.4, Rajendra Prasad APMC Market Yard, Humnabad – 585 330 Dist. Bidar (KA)</div>
            </div>

            {/* Meta */}
            <div style={{ border:'1.5px solid #1a56db', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
                <span><strong style={{ color:'#1a56db' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
                <span><strong style={{ color:'#1a56db' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
              </div>
              <div style={{ padding:'4px 8px', fontSize:11 }}>
                <strong style={{ color:'#1a56db' }}>Cust. Name :</strong> {seller.name}
              </div>
            </div>

            {/* Bag rows */}
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
              <thead>
                <tr>
                  {['SrNo.','Particular','Lott No.','Bags','Weight (KG)','RATE','Amount'].map(h => (
                    <th key={h} style={{ background:'#1a56db', color:'#fff', padding:'5px 4px', fontSize:10, fontWeight:700, border:'1px solid #1245b5', textAlign:'center' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bagRows.map((b, i) => (
                  <tr key={i} style={{ background: i%2===0 ? '#fff':'#eff6ff', color:'#111' }}>
                    <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10 }}>{b.srno}</td>
                    <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'left', fontSize:10, fontWeight:700 }}>{b.material}</td>
                    <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontFamily:'monospace' }}>{b.lot}</td>
                    <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:600 }}>1</td>
                    <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#1e40af' }}>
                      {b.weight != null ? b.weight : '—'}
                    </td>
                    <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:800, color:'#166534' }}>
                      {b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}
                    </td>
                    <td style={{ border:'1px solid #b8cef0', padding:'4px 5px', textAlign:'right', fontSize:10, fontWeight:800, color:'#1a56db' }}>
                      {b.amount != null ? inr(b.amount) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background:'#dbeafe', borderTop:'2px solid #1a56db' }}>
                  <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
                  <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800 }}>{totalBags}</td>
                  <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#1e40af' }}>{totalWeight.toFixed(2)}</td>
                  <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af' }}>Gross Amt.</td>
                  <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1a56db', fontSize:13 }}>₹ {inr(grossAmount)}</td>
                </tr>
              </tfoot>
            </table>

            {/* Deductions */}
            <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
              <tbody>
                <tr>
                  <td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Comm. (8%)</td>
                  <td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td>
                </tr>
                <tr>
                  <td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td>
                  <td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td>
                </tr>
                <tr>
                  <td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td>
                  <td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td>
                </tr>
                <tr style={{ background:'#1a56db' }}>
                  <td style={{ padding:'9px 10px', color:'#fff', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
                  <td style={{ padding:'9px 10px', color:'#fff', fontWeight:900, fontSize:16, textAlign:'right', letterSpacing:0.3 }}>₹ {inr(Math.max(0, finalPay))}</td>
                </tr>
              </tbody>
            </table>

            {/* In Words */}
            <div style={{ border:'1.5px solid #1a56db', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
              <strong style={{ color:'#1a56db' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
            </div>
            <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>

            {/* Footer */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
              <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
              <div style={{ fontWeight:800, fontSize:11 }}>For – Mr. Praveen Heggani</div>
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
  const num = parseInt(seller.num_bags) || 0;
  const lot = seller.lot_number || (seller.serial_number + '/' + num);

  const [rows,    setRows]    = useState(() => getBags(seller));
  const [nBags,   setNBags]   = useState(String(num));
  const [advance, setAdvance] = useState(String(seller.advance_amount || ''));
  const [labour,  setLabour]  = useState('20');
  const [saving,  setSaving]  = useState(false);

  const changeNBags = (v) => {
    setNBags(v);
    const n = parseInt(v) || 0;
    setRows(prev => Array.from({ length: n }, (_, i) =>
      prev[i] || { lot, weight: '', rate: '', amount: '' }
    ));
  };

  const update = (i, field, val) => {
    setRows(prev => prev.map((r, j) => {
      if (j !== i) return r;
      const next = { ...r, [field]: val };
      if (field === 'weight' || field === 'rate') {
        const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
        const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
        next.amount = w && rt ? ((w * rt) / 100).toFixed(2) : '';
      }
      return next;
    }));
  };

  const bags        = parseInt(nBags) || 0;
  const totalW      = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
  const grossAmount = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const labourAmt   = (parseFloat(labour) || 0) * bags;
  const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
  const totalDeduct = parseFloat((labourAmt + commission).toFixed(2));
  const netPayable  = parseFloat((grossAmount - totalDeduct).toFixed(2));
  const finalPay    = parseFloat((netPayable - (parseFloat(advance) || 0)).toFixed(2));

  const ratesDone = rows.filter(r => parseFloat(r.rate) > 0).length;
  const wtsDone   = rows.filter(r => parseFloat(r.weight) > 0).length;

  const save = async () => {
    if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
    setSaving(true);
    try {
      const bag_data = rows.map(r => ({
        lot,
        weight: parseFloat(r.weight) || 0,
        rate:   parseFloat(r.rate)   || 0,
        amount: parseFloat(r.amount) || 0,
      }));
      await API.put('/api/sellers/' + seller.id, {
        num_bags:       bags,
        weight:         totalW,
        amount:         netPayable,
        advance_amount: parseFloat(advance) || 0,
        rate_fixed:     totalW > 0 && grossAmount > 0 ? parseFloat((grossAmount / totalW * 100).toFixed(2)) : 0,
        bag_data:       JSON.stringify(bag_data),
      });
      toast.success('Saved! Final payable: ₹' + fmtINR(finalPay));
      onSave(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed');
    } finally { setSaving(false); }
  };

  const iStyle = (val, col) => ({
    background:   val ? col + '11' : 'var(--bg-panel)',
    border:       '1px solid ' + (val ? col + '66' : 'var(--border-light)'),
    borderRadius: 7, padding: '8px 11px',
    color:        val ? col : 'var(--text-muted)',
    fontFamily:   'var(--font-body)', fontSize: 13, fontWeight: 700,
    outline: 'none', width: '100%',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 860, width: '95%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">✏️ Edit Seller — {seller.name}</div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Info chips */}
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

        {/* Top fields */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14, marginBottom:18 }}>
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

        {/* Bag table */}
        {rows.length > 0 && (
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

            <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 120px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
              {['#','Lot','Weight (kg)','Rate (₹/100kg)','Amount (₹)'].map(h=>(
                <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.1, textTransform:'uppercase', color:'var(--text-muted)' }}>{h}</div>
              ))}
            </div>

            <div style={{ border:'1px solid var(--border)', borderRadius:'0 0 8px 8px', overflow:'hidden', maxHeight:280, overflowY:'auto' }}>
              {rows.map((r,i)=>(
                <div key={i} style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 120px', gap:8, padding:'9px 13px', background:i%2===0?'var(--bg-card)':'var(--bg-panel)', borderBottom:i<rows.length-1?'1px solid var(--border)':'none', alignItems:'center' }}>
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
                  <div style={{ fontSize:13, fontWeight:800, color:r.amount?'var(--accent)':'var(--text-muted)', textAlign:'right' }}>
                    {r.amount?'₹'+fmtINR(r.amount):'—'}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 120px', gap:8, padding:'10px 13px', marginTop:8, background:'var(--bg-panel)', border:'1px solid var(--border)', borderRadius:8, alignItems:'center' }}>
              <div/><div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)' }}>TOTAL</div>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--blue)' }}>{totalW.toFixed(2)} kg</div>
              <div style={{ fontSize:12, color:ratesDone===rows.length?'var(--green)':'var(--text-muted)' }}>{ratesDone}/{rows.length} rates {ratesDone===rows.length?'✓':''}</div>
              <div style={{ fontSize:14, fontWeight:800, color:'var(--accent)', textAlign:'right' }}>{grossAmount>0?'₹'+fmtINR(grossAmount):'—'}</div>
            </div>
          </>
        )}

        {/* Payment Calculation */}
        {grossAmount > 0 && (
          <div style={{ marginTop:16, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ background:'var(--bg-panel)', padding:'10px 18px', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14, color:'var(--text-primary)' }}>💰 Payment Calculation</span>
            </div>
            <div>
              {[
                { label:'Gross Amount',          sub:`${rows.length} bags × Rate`,        val:`₹ ${fmtINR(grossAmount)}`,                 color:'var(--accent)',         fs:16, minus:false },
                { label:'− Labour / Hamali',     sub:`₹${labour||20} × ${bags} bags`,    val:`− ₹ ${fmtINR(labourAmt)}`,               color:'var(--red)',            fs:15, minus:true  },
                { label:'− Other Charges',      sub:`8% of ₹${fmtINR(grossAmount)}`,   val:`− ₹ ${fmtINR(commission)}`,              color:'var(--red)',            fs:15, minus:true  },
                { label:'Net Amount',             sub:'Gross − Labour − Commission',       val:`₹ ${fmtINR(netPayable)}`,                 color:'var(--blue)',           fs:16, minus:false, highlight:true },
                { label:'− Advance Already Paid', sub:'',                                  val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`,   color:'var(--text-secondary)', fs:15, minus:true  },
              ].map((row, i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
                    {row.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
                  </div>
                  <div style={{ fontSize:row.fs, fontWeight:800, color:row.color, fontFamily:'var(--font-display)' }}>{row.val}</div>
                </div>
              ))}
              {/* Final Pay */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 18px', background:finalPay>=0?'var(--green-dim)':'var(--red-dim)' }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:finalPay>=0?'var(--green)':'var(--red)', fontFamily:'var(--font-display)' }}>
                    {finalPay >= 0 ? '✅ Final Amount to Pay Seller' : '⚠️ Seller Owes Back'}
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

// ─── Main ─────────────────────────────────────────────────────
export default function SellerList() {
  const [sellers,  setSellers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [fDate,    setFDate]    = useState('');
  const [fMat,     setFMat]     = useState('');
  const [bill,     setBill]     = useState(null);
  const [editing,  setEditing]  = useState(null);
  const [confirm,  setConfirm]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/api/sellers', { params: fDate ? { date: fDate } : {} });
      setSellers(res.data.data);
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

  const clear = () => { setSearch(''); setFDate(''); setFMat(''); };

  const list = sellers.filter(s => {
    const q = search.toLowerCase();
    return (!q || [s.name,s.mobile,s.lot_number,s.serial_number,s.material].some(v=>v?.toLowerCase().includes(q)))
      && (!fMat || s.material===fMat);
  });

  const tot = list.reduce((a,s)=>({
    bags: a.bags+Number(s.num_bags||0), wt: a.wt+Number(s.weight||0),
    adv:  a.adv+Number(s.advance_amount||0), amt: a.amt+Number(s.amount||0),
  }),{ bags:0, wt:0, adv:0, amt:0 });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Seller List</div>
          <div className="page-subtitle">{loading?'Loading...':`${sellers.length} sellers`}</div>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button>
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{ flex:2 }}>
          <Search className="search-icon" size={16}/>
          <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, lot no..." style={{ textTransform:'none' }}/>
        </div>
        <input className="form-input" type="date" value={fDate} onChange={e=>setFDate(e.target.value)} style={{ textTransform:'none', flex:1 }}/>
        <select className="form-select" value={fMat} onChange={e=>setFMat(e.target.value)} style={{ flex:1 }}>
          <option value="">All Materials</option>
          {MATERIALS.map(m=><option key={m}>{m}</option>)}
        </select>
        {(search||fDate||fMat)&&<button className="btn btn-secondary" onClick={clear}><X size={14}/> Clear</button>}
      </div>

      {list.length>0&&(
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
        {loading?<div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading...</div>
        :list.length===0?(
          <div className="empty-state"><div className="empty-state-icon">👨‍🌾</div><h3>No sellers found</h3></div>
        ):(
          <table>
            <thead>
              <tr>
                <th>#</th><th>Sr</th><th>Name</th><th>Mobile</th><th>Material</th>
                <th>Bags</th><th>Lot</th><th>Weight</th><th>Amount</th><th>Advance</th><th>Balance</th><th>Date</th>
                <th style={{ textAlign:'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s,i)=>{
                const bal=(s.amount||0)-(s.advance_amount||0);
                let bags=[]; try{bags=JSON.parse(s.bag_data||'[]')}catch{}
                const rd=bags.filter(b=>Number(b.rate)>0).length;
                return(
                  <tr key={s.id}>
                    <td className="td-muted" style={{ fontSize:12 }}>{i+1}</td>
                    <td className="td-muted" style={{ fontSize:11, fontFamily:'monospace' }}>{s.serial_number}</td>
                    <td style={{ fontWeight:600 }}>{s.name}</td>
                    <td className="td-muted">{s.mobile&&s.mobile!=='0000000000'?s.mobile:'—'}</td>
                    <td>{s.material&&s.material!=='GENERAL'
                      ?<span className={`badge ${MATERIAL_BADGE[s.material]||'badge-amber'}`}>{s.material}</span>
                      :<span className="td-muted">—</span>}
                    </td>
                    <td style={{ textAlign:'center', fontWeight:600 }}>{s.num_bags}</td>
                    <td style={{ fontFamily:'monospace', fontSize:12 }}>{s.lot_number}</td>
                    <td style={{ fontWeight:600 }}>{fmtNum(s.weight)}</td>
                    <td style={{ fontWeight:700, color:'var(--accent)' }}>
                      {s.amount?`₹${fmtINR(s.amount)}`:<span style={{ fontSize:11, color:'var(--text-muted)' }}>{rd}/{bags.length} rates</span>}
                    </td>
                    <td className="td-muted">{s.advance_amount?`₹${fmtINR(s.advance_amount)}`:'—'}</td>
                    <td style={{ fontWeight:600, color:bal>0?'var(--red)':'var(--green)' }}>{s.amount?`₹${fmtINR(bal)}`:'—'}</td>
                    <td className="td-muted" style={{ fontSize:12 }}>{fmtDate(s.entry_date)}</td>
                    <td>
                      <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
                        <button className="btn btn-blue btn-sm" onClick={()=>setEditing(s)} title="Edit"><Edit2 size={13}/></button>
                        <button className="btn btn-green btn-sm" onClick={()=>setBill(s)} title="Bill"><Eye size={13}/></button>
                        <button className="btn btn-sm" style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }} onClick={()=>setBill(s)} title="Print"><Printer size={13}/></button>
                        <button className="btn btn-red btn-sm" onClick={()=>del(s.id,s.name)} title="Delete"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {list.length>1&&(
              <tfoot>
                <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
                  <td colSpan={5} style={{ padding:'11px 15px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>TOTALS ({list.length})</td>
                  <td style={{ padding:'11px 15px', fontWeight:800 }}>{tot.bags}</td>
                  <td/>
                  <td style={{ padding:'11px 15px', fontWeight:800 }}>{fmtNum(tot.wt)}</td>
                  <td style={{ padding:'11px 15px', fontWeight:800, color:'var(--accent)' }}>₹{fmtINR(tot.amt)}</td>
                  <td style={{ padding:'11px 15px', fontWeight:700 }}>₹{fmtINR(tot.adv)}</td>
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

      <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}input[type=number]{-moz-appearance:textfield}`}</style>
    </div>
  );
}