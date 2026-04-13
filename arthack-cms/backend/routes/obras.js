const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getDB } = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/obras — public
router.get('/', [
  query('sort').optional().isIn(['posicao', 'preco', 'created_at', 'titulo']),
  query('ordem').optional().isIn(['asc', 'desc']),
  query('categoria').optional().trim(),
  query('colecao').optional().trim(),
  query('disponivel').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 })
], (req, res) => {
  const db = getDB();

  const {
    sort = 'posicao',
    ordem = 'asc',
    categoria,
    colecao,
    disponivel,
    limit = 50,
    offset = 0
  } = req.query;

  const validSorts = ['posicao', 'preco', 'created_at', 'titulo'];
  const safeSort = validSorts.includes(sort) ? sort : 'posicao';
  const safeOrdem = ordem === 'desc' ? 'DESC' : 'ASC';

  let conditions = [];
  let params = [];

  if (categoria) { conditions.push('categoria = ?'); params.push(categoria); }
  if (colecao) { conditions.push('colecao = ?'); params.push(colecao); }
  if (disponivel !== undefined) { conditions.push('disponivel = ?'); params.push(disponivel === 'true' ? 1 : 0); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const obras = db.prepare(`
    SELECT * FROM obras ${where}
    ORDER BY ${safeSort} ${safeOrdem}
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), Number(offset));

  const total = db.prepare(`SELECT COUNT(*) as count FROM obras ${where}`).get(...params);

  res.json({ obras, total: total.count, limit: Number(limit), offset: Number(offset) });
});

// GET /api/obras/:id — public
router.get('/:id', (req, res) => {
  const db = getDB();
  const obra = db.prepare('SELECT * FROM obras WHERE id = ?').get(req.params.id);

  if (!obra) return res.status(404).json({ error: 'Obra não encontrada' });
  res.json(obra);
});

// POST /api/obras — protected
router.post('/', authMiddleware, [
  body('titulo').trim().notEmpty().withMessage('Título obrigatório'),
  body('preco').optional().isFloat({ min: 0 }),
  body('categoria').optional().trim(),
  body('posicao').optional().isInt({ min: 0 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDB();
  const {
    titulo, descricao = '', preco = 0, imagem_url = '', thumbnail_url = '',
    imagem_secundaria = '',
    categoria = 'escultura', colecao = '', disponivel = 1,
    destaque = 0, posicao
  } = req.body;

  // Auto-position at end if not provided
  const maxPos = db.prepare('SELECT MAX(posicao) as max FROM obras').get();
  const finalPos = posicao !== undefined ? posicao : (maxPos.max ?? -1) + 1;

  const result = db.prepare(`
    INSERT INTO obras (titulo, descricao, preco, imagem_url, thumbnail_url, imagem_secundaria, categoria, colecao, disponivel, destaque, posicao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(titulo, descricao, preco, imagem_url, thumbnail_url, imagem_secundaria, categoria, colecao, disponivel ? 1 : 0, destaque ? 1 : 0, finalPos);

  const obra = db.prepare('SELECT * FROM obras WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(obra);
});

// PUT /api/obras/:id — protected
router.put('/:id', authMiddleware, [
  body('titulo').optional().trim().notEmpty(),
  body('preco').optional().isFloat({ min: 0 }),
  body('posicao').optional().isInt({ min: 0 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDB();
  const existing = db.prepare('SELECT * FROM obras WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Obra não encontrada' });

  const fields = ['titulo', 'descricao', 'preco', 'imagem_url', 'thumbnail_url', 'imagem_secundaria',
    'categoria', 'colecao', 'disponivel', 'destaque', 'posicao'];
  const updates = [];
  const values = [];

  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      if (f === 'disponivel' || f === 'destaque') {
        values.push(req.body[f] ? 1 : 0);
      } else {
        values.push(req.body[f]);
      }
    }
  });

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  values.push(req.params.id);
  db.prepare(`UPDATE obras SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const obra = db.prepare('SELECT * FROM obras WHERE id = ?').get(req.params.id);
  res.json(obra);
});

// PUT /api/obras/reorder — batch reorder, protected
router.put('/batch/reorder', authMiddleware, [
  body('items').isArray().withMessage('Items must be an array'),
  body('items.*.id').isInt(),
  body('items.*.posicao').isInt({ min: 0 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDB();
  const update = db.prepare('UPDATE obras SET posicao = ? WHERE id = ?');

  const reorderMany = db.transaction((items) => {
    items.forEach(({ id, posicao }) => update.run(posicao, id));
  });

  reorderMany(req.body.items);
  res.json({ message: 'Reordered successfully', count: req.body.items.length });
});

// DELETE /api/obras/:id — protected
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const obra = db.prepare('SELECT * FROM obras WHERE id = ?').get(req.params.id);
  if (!obra) return res.status(404).json({ error: 'Obra não encontrada' });

  db.prepare('DELETE FROM obras WHERE id = ?').run(req.params.id);
  res.json({ message: 'Obra deletada', id: req.params.id });
});

module.exports = router;
