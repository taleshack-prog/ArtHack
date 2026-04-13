const express = require('express');
const { getDB } = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/export/json — exports all data as JSON for GitHub Pages fallback
router.get('/json', authMiddleware, (req, res) => {
  const db = getDB();

  const obras = db.prepare('SELECT * FROM obras ORDER BY posicao ASC').all();
  const artigos = db.prepare('SELECT * FROM artigos WHERE publicado = 1 ORDER BY posicao ASC').all();
  const fotos = db.prepare('SELECT * FROM fotos ORDER BY posicao ASC').all();

  const exportData = {
    exported_at: new Date().toISOString(),
    version: '1.0',
    obras,
    artigos,
    fotos
  };

  res.setHeader('Content-Disposition', 'attachment; filename="arthack-data.json"');
  res.json(exportData);
});

// GET /api/export/static — exports JSON formatted for GitHub Pages (no auth needed)
router.get('/static', (req, res) => {
  const db = getDB();

  const obras = db.prepare('SELECT * FROM obras WHERE disponivel = 1 ORDER BY posicao ASC').all();
  const artigos = db.prepare('SELECT id, titulo, resumo, imagem_url, categoria, slug, data_publicacao FROM artigos WHERE publicado = 1 ORDER BY posicao ASC').all();

  res.json({ obras, artigos, updated_at: new Date().toISOString() });
});

module.exports = router;
