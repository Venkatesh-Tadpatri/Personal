import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Users, ShieldCheck, Clock, ShieldOff, UserPlus, KeyRound, CalendarClock,
  Power, Trash2, X, Check, Search, RefreshCw, Eye, EyeOff,
} from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog';
import {
  listUsers, createUser, setLicense, setUserActive, resetPassword, deleteUser,
  formatDate, licenceEnd, todayStr, parseDate, toDateStr,
} from '../auth';

const EXPIRING_SOON_DAYS = 7;

// Licence periods offered when granting / renewing
const PERIODS = [
  { key: '7d',  label: '7 Days',   amount: 7,  unit: 'days'   },
  { key: '1m',  label: '1 Month',  amount: 1,  unit: 'months' },
  { key: '3m',  label: '3 Months', amount: 3,  unit: 'months' },
  { key: '6m',  label: '6 Months', amount: 6,  unit: 'months' },
  { key: '1y',  label: '1 Year',   amount: 1,  unit: 'years'  },
  { key: 'custom', label: 'Custom Date' },
];

const dayAfter = (s) => { const d = parseDate(s); d.setDate(d.getDate() + 1); return toDateStr(d); };

// Expiry date chosen in a licence picker, or '' if the custom date is missing
const pickedExpiry = ({ period, customDate, extendFrom }) => {
  if (period === 'custom') return customDate;
  const p = PERIODS.find(x => x.key === period);
  return licenceEnd(extendFrom || todayStr(), p.amount, p.unit);
};

function StatusBadge({ u }) {
  if (u.role === 'admin') return <span className="badge badge-purple">Admin</span>;
  if (u.status === 'disabled') return <span className="badge badge-red">Disabled</span>;
  if (u.status === 'none') return <span className="badge badge-red">No Licence</span>;
  if (u.status === 'expired') return <span className="badge badge-red">Expired</span>;
  if (u.daysLeft <= EXPIRING_SOON_DAYS) return <span className="badge badge-amber">Expiring Soon</span>;
  return <span className="badge badge-green">Active</span>;
}

function DaysLeft({ u }) {
  if (u.role === 'admin' || !u.licenseExpires) return <span className="td-muted">—</span>;
  if (u.daysLeft < 0) return <span style={{ color: 'var(--red)', fontWeight: 700 }}>Expired {-u.daysLeft}d ago</span>;
  if (u.daysLeft === 0) return <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Last day</span>;
  const color = u.daysLeft <= EXPIRING_SOON_DAYS ? 'var(--accent)' : 'var(--green)';
  return <span style={{ color, fontWeight: 700 }}>{u.daysLeft} day{u.daysLeft === 1 ? '' : 's'}</span>;
}

// Period buttons + custom date + preview of the resulting expiry
function LicencePicker({ value, onChange, canExtend }) {
  const expiry = pickedExpiry(value);
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {PERIODS.map(p => (
          <button key={p.key} type="button"
            className={`btn btn-sm ${value.period === p.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{ justifyContent: 'center' }}
            onClick={() => onChange({ ...value, period: p.key })}>
            {p.label}
          </button>
        ))}
      </div>
      {value.period === 'custom' && (
        <div className="form-group" style={{ marginTop: 12 }}>
          <label className="form-label">Valid Till</label>
          <input className="form-input" type="date" min={todayStr()} value={value.customDate}
            onChange={e => onChange({ ...value, customDate: e.target.value })} />
        </div>
      )}
      {canExtend && value.period !== 'custom' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={!!value.extendFrom}
            onChange={e => onChange({ ...value, extendFrom: e.target.checked ? canExtend : null })} />
          Add to the current licence (starts {formatDate(canExtend)}) instead of from today
        </label>
      )}
      <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Login allowed till</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: expiry ? 'var(--accent)' : 'var(--text-muted)' }}>
          {expiry ? formatDate(expiry) : 'Pick a date'}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>After this day the user sees “Licence expired. Please contact admin.”</div>
      </div>
    </>
  );
}

function Modal({ title, subtitle, onClose, children, footer, width = 460 }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ marginBottom: subtitle ? 6 : 16 }}>
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>{subtitle}</div>}
        {children}
        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end', flexWrap: 'wrap' }}>{footer}</div>
      </div>
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input className="form-input" style={{ textTransform: 'none', paddingRight: 40 }} type={show ? 'text' : 'password'}
        value={value} onChange={onChange} placeholder={placeholder} autoComplete="new-password" />
      <button type="button" onClick={() => setShow(s => !s)} title={show ? 'Hide' : 'Show'}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function AddUserModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [licence, setLicence] = useState({ period: '1m', customDate: '', extendFrom: null });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const licenseExpires = pickedExpiry(licence);
    if (!licenseExpires) return toast.error('Pick the licence end date');
    setSaving(true);
    try {
      const u = await createUser({ username: form.username.trim().toLowerCase(), password: form.password, licenseExpires });
      toast.success(`User "${u.username}" created`);
      onSaved();
    } catch (err) {
      toast.error(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title="Add User" subtitle="The user can sign in until the licence ends." onClose={onClose} width={500}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}><Check size={15} /> {saving ? 'Creating...' : 'Create User'}</button>
      </>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input className="form-input" style={{ textTransform: 'none' }} value={form.username} autoFocus
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="e.g. ravi" maxLength={30} />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <PasswordInput value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="At least 6 characters" />
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Licence period</div>
      <LicencePicker value={licence} onChange={setLicence} />
    </Modal>
  );
}

function LicenceModal({ user, onClose, onSaved }) {
  const stillValid = user.licenseExpires && user.daysLeft >= 0;
  const [licence, setLicence] = useState({ period: '1m', customDate: '', extendFrom: null });
  const [saving, setSaving] = useState(false);

  const save = async (expires) => {
    setSaving(true);
    try {
      await setLicense(user.id, expires);
      toast.success(expires ? `Licence for "${user.username}" valid till ${formatDate(expires)}` : `Licence for "${user.username}" revoked`);
      onSaved();
    } catch (err) {
      toast.error(err.message);
      setSaving(false);
    }
  };

  const grant = () => {
    const expires = pickedExpiry(licence);
    if (!expires) return toast.error('Pick the licence end date');
    save(expires);
  };

  return (
    <Modal title={`Licence — ${user.username}`} onClose={onClose} width={500}
      subtitle={user.licenseExpires
        ? `Current licence: ${formatDate(user.licenseStart)} → ${formatDate(user.licenseExpires)}${user.daysLeft < 0 ? ' (expired)' : ''}`
        : 'This user has no licence and cannot sign in.'}
      footer={<>
        {user.licenseExpires && (
          <button className="btn btn-red" style={{ marginRight: 'auto' }} disabled={saving} onClick={() => save(null)}>
            <ShieldOff size={15} /> Revoke Now
          </button>
        )}
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={grant} disabled={saving}><Check size={15} /> {saving ? 'Saving...' : 'Save Licence'}</button>
      </>}>
      <LicencePicker value={licence} onChange={setLicence} canExtend={stillValid ? dayAfter(user.licenseExpires) : null} />
    </Modal>
  );
}

function ResetPasswordModal({ user, onClose }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (pw.length < 6) return toast.error('Password must be at least 6 characters');
    if (pw !== confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await resetPassword(user.id, pw);
      toast.success(`Password reset for "${user.username}"`);
      onClose();
    } catch (err) {
      toast.error(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={`Reset Password — ${user.username}`} subtitle="Share the new password with the user. They will be signed out of any open session."
      onClose={onClose}
      footer={<>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save} disabled={saving}><KeyRound size={15} /> {saving ? 'Saving...' : 'Reset Password'}</button>
      </>}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <PasswordInput value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 6 characters" />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password" />
        </div>
      </div>
    </Modal>
  );
}

export default function AdminDashboard({ currentUser, onAccount }) {
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { type: 'add' | 'licence' | 'reset', user }
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(() => {
    listUsers().then(setUsers).catch(err => toast.error(err.message));
  }, []);
  useEffect(() => { load(); }, [load]);

  const closeAndReload = () => { setModal(null); load(); };

  const stats = useMemo(() => {
    const list = (users || []).filter(u => u.role !== 'admin');
    const active = list.filter(u => u.status === 'active');
    return [
      { label: 'Total Users',                       value: list.length, icon: <Users size={18} />, color: 'blue' },
      { label: 'Active Licences',                   value: active.length, icon: <ShieldCheck size={18} />, color: 'green' },
      { label: `Expiring in ${EXPIRING_SOON_DAYS} Days`, value: active.filter(u => u.daysLeft <= EXPIRING_SOON_DAYS).length, icon: <Clock size={18} />, color: 'amber' },
      { label: 'Expired / Blocked',                 value: list.length - active.length, icon: <ShieldOff size={18} />, color: 'purple' },
    ];
  }, [users]);

  const visible = (users || []).filter(u => u.username.includes(search.trim().toLowerCase()));

  const toggleActive = (u) => setConfirm({
    title: u.active ? `Disable "${u.username}"?` : `Enable "${u.username}"?`,
    message: u.active ? 'They will be signed out and cannot sign in until enabled again.' : 'They can sign in again while their licence is valid.',
    danger: false, // ConfirmDialog's danger style labels the button "Delete"
    onConfirm: () => setUserActive(u.id, !u.active)
      .then(() => { toast.success(u.active ? 'User disabled' : 'User enabled'); load(); })
      .catch(err => toast.error(err.message)),
  });

  const remove = (u) => setConfirm({
    title: `Delete "${u.username}"?`,
    message: 'The account is removed permanently. Business data (sellers, buyers, bills) is not affected.',
    onConfirm: () => deleteUser(u.id)
      .then(() => { toast.success('User deleted'); load(); })
      .catch(err => toast.error(err.message)),
  });

  return (
    <div>
      {modal?.type === 'add' && <AddUserModal onClose={() => setModal(null)} onSaved={closeAndReload} />}
      {modal?.type === 'licence' && <LicenceModal user={modal.user} onClose={() => setModal(null)} onSaved={closeAndReload} />}
      {modal?.type === 'reset' && <ResetPasswordModal user={modal.user} onClose={() => setModal(null)} />}
      {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}

      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div className="page-title">Admin Dashboard</div>
          <div className="page-subtitle">Manage user accounts and how long each one can sign in.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={onAccount}><KeyRound size={15} /> Change My Password</button>
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}><UserPlus size={15} /> Add User</button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value">{users ? s.value : '–'}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="card-title" style={{ margin: 0 }}>Users & Licences</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" style={{ textTransform: 'none', paddingLeft: 32, width: 220 }} placeholder="Search username"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-secondary" onClick={load} title="Refresh"><RefreshCw size={15} /></button>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Status</th>
                <th>Licence From</th>
                <th>Valid Till</th>
                <th>Remaining</th>
                <th>Last Login</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!users && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30 }} className="td-muted">Loading…</td></tr>}
              {users && !visible.length && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30 }} className="td-muted">No users found</td></tr>}
              {visible.map(u => {
                const isAdmin = u.role === 'admin';
                return (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 700 }}>
                      {u.username}
                      {u.id === currentUser.id && <span className="td-muted" style={{ fontWeight: 500 }}> (you)</span>}
                    </td>
                    <td><StatusBadge u={u} /></td>
                    <td className="td-muted">{isAdmin ? '—' : formatDate(u.licenseStart)}</td>
                    <td>{isAdmin ? <span className="td-muted">No licence needed</span> : formatDate(u.licenseExpires)}</td>
                    <td><DaysLeft u={u} /></td>
                    <td className="td-muted">{u.lastLogin ? new Date(`${u.lastLogin.replace(' ', 'T')}Z`).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        {isAdmin ? (
                          <button className="btn btn-secondary btn-sm" onClick={onAccount}><KeyRound size={13} /> Change Password</button>
                        ) : (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'licence', user: u })} title="Set licence">
                              <CalendarClock size={13} /> Licence
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setModal({ type: 'reset', user: u })} title="Reset password">
                              <KeyRound size={13} />
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => toggleActive(u)} title={u.active ? 'Disable' : 'Enable'}
                              style={{ color: u.active ? 'var(--text-secondary)' : 'var(--green)' }}>
                              <Power size={13} />
                            </button>
                            <button className="btn btn-secondary btn-sm" onClick={() => remove(u)} title="Delete" style={{ color: 'var(--red)' }}>
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
