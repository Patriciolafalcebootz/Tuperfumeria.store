const express = require('express');
const controller = require('../controllers/stockController');

const router = express.Router();

router.get('/', controller.list);
router.get('/:sku', controller.get);
router.post('/reserve', controller.reserve);
router.post('/release', controller.release);
router.post('/commit', controller.commit);

module.exports = router;
