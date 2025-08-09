const fs = require('fs').promises;
const path = require('path');

const target = path.join(__dirname, '..', 'data', 'stock.json');

const seedData = [
  {
    id: 1,
    sku: 'ALH-AMB-120',
    name: 'Al Haramain Amber Oud Gold',
    brand: 'Al Haramain',
    price: 100,
    stock: 1,
    active: true,
    updatedAt: new Date().toISOString(),
    version: 1
  },
  {
    id: 2,
    sku: 'ARM-CDNIM-105',
    name: 'Armaf Club de Nuit Intense Man',
    brand: 'Armaf',
    price: 80,
    stock: 6,
    active: true,
    updatedAt: new Date().toISOString(),
    version: 1
  }
];

async function seed() {
  await fs.writeFile(target, JSON.stringify(seedData, null, 2));
  console.log('Seed data written');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
