// UI preferences remembered on this computer (theme, sidebar state).
// Storage can be unavailable or cleared, so every access falls back to the default.

const THEME_KEY   = 'ph_theme';
const SIDEBAR_KEY = 'ph_sidebar_collapsed';

const read = (key) => {
  try { return localStorage.getItem(key); } catch { return null; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, value); } catch { /* not persisted — still applied for this session */ }
};

export const getStoredTheme = () => (read(THEME_KEY) === 'light' ? 'light' : 'dark');

export const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  write(THEME_KEY, theme);
};

// No saved choice yet → start collapsed on smaller screens so pages get the full width
export const getStoredSidebarCollapsed = () => {
  const saved = read(SIDEBAR_KEY);
  if (saved === null) return window.innerWidth < 1280;
  return saved === '1';
};

export const storeSidebarCollapsed = (collapsed) => write(SIDEBAR_KEY, collapsed ? '1' : '0');
