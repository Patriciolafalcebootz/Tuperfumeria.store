class StockClient {
  constructor(base = '/api/stock') {
    this.base = base;
  }

  async getAll() {
    const res = await fetch(this.base, { cache: 'no-store' });
    if (!res.ok) throw new Error('failed');
    return res.json();
  }

  async getBySku(sku) {
    const res = await fetch(`${this.base}/${encodeURIComponent(sku)}`);
    if (!res.ok) throw new Error('failed');
    return res.json();
  }

  async reserve(sku, quantity = 1, version) {
    const res = await fetch(`${this.base}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku, quantity, version })
    });
    if (!res.ok) throw new Error('reserve failed');
    return res.json();
  }

  async release(reservationId) {
    const res = await fetch(`${this.base}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId })
    });
    if (!res.ok) throw new Error('release failed');
    return res.json();
  }

  async commit(items) {
    const res = await fetch(`${this.base}/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    if (!res.ok) throw new Error('commit failed');
    return res.json();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StockClient;
} else {
  window.StockClient = StockClient;
}
