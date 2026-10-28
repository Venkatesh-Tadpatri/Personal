import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, X } from 'lucide-react';
import { fmtDate } from './utils';

// Header search: finds sellers and buyers by name and opens the one picked —
// a seller opens in Seller List (that date, row expanded), a buyer opens their Buyer Ledger view.
const API = axios.create({ baseURL: 'http://127.0.0.1:5000' });
const MAX_PER_TYPE = 8;
const CACHE_MS = 30000;

// Same key the Buyer Ledger uses to identify a buyer (short name, else full name)
export const buyerKeyOf = (b) => ((b.lot_number && b.lot_number !== '—') ? b.lot_number : (b.name || '')).toUpperCase();

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [data, setData] = useState({ sellers: [], buyers: [], loadedAt: 0, loading: false });
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Load on first focus, refresh if older than CACHE_MS
  const ensureData = async () => {
    if (data.loading || Date.now() - data.loadedAt < CACHE_MS) return;
    setData(d => ({ ...d, loading: true }));
    try {
      const [s, b] = await Promise.all([API.get('/api/sellers'), API.get('/api/buyers')]);
      setData({ sellers: s.data.data || [], buyers: b.data.data || [], loadedAt: Date.now(), loading: false });
    } catch {
      setData(d => ({ ...d, loading: false }));
    }
  };

  // Ctrl+K focuses the search from anywhere
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inputRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const q = query.trim().toUpperCase();
  let results = [];
  if (q) {
    // Sellers: one result per registration (name + date + material), newest first
    const sellers = data.sellers
      .filter(s => (s.name || '').toUpperCase().includes(q))
      .sort((a, b) => (b.entry_date || '').localeCompare(a.entry_date || ''))
      .slice(0, MAX_PER_TYPE)
      .map(s => ({
        type: 'seller', id: `s${s.id}`, title: s.name,
        sub: [fmtDate(s.entry_date), s.material && s.material !== 'GENERAL' ? s.material : null, s.lot_number ? `Lot ${s.lot_number}` : null].filter(Boolean).join(' · '),
        target: { id: s.id, date: s.entry_date },
      }));
    // Buyers: one result per buyer (deduplicated the way the ledger is)
    const seen = new Set();
    const buyers = [];
    data.buyers.forEach(b => {
      const key = buyerKeyOf(b);
      const short = (b.lot_number && b.lot_number !== '—') ? b.lot_number.toUpperCase() : '';
      if (seen.has(key) || !((b.name || '').toUpperCase().includes(q) || short.includes(q))) return;
      seen.add(key);
      buyers.push({ type: 'buyer', id: `b${key}`, title: b.name, sub: short ? `Short name ${short}` : 'Buyer', target: { key } });
    });
    results = [...sellers, ...buyers.slice(0, MAX_PER_TYPE)];
  }

  const choose = (r) => {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    if (r.type === 'seller') navigate('/seller-list', { state: { focusSeller: r.target } });
    else navigate('/buyer-ledger', { state: { focusBuyer: r.target.key } });
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); choose(results[active]); }
    else if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  const tag = (type) => (
    <span className={`badge ${type === 'seller' ? 'badge-amber' : 'badge-blue'}`} style={{ fontSize: 10, padding: '2px 8px', minWidth: 52, justifyContent: 'center' }}>
      {type === 'seller' ? 'Seller' : 'Buyer'}
    </span>
  );

  return (
    <div className="global-search" ref={wrapRef}>
      <Search size={15} className="global-search-icon" />
      <input
        ref={inputRef}
        value={query}
        placeholder="Search seller or buyer…  (Ctrl+K)"
        onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true); }}
        onFocus={() => { ensureData(); setOpen(true); }}
        onKeyDown={onKeyDown}
      />
      {query && (
        <button className="global-search-clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }} title="Clear"><X size={14} /></button>
      )}
      {open && q && (
        <div className="menu-panel global-search-panel">
          {data.loading && results.length === 0 && <div className="global-search-empty">Searching…</div>}
          {!data.loading && results.length === 0 && <div className="global-search-empty">No seller or buyer named "{query.trim()}"</div>}
          {results.map((r, i) => (
            <button key={r.id} className={`menu-item ${i === active ? 'active' : ''}`}
              onMouseEnter={() => setActive(i)} onClick={() => choose(r)}>
              {tag(r.type)}
              <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.sub}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
