const crypto = require('crypto');

const reservations = new Map();

function cleanup() {
  const now = Date.now();
  for (const [id, r] of reservations.entries()) {
    if (r.expiresAt <= now) {
      reservations.delete(id);
    }
  }
}

function create(sku, quantity, ttlMinutes) {
  cleanup();
  const id = crypto.randomUUID();
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  reservations.set(id, { sku, quantity, expiresAt });
  return { id, sku, quantity, expiresAt };
}

function release(id) {
  cleanup();
  reservations.delete(id);
}

function getReservation(id) {
  cleanup();
  return reservations.get(id);
}

function getReservedQty(sku) {
  cleanup();
  let total = 0;
  for (const r of reservations.values()) {
    if (r.sku === sku) total += r.quantity;
  }
  return total;
}

module.exports = {
  create,
  release,
  getReservation,
  getReservedQty,
  cleanup
};
