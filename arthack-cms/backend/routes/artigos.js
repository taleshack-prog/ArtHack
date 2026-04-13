const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDB } = require('../models/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/artigos — public
router.get('/', (req, res) => {
  const db = getDB();
  const { categoria, publicado, limit = 20, offset = 0, sort = 'posicao' } = req.query;

  const validSorts = ['posicao', 'data_publicacao', 'titulo', 'created_at'];
  const safeSort = validSorts.includes(sort) ? sort : 'posicao';

  let conditions = [];
  let params = [];

  if (categoria) { conditions.push('categoria = ?'); params.push(categoria); }
  if (publicado !== undefined) { conditions.push('publicado = ?'); params.push(publicado === 'true' ? 1 : 0); }
  else { conditions.push('publicado = 1'); } // Default: only published

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const artigos = db.prepare(`
    SELECT id, titulo, resumo, imagem_url, categoria, publicado, posicao, slug, data_publicacao, created_at, updated_at
    FROM artigos ${where}
    ORDER BY ${safeSort} ASC
    LIMIT ? OFFSET ?
  `).all(...params, Number(limit), Number(offset));

  const total = db.prepare(`SELECT COUNT(*) as count FROM artigos ${where}`).get(...params);

  res.json({ artigos, total: total.count });
});

// GET /api/artigos/:id — public
router.get('/:id', (req, res) => {
  const db = getDB();
  // Support both numeric ID and slug
  const artigo = isNaN(req.params.id)
    ? db.prepare('SELECT * FROM artigos WHERE slug = ? AND publicado = 1').get(req.params.id)
    : db.prepare('SELECT * FROM artigos WHERE id = ?').get(req.params.id);

  if (!artigo) return res.status(404).json({ error: 'Artigo não encontrado' });
  res.json(artigo);
});

// POST /api/artigos — protected
router.post('/', authMiddleware, [
  body('titulo').trim().notEmpty().withMessage('Título obrigatório'),
  body('conteudo').optional(),
  body('categoria').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDB();
  const {
    titulo, conteudo = '', resumo = '', imagem_url = '',
    categoria = 'geral', publicado = 1, posicao, data_publicacao
  } = req.body;

  // Generate unique slug
  let slug = slugify(titulo);
  const existing = db.prepare('SELECT id FROM artigos WHERE slug = ?').get(slug);
  if (existing) slug = `${slug}-${Date.now()}`;

  const maxPos = db.prepare('SELECT MAX(posicao) as max FROM artigos').get();
  const finalPos = posicao !== undefined ? posicao : (maxPos.max ?? -1) + 1;

  const result = db.prepare(`
    INSERT INTO artigos (titulo, conteudo, resumo, imagem_url, categoria, publicado, posicao, slug, data_publicacao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(titulo, conteudo, resumo, imagem_url, categoria, publicado ? 1 : 0, finalPos, slug,
    data_publicacao || new Date().toISOString());

  const artigo = db.prepare('SELECT * FROM artigos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(artigo);
});

// PUT /api/artigos/:id — protected
router.put('/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const existing = db.prepare('SELECT * FROM artigos WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Artigo não encontrado' });

  const fields = ['titulo', 'conteudo', 'resumo', 'imagem_url', 'categoria', 'publicado', 'posicao', 'data_publicacao'];
  const updates = [];
  const values = [];

  fields.forEach(f => {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(f === 'publicado' ? (req.body[f] ? 1 : 0) : req.body[f]);
    }
  });

  // Re-slug if title changed
  if (req.body.titulo && req.body.titulo !== existing.titulo) {
    let newSlug = slugify(req.body.titulo);
    const slugExists = db.prepare('SELECT id FROM artigos WHERE slug = ? AND id != ?').get(newSlug, req.params.id);
    if (slugExists) newSlug = `${newSlug}-${Date.now()}`;
    updates.push('slug = ?');
    values.push(newSlug);
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  values.push(req.params.id);
  db.prepare(`UPDATE artigos SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const artigo = db.prepare('SELECT * FROM artigos WHERE id = ?').get(req.params.id);
  res.json(artigo);
});

// PUT /api/artigos/batch/reorder — protected
router.put('/batch/reorder', authMiddleware, (req, res) => {
  const db = getDB();
  const update = db.prepare('UPDATE artigos SET posicao = ? WHERE id = ?');
  const reorderMany = db.transaction((items) => {
    items.forEach(({ id, posicao }) => update.run(posicao, id));
  });
  reorderMany(req.body.items);
  res.json({ message: 'Reordered' });
});

// DELETE /api/artigos/:id — protected
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDB();
  const artigo = db.prepare('SELECT * FROM artigos WHERE id = ?').get(req.params.id);
  if (!artigo) return res.status(404).json({ error: 'Artigo não encontrado' });

  db.prepare('DELETE FROM artigos WHERE id = ?').run(req.params.id);
  res.json({ message: 'Artigo deletado', id: req.params.id });
});

module.exports = router;
