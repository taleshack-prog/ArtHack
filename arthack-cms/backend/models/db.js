const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/arthack.db');

let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const database = getDB();

  database.exec(`
    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS obras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      preco REAL DEFAULT 0,
      imagem_url TEXT,
      thumbnail_url TEXT,
      categoria TEXT DEFAULT 'escultura',
      colecao TEXT,
      disponivel INTEGER DEFAULT 1,
      destaque INTEGER DEFAULT 0,
      posicao INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS artigos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      conteudo TEXT,
      resumo TEXT,
      imagem_url TEXT,
      categoria TEXT DEFAULT 'geral',
      publicado INTEGER DEFAULT 1,
      posicao INTEGER DEFAULT 0,
      slug TEXT UNIQUE,
      data_publicacao TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS fotos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      legenda TEXT,
      categoria TEXT DEFAULT 'geral',
      posicao INTEGER DEFAULT 0,
      obra_id INTEGER REFERENCES obras(id) ON DELETE SET NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      tipo TEXT DEFAULT 'consultoria',
      preco REAL DEFAULT 0,
      duracao_minutos INTEGER DEFAULT 60,
      disponivel INTEGER DEFAULT 1,
      posicao INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TRIGGER IF NOT EXISTS obras_updated_at
      AFTER UPDATE ON obras
      BEGIN
        UPDATE obras SET updated_at = datetime('now') WHERE id = NEW.id;
      END;

    CREATE TRIGGER IF NOT EXISTS artigos_updated_at
      AFTER UPDATE ON artigos
      BEGIN
        UPDATE artigos SET updated_at = datetime('now') WHERE id = NEW.id;
      END;
  `);

  // Seed admin if not exists
  const adminExists = database.prepare('SELECT id FROM admin WHERE username = ?')
    .get(process.env.ADMIN_USER || 'admin');

  if (!adminExists) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASS || 'admin123', 12);
    database.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)')
      .run(process.env.ADMIN_USER || 'admin', hash);
    console.log('✓ Admin user created');
  }

  // Seed sample obras if empty
  const obrasCount = database.prepare('SELECT COUNT(*) as count FROM obras').get();
  if (obrasCount.count === 0) {
    const insertObra = database.prepare(`
      INSERT INTO obras (titulo, descricao, preco, imagem_url, categoria, colecao, posicao)
      VALUES (@titulo, @descricao, @preco, @imagem_url, @categoria, @colecao, @posicao)
    `);

    const obras = [
      {
        titulo: 'La-Cosechera',
        descricao: 'Escultura em tronco de eucalipto original, 40cm de altura, inspirada na força e beleza do Pampa Uruguaio. Peça única, da coleção URUGUAY.',
        preco: 6600,
        imagem_url: 'assets/art/la-cosechera.jpg',
        categoria: 'escultura',
        colecao: 'URUGUAY',
        posicao: 0
      },
      {
        titulo: 'El Cuerpo',
        descricao: 'Escultura em dormente de trem reciclado com base em tronco de pinus, medindo 1,20 m de altura e 36 cm de diâmetro. Peça única da coleção URUGUAY.',
        preco: 11500,
        imagem_url: 'assets/art/el-cuerpo.jpg',
        categoria: 'escultura',
        colecao: 'URUGUAY',
        posicao: 1
      },
      {
        titulo: 'MetaMorpheus',
        descricao: 'Escultura em viga de ipê de demolição, com 37 cm de altura por 22 cm de diâmetro, peça única da coleção Metamorphosis.',
        preco: 8200,
        imagem_url: 'assets/art/metamorpheus.jpg',
        categoria: 'escultura',
        colecao: 'Metamorphosis',
        posicao: 2
      }
    ];

    obras.forEach(o => insertObra.run(o));
    console.log('✓ Sample obras seeded');
  }

  console.log('✓ Database initialized at', DB_PATH);
  return database;
}

module.exports = { getDB, initDB };
