import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ShoppingCart, Package, TrendingUp, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSummary } from '../api';
import { fmtINR, fmtNum, todayISO, MATERIAL_BADGE } from '../utils';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const today = todayISO();

  useEffect(() => {
    getSummary(today)
      .then(r => setSummary(r.data.data))
      .catch(err => toast.error(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [today]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const todayFull = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const materialColors = ['badge-amber', 'badge-green', 'badge-blue', 'badge-purple'];

  const QUICK_ACTIONS = [
    { label: 'Register New Seller', path: '/seller-registration', icon: '👨‍🌾', border: 'var(--accent)' },
    { label: 'View Seller List',    path: '/seller-list',         icon: '📋', border: 'var(--green)' },
    { label: 'Register New Buyer',  path: '/buyer-registration',  icon: '🛒', border: 'var(--blue)' },
    { label: 'View Buyer List',     path: '/buyer-list',          icon: '📑', border: 'var(--purple)' },
    { label: 'View Summary Report', path: '/summary',             icon: '📊', border: '#f472b6' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-title">{greeting} 👋</div>
        <div className="welcome-sub">
          <span className="accent-text">{todayFull}</span> — Here's your market overview for today
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* Seller Stats */}
          <div style={{ marginBottom: 10, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={12} /> Today's Sellers
          </div>
          <div className="stats-grid" style={{ marginBottom: 28 }}>
            {[
              { label: 'Total Sellers',  value: summary?.sellerStats?.total_sellers || 0,            color: 'amber',  icon: <Users size={20} /> },
              { label: 'Total Bags',     value: fmtNum(summary?.sellerStats?.total_bags, 0),          color: 'green',  icon: <Package size={20} /> },
              { label: 'Total Weight',   value: fmtNum(summary?.sellerStats?.total_weight) + ' kg',   color: 'blue',   icon: <TrendingUp size={20} /> },
              { label: 'Advance Paid',   value: '₹' + fmtINR(summary?.sellerStats?.total_advance),   color: 'purple', icon: <span style={{ fontWeight: 800 }}>₹</span> },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Buyer Stats */}
          <div style={{ marginBottom: 10, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={12} /> Today's Buyers
          </div>
          <div className="stats-grid" style={{ marginBottom: 28 }}>
            {[
              { label: 'Total Buyers',    value: summary?.buyerStats?.total_buyers || 0,            color: 'amber',  icon: <ShoppingCart size={20} /> },
              { label: 'Total Bags',      value: fmtNum(summary?.buyerStats?.total_bags, 0),         color: 'green',  icon: <Package size={20} /> },
              { label: 'Total Weight',    value: fmtNum(summary?.buyerStats?.total_weight) + ' kg',  color: 'blue',   icon: <TrendingUp size={20} /> },
              { label: 'Advance Recd.',   value: '₹' + fmtINR(summary?.buyerStats?.total_advance),  color: 'purple', icon: <span style={{ fontWeight: 800 }}>₹</span> },
            ].map(s => (
              <div key={s.label} className={`stat-card ${s.color}`}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="two-col">
            {/* Material Breakdown */}
            <div className="card">
              <div className="card-title">📦 Material Breakdown (Today)</div>
              {summary?.materialBreakdown?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {summary.materialBreakdown.map((m, i) => (
                    <div key={m.material} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', background: 'var(--bg-panel)',
                      borderRadius: 8, border: '1px solid var(--border)'
                    }}>
                      <span className={`badge ${materialColors[i % 4]}`}>{m.material}</span>
                      <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span><strong style={{ color: 'var(--text-primary)' }}>{m.count}</strong> sellers</span>
                        <span><strong style={{ color: 'var(--text-primary)' }}>{m.bags}</strong> bags</span>
                        <span><strong style={{ color: 'var(--text-primary)' }}>{fmtNum(m.weight)}</strong> kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '32px 20px' }}>
                  <div className="empty-state-icon">📦</div>
                  <h3>No entries today</h3>
                  <p style={{ fontSize: 12 }}>Register sellers to see material breakdown</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-title">⚡ Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {QUICK_ACTIONS.map(item => (
                  <button key={item.path} onClick={() => navigate(item.path)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: 'var(--bg-panel)',
                    border: '1px solid var(--border)', borderRadius: 8,
                    cursor: 'pointer', transition: 'all 0.15s', width: '100%',
                    color: 'var(--text-primary)',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = item.border; e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-panel)'; }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: 500 }}>
                      <span>{item.icon}</span> {item.label}
                    </span>
                    <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
