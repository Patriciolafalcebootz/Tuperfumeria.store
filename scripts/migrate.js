const fs = require('fs').promises;
const path = require('path');

const legacyPath = path.join(__dirname, '..', 'data', 'stock.legacy.json');
const targetPath = path.join(__dirname, '..', 'data', 'stock.json');

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function migrate() {
  const legacy = JSON.parse(await fs.readFile(legacyPath, 'utf8'));
  const seen = new Set();
  const now = new Date().toISOString();
  let id = 1;
  const out = [];
  for (const item of legacy) {
    const name = item.Producto.trim();
    const sku = slugify(name);
    if (seen.has(sku)) continue;
    seen.add(sku);
    out.push({
      id: id++,
      sku,
      name,
      brand: '',
      price: 0,
      stock: Number(item.Cantidad) || 0,
      active: true,
      updatedAt: now,
      version: 1
    });
  }
  await fs.writeFile(targetPath, JSON.stringify(out, null, 2));
  console.log(`Migrated ${out.length} items`);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
