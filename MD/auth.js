// ══════════════════════════════════════════════════════════════════════════════
// AUTH — user accounts, licences and the admin API
//
// • Admin logs in without a licence and manages everyone else from the Admin Dashboard.
// • A user can log in only while their licence is valid (expiry date is inclusive);
//   after that, login and the periodic session check both answer LICENSE_EXPIRED.
// • Passwords are stored as scrypt hashes; sessions are random tokens held in memory
//   (the server restarts with the app, which signs everyone out — intended).
// ══════════════════════════════════════════════════════════════════════════════

const crypto = require('crypto');

const USERNAME_RE = /^[a-z0-9._-]{3,30}$/;
const MIN_PASSWORD = 6;
const CLOCK_TOLERANCE_MS = 24 * 60 * 60 * 1000; // system clock may drift back this much before we treat it as tampering

// token → { userId }
const sessions = new Map();

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt,
  hash: crypto.scryptSync(String(password), salt, 64).toString('hex'),
});

const verifyPassword = (password, user) => {
  const { hash } = hashPassword(password, user.password_salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(user.password_hash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Local calendar date as YYYY-MM-DD (licences are day-based, in the shop's local time)
const todayStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const isValidDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(`${s}T00:00:00`));

const daysLeft = (expires) => {
  if (!expires) return null;
  const ms = new Date(`${expires}T00:00:00`) - new Date(`${todayStr()}T00:00:00`);
  return Math.round(ms / 86400000);
};

// active | expired | none | disabled — admins are always active
const licenceStatus = (u) => {
  if (u.role === 'admin') return 'active';
  if (!u.active) return 'disabled';
  if (!u.license_expires) return 'none';
  return u.license_expires >= todayStr() ? 'active' : 'expired';
};

const publicUser = (u) => ({
  id: u.id,
  username: u.username,
  role: u.role,
  email: u.email || '',
  active: !!u.active,
  licenseStart: u.license_start || null,
  licenseExpires: u.license_expires || null,
  daysLeft: u.role === 'admin' ? null : daysLeft(u.license_expires),
  status: licenceStatus(u),
  lastLogin: u.last_login || null,
  createdAt: u.created_at,
});

const LOGIN_BLOCKS = {
  disabled: { code: 'ACCOUNT_DISABLED', error: 'Your account has been disabled. Please contact admin.' },
  none:     { code: 'LICENSE_EXPIRED',  error: 'No active licence for this account. Please contact admin.' },
  expired:  { code: 'LICENSE_EXPIRED',  error: 'Licence expired. Please contact admin to renew.' },
};

module.exports = function registerAuth(app, prepare, { seedUsers = [] } = {}) {
  // ── Schema + first-run accounts (call after the DB is initialised) ─────────
  const init = () => {
    // Used for the clock check below; created here too so this module works on any app DB
    prepare(`CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run();

    prepare(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      email TEXT DEFAULT '',
      active INTEGER DEFAULT 1,
      license_start TEXT DEFAULT NULL,
      license_expires TEXT DEFAULT NULL,
      last_login DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`).run();

    // `replaces`: an older account name this seed takes over once (keeps its id), e.g. the
    // original "admin" login moving to an email address. Never re-applied after that.
    seedUsers.forEach(({ username, password, role, email = '', replaces }) => {
      if (prepare('SELECT id FROM users WHERE username = ?').get(username)) return;
      const { hash, salt } = hashPassword(password);
      const old = replaces && prepare('SELECT id FROM users WHERE username = ?').get(replaces);
      if (old) {
        prepare('UPDATE users SET username = ?, email = ?, password_hash = ?, password_salt = ?, role = ? WHERE id = ?')
          .run(username, email, hash, salt, role, old.id);
        console.log(`[AUTH] Moved ${role} account "${replaces}" to "${username}"`);
        return;
      }
      prepare('INSERT INTO users (username, email, password_hash, password_salt, role) VALUES (?, ?, ?, ?, ?)')
        .run(username, email, hash, salt, role);
      console.log(`[AUTH] Created ${role} account "${username}"`);
    });
  };

  const findUser = (id) => prepare('SELECT * FROM users WHERE id = ?').get(id);

  const dropSessionsFor = (userId, keepToken) => {
    for (const [token, s] of sessions) if (s.userId === userId && token !== keepToken) sessions.delete(token);
  };

  // Guards against licences being stretched by winding the PC clock back:
  // remembers the latest time seen and refuses user logins if "now" falls well behind it.
  const clockRolledBack = () => {
    const row = prepare("SELECT value FROM app_settings WHERE key = 'auth_clock'").get();
    const seen = row ? Number(row.value) || 0 : 0;
    const now = Date.now();
    if (now > seen) {
      prepare(
        "INSERT INTO app_settings (key, value, updated_at) VALUES ('auth_clock', ?, CURRENT_TIMESTAMP) " +
        'ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
      ).run(String(now));
      return false;
    }
    return seen - now > CLOCK_TOLERANCE_MS;
  };

  // Why this user may not use the app right now (null = allowed)
  const accessBlock = (user) => {
    if (user.role === 'admin') return null;
    const status = licenceStatus(user);
    if (LOGIN_BLOCKS[status]) return LOGIN_BLOCKS[status];
    if (clockRolledBack()) {
      return { code: 'CLOCK_TAMPERED', error: 'System date/time looks incorrect. Please correct it or contact admin.' };
    }
    return null;
  };

  const requireAuth = (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const session = token && sessions.get(token);
    const user = session && findUser(session.userId);
    if (!user) return res.status(401).json({ success: false, code: 'SESSION_EXPIRED', error: 'Session expired. Please sign in again.' });
    const block = accessBlock(user);
    if (block) {
      sessions.delete(token);
      return res.status(403).json({ success: false, ...block });
    }
    req.user = user;
    req.token = token;
    next();
  };

  const requireAdmin = (req, res, next) => requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Admin access required' });
    next();
  });

  const fail = (res, status, error) => res.status(status).json({ success: false, error });
  const wrap = (fn) => (req, res) => {
    try { fn(req, res); } catch (err) { res.status(500).json({ success: false, error: err.message }); }
  };

  // ── Session ────────────────────────────────────────────────────────────────
  app.post('/api/auth/login', wrap((req, res) => {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    // Sign in with the username or the account's email (the admin uses an email address)
    const user = prepare('SELECT * FROM users WHERE username = ? OR (email != \'\' AND LOWER(email) = ?)').get(username, username);
    if (!user || !verifyPassword(password, user)) return fail(res, 401, 'Invalid username or password');

    const block = accessBlock(user);
    if (block) return res.status(403).json({ success: false, ...block });

    // OTP (admin): once email delivery is integrated, issue + verify a one-time code here before creating the session.

    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { userId: user.id });
    prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    res.json({ success: true, data: { token, user: publicUser(findUser(user.id)) } });
  }));

  app.post('/api/auth/logout', (req, res) => {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    sessions.delete(token);
    res.json({ success: true });
  });

  // Called on start-up and periodically by the client — this is what signs a user out when their licence runs out
  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ success: true, data: publicUser(req.user) });
  });

  app.post('/api/auth/change-password', requireAuth, wrap((req, res) => {
    const { currentPassword = '', newPassword = '' } = req.body;
    if (!verifyPassword(currentPassword, req.user)) return fail(res, 400, 'Current password is incorrect');
    if (String(newPassword).length < MIN_PASSWORD) return fail(res, 400, `New password must be at least ${MIN_PASSWORD} characters`);
    if (newPassword === currentPassword) return fail(res, 400, 'New password must be different from the current one');
    const { hash, salt } = hashPassword(newPassword);
    prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, req.user.id);
    dropSessionsFor(req.user.id, req.token); // sign out any other open sessions
    res.json({ success: true });
  }));

  app.put('/api/auth/profile', requireAuth, wrap((req, res) => {
    const email = String(req.body.email || '').trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(res, 400, 'Enter a valid email address');
    prepare('UPDATE users SET email = ? WHERE id = ?').run(email, req.user.id);
    res.json({ success: true, data: publicUser(findUser(req.user.id)) });
  }));

  // ── Admin: user + licence management ───────────────────────────────────────
  app.get('/api/admin/users', requireAdmin, wrap((req, res) => {
    const rows = prepare("SELECT * FROM users ORDER BY role = 'admin' DESC, username").all();
    res.json({ success: true, data: rows.map(publicUser) });
  }));

  app.post('/api/admin/users', requireAdmin, wrap((req, res) => {
    const username = String(req.body.username || '').trim().toLowerCase();
    const { password = '', licenseExpires = null } = req.body;
    if (!USERNAME_RE.test(username)) return fail(res, 400, 'Username must be 3–30 characters: letters, numbers, . _ -');
    if (String(password).length < MIN_PASSWORD) return fail(res, 400, `Password must be at least ${MIN_PASSWORD} characters`);
    if (licenseExpires && !isValidDate(licenseExpires)) return fail(res, 400, 'Invalid licence expiry date');
    if (prepare('SELECT id FROM users WHERE username = ?').get(username)) return fail(res, 400, `Username "${username}" already exists`);
    const { hash, salt } = hashPassword(password);
    prepare(
      "INSERT INTO users (username, password_hash, password_salt, role, license_start, license_expires) VALUES (?, ?, ?, 'user', ?, ?)"
    ).run(username, hash, salt, licenseExpires ? todayStr() : null, licenseExpires || null);
    // Look up by username — sql.js loses last_insert_rowid once the DB has been saved to disk
    res.json({ success: true, data: publicUser(prepare('SELECT * FROM users WHERE username = ?').get(username)) });
  }));

  const loadTarget = (req, res) => {
    const user = findUser(Number(req.params.id));
    if (!user) { fail(res, 404, 'User not found'); return null; }
    return user;
  };

  // expires: 'YYYY-MM-DD' to grant/extend, null to revoke
  app.put('/api/admin/users/:id/license', requireAdmin, wrap((req, res) => {
    const user = loadTarget(req, res); if (!user) return;
    if (user.role === 'admin') return fail(res, 400, 'Admin does not need a licence');
    const { expires = null } = req.body;
    if (expires !== null && !isValidDate(expires)) return fail(res, 400, 'Invalid licence expiry date');
    if (expires !== null && expires < todayStr()) return fail(res, 400, 'Expiry date cannot be in the past');
    prepare('UPDATE users SET license_start = ?, license_expires = ? WHERE id = ?')
      .run(expires ? todayStr() : null, expires, user.id);
    res.json({ success: true, data: publicUser(findUser(user.id)) });
  }));

  app.put('/api/admin/users/:id/status', requireAdmin, wrap((req, res) => {
    const user = loadTarget(req, res); if (!user) return;
    if (user.role === 'admin') return fail(res, 400, 'The admin account cannot be disabled');
    const active = req.body.active ? 1 : 0;
    prepare('UPDATE users SET active = ? WHERE id = ?').run(active, user.id);
    res.json({ success: true, data: publicUser(findUser(user.id)) });
  }));

  app.post('/api/admin/users/:id/reset-password', requireAdmin, wrap((req, res) => {
    const user = loadTarget(req, res); if (!user) return;
    const { newPassword = '' } = req.body;
    if (String(newPassword).length < MIN_PASSWORD) return fail(res, 400, `Password must be at least ${MIN_PASSWORD} characters`);
    const { hash, salt } = hashPassword(newPassword);
    prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, user.id);
    dropSessionsFor(user.id, req.token);
    res.json({ success: true });
  }));

  app.delete('/api/admin/users/:id', requireAdmin, wrap((req, res) => {
    const user = loadTarget(req, res); if (!user) return;
    if (user.role === 'admin') return fail(res, 400, 'The admin account cannot be deleted');
    prepare('DELETE FROM users WHERE id = ?').run(user.id);
    dropSessionsFor(user.id);
    res.json({ success: true });
  }));

  return { init, requireAuth, requireAdmin };
};
