const test = require('node:test');
const assert = require('node:assert');
const { cart, addToCart, removeFromCart, setStockClient } = require('../cart');

setStockClient({
  reserve: async () => ({ id: 'res1', version: 1 }),
  release: async () => {},
  commit: async () => {}
});

test('agrega un producto al carrito y luego lo elimina', async () => {
  await addToCart({ nombre: 'Perfume A', precio: 5, imagenes: ['a'], sku: 'sku-a', version: 1 });
  assert.strictEqual(cart.length, 1);
  await removeFromCart(0);
  assert.strictEqual(cart.length, 0);
});
