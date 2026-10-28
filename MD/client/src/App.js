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
//         <div className="logo-title">ph</div>
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




import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  LayoutDashboard, UserPlus, Users, ShoppingCart, List, BarChart3,
  Wheat, ChevronRight, LogOut, TrendingUp, ShieldCheck, KeyRound
} from 'lucide-react';
import SalesReport from './pages/SalesReport';
import BuyerSummary from './pages/BuyerSummary';
import Dashboard from './pages/Dashboard';
import SellerRegistration from './pages/SellerRegistration';
import SellerList from './pages/SellerList';
import BuyerRegistration from './pages/BuyerRegistration';
import BuyerList from './pages/BuyerList';
import Summary from './pages/Summary';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AccountSettings from './AccountSettings';
import { getSession, saveSession, clearSession, fetchMe, logout, formatDate, SESSION_END_CODES } from './auth';
import './App.css';

const NAV_ITEMS = [
  { label: 'Dashboard',          icon: LayoutDashboard, path: '/',                    section: 'OVERVIEW' },
  { label: 'Seller Registration', icon: UserPlus,        path: '/seller-registration', section: 'SELLERS'  },
  { label: 'Seller List',         icon: Users,           path: '/seller-list',         section: 'SELLERS'  },
  { label: 'Buyer Registration',  icon: ShoppingCart,    path: '/buyer-registration',  section: 'BUYERS'   },
  { label: 'Buyer List',          icon: List,            path: '/buyer-list',          section: 'BUYERS'   },
  { label: 'Seller Summary',       icon: BarChart3,       path: '/summary',             section: 'REPORTS'  },
  { label: 'Buyer Summary',        icon: ShoppingCart,    path: '/buyer-summary',       section: 'REPORTS'  },
  { label: 'Sales Report',         icon: TrendingUp,      path: '/sales-report',        section: 'REPORTS'  },
  { label: 'Admin Dashboard',      icon: ShieldCheck,     path: '/admin',               section: 'ADMIN', adminOnly: true },
];

// How often an open session re-checks the licence with the server
const SESSION_CHECK_MS = 5 * 60 * 1000;
// Users get a heads-up toast at sign-in when this close to expiry
const EXPIRY_WARNING_DAYS = 7;

function Sidebar({ user, onLogout, onAccount }) {
  const navigate = useNavigate();
  const location = useLocation();
  const today    = new Date();
  const dateStr  = today.toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  const isAdmin  = user.role === 'admin';
  // Admin works only in the Admin Dashboard; users never see it
  const navItems = NAV_ITEMS.filter(n => !!n.adminOnly === isAdmin);
  const sections = [...new Set(navItems.map(n => n.section))];

  const [showProfile, setShowProfile] = React.useState(false);
  // Admin signs in with an email address, so show a short name instead
  const displayName = isAdmin ? 'Admin' : user.username;
  const initials = displayName.substring(0, 2).toUpperCase();
  // Licence badge turns amber in the last week (admins have no licence)
  const licenceSoon = !isAdmin && user.daysLeft !== null && user.daysLeft <= EXPIRY_WARNING_DAYS;

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🌾</div>
        <div className="logo-title">md</div>
        <div className="logo-sub">Market Management</div>
      </div>

      {/* Profile bar — replaces old user block in footer */}
      <div style={{ padding: '0 12px 10px', position: 'relative' }}>
        <button
          onClick={() => setShowProfile(p => !p)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            background: showProfile ? 'var(--bg-hover)' : 'var(--bg-panel)',
            border: '1px solid var(--border)', borderRadius: 10,
            padding: '9px 12px', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = showProfile ? 'var(--accent)' : 'var(--border)'}
        >
          {/* Avatar circle */}
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #1a56db, #f59e0b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 900, color: '#fff',
          }}>{initials}</div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{displayName}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{isAdmin ? 'Administrator' : 'APMC Agent'}</div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'none' }}>▲</div>
        </button>

        {/* Dropdown panel */}
        {showProfile && (
          <div style={{
            position: 'absolute', top: '100%', left: 12, right: 12, zIndex: 100,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}>
            {/* Profile info */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', margin: '0 auto 8px',
                background: 'linear-gradient(135deg, #1a56db, #f59e0b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 900, color: '#fff',
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
            {/* Change password */}
            <button
              onClick={() => { setShowProfile(false); onAccount(); }}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                color: 'var(--text-primary)', fontSize: 13, fontWeight: 600,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <KeyRound size={15} />
              {isAdmin ? 'Change Password' : 'Account & Licence'}
            </button>
            {/* Logout */}
            <button
              onClick={() => { setShowProfile(false); onLogout(); }}
              style={{
                width: '100%', padding: '12px 16px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                color: 'var(--red)', fontSize: 13, fontWeight: 700,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dim)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={15} />
              Sign Out
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
                  onClick={() => { navigate(item.path); setShowProfile(false); }}
                >
                  <Icon className="nav-icon" size={18} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {active && <ChevronRight size={14} />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Sign out — always visible at the bottom of the sidebar */}
      <div className="sidebar-footer" style={{ padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
        <button className="nav-item" onClick={onLogout} style={{ color: 'var(--red)', fontWeight: 700, margin: 0 }}>
          <LogOut className="nav-icon" size={18} />
          <span style={{ flex: 1 }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

const PAGE_TITLES = {
  '/':                    'Dashboard',
  '/seller-registration': 'Seller Registration',
  '/seller-list':         'Seller List',
  '/buyer-registration':  'Buyer Registration',
  '/buyer-list':          'Buyer List',
  '/summary':             'Seller Summary',
  '/buyer-summary':       'Buyer Summary',
  '/sales-report':        'Sales Report',
  '/admin':               'Admin Dashboard',
};

function AppLayout({ user, onLogout, onUserUpdate }) {
  const location = useLocation();
  const title    = PAGE_TITLES[location.pathname] || 'ph';
  const [showAccount, setShowAccount] = useState(false);

  return (
    <div className="app-layout">
      {showAccount && <AccountSettings user={user} onClose={() => setShowAccount(false)} onUserUpdate={onUserUpdate} />}
      <Sidebar user={user} onLogout={onLogout} onAccount={() => setShowAccount(true)} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-right">
            {/* Date pill */}
            <div style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 13px', fontSize: 12,
              color: 'var(--accent)', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              📅 {new Date().toLocaleDateString('en-IN', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wheat size={14} style={{ color: 'var(--accent)' }} />
              <span>ph v1.0</span>
            </div>
            <div style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '6px 14px', fontSize: 12,
              color: 'var(--text-secondary)', fontWeight: 500,
            }}>
              🟢 Server Online
            </div>
          </div>
        </div>
        <div className="page-content">
          {user.role === 'admin' ? (
            // Admin has only the Admin Dashboard — any other address lands there
            <Routes>
              <Route path="/admin" element={<AdminDashboard currentUser={user} onAccount={() => setShowAccount(true)} />} />
              <Route path="*"      element={<Navigate to="/admin" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/"                    element={<Dashboard />} />
              <Route path="/seller-registration" element={<SellerRegistration />} />
              <Route path="/seller-list"         element={<SellerList />} />
              <Route path="/buyer-registration"  element={<BuyerRegistration />} />
              <Route path="/buyer-list"          element={<BuyerList />} />
              <Route path="/summary"             element={<Summary />} />
              <Route path="/buyer-summary"       element={<BuyerSummary />} />
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

  return (
    <HashRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1b2e',
            color: '#f0f6ff',
            border: '1px solid #1a3352',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#000' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#000' } },
        }}
      />
      {/* Show Login page if not logged in, otherwise show the app */}
      {user
        ? <AppLayout user={user} onLogout={() => handleLogout()} onUserUpdate={handleUserUpdate} />
        : <Login key={notice} onLogin={handleLogin} notice={notice} />
      }
    </HashRouter>
  );
}