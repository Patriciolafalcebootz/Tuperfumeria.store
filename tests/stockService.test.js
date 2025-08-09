const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs').promises;
const path = require('path');

async function setupService() {
  process.env.STOCK_FILE = path.join(__dirname, 'stock.test.json');
  await fs.copyFile(path.join(__dirname, '..', 'data', 'stock.json'), process.env.STOCK_FILE);
  delete require.cache[require.resolve('../server/utils/reservations')];
  delete require.cache[require.resolve('../server/services/stockService')];
  return require('../server/services/stockService');
}

test('reserve and commit adjust stock', async () => {
  const service = await setupService();
  const items = await service.list();
  const { sku, version, stock } = items[0];
  const { id } = await service.reserve(sku, 1, version);
  await service.commit([{ reservationId: id, sku, version }]);
  const after = await service.get(sku);
  assert.strictEqual(after.stock, stock - 1);
});

test('stale version is rejected', async () => {
  const service = await setupService();
  const items = await service.list();
  const { sku } = items[0];
  await assert.rejects(service.reserve(sku, 1, 999), /version/);
});
