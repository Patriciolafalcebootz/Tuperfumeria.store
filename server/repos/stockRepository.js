const fs = require('fs').promises;
const path = require('path');

const stockFile = process.env.STOCK_FILE || path.join(__dirname, '../../data/stock.json');

async function readStock() {
  try {
    const data = await fs.readFile(stockFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeStock(stock) {
  await fs.writeFile(stockFile, JSON.stringify(stock, null, 2));
}

module.exports = {
  readStock,
  writeStock,
  stockFile
};
