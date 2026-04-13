const express = require('express');
const { getDB } = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/configuracoes — público
router.get('/', (req, res) => {
  const db = getDB();
  const rows = db.prepare('SELECT chave, valor FROM configuracoes').all();
  const config = {};
  rows.forEach(r => config[r.chave] = r.valor);
  res.json(config);
});

// PUT /api/configuracoes — protegido
router.put('/', authMiddleware, (req, res) => {
  const db = getDB();
  const update = db.prepare('INSERT OR REPLACE INTO configuracoes (chave, valor) VALUES (?, ?)');
  const updateMany = db.transaction((items) => {
    Object.entries(items).forEach(([chave, valor]) => update.run(chave, valor));
  });
  updateMany(req.body);
  res.json({ message: 'Configurações salvas!' });
});

module.exports = router;
