const express = require('express');
const { getDB } = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/paginas/:slug — público
router.get('/:slug', (req, res) => {
  const db = getDB();
  const pagina = db.prepare('SELECT * FROM paginas WHERE slug = ?').get(req.params.slug);
  if (!pagina) return res.status(404).json({ error: 'Página não encontrada' });
  res.json(pagina);
});

// PUT /api/paginas/:slug — protegido
router.put('/:slug', authMiddleware, (req, res) => {
  const db = getDB();
  const { titulo, conteudo, imagem_url } = req.body;
  db.prepare(`
    INSERT INTO paginas (slug, titulo, conteudo, imagem_url, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(slug) DO UPDATE SET
      titulo = excluded.titulo,
      conteudo = excluded.conteudo,
      imagem_url = excluded.imagem_url,
      updated_at = datetime('now')
  `).run(req.params.slug, titulo, conteudo, imagem_url || '');
  res.json({ message: 'Página salva!' });
});

module.exports = router;
