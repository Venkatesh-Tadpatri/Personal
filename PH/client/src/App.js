// import React, { useState } from 'react';
// import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import {
//   LayoutDashboard, UserPlus, Users, ShoppingCart, List, BarChart3,
//   Wheat, ChevronRight, LogOut
// } from 'lucide-react';
// import Dashboard from './pages/Dashboard';
// import SellerRegistration from './pages/SellerRegistration';
// import SellerList from './pages/SellerList';
// import BuyerRegistration from './pages/BuyerRegistration';
// import BuyerList from './pages/BuyerList';
// import Summary from './pages/Summary';
// import Login from './pages/Login';
// import './App.css';

// const NAV_ITEMS = [
//   { label: 'Dashboard',          icon: LayoutDashboard, path: '/',                    section: 'OVERVIEW' },
//   { label: 'Seller Registration', icon: UserPlus,        path: '/seller-registration', section: 'SELLERS'  },
//   { label: 'Seller List',         icon: Users,           path: '/seller-list',         section: 'SELLERS'  },
//   { label: 'Buyer Registration',  icon: ShoppingCart,    path: '/buyer-registration',  section: 'BUYERS'   },
//   { label: 'Buyer List',          icon: List,            path: '/buyer-list',          section: 'BUYERS'   },
//   { label: 'Summary',             icon: BarChart3,       path: '/summary',             section: 'REPORTS'  },
// ];

// function Sidebar({ user, onLogout }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const today    = new Date();
//   const dateStr  = today.toLocaleDateString('en-IN', {
//     weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
//   });

//   const sections = [...new Set(NAV_ITEMS.map(n => n.section))];

//   const [showProfile, setShowProfile] = React.useState(false);
//   const initials = user ? user.substring(0, 2).toUpperCase() : 'PH';

//   return (
//     <div className="sidebar">
//       {/* Logo */}
//       <div className="sidebar-logo">
//         <div className="logo-icon">🌾</div>
//         <div className="logo-title">md</div>
//         <div className="logo-sub">Market Management</div>
//       </div>

//       {/* Profile bar — replaces old user block in footer */}
//       <div style={{ padding: '0 12px 10px', position: 'relative' }}>
//         <button
//           onClick={() => setShowProfile(p => !p)}
//           style={{
//             width: '100%', display: 'flex', alignItems: 'center', gap: 10,
//             background: showProfile ? 'var(--bg-hover)' : 'var(--bg-panel)',
//             border: '1px solid var(--border)', borderRadius: 10,
//             padding: '9px 12px', cursor: 'pointer', transition: 'all 0.15s',
//           }}
//           onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
//           onMouseLeave={e => e.currentTarget.style.borderColor = showProfile ? 'var(--accent)' : 'var(--border)'}
//         >
//           {/* Avatar circle */}
//           <div style={{
//             width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
//             background: 'linear-gradient(135deg, #1a56db, #f59e0b)',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             fontSize: 12, fontWeight: 900, color: '#fff',
//           }}>{initials}</div>
//           <div style={{ flex: 1, textAlign: 'left' }}>
//             <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{user}</div>
//             <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>APMC Agent</div>
//           </div>
//           <div style={{ fontSize: 10, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'none' }}>▲</div>
//         </button>

//         {/* Dropdown panel */}
//         {showProfile && (
//           <div style={{
//             position: 'absolute', top: '100%', left: 12, right: 12, zIndex: 100,
//             background: 'var(--bg-card)', border: '1px solid var(--border)',
//             borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
//             overflow: 'hidden',
//           }}>
//             {/* Profile info */}
//             <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
//               <div style={{
//                 width: 48, height: 48, borderRadius: '50%', margin: '0 auto 8px',
//                 background: 'linear-gradient(135deg, #1a56db, #f59e0b)',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 fontSize: 18, fontWeight: 900, color: '#fff',
//               }}>{initials}</div>
//               <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{user}</div>
//               <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>APMC Market Agent</div>
//               <div style={{
//                 display: 'inline-block', marginTop: 6,
//                 background: 'var(--green-dim)', color: 'var(--green)',
//                 border: '1px solid rgba(16,185,129,0.3)',
//                 borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700,
//               }}>● Active</div>
//             </div>
//             {/* Logout */}
//             <button
//               onClick={() => { setShowProfile(false); onLogout(); }}
//               style={{
//                 width: '100%', padding: '12px 16px',
//                 background: 'transparent', border: 'none', cursor: 'pointer',
//                 display: 'flex', alignItems: 'center', gap: 10,
//                 color: 'var(--red)', fontSize: 13, fontWeight: 700,
//                 transition: 'background 0.15s',
//               }}
//               onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dim)'}
//               onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//             >
//               <LogOut size={15} />
//               Sign Out
//             </button>
//           </div>
//         )}
//       </div>

//       <nav className="sidebar-nav">
//         {sections.map(section => (
//           <div key={section}>
//             <div className="nav-section-label">{section}</div>
//             {NAV_ITEMS.filter(n => n.section === section).map(item => {
//               const Icon   = item.icon;
//               const active = location.pathname === item.path;
//               return (
//                 <button
//                   key={item.path}
//                   className={`nav-item ${active ? 'active' : ''}`}
//                   onClick={() => { navigate(item.path); setShowProfile(false); }}
//                 >
//                   <Icon className="nav-icon" size={18} />
//                   <span style={{ flex: 1 }}>{item.label}</span>
//                   {active && <ChevronRight size={14} />}
//                 </button>
//               );
//             })}
//           </div>
//         ))}
//       </nav>

//       <div className="sidebar-footer" style={{ padding: 0, border: 'none' }} />
//     </div>
//   );
// }

// const PAGE_TITLES = {
//   '/':                    'Dashboard',
//   '/seller-registration': 'Seller Registration',
//   '/seller-list':         'Seller List',
//   '/buyer-registration':  'Buyer Registration',
//   '/buyer-list':          'Buyer List',
//   '/summary':             'Summary Report',
// };

// function AppLayout({ user, onLogout }) {
//   const location = useLocation();
//   const title    = PAGE_TITLES[location.pathname] || 'ph';

//   return (
//     <div className="app-layout">
//       <Sidebar user={user} onLogout={onLogout} />
//       <div className="main-content">
//         <div className="topbar">
//           <div className="topbar-title">{title}</div>
//           <div className="topbar-right">
//             {/* Date pill */}
//             <div style={{
//               background: 'var(--bg-panel)', border: '1px solid var(--border)',
//               borderRadius: 8, padding: '6px 13px', fontSize: 12,
//               color: 'var(--accent)', fontWeight: 700,
//               display: 'flex', alignItems: 'center', gap: 6,
//             }}>
//               📅 {new Date().toLocaleDateString('en-IN', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
//             </div>
//             <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
//               <Wheat size={14} style={{ color: 'var(--accent)' }} />
//               <span>ph v1.0</span>
//             </div>
//             <div style={{
//               background: 'var(--bg-panel)', border: '1px solid var(--border)',
//               borderRadius: 8, padding: '6px 14px', fontSize: 12,
//               color: 'var(--text-secondary)', fontWeight: 500,
//             }}>
//               🟢 Server Online
//             </div>
//           </div>
//         </div>
//         <div className="page-content">
//           <Routes>
//             <Route path="/"                    element={<Dashboard />} />
//             <Route path="/seller-registration" element={<SellerRegistration />} />
//             <Route path="/seller-list"         element={<SellerList />} />
//             <Route path="/buyer-registration"  element={<BuyerRegistration />} />
//             <Route path="/buyer-list"          element={<BuyerList />} />
//             <Route path="/summary"             element={<Summary />} />
//           </Routes>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function App() {
//   // Persist login across page refresh using sessionStorage
//   const [user, setUser] = useState(() => sessionStorage.getItem('ph_user') || null);

//   const handleLogin  = (username) => setUser(username);

//   const handleLogout = () => {
//     sessionStorage.removeItem('ph_user');
//     setUser(null);
//   };

//   return (
//     <BrowserRouter>
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           style: {
//             background: '#0d1b2e',
//             color: '#f0f6ff',
//             border: '1px solid #1a3352',
//             fontFamily: "'DM Sans', sans-serif",
//             fontSize: 13,
//           },
//           success: { iconTheme: { primary: '#10b981', secondary: '#000' } },
//           error:   { iconTheme: { primary: '#ef4444', secondary: '#000' } },
//         }}
//       />
//       {/* Show Login page if not logged in, otherwise show the app */}
//       {user
//         ? <AppLayout user={user} onLogout={handleLogout} />
//         : <Login onLogin={handleLogin} />
//       }
//     </BrowserRouter>
//   );
// }




import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, UserPlus, Users, ShoppingCart, List, BarChart3,
  Wheat, ChevronRight, ChevronDown, LogOut, TrendingUp, BookOpen, History, Wallet, Home as HomeIcon, ClipboardList,
  Settings, Sun, Moon, PanelLeftClose, PanelLeftOpen, Package, Hash, ShieldCheck, KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';
import SalesReport from './pages/SalesReport';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import SellerRegistration from './pages/SellerRegistration';
import SellerList from './pages/SellerList';
import SellerHistory from './pages/SellerHistory';
import SellerAdvance from './pages/SellerAdvance';
import BuyerRegistration from './pages/BuyerRegistration';
import BuyerList from './pages/BuyerList';
import Summary from './pages/Summary';
import BuyerSummary from './pages/BuyerSummary';
import BuyerLedger from './pages/BuyerLedger';
import PurchaseList from './pages/PurchaseList';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AccountSettings from './AccountSettings';
import { getSession, saveSession, clearSession, fetchMe, logout, formatDate, SESSION_END_CODES } from './auth';
import { applyTheme, getStoredTheme, getStoredSidebarCollapsed, storeSidebarCollapsed } from './preferences';
import { MaterialsProvider } from './materials';
import MaterialsSettings from './MaterialsSettings';
import GlobalSearch from './GlobalSearch';
import BillNumberSettings from './BillNumberSettings';
import './App.css';

// Left sidebar — day-to-day data entry and lists
const NAV_ITEMS = [
  { label: 'Home',               icon: HomeIcon,        path: '/home',                section: 'OVERVIEW' },
  { label: 'Dashboard',          icon: LayoutDashboard, path: '/',                    section: 'OVERVIEW' },
  { label: 'Seller Registration', icon: UserPlus,        path: '/seller-registration', section: 'SELLERS'  },
  { label: 'Seller List',         icon: Users,           path: '/seller-list',         section: 'SELLERS'  },
  { label: 'Seller History',      icon: History,         path: '/seller-history',      section: 'SELLERS'  },
  { label: 'Seller Advance',      icon: Wallet,          path: '/seller-advance',      section: 'SELLERS'  },
  { label: 'Buyer Registration',  icon: ShoppingCart,    path: '/buyer-registration',  section: 'BUYERS'   },
  { label: 'Buyer List',          icon: List,            path: '/buyer-list',          section: 'BUYERS'   },
  { label: 'Purchase List',       icon: ClipboardList,   path: '/purchase-list',       section: 'PURCHASES' },
  { label: 'Admin Dashboard',     icon: ShieldCheck,     path: '/admin',               section: 'ADMIN', adminOnly: true },
];

// How often an open session re-checks the licence with the server
const SESSION_CHECK_MS = 5 * 60 * 1000;
// Users get a heads-up toast at sign-in when this close to expiry
const EXPIRY_WARNING_DAYS = 7;

// Header "Reports" dropdown
const REPORT_ITEMS = [
  { label: 'Seller Summary', icon: BarChart3,    path: '/summary'       },
  { label: 'Buyer Summary',  icon: ShoppingCart, path: '/buyer-summary' },
  { label: 'Buyer Ledger',   icon: BookOpen,     path: '/buyer-ledger'  },
  { label: 'Sales Report',   icon: TrendingUp,   path: '/sales-report'  },
];

const PAGE_TITLES = {
  '/home':                'Home',
  '/':                    'Dashboard',
  '/seller-registration': 'Seller Registration',
  '/seller-list':         'Seller List',
  '/seller-history':      'Seller History',
  '/seller-advance':      'Seller Advance',
  '/buyer-registration':  'Buyer Registration',
  '/buyer-list':          'Buyer List',
  '/purchase-list':       'Purchase List',
  '/summary':             'Seller Summary',
  '/buyer-summary':       'Buyer Summary',
  '/buyer-ledger':        'Buyer Ledger',
  '/sales-report':        'Sales Report',
  '/admin':               'Admin Dashboard',
};

// Closes a dropdown when clicking anywhere outside it
function useClickOutside(ref, open, onClose) {
  useEffect(() => {
    if (!open) return undefined;
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, open, onClose]);
}

function Sidebar({ user, onLogout, collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin  = user.role === 'admin';
  // Admin works only in the Admin Dashboard; users never see it
  const navItems = NAV_ITEMS.filter(n => !!n.adminOnly === isAdmin);
  const sections = [...new Set(navItems.map(n => n.section))];

  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);
  useClickOutside(profileRef, showProfile, () => setShowProfile(false));
  // Admin signs in with an email address, so show a short name instead
  const displayName = isAdmin ? 'Admin' : user.username;
  const initials = displayName.substring(0, 2).toUpperCase();
  const roleLabel = isAdmin ? 'Administrator' : 'APMC Agent';
  // Licence badge turns amber in the last week (admins have no licence)
  const licenceSoon = !isAdmin && user.daysLeft !== null && user.daysLeft <= EXPIRY_WARNING_DAYS;

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">pH</div>
        <div className="logo-title">pH</div>
        <div className="logo-sub">Market Management</div>
      </div>

      {/* Profile */}
      <div ref={profileRef} style={{ padding: collapsed ? '10px 10px' : '0 12px 10px', position: 'relative' }}>
        <button
          className="profile-btn"
          onClick={() => setShowProfile(p => !p)}
          title={collapsed ? user.username : undefined}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            background: showProfile ? 'var(--bg-hover)' : 'var(--bg-panel)',
            border: `1px solid ${showProfile ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10,
            padding: '9px 12px', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #1a56db, #f59e0b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff',
          }}>{initials}</div>
          <div className="profile-text" style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{displayName}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{roleLabel}</div>
          </div>
          <div className="profile-text" style={{ fontSize: 10, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'none' }}>▲</div>
        </button>

        {showProfile && (
          <div style={{
            position: 'absolute', top: '100%', left: collapsed ? 10 : 12, zIndex: 100,
            width: collapsed ? 220 : 'calc(100% - 24px)',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: 'var(--menu-shadow)', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', margin: '0 auto 8px',
                background: 'linear-gradient(135deg, #1a56db, #f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800, color: '#fff',
              }}>{initials}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{displayName}</div>
              {isAdmin && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, wordBreak: 'break-all' }}>{user.username}</div>}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{isAdmin ? 'Administrator' : 'APMC Market Agent'}</div>
              <div style={{
                display: 'inline-block', marginTop: 6,
                background: licenceSoon ? 'var(--accent-dim)' : 'var(--green-dim)', color: licenceSoon ? 'var(--accent)' : 'var(--green)',
                border: `1px solid ${licenceSoon ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'}`,
                borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 700,
              }}>● Active</div>
              {!isAdmin && user.licenseExpires && (
                <div style={{ fontSize: 11, color: licenceSoon ? 'var(--accent)' : 'var(--text-muted)', marginTop: 6 }}>
                  Licence valid till {formatDate(user.licenseExpires)}
                </div>
              )}
            </div>
            <button
              className="menu-item"
              onClick={() => { setShowProfile(false); onLogout(); }}
              style={{ color: 'var(--red)', fontWeight: 700, borderRadius: 0, padding: '12px 16px' }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section}>
            <div className="nav-section-label">{section}</div>
            {navItems.filter(n => n.section === section).map(item => {
              const Icon   = item.icon;
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="nav-icon" size={18} />
                  <span className="nav-label" style={{ flex: 1 }}>{item.label}</span>
                  {active && <ChevronRight className="nav-chevron" size={14} />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sign out — always visible at the bottom of the sidebar */}
      <div style={{ padding: collapsed ? '10px' : '10px 12px', borderTop: '1px solid var(--border)' }}>
        <button className="nav-item" onClick={onLogout} title={collapsed ? 'Sign Out' : undefined}
          style={{ color: 'var(--red)', fontWeight: 700, margin: 0 }}>
          <LogOut className="nav-icon" size={18} />
          <span className="nav-label" style={{ flex: 1 }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

function ReportsMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, open, () => setOpen(false));
  const onReport = REPORT_ITEMS.some(r => r.path === location.pathname);

  return (
    <div className="menu-wrap" ref={ref}>
      <button className={`menu-trigger ${open ? 'open' : ''} ${onReport ? 'active' : ''}`} onClick={() => setOpen(o => !o)}>
        <BarChart3 size={15} /> Reports <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>
      {open && (
        <div className="menu-panel">
          <div className="menu-heading">Reports</div>
          {REPORT_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.path}
                className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => { navigate(item.path); setOpen(false); }}>
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SettingsMenu({ theme, onThemeChange, isAdmin, onAccount, onLogout }) {
  const [open, setOpen] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showBillNumber, setShowBillNumber] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, open, () => setOpen(false));

  return (
    <div className="menu-wrap" ref={ref}>
      {showMaterials && <MaterialsSettings onClose={() => setShowMaterials(false)} />}
      {showBillNumber && <BillNumberSettings onClose={() => setShowBillNumber(false)} />}
      <button className={`icon-btn ${open ? 'open' : ''}`} onClick={() => setOpen(o => !o)} title="Settings">
        <Settings size={17} />
      </button>
      {open && (
        <div className="menu-panel" style={{ width: 240 }}>
          <div className="menu-heading">Appearance</div>
          <div className="theme-switch">
            <button className={`theme-option ${theme === 'dark' ? 'selected' : ''}`} onClick={() => onThemeChange('dark')}>
              <Moon size={14} /> Dark
            </button>
            <button className={`theme-option ${theme === 'light' ? 'selected' : ''}`} onClick={() => onThemeChange('light')}>
              <Sun size={14} /> Light
            </button>
          </div>
          {!isAdmin && (
            <>
              <div className="menu-heading" style={{ borderTop: '1px solid var(--border)', marginTop: 4 }}>Data</div>
              <button className="menu-item" onClick={() => { setOpen(false); setShowMaterials(true); }}>
                <Package size={16} /> Materials
              </button>
              <button className="menu-item" onClick={() => { setOpen(false); setShowBillNumber(true); }}>
                <Hash size={16} /> Bill Number
              </button>
            </>
          )}
          <div className="menu-heading" style={{ borderTop: '1px solid var(--border)', marginTop: 4 }}>Account</div>
          <button className="menu-item" onClick={() => { setOpen(false); onAccount(); }}>
            <KeyRound size={16} /> {isAdmin ? 'Change Password' : 'Account & Licence'}
          </button>
          <button className="menu-item" onClick={() => { setOpen(false); onLogout(); }} style={{ color: 'var(--red)', fontWeight: 700 }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

function AppLayout({ user, onLogout, onUserUpdate, theme, onThemeChange }) {
  const location = useLocation();
  const title    = PAGE_TITLES[location.pathname] || 'ph';
  const [collapsed, setCollapsed] = useState(getStoredSidebarCollapsed);
  const [showAccount, setShowAccount] = useState(false);
  const isAdmin = user.role === 'admin';

  const toggleSidebar = () => setCollapsed(c => { storeSidebarCollapsed(!c); return !c; });

  return (
    <div className="app-layout">
      {showAccount && <AccountSettings user={user} onClose={() => setShowAccount(false)} onUserUpdate={onUserUpdate} />}
      <Sidebar user={user} onLogout={onLogout} collapsed={collapsed} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <button className="icon-btn" onClick={toggleSidebar} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </button>
            <div className="topbar-title">{title}</div>
          </div>
          {isAdmin ? <div style={{ flex: 1 }} /> : <GlobalSearch />}
          <div className="topbar-right">
            {!isAdmin && <ReportsMenu />}
            {/* Date / version / server pills step out of the way on narrower screens (see App.css) */}
            <div className="topbar-date" title={new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })} style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '0 13px', height: 36, fontSize: 12,
              color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              📅 <span className="topbar-date-text">{new Date().toLocaleDateString('en-IN', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}</span>
            </div>
            <div className="topbar-version" style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <Wheat size={14} style={{ color: 'var(--accent)' }} />
              <span>pH v1.1</span>
            </div>
            <div className="topbar-status" style={{ whiteSpace: 'nowrap',
              background: 'var(--bg-panel)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '0 14px', height: 36, fontSize: 12,
              color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center',
            }}>
              🟢 Server Online
            </div>
            <SettingsMenu theme={theme} onThemeChange={onThemeChange} isAdmin={isAdmin} onAccount={() => setShowAccount(true)} onLogout={onLogout} />
          </div>
        </div>
        <div className="page-content">
          {isAdmin ? (
            // Admin has only the Admin Dashboard — any other address lands there
            <Routes>
              <Route path="/admin" element={<AdminDashboard currentUser={user} onAccount={() => setShowAccount(true)} />} />
              <Route path="*"      element={<Navigate to="/admin" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/home"                element={<Home />} />
              <Route path="/"                    element={<Dashboard />} />
              <Route path="/seller-registration" element={<SellerRegistration />} />
              <Route path="/seller-list"         element={<SellerList />} />
              <Route path="/seller-history"      element={<SellerHistory />} />
              <Route path="/seller-advance"      element={<SellerAdvance />} />
              <Route path="/buyer-registration"  element={<BuyerRegistration />} />
              <Route path="/buyer-list"          element={<BuyerList />} />
              <Route path="/purchase-list"       element={<PurchaseList />} />
              <Route path="/summary"             element={<Summary />} />
              <Route path="/buyer-summary"       element={<BuyerSummary />} />
              <Route path="/buyer-ledger"        element={<BuyerLedger />} />
              <Route path="/sales-report"        element={<SalesReport />} />
            </Routes>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Session survives a page refresh (sessionStorage) and is re-validated with the server
  const [session, setSession] = useState(getSession);
  const [notice, setNotice]   = useState('');
  const [theme, setTheme] = useState(getStoredTheme);
  const user = session?.user;

  const handleLogin = (next) => {
    setNotice('');
    setSession(next);
    const days = next.user.daysLeft;
    if (next.user.role !== 'admin' && days !== null && days <= EXPIRY_WARNING_DAYS) {
      toast(days === 0 ? 'Your licence ends today. Please contact admin to renew.'
                       : `Your licence expires in ${days} day${days === 1 ? '' : 's'}. Please contact admin to renew.`,
        { icon: '⏳', duration: 6000 });
    }
  };

  const handleLogout = (message = '') => {
    logout();
    clearSession();
    setNotice(message);
    setSession(null);
  };

  const handleUserUpdate = (nextUser) => setSession(s => {
    const next = { ...s, user: nextUser };
    saveSession(next);
    return next;
  });

  // Re-check the session now and every few minutes — signs the user out once the licence
  // expires or the admin disables / revokes the account. Network hiccups are ignored.
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return undefined;
    const check = () => fetchMe()
      .then(handleUserUpdate)
      .catch(err => { if (SESSION_END_CODES.includes(err.code)) handleLogout(err.message); });
    check();
    const timer = setInterval(check, SESSION_CHECK_MS);
    return () => clearInterval(timer);
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleThemeChange = (next) => {
    applyTheme(next);
    setTheme(next);
  };

  return (
    <HashRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      {/* Show Login page if not logged in, otherwise show the app */}
      {user
        ? <MaterialsProvider><AppLayout user={user} onLogout={() => handleLogout()} onUserUpdate={handleUserUpdate} theme={theme} onThemeChange={handleThemeChange} /></MaterialsProvider>
        : <Login key={notice} onLogin={handleLogin} notice={notice} />
      }
    </HashRouter>
  );
}
