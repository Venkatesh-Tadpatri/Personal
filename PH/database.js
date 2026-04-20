// const Database = require('better-sqlite3');
// const path = require('path');
// const os = require('os');
// const fs = require('fs');

// const dbDir = path.join(os.homedir(), 'AgriTrader');
// if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// const dbPath = path.join(dbDir, 'agritrader.db');
// const db = new Database(dbPath);

// db.pragma('journal_mode = WAL');
// db.pragma('foreign_keys = ON');

// // Create tables if not exist
// db.exec(`
//   CREATE TABLE IF NOT EXISTS sellers (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     serial_number TEXT NOT NULL,
//     name TEXT NOT NULL,
//     mobile TEXT NOT NULL,
//     material TEXT NOT NULL,
//     num_bags INTEGER NOT NULL,
//     lot_number TEXT NOT NULL,
//     weight REAL NOT NULL,
//     advance_amount REAL DEFAULT 0,
//     rate_fixed REAL DEFAULT 0,
//     amount REAL DEFAULT 0,
//     bag_data TEXT DEFAULT '[]',
//     entry_date TEXT NOT NULL,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//   );

//   CREATE TABLE IF NOT EXISTS buyers (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     serial_number TEXT NOT NULL,
//     name TEXT NOT NULL,
//     mobile TEXT NOT NULL,
//     material TEXT NOT NULL,
//     num_bags INTEGER NOT NULL,
//     lot_number TEXT NOT NULL,
//     weight REAL NOT NULL,
//     advance_amount REAL DEFAULT 0,
//     rate_fixed REAL DEFAULT 0,
//     amount REAL DEFAULT 0,
//     bag_data TEXT DEFAULT '[]',
//     entry_date TEXT NOT NULL,
//     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//   );
// `);

// // Auto-migration: add bag_data column to existing DBs that don't have it
// ['sellers', 'buyers'].forEach(table => {
//   const cols = db.pragma(`table_info(${table})`).map(c => c.name);
//   if (!cols.includes('bag_data')) {
//     db.exec(`ALTER TABLE ${table} ADD COLUMN bag_data TEXT DEFAULT '[]'`);
//     console.log(`[DB] Migrated: added bag_data to ${table}`);
//   }
//   if (!cols.includes('rate_fixed')) {
//     db.exec(`ALTER TABLE ${table} ADD COLUMN rate_fixed REAL DEFAULT 0`);
//     console.log(`[DB] Migrated: added rate_fixed to ${table}`);
//   }
//   if (!cols.includes('amount')) {
//     db.exec(`ALTER TABLE ${table} ADD COLUMN amount REAL DEFAULT 0`);
//     console.log(`[DB] Migrated: added amount to ${table}`);
//   }
// });

// module.exports = db;



const path = require('path');
const os = require('os');
const fs = require('fs');
const initSqlJs = require('sql.js');

const dbDir = path.join(os.homedir(), 'AgriTrader');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'agritrader.db');

let db;

function saveDb() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS sellers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_number TEXT NOT NULL,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      material TEXT NOT NULL,
      num_bags INTEGER NOT NULL,
      lot_number TEXT NOT NULL,
      weight REAL NOT NULL,
      advance_amount REAL DEFAULT 0,
      rate_fixed REAL DEFAULT 0,
      amount REAL DEFAULT 0,
      bag_data TEXT DEFAULT '[]',
      entry_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS buyers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_number TEXT NOT NULL,
      name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      material TEXT NOT NULL,
      num_bags INTEGER NOT NULL,
      lot_number TEXT NOT NULL,
      weight REAL NOT NULL,
      advance_amount REAL DEFAULT 0,
      rate_fixed REAL DEFAULT 0,
      amount REAL DEFAULT 0,
      bag_data TEXT DEFAULT '[]',
      entry_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Auto-migration
  ['sellers', 'buyers'].forEach(table => {
    try { db.run(`ALTER TABLE ${table} ADD COLUMN bag_data TEXT DEFAULT '[]'`); } catch {}
    try { db.run(`ALTER TABLE ${table} ADD COLUMN rate_fixed REAL DEFAULT 0`); } catch {}
    try { db.run(`ALTER TABLE ${table} ADD COLUMN amount REAL DEFAULT 0`); } catch {}
  });

  saveDb();
  console.log('[DB] Initialized at', dbPath);
}

// ── sql.js query helpers to match better-sqlite3 API ─────────────────────────

function all(sql, ...params) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } catch (e) {
    throw new Error(e.message);
  }
}

function get(sql, ...params) {
  const rows = all(sql, ...params);
  return rows[0] || null;
}

function run(sql, ...params) {
  db.run(sql, params);
  saveDb();
  const lastId = db.exec('SELECT last_insert_rowid() as id')[0];
  const lastInsertRowid = lastId ? lastId.values[0][0] : null;
  return { lastInsertRowid, changes: db.getRowsModified() };
}

// ── Expose a prepare()-like interface matching better-sqlite3 ─────────────────

function prepare(sql) {
  return {
    all: (...params) => all(sql, ...params),
    get: (...params) => get(sql, ...params),
    run: (...params) => run(sql, ...params),
  };
}

module.exports = { prepare, initDb };