/**
 * Run ONCE from your PH root:
 *   node migrate-db.js
 */
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const readline = require('readline');

const dbPath = path.join(os.homedir(), 'AgriTrader', 'agritrader.db');
console.log('DB:', dbPath);

const db = new Database(dbPath);

// Step 1: Add missing columns
const sellerCols = db.pragma('table_info(sellers)').map(c => c.name);
const buyerCols  = db.pragma('table_info(buyers)').map(c => c.name);

if (!sellerCols.includes('bag_data')) {
  db.exec("ALTER TABLE sellers ADD COLUMN bag_data TEXT DEFAULT '[]'");
  console.log('✅ Added bag_data to sellers');
}
if (!buyerCols.includes('bag_data')) {
  db.exec("ALTER TABLE buyers ADD COLUMN bag_data TEXT DEFAULT '[]'");
  console.log('✅ Added bag_data to buyers');
}

// Step 2: Show all sellers
const sellers = db.prepare('SELECT id, name, serial_number, num_bags, weight, bag_data FROM sellers ORDER BY rowid').all();
console.log('\n=== SELLERS ===');
sellers.forEach((s, i) => {
  let bags = [];
  try { bags = JSON.parse(s.bag_data || '[]'); } catch {}
  const w = bags.map(b => b.weight).filter(x => x > 0);
  console.log(`${i+1}. ${s.name} | Serial:${s.serial_number} | ${s.num_bags} bags | Total:${s.weight}kg | bag weights: ${w.length ? w.join(', ') : '❌ MISSING'}`);
});

if (!sellers.length) {
  console.log('No sellers. Migration done. Start the app now.');
  process.exit(0);
}

// Step 3: Fix sellers with missing weights interactively
const missing = sellers.filter(s => {
  try {
    const b = JSON.parse(s.bag_data || '[]');
    return b.length === 0 || b.every(x => !(Number(x.weight) > 0));
  } catch { return true; }
});

if (!missing.length) {
  console.log('\n✅ All sellers already have weights saved. Migration complete!');
  console.log('Restart the app — Edit modal will now show weights.');
  process.exit(0);
}

console.log(`\n${missing.length} seller(s) have missing weights. Enter weights now:\n`);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(r => rl.question(q, r));

async function fixAll() {
  for (const s of missing) {
    const n = parseInt(s.num_bags) || 0;
    console.log(`\nSeller: ${s.name} | Serial: ${s.serial_number} | ${n} bags | Lot: ${s.serial_number}/${n}`);
    const weights = [];
    for (let i = 0; i < n; i++) {
      const w = await ask(`  Bag ${i+1} weight (kg): `);
      weights.push(parseFloat(w) || 0);
    }
    const total = weights.reduce((a, b) => a + b, 0);
    const bagData = weights.map(w => ({
      lot: `${s.serial_number}/${n}`,
      weight: w, rate: 0, amount: 0
    }));
    db.prepare('UPDATE sellers SET bag_data=?, weight=? WHERE id=?')
      .run(JSON.stringify(bagData), total, s.id);
    console.log(`  ✅ Saved: ${weights.join(', ')} kg  |  Total: ${total.toFixed(2)} kg`);
  }
  rl.close();
  console.log('\n✅ All done! Restart app now. Edit modal will show all weights.');
}

fixAll().catch(e => { console.error(e); rl.close(); });