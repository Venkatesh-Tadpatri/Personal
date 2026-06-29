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

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());

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
      serial_number, name, mobile, material,
      num_bags, lot_number, weight, advance_amount,
      entry_date, bag_data
    } = req.body;

    const materialName = (material || 'GENERAL').toUpperCase();

    console.log('[POST /api/sellers]', name, '| material:', materialName, '| bag_data:', bag_data);

    const exists = prepare('SELECT id FROM sellers WHERE serial_number = ? AND material = ? AND entry_date = ?').get(serial_number, materialName, entry_date);
    if (exists) {
      return res.status(400).json({ success: false, error: `Serial number ${serial_number} already used for ${materialName} on ${entry_date}.` });
    }

    let bagDataStr = '[]';
    try {
      const parsed = typeof bag_data === 'string' ? JSON.parse(bag_data) : (Array.isArray(bag_data) ? bag_data : []);
      bagDataStr = JSON.stringify(parsed);
    } catch (e) {}

    const result = prepare(`
      INSERT INTO sellers (serial_number, name, mobile, material, num_bags, lot_number, weight, advance_amount, bag_data, entry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      entry_date
    );

    res.json({ success: true, id: result.lastInsertRowid });
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

    const allowed = ['serial_number','name','mobile','material','num_bags','lot_number','weight','advance_amount','labour_rate','rate_fixed','amount','bag_data','entry_date'];
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
    const { buyer_name, amount, payment_date, note, bill_date, bill_material } = req.body;
    if (!buyer_name || !amount || !payment_date) {
      return res.status(400).json({ success: false, error: 'buyer_name, amount, payment_date are required' });
    }
    const result = prepare(
      'INSERT INTO buyer_payments (buyer_name, amount, payment_date, note, bill_date, bill_material) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(buyer_name.toUpperCase(), Number(amount), payment_date, note || '', bill_date || null, bill_material || null);
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

// ── Start ─────────────────────────────────────────────────────────────────────
initDb().then(() => {
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
