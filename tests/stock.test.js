const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');

async function setup() {
  process.env.STOCK_FILE = path.join(__dirname, 'stock.test.json');
  await fs.copyFile(path.join(__dirname, '..', 'data', 'stock.json'), process.env.STOCK_FILE);
  delete require.cache[require.resolve('../server/index.js')];
  return require('../server/index.js');
}

test('reserve and commit adjust stock', async () => {
  const svc = await setup();
  const items = await svc.list();
  const { sku, version, stock } = items[0];
  const { id } = await svc.reserve(sku, 1, version);
  await svc.commit([{ reservationId: id, sku, version }]);
  const after = await svc.get(sku);
  assert.strictEqual(after.stock, stock - 1);
});

test('stale version is rejected', async () => {
  const svc = await setup();
  const items = await svc.list();
  const { sku } = items[0];
  await assert.rejects(svc.reserve(sku, 1, 999), /version/);
});
