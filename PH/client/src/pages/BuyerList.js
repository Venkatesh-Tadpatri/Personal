import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Eye, Printer, Trash2, Edit2, Check, X, RefreshCw, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getBuyers, updateBuyer, deleteBuyer as apiDeleteBuyer } from '../api';
import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE, todayISO } from '../utils';
import { useMaterials } from '../materials';
import ConfirmDialog from '../ConfirmDialog';
import { useSort, SortTh } from '../sorting';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });


// const inr = (v) =>
//   Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const inr = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
const buyerLabourRate = (buyer) => Number(buyer?.labour_rate ?? 5) || 0;
const buyerExtraBags = (buyer) => Number(buyer?.extra_bags || 0) || 0;
const buyerExtraBagAmount = (buyer) => Number(buyer?.extra_bag_amount || 0) || 0;

const isGroupedMaterial = (material) => ['GINGER', 'ONION'].includes(material);
const rowBagCount = (r) => Number(r.bag.bags || 1);
const rowsBagTotal = (rows) => rows.reduce((s, r) => s + rowBagCount(r), 0);

export function groupBuyerRows(rows) {
  const grouped = [];

  rows.forEach(row => {
    if (!isGroupedMaterial(row.seller.material)) {
      grouped.push({ ...row, bag: { ...row.bag, bags: 1 } });
      return;
    }

    const last = grouped[grouped.length - 1];
    const sameGroup = last
      && isGroupedMaterial(last.seller.material)
      && last.seller.id === row.seller.id
      && (last.bag.lot || last.seller.lot_number || '') === (row.bag.lot || row.seller.lot_number || '')
      && Number(last.bag.rate || 0) === Number(row.bag.rate || 0)
      && (last.bag.rate_mode || last.bag.rateMode || 'PER_100KG') === (row.bag.rate_mode || row.bag.rateMode || 'PER_100KG')
      && (last.bag.buyer || '').toUpperCase() === (row.bag.buyer || '').toUpperCase();

    if (!sameGroup) {
      grouped.push({ ...row, bag: { ...row.bag, bags: rowBagCount(row) } });
      return;
    }

    last.bag = {
      ...last.bag,
      bags: rowBagCount(last) + rowBagCount(row),
      weight: (Number(last.bag.weight) || 0) + (Number(row.bag.weight) || 0),
      amount: (Number(last.bag.amount) || 0) + (Number(row.bag.amount) || 0),
    };
  });

  return grouped;
}

function materialAverageRows(rows) {
  const byMaterial = new Map();

  rows.forEach(r => {
    const material = r.seller.material || 'GENERAL';
    if (!byMaterial.has(material)) {
      byMaterial.set(material, { material, weight: 0, amount: 0 });
    }
    const entry = byMaterial.get(material);
    entry.weight += Number(r.bag.weight) || 0;
    entry.amount += Number(r.bag.amount) || 0;
  });

  return Array.from(byMaterial.values()).filter(entry => entry.weight > 0);
}

function materialAverageRowsHtml(rows) {
  return materialAverageRows(rows).map(entry => `
      <tr>
        <td class="deduct-label">Avg. Rate per KG - ${entry.material}</td>
        <td class="deduct-value" style="color:#166534">&#8377; ${(entry.amount / entry.weight).toFixed(2)} / kg</td>
      </tr>`).join('');
}

// ─── Number to Indian Words ───────────────────────────────────
export function toIndianWords(amount) {
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

// ─── Shared bill CSS — Optimized for physical A5 printer output ─────
export const BILL_CSS = `
  @page {
    margin: 5mm 5mm 5mm 5mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 100%;
    font-family: Arial, sans-serif;
    font-size: 9px;
    color: #111;
    background: #fff;
  }
  body {
    padding: 0;
    margin: 0;
  }
  table { width: 100%; border-collapse: collapse; }

  .page-wrapper {
    width: 100%;
    max-width: 100%;
    border: 2px solid #93c5fd;
    border-radius: 3px;
    padding: 6px;
    position: relative;
    background: #fff;
  }
  .page-wrapper::after {
    content: '';
    display: block;
    position: absolute;
    top: 3px; left: 3px; right: 3px; bottom: 3px;
    border: 1px solid #dbeafe;
    border-radius: 2px;
    pointer-events: none;
  }
  .header-box { text-align: center; border-bottom: 2px double #93c5fd; padding-bottom: 5px; margin-bottom: 5px; }
  .header-props { display: flex; justify-content: space-between; align-items: center; font-size: 7.5px; color: #444; margin-bottom: 3px; }
  .logo-circle { width: 28px; height: 28px; border-radius: 50%; border: 2px solid #93c5fd; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 9px; color: #1e40af; background: #eff6ff; flex-shrink: 0; }
  .firm-name { font-size: 15px; font-weight: 900; color: #1a1a1a; line-height: 1.1; margin: 2px 0; }
  .firm-badge { display: inline-block; background: #dbeafe; color: #1e3a8a; font-size: 7px; font-weight: 700; letter-spacing: 0.8px; padding: 1px 8px; border-radius: 2px; margin: 2px 0 1px; }
  .firm-type { font-size: 8.5px; font-weight: 700; color: #333; }
  .firm-addr { font-size: 7.5px; color: #666; margin-top: 1px; }
  .meta-table { border: 1px solid #93c5fd; border-radius: 2px; margin-bottom: 5px; overflow: hidden; }
  .meta-row { display: flex; justify-content: space-between; padding: 3px 7px; font-size: 8.5px; border-bottom: 1px solid #cfe2ff; }
  .meta-row:last-child { border-bottom: none; }
  .meta-row strong { color: #1e40af; }
  .items-table thead tr th { background: #dbeafe; color: #1e3a8a; padding: 4px 3px; font-size: 8px; font-weight: 700; border: 1px solid #93c5fd; text-align: center; }
  .items-table tbody tr td { border: 1px solid #b8cef0; padding: 3px 3px; font-size: 8.5px; }
  .items-table tfoot td { background: #f0f7ff; border-top: 1.5px solid #93c5fd; border: 1px solid #b8cef0; padding: 4px 3px; font-weight: 800; color: #1e40af; font-size: 8.5px; }
  .deduct-table td { border: 1px solid #b8cef0; padding: 4px 7px; font-size: 8.5px; }
  .deduct-label { background: #f0f7ff; font-weight: 700; color: #1e40af; width: 58%; }
  .deduct-value { text-align: right; font-weight: 700; }
  .net-row td { background: #dbeafe; color: #1e3a8a; padding: 6px 8px; font-weight: 900; }
  .net-label { font-size: 11px; }
  .net-value { text-align: right; font-size: 12px; }
  .in-words { border: 1px solid #93c5fd; border-radius: 2px; padding: 4px 7px; font-size: 8px; margin-top: 4px; background: #f8fbff; }
  .in-words strong { color: #1e40af; }
  .footer-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12px; }
  .sign-box { text-align: center; border-top: 1px solid #555; padding-top: 3px; font-size: 8px; width: 90px; color: #444; }
  .for-firm { font-weight: 800; font-size: 9px; color: #1a1a1a; }
  .eoae { text-align: right; font-size: 7.5px; color: #888; margin-top: 2px; font-style: italic; }

  @media print {
    html, body {
      width: 100%;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page-wrapper {
      width: 100%;
      max-width: 100%;
      page-break-inside: avoid;
    }
  }
`;

// ─── Build printable bill HTML ────────────────────────────────
export function buildBuyerBillHtml({ buyer, sellerRows, advance }) {
  const totalWeight = sellerRows.reduce((s, r) => s + (Number(r.bag.weight) || 0), 0);
  const totalAmount = sellerRows.reduce((s, r) => s + (Number(r.bag.amount) || 0), 0);
  const totalBags   = rowsBagTotal(sellerRows);
  const labourRate  = buyerLabourRate(buyer);
  const labourAmt   = totalBags * labourRate;
  const marketFee   = Math.round(totalAmount * 0.01);
  const extraBags      = buyerExtraBags(buyer);
  const extraBagRate   = buyerExtraBagAmount(buyer);
  const extraBagAmt    = extraBags * extraBagRate;
  const balance     = totalAmount + labourAmt + marketFee + extraBagAmt;
  const fmtBillDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d + 'T00:00:00');
    const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${String(dt.getDate()).padStart(2,'0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`;
  };

  const rowsHtml = sellerRows.map((r, i) => `
    <tr style="background:${i%2===0?'#ffffff':'#eff6ff'}">
      <td style="border:1px solid #b8cef0;padding:3px 3px;text-align:center;font-size:8.5px;color:#111;font-weight:600">${String(i+1).padStart(3,'0')}</td>
      <td style="border:1px solid #b8cef0;padding:3px 5px;text-align:left;font-size:8.5px;font-weight:700;color:#111">${r.seller.material}</td>
      <td style="border:1px solid #b8cef0;padding:3px 3px;text-align:center;font-size:8px;font-family:monospace;color:#111;font-weight:600">${r.bag.lot || r.seller.lot_number || '—'}</td>
      <td style="border:1px solid #b8cef0;padding:3px 3px;text-align:center;font-size:8.5px;font-weight:700;color:#111">${rowBagCount(r)}</td>
      <td style="border:1px solid #b8cef0;padding:3px 3px;text-align:center;font-size:8.5px;font-weight:800;color:#111">${Number(r.bag.weight)>0?r.bag.weight:'—'}</td>
      <td style="border:1px solid #b8cef0;padding:3px 3px;text-align:center;font-size:8.5px;font-weight:800;color:#111">${Number(r.bag.rate)>0?Number(r.bag.rate).toLocaleString('en-IN'):'—'}</td>
      <td style="border:1px solid #b8cef0;padding:3px 5px;text-align:right;font-size:8.5px;font-weight:800;color:#1e40af">${Number(r.bag.amount)>0?inr(r.bag.amount):'—'}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bill — ${buyer.name}</title>
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
    <div class="firm-name"> BUYER BILL</div>
    <div><span class="firm-badge"></span></div>
    <div class="firm-type"></div>
    <div class="firm-addr"></div>
  </div>

  <div class="meta-table">
    <div class="meta-row">
      <span><strong>Bill Name :</strong> ${buyer.serial_number || '—'}</span>
      <span><strong>Date :</strong> ${fmtBillDate(buyer.bill_date || buyer.entry_date)}</span>
    </div>
    <div class="meta-row">
      <span><strong>Buyer Name :</strong> ${buyer.name}</span>
      <span><strong>Mobile :</strong> ${buyer.mobile || '—'}</span>
    </div>
  </div>

  <table class="items-table" style="margin-bottom:1px">
    <thead>
      <tr>
        <th style="width:8%">SrNo.</th>
        <th style="width:22%">Particular</th>
        <th style="width:14%">Lott No.</th>
        <th style="width:8%">Bags</th>
        <th style="width:16%">Weight(KG)</th>
        <th style="width:14%">RATE</th>
        <th style="width:18%">Amount</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="text-align:left;padding-left:7px;font-size:8.5px;font-weight:700">TOTAL</td>
        <td style="text-align:center;font-size:8.5px;font-weight:800">${totalBags}</td>
        <td style="text-align:center;font-size:8.5px;font-weight:800">${totalWeight.toFixed(2)}</td>
        <td style="text-align:right;font-size:7.5px;color:#1e40af;font-weight:600">Gross Amt.</td>
        <td style="text-align:right;font-size:10px;color:#1e40af;padding-right:5px;font-weight:900">&#8377; ${inr(totalAmount)}</td>
      </tr>
    </tfoot>
  </table>

  <table class="deduct-table" style="margin-top:2px">
    <tbody>
      ${materialAverageRowsHtml(sellerRows)}
      <tr>
        <td class="deduct-label">Labour Charges (&#8377;${inr(labourRate)} × ${totalBags} bags)</td>
        <td class="deduct-value" style="color:#dc2626">+ &#8377; ${inr(labourAmt)}</td>
      </tr>
      <tr>
        <td class="deduct-label">Market Fees (1%)</td>
        <td class="deduct-value" style="color:#b45309">+ &#8377; ${inr(marketFee)}</td>
      </tr>
      ${extraBags > 0 ? `
      <tr>
        <td class="deduct-label">Extra Bag Charges (&#8377;${inr(extraBagRate)} × ${extraBags} bags)</td>
        <td class="deduct-value" style="color:#dc2626">+ &#8377; ${inr(extraBagAmt)}</td>
      </tr>` : ''}
      <tr class="net-row">
        <td class="net-label">TOTAL AMOUNT</td>
        <td class="net-value">&#8377; ${inr(Math.max(0,balance))}</td>
      </tr>
    </tbody>
  </table>

  <div class="in-words"><strong>In Words :</strong> ${toIndianWords(Math.max(0,balance))} Only</div>
  <div class="eoae">(E.&amp;O.E.)</div>

  <div class="footer-row">
    <div class="sign-box">Receiver's Sign.</div>
    <div class="for-firm">For –  BUYER BILL</div>
  </div>
</div>
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); }, 300);
  };
<\/script>
</body>
</html>`;
}

// ─── Build multiple individual A5 bills in one print window ───
function buildMultipleBuyerBillsHtml({ buyersData }) {
  const billsHtml = buyersData.map(({ buyer, rows: sellerRows }, billIdx) => {
    const totalWeight = sellerRows.reduce((s, r) => s + (Number(r.bag.weight) || 0), 0);
    const totalAmount = sellerRows.reduce((s, r) => s + (Number(r.bag.amount) || 0), 0);
    const totalBags   = rowsBagTotal(sellerRows);
    const labourRate  = buyerLabourRate(buyer);
    const labourAmt   = totalBags * labourRate;
    const marketFee   = Math.round(totalAmount * 0.01);
    const extraBags     = buyerExtraBags(buyer);
    const extraBagRate  = buyerExtraBagAmount(buyer);
    const extraBagAmt   = extraBags * extraBagRate;
    const balance     = totalAmount + labourAmt + marketFee + extraBagAmt;
    const fmtBillDate = (d) => {
      if (!d) return '—';
      const dt = new Date(d + 'T00:00:00');
      const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${String(dt.getDate()).padStart(2,'0')}-${m[dt.getMonth()]}-${dt.getFullYear()}`;
    };

    const rowsHtml = sellerRows.map((r, i) => `
      <tr style="background:${i%2===0?'#ffffff':'#eff6ff'}">
        <td style="border:1px solid #b8cef0;padding:3px 3px;text-align:center;font-size:8.5px;color:#111;font-weight:600">${String(i+1).padStart(3,'0')}</td>
        <td style="border:1px solid #b8cef0;padding:3px 5px;text-align:left;font-size:8.5px;font-weight:700;color:#111">${r.seller.material}</td>
        <td style="border:1px solid #b8cef0;padding:3px 3px;text-align:center;font-size:8px;font-family:monospace;color:#111;font-weight:600">${r.bag.lot || r.seller.lot_number || '—'}</td>
        <td style="border:1px solid #b8cef0;padding:3px 3px;text-align:center;font-size:8.5px;font-weight:700;color:#111">${rowBagCount(r)}</td>
        <td style="border:1px solid #b8cef0;padding:3px 3px;text-align:center;font-size:8.5px;font-weight:800;color:#111">${Number(r.bag.weight)>0?r.bag.weight:'—'}</td>
        <td style="border:1px solid #b8cef0;padding:3px 3px;text-align:center;font-size:8.5px;font-weight:800;color:#111">${Number(r.bag.rate)>0?Number(r.bag.rate).toLocaleString('en-IN'):'—'}</td>
        <td style="border:1px solid #b8cef0;padding:3px 5px;text-align:right;font-size:8.5px;font-weight:800;color:#1e40af">${Number(r.bag.amount)>0?Math.round(r.bag.amount).toLocaleString('en-IN'):'—'}</td>
      </tr>`).join('');

    return `
      <div class="page-wrapper" style="${billIdx > 0 ? 'margin-top:0' : ''}">
        <div class="header-box">
          <div class="header-props">
            <span style="text-align:left;line-height:1.4"><br></span>
            <div class="logo-circle">PH</div>
            <span style="text-align:right;line-height:1.4"><br></span>
          </div>
          <div class="firm-name"> BUYER BILL</div>
          <div><span class="firm-badge"></span></div>
        </div>
        <div class="meta-table">
          <div class="meta-row">
            <span><strong>Bill Name :</strong> ${buyer.serial_number || '—'}</span>
            <span><strong>Date :</strong> ${fmtBillDate(buyer.bill_date || buyer.entry_date)}</span>
          </div>
          <div class="meta-row">
            <span><strong>Buyer Name :</strong> ${buyer.name}</span>
            <span><strong>Mobile :</strong> ${buyer.mobile || '—'}</span>
          </div>
        </div>
        <table class="items-table" style="margin-bottom:1px">
          <thead>
            <tr>
              <th style="width:8%">SrNo.</th>
              <th style="width:22%">Particular</th>
              <th style="width:14%">Lott No.</th>
              <th style="width:8%">Bags</th>
              <th style="width:16%">Weight(KG)</th>
              <th style="width:14%">RATE</th>
              <th style="width:18%">Amount</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align:left;padding-left:7px;font-size:8.5px;font-weight:700">TOTAL</td>
              <td style="text-align:center;font-size:8.5px;font-weight:800">${totalBags}</td>
              <td style="text-align:center;font-size:8.5px;font-weight:800">${totalWeight.toFixed(2)}</td>
              <td style="text-align:right;font-size:7.5px;color:#1e40af;font-weight:600">Gross Amt.</td>
              <td style="text-align:right;font-size:10px;color:#1e40af;padding-right:5px;font-weight:900">&#8377; ${Math.round(totalAmount).toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>
        <table class="deduct-table" style="margin-top:2px">
          <tbody>
            ${materialAverageRowsHtml(sellerRows)}
            <tr>
              <td class="deduct-label">Labour Charges (&#8377;${inr(labourRate)} × ${totalBags} bags)</td>
              <td class="deduct-value" style="color:#dc2626">+ &#8377; ${inr(labourAmt)}</td>
            </tr>
            <tr>
              <td class="deduct-label">Market Fees (1%)</td>
              <td class="deduct-value" style="color:#b45309">+ &#8377; ${inr(marketFee)}</td>
            </tr>
            ${extraBags > 0 ? `
            <tr>
              <td class="deduct-label">Extra Bag Charges (&#8377;${inr(extraBagRate)} × ${extraBags} bags)</td>
              <td class="deduct-value" style="color:#dc2626">+ &#8377; ${inr(extraBagAmt)}</td>
            </tr>` : ''}
            <tr class="net-row">
              <td class="net-label">TOTAL AMOUNT</td>
              <td class="net-value">&#8377; ${Math.round(Math.max(0,balance)).toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>
        <div class="in-words"><strong>In Words :</strong> ${toIndianWords(Math.max(0,balance))} Only</div>
        <div class="eoae">(E.&amp;O.E.)</div>
        <div class="footer-row">
          <div class="sign-box">Receiver's Sign.</div>
          <div class="for-firm">For – BUYER BILL</div>
        </div>
      </div>`;
  }).join('<div style="page-break-after:always"></div>');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Buyer Bills</title>
  <style>${BILL_CSS}</style>
</head>
<body>
${billsHtml}
<script>window.onload=function(){setTimeout(function(){window.print();},400);};<\/script>
</body>
</html>`;
}

// ─── Build A4 combined report HTML for all buyers ─────────────
function buildAllBuyersBillHtml({ buyersData, date }) {
  const ALL_CSS = `
    @page { size: A4 portrait; margin: 8mm 8mm 8mm 8mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 10px; color: #111; background: #fff; }
    .page-border {
      border: 2px solid #93c5fd;
      border-radius: 5px;
      padding: 10px 12px 14px 12px;
      min-height: calc(297mm - 18mm);
    }
    .buyer-section { margin-bottom: 14px; border: 1px solid #bfdbfe; border-radius: 3px; page-break-inside: avoid; }
    .buyer-header { background: #dbeafe; color: #1e3a8a; padding: 5px 10px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #bfdbfe; }
    .buyer-header-left { font-weight: 800; font-size: 11px; }
    .buyer-header-right { font-size: 10px; color: #1e40af; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #eff6ff; color: #1e40af; font-size: 9.5px; font-weight: 700; padding: 4px 5px; border: 1px solid #bfdbfe; text-align: center; }
    td { border: 1px solid #bfdbfe; padding: 3.5px 5px; font-size: 9.5px; color: #111; }
    .subtotal-row td { background: #f0f7ff; font-weight: 800; color: #1e40af; border-top: 1.5px solid #93c5fd; }
    .grand-total { margin-top: 12px; background: #dbeafe; color: #1e3a8a; padding: 8px 14px; border-radius: 4px; border: 1.5px solid #93c5fd; display: flex; justify-content: space-between; font-size: 13px; font-weight: 900; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  `;

  let grandBags = 0, grandWeight = 0;
  let sectionsHtml = '';

  buyersData.forEach(({ buyer, rows }) => {
    if (rows.length === 0) return;
    const tBags = rowsBagTotal(rows);
    const tWeight = rows.reduce((s, r) => s + (Number(r.bag.weight) || 0), 0);
    grandBags += tBags; grandWeight += tWeight;

    const rowsHtml = rows.map((r, i) => `
      <tr style="background:${i%2===0?'#fff':'#f5f9ff'}">
        <td style="text-align:center;font-weight:700">${String(i+1).padStart(3,'0')}</td>
        <td style="font-weight:700">${r.seller.material || '—'}</td>
        <td style="text-align:center;font-family:monospace;font-weight:700">${r.bag.lot || r.seller.lot_number || '—'}</td>
        <td style="text-align:center">${rowBagCount(r)}</td>
        <td style="text-align:center;font-weight:800">${Number(r.bag.weight)>0?r.bag.weight:'—'}</td>
        <td style="text-align:center;font-weight:800">${Number(r.bag.rate)>0?Number(r.bag.rate).toLocaleString('en-IN'):'—'}</td>
      </tr>`).join('');

    sectionsHtml += `
      <div class="buyer-section">
        <div class="buyer-header">
          <span class="buyer-header-left">${buyer.serial_number || buyer.name} &nbsp;|&nbsp; ${buyer.name || '—'}</span>
          <span class="buyer-header-right">Mobile: ${buyer.mobile || '—'} &nbsp;|&nbsp; Date: ${buyer.entry_date || '—'}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:8%">Sr.</th>
              <th style="width:26%">Material</th>
              <th style="width:16%">Lott No.</th>
              <th style="width:8%">Bags</th>
              <th style="width:20%">Weight(KG)</th>
              <th style="width:22%">Rate</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
          <tfoot>
            <tr class="subtotal-row">
              <td colspan="3" style="text-align:left;padding-left:6px">Sub-Total</td>
              <td style="text-align:center">${tBags}</td>
              <td style="text-align:center">${tWeight.toFixed(2)}</td>
              <td style="text-align:center">—</td>
            </tr>
          </tfoot>
        </table>
      </div>`;
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>All Buyers Report${date ? ' — ' + date : ''}</title>
  <style>${ALL_CSS}</style>
</head>
<body>
  <div class="page-border">
    <div style="text-align:center;border-bottom:2px solid #93c5fd;padding-bottom:10px;margin-bottom:14px">
      <div style="font-size:22px;font-weight:900;color:#1e40af">PH — ALL BUYERS REPORT</div>
      <div style="font-size:11px;color:#555;margin-top:2px">${date ? 'Date: ' + date : 'All Dates'} &nbsp;|&nbsp; Total Buyers: ${buyersData.filter(d=>d.rows.length>0).length}</div>
    </div>
    ${sectionsHtml}
    <div class="grand-total">
      <span>GRAND TOTAL — ${grandBags} Bags &nbsp;|&nbsp; ${grandWeight.toFixed(2)} KG</span>
    </div>
  </div>
<script>window.onload=function(){setTimeout(function(){window.print();},400);};<\/script>
</body>
</html>`;
}

// ─── Fetch bags assigned to one buyer from all sellers ────────
// `material`, when given, restricts the result to purchases of that one material —
// used to build a separate bill per material instead of one merged bill.
async function fetchBuyerPurchases(buyerKey, date, material) {
  const params = date ? { date } : {};
  const res = await API.get('/api/sellers', { params });
  const sellers = res.data.data || [];
  const rows = [];
  sellers.forEach(seller => {
    if (material && seller.material !== material) return;
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

// ─── Fetch all sellers once → build stats map for every buyer ─
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
      if (!stats[key]) stats[key] = { bags: 0, weight: 0, amount: 0, materials: new Set(), byMaterial: {} };
      stats[key].bags   += 1;
      stats[key].weight += Number(bag.weight) || 0;
      stats[key].amount += Number(bag.amount) || 0;
      const mat = seller.material && seller.material !== 'GENERAL' ? seller.material : null;
      if (mat) {
        stats[key].materials.add(mat);
        if (!stats[key].byMaterial[mat]) stats[key].byMaterial[mat] = { bags: 0, weight: 0, amount: 0 };
        stats[key].byMaterial[mat].bags   += 1;
        stats[key].byMaterial[mat].weight += Number(bag.weight) || 0;
        stats[key].byMaterial[mat].amount += Number(bag.amount) || 0;
      }
    });
  });
  Object.values(stats).forEach(s => { s.materials = Array.from(s.materials).sort(); });
  return stats;
}

// ─── Purchases Modal (View) ───────────────────────────────────
// `material` + `includeExtraCharge`: see handleDirectPrint above — same reasoning applies
// when viewing a buyer who purchased more than one material (separate bill per material).
function PurchasesModal({ buyer, filterDate, material, includeExtraCharge = true, onClose, onUpdate }) {
  const printRef = useRef();
  const [sellerRows, setSellerRows] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const advance = buyer.advance_amount || 0;

  const buyerKey = (buyer.lot_number && buyer.lot_number !== '—') ? buyer.lot_number : buyer.name;

  useEffect(() => {
    setLoading(true);
    fetchBuyerPurchases(buyerKey, filterDate, material)
      .then(rows => setSellerRows(rows))
      .catch(err => toast.error('Failed to load: ' + (err.message || '')))
      .finally(() => setLoading(false));
  }, [buyerKey, material]);

  const totalWeight = sellerRows.reduce((s, r) => s + (Number(r.bag.weight) || 0), 0);
  const totalAmount = sellerRows.reduce((s, r) => s + (Number(r.bag.amount) || 0), 0);
  const totalBags   = rowsBagTotal(sellerRows);
  const avgRows     = materialAverageRows(sellerRows);
  const labourRate  = buyerLabourRate(buyer);
  const labourAmt   = totalBags * labourRate;
  const marketFee   = Math.round(totalAmount * 0.01);
  const extraBags     = includeExtraCharge ? buyerExtraBags(buyer) : 0;
  const extraBagRate  = buyerExtraBagAmount(buyer);
  const extraBagAmt   = extraBags * extraBagRate;
  const balance     = totalAmount + labourAmt + marketFee + extraBagAmt;

  const handlePrint = () => {
    const billBuyer = includeExtraCharge ? buyer : { ...buyer, extra_bags: 0 };
    const html = buildBuyerBillHtml({ buyer: { ...billBuyer, bill_date: filterDate }, sellerRows, advance });
    const w = window.open('', '_blank', 'width=700,height=900');
    w.document.write(html); w.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:620, width:'96%', padding:0, overflow:'hidden', borderRadius:10 }} onClick={e => e.stopPropagation()}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 16px', background:'#dbeafe', color:'#1e3a8a' }}>
          <span style={{ fontWeight:700, fontSize:14 }}>🧾 Buyer Bill — {buyer.name}{buyer.lot_number && buyer.lot_number !== '—' ? ` (${buyer.lot_number})` : ''}{material ? ` — ${material}` : ''}</span>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handlePrint} disabled={loading || sellerRows.length===0}
              style={{ background:'#fff', color:'#1e40af', border:'1px solid #93c5fd', borderRadius:6, padding:'5px 13px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5, opacity:(loading||sellerRows.length===0)?0.5:1 }}>
              <Printer size={13} /> Print / PDF
            </button>
            <button onClick={onClose} style={{ background:'transparent', border:'none', color:'#1e3a8a', cursor:'pointer' }}><X size={18} /></button>
          </div>
        </div>

        <div style={{ overflowY:'auto', maxHeight:'82vh', padding:14, background:'#f0f4ff' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:50, color:'#666' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>📦</div>Loading purchases...
            </div>
          ) : sellerRows.length === 0 ? (
            <div style={{ textAlign:'center', padding:40, color:'#666' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>🛒</div>
              <div style={{ fontWeight:600, marginBottom:4 }}>No purchases found</div>
              <div style={{ fontSize:12 }}>No bags are assigned to <strong>{buyerKey}</strong>.<br/>Go to Seller List → Edit → Bag-wise Details to assign.</div>
            </div>
          ) : (
            <div style={{ display:'block' }}>
              <div ref={printRef} style={{ fontFamily:'Arial,sans-serif', fontSize:12, color:'#111', background:'#fff', padding:'18px 20px', lineHeight:1.4, border:'2px solid #93c5fd', borderRadius:4, position:'relative', display:'block' }}>

                <div style={{ position:'absolute', top:6, left:6, right:6, bottom:6, border:'1px solid #dbeafe', borderRadius:2, pointerEvents:'none', zIndex:0 }}/>

                {/* Header */}
                <div style={{ textAlign:'center', borderBottom:'2px double #93c5fd', paddingBottom:10, marginBottom:8, position:'relative', zIndex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'#555', marginBottom:4 }}>
                    <span style={{ textAlign:'left' }}><br/></span>
                    <div style={{ width:40, height:40, borderRadius:'50%', border:'2px solid #93c5fd', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#1e40af', background:'#eff6ff' }}>PH</div>
                    <span style={{ textAlign:'right' }}><br/></span>
                  </div>
                  <div style={{ fontSize:21, fontWeight:900, color:'#1a1a1a', lineHeight:1.1, margin:'2px 0' }}> BUYER BILL</div>
                  <div><span style={{ display:'inline-block', background:'#dbeafe', color:'#1e3a8a', fontSize:9, fontWeight:700, letterSpacing:1.5, padding:'2px 12px', borderRadius:2, margin:'3px 0' }}></span></div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#111' }}></div>
                  <div style={{ fontSize:9.5, color:'#666', marginTop:2 }}></div>
                </div>

                {/* Meta */}
                <div style={{ border:'1px solid #93c5fd', borderRadius:3, marginBottom:8, overflow:'hidden', position:'relative', zIndex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'1px solid #cfe2ff', padding:'5px 8px', fontSize:11, color:'#111' }}>
                    <span><strong style={{ color:'#1e40af' }}>Bill Name :</strong> {buyer.serial_number || '—'}</span>
                    {/* <span><strong style={{ color:'#1e40af' }}>Date :</strong> {buyer.entry_date || '—'}</span> */}
                    <span><strong style={{ color:'#1e40af' }}>Date :</strong> {fmtDate(filterDate || buyer.entry_date)}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', padding:'4px 8px', fontSize:11, color:'#111' }}>
                    <span><strong style={{ color:'#1e40af' }}>Buyer Name :</strong> {buyer.name}</span>
                    <span><strong style={{ color:'#1e40af' }}>Mobile :</strong> {buyer.mobile || '—'}</span>
                  </div>
                </div>

                {/* Items table */}
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11, position:'relative', zIndex:1 }}>
                  <thead>
                    <tr>
                      {['SrNo.','Particular','Lott No.','Bags','Weight (KG)','RATE','Amount'].map(h => (
                        <th key={h} style={{ background:'#dbeafe', color:'#1e3a8a', padding:'5px 4px', fontSize:10, fontWeight:700, border:'1px solid #93c5fd', textAlign:'center' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sellerRows.map((r, i) => {
                      const bg = i%2===0 ? '#ffffff' : '#eff6ff';
                      const td = (extra) => ({ border:'1px solid #b8cef0', padding:'4px 3px', fontSize:10, color:'#111', backgroundColor:bg, ...extra });
                      return (
                        <tr key={i}>
                          <td style={td({ textAlign:'center', fontWeight:700 })}>{String(i+1).padStart(3,'0')}</td>
                          <td style={td({ textAlign:'left',   fontWeight:700, padding:'4px 5px' })}>{r.seller.material}</td>
                          <td style={td({ textAlign:'center', fontWeight:600, fontFamily:'var(--font-body)' })}>{r.bag.lot || r.seller.lot_number || '—'}</td>
                          <td style={td({ textAlign:'center', fontWeight:700 })}>{rowBagCount(r)}</td>
                          <td style={td({ textAlign:'center', fontWeight:800 })}>{Number(r.bag.weight)>0 ? r.bag.weight : '—'}</td>
                          <td style={td({ textAlign:'center', fontWeight:800 })}>{Number(r.bag.rate)>0 ? Number(r.bag.rate).toLocaleString('en-IN') : '—'}</td>
                          <td style={td({ textAlign:'right',  fontWeight:800, color:'#1e40af', padding:'4px 5px' })}>{Number(r.bag.amount)>0 ? inr(r.bag.amount) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ background:'#f0f7ff', borderTop:'1.5px solid #93c5fd' }}>
                      <td colSpan={3} style={{ border:'1px solid #b8cef0', padding:'5px 6px', fontWeight:700, color:'#1e40af', textAlign:'left' }}>TOTAL</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#111' }}>{totalBags}</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'center', fontWeight:800, color:'#1e40af' }}>{totalWeight.toFixed(2)}</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'5px 3px', textAlign:'right', fontSize:9.5, color:'#1e40af', fontWeight:700 }}>Gross Amt.</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'5px 5px', textAlign:'right', fontWeight:900, color:'#1e40af', fontSize:13 }}>₹ {inr(totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Deductions */}
                <table style={{ width:'100%', borderCollapse:'collapse', marginTop:2, position:'relative', zIndex:1 }}>
                  <tbody>
                    {avgRows.map(row => (
                      <tr key={row.material}>
                        <td style={{ border:'1px solid #b8cef0', padding:'6px 9px', fontSize:10, background:'#eff6ff', fontWeight:700, color:'#1e40af', width:'58%' }}>Avg. Rate per KG - {row.material}</td>
                        <td style={{ border:'1px solid #b8cef0', padding:'6px 9px', fontSize:10, textAlign:'right', fontWeight:700, color:'#166534' }}>₹ {(row.amount / row.weight).toFixed(2)} / kg</td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ border:'1px solid #b8cef0', padding:'6px 9px', fontSize:10, background:'#eff6ff', fontWeight:700, color:'#1e40af' }}>Labour Charges (₹{inr(labourRate)} × {totalBags} bags)</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'6px 9px', fontSize:10, textAlign:'right', fontWeight:700, color:'#dc2626' }}>+ ₹ {inr(labourAmt)}</td>
                    </tr>
                    {extraBags > 0 && (
                      <tr>
                        <td style={{ border:'1px solid #b8cef0', padding:'6px 9px', fontSize:10, background:'#eff6ff', fontWeight:700, color:'#1e40af' }}>Extra Bag Charges (₹{inr(extraBagRate)} × {extraBags} bags)</td>
                        <td style={{ border:'1px solid #b8cef0', padding:'6px 9px', fontSize:10, textAlign:'right', fontWeight:700, color:'#dc2626' }}>+ ₹ {inr(extraBagAmt)}</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ border:'1px solid #b8cef0', padding:'6px 9px', fontSize:10, background:'#eff6ff', fontWeight:700, color:'#1e40af' }}>Market Fees (1%)</td>
                      <td style={{ border:'1px solid #b8cef0', padding:'6px 9px', fontSize:10, textAlign:'right', fontWeight:700, color:'#b45309' }}>+ ₹ {inr(marketFee)}</td>
                    </tr>
                    <tr style={{ background:'#dbeafe' }}>
                      <td style={{ padding:'9px 10px', fontWeight:900, color:'#1e3a8a', fontSize:13 }}>TOTAL AMOUNT</td>
                      <td style={{ padding:'9px 10px', fontWeight:900, color:'#1e3a8a', fontSize:15, textAlign:'right' }}>₹ {inr(Math.max(0,balance))}</td>
                    </tr>
                  </tbody>
                </table>

                {/* In Words */}
                <div style={{ border:'1px solid #93c5fd', borderRadius:3, padding:'5px 9px', fontSize:10, marginTop:6, background:'#f8fbff', position:'relative', zIndex:1 }}>
                  <strong style={{ color:'#1e40af' }}>In Words :</strong> <span style={{ color:'#111' }}>{toIndianWords(Math.max(0,balance))} Only</span>
                </div>
                <div style={{ textAlign:'right', fontSize:9, color:'#888', marginTop:3, fontStyle:'italic' }}>(E.&amp;O.E.)</div>

                {/* Footer */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginTop:18, position:'relative', zIndex:1 }}>
                  <div style={{ textAlign:'center', borderTop:'1px solid #555', paddingTop:4, fontSize:9.5, width:120, color:'#444' }}>Receiver's Sign.</div>
                  <div style={{ fontWeight:800, fontSize:11, color:'#1a1a1a' }}>For –  BUYER BILL</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Set Rate Modal ───────────────────────────────────────────
function SetRateModal({ buyer, onClose, onSave }) {
  const [rate,    setRate]    = useState(buyer.rate_fixed || '');
  const [amount,  setAmount]  = useState(buyer.amount || '');
  const [loading, setLoading] = useState(false);

  const handleRate = (e) => {
    const r = e.target.value; setRate(r);
    if (r && buyer.weight) setAmount((parseFloat(r) * parseFloat(buyer.weight)).toFixed(2));
  };

  const save = async () => {
    if (!rate) { toast.error('Enter rate per kg'); return; }
    setLoading(true);
    try {
      await updateBuyer(buyer.id, { rate_fixed: parseFloat(rate), amount: parseFloat(amount) });
      toast.success('Rate updated!'); onSave(); onClose();
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">✏️ Set Rate — {buyer.name}</div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ background:'var(--bg-panel)', borderRadius:10, padding:'14px 18px', marginBottom:20, border:'1px solid var(--border)', fontSize:13 }}>
          {[['Material',buyer.material],['Lot No',buyer.lot_number],['Bags',buyer.num_bags],['Weight',`${fmtNum(buyer.weight)} kg`]].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'3px 0' }}>
              <span style={{ color:'var(--text-muted)' }}>{k}</span>
              <strong style={{ color:'var(--text-primary)' }}>{v}</strong>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="form-group">
            <label className="form-label">Rate Fixed (₹ per kg) *</label>
            <input className="form-input" type="number" value={rate} onChange={handleRate} placeholder="e.g. 45.00" step="0.01" min="0" style={{ textTransform:'none' }} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Total Amount (₹)</label>
            <input className="form-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" style={{ textTransform:'none' }} />
          </div>
          {rate && buyer.weight && (
            <div style={{ background:'var(--blue-dim)', border:'1px solid rgba(59,130,246,0.3)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--blue)' }}>
              ₹{rate} × {buyer.weight} kg = <strong>₹ {fmtINR(parseFloat(rate)*parseFloat(buyer.weight))}</strong>
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-primary" onClick={save} disabled={loading} style={{ flex:1 }}><Check size={15} /> {loading?'Saving...':'Save Rate'}</button>
            <button className="btn btn-secondary" onClick={onClose} style={{ flex:1 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const cbStyle = (checked) => ({
  width:17, height:17, borderRadius:4, border:`2px solid ${checked?'#1a56db':'var(--border)'}`,
  background:checked?'#1a56db':'transparent', cursor:'pointer', display:'flex',
  alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s',
});

// ─── Edit Buyer Modal ─────────────────────────────────────────
function EditBuyerModal({ buyer, existingBuyers = [], onClose, onSave }) {
  const [name,     setName]     = useState(buyer.name || '');
  const [shortName,setShortName]= useState(buyer.serial_number || '');
  const [mobile,   setMobile]   = useState(buyer.mobile && buyer.mobile !== '0000000000' ? buyer.mobile : '');
  const [advance,  setAdvance]  = useState(String(buyer.advance_amount || ''));
  const [labour,   setLabour]   = useState(String(buyer.labour_rate ?? 5));
  const [extraBags,       setExtraBags]       = useState(String(buyer.extra_bags || ''));
  const [extraBagAmount,  setExtraBagAmount]  = useState(String(buyer.extra_bag_amount || ''));
  const [saving,   setSaving]   = useState(false);

  // Two different people can share a name (e.g. two "SUDHEER"s) — bills/receipts/prints
  // show just the name, so a rename that collides with someone else is genuinely ambiguous
  // there. Block it (excluding this buyer's own existing rows, since renaming across their
  // own multiple purchase-day records isn't a conflict with themselves).
  const nameUpper = name.trim().toUpperCase();
  const nameConflict = nameUpper
    ? existingBuyers.find(b => b.id !== buyer.id && (b.name || '').trim().toUpperCase() === nameUpper)
    : null;

  const save = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (nameConflict) { toast.error(`A buyer named "${name}" already exists — add an initial to tell them apart`); return; }
    setSaving(true);
    try {
      const newShortName = shortName.trim().toUpperCase();
      await updateBuyer(buyer.id, {
        name:           name.trim().toUpperCase(),
        serial_number:  newShortName || buyer.serial_number,
        // lot_number is the field used elsewhere (bag-buyer matching, ledger grouping) to
        // identify a buyer by short name — keep it in sync with serial_number so a rename
        // here actually takes effect everywhere, not just in this table's display column.
        lot_number:     newShortName || buyer.lot_number,
        mobile:         mobile.trim() || '0000000000',
        advance_amount: parseFloat(advance) || 0,
        labour_rate:    parseFloat(labour) || 0,
        extra_bags:        parseInt(extraBags) || 0,
        extra_bag_amount:  parseFloat(extraBagAmount) || 0,
      });
      toast.success('Buyer updated!');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:480, width:'95%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">✏️ Edit Buyer — {buyer.serial_number || buyer.name}</div>
          <button className="modal-close" onClick={onClose}><X size={20}/></button>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" type="text" value={name}
                onChange={e => setName(e.target.value)}
                placeholder="FULL NAME"
                style={{ textTransform:'uppercase', ...(nameConflict ? { borderColor:'var(--red)', boxShadow:'0 0 0 3px var(--red-dim)' } : {}) }}
                autoFocus
              />
              {nameConflict && (
                <div style={{ fontSize:11, color:'var(--red)', marginTop:3 }}>
                  A buyer named "{name}" already exists — add an initial (e.g. {name} K)
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Short Name</label>
              <input className="form-input" type="text" value={shortName}
                onChange={e => setShortName(e.target.value)}
                placeholder="e.g. AKC"
                style={{ textTransform:'uppercase' }}
              />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Mobile</label>
              <input className="form-input" type="tel" value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="Mobile number"
                style={{ textTransform:'none' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Advance Paid (₹)</label>
              <input className="form-input" type="number" value={advance}
                onChange={e => setAdvance(e.target.value)}
                placeholder="0"
                step="1" min="0"
                style={{ textTransform:'none' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Labour Charges Per Bag (₹)</label>
            <input className="form-input" type="number" value={labour}
              onChange={e => setLabour(e.target.value)}
              placeholder="5"
              step="1" min="0"
              style={{ textTransform:'none' }}
            />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Number of Extra Bags</label>
              <input className="form-input" type="number" value={extraBags}
                onChange={e => setExtraBags(e.target.value)}
                placeholder="0"
                step="1" min="0"
                style={{ textTransform:'none' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Extra Bag Amount (₹ per bag)</label>
              <input className="form-input" type="number" value={extraBagAmount}
                onChange={e => setExtraBagAmount(e.target.value)}
                placeholder="0"
                step="1" min="0"
                style={{ textTransform:'none' }}
              />
            </div>
          </div>

          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving || !!nameConflict} style={{ flex:1 }}>
              <Check size={15}/> {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button className="btn btn-secondary" onClick={onClose} style={{ flex:1 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main BuyerList ───────────────────────────────────────────
export default function BuyerList() {
  const navigate = useNavigate();
  const { materials: MATERIALS } = useMaterials();
  const [buyers,         setBuyers]       = useState([]);
  const [buyerStats,     setBuyerStats]   = useState({});
  const [statsLoading,   setStatsLoading] = useState(true);
  const [loading,        setLoading]      = useState(true);
  const [search,         setSearch]       = useState('');
  const [filterDate,     setFilterDate]   = useState(todayISO());
  const [filterMaterial, setFilterMaterial] = useState('');
  const [viewPurchases,  setViewPurchases] = useState(null);
  const [editRate,       setEditRate]     = useState(null);
  const [editBuyer,      setEditBuyer]    = useState(null);
  const [confirm,        setConfirm]      = useState(null);
  const { sort, toggleSort, sortRows } = useSort('name');
  const [selected,       setSelected]     = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBuyers('');
      setBuyers(res.data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load buyers');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const stats = await fetchAllBuyerStats(filterDate);
      setBuyerStats(stats);
    } catch (err) {
      console.warn('Stats load failed:', err.message);
    } finally {
      setStatsLoading(false);
    }
  }, [filterDate]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const getLiveStats = (b) => {
    const key = (b.lot_number && b.lot_number !== '—')
      ? b.lot_number.toUpperCase()
      : (b.name || '').toUpperCase();
    return buyerStats[key] || { bags: 0, weight: 0, amount: 0, materials: [], byMaterial: {} };
  };

  const handleDelete = (id, name) => {
    setConfirm({
      title: 'Delete Buyer?',
      message: `"${name}" will be permanently removed.`,
      onConfirm: async () => {
        try { await apiDeleteBuyer(id); toast.success(`${name} deleted`); load(); loadStats(); }
        catch (err) { toast.error(err.message || 'Delete failed'); }
      },
    });
  };

  // `material` + `includeExtraCharge`: when a buyer purchased more than one material,
  // each material gets its own separate bill (never merged); the flat Extra Bag Charge
  // is only shown on the first material's bill so it isn't double-counted across bills.
  const handleDirectPrint = async (buyer, material, includeExtraCharge = true) => {
    const buyerKey = (buyer.lot_number && buyer.lot_number !== '—') ? buyer.lot_number : buyer.name;
    const tid = toast.loading('Preparing bill...');
    try {
      const rows = await fetchBuyerPurchases(buyerKey, filterDate, material);
      toast.dismiss(tid);
      const billBuyer = includeExtraCharge ? buyer : { ...buyer, extra_bags: 0 };
      const html = buildBuyerBillHtml({ buyer: billBuyer, sellerRows: rows, advance: buyer.advance_amount || 0 });
      const w = window.open('', '_blank', 'width=700,height=900');
      w.document.write(html); w.document.close();
    } catch (err) { toast.dismiss(tid); toast.error('Failed to prepare bill'); }
  };

  const handlePrintAll = async () => {
    if (filtered.length === 0) return;
    const tid = toast.loading('Preparing all bills...');
    try {
      const buyersData = await Promise.all(
        filtered.map(async (buyer) => {
          const buyerKey = (buyer.lot_number && buyer.lot_number !== '—') ? buyer.lot_number : buyer.name;
          const rows = await fetchBuyerPurchases(buyerKey, filterDate);
          return { buyer, rows };
        })
      );
      toast.dismiss(tid);
      const html = buildAllBuyersBillHtml({ buyersData, date: filterDate });
      const w = window.open('', '_blank', 'width=900,height=1100');
      w.document.write(html); w.document.close();
    } catch (err) { toast.dismiss(tid); toast.error('Failed to prepare report'); }
  };

  const clearFilters = () => { setSearch(''); setFilterDate(''); setFilterMaterial(''); };
  const hasFilter = search || filterDate || filterMaterial;

  const toggleOne = (id) => setSelected(prev => { const next = new Set(prev); next.has(id)?next.delete(id):next.add(id); return next; });
  const toggleAll = () => {
    const allIds = filtered.map(b => b.id);
    if (allIds.every(id => selected.has(id))) {
      setSelected(prev => { const next = new Set(prev); allIds.forEach(id=>next.delete(id)); return next; });
    } else {
      setSelected(prev => { const next = new Set(prev); allIds.forEach(id=>next.add(id)); return next; });
    }
  };

  const handlePrintSelected = async () => {
    const toPrint = filtered.filter(b => selected.has(b.id));
    if (toPrint.length === 0) return;
    const tid = toast.loading(`Preparing ${toPrint.length} bill(s)...`);
    try {
      // Same rule as the single View/Print bill: a buyer who purchased more than one
      // material gets one separate bill page per material here too, never merged.
      const buyersData = (await Promise.all(
        toPrint.map(async (buyer) => {
          const buyerKey = (buyer.lot_number && buyer.lot_number !== '—') ? buyer.lot_number : buyer.name;
          const live = getLiveStats(buyer);
          const mats = live.materials.length > 0 ? live.materials : [null];
          return Promise.all(mats.map(async (material, i) => {
            const rows = await fetchBuyerPurchases(buyerKey, filterDate, material);
            const billBuyer = i === 0 ? buyer : { ...buyer, extra_bags: 0 };
            return { buyer: billBuyer, rows };
          }));
        })
      )).flat();
      toast.dismiss(tid);
      const html = buildMultipleBuyerBillsHtml({ buyersData });
      const w = window.open('', '_blank', 'width=700,height=900');
      w.document.write(html); w.document.close();
    } catch (err) { toast.dismiss(tid); toast.error('Failed to prepare report'); }
  };

  const filtered = buyers.filter(b => {
    const q = search.toLowerCase();
    const matchesSearch = (!q || [b.name, b.mobile, b.lot_number, b.serial_number, b.material]
      .some(v => v?.toLowerCase().includes(q)));
    const live = getLiveStats(b);
    const matchesMaterial = !filterMaterial
      || b.material === filterMaterial
      || live.materials.includes(filterMaterial);
    const matchesDate = !filterDate || statsLoading || live.bags > 0;
    return matchesSearch && matchesMaterial && matchesDate;
  });

  // A buyer who purchased more than one material gets one display row per material —
  // each with its own bags/weight/amount/bill — instead of one merged row. Short Name
  // and Name are rendered once (rowSpan) and shared across that buyer's material rows.
  const sortedBuyers = sortRows(filtered, {
    short:    b => ((b.lot_number && b.lot_number !== '—') ? b.lot_number : ''),
    name:     b => b.name,
    material: b => getLiveStats(b).materials.join(', '),
    bags:     b => getLiveStats(b).bags,
    weight:   b => getLiveStats(b).weight,
    amount:   b => getLiveStats(b).amount,
    total:    b => getLiveStats(b).amount - Number(b.advance_amount || 0),
    date:     b => b.entry_date,
  });
  const displayRows = sortedBuyers.flatMap(b => {
    const live = getLiveStats(b);
    let mats = live.materials;
    if (filterMaterial) mats = mats.filter(m => m === filterMaterial);
    if (mats.length === 0) {
      return [{ buyer: b, material: null, isFirst: true, rowSpan: 1 }];
    }
    return mats.map((m, i) => ({ buyer: b, material: m, isFirst: i === 0, rowSpan: mats.length }));
  });
  const buyerIndex = new Map(sortedBuyers.map((b, i) => [b.id, i + 1]));

  const summaryTotals = filtered.reduce((a, b) => {
    const s   = getLiveStats(b);
    const adv = Number(b.advance_amount || 0);
    return {
      bags:    a.bags    + s.bags,
      weight:  a.weight  + s.weight,
      amount:  a.amount  + s.amount,
      advance: a.advance + adv,
    };
  }, { bags:0, weight:0, amount:0, advance:0 });

  const Spinner = () => (
    <span style={{ color:'var(--text-muted)', fontSize:12, fontStyle:'italic' }}>…</span>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Buyer List</div>
          <div className="page-subtitle">
            {loading || statsLoading
              ? 'Loading...'
              : filterDate
                ? `${filtered.length} buyers with purchases on ${filterDate}`
                : `${filtered.length} buyers registered`
            }
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-primary" onClick={() => navigate('/buyer-registration')} title="Go to Buyer Registration">
            <ShoppingCart size={15} /> Buyer Registration
          </button>
          {selected.size > 0 && (
            <button
              className="btn btn-sm"
              style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:7, padding:'7px 15px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}
              onClick={handlePrintSelected}
              title="Print selected buyers"
            >
              <Printer size={14} /> Print {selected.size} Selected
            </button>
          )}
          <button
            className="btn btn-sm"
            style={{ background:'#1a56db', color:'#fff', border:'none', borderRadius:7, padding:'7px 15px', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5, opacity: filtered.length===0 ? 0.5 : 1 }}
            onClick={handlePrintAll}
            disabled={filtered.length === 0 || loading || statsLoading}
            title="Print all buyers report (A4)"
          >
            <Printer size={14} /> Print All (A4)
          </button>
          <button className="btn btn-secondary" onClick={() => { load(); loadStats(); }} disabled={loading || statsLoading}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{ flex:2 }}>
          <Search className="search-icon" size={16} />
          <input className="form-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, mobile, lot no..." style={{ textTransform:'none' }} />
        </div>
        <input className="form-input" type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} style={{ textTransform:'none', flex:1 }} />
        <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate(todayISO())}>Today</button>
        <button className="btn btn-secondary btn-sm" onClick={() => setFilterDate('')}>All</button>
        <select className="form-select" value={filterMaterial} onChange={e=>setFilterMaterial(e.target.value)} style={{ flex:1 }}>
          <option value="">All Materials</option>
          {MATERIALS.map(m=><option key={m}>{m}</option>)}
        </select>
        {hasFilter && <button className="btn btn-secondary" onClick={clearFilters}><X size={14} /> Clear</button>}
      </div>

      {filtered.length > 0 && (
        <div style={{ display:'flex', gap:12, marginBottom:16 }}>
          {[
            { label:'Buyers',       value: filtered.length,                                                                                color:'var(--accent)' },
            { label:'Total Bags',   value: statsLoading ? '…' : summaryTotals.bags,                                                        color:'var(--green)'  },
            { label:'Total Weight', value: statsLoading ? '…' : fmtNum(summaryTotals.weight) + ' kg',                                      color:'var(--blue)'   },
            { label:'Total Amount', value: statsLoading ? '…' : '₹ ' + fmtINR(summaryTotals.amount),                                      color:'var(--purple)' },
            { label:'Total Balance',value: statsLoading ? '…' : '₹ ' + fmtINR(Math.max(0, summaryTotals.amount - summaryTotals.advance)), color:'var(--red)'    },
          ].map(item => (
            <div key={item.label} style={{ flex:1, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 14px' }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:3 }}>{item.label}</div>
              <div style={{ fontSize:15, fontWeight:800, color:item.color, fontFamily:'var(--font-display)' }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="table-wrapper">
        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>Loading buyers...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <h3>No buyers found</h3>
            <p style={{ fontSize:12, marginTop:6 }}>
              {filterDate
                ? `No purchases recorded for ${filterDate}. Try "All" to see all buyers.`
                : hasFilter
                  ? 'Adjust filters'
                  : 'Register a buyer to get started'
              }
            </p>
            {hasFilter && (
              <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ marginTop:14 }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <table>
            {/* <thead>
              <tr>
                <th>#</th>
                <th>Short Name</th>
                <th>Name</th>
                <th>Bags</th>
                <th>Weight(kg)</th>
                <th>Amount(₹)</th>
                <th>Total(₹)</th>
                <th>Date</th>
                <th style={{ textAlign:'center' }}>Actions</th>
              </tr>
            </thead> */}

            <thead>
              <tr>
                <th style={{ width:36, textAlign:'center' }}>
                  <div
                    onClick={toggleAll}
                    style={{ ...cbStyle(filtered.length > 0 && filtered.every(b => selected.has(b.id))), margin:'0 auto', opacity: filtered.some(b=>selected.has(b.id)) && !filtered.every(b=>selected.has(b.id)) ? 0.6 : 1 }}
                  >
                    {(filtered.every(b=>selected.has(b.id)) || filtered.some(b=>selected.has(b.id))) && <Check size={11} color="#fff" strokeWidth={3}/>}
                  </div>
                </th>
                <th>#</th>
                <SortTh col="short" label="Short Name" sort={sort} onSort={toggleSort} />
                <SortTh col="name" label="Name" sort={sort} onSort={toggleSort} />
                <SortTh col="material" label="Material" sort={sort} onSort={toggleSort} />
                <SortTh col="bags" label="Bags" sort={sort} onSort={toggleSort} />
                <SortTh col="weight" label="Weight(kg)" sort={sort} onSort={toggleSort} />
                <SortTh col="amount" label="Amount(₹)" sort={sort} onSort={toggleSort} />
                <SortTh col="total" label="Total(₹)" sort={sort} onSort={toggleSort} />
                <SortTh col="date" label="Date" sort={sort} onSort={toggleSort} />
                <th style={{ textAlign:'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => {
                const { buyer: b, material, isFirst, rowSpan } = row;
                const live    = getLiveStats(b);
                const matStats = material ? (live.byMaterial[material] || { bags:0, weight:0, amount:0 }) : live;
                const advance = Number(b.advance_amount || 0);
                // Advance is a buyer-level payment, not tied to one material — only
                // deduct it on the first row so a multi-material buyer's balance isn't
                // reduced by the same advance on every one of their separate rows.
                const balance = matStats.amount - (isFirst ? advance : 0);

                const isChecked = selected.has(b.id);
                return (
                  <tr key={`${b.id}-${material || 'all'}`}
                    style={{ background: isChecked ? 'rgba(26,86,219,0.06)' : undefined, cursor:'pointer' }}
                    onClick={() => setEditBuyer(b)}
                  >
                    {isFirst && (
                      <td rowSpan={rowSpan} style={{ textAlign:'center', padding:'10px 8px' }} onClick={e => e.stopPropagation()}>
                        <div onClick={() => toggleOne(b.id)} style={{ ...cbStyle(isChecked), margin:'0 auto' }}>
                          {isChecked && <Check size={11} color="#fff" strokeWidth={3}/>}
                        </div>
                      </td>
                    )}
                    {isFirst && (
                      <td rowSpan={rowSpan} style={{ fontSize:12, color:'var(--text-muted)' }}>{buyerIndex.get(b.id)}</td>
                    )}
                    {isFirst && (
                      <td rowSpan={rowSpan} style={{ fontSize:12, fontFamily:'var(--font-body)', fontWeight:800, color:'#4fa3ff', letterSpacing:'0.5px' }}>
                        {b.serial_number || '—'}
                      </td>
                    )}
                    {isFirst && (
                      <td rowSpan={rowSpan} style={{ fontWeight:600, color:'var(--text-primary)', borderRight:'1px solid var(--border-light)' }}>{b.name || '—'}</td>
                    )}
                    <td>
                      {material ? (
                        <span className={`badge ${MATERIAL_BADGE[material] || 'badge-amber'}`}>{material}</span>
                      ) : b.material && b.material !== 'GENERAL' ? (
                        <span className={`badge ${MATERIAL_BADGE[b.material] || 'badge-amber'}`}>{b.material}</span>
                      ) : (
                        <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign:'center', fontWeight:700, color:'var(--text-primary)' }}>
                      {statsLoading ? <Spinner /> : matStats.bags > 0 ? matStats.bags : <span style={{ color:'var(--text-muted)' }}>0</span>}
                    </td>
                    <td style={{ fontWeight:600, color:'var(--text-primary)' }}>
                      {statsLoading ? <Spinner /> : matStats.weight > 0 ? fmtNum(matStats.weight) : <span style={{ color:'var(--text-muted)' }}>0</span>}
                    </td>
                    <td style={{ fontWeight:700, color:'var(--blue)' }}>
                      {statsLoading ? <Spinner /> : matStats.amount > 0 ? `₹${fmtINR(matStats.amount)}` : <span style={{ color:'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ fontWeight:700, color: balance > 0 ? 'var(--red)' : 'var(--green)' }}>
                      {statsLoading ? <Spinner /> : matStats.amount > 0 ? `₹${fmtINR(Math.max(0, balance))}` : <span style={{ color:'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ color:'var(--text-muted)', fontSize:12 }}>{fmtDate(b.entry_date)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:5, justifyContent:'center' }}>
                        <button className="btn btn-green btn-sm" onClick={() => setViewPurchases({ buyer: b, material, includeExtraCharge: isFirst })} title="View Bill">
                          <Eye size={13} /> <span className="btn-text">View</span>
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background:'var(--accent-dim)', color:'var(--accent)', border:'1px solid rgba(245,158,11,0.3)' }}
                          onClick={() => handleDirectPrint(b, material, isFirst)}
                          title="Print Bill"
                        >
                          <Printer size={13} />
                        </button>
                        <button className="btn btn-blue btn-sm" onClick={() => setEditBuyer(b)} title="Edit Buyer">
                          <Edit2 size={13} />
                        </button>
                        <button className="btn btn-red btn-sm" onClick={() => handleDelete(b.id, b.name)} title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {filtered.length > 1 && (
              <tfoot>
                <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--border)' }}>
                  <td colSpan={4} style={{ padding:'12px 16px', fontWeight:700, color:'var(--text-secondary)', fontSize:12 }}>
                    TOTALS ({filtered.length} buyers)
                  </td>
                  <td style={{ padding:'12px 16px', fontWeight:800, color:'var(--text-primary)' }}>
                    {statsLoading ? '…' : summaryTotals.bags}
                  </td>
                  <td style={{ padding:'12px 16px', fontWeight:800, color:'var(--text-primary)' }}>
                    {statsLoading ? '…' : fmtNum(summaryTotals.weight)}
                  </td>
                  <td style={{ padding:'12px 16px', fontWeight:800, color:'var(--blue)' }}>
                    {statsLoading ? '…' : `₹${fmtINR(summaryTotals.amount)}`}
                  </td>
                  <td style={{ padding:'12px 16px', fontWeight:700, color:'var(--red)' }}>
                    {statsLoading ? '…' : `₹${fmtINR(Math.max(0, summaryTotals.amount - summaryTotals.advance))}`}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>

      {viewPurchases && (
        <PurchasesModal
          buyer={viewPurchases.buyer}
          material={viewPurchases.material}
          includeExtraCharge={viewPurchases.includeExtraCharge}
          filterDate={filterDate}
          onClose={() => setViewPurchases(null)}
          onUpdate={() => { setViewPurchases(null); load(); loadStats(); }}
        />
      )}
      {editRate && (
        <SetRateModal
          buyer={editRate}
          onClose={() => setEditRate(null)}
          onSave={() => { load(); loadStats(); }}
        />
      )}
      {editBuyer && (
        <EditBuyerModal
          buyer={editBuyer}
          existingBuyers={buyers}
          onClose={() => setEditBuyer(null)}
          onSave={() => { setEditBuyer(null); load(); loadStats(); }}
        />
      )}
      {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
    </div>
  );
}
