import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Check, Eye, EyeOff } from 'lucide-react';
import { changePassword, updateProfile, formatDate } from './auth';

const EXPIRING_SOON_DAYS = 7;

// Licence period for a user — the admin has none
function LicenceDetails({ user }) {
  const days = user.daysLeft;
  const soon = days !== null && days <= EXPIRING_SOON_DAYS;
  const color = soon ? 'var(--accent)' : 'var(--green)';
  const label = { color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 };
  const value = { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' };

  return (
    <div style={{ marginBottom: 18, padding: '14px 16px', background: 'var(--bg-panel)', border: `1px solid ${soon ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`, borderRadius: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ ...label, marginBottom: 0 }}>Licence</div>
        <span className={`badge ${soon ? 'badge-amber' : 'badge-green'}`}>{soon ? 'Expiring Soon' : 'Active'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div><div style={label}>Valid From</div><div style={value}>{formatDate(user.licenseStart)}</div></div>
        <div><div style={label}>Valid Till</div><div style={value}>{formatDate(user.licenseExpires)}</div></div>
        <div>
          <div style={label}>Remaining</div>
          <div style={{ ...value, color }}>{days === 0 ? 'Last day' : `${days} day${days === 1 ? '' : 's'}`}</div>
        </div>
      </div>
      {soon && (
        <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 10 }}>Your licence ends soon. Please contact admin to renew.</div>
      )}
    </div>
  );
}

// Settings → Account: licence details (users) and changing your own password. The admin also
// keeps an email here, which OTP sign-in will use once email delivery is set up.
export default function AccountSettings({ user, onClose, onUserUpdate }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [email, setEmail] = useState(user.email || '');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const isAdmin = user.role === 'admin';
  const wantsPasswordChange = form.current || form.next || form.confirm;
  const emailChanged = isAdmin && email.trim() !== (user.email || '');

  const save = async () => {
    if (!wantsPasswordChange && !emailChanged) return onClose();
    if (wantsPasswordChange) {
      if (!form.current) return toast.error('Enter your current password');
      if (form.next.length < 6) return toast.error('New password must be at least 6 characters');
      if (form.next !== form.confirm) return toast.error('New passwords do not match');
    }
    setSaving(true);
    try {
      if (emailChanged) onUserUpdate(await updateProfile({ email: email.trim() }));
      if (wantsPasswordChange) await changePassword(form.current, form.next);
      toast.success(wantsPasswordChange ? 'Password changed' : 'Account updated');
      onClose();
    } catch (err) {
      toast.error(err.message);
      setSaving(false);
    }
  };

  const pwInput = (key, label, placeholder, autoComplete) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="form-input" style={{ textTransform: 'none' }} type={show ? 'text' : 'password'}
        value={form[key]} onChange={set(key)} placeholder={placeholder} autoComplete={autoComplete} />
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ marginBottom: 8 }}>
          <div className="modal-title">{isAdmin ? 'Account' : 'Account & Licence'}</div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Signed in as <b style={{ color: 'var(--text-primary)' }}>{user.username}</b> · {isAdmin ? 'Administrator' : 'User'}
        </div>

        {!isAdmin && user.licenseExpires && <LicenceDetails user={user} />}

        {isAdmin && (
          <div className="form-group" style={{ marginBottom: 18 }}>
            <label className="form-label">Email</label>
            <input className="form-input" style={{ textTransform: 'none' }} type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" />
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 5 }}>Sign-in OTPs will be sent here (coming soon).</div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Change password</div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShow(s => !s)}>
            {show ? <EyeOff size={13} /> : <Eye size={13} />} {show ? 'Hide' : 'Show'}
          </button>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {pwInput('current', 'Current Password', 'Enter current password', 'current-password')}
          {pwInput('next', 'New Password', 'At least 6 characters', 'new-password')}
          {pwInput('confirm', 'Confirm New Password', 'Re-enter new password', 'new-password')}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            <Check size={15} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
