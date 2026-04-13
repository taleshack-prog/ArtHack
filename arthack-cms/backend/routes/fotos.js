const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDB } = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/fotos
router.get('/', (req, res) => {
  const db = getDB();
  const { categoria, obra_id, limit = 50, offset = 0 } = req.query;

  let conditions = [];
  let params = [];

  if (categoria) { conditions.push('f.categoria = ?'); params.push(categoria); }
  if (obra_id) { conditions.push('f.obra_id = ?'); params.push(obra_id); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const fotos = db.prepare(`
    SELECT f.*, o.titulo as obra_titulo
    FROM fotos f
    LEFT JOIN obras o ON f.obra_id = o.id
    ${where}
    ORDER BY f.posicao ASC, f.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), Number(offset));

  res.json({ fotos, total: fotos.length });
});

// POST /api/fotos — protected
router.post('/', authMiddleware, [
  body('url').notEmpty().withMessage('URL obrigatória')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDB();
  const { url, thumbnail_url = '', legenda = '', categoria = 'geral', obra_id } = req.body;

  const maxPos = db.prepare('SELECT MAX(posicao) as max FROM fotos').get();
  const posicao = (maxPos.max ?? -1) + 1;

  const result = db.prepare(`
    INSERT INTO fotos (url, thumbnail_url, legenda, categoria, obra_id, posicao)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(url, thumbnail_url, legenda, categoria, obra_id || null, posicao);

  const foto = db.prepare('SELECT * FROM fotos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(foto);
});

// PUT /api/fotos/:id — protected
router.put('/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const existing = db.prepare('SELECT * FROM fotos WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Foto não encontrada' });

  const fields = ['url', 'thumbnail_url', 'legenda', 'categoria', 'obra_id', 'posicao'];
  const updates = [];
  const values = [];

  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  });

  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });

  values.push(req.params.id);
  db.prepare(`UPDATE fotos SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  res.json(db.prepare('SELECT * FROM fotos WHERE id = ?').get(req.params.id));
});

// DELETE /api/fotos/:id — protected
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const foto = db.prepare('SELECT * FROM fotos WHERE id = ?').get(req.params.id);
  if (!foto) return res.status(404).json({ error: 'Foto não encontrada' });

  db.prepare('DELETE FROM fotos WHERE id = ?').run(req.params.id);
  res.json({ message: 'Foto deletada', id: req.params.id });
});

module.exports = router;
