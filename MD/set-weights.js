/**
 * USAGE: node set-weights.js
 * 
 * Run from: C:\Users\Venkatesh\Desktop\APMC\PH
 * 
 * This script lets you manually enter weights for any seller
 * whose bag_data has weight=0 (saved before the fix).
 */

const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const readline = require('readline');

const dbPath = path.join(os.homedir(), 'AgriTrader', 'agritrader.db');
const db = new Database(dbPath);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(r => rl.question(q, r));

async function run() {
  const sellers = db.prepare('SELECT * FROM sellers ORDER BY entry_date DESC, serial_number ASC').all();

  if (!sellers.length) { console.log('No sellers found.'); rl.close(); return; }

  console.log('\n==== SELLERS ====');
  sellers.forEach((s, i) => {
    let bags = [];
    try { bags = JSON.parse(s.bag_data || '[]'); } catch {}
    const weights = bags.map(b => b.weight || 0);
    const hasWeights = weights.some(w => w > 0);
    console.log(`${i+1}. [${s.entry_date}] Serial:${s.serial_number} | ${s.name} | ${s.num_bags} bags | ${s.weight}kg total | weights: ${hasWeights ? weights.join(', ') : '❌ MISSING'}`);
  });

  console.log('\nEnter the number of the seller to fix (or 0 to exit):');
  const choice = parseInt(await ask('> '));

  if (!choice || choice < 1 || choice > sellers.length) {
    console.log('Bye!'); rl.close(); return;
  }

  const seller = sellers[choice - 1];
  const num = parseInt(seller.num_bags);
  console.log(`\nFixing: ${seller.name} | ${num} bags | Lot: ${seller.lot_number}`);

  const weights = [];
  for (let i = 0; i < num; i++) {
    const w = parseFloat(await ask(`  Bag ${i+1} weight (kg): `));
    weights.push(w || 0);
  }

  const total = weights.reduce((a, b) => a + b, 0);
  const bagData = weights.map(w => ({
    lot: seller.lot_number,
    weight: w,
    rate: 0,
    amount: 0
  }));

  db.prepare('UPDATE sellers SET bag_data = ?, weight = ? WHERE id = ?')
    .run(JSON.stringify(bagData), total, seller.id);

  console.log(`\n✅ Fixed! Saved weights: ${weights.join(', ')} kg | Total: ${total.toFixed(2)} kg`);
  console.log('Now restart the app and click Edit — weights will appear!');

  const again = await ask('\nFix another seller? (y/n): ');
  if (again.toLowerCase() === 'y') { rl.close(); run(); return; }

  rl.close();
}

run().catch(e => { console.error(e); rl.close(); });
