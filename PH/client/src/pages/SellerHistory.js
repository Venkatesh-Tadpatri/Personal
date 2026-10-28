import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, Eye, X, RefreshCw, History } from 'lucide-react';
import { getSellers } from '../api';
import { fmtINR, fmtNum, fmtDate, MATERIAL_BADGE } from '../utils';
import { useMaterials } from '../materials';
import { BillModal } from './SellerList';
import { useSort, SortTh } from '../sorting';

const MONTHS = [
  ['01', 'January'], ['02', 'February'], ['03', 'March'], ['04', 'April'],
  ['05', 'May'], ['06', 'June'], ['07', 'July'], ['08', 'August'],
  ['09', 'September'], ['10', 'October'], ['11', 'November'], ['12', 'December'],
];

function SellerHistoryModal({ group, onClose, onViewBill }) {
  const { sort, toggleSort, sortRows } = useSort('date', 'desc');
  const entries = sortRows(group.entries, {
    date:     e => e.entry_date,
    serial:   e => e.serial_number,
    material: e => (e.material && e.material !== 'GENERAL' ? e.material : ''),
    bags:     e => Number(e.num_bags) || 0,
    weight:   e => Number(e.weight) || 0,
    amount:   e => Number(e.amount) || 0,
  });
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 1040, width: '95%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">{group.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {group.mobile ? `📞 ${group.mobile} · ` : ''}{group.count} visit{group.count !== 1 ? 's' : ''}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="table-wrapper" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <SortTh col="date" label="Date" sort={sort} onSort={toggleSort} />
                <SortTh col="serial" label="Serial No" sort={sort} onSort={toggleSort} />
                <SortTh col="material" label="Material" sort={sort} onSort={toggleSort} />
                <SortTh col="bags" label="Bags" sort={sort} onSort={toggleSort} />
                <SortTh col="weight" label="Weight(KG)" sort={sort} onSort={toggleSort} />
                <SortTh col="amount" label="Amount(₹)" sort={sort} onSort={toggleSort} />
                <th style={{ textAlign: 'center' }}>Bill</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td className="td-muted" style={{ fontSize: 12 }}>{fmtDate(e.entry_date)}</td>
                  <td className="td-muted" style={{ fontSize: 11, fontFamily:'var(--font-body)' }}>{e.serial_number}</td>
                  <td>
                    {e.material && e.material !== 'GENERAL'
                      ? <span className={`badge ${MATERIAL_BADGE[e.material] || 'badge-amber'}`}>{e.material}</span>
                      : <span className="td-muted">—</span>}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600 }}>{e.num_bags}</td>
                  <td style={{ fontWeight: 600 }}>{fmtNum(e.weight)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--blue)' }}>
                    {e.amount ? `₹${fmtINR(e.amount)}` : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button className="btn btn-green btn-sm" onClick={() => onViewBill(e)} title="View / Print Bill">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SellerHistory() {
  const { materials: MATERIALS } = useMaterials();
  const { sort, toggleSort, sortRows } = useSort('name');
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [historyFor, setHistoryFor] = useState(null);
  const [bill, setBill] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSellers();
      setSellers(res.data?.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load sellers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const years = Array.from(new Set(
    sellers.map(s => (s.entry_date || '').split('-')[0]).filter(Boolean)
  )).sort((a, b) => b.localeCompare(a));

  const dateFiltered = sellers.filter(s => {
    const [y, m] = (s.entry_date || '').split('-');
    if (filterYear && y !== filterYear) return false;
    if (filterMonth && m !== filterMonth) return false;
    if (filterMaterial && s.material !== filterMaterial) return false;
    return true;
  });

  const groupsMap = new Map();
  dateFiltered.forEach(s => {
    if (!groupsMap.has(s.name)) groupsMap.set(s.name, []);
    groupsMap.get(s.name).push(s);
  });

  let groups = Array.from(groupsMap, ([name, entries]) => {
    const sortedEntries = [...entries].sort((a, b) =>
      (b.entry_date || '').localeCompare(a.entry_date || '') || b.id - a.id
    );
    const mobile = sortedEntries.map(e => e.mobile).find(m => m && m !== '0000000000') || '';
    return {
      name,
      mobile,
      count: entries.length,
      totalBags: entries.reduce((s, e) => s + Number(e.num_bags || 0), 0),
      totalWeight: entries.reduce((s, e) => s + Number(e.weight || 0), 0),
      totalAmount: entries.reduce((s, e) => s + Number(e.amount || 0), 0),
      lastVisit: sortedEntries[0]?.entry_date,
      entries: sortedEntries,
    };
  });

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    groups = groups.filter(g => g.name.toLowerCase().includes(q));
  }

  groups.sort((a, b) => a.name.localeCompare(b.name));
  const sortedGroups = sortRows(groups, {
    name:      g => g.name,
    mobile:    g => g.mobile,
    visits:    g => g.count,
    bags:      g => g.totalBags,
    weight:    g => g.totalWeight,
    amount:    g => g.totalAmount,
    lastVisit: g => g.lastVisit,
  });

  const clear = () => { setSearch(''); setFilterYear(''); setFilterMonth(''); setFilterMaterial(''); };

  const grand = groups.reduce((a, g) => ({
    visits: a.visits + g.count, bags: a.bags + g.totalBags,
    wt: a.wt + g.totalWeight, amt: a.amt + g.totalAmount,
  }), { visits: 0, bags: 0, wt: 0, amt: 0 });

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Seller History</div>
          <div className="page-subtitle">
            {loading ? 'Loading...' : `${groups.length} unique seller${groups.length !== 1 ? 's' : ''}`}
          </div>
        </div>
        <button className="btn btn-secondary" onClick={load} disabled={loading}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box" style={{ flex: 2 }}>
          <Search className="search-icon" size={16} />
          <input className="form-input" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search seller name..." style={{ textTransform: 'none' }} />
        </div>
        <select className="form-select" value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ flex: 1 }}>
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="form-select" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ flex: 1 }}>
          <option value="">All Months</option>
          {MONTHS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
        </select>
        <select className="form-select" value={filterMaterial} onChange={e => setFilterMaterial(e.target.value)} style={{ flex: 1 }}>
          <option value="">All Materials</option>
          {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        {(search || filterYear || filterMonth || filterMaterial) && (
          <button className="btn btn-secondary" onClick={clear}><X size={14} /> Clear</button>
        )}
      </div>

      {groups.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {[
            ['Unique Sellers', groups.length, 'var(--accent)'],
            ['Total Visits', grand.visits, 'var(--green)'],
            ['Weight', fmtNum(grand.wt) + ' kg', 'var(--blue)'],
            ['Amount', '₹ ' + fmtINR(grand.amt), 'var(--purple)'],
          ].map(([l, v, c]) => (
            <div key={l} style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 13px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{l}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: c, fontFamily: 'var(--font-display)' }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      <div className="table-wrapper">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading...</div>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📜</div>
            <h3>No seller history found</h3>
            <p style={{ fontSize: 12, marginTop: 6, color: 'var(--text-muted)' }}>
              Try a different search term or clear the filters
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <SortTh col="name" label="Seller Name" sort={sort} onSort={toggleSort} />
                <SortTh col="mobile" label="Mobile" sort={sort} onSort={toggleSort} />
                <SortTh col="visits" label="Visits" align="center" sort={sort} onSort={toggleSort} />
                <SortTh col="bags" label="Total Bags" sort={sort} onSort={toggleSort} />
                <SortTh col="weight" label="Total Weight(KG)" sort={sort} onSort={toggleSort} />
                <SortTh col="amount" label="Total Amount(₹)" sort={sort} onSort={toggleSort} />
                <SortTh col="lastVisit" label="Last Visit" sort={sort} onSort={toggleSort} />
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedGroups.map((g, i) => (
                <tr key={g.name} style={{ cursor: 'pointer' }} onClick={() => setHistoryFor(g)}>
                  <td className="td-muted" style={{ fontSize: 12 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td className="td-muted" style={{ fontSize: 12 }}>{g.mobile || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', background: 'var(--accent-dim)', color: 'var(--accent)',
                      border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '2px 12px',
                      fontWeight: 700, fontSize: 12,
                    }}>{g.count}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{g.totalBags}</td>
                  <td style={{ fontWeight: 600 }}>{fmtNum(g.totalWeight)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--blue)' }}>₹{fmtINR(g.totalAmount)}</td>
                  <td className="td-muted" style={{ fontSize: 12 }}>{fmtDate(g.lastVisit)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-green btn-sm" onClick={() => setHistoryFor(g)} title="View History" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <History size={13} /> <span className="btn-text">View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {historyFor && (
        <SellerHistoryModal
          group={historyFor}
          onClose={() => setHistoryFor(null)}
          onViewBill={(entry) => setBill(entry)}
        />
      )}

      {bill && <BillModal seller={bill} onClose={() => setBill(null)} />}
    </div>
  );
}
