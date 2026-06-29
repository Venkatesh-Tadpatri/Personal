import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, TrendingUp, Users, ShoppingCart, Package, Download, Printer } from 'lucide-react';
import axios from 'axios';
import { fmtINR, fmtNum, todayISO, MATERIAL_BADGE } from '../utils';

const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });

const fmt2 = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
const fmtN = (v) => Math.round(Number(v || 0)).toLocaleString('en-IN');
const buyerLabourRate = (buyer) => Number(buyer?.labour_rate ?? 5) || 0;
const buyerExtraBags = (buyer) => Number(buyer?.extra_bags || 0) || 0;
const buyerExtraBagAmount = (buyer) => Number(buyer?.extra_bag_amount || 0) || 0;
const isGroupedSummaryMaterial = (material) => ['GINGER', 'ONION'].includes(material);
const bagCount = (bag) => Number(bag.bags || 1);
const bagCountTotal = (bags) => bags.reduce((s, bag) => s + bagCount(bag), 0);

function groupBuyerSummaryBags(bags) {
  const grouped = [];

  bags.forEach(bag => {
    if (!isGroupedSummaryMaterial(bag.material)) {
      grouped.push({ ...bag, bags: 1 });
      return;
    }

    const last = grouped[grouped.length - 1];
    const sameGroup = last
      && isGroupedSummaryMaterial(last.material)
      && last.sellerId === bag.sellerId
      && last.lot === bag.lot
      && Math.abs((Number(last._perBagWeight) || 0) - (Number(bag.weight) || 0)) < 0.00001
      && Number(last.rate || 0) === Number(bag.rate || 0)
      && (last.rateMode || 'PER_100KG') === (bag.rateMode || 'PER_100KG');

    if (!sameGroup) {
      grouped.push({ ...bag, bags: 1, _perBagWeight: Number(bag.weight) || 0 });
      return;
    }

    last.bags += 1;
    last.weight += Number(bag.weight) || 0;
    last.amount += Number(bag.amount) || 0;
  });

  return grouped;
}

export default function BuyerSummary() {
  const [buyers,     setBuyers]     = useState([]);
  const [sellers,    setSellers]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filterDate, setFilterDate] = useState(todayISO());
  const [showTable,  setShowTable]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterDate ? { date: filterDate } : {};
      const [buyersRes, sellersRes] = await Promise.all([
        API.get('/api/buyers'),
        API.get('/api/sellers', { params }),
      ]);
      const rawBuyers = buyersRes.data.data || [];
      rawBuyers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setBuyers(rawBuyers);
      setSellers(sellersRes.data.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => { load(); }, [load]);

  // Build stats map from seller bag_data keyed by buyer name/lot
  const buyerStatsMap = {};
  sellers.forEach(seller => {
    let bags = [];
    try { bags = JSON.parse(seller.bag_data || '[]'); } catch {}
    bags.forEach((bag, idx) => {
      if (!bag.buyer) return;
      const key = bag.buyer.toUpperCase();
      if (!buyerStatsMap[key]) buyerStatsMap[key] = [];
      buyerStatsMap[key].push({
        sellerId: seller.id,
        bagIndex: idx,
        lot:      bag.lot || seller.lot_number || '—',
        weight:   Number(bag.weight) || 0,
        rate:     Number(bag.rate)   || 0,
        amount:   Number(bag.amount) || 0,
        rateMode: bag.rate_mode || bag.rateMode || 'PER_100KG',
        material: seller.material && seller.material !== 'GENERAL' ? seller.material : '—',
      });
    });
  });

  // Compute per-buyer rows — only buyers with purchases in the filtered period
  const buyerRows = buyers
    .map(buyer => {
      const key  = (buyer.lot_number && buyer.lot_number !== '—')
        ? buyer.lot_number.toUpperCase()
        : (buyer.name || '').toUpperCase();
      const rawBags    = buyerStatsMap[key] || [];
      const sortedBags = [...rawBags].sort((a, b) => {
        if ((a.sellerId || 0) !== (b.sellerId || 0)) return (a.sellerId || 0) - (b.sellerId || 0);
        const na = parseInt(a.lot) || 0;
        const nb = parseInt(b.lot) || 0;
        if (na !== nb) return na - nb;
        return (a.bagIndex || 0) - (b.bagIndex || 0);
      });
      const bags       = groupBuyerSummaryBags(sortedBags);
      const numBags    = bagCountTotal(bags);
      const totalWeight= bags.reduce((s, b) => s + b.weight, 0);
      const grossAmt   = bags.reduce((s, b) => s + b.amount, 0);
      const labourRate = buyerLabourRate(buyer);
      const labourAmt  = numBags * labourRate;
      const marketFee  = Math.round(grossAmt * 0.01);
      const extraBags    = buyerExtraBags(buyer);
      const extraBagRate = buyerExtraBagAmount(buyer);
      const extraBagAmt  = extraBags * extraBagRate;
      const totalAmt   = grossAmt + labourAmt + marketFee + extraBagAmt;
      const advance    = Number(buyer.advance_amount) || 0;
      const balance    = totalAmt - advance;

      // Split into one sub-row per material — a buyer who bought e.g. TAMARIND and
      // GINGER gets separate Gross/Labour/Market Fee/Total/Balance per material,
      // never merged into one combined figure.
      const subRows = [];
      bags.forEach(bag => {
        let grp = subRows.find(g => g.material === bag.material);
        if (!grp) { grp = { material: bag.material, bags: [] }; subRows.push(grp); }
        grp.bags.push(bag);
      });
      // Advance and Extra Bag Charges are buyer-level, not tied to one material — they're
      // placed on whichever material sorts first alphabetically (same convention used in
      // Buyer List), independent of display order, so they're never counted twice.
      const primaryMaterial = [...subRows].map(g => g.material).sort()[0];
      subRows.forEach(g => {
        g.numBags   = bagCountTotal(g.bags);
        g.weight    = g.bags.reduce((s, b) => s + b.weight, 0);
        g.grossAmt  = g.bags.reduce((s, b) => s + b.amount, 0);
        g.labourAmt = g.numBags * labourRate;
        g.marketFee = Math.round(g.grossAmt * 0.01);
        g.extraBagAmt = g.material === primaryMaterial ? extraBagAmt : 0;
        g.totalAmt  = g.grossAmt + g.labourAmt + g.marketFee + g.extraBagAmt;
        g.advance   = g.material === primaryMaterial ? advance : 0;
        g.balance   = g.totalAmt - g.advance;
      });

      return { buyer, key, bags, subRows, numBags, totalWeight, grossAmt, labourAmt, marketFee, extraBagAmt, totalAmt, advance, balance };
    })
    .filter(r => r.numBags > 0);

  // Grand totals
  const grandBags    = buyerRows.reduce((s, r) => s + r.numBags,     0);
  const grandWeight  = buyerRows.reduce((s, r) => s + r.totalWeight, 0);
  const grandGross   = buyerRows.reduce((s, r) => s + r.grossAmt,    0);
  const grandLabour  = buyerRows.reduce((s, r) => s + r.labourAmt,   0);
  const grandMarket  = buyerRows.reduce((s, r) => s + r.marketFee,   0);
  const grandExtra   = buyerRows.reduce((s, r) => s + r.extraBagAmt, 0);
  const grandTotal   = buyerRows.reduce((s, r) => s + r.totalAmt,    0);
  const grandAdvance = buyerRows.reduce((s, r) => s + r.advance,     0);
  const grandBalance = buyerRows.reduce((s, r) => s + r.balance,     0);

  // CSV export
  const exportCSV = () => {
    const headers = ['Sr','Short Name','Name','Material','Lot No','Weight(kg)','Rate(/100kg)','Amount(₹)','Gross Amt(₹)','Labour(₹)','Extra Bag(₹)','Market Fee(₹)','Total Amt(₹)','Advance(₹)','Balance(₹)'];
    const rows = [];
    buyerRows.forEach((r, ri) => {
      if (r.bags.length === 0) {
        rows.push([ri+1, r.buyer.serial_number||'—', r.buyer.name, '—', '—', 0, 0, 0, 0, 0, 0, 0, 0, r.advance, r.balance]);
        return;
      }
      let firstOfBuyer = true;
      r.subRows.forEach(sub => {
        sub.bags.forEach((b, bi) => {
          rows.push([
            firstOfBuyer ? ri+1 : '', firstOfBuyer ? (r.buyer.serial_number||'—') : '', firstOfBuyer ? r.buyer.name : '',
            b.material, b.lot, b.weight, b.rate, b.amount,
            bi===0 ? sub.grossAmt : '', bi===0 ? sub.labourAmt : '', bi===0 ? sub.extraBagAmt : '', bi===0 ? sub.marketFee : '',
            bi===0 ? sub.totalAmt : '', bi===0 ? sub.advance : '', bi===0 ? sub.balance : '',
          ]);
          firstOfBuyer = false;
        });
      });
    });
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `buyer-summary-${filterDate||'all'}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  // Print
  const printTable = () => {
    const dateLabel = filterDate
      ? new Date(filterDate+'T00:00:00').toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
      : 'All Time';
    const P = 'padding:6px 7px;border:1px solid #b8cef0;font-size:10px;';

    let rowsHtml = '';
    buyerRows.forEach((r, ri) => {
      const rowBg = ri % 2 === 0 ? '#ffffff' : '#f0f7ff';
      const sn    = r.buyer.serial_number || '—';

      if (r.bags.length === 0) {
        rowsHtml += `<tr style="background:${rowBg};border-bottom:2px solid #93c5fd">
          <td style="${P}font-weight:800;color:#d97706;text-align:center">${ri+1}</td>
          <td style="${P}font-weight:800;color:#4fa3ff;font-family:monospace">${sn}</td>
          <td style="${P}font-weight:700">${r.buyer.name}</td>
          <td style="${P}text-align:center;color:#999">—</td>
          <td style="${P}text-align:center;font-weight:700">0</td>
          <td style="${P}text-align:right;color:#999">—</td><td style="${P}text-align:right;color:#999">—</td><td style="${P}text-align:right;color:#999">—</td>
          <td style="${P}text-align:right;background:#eff6ff;font-weight:800;color:#1a56db">—</td>
          <td style="${P}text-align:right;background:#fff5f5;color:#dc2626;font-weight:700">—</td>
          <td style="${P}text-align:right;background:#fdf2f8;color:#a21caf;font-weight:700">—</td>
          <td style="${P}text-align:right;background:#fff7ed;color:#b45309;font-weight:700">—</td>
          <td style="${P}text-align:right;background:#dbeafe;font-weight:900;color:#1e40af">—</td>
          <td style="${P}text-align:right;background:#f9fafb;color:#555;font-weight:700">${r.advance>0?'₹ '+fmt2(r.advance):'—'}</td>
          <td style="${P}text-align:right;background:#f0fdf4;font-weight:900;color:#166534">—</td>
        </tr>`;
        return;
      }

      // One sub-row per material — each gets its own Gross/Labour/Market Fee/Total/
      // Balance rowspan, never merged with another material's figures.
      r.subRows.forEach((sub, si) => {
        const subRc = sub.bags.length;
        sub.bags.forEach((bag, bi) => {
          const isSubLast   = bi === subRc - 1;
          const isBuyerLast = si === r.subRows.length - 1 && isSubLast;
          const bdr = isBuyerLast ? '2px solid #93c5fd' : isSubLast ? '2px solid #f59e0b' : '1px solid #e2e8f0';
          rowsHtml += `<tr style="background:${rowBg};border-bottom:${bdr}">`;
          if (si===0 && bi===0) rowsHtml += `<td rowspan="${r.numBags}" style="${P}font-weight:800;color:#d97706;text-align:center;vertical-align:middle">${ri+1}</td>`;
          if (si===0 && bi===0) rowsHtml += `<td rowspan="${r.numBags}" style="${P}font-weight:800;color:#4fa3ff;font-family:monospace;vertical-align:middle">${sn}</td>`;
          if (si===0 && bi===0) rowsHtml += `<td rowspan="${r.numBags}" style="${P}font-weight:700;vertical-align:middle">${r.buyer.name}</td>`;
          rowsHtml += `<td style="${P}font-family:monospace;font-weight:700;text-align:center;color:#1e3a5f">${bag.material}</td>`;
          rowsHtml += `<td style="${P}font-family:monospace;font-weight:700;text-align:center;color:#1e3a5f">${bag.lot}</td>`;
          rowsHtml += `<td style="${P}text-align:center;font-weight:800;font-size:12px">${bagCount(bag)}</td>`;
          rowsHtml += `<td style="${P}text-align:right;font-weight:700;color:#1e40af">${bag.weight>0?fmtN(bag.weight):'—'}</td>`;
          rowsHtml += `<td style="${P}text-align:right;font-weight:700;color:#166534">${bag.rate>0?fmtN(bag.rate):'—'}</td>`;
          rowsHtml += `<td style="${P}text-align:right;font-weight:700;color:#1a56db">${bag.amount>0?'₹ '+fmt2(bag.amount):'—'}</td>`;
          if (bi===0) rowsHtml += `<td rowspan="${subRc}" style="${P}text-align:right;background:#eff6ff;font-weight:800;color:#1a56db;vertical-align:middle">${sub.grossAmt>0?'₹ '+fmt2(sub.grossAmt):'—'}</td>`;
          if (bi===0) rowsHtml += `<td rowspan="${subRc}" style="${P}text-align:right;background:#fff5f5;color:#dc2626;font-weight:700;vertical-align:middle">+ ₹ ${fmt2(sub.labourAmt)}</td>`;
          if (bi===0) rowsHtml += `<td rowspan="${subRc}" style="${P}text-align:right;background:#fdf2f8;color:#a21caf;font-weight:700;vertical-align:middle">${sub.extraBagAmt>0?'+ ₹ '+fmt2(sub.extraBagAmt):'—'}</td>`;
          if (bi===0) rowsHtml += `<td rowspan="${subRc}" style="${P}text-align:right;background:#fff7ed;color:#b45309;font-weight:700;vertical-align:middle">+ ₹ ${fmt2(sub.marketFee)}</td>`;
          if (bi===0) rowsHtml += `<td rowspan="${subRc}" style="${P}text-align:right;background:#dbeafe;font-weight:900;color:#1e40af;vertical-align:middle">${sub.totalAmt>0?'₹ '+fmt2(sub.totalAmt):'—'}</td>`;
          if (bi===0) rowsHtml += `<td rowspan="${subRc}" style="${P}text-align:right;background:#f9fafb;color:#555;font-weight:700;vertical-align:middle">${sub.advance>0?'₹ '+fmt2(sub.advance):'—'}</td>`;
          if (bi===0) rowsHtml += `<td rowspan="${subRc}" style="${P}text-align:right;background:#f0fdf4;font-weight:900;color:#166534;vertical-align:middle">${sub.totalAmt>0?'₹ '+fmt2(sub.balance):'—'}</td>`;
          rowsHtml += '</tr>';
        });
      });
    });

    const html = `<!DOCTYPE html>
<html><head>
  <title>Buyer Summary — ${filterDate||'All'}</title>
  <style>
    @page { size: A4 landscape; margin: 6mm 8mm; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:Arial,sans-serif; font-size:10px; color:#111; background:#fff; }
    .page-wrap { border:3px solid #1a56db; border-radius:4px; padding:10px 12px; position:relative; }
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
    <div><span class="date-line">BUYER SUMMARY — ${dateLabel}</span></div>
  </div>
  <table>
    <thead><tr>
      <th style="width:32px;text-align:center">Sr</th>
      <th style="width:55px;text-align:center">Short</th>
      <th style="width:95px">Name</th>
      <th style="width:65px;text-align:center">Material</th>
      <th style="width:55px;text-align:center">Lot No</th>
      <th style="width:34px;text-align:center">Bags</th>
      <th style="width:65px;text-align:right">Weight(kg)</th>
      <th style="width:68px;text-align:right">Rate(/100kg)</th>
      <th style="width:75px;text-align:right">Amount(₹)</th>
      <th style="width:82px;text-align:right;background:#1e3a8a">Gross Amt(₹)</th>
      <th style="width:65px;text-align:right;background:#7f1d1d">Labour(₹)</th>
      <th style="width:68px;text-align:right;background:#86198f">Extra Bag(₹)</th>
      <th style="width:68px;text-align:right;background:#78350f">Mkt Fee(₹)</th>
      <th style="width:82px;text-align:right;background:#1e3a8a">Total Amt(₹)</th>
      <th style="width:72px;text-align:right">Advance(₹)</th>
      <th style="text-align:right;background:#14532d">Balance(₹)</th>
    </tr></thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot><tr>
      <td colspan="5" style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af">TOTALS · ${buyerRows.length} buyers</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af;text-align:center">${grandBags}</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af;text-align:right">${fmtN(grandWeight)} kg</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px"></td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px"></td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1a56db;text-align:right">₹ ${fmt2(grandGross)}</td>
      <td style="border:1px solid #b8cef0;background:#fee2e2;padding:7px;font-weight:800;color:#dc2626;text-align:right">₹ ${fmt2(grandLabour)}</td>
      <td style="border:1px solid #b8cef0;background:#fdf2f8;padding:7px;font-weight:800;color:#a21caf;text-align:right">₹ ${fmt2(grandExtra)}</td>
      <td style="border:1px solid #b8cef0;background:#fff7ed;padding:7px;font-weight:800;color:#b45309;text-align:right">₹ ${fmt2(grandMarket)}</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1a56db;text-align:right;font-size:12px">₹ ${fmt2(grandTotal)}</td>
      <td style="border:1px solid #b8cef0;background:#dbeafe;padding:7px;font-weight:800;color:#1e40af;text-align:right">₹ ${fmt2(grandAdvance)}</td>
      <td style="border:1px solid #b8cef0;background:#dcfce7;padding:7px;font-weight:800;color:#166534;text-align:right;font-size:13px">₹ ${fmt2(grandBalance)}</td>
    </tr></tfoot>
  </table>
  <div class="summary-box">
    <div class="sum-item"><div class="sum-label">Buyers</div><div class="sum-val">${buyers.length}</div></div>
    <div class="sum-item"><div class="sum-label">Total Bags</div><div class="sum-val">${grandBags}</div></div>
    <div class="sum-item"><div class="sum-label">Total Weight</div><div class="sum-val">${fmtN(grandWeight)} kg</div></div>
    <div class="sum-item"><div class="sum-label">Gross Amount</div><div class="sum-val">₹ ${fmt2(grandGross)}</div></div>
    <div class="sum-item"><div class="sum-label">Labour</div><div class="sum-val" style="color:#dc2626">₹ ${fmt2(grandLabour)}</div></div>
    <div class="sum-item"><div class="sum-label">Extra Bag Charges</div><div class="sum-val" style="color:#a21caf">₹ ${fmt2(grandExtra)}</div></div>
    <div class="sum-item"><div class="sum-label">Market Fee (1%)</div><div class="sum-val" style="color:#b45309">₹ ${fmt2(grandMarket)}</div></div>
    <div class="sum-item"><div class="sum-label">Total Amount</div><div class="sum-val">₹ ${fmt2(grandTotal)}</div></div>
    <div class="sum-item"><div class="sum-label">Advance Paid</div><div class="sum-val" style="color:#555">₹ ${fmt2(grandAdvance)}</div></div>
    <div class="sum-item"><div class="sum-label">Balance Due</div><div class="sum-val" style="color:#166534">₹ ${fmt2(grandBalance)}</div></div>
  </div>
  <div class="foot-note">Printed: ${new Date().toLocaleString('en-IN')} | (E.&amp;O.E.)</div>
  <script>window.onload=function(){window.print();}<\/script>
</div></body></html>`;

    const w = window.open('', '_blank', 'width=1100,height=800');
    if (w && w.document) { w.document.write(html); w.document.close(); }
  };

  const cell = { borderRight:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'9px 8px', verticalAlign:'middle' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Buyer Summary</div>
          <div className="page-subtitle">
            {filterDate
              ? `Buyer overview for ${new Date(filterDate+'T00:00:00').toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`
              : 'All-time buyer overview'}
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
          {buyerRows.length > 0 && (
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
          <div>Loading buyer summary...</div>
        </div>
      ) : (
        <>
          {/* Summary stat cards */}
          <div style={{ marginBottom:10, fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:8 }}>
            <ShoppingCart size={12}/> Buyer Summary
          </div>
          <div className="stats-grid" style={{ marginBottom:24 }}>
            {[
              { label:'Total Buyers',  value: buyerRows.length,                 color:'amber',  icon:<Users size={20}/> },
              { label:'Total Bags',    value: fmtNum(grandBags, 0),             color:'green',  icon:<Package size={20}/> },
              { label:'Total Weight',  value: fmtNum(grandWeight)+' kg',        color:'blue',   icon:<TrendingUp size={20}/> },
              { label:'Gross Amount',  value: '₹ '+fmtINR(grandGross),          color:'purple', icon:<span style={{fontWeight:800,fontSize:18}}>₹</span> },
              { label:'Total Amount',  value: '₹ '+fmtINR(grandTotal),          color:'blue',   icon:<span style={{fontWeight:800,fontSize:18}}>₹</span> },
              { label:'Balance Due',   value: '₹ '+fmtINR(grandBalance),        color:'green',  icon:<TrendingUp size={20}/> },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className={`stat-icon ${s.color}`} style={['purple','blue'].includes(s.color)?{background:'rgba(139,92,246,0.15)',color:'var(--purple)',fontWeight:800,fontSize:18}:{}}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Detail table */}
          <div className="card" style={{ marginBottom:24, width:'100%' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div className="card-title" style={{ margin:0 }}>
                🛒 Buyer-wise Detail &nbsp;
                <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:400 }}>
                  ({buyerRows.length} buyers with purchases · sorted by name)
                </span>
              </div>
              <button onClick={() => setShowTable(t => !t)} className="btn btn-secondary btn-sm">
                {showTable ? 'Hide' : 'Show'} Table
              </button>
            </div>

            {showTable && (
              <div style={{ width:'100%', border:'1px solid var(--border)', borderRadius:10, overflow:'auto' }}>
                {buyerRows.length === 0 ? (
                  <div className="empty-state" style={{ padding:40 }}>
                    <div className="empty-state-icon">🛒</div>
                    <h3>No buyer data for this period</h3>
                  </div>
                ) : (
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13, tableLayout:'fixed' }}>
                    <colgroup>
                      <col style={{ width:'44px' }}/>
                      <col style={{ width:'68px' }}/>
                      <col style={{ width:'120px' }}/>
                      <col style={{ width:'90px' }}/>
                      <col style={{ width:'70px' }}/>
                      <col style={{ width:'48px' }}/>
                      <col style={{ width:'88px' }}/>
                      <col style={{ width:'98px' }}/>
                      <col style={{ width:'102px' }}/>
                      <col style={{ width:'108px' }}/>
                      <col style={{ width:'88px' }}/>
                      <col style={{ width:'92px' }}/>
                      <col style={{ width:'88px' }}/>
                      <col style={{ width:'108px' }}/>
                      <col style={{ width:'92px' }}/>
                      <col style={{ width:'108px' }}/>
                    </colgroup>
                    <thead>
                      <tr style={{ background:'var(--bg-panel)' }}>
                        {[
                          { label:'Sr',            align:'center' },
                          { label:'Short Name',    align:'center' },
                          { label:'Name',          align:'left'   },
                          { label:'Material',      align:'center' },
                          { label:'Lot No',        align:'center' },
                          { label:'Bags',          align:'center' },
                          { label:'Weight (kg)',   align:'right'  },
                          { label:'Rate (/100kg)', align:'right'  },
                          { label:'Amount (₹)',    align:'right'  },
                          { label:'Gross Amt (₹)', align:'right'  },
                          { label:'Labour (₹)',    align:'right'  },
                          { label:'Extra Bag (₹)', align:'right'  },
                          { label:'Mkt Fee (₹)',   align:'right'  },
                          { label:'Total Amt (₹)', align:'right'  },
                          { label:'Advance (₹)',   align:'right'  },
                          { label:'Balance (₹)',   align:'right'  },
                        ].map(h => (
                          <th key={h.label} style={{
                            padding:'10px 8px', textAlign:h.align,
                            fontSize:10, fontWeight:700, letterSpacing:0.8, textTransform:'uppercase',
                            color:'var(--text-muted)',
                            borderBottom:'2px solid var(--blue)',
                            borderRight:'1px solid var(--border)',
                          }}>{h.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {buyerRows.map((r, ri) => {
                        const rowBg = ri % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-panel)';
                        const sn    = r.buyer.serial_number || '—';
                        // One sub-row per material — each gets its own Gross/Labour/Market
                        // Fee/Total/Balance rowSpan, never merged with another material.
                        return r.subRows.flatMap((sub, si) => {
                          const subRc     = sub.bags.length;
                          const subMerged = { ...cell, background:rowBg, borderBottom: si === r.subRows.length - 1 ? '2px solid var(--blue)' : '2px solid var(--accent)' };
                          return sub.bags.map((bag, bi) => {
                            const isSubLast   = bi === subRc - 1;
                            const isBuyerLast = si === r.subRows.length - 1 && isSubLast;
                            const bdr    = isBuyerLast ? '2px solid var(--blue)' : isSubLast ? '2px solid var(--accent)' : '1px solid var(--border)';
                            const td     = { ...cell, borderBottom: bdr };
                            const badge  = bag.material==='TAMARIND'?'badge-amber':bag.material==='GINGER'?'badge-green':bag.material==='ONION'?'badge-blue':'badge-amber';
                            const isBuyerFirst = si === 0 && bi === 0;
                            const buyerMerged  = { ...cell, background:rowBg, borderBottom:'2px solid var(--blue)' };
                            return (
                              <tr key={r.buyer.id+'-'+si+'-'+bi} style={{ background:rowBg }}>
                                {isBuyerFirst && <td rowSpan={r.numBags} style={{ ...buyerMerged, fontWeight:800, color:'var(--accent)', textAlign:'center', verticalAlign:'middle', fontSize:14 }}>{ri+1}</td>}
                                {isBuyerFirst && <td rowSpan={r.numBags} style={{ ...buyerMerged, fontWeight:800, color:'#4fa3ff', fontFamily:'monospace', textAlign:'center' }}>{sn}</td>}
                                {isBuyerFirst && <td rowSpan={r.numBags} style={{ ...buyerMerged, fontWeight:700, color:'var(--text-primary)', borderRight:'1px solid var(--border-light)' }}>{r.buyer.name}</td>}
                                <td style={{ ...td, textAlign:'center' }}>
                                  {bag.material && bag.material !== '—'
                                    ? <span className={`badge ${badge}`}>{bag.material}</span>
                                    : <span style={{ color:'var(--text-muted)' }}>—</span>}
                                </td>
                                <td style={{ ...td, fontFamily:'monospace', fontWeight:700, textAlign:'center', color:'var(--blue)', fontSize:12 }}>{bag.lot}</td>
                                <td style={{ ...td, textAlign:'center', fontWeight:800, color:'var(--text-primary)' }}>{bagCount(bag)}</td>
                                <td style={{ ...td, textAlign:'right', fontWeight:700, color:bag.weight>0?'var(--blue)':'var(--text-muted)' }}>{bag.weight>0?fmtNum(bag.weight):'—'}</td>
                                <td style={{ ...td, textAlign:'right', fontWeight:700, color:bag.rate>0?'var(--green)':'var(--text-muted)' }}>{bag.rate>0?fmtNum(bag.rate):'—'}</td>
                                <td style={{ ...td, textAlign:'right', fontWeight:800, color:bag.amount>0?'var(--accent)':'var(--text-muted)' }}>{bag.amount>0?'₹ '+fmtINR(bag.amount):'—'}</td>
                                {bi===0 && <td rowSpan={subRc} style={{ ...subMerged, textAlign:'right', fontWeight:800, color:'var(--accent)', background:'rgba(245,158,11,0.06)' }}>{sub.grossAmt>0?'₹ '+fmtINR(sub.grossAmt):'—'}</td>}
                                {bi===0 && <td rowSpan={subRc} style={{ ...subMerged, textAlign:'right', fontWeight:700, color:'#dc2626', background:'rgba(220,38,38,0.04)' }}>+ ₹ {fmtINR(sub.labourAmt)}</td>}
                                {bi===0 && <td rowSpan={subRc} style={{ ...subMerged, textAlign:'right', fontWeight:700, color:'#a21caf', background:'rgba(162,28,175,0.06)' }}>{sub.extraBagAmt>0?'+ ₹ '+fmtINR(sub.extraBagAmt):'—'}</td>}
                                {bi===0 && <td rowSpan={subRc} style={{ ...subMerged, textAlign:'right', fontWeight:700, color:'#b45309', background:'rgba(180,83,9,0.04)' }}>+ ₹ {fmtINR(sub.marketFee)}</td>}
                                {bi===0 && <td rowSpan={subRc} style={{ ...subMerged, textAlign:'right', fontWeight:900, color:'var(--blue)', background:'rgba(59,130,246,0.06)', fontSize:14 }}>{sub.totalAmt>0?'₹ '+fmtINR(sub.totalAmt):'—'}</td>}
                                {bi===0 && <td rowSpan={subRc} style={{ ...subMerged, textAlign:'right', fontWeight:700, color:'var(--text-secondary)' }}>{sub.advance>0?'₹ '+fmtINR(sub.advance):'—'}</td>}
                                {bi===0 && <td rowSpan={subRc} style={{ ...subMerged, textAlign:'right', fontWeight:800, color:'var(--green)', background:'rgba(16,185,129,0.06)', fontSize:14 }}>{sub.totalAmt>0?'₹ '+fmtINR(sub.balance):'—'}</td>}
                              </tr>
                            );
                          });
                        });
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background:'var(--bg-panel)', borderTop:'2px solid var(--blue)' }}>
                        <td colSpan={5} style={{ padding:'11px 8px', fontWeight:700, color:'var(--text-secondary)', fontSize:12, borderRight:'1px solid var(--border)' }}>
                          TOTALS — {buyerRows.length} buyers
                        </td>
                        <td style={{ padding:'11px 8px', textAlign:'center', fontWeight:800, color:'var(--blue)', fontSize:13, borderRight:'1px solid var(--border)' }}>
                          {grandBags}
                        </td>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'var(--blue)', fontSize:13, borderRight:'1px solid var(--border)' }}>
                          {fmtNum(grandWeight)} kg
                        </td>
                        <td style={{ borderRight:'1px solid var(--border)' }}/>
                        <td style={{ borderRight:'1px solid var(--border)' }}/>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'var(--accent)', fontSize:13, borderRight:'1px solid var(--border)', background:'rgba(245,158,11,0.06)' }}>
                          ₹ {fmtINR(grandGross)}
                        </td>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'#dc2626', fontSize:13, borderRight:'1px solid var(--border)', background:'rgba(220,38,38,0.04)' }}>
                          ₹ {fmtINR(grandLabour)}
                        </td>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'#a21caf', fontSize:13, borderRight:'1px solid var(--border)', background:'rgba(162,28,175,0.06)' }}>
                          ₹ {fmtINR(grandExtra)}
                        </td>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'#b45309', fontSize:13, borderRight:'1px solid var(--border)', background:'rgba(180,83,9,0.04)' }}>
                          ₹ {fmtINR(grandMarket)}
                        </td>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:900, color:'var(--blue)', fontSize:14, borderRight:'1px solid var(--border)', background:'rgba(59,130,246,0.06)' }}>
                          ₹ {fmtINR(grandTotal)}
                        </td>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'var(--text-secondary)', fontSize:13, borderRight:'1px solid var(--border)' }}>
                          ₹ {fmtINR(grandAdvance)}
                        </td>
                        <td style={{ padding:'11px 8px', textAlign:'right', fontWeight:800, color:'var(--green)', fontSize:14, borderRight:'1px solid var(--border)', background:'rgba(16,185,129,0.06)' }}>
                          ₹ {fmtINR(grandBalance)}
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
