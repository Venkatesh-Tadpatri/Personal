/**
 * Run from your PH root folder:
 *   node check-db.js
 * 
 * This will show exactly what bag_data is stored for each seller.
 */
const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const dbPath = path.join(os.homedir(), 'AgriTrader', 'agritrader.db');
console.log('Reading DB from:', dbPath);

const db = new Database(dbPath);
const sellers = db.prepare('SELECT id, name, serial_number, num_bags, weight, bag_data FROM sellers ORDER BY created_at DESC').all();

console.log('\n=== SELLERS IN DATABASE ===\n');
sellers.forEach(s => {
  console.log(`ID:${s.id} | ${s.name} | Serial:${s.serial_number} | Bags:${s.num_bags} | TotalWeight:${s.weight}`);
  console.log('  bag_data:', s.bag_data);
  try {
    const p = JSON.parse(s.bag_data);
    p.forEach((b,i) => console.log(`  Bag ${i+1}: weight=${b.weight}, rate=${b.rate}, amount=${b.amount}`));
  } catch(e) { console.log('  PARSE ERROR:', e.message); }
  console.log('');
});
