const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getDB } = require('../models/db');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username required'),
  body('password').notEmpty().withMessage('Password required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  const db = getDB();

  try {
    const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username);

    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: 'admin'
    });

    res.json({
      token,
      user: { id: admin.id, username: admin.username, role: 'admin' },
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// PUT /api/auth/password — change password
router.put('/password', authMiddleware, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const db = getDB();

  const admin = db.prepare('SELECT * FROM admin WHERE id = ?').get(req.admin.id);

  if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
    return res.status(401).json({ error: 'Current password incorrect' });
  }

  const newHash = bcrypt.hashSync(newPassword, 12);
  db.prepare('UPDATE admin SET password_hash = ? WHERE id = ?').run(newHash, admin.id);

  res.json({ message: 'Password updated successfully' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.admin });
});

module.exports = router;
