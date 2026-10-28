// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import toast from 'react-hot-toast';
// import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package, CheckSquare } from 'lucide-react';
// import axios from 'axios';
// import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, MATERIALS } from '../utils';
// import ConfirmDialog from '../ConfirmDialog';
// import mdLogo from '../assets/MD_logo.png';

// const API = axios.create({ baseURL: 'http://localhost:5000' });

// const REPORT_BRAND = {
  
//   leftProp: 'Prop. MD.Moinuddin',
//   leftPhone: '9448890808',
//   rightProp: 'Cell: 8483270595',
//   rightPhone: '8277388885',
//   logoSrc: mdLogo,
//   firmName: 'MD. Moinuddin',
//   badge: 'GINGER, GARLIC, ONION,TAMARIND & VEGETABLES',
//   firmType: 'ORDER SUPPLIER & COMMISSION AGENT',
//   firmAddress: 'Shop No.2, Rajendra Prasad APMC Market Yard, Humnabad - 585 330 Dist. Bidar (KA)',
// };

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

// // const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// const inr = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');

// // ─── Build single bill HTML — A5 optimised ───────────────────
// // function buildBillHTML(seller) {
// //   const totalBags = parseInt(seller.num_bags) || 0;
// //   let rawBags = [];
// //   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

// //   const bagRows = Array.from({ length: totalBags }, (_, i) => {
// //     const b = rawBags[i] || {};
// //     return {
// //       srno:     String(i + 1).padStart(2, '0'),
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
// //   const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
// //   const advance     = parseFloat(seller.advance_amount) || 0;
// //   const finalPay    = parseFloat((netAmount - advance).toFixed(2));

// //   const bagRowsHtml = bagRows.map((b, i) => `
// //     <tr style="background:${i%2===0?'#fff':'#eff6ff'}">
// //       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;">${b.srno}</td>
// //       <td style="border:1px solid #b8cef0;padding:1px 3px;text-align:left;font-size:7px;font-weight:700;">${b.material}</td>
// //       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:6.5px;font-family:monospace;">${b.lot}</td>
// //       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;">1</td>
// //       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;font-weight:700;color:#1e40af;">${b.weight != null ? b.weight : '—'}</td>
// //       <td style="border:1px solid #b8cef0;padding:1px 2px;text-align:center;font-size:7px;font-weight:700;color:#166534;">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
// //       <td style="border:1px solid #b8cef0;padding:1px 3px;text-align:right;font-size:7px;font-weight:700;color:#1a56db;">${b.amount != null ? inr(b.amount) : '—'}</td>
// //     </tr>`).join('');

// //   const html = `
// // <div style="width:100%;font-family:Arial,sans-serif;font-size:7px;color:#111;background:#fff;
// //   line-height:1.25;border:1.5px solid #1a56db;border-radius:2px;padding:4px 5px;
// //   box-sizing:border-box;position:relative;">

// //   <div style="position:absolute;top:2px;left:2px;right:2px;bottom:2px;
// //     border:0.5px solid #a0bbf0;border-radius:1px;pointer-events:none;"></div>

// //   <!-- HEADER -->
// //   <div style="text-align:center;border-bottom:1.5px double #1a56db;padding-bottom:3px;margin-bottom:3px;">
// //     <div style="display:flex;justify-content:space-between;align-items:center;font-size:6.5px;color:#444;margin-bottom:2px;">
// //       <span style="text-align:left;line-height:1.4;"><br></span>
// //       <div style="width:22px;height:22px;border-radius:50%;border:1.5px solid #1a56db;
// //         display:inline-flex;align-items:center;justify-content:center;
// //         font-weight:900;font-size:8px;color:#1a56db;background:#eff6ff;flex-shrink:0;">PH</div>
// //       <span style="text-align:right;line-height:1.4;"><br></span>
// //     </div>
// //     <div style="font-size:12px;font-weight:900;color:#1a1a1a;line-height:1;margin:1px 0;">SELLERS BILL</div>
// //     <div style="margin:1px 0;">
// //       <span style="display:inline-block;background:#1a56db;color:#fff;font-size:6px;font-weight:700;
// //         letter-spacing:0.6px;padding:1px 6px;border-radius:1px;">
        
// //       </span>
// //     </div>
// //     <div style="font-size:7px;font-weight:700;color:#333;"></div>
// //     <div style="font-size:6px;color:#666;margin-top:1px;"></div>
// //   </div>

// //   <!-- META -->
// //   <div style="border:1px solid #1a56db;border-radius:2px;margin-bottom:3px;overflow:hidden;">
// //     <div style="display:flex;justify-content:space-between;padding:2px 5px;font-size:7.5px;border-bottom:1px solid #cfe2ff;">
// //       <span><strong style="color:#1a56db">Bill No:</strong> ${seller.serial_number || '—'}</span>
// //       <span><strong style="color:#1a56db">Date:</strong> ${fmtDate(seller.entry_date)}</span>
// //     </div>
// //     <div style="padding:2px 5px;font-size:7.5px;">
// //       <strong style="color:#1a56db">Cust. Name:</strong> ${seller.name}
// //     </div>
// //   </div>

// //   <!-- ITEMS TABLE -->
// //   <table style="width:100%;border-collapse:collapse;margin-bottom:1px;table-layout:fixed;">
// //     <colgroup>
// //       <col style="width:6%">
// //       <col style="width:18%">
// //       <col style="width:12%">
// //       <col style="width:6%">
// //       <col style="width:13%">
// //       <col style="width:13%">
// //       <col style="width:32%">
// //     </colgroup>
// //     <thead>
// //       <tr>
// //         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Sr.</th>
// //         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Particular</th>
// //         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Lot No.</th>
// //         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Bags</th>
// //         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Wt.(KG)</th>
// //         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">RATE</th>
// //         <th style="background:#1a56db;color:#fff;padding:2px 1px;font-size:6.5px;font-weight:700;border:1px solid #1245b5;text-align:center;">Amount (&#8377;)</th>
// //       </tr>
// //     </thead>
// //     <tbody>${bagRowsHtml}</tbody>
// //     <tfoot>
// //       <tr style="background:#dbeafe;border-top:1.5px solid #1a56db;">
// //         <td colspan="3" style="border:1px solid #b8cef0;padding:2px 3px;font-weight:800;color:#1e40af;text-align:left;font-size:7px;">TOTAL</td>
// //         <td style="border:1px solid #b8cef0;padding:2px 1px;text-align:center;font-weight:800;font-size:7px;">${totalBags}</td>
// //         <td style="border:1px solid #b8cef0;padding:2px 1px;text-align:center;font-weight:800;color:#1e40af;font-size:7px;">${totalWeight.toFixed(2)}</td>
// //         <td style="border:1px solid #b8cef0;padding:2px 1px;text-align:right;font-size:6.5px;color:#1e40af;font-weight:600;">Gross</td>
// //         <td style="border:1px solid #b8cef0;padding:2px 3px;text-align:right;font-weight:800;color:#1a56db;font-size:9px;">&#8377; ${inr(grossAmount)}</td>
// //       </tr>
// //     </tfoot>
// //   </table>

// //   <!-- DEDUCTIONS -->
// //   <table style="width:100%;border-collapse:collapse;margin-top:1px;table-layout:fixed;">
// //     <colgroup><col style="width:62%"><col style="width:38%"></colgroup>
// //     <tbody>
// //       <tr>
// //         <td style="border:1px solid #b8cef0;padding:2px 5px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7px;">Other Charges </td>
// //         <td style="border:1px solid #b8cef0;padding:2px 5px;text-align:right;font-weight:700;color:#dc2626;font-size:7.5px;">− &#8377; ${inr(commission)}</td>
// //       </tr>
// //       <tr>
// //         <td style="border:1px solid #b8cef0;padding:2px 5px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7px;">Hamali / Labour Charges</td>
// //         <td style="border:1px solid #b8cef0;padding:2px 5px;text-align:right;font-weight:700;color:#dc2626;font-size:7.5px;">− &#8377; ${inr(labourAmt)}</td>
// //       </tr>
// //       <tr>
// //         <td style="border:1px solid #b8cef0;padding:2px 5px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:7px;">Advance Paid</td>
// //         <td style="border:1px solid #b8cef0;padding:2px 5px;text-align:right;font-weight:700;color:#dc2626;font-size:7.5px;">− &#8377; ${inr(advance)}</td>
// //       </tr>
// //       <tr style="background:#1a56db;">
// //         <td style="padding:5px 7px;color:#fff;font-weight:900;font-size:10px;">NET AMOUNT</td>
// //         <td style="padding:5px 7px;color:#fff;font-weight:900;font-size:12px;text-align:right;">&#8377; ${inr(Math.max(0, finalPay))}</td>
// //       </tr>
// //     </tbody>
// //   </table>

// //   <!-- IN WORDS -->
// //   <div style="border:1px solid #1a56db;border-radius:2px;padding:2px 5px;font-size:7px;margin-top:3px;background:#f8fbff;line-height:1.4;">
// //     <strong style="color:#1a56db;">In Words:</strong> ${toIndianWords(Math.max(0, finalPay))} Only
// //   </div>
// //   <div style="text-align:right;font-size:6.5px;color:#888;margin-top:1px;font-style:italic;">(E.&amp;O.E.)</div>

// //   <!-- FOOTER -->
// //   <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:8px;">
// //     <div style="text-align:center;border-top:1px solid #555;padding-top:2px;font-size:7px;width:80px;color:#444;">Receiver's Sign.</div>
// //     <div style="font-weight:800;font-size:7.5px;">For – Mr. Praveen Heggani</div>
// //   </div>
// // </div>`;

// //   return { html, finalPay };
// // }


// function buildBillHTML(seller) {
//   const totalBags = parseInt(seller.num_bags) || 0;
//   let rawBags = [];
//   try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}
 
//   const bagRows = Array.from({ length: totalBags }, (_, i) => {
//     const b = rawBags[i] || {};
//     return {
//       srno:     String(i + 1).padStart(2, '0'),
//       material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'TAMARIND',
//       lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
//       weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
//       rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
//       amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
//     };
//   });
 
//   const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
//   const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
//   // const labourAmt   = 20 * totalBags;
//   // const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   // const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
//   // const advance     = parseFloat(seller.advance_amount) || 0;
//   // const finalPay    = parseFloat((netAmount - advance).toFixed(2));

//   const labourAmt   = 20 * totalBags;
//   const commission  = Math.round(grossAmount * 8 / 100);
//   const netAmount   = Math.round(grossAmount - labourAmt - commission);
//   const advance     = Math.round(parseFloat(seller.advance_amount) || 0);
//   const finalPay    = Math.round(netAmount - advance);
 
//   const bagRowsHtml = bagRows.map((b, i) => `
//     <tr style="background:${i % 2 === 0 ? '#fff' : '#eff6ff'};">
//       <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:10px;">${b.srno}</td>
//       <td style="border:1px solid #b8cef0;padding:4px 5px;text-align:left;font-size:10px;font-weight:700;">${b.material}</td>
//       <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:9.5px;font-family:monospace;">${b.lot}</td>
//       <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:10px;">1</td>
//       <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:10px;font-weight:700;color:#1e40af;">${b.weight != null ? b.weight : '—'}</td>
//       <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:10px;font-weight:700;color:#166534;">${b.rate != null ? Number(b.rate).toLocaleString('en-IN') : '—'}</td>
//       <td style="border:1px solid #b8cef0;padding:4px 5px;text-align:right;font-size:10px;font-weight:700;color:#1e40af;">${b.amount != null ? inr(b.amount) : '—'}</td>
//     </tr>`).join('');
 
//   const html = `
// <div style="width:100%;height:100%;font-family:Arial,sans-serif;font-size:10px;color:#111;
//   background:#fff;line-height:1.35;border:2px solid #93c5fd;border-radius:3px;
//   padding:6px 8px;box-sizing:border-box;position:relative;display:flex;
//   flex-direction:column;gap:4px;">

//   <div style="position:absolute;top:3px;left:3px;right:3px;bottom:3px;
//     border:0.75px solid #dbeafe;border-radius:2px;pointer-events:none;"></div>

//   <!-- HEADER -->
//   <div style="text-align:center;border-bottom:2px double #93c5fd;padding-bottom:5px;">
//     <div style="width:40px;height:40px;margin:0 auto 4px;border-radius:50%;border:2px solid #93c5fd;
//       display:flex;align-items:center;justify-content:center;
//       color:#1e40af;background:#eff6ff;overflow:hidden;">
//       <img src="${REPORT_BRAND.logoSrc}" alt="MD" style="width:100%;height:100%;object-fit:contain;" />
//     </div>
//     <div style="font-size:17px;font-weight:900;color:#1a1a1a;line-height:1;letter-spacing:0.5px;">SELLERS BILL</div>
//   </div>
 
//   <!-- META ROW -->
//   <div style="border:1px solid #93c5fd;border-radius:3px;overflow:hidden;">
//     <div style="display:flex;justify-content:space-between;padding:4px 8px;font-size:10.5px;border-bottom:1px solid #cfe2ff;background:#f0f6ff;">
//       <span><strong style="color:#1e40af;">Bill No:</strong> ${seller.serial_number || '—'}</span>
//       <span><strong style="color:#1e40af;">Date:</strong> ${fmtDate(seller.entry_date)}</span>
//     </div>
//     <div style="padding:4px 8px;font-size:10.5px;">
//       <strong style="color:#1e40af;">Cust. Name:</strong> ${seller.name}
//     </div>
//   </div>
 
//   <!-- ITEMS TABLE -->
//   <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
//     <colgroup>
//       <col style="width:6%">
//       <col style="width:19%">
//       <col style="width:13%">
//       <col style="width:6%">
//       <col style="width:13%">
//       <col style="width:13%">
//       <col style="width:30%">
//     </colgroup>
//     <thead>
//       <tr>
//         <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Sr.</th>
//         <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Particular</th>
//         <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Lot No.</th>
//         <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Bags</th>
//         <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Wt.(KG)</th>
//         <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">RATE</th>
//         <th style="background:#dbeafe;color:#1e3a8a;padding:4px 2px;font-size:9px;font-weight:700;border:1px solid #93c5fd;text-align:center;">Amount (&#8377;)</th>
//       </tr>
//     </thead>
//     <tbody>${bagRowsHtml}</tbody>
//     <tfoot>
//       <tr style="background:#f0f7ff;border-top:1.5px solid #93c5fd;">
//         <td colspan="3" style="border:1px solid #b8cef0;padding:4px 5px;font-weight:800;color:#1e40af;text-align:left;font-size:10px;">TOTAL</td>
//         <td style="border:1px solid #b8cef0;padding:4px 2px;text-align:center;font-weight:800;font-size:10px;">${totalBags}</td>
//         <td style="border:1px solid #b8cef0;padding:4px 2px;text-align:center;font-weight:800;color:#1e40af;font-size:10px;">${totalWeight.toFixed(2)}</td>
//         <td style="border:1px solid #b8cef0;padding:4px 2px;text-align:right;font-size:9px;color:#1e40af;font-weight:600;">Gross</td>
//         <td style="border:1px solid #b8cef0;padding:4px 5px;text-align:right;font-weight:800;color:#1e40af;font-size:12px;">&#8377; ${inr(grossAmount)}</td>
//       </tr>
//     </tfoot>
//   </table>
 
//   <!-- DEDUCTIONS -->
//   <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
//     <colgroup><col style="width:62%"><col style="width:38%"></colgroup>
//     <tbody>
//       <tr>
//         <td style="border:1px solid #b8cef0;padding:4px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Other Charges</td>
//         <td style="border:1px solid #b8cef0;padding:4px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:10.5px;">− &#8377; ${inr(commission)}</td>
//       </tr>
//       <tr>
//         <td style="border:1px solid #b8cef0;padding:4px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Hamali / Labour Charges</td>
//         <td style="border:1px solid #b8cef0;padding:4px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:10.5px;">− &#8377; ${inr(labourAmt)}</td>
//       </tr>
//       <tr>
//         <td style="border:1px solid #b8cef0;padding:4px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Advance Paid</td>
//         <td style="border:1px solid #b8cef0;padding:4px 8px;text-align:right;font-weight:700;color:#dc2626;font-size:10.5px;">− &#8377; ${inr(advance)}</td>
//       </tr>
//       <tr style="background:#dbeafe;">
//         <td style="padding:7px 10px;color:#1e3a8a;font-weight:900;font-size:13px;">NET AMOUNT</td>
//         <td style="padding:7px 10px;color:#1e3a8a;font-weight:900;font-size:15px;text-align:right;">&#8377; ${inr(Math.max(0, finalPay))}</td>
//       </tr>
//     </tbody>
//   </table>
 
//   <!-- IN WORDS -->
//   <div style="border:1px solid #93c5fd;border-radius:3px;padding:4px 8px;font-size:9.5px;background:#f8fbff;line-height:1.5;">
//     <strong style="color:#1e40af;">In Words:</strong> ${toIndianWords(Math.max(0, finalPay))} Only
//   </div>
 
//   <div style="text-align:right;font-size:8.5px;color:#888;font-style:italic;">(E.&amp;O.E.)</div>
 
//   <!-- FOOTER -->
//   <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:auto;padding-top:8px;">
//     <div style="text-align:center;border-top:1px solid #555;padding-top:3px;font-size:9.5px;width:90px;color:#444;">Receiver's Sign.</div>
//     <div style="font-weight:800;font-size:10px;"></div>
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
// // function wrapInPrintPage(billsHtml, title) {
// //   return `<!DOCTYPE html>
// // <html>
// // <head>
// //   <meta charset="UTF-8">
// //   <title>${title}</title>
// //   <style>
// //     @page {
// //       size: A5 portrait;
// //       margin: 3mm;
// //     }
// //     *, *::before, *::after {
// //       box-sizing: border-box;
// //       margin: 0;
// //       padding: 0;
// //     }
// //     html, body {
// //       width: 100%;
// //       background: #fff;
// //       font-family: Arial, sans-serif;
// //     }
// //     body {
// //       display: flex;
// //       flex-direction: column;
// //       align-items: center;
// //     }
// //     .bill-page {
// //       width: 142mm;
// //       max-width: 142mm;
// //       page-break-after: always;
// //     }
// //     .bill-page:last-child {
// //       page-break-after: avoid;
// //     }
// //     @media print {
// //       body {
// //         -webkit-print-color-adjust: exact;
// //         print-color-adjust: exact;
// //       }
// //     }
// //   </style>
// // </head>
// // <body>
// // ${billsHtml}
// // <script>window.onload = function(){ window.print(); }<\/script>
// // </body>
// // </html>`;
// // }


// function wrapInPrintPage(billsHtml, title) {
//   return `<!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <title>${title}</title>
//   <style>
//     @page {
//       size: A5 portrait;
//       margin: 0;
//     }
//     *, *::before, *::after {
//       box-sizing: border-box;
//       margin: 0;
//       padding: 0;
//     }
//     html, body {
//       width: 148mm;
//       height: 210mm;
//       background: #fff;
//       font-family: Arial, sans-serif;
//     }
//     .bill-page {
//       width: 148mm;
//       height: 210mm;
//       padding: 5mm;
//       page-break-after: always;
//       overflow: hidden;
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
//   // const labourAmt   = 20 * totalBags;
//   // const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   // const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
//   // const advance     = parseFloat(seller.advance_amount) || 0;
//   // const finalPay    = parseFloat((netAmount - advance).toFixed(2));

//   const labourAmt   = 20 * totalBags;
//   const commission  = Math.round(grossAmount * 8 / 100);
//   const netAmount   = Math.round(grossAmount - labourAmt - commission);
//   const advance     = Math.round(parseFloat(seller.advance_amount) || 0);
//   const finalPay    = Math.round(netAmount - advance);

//   const printBill = () => {
//     const { html } = buildBillHTML(seller);
//     const billsHtml = `<div class="bill-page">${html}</div>`;
//     openPrintWindow(wrapInPrintPage(billsHtml, `Bill — ${seller.name}`));
//   };

//   // preview uses slightly larger sizes for on-screen readability
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal" style={{ maxWidth:560, width:'95%', padding:0, overflow:'hidden', borderRadius:10 }} onClick={e=>e.stopPropagation()}>
//         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:'#dbeafe', color:'#1e3a8a' }}>
//           <span style={{ fontWeight:700, fontSize:14 }}>🧾 Seller Bill</span>
//           <div style={{ display:'flex', gap:8 }}>
//             <button onClick={printBill} style={{ background:'#fff', color:'#1e40af', border:'1px solid #93c5fd', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
//               <Printer size={13}/> Print / PDF (A5)
//             </button>
//             <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#1e3a8a', cursor:'pointer' }}><X size={18}/></button>
//           </div>
//         </div>
//         <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f5f8ff' }}>
//           <div style={{ all:'initial', display:'block' }}>
//             <div style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', display:'block', lineHeight:1.4, border:'2px solid #93c5fd', borderRadius:4, position:'relative' }}>
//               <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #dbeafe', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>
//               <div style={{ textAlign:'center', borderBottom:'2px double #93c5fd', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
//                 <div style={{ width:48, height:48, margin:'0 auto 6px', borderRadius:'50%', border:'2px solid #93c5fd', display:'flex', alignItems:'center', justifyContent:'center', color:'#1e40af', background:'#eff6ff', overflow:'hidden' }}>
//                   <img src={REPORT_BRAND.logoSrc} alt="MD" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
//                 </div>
//                 <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}>SELLERS BILL</div>
//               </div>
//               <div style={{ border:'1px solid #93c5fd', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
//                 <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11 }}>
//                   <span><strong style={{ color:'#1e40af' }}>Bill No :</strong> {seller.serial_number || '—'}</span>
//                   <span><strong style={{ color:'#1e40af' }}>Date :</strong> {fmtDate(seller.entry_date)}</span>
//                 </div>
//                 <div style={{ padding:'4px 8px', fontSize:11 }}>
//                   <strong style={{ color:'#1e40af' }}>Cust. Name :</strong> {seller.name}
//                 </div>
//               </div>
//               <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
//                 <thead>
//                   <tr>
//                     {['Sr.','Particular','Lot No.','Bags','Weight(KG)','RATE','Amount'].map(h=>(
//                       <th key={h} style={{ background:'#dbeafe', color:'#1e3a8a', padding:'5px 4px', fontSize:9.5, fontWeight:700, border:'1px solid #93c5fd', textAlign:'center' }}>{h}</th>
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
//                   <tr style={{ background:'#f0f7ff', borderTop:'1.5px solid #93c5fd' }}>
//                     <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#1e40af' }}>{totalWeight.toFixed(2)}</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af' }}>Gross Amt.</td>
//                     <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:800, color:'#1e40af', fontSize:13 }}>₹ {inr(grossAmount)}</td>
//                   </tr>
//                 </tfoot>
//               </table>
//               <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
//                 <tbody>
//                   <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10, width:'58%' }}>Other Charges </td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(commission)}</td></tr>
//                   <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
//                   <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Advance Paid</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(advance)}</td></tr>
//                   <tr style={{ background:'#dbeafe' }}>
//                     <td style={{ padding:'9px 10px', color:'#1e3a8a', fontWeight:800, fontSize:13 }}>NET AMOUNT</td>
//                     <td style={{ padding:'9px 10px', color:'#1e3a8a', fontWeight:900, fontSize:16, textAlign:'right' }}>₹ {inr(Math.max(0, finalPay))}</td>
//                   </tr>
//                 </tbody>
//               </table>
//               <div style={{ border:'1px solid #93c5fd', borderRadius:3, padding:'5px 8px', fontSize:10.5, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
//                 <strong style={{ color:'#1e40af' }}>In Words :</strong> {toIndianWords(Math.max(0, finalPay))} Only
//               </div>
//               <div style={{ textAlign:'right', fontSize:9.5, color:'#777', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>
//               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:16, position:'relative', zIndex:1 }}>
//                 <div style={{ textAlign:'center', borderTop:'1px solid #333', paddingTop:4, fontSize:10, width:130, color:'#444' }}>Receiver's Sign.</div>
//                 <div style={{ fontWeight:800, fontSize:11 }}></div>
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

//   // const changeNBags = (v) => {
//   //   setNBags(v);
//   //   const n = parseInt(v) || 0;
//   //   setRows(prev => {
//   //     if (prev.length === n) return prev; // no change needed
//   //     return Array.from({ length: n }, (_, i) =>
//   //       // Keep existing row data if available
//   //       prev[i] ? { ...prev[i] } : { lot, weight: '', rate: '', amount: '', buyer: '' }
//   //     );
//   //   });
//   // };

//   const changeNBags = (v) => {
//     setNBags(v);
//     const n = parseInt(v) || 0;
//     if (n > 0) setRows(prev => Array.from({ length: n }, (_, i) => prev[i] ? { ...prev[i] } : { lot, weight: '', rate: '', amount: '', buyer: '' }));
//   };

//   const update = (i, field, val) => {
//     setRows(prev => prev.map((r, j) => {
//       if (j !== i) return r;
//       const next = { ...r, [field]: val };
//       if (field === 'weight' || field === 'rate') {
//         const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
//         const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
//         // next.amount = w && rt ? ((w * rt) / 100).toFixed(2) : '';
//         next.amount = w && rt ? String(Math.round((w * rt) / 100)) : '';
//       }
//       return next;
//     }));
//   };

//   const bags        = parseInt(nBags) || 0;
//   const totalW      = rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
//   const grossAmount = rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
//   const labourAmt   = (parseFloat(labour) || 0) * bags;

//   // const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
//   // const totalDeduct = parseFloat((labourAmt + commission).toFixed(2));
//   // const netPayable  = parseFloat((grossAmount - totalDeduct).toFixed(2));
//   // const finalPay    = parseFloat((netPayable - (parseFloat(advance) || 0)).toFixed(2));

//   const commission  = Math.round(grossAmount * 8 / 100);
//   const totalDeduct = labourAmt + commission;
//   const netPayable  = Math.round(grossAmount - totalDeduct);
//   const finalPay    = Math.round(netPayable - (parseFloat(advance) || 0));

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
//       // await API.put('/api/sellers/' + seller.id, {
//       //   num_bags:       bags,
//       //   weight:         totalW,
//       //   amount:         netPayable,
//       //   advance_amount: parseFloat(advance) || 0,
//       //   rate_fixed:     totalW > 0 && grossAmount > 0 ? parseFloat((grossAmount / totalW * 100).toFixed(2)) : 0,
//       //   bag_data:       JSON.stringify(bag_data),
//       // });

//        await API.put('/api/sellers/' + seller.id, {
//         num_bags:       bags,
//         weight:         Math.round(totalW * 100) / 100,   // keep 2dp for weight only
//         amount:         netPayable,
//         advance_amount: parseFloat(advance) || 0,
//         rate_fixed:     totalW > 0 && grossAmount > 0 ? Math.round(grossAmount / totalW * 100) : 0,
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
//                 { label:'− Other Charges ',   sub:`8% of ₹${fmtINR(grossAmount)}`, val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
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
//                   <tr key={s.id} style={{ background:isChecked?'rgba(26,86,219,0.06)':undefined, cursor:'pointer' }} onClick={() => setEditing(s)}>
//                     <td style={{ textAlign:'center', padding:'10px 8px' }}>
//                       <div onClick={e=>{ e.stopPropagation(); toggleOne(s.id); }} style={{ ...cbStyle(isChecked), margin:'0 auto' }}>
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
//                       <div style={{ display:'flex', gap:5, justifyContent:'center' }} onClick={e=>e.stopPropagation()}>
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



// ---------------------------------------------------------------------------------------------------------

import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Eye, Printer, Trash2, Edit2, X, RefreshCw, Check, Package, CheckSquare, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

// ─── Reconstruct ginger groups from bag_data ──────────────────
// Consecutive entries with the same per-bag weight → same group
function getGingerGroups(seller) {
  const lot = seller.lot_number || `${seller.serial_number}/${parseInt(seller.num_bags)||0}`;
  let raw = [];
  try { raw = JSON.parse(seller.bag_data || '[]'); } catch {}
  if (raw.length === 0) return [{ lot, bags: parseInt(seller.num_bags)||0, weight: '', rate: '', amount: '', buyer: '' }];

  const groups = [];
  let cur = null;
  raw.forEach(bag => {
    const w = Number(bag.weight);
    if (!cur || Math.abs(w - cur._perBag) > 0.00001) {
      cur = { _perBag: w, _sumW: w, bags: 1, rate: bag.rate, buyer: bag.buyer || '', lot };
      groups.push(cur);
    } else {
      cur.bags++;
      cur._sumW += w;
    }
  });

  return groups.map(g => {
    const totalW = parseFloat(g._sumW.toFixed(4));
    const rt     = Number(g.rate) > 0 ? String(g.rate) : '';
    const amt    = totalW && rt ? String(Math.round(totalW * parseFloat(rt) / 100)) : '';
    return { lot: g.lot, bags: g.bags, weight: totalW > 0 ? String(totalW) : '', rate: rt, amount: amt, buyer: g.buyer };
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

// const inr = (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const inr = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');


function buildBillHTML(seller) {
  const totalBags = parseInt(seller.num_bags) || 0;
  let rawBags = [];
  try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}
 
  const bagRows = Array.from({ length: totalBags }, (_, i) => {
    const b = rawBags[i] || {};
    return {
      srno:     String(i + 1).padStart(2, '0'),
      material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'TAMARIND',
      lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
      weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
      rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
      amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
    };
  });
 
  const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
  const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
  // const labourAmt   = 20 * totalBags;
  // const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
  // const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
  // const advance     = parseFloat(seller.advance_amount) || 0;
  // const finalPay    = parseFloat((netAmount - advance).toFixed(2));

  const labourAmt   = 20 * totalBags;
  const commission  = Math.round(grossAmount * 8 / 100);
  const netAmount   = Math.round(grossAmount - labourAmt - commission);
  const advance     = Math.round(parseFloat(seller.advance_amount) || 0);
  const finalPay    = Math.round(netAmount - advance);
 
  const bagRowsHtml = bagRows.map((b, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#eff6ff'};">
      <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:10px;">${b.srno}</td>
      <td style="border:1px solid #b8cef0;padding:4px 5px;text-align:left;font-size:10px;font-weight:700;">${b.material}</td>
      <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:9.5px;font-family:monospace;">${b.lot}</td>
      <td style="border:1px solid #b8cef0;padding:4px 3px;text-align:center;font-size:10px;">1</td>
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
        <td style="border:1px solid #b8cef0;padding:4px 8px;background:#eff6ff;font-weight:700;color:#1e40af;font-size:10px;">Hamali / Labour Charges</td>
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
function BillModal({ seller, onClose }) {

  const totalBags = parseInt(seller.num_bags) || 0;
  let rawBags = [];
  try { rawBags = JSON.parse(seller.bag_data || '[]'); } catch {}

  const bagRows = Array.from({ length: totalBags }, (_, i) => {
    const b = rawBags[i] || {};
    return {
      srno:     String(i + 1).padStart(2, '0'),
      material: seller.material && seller.material !== 'GENERAL' ? seller.material : 'GENERAL',
      lot:      b.lot || seller.lot_number || `${seller.serial_number}/${totalBags}`,
      weight:   Number(b.weight) > 0 ? Number(b.weight) : null,
      rate:     Number(b.rate)   > 0 ? Number(b.rate)   : null,
      amount:   Number(b.amount) > 0 ? Number(b.amount) : null,
    };
  });

  const grossAmount = bagRows.reduce((s, b) => s + (b.amount || 0), 0);
  const totalWeight = bagRows.reduce((s, b) => s + (b.weight || 0), 0);
  // const labourAmt   = 20 * totalBags;
  // const commission  = parseFloat((grossAmount * 8 / 100).toFixed(2));
  // const netAmount   = parseFloat((grossAmount - labourAmt - commission).toFixed(2));
  // const advance     = parseFloat(seller.advance_amount) || 0;
  // const finalPay    = parseFloat((netAmount - advance).toFixed(2));

  const labourAmt   = 20 * totalBags;
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
                      <td style={{ border:'1px solid #b8cef0', padding:'4px 3px', textAlign:'center', fontSize:10, fontWeight:600, color:'#111' }}>1</td>
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
                  <tr><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', background:'#eff6ff', fontWeight:700, color:'#1e40af', fontSize:10 }}>Hamali / Labour Charges</td><td style={{ border:'1px solid #b8cef0', padding:'6px 8px', textAlign:'right', fontWeight:700, color:'#dc2626', fontSize:11 }}>− ₹ {inr(labourAmt)}</td></tr>
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
  const isGinger = seller.material === 'GINGER';

  const [rows,       setRows]       = useState(() => isGinger ? [] : getBags(seller));
  const [gingerRows, setGingerRows] = useState(() => isGinger ? getGingerGroups(seller) : []);
  const [sellerName, setSellerName] = useState(seller.name || '');
  const [nBags,      setNBags]      = useState(String(num));
  const [advance,    setAdvance]    = useState(String(seller.advance_amount || ''));
  const [labour,     setLabour]     = useState('20');
  const [saving,     setSaving]     = useState(false);
  const [buyers,     setBuyers]     = useState([]);

  useEffect(() => {
    API.get('/api/buyers').then(res => {
      setBuyers(res.data.data || []);
    }).catch(() => {});
  }, []);

  // Redistribute bags across ginger groups given total n
  const redistributeGinger = (groups, n) => {
    const g = groups.length;
    return groups.map((r, i) => ({
      ...r,
      bags: Math.floor(n / g) + (i < (n % g) ? 1 : 0),
    }));
  };

  const changeNBags = (v) => {
    setNBags(v);
    const n = parseInt(v) || 0;
    if (n > 0) {
      if (isGinger) {
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
      if (field === 'weight' || field === 'rate') {
        const w  = parseFloat(field === 'weight' ? val : r.weight) || 0;
        const rt = parseFloat(field === 'rate'   ? val : r.rate)   || 0;
        next.amount = w && rt ? String(Math.round((w * rt) / 100)) : '';
      }
      return next;
    }));
  };

  const addGingerRow = () => {
    const n = parseInt(nBags) || 0;
    if (gingerRows.length < n) {
      setGingerRows(prev => {
        const newRows = [...prev, { lot, bags: 0, weight: '', rate: '', amount: '', buyer: '' }];
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
  const totalW      = isGinger
    ? gingerRows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0)
    : rows.reduce((s, r) => s + (parseFloat(r.weight) || 0), 0);
  const grossAmount = isGinger
    ? gingerRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)
    : rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const labourAmt   = (parseFloat(labour) || 0) * bags;
  const commission  = Math.round(grossAmount * 8 / 100);
  const totalDeduct = labourAmt + commission;
  const netPayable  = Math.round(grossAmount - totalDeduct);
  const finalPay    = Math.round(netPayable - (parseFloat(advance) || 0));

  const displayRows = isGinger ? gingerRows : rows;
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
    if (isGinger) {
      if (gingerRows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all groups'); return; }
    } else {
      if (rows.some(r => !(parseFloat(r.weight) > 0))) { toast.error('Enter weight for all bags'); return; }
    }
    setSaving(true);
    try {
      let bag_data;
      if (isGinger) {
        // Expand each group to individual bag entries
        bag_data = [];
        gingerRows.forEach(r => {
          const bagsInGroup  = r.bags || 0;
          const groupW       = parseFloat(r.weight) || 0;
          const rate         = parseFloat(r.rate)   || 0;
          const weightPerBag = bagsInGroup > 0 ? groupW / bagsInGroup : 0;
          const amtPerBag    = weightPerBag && rate ? Math.round(weightPerBag * rate / 100) : 0;
          for (let j = 0; j < bagsInGroup; j++) {
            bag_data.push({ lot, weight: weightPerBag, rate, amount: amtPerBag, buyer: r.buyer || '' });
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

        {isGinger ? (
          /* ── GINGER: group rows ── */
          gingerRows.length > 0 && (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Package size={15} style={{ color:'var(--accent)' }}/>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:14 }}>Ginger Group Details</span>
                  <span style={{ fontSize:11, color:'var(--accent)', background:'var(--accent-dim)', borderRadius:20, padding:'2px 10px', fontWeight:700, border:'1px solid rgba(245,158,11,0.3)' }}>
                    Lot: {lot}
                  </span>
                  <span style={{ fontSize:11, color:wtsDone===gingerRows.length?'var(--blue)':'var(--text-muted)', background:'var(--blue-dim)', borderRadius:20, padding:'2px 10px', fontWeight:600 }}>
                    {wtsDone}/{gingerRows.length} groups filled
                  </span>
                </div>
                <span style={{ fontSize:11, color:'var(--text-muted)' }}>Rate per <strong style={{ color:'var(--text-primary)' }}>100 kg</strong></span>
              </div>

              {/* Ginger header */}
              <div style={{ display:'grid', gridTemplateColumns:'32px 65px 1fr 1fr 150px 110px 30px', gap:8, padding:'7px 13px', background:'var(--bg-panel)', borderRadius:'8px 8px 0 0', border:'1px solid var(--border)', borderBottom:'none' }}>
                {['#','Bags','Weight (kg)','Rate (₹/100kg)','Buyer','Amount (₹)',''].map(h=>(
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
                      type="number"
                      value={r.bags ?? ''}
                      onChange={e => updateGinger(i, 'bags', parseInt(e.target.value) || 0)}
                      placeholder="bags"
                      min="1"
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
                      placeholder="e.g. 3200" step="0.01" min="0" onWheel={e=>e.target.blur()}
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
                <button type="button" onClick={addGingerRow}
                  style={{ marginTop:8, padding:'7px 16px', background:'var(--accent-dim)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:8, color:'var(--accent)', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                  + Add Another Group
                </button>
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
                { label:'Gross Amount',           sub: isGinger ? `${gingerRows.length} group${gingerRows.length>1?'s':''} · ${bags} bags` : `${rows.length} bags × Rate`, val:`₹ ${fmtINR(grossAmount)}`,               color:'var(--accent)',         fs:16 },
                { label:'− Labour / Hamali',      sub:`₹${labour||20} × ${bags} bags`,                                                                                    val:`− ₹ ${fmtINR(labourAmt)}`,              color:'var(--red)',            fs:15 },
                { label:'− Other Charges',        sub:`8% of ₹${fmtINR(grossAmount)}`,                                                                                    val:`− ₹ ${fmtINR(commission)}`,             color:'var(--red)',            fs:15 },
                { label:'Net Amount',             sub:'Gross − Labour − Commission',                                                                                       val:`₹ ${fmtINR(netPayable)}`,               color:'var(--blue)',           fs:16, highlight:true },
                { label:'− Advance Already Paid', sub:'',                                                                                                                  val:`− ₹ ${fmtINR(parseFloat(advance)||0)}`, color:'var(--text-secondary)', fs:15 },
              ].map((row,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:'1px solid var(--border)', background:row.highlight?'rgba(59,130,246,0.07)':'transparent' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.label}</div>
                    {row.sub && <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{row.sub}</div>}
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
  const navigate = useNavigate();
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
          <button className="btn btn-primary" onClick={() => navigate('/seller-registration')} title="Go to Seller Registration">
            <UserPlus size={15} /> Seller Registration
          </button>
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
                <th>#</th><th>Short Name</th><th>Name</th><th>Material</th>
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

      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
        input[type=number] { -moz-appearance:textfield; }
      `}</style>
    </div>
  );
}
