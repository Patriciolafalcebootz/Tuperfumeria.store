const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const stockFile = path.join(__dirname, 'data', 'stock.json');

app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/stock', (req, res) => {
  fs.readFile(stockFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se pudo leer el stock' });
    res.json(JSON.parse(data));
  });
});

app.post('/api/stock', (req, res) => {
  fs.writeFile(stockFile, JSON.stringify(req.body, null, 2), 'utf8', err => {
    if (err) return res.status(500).json({ error: 'No se pudo guardar el stock' });
    res.json({ status: 'ok' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
