require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { z } = require('zod');

const app = express();

// --- Stock and reservation logic -------------------------------------------------
const stockFile = process.env.STOCK_FILE || path.join(__dirname, '../data/stock.json');
const TTL = parseInt(process.env.RESERVATION_TTL_MIN || '15', 10);
const reservations = new Map();

function cleanupReservations() {
  const now = Date.now();
  for (const [id, r] of reservations.entries()) {
    if (r.expiresAt <= now) {
      reservations.delete(id);
    }
  }
}

function createReservation(sku, quantity) {
  cleanupReservations();
  const id = crypto.randomUUID();
  const expiresAt = Date.now() + TTL * 60 * 1000;
  reservations.set(id, { sku, quantity, expiresAt });
  return { id, sku, quantity, expiresAt };
}

function releaseReservation(id) {
  cleanupReservations();
  reservations.delete(id);
}

function getReservation(id) {
  cleanupReservations();
  return reservations.get(id);
}

function getReservedQty(sku) {
  cleanupReservations();
  let total = 0;
  for (const r of reservations.values()) {
    if (r.sku === sku) total += r.quantity;
  }
  return total;
}

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

async function list() {
  const stock = await readStock();
  return stock.map(p => {
    const reserved = getReservedQty(p.sku);
    return { ...p, reserved, available: p.stock - reserved };
  });
}

async function getItem(sku) {
  const all = await list();
  return all.find(p => p.sku === sku);
}

async function reserve(sku, quantity, version) {
  const stock = await readStock();
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
  const reserved = getReservedQty(sku);
  if (product.stock - reserved < quantity) {
    const err = new Error('insufficient stock');
    err.status = 409;
    throw err;
  }
  const res = createReservation(sku, quantity);
  return { id: res.id, version: product.version, expiresAt: res.expiresAt };
}

async function commit(items) {
  const stock = await readStock();
  for (const item of items) {
    const res = getReservation(item.reservationId);
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
    releaseReservation(item.reservationId);
  }
  await writeStock(stock);
}

// --- Express setup ---------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: process.env.MODE || 'backend' });
});

app.get('/api/stock', async (req, res) => {
  res.json(await list());
});

app.get('/api/stock/:sku', async (req, res) => {
  const item = await getItem(req.params.sku);
  if (!item) return res.status(404).json({ error: 'not found' });
  res.json(item);
});

app.post('/api/stock/reserve', async (req, res) => {
  try {
    const body = z
      .object({
        sku: z.string(),
        quantity: z.number().int().min(1).default(1),
        version: z.number().int().optional(),
      })
      .parse(req.body);
    const reservation = await reserve(body.sku, body.quantity, body.version);
    res.json(reservation);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

app.post('/api/stock/release', async (req, res) => {
  try {
    const body = z.object({ reservationId: z.string() }).parse(req.body);
    releaseReservation(body.reservationId);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

app.post('/api/stock/commit', async (req, res) => {
  try {
    const body = z
      .object({
        items: z.array(
          z.object({
            reservationId: z.string(),
            sku: z.string().optional(),
            version: z.number().int().optional(),
          })
        ),
      })
      .parse(req.body);
    await commit(body.items);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, '..')));

const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
}

module.exports = { app, list, get: getItem, reserve, commit, release: releaseReservation, readStock, writeStock };
