// const express = require('express');
// const cors = require('cors');
// const db = require('./database');

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type'] }));
// app.use(express.json());

// // ── Startup: show DB contents ──────────────────────────────
// try {
//   const rows = db.prepare('SELECT id, name, serial_number, num_bags, weight, bag_data FROM sellers').all();
//   console.log('\n=== DB SELLERS ON STARTUP ===');
//   rows.forEach(s => {
//     let bags = [];
//     try { bags = JSON.parse(s.bag_data || '[]'); } catch {}
//     const weights = bags.map(b => b.weight).join(', ') || 'NONE';
//     console.log(`  ${s.name} | serial:${s.serial_number} | ${s.num_bags} bags | total:${s.weight}kg | bag_weights: ${weights}`);
//   });
//   console.log('=============================\n');
// } catch (e) {
//   console.log('[startup] DB check error:', e.message);
// }

// // ── Health ─────────────────────────────────────────────────
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// // ── Debug: raw seller data ─────────────────────────────────
// app.get('/api/debug/sellers', (req, res) => {
//   const rows = db.prepare('SELECT id, name, serial_number, num_bags, weight, bag_data, entry_date FROM sellers ORDER BY created_at DESC').all();
//   res.json(rows);
// });

// // ══════════════════════════════════════════════════════════
// // SELLERS
// // ══════════════════════════════════════════════════════════

// // GET all sellers
// app.get('/api/sellers', (req, res) => {
//   try {
//     const { date } = req.query;
//     const sellers = date
//       ? db.prepare('SELECT * FROM sellers WHERE entry_date = ? ORDER BY created_at DESC').all(date)
//       : db.prepare('SELECT * FROM sellers ORDER BY created_at DESC').all();
//     res.json({ success: true, data: sellers });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // GET single seller
// app.get('/api/sellers/:id', (req, res) => {
//   try {
//     const seller = db.prepare('SELECT * FROM sellers WHERE id = ?').get(req.params.id);
//     if (!seller) return res.status(404).json({ success: false, error: 'Not found' });
//     res.json({ success: true, data: seller });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // POST create seller
// app.post('/api/sellers', (req, res) => {
//   try {
//     const {
//       serial_number, name, mobile, material,
//       num_bags, lot_number, weight, advance_amount,
//       entry_date, bag_data
//     } = req.body;

//     console.log('[POST /api/sellers]', name, '| bag_data:', bag_data);

//     // Duplicate serial check per day
//     const exists = db.prepare('SELECT id FROM sellers WHERE serial_number = ? AND entry_date = ?').get(serial_number, entry_date);
//     if (exists) {
//       return res.status(400).json({ success: false, error: `Serial number ${serial_number} already used on ${entry_date}.` });
//     }

//     // Validate and clean bag_data
//     let bagDataStr = '[]';
//     try {
//       const parsed = typeof bag_data === 'string' ? JSON.parse(bag_data) : (Array.isArray(bag_data) ? bag_data : []);
//       console.log('[POST] bag_data parsed weights:', parsed.map(b => b.weight).join(', '));
//       bagDataStr = JSON.stringify(parsed);
//     } catch (e) {
//       console.error('[POST] bag_data parse error:', e.message);
//     }

//     const result = db.prepare(`
//       INSERT INTO sellers (serial_number, name, mobile, material, num_bags, lot_number, weight, advance_amount, bag_data, entry_date)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `).run(
//       serial_number,
//       name.toUpperCase(),
//       mobile || '0000000000',
//       (material || 'GENERAL').toUpperCase(),
//       num_bags,
//       lot_number,
//       weight,
//       advance_amount || 0,
//       bagDataStr,
//       entry_date
//     );

//     console.log('[POST] Inserted id:', result.lastInsertRowid, '| bag_data stored:', bagDataStr);
//     res.json({ success: true, id: result.lastInsertRowid });
//   } catch (err) {
//     console.error('[POST /api/sellers] error:', err.message);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // PUT update seller
// app.put('/api/sellers/:id', (req, res) => {
//   try {
//     const body = req.body;
//     const fields = [];
//     const values = [];

//     const allowed = ['serial_number','name','mobile','material','num_bags','lot_number','weight','advance_amount','rate_fixed','amount','bag_data','entry_date'];
//     allowed.forEach(f => {
//       if (body[f] !== undefined) {
//         fields.push(`${f} = ?`);
//         if (f === 'name')     values.push(body[f].toUpperCase());
//         else if (f === 'material') values.push((body[f] || 'GENERAL').toUpperCase());
//         else values.push(body[f]);
//       }
//     });

//     if (!fields.length) return res.status(400).json({ success: false, error: 'No fields to update' });

//     values.push(req.params.id);
//     db.prepare(`UPDATE sellers SET ${fields.join(', ')} WHERE id = ?`).run(...values);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // DELETE seller
// app.delete('/api/sellers/:id', (req, res) => {
//   try {
//     db.prepare('DELETE FROM sellers WHERE id = ?').run(req.params.id);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // ══════════════════════════════════════════════════════════
// // BUYERS
// // ══════════════════════════════════════════════════════════

// app.get('/api/buyers', (req, res) => {
//   try {
//     const { date } = req.query;
//     const buyers = date
//       ? db.prepare('SELECT * FROM buyers WHERE entry_date = ? ORDER BY created_at DESC').all(date)
//       : db.prepare('SELECT * FROM buyers ORDER BY created_at DESC').all();
//     res.json({ success: true, data: buyers });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// app.get('/api/buyers/:id', (req, res) => {
//   try {
//     const buyer = db.prepare('SELECT * FROM buyers WHERE id = ?').get(req.params.id);
//     if (!buyer) return res.status(404).json({ success: false, error: 'Not found' });
//     res.json({ success: true, data: buyer });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// app.post('/api/buyers', (req, res) => {
//   try {
//     const {
//       serial_number, name, mobile, material,
//       num_bags, lot_number, weight, advance_amount,
//       entry_date, bag_data
//     } = req.body;

//     const exists = db.prepare('SELECT id FROM buyers WHERE serial_number = ? AND entry_date = ?').get(serial_number, entry_date);
//     if (exists) {
//       return res.status(400).json({ success: false, error: `Serial number ${serial_number} already used on ${entry_date}.` });
//     }

//     let bagDataStr = '[]';
//     try {
//       const parsed = typeof bag_data === 'string' ? JSON.parse(bag_data) : (Array.isArray(bag_data) ? bag_data : []);
//       bagDataStr = JSON.stringify(parsed);
//     } catch (e) {}

//     const result = db.prepare(`
//       INSERT INTO buyers (serial_number, name, mobile, material, num_bags, lot_number, weight, advance_amount, bag_data, entry_date)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `).run(
//       serial_number,
//       name.toUpperCase(),
//       mobile || '0000000000',
//       (material || 'GENERAL').toUpperCase(),
//       num_bags,
//       lot_number,
//       weight,
//       advance_amount || 0,
//       bagDataStr,
//       entry_date
//     );

//     res.json({ success: true, id: result.lastInsertRowid });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// app.put('/api/buyers/:id', (req, res) => {
//   try {
//     const body = req.body;
//     const fields = [];
//     const values = [];

//     const allowed = ['serial_number','name','mobile','material','num_bags','lot_number','weight','advance_amount','rate_fixed','amount','bag_data','entry_date'];
//     allowed.forEach(f => {
//       if (body[f] !== undefined) {
//         fields.push(`${f} = ?`);
//         if (f === 'name')     values.push(body[f].toUpperCase());
//         else if (f === 'material') values.push((body[f] || 'GENERAL').toUpperCase());
//         else values.push(body[f]);
//       }
//     });

//     if (!fields.length) return res.status(400).json({ success: false, error: 'No fields to update' });

//     values.push(req.params.id);
//     db.prepare(`UPDATE buyers SET ${fields.join(', ')} WHERE id = ?`).run(...values);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// app.delete('/api/buyers/:id', (req, res) => {
//   try {
//     db.prepare('DELETE FROM buyers WHERE id = ?').run(req.params.id);
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // ══════════════════════════════════════════════════════════
// // SUMMARY
// // ══════════════════════════════════════════════════════════

// app.get('/api/summary', (req, res) => {
//   try {
//     const { date } = req.query;
//     const where = date ? 'WHERE entry_date = ?' : '';
//     const params = date ? [date] : [];

//     const sellerStats = db.prepare(`
//       SELECT COUNT(*) as total_sellers, SUM(num_bags) as total_bags,
//              SUM(weight) as total_weight, SUM(advance_amount) as total_advance,
//              SUM(amount) as total_amount
//       FROM sellers ${where}
//     `).get(...params);

//     const buyerStats = db.prepare(`
//       SELECT COUNT(*) as total_buyers, SUM(num_bags) as total_bags,
//              SUM(weight) as total_weight, SUM(advance_amount) as total_advance,
//              SUM(amount) as total_amount
//       FROM buyers ${where}
//     `).get(...params);

//     const materialBreakdown = db.prepare(`
//       SELECT material, COUNT(*) as count, SUM(num_bags) as bags, SUM(weight) as weight
//       FROM sellers ${where}
//       GROUP BY material
//     `).all(...params);

//     res.json({ success: true, data: { sellerStats, buyerStats, materialBreakdown } });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// // ── Start ──────────────────────────────────────────────────
// const server = app.listen(PORT, '127.0.0.1', () => {
//   console.log(`✅ ph server running on http://127.0.0.1:${PORT}`);
// });

// process.on('SIGTERM', () => server.close(() => process.exit(0)));
// process.on('SIGINT',  () => server.close(() => process.exit(0)));


const express = require('express');
const cors = require('cors');
const { prepare, initDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// ── Auth: accounts, licences, admin API (see auth.js) ─────────────────────────
const auth = require('./auth')(app, prepare, {
  // Created on first run only — passwords can then be changed from the app
  seedUsers: [
    // Admin signs in with this email; replaces the original "admin" login on existing installs
    { username: 'venkateshtadpatri26@gmail.com', email: 'venkateshtadpatri26@gmail.com', password: 'Venku@308415', role: 'admin', replaces: 'admin' },
    { username: 'pramod', password: 'ph@1234',   role: 'user'  },
  ],
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Debug ─────────────────────────────────────────────────────────────────────
app.get('/api/debug/sellers', (req, res) => {
  const rows = prepare('SELECT id, name, serial_number, num_bags, weight, bag_data, entry_date FROM sellers ORDER BY created_at DESC').all();
  res.json(rows);
});

// ══════════════════════════════════════════════════════════════════════════════
// SELLERS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/sellers', (req, res) => {
  try {
    const { date } = req.query;
    const sellers = date
      ? prepare('SELECT * FROM sellers WHERE entry_date = ? ORDER BY created_at DESC').all(date)
      : prepare('SELECT * FROM sellers ORDER BY created_at DESC').all();
    res.json({ success: true, data: sellers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/sellers/:id', (req, res) => {
  try {
    const seller = prepare('SELECT * FROM sellers WHERE id = ?').get(req.params.id);
    if (!seller) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: seller });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sellers', (req, res) => {
  try {
    const {
      name, mobile, material,
      num_bags, weight, advance_amount,
      entry_date, bag_data
    } = req.body;

    const materialName = (material || 'GENERAL').toUpperCase();

    // Serial number is auto-assigned: next number for this material on this date
    const last = prepare('SELECT MAX(CAST(serial_number AS INTEGER)) AS max_serial FROM sellers WHERE material = ? AND entry_date = ?').get(materialName, entry_date);
    const serial_number = String((Number(last && last.max_serial) || 0) + 1);
    const lot_number = `${serial_number}/${num_bags}`;

    console.log('[POST /api/sellers]', name, '| material:', materialName, '| serial:', serial_number, '| bag_data:', bag_data);

    let bagDataStr = '[]';
    try {
      const parsed = typeof bag_data === 'string' ? JSON.parse(bag_data) : (Array.isArray(bag_data) ? bag_data : []);
      bagDataStr = JSON.stringify(parsed.map(b => ({ ...b, lot: lot_number })));
    } catch (e) {}

    // Commission % and labour ₹/bag come from the material's settings, saved on the seller as a snapshot
    const rates = readMaterials().find(m => m.name === materialName)
      || { commission: DEFAULT_COMMISSION, labour: DEFAULT_LABOUR };

    const result = prepare(`
      INSERT INTO sellers (serial_number, name, mobile, material, num_bags, lot_number, weight, advance_amount, bag_data, entry_date, labour_rate, commission_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      serial_number,
      name.toUpperCase(),
      mobile || '0000000000',
      materialName,
      num_bags,
      lot_number,
      weight,
      advance_amount || 0,
      bagDataStr,
      entry_date,
      rates.labour,
      rates.commission
    );

    // Bill number is issued at registration (format from Settings → Bill Number)
    const bill_no = assignBillNo(result.lastInsertRowid);

    res.json({ success: true, id: result.lastInsertRowid, serial_number, lot_number, bill_no, labour_rate: rates.labour, commission_rate: rates.commission });
  } catch (err) {
    console.error('[POST /api/sellers] error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/sellers/:id', (req, res) => {
  try {
    const body = req.body;
    const fields = [];
    const values = [];

    const allowed = ['serial_number','name','mobile','material','num_bags','lot_number','weight','advance_amount','labour_rate','commission_rate','rate_fixed','amount','bag_data','entry_date'];
    allowed.forEach(f => {
      if (body[f] !== undefined) {
        fields.push(`${f} = ?`);
        if (f === 'name') values.push(body[f].toUpperCase());
        else if (f === 'material') values.push((body[f] || 'GENERAL').toUpperCase());
        else values.push(body[f]);
      }
    });

    if (!fields.length) return res.status(400).json({ success: false, error: 'No fields to update' });

    values.push(req.params.id);
    prepare(`UPDATE sellers SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/sellers/:id', (req, res) => {
  try {
    prepare('DELETE FROM sellers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// BUYERS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/buyers', (req, res) => {
  try {
    const { date } = req.query;
    const buyers = date
      ? prepare('SELECT * FROM buyers WHERE entry_date = ? ORDER BY created_at DESC').all(date)
      : prepare('SELECT * FROM buyers ORDER BY created_at DESC').all();
    res.json({ success: true, data: buyers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/buyers/:id', (req, res) => {
  try {
    const buyer = prepare('SELECT * FROM buyers WHERE id = ?').get(req.params.id);
    if (!buyer) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: buyer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/buyers', (req, res) => {
  try {
    const {
      serial_number, name, mobile, material,
      num_bags, lot_number, weight, advance_amount, labour_rate,
      entry_date, bag_data
    } = req.body;

    const materialName = (material || 'GENERAL').toUpperCase();

    const exists = prepare('SELECT id FROM buyers WHERE serial_number = ? AND material = ? AND entry_date = ?').get(serial_number, materialName, entry_date);
    if (exists) {
      return res.status(400).json({ success: false, error: `Serial number ${serial_number} already used for ${materialName} on ${entry_date}.` });
    }

    let bagDataStr = '[]';
    try {
      const parsed = typeof bag_data === 'string' ? JSON.parse(bag_data) : (Array.isArray(bag_data) ? bag_data : []);
      bagDataStr = JSON.stringify(parsed);
    } catch (e) {}

    const result = prepare(`
      INSERT INTO buyers (serial_number, name, mobile, material, num_bags, lot_number, weight, advance_amount, labour_rate, bag_data, entry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      serial_number,
      name.toUpperCase(),
      mobile || '0000000000',
      materialName,
      num_bags,
      lot_number,
      weight,
      advance_amount || 0,
      labour_rate || 5,
      bagDataStr,
      entry_date
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/buyers/:id', (req, res) => {
  try {
    const body = req.body;
    const fields = [];
    const values = [];

    const allowed = ['serial_number','name','mobile','material','num_bags','lot_number','weight','advance_amount','labour_rate','rate_fixed','amount','extra_bags','extra_bag_amount','bag_data','entry_date'];
    allowed.forEach(f => {
      if (body[f] !== undefined) {
        fields.push(`${f} = ?`);
        if (f === 'name') values.push(body[f].toUpperCase());
        else if (f === 'material') values.push((body[f] || 'GENERAL').toUpperCase());
        else values.push(body[f]);
      }
    });

    if (!fields.length) return res.status(400).json({ success: false, error: 'No fields to update' });

    values.push(req.params.id);
    prepare(`UPDATE buyers SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/buyers/:id', (req, res) => {
  try {
    prepare('DELETE FROM buyers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Buyer Ledger groups every `buyers` row (one per registration/visit) under a single
// display key (short name if set, else full name), so removing "a buyer" from that ledger
// means clearing every row under that key — plus their payments and old dues, which are
// tied by the same key — not just one row. Purchase history embedded in sellers' bag_data
// is left untouched; it's the seller's own sale record, not the buyer's.
app.delete('/api/buyers/by-key/:key', (req, res) => {
  try {
    const key = req.params.key.toUpperCase();
    // Mirrors the client's key derivation: short name (lot_number) if set and not the
    // placeholder '—', otherwise the full name.
    prepare(`DELETE FROM buyers WHERE
      (lot_number IS NOT NULL AND lot_number != '' AND lot_number != '—' AND UPPER(lot_number) = ?)
      OR ((lot_number IS NULL OR lot_number = '' OR lot_number = '—') AND UPPER(name) = ?)`)
      .run(key, key);
    prepare('DELETE FROM buyer_payments WHERE UPPER(buyer_name) = ?').run(key);
    prepare('DELETE FROM buyer_dues WHERE UPPER(buyer_name) = ?').run(key);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/summary', (req, res) => {
  try {
    const { date } = req.query;
    const where = date ? 'WHERE entry_date = ?' : '';
    const params = date ? [date] : [];

    const sellerStats = prepare(`
      SELECT COUNT(*) as total_sellers, SUM(num_bags) as total_bags,
             SUM(weight) as total_weight, SUM(advance_amount) as total_advance,
             SUM(amount) as total_amount
      FROM sellers ${where}
    `).get(...params);

    const buyerStats = prepare(`
      SELECT COUNT(*) as total_buyers, SUM(num_bags) as total_bags,
             SUM(weight) as total_weight, SUM(advance_amount) as total_advance,
             SUM(amount) as total_amount
      FROM buyers ${where}
    `).get(...params);

    const materialBreakdown = prepare(`
      SELECT material, COUNT(*) as count, SUM(num_bags) as bags, SUM(weight) as weight
      FROM sellers ${where}
      GROUP BY material
    `).all(...params);

    res.json({ success: true, data: { sellerStats, buyerStats, materialBreakdown } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// BUYER PAYMENTS
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/buyer-payments', (req, res) => {
  try {
    const { buyer_name } = req.query;
    const payments = buyer_name
      ? prepare('SELECT * FROM buyer_payments WHERE buyer_name = ? ORDER BY payment_date DESC, created_at DESC').all(buyer_name)
      : prepare('SELECT * FROM buyer_payments ORDER BY payment_date DESC, created_at DESC').all();
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/buyer-payments', (req, res) => {
  try {
    const { buyer_name, amount, payment_date, note, bill_date, bill_material, due_id } = req.body;
    if (!buyer_name || !amount || !payment_date) {
      return res.status(400).json({ success: false, error: 'buyer_name, amount, payment_date are required' });
    }
    const result = prepare(
      'INSERT INTO buyer_payments (buyer_name, amount, payment_date, note, bill_date, bill_material, due_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(buyer_name.toUpperCase(), Number(amount), payment_date, note || '', bill_date || null, bill_material || null, due_id || null);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/buyer-payments/:id', (req, res) => {
  try {
    const { amount, payment_date, note } = req.body;
    prepare('UPDATE buyer_payments SET amount = ?, payment_date = ?, note = ? WHERE id = ?')
      .run(Number(amount), payment_date, note || '', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/buyer-payments/:id', (req, res) => {
  try {
    prepare('DELETE FROM buyer_payments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// BUYER OLD DUES (manual opening-balance entries carried over from before this system)
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/buyer-dues', (req, res) => {
  try {
    const { buyer_name } = req.query;
    const dues = buyer_name
      ? prepare('SELECT * FROM buyer_dues WHERE buyer_name = ? ORDER BY due_date DESC, created_at DESC').all(buyer_name)
      : prepare('SELECT * FROM buyer_dues ORDER BY due_date DESC, created_at DESC').all();
    res.json({ success: true, data: dues });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/buyer-dues', (req, res) => {
  try {
    const { buyer_name, amount, due_date, note } = req.body;
    if (!buyer_name || !amount || !due_date) {
      return res.status(400).json({ success: false, error: 'buyer_name, amount, due_date are required' });
    }
    const result = prepare(
      'INSERT INTO buyer_dues (buyer_name, amount, due_date, note) VALUES (?, ?, ?, ?)'
    ).run(buyer_name.toUpperCase(), Number(amount), due_date, note || '');
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/buyer-dues/:id', (req, res) => {
  try {
    const { amount, due_date, note } = req.body;
    prepare('UPDATE buyer_dues SET amount = ?, due_date = ?, note = ? WHERE id = ?')
      .run(Number(amount), due_date, note || '', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/buyer-dues/:id', (req, res) => {
  try {
    prepare('DELETE FROM buyer_dues WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS — configurable material list (used by every material picklist)
// ══════════════════════════════════════════════════════════════════════════════

// Each material carries the seller commission (%) and labour charge (₹ per bag) applied at registration
const DEFAULT_COMMISSION = 8;
const DEFAULT_LABOUR     = 20;
const DEFAULT_MATERIALS  = ['TAMARIND', 'GINGER', 'ONION', 'LEMONS', 'OTHERS']
  .map(name => ({ name, commission: DEFAULT_COMMISSION, labour: DEFAULT_LABOUR }));

// Accepts a plain name (lists saved before rates existed) or { name, commission, labour }
const toMaterial = (m) => {
  const obj = typeof m === 'object' && m !== null ? m : { name: m };
  const num = (v, d) => (v === '' || v === null || v === undefined || isNaN(Number(v)) ? d : Number(v));
  return {
    name:       String(obj.name || '').trim().toUpperCase(),
    commission: num(obj.commission, DEFAULT_COMMISSION),
    labour:     num(obj.labour, DEFAULT_LABOUR),
  };
};

const readMaterials = () => {
  const row = prepare("SELECT value FROM app_settings WHERE key = 'materials'").get();
  if (!row) return DEFAULT_MATERIALS;
  try {
    const list = JSON.parse(row.value);
    return Array.isArray(list) && list.length ? list.map(toMaterial) : DEFAULT_MATERIALS;
  } catch { return DEFAULT_MATERIALS; }
};

app.get('/api/settings/materials', (req, res) => {
  try {
    res.json({ success: true, data: readMaterials() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/settings/materials', (req, res) => {
  try {
    const { materials } = req.body;
    if (!Array.isArray(materials)) return res.status(400).json({ success: false, error: 'materials must be a list' });
    const cleaned = [];
    materials.map(toMaterial).forEach(m => {
      if (m.name && !cleaned.some(c => c.name === m.name)) cleaned.push(m);
    });
    if (!cleaned.length) return res.status(400).json({ success: false, error: 'Keep at least one material' });
    // Guards against a client sending objects to a server that expects names (seen as "[object Object]")
    if (cleaned.some(m => m.name === '[OBJECT OBJECT]')) return res.status(400).json({ success: false, error: 'Invalid material name' });
    if (cleaned.some(m => m.name.length > 30)) return res.status(400).json({ success: false, error: 'Material names must be 30 characters or less' });
    const badCommission = cleaned.find(m => m.commission < 0 || m.commission > 100);
    if (badCommission) return res.status(400).json({ success: false, error: `Commission for ${badCommission.name} must be between 0 and 100%` });
    const badLabour = cleaned.find(m => m.labour < 0);
    if (badLabour) return res.status(400).json({ success: false, error: `Labour charge for ${badLabour.name} can't be negative` });
    prepare(
      "INSERT INTO app_settings (key, value, updated_at) VALUES ('materials', ?, CURRENT_TIMESTAMP) " +
      'ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
    ).run(JSON.stringify(cleaned));
    res.json({ success: true, data: cleaned });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS — seller bill numbering (prefix + zero-padded counter + suffix)
// ══════════════════════════════════════════════════════════════════════════════

const DEFAULT_BILL_CONFIG = { prefix: '', suffix: '', start: 1, digits: 1, next: 1 };

const readBillConfig = () => {
  const row = prepare("SELECT value FROM app_settings WHERE key = 'bill_number'").get();
  if (!row) return { ...DEFAULT_BILL_CONFIG };
  try { return { ...DEFAULT_BILL_CONFIG, ...JSON.parse(row.value) }; } catch { return { ...DEFAULT_BILL_CONFIG }; }
};

const writeBillConfig = (cfg) => prepare(
  "INSERT INTO app_settings (key, value, updated_at) VALUES ('bill_number', ?, CURRENT_TIMESTAMP) " +
  'ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP'
).run(JSON.stringify(cfg));

const formatBillNo = (cfg, n) => `${cfg.prefix}${String(n).padStart(cfg.digits, '0')}${cfg.suffix}`;

// Issues the next bill number to a seller once; later calls return the same number.
// Skips any number already used so a counter reset can never create duplicates.
const assignBillNo = (sellerId) => {
  const seller = prepare('SELECT id, bill_no FROM sellers WHERE id = ?').get(sellerId);
  if (!seller) return null;
  if (seller.bill_no) return seller.bill_no;
  const cfg = readBillConfig();
  let n = cfg.next;
  let billNo = formatBillNo(cfg, n);
  while (prepare('SELECT id FROM sellers WHERE bill_no = ?').get(billNo)) {
    n += 1;
    billNo = formatBillNo(cfg, n);
  }
  prepare('UPDATE sellers SET bill_no = ? WHERE id = ?').run(billNo, sellerId);
  writeBillConfig({ ...cfg, next: n + 1 });
  return billNo;
};

const billConfigResponse = (cfg) => {
  const issued = prepare('SELECT COUNT(*) AS c FROM sellers WHERE bill_no IS NOT NULL').get();
  return { ...cfg, nextBillNo: formatBillNo(cfg, cfg.next), issued: Number(issued && issued.c) || 0 };
};

app.get('/api/settings/bill-number', (req, res) => {
  try {
    res.json({ success: true, data: billConfigResponse(readBillConfig()) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/settings/bill-number', (req, res) => {
  try {
    const { prefix = '', suffix = '', start, digits, resetCounter } = req.body;
    const startN = Number(start), digitsN = Number(digits);
    if (!Number.isInteger(startN) || startN < 0) return res.status(400).json({ success: false, error: 'Starting number must be a whole number' });
    if (!Number.isInteger(digitsN) || digitsN < 1 || digitsN > 10) return res.status(400).json({ success: false, error: 'Number of digits must be between 1 and 10' });
    if (String(prefix).length > 20 || String(suffix).length > 20) return res.status(400).json({ success: false, error: 'Prefix and suffix must be 20 characters or less' });
    const current = readBillConfig();
    const cfg = {
      prefix: String(prefix), suffix: String(suffix), start: startN, digits: digitsN,
      // Counter only moves back when explicitly reset (e.g. new financial year); otherwise never below start
      next: resetCounter ? startN : Math.max(current.next, startN),
    };
    writeBillConfig(cfg);
    res.json({ success: true, data: billConfigResponse(cfg) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/sellers/:id/bill-number', (req, res) => {
  try {
    const billNo = assignBillNo(Number(req.params.id));
    if (!billNo) return res.status(404).json({ success: false, error: 'Seller not found' });
    res.json({ success: true, bill_no: billNo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk print: issue numbers for several sellers in the order given
app.post('/api/sellers/bill-numbers', (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [];
    const data = {};
    ids.forEach(id => { const b = assignBillNo(Number(id)); if (b) data[id] = b; });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PURCHASES (stock bought by the trader — Purchase List page)
// ══════════════════════════════════════════════════════════════════════════════

const validatePurchase = (body) => {
  const { purchased_from, material, purchase_date, amount, weight } = body;
  if (!purchased_from || !String(purchased_from).trim()) return 'Purchased from is required';
  if (!material) return 'Material is required';
  if (!purchase_date) return 'Date is required';
  if (amount === undefined || amount === '' || isNaN(Number(amount)) || Number(amount) < 0) return 'Enter a valid amount';
  if (weight !== undefined && weight !== '' && (isNaN(Number(weight)) || Number(weight) < 0)) return 'Enter a valid weight';
  const bags = body.num_bags;
  if (bags !== undefined && bags !== '' && (!Number.isInteger(Number(bags)) || Number(bags) < 0)) return 'Number of bags must be a whole number';
  return null;
};

// Total paid so far against one purchase
const purchasePaid = (purchaseId) => {
  const row = prepare('SELECT COALESCE(SUM(amount), 0) AS paid FROM purchase_payments WHERE purchase_id = ?').get(purchaseId);
  return Number(row && row.paid) || 0;
};

app.get('/api/purchases', (req, res) => {
  try {
    const purchases = prepare(
      'SELECT p.*, COALESCE((SELECT SUM(pp.amount) FROM purchase_payments pp WHERE pp.purchase_id = p.id), 0) AS paid ' +
      'FROM purchases p ORDER BY p.purchase_date DESC, p.created_at DESC'
    ).all();
    res.json({ success: true, data: purchases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/purchases', (req, res) => {
  try {
    const error = validatePurchase(req.body);
    if (error) return res.status(400).json({ success: false, error });
    const { purchased_from, material, purchase_date, weight, amount, note, num_bags } = req.body;
    const result = prepare(
      'INSERT INTO purchases (purchased_from, material, purchase_date, num_bags, weight, amount, note) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(String(purchased_from).trim().toUpperCase(), String(material).toUpperCase(), purchase_date,
      parseInt(num_bags) || 0, Number(weight) || 0, Number(amount), note || '');
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/purchases/:id', (req, res) => {
  try {
    const error = validatePurchase(req.body);
    if (error) return res.status(400).json({ success: false, error });
    const { purchased_from, material, purchase_date, weight, amount, note, num_bags } = req.body;
    const paid = purchasePaid(Number(req.params.id));
    if (Number(amount) < paid) {
      return res.status(400).json({ success: false, error: `Amount can't be less than ₹${paid} already paid — delete a payment first` });
    }
    prepare(
      'UPDATE purchases SET purchased_from = ?, material = ?, purchase_date = ?, num_bags = ?, weight = ?, amount = ?, note = ? WHERE id = ?'
    ).run(String(purchased_from).trim().toUpperCase(), String(material).toUpperCase(), purchase_date,
      parseInt(num_bags) || 0, Number(weight) || 0, Number(amount), note || '', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/purchases/:id', (req, res) => {
  try {
    prepare('DELETE FROM purchase_payments WHERE purchase_id = ?').run(req.params.id);
    prepare('DELETE FROM purchases WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Payments against a purchase (partial or full)
app.get('/api/purchases/:id/payments', (req, res) => {
  try {
    const payments = prepare('SELECT * FROM purchase_payments WHERE purchase_id = ? ORDER BY payment_date DESC, created_at DESC').all(req.params.id);
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/purchases/:id/payments', (req, res) => {
  try {
    const purchaseId = Number(req.params.id);
    const purchase = prepare('SELECT id, amount FROM purchases WHERE id = ?').get(purchaseId);
    if (!purchase) return res.status(404).json({ success: false, error: 'Purchase not found' });
    const { amount, payment_date, note } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0 || isNaN(amt)) return res.status(400).json({ success: false, error: 'Enter a valid payment amount' });
    if (!payment_date) return res.status(400).json({ success: false, error: 'Payment date is required' });
    const balance = Number(purchase.amount) - purchasePaid(purchaseId);
    if (amt > balance + 0.001) {
      return res.status(400).json({ success: false, error: `Payment is more than the balance ₹${Math.max(0, balance)}` });
    }
    const result = prepare('INSERT INTO purchase_payments (purchase_id, amount, payment_date, note) VALUES (?, ?, ?, ?)')
      .run(purchaseId, amt, payment_date, note || '');
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/purchase-payments/:id', (req, res) => {
  try {
    prepare('DELETE FROM purchase_payments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// SELLER ADVANCES (cash given to a seller before they sell their produce)
// ══════════════════════════════════════════════════════════════════════════════

app.get('/api/seller-advances', (req, res) => {
  try {
    const { seller_name } = req.query;
    const advances = seller_name
      ? prepare('SELECT * FROM seller_advances WHERE seller_name = ? ORDER BY advance_date DESC, created_at DESC').all(seller_name)
      : prepare('SELECT * FROM seller_advances ORDER BY advance_date DESC, created_at DESC').all();
    res.json({ success: true, data: advances });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/seller-advances', (req, res) => {
  try {
    const { seller_name, village, mobile, amount, advance_date, type, note } = req.body;
    if (!seller_name || !amount || !advance_date) {
      return res.status(400).json({ success: false, error: 'seller_name, amount, advance_date are required' });
    }
    const result = prepare(
      'INSERT INTO seller_advances (seller_name, village, mobile, amount, advance_date, type, note) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(seller_name.toUpperCase(), village || '', mobile || '', Number(amount), advance_date, type === 'repaid' ? 'repaid' : 'given', note || '');
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/seller-advances/:id', (req, res) => {
  try {
    const { amount, advance_date, type, note, village, mobile } = req.body;
    prepare('UPDATE seller_advances SET amount = ?, advance_date = ?, type = ?, note = ?, village = ?, mobile = ? WHERE id = ?')
      .run(Number(amount), advance_date, type === 'repaid' ? 'repaid' : 'given', note || '', village || '', mobile || '', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/seller-advances/:id', (req, res) => {
  try {
    prepare('DELETE FROM seller_advances WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
initDb().then(() => {
  auth.init();
  const server = app.listen(PORT, '127.0.0.1', () => {
    console.log(`✅ ph server running on http://127.0.0.1:${PORT}`);
  });

  // Show DB contents on startup
  try {
    const rows = prepare('SELECT id, name, serial_number, num_bags, weight, bag_data FROM sellers').all();
    console.log('\n=== DB SELLERS ON STARTUP ===');
    rows.forEach(s => {
      let bags = [];
      try { bags = JSON.parse(s.bag_data || '[]'); } catch {}
      const weights = bags.map(b => b.weight).join(', ') || 'NONE';
      console.log(`  ${s.name} | serial:${s.serial_number} | ${s.num_bags} bags | total:${s.weight}kg | bag_weights: ${weights}`);
    });
    console.log('=============================\n');
  } catch (e) {
    console.log('[startup] DB check error:', e.message);
  }

  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT',  () => server.close(() => process.exit(0)));
}).catch(err => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});
