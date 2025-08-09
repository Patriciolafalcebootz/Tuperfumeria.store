const repo = require('../repos/stockRepository');
const reservations = require('../utils/reservations');

const TTL = parseInt(process.env.RESERVATION_TTL_MIN || '15', 10);

async function list() {
  const stock = await repo.readStock();
  return stock.map(p => {
    const reserved = reservations.getReservedQty(p.sku);
    return {
      ...p,
      reserved,
      available: p.stock - reserved
    };
  });
}

async function get(sku) {
  const all = await list();
  return all.find(p => p.sku === sku);
}

async function reserve(sku, quantity, version) {
  const stock = await repo.readStock();
  const product = stock.find(p => p.sku === sku && p.active);
  if (!product) {
    const err = new Error('not found');
    err.status = 404;
    throw err;
  }
  if (version !== undefined && product.version !== version) {
    const err = new Error('version conflict');
    err.status = 409;
    throw err;
  }
  const reserved = reservations.getReservedQty(sku);
  if (product.stock - reserved < quantity) {
    const err = new Error('insufficient stock');
    err.status = 409;
    throw err;
  }
  const res = reservations.create(sku, quantity, TTL);
  return { id: res.id, version: product.version, expiresAt: res.expiresAt };
}

async function release(reservationId) {
  reservations.release(reservationId);
}

async function commit(items) {
  const stock = await repo.readStock();
  for (const item of items) {
    const res = reservations.getReservation(item.reservationId);
    if (!res) {
      const err = new Error('reservation not found');
      err.status = 404;
      throw err;
    }
    const product = stock.find(p => p.sku === res.sku);
    if (!product) {
      const err = new Error('not found');
      err.status = 404;
      throw err;
    }
    if (item.version !== undefined && product.version !== item.version) {
      const err = new Error('version conflict');
      err.status = 409;
      throw err;
    }
    if (product.stock < res.quantity) {
      const err = new Error('insufficient stock');
      err.status = 409;
      throw err;
    }
    product.stock -= res.quantity;
    product.version += 1;
    product.updatedAt = new Date().toISOString();
    reservations.release(item.reservationId);
  }
  await repo.writeStock(stock);
}

module.exports = {
  list,
  get,
  reserve,
  release,
  commit
};
