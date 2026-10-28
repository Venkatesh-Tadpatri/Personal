// Format numbers as Indian locale currency
// export const fmtINR = (n, decimals = 2) =>
export const fmtINR = (n) => Math.round(Number(n || 0)).toLocaleString('en-IN');  
  // n != null && n !== ''
  //   ? Number(n).toLocaleString('en-IN', {
  //       minimumFractionDigits: decimals,
  //       maximumFractionDigits: decimals,
  //     })
  //   : '—';

// Format number without currency symbol
export const fmtNum = (n, decimals = 2) =>
  n != null && n !== ''
    ? Number(n).toLocaleString('en-IN', { maximumFractionDigits: decimals })
    : '—';

// Today's date as YYYY-MM-DD
export const todayISO = () => new Date().toISOString().split('T')[0];

// Format date for display
export const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Uppercase all name/text fields
export const toUpper = (val) => (typeof val === 'string' ? val.toUpperCase() : val);

// Validate 10-digit Indian mobile
export const isValidMobile = (mobile) => /^\d{10}$/.test(mobile);

// Material badge class map
export const MATERIAL_BADGE = {
  TAMARIND: 'badge-amber',
  GINGER:    'badge-green',
  ONION:    'badge-blue',
  LEMONS:   'badge-purple',
  OTHERS:   'badge-blue',
};

// All materials
export const MATERIALS = ['TAMARIND', 'GINGER', 'ONION', 'LEMONS', 'OTHERS'];

// Seller charges — defaults match the rates used before they became configurable per material
export const DEFAULT_COMMISSION = 8;   // % of gross amount
export const DEFAULT_LABOUR     = 20;  // ₹ per bag

// Rates saved on a seller record (null/undefined → default; 0 is a valid rate)
export const sellerCommissionPct = (seller) => Number(seller?.commission_rate ?? DEFAULT_COMMISSION);
export const sellerLabourRate    = (seller) => Number(seller?.labour_rate ?? DEFAULT_LABOUR);
export const sellerCommission    = (seller, gross) => Math.round(gross * sellerCommissionPct(seller) / 100);

// Generate next serial number suggestion
export const nextSerial = (prefix, existing) => {
  const nums = existing
    .map(e => e.serial_number)
    .filter(s => s.startsWith(prefix))
    .map(s => parseInt(s.replace(prefix, ''), 10))
    .filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
};
