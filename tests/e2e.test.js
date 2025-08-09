const test = require('node:test');
const assert = require('node:assert');
const { cart, addToCart, checkout, setStockClient } = require('../cart');

test('add to cart then checkout commits reservations', async () => {
  const stub = {
    reserve: async () => ({ id: 'r1', version: 1 }),
    release: async () => {},
    commit: async (items) => { stub.committed = items; }
  };
  setStockClient(stub);
  await addToCart({ nombre: 'Perfume A', precio: 5, imagenes: ['a'], sku: 'sku-a', version: 1 });
  await checkout();
  assert.deepStrictEqual(stub.committed, [
    { reservationId: 'r1', sku: 'sku-a', version: 1 }
  ]);
  assert.strictEqual(cart.length, 0);
});
