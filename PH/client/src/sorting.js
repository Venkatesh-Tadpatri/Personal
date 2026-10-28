import React, { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

// Shared column sorting for every list table.
//   const { sort, toggleSort, sortRows } = useSort('name');
//   <SortTh col="name" label="Name" sort={sort} onSort={toggleSort} />
//   sortRows(rows, { name: r => r.name, amount: r => r.amount })
// First click on a column sorts ascending (A→Z, low→high, oldest→newest), next click descending.

const isBlank = (v) => v === null || v === undefined || v === '' || (typeof v === 'number' && isNaN(v));

export function compareValues(a, b) {
  // Blanks always sort last, whichever direction
  if (isBlank(a) && isBlank(b)) return 0;
  if (isBlank(a)) return 1;
  if (isBlank(b)) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  // Numeric strings (e.g. serial "10" vs "9") compare as numbers
  const na = Number(a), nb = Number(b);
  if (String(a).trim() !== '' && String(b).trim() !== '' && !isNaN(na) && !isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function sortRows(rows, sort, accessors) {
  const get = accessors[sort.key];
  if (!get) return rows;
  const dir = sort.dir === 'desc' ? -1 : 1;
  return rows
    .map((row, i) => ({ row, i }))
    .sort((x, y) => {
      const va = get(x.row), vb = get(y.row);
      const c = compareValues(va, vb);
      // Keep blanks last in both directions; ties keep their original order
      if (c !== 0 && (isBlank(va) || isBlank(vb))) return c;
      return c * dir || x.i - y.i;
    })
    .map(x => x.row);
}

export function useSort(defaultKey, defaultDir = 'asc') {
  const [sort, setSort] = useState({ key: defaultKey, dir: defaultDir });
  const toggleSort = (key) => setSort(s => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  return { sort, toggleSort, sortRows: (rows, accessors) => sortRows(rows, sort, accessors) };
}

// Sortable header cell. Pass style/className to match the table it sits in.
export function SortTh({ col, label, sort, onSort, align = 'left', style, className, children }) {
  const active = sort.key === col;
  const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;
  const justify = align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';
  return (
    <th className={className}
      style={{ ...style, textAlign: align, cursor: 'pointer', userSelect: 'none', ...(active ? { color: 'var(--accent)' } : {}) }}
      onClick={() => onSort(col)} title={`Sort by ${label}`}
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, justifyContent: justify, width: '100%' }}>
        {children || label}<Icon size={12} style={{ opacity: active ? 1 : 0.4, flexShrink: 0 }} />
      </span>
    </th>
  );
}
