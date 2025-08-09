require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const stockRoutes = require('./routes/stockRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: process.env.MODE || 'backend' });
});

app.use('/api/stock', stockRoutes);

app.use(express.static(path.join(__dirname, '..')));

const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server listening on ${port}`);
  });
}

module.exports = app;
