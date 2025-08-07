const test = require('node:test');
const assert = require('node:assert');

test('actualiza las cantidades de stock', () => {
  const productos = [
    { nombre: 'Perfume A', stock: 5 },
    { nombre: 'Perfume B', stock: 1 }
  ];
  const stockData = [
    { Producto: 'Perfume A', Cantidad: 0 },
    { Producto: 'Perfume B', Cantidad: 2 }
  ];

  const allProducts = [...productos];

  stockData.forEach(item => {
    const prod = allProducts.find(p =>
      p.nombre.trim().toLowerCase() === item.Producto.trim().toLowerCase()
    );
    if (prod) {
      prod.stock = Number(item.Cantidad) || 0;
    }
  });

  assert.strictEqual(allProducts[0].stock, 0);
  assert.strictEqual(allProducts[1].stock, 2);
});
