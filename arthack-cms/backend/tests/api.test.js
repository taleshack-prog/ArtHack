const request = require('supertest');
const path = require('path');

// Use test DB
process.env.DB_PATH = path.join(__dirname, '../data/test.db');
process.env.JWT_SECRET = 'test_secret';
process.env.ADMIN_USER = 'admin';
process.env.ADMIN_PASS = 'admin123';
process.env.NODE_ENV = 'test';

const app = require('../server');

let token = '';

describe('Auth', () => {
  it('POST /api/auth/login — valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('POST /api/auth/login — invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me — authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('admin');
  });
});

describe('Obras', () => {
  let obraId;

  it('GET /api/obras — public access', async () => {
    const res = await request(app).get('/api/obras');
    expect(res.status).toBe(200);
    expect(res.body.obras).toBeInstanceOf(Array);
  });

  it('POST /api/obras — creates obra (authenticated)', async () => {
    const res = await request(app)
      .post('/api/obras')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Teste Escultura', preco: 1500, categoria: 'escultura' });
    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe('Teste Escultura');
    obraId = res.body.id;
  });

  it('POST /api/obras — rejects unauthenticated', async () => {
    const res = await request(app)
      .post('/api/obras')
      .send({ titulo: 'Sem auth' });
    expect(res.status).toBe(401);
  });

  it('PUT /api/obras/:id — updates obra', async () => {
    const res = await request(app)
      .put(`/api/obras/${obraId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ preco: 2000, titulo: 'Escultura Atualizada' });
    expect(res.status).toBe(200);
    expect(res.body.preco).toBe(2000);
  });

  it('DELETE /api/obras/:id — deletes obra', async () => {
    const res = await request(app)
      .delete(`/api/obras/${obraId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('Artigos', () => {
  let artigoId;

  it('GET /api/artigos — lists published', async () => {
    const res = await request(app).get('/api/artigos');
    expect(res.status).toBe(200);
    expect(res.body.artigos).toBeInstanceOf(Array);
  });

  it('POST /api/artigos — creates artigo', async () => {
    const res = await request(app)
      .post('/api/artigos')
      .set('Authorization', `Bearer ${token}`)
      .send({ titulo: 'Teste Artigo', conteudo: '<p>Conteúdo</p>', categoria: 'geral' });
    expect(res.status).toBe(201);
    expect(res.body.slug).toBeDefined();
    artigoId = res.body.id;
  });

  it('GET /api/artigos/:id — by id', async () => {
    const res = await request(app).get(`/api/artigos/${artigoId}`);
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe('Teste Artigo');
  });

  it('DELETE /api/artigos/:id — deletes artigo', async () => {
    const res = await request(app)
      .delete(`/api/artigos/${artigoId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('Health', () => {
  it('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

// Cleanup test DB
afterAll(async () => {
  const fs = require('fs');
  const dbPath = path.join(__dirname, '../data/test.db');
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
});
