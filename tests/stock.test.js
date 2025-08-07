const test = require('node:test');
const assert = require('node:assert');

test('actualiza el estado de stock en base a la cantidad', () => {
  const productos = [
    { nombre: 'Perfume A', stock: true },
    { nombre: 'Perfume B', stock: true }
  ];
  const stockData = [
    { Producto: 'Perfume A', Cantidad: 0 },
    { Producto: 'Perfume B', Cantidad: 2 }
  ];

  const allProducts = [...productos];
  allProducts.forEach(p => p.stock = false);
  stockData.forEach(item => {
    const prod = allProducts.find(p =>
      p.nombre.trim().toLowerCase() === item.Producto.trim().toLowerCase()
    );
    if (prod) {
      prod.stock = Number(item.Cantidad) > 0;
    }
  });

  assert.strictEqual(allProducts[0].stock, false);
  assert.strictEqual(allProducts[1].stock, true);
});
