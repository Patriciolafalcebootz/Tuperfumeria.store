const { z } = require('zod');
const service = require('../services/stockService');

async function list(req, res) {
  const data = await service.list();
  res.json(data);
}

async function get(req, res) {
  const item = await service.get(req.params.sku);
  if (!item) return res.status(404).json({ error: 'not found' });
  res.json(item);
}

async function reserve(req, res) {
  try {
    const body = z
      .object({
        sku: z.string(),
        quantity: z.number().int().min(1).default(1),
        version: z.number().int().optional()
      })
      .parse(req.body);
    const reservation = await service.reserve(body.sku, body.quantity, body.version);
    res.json(reservation);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
}

async function release(req, res) {
  try {
    const body = z.object({ reservationId: z.string() }).parse(req.body);
    await service.release(body.reservationId);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
}

async function commit(req, res) {
  try {
    const body = z
      .object({
        items: z.array(
          z.object({
            reservationId: z.string(),
            sku: z.string().optional(),
            version: z.number().int().optional()
          })
        )
      })
      .parse(req.body);
    await service.commit(body.items);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
}

module.exports = {
  list,
  get,
  reserve,
  release,
  commit
};
