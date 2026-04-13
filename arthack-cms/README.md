# ArtHack CMS — Monorepo

Sistema de gerenciamento de conteúdo completo para o portfólio [taleshack-prog.github.io/ArtHack](https://taleshack-prog.github.io/ArtHack/).

```
arthack-cms/
├── backend/          → API Node.js + Express + SQLite
├── dashboard/        → Admin React + Vite + Electron (app desktop)
├── frontend/         → Portfólio React + Vite + Framer Motion
└── package.json      → Scripts do monorepo
```

---

## Início Rápido

### 1. Instalar dependências

```bash
npm run install:all
```

### 2. Configurar o backend

```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` com suas credenciais:

```env
JWT_SECRET=troque_este_valor_secreto_aqui
ADMIN_USER=admin
ADMIN_PASS=suaSenhaSegura123
CLOUDINARY_CLOUD_NAME=seu_cloud_name   # opcional
CLOUDINARY_API_KEY=sua_api_key         # opcional
CLOUDINARY_API_SECRET=seu_api_secret   # opcional
```

### 3. Rodar tudo em desenvolvimento

```bash
npm run dev
```

Isso inicia simultaneamente:
- **Backend API** → http://localhost:3001
- **Frontend** (portfólio) → http://localhost:5173
- **Dashboard** (admin) → http://localhost:5174

---

## Dashboard como App Desktop (Electron)

### Desenvolvimento com janela Electron:

```bash
npm run electron
```

### Build do instalador Windows (.exe):

```bash
npm run build:electron:win
```

O instalador será gerado em `dashboard/dist-electron/`.  
Após instalado, aparece no Desktop e no Menu Iniciar como **"ArtHack CMS"**.

### Build Mac (.dmg) / Linux (.AppImage):

```bash
cd dashboard
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

---

## Deploy

### Backend → Railway (gratuito)

1. Crie conta em [railway.app](https://railway.app)
2. Novo projeto → "Deploy from GitHub repo" → selecione a pasta `backend/`
3. Configure variáveis de ambiente no painel Railway:
   ```
   JWT_SECRET=valor_secreto
   ADMIN_USER=admin
   ADMIN_PASS=sua_senha
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   NODE_ENV=production
   ```
4. Anote a URL gerada (ex: `https://arthack-api.railway.app`)

### Frontend → GitHub Pages

1. Edite `frontend/vite.config.js`:
   ```js
   base: '/ArtHack/',
   build: { outDir: '../docs' }
   ```
2. Crie `frontend/.env.production`:
   ```env
   VITE_API_URL=https://arthack-api.railway.app/api
   VITE_STATIC_FALLBACK=/ArtHack/arthack-data.json
   ```
3. Build e push:
   ```bash
   npm run build:frontend
   git add docs/ && git commit -m "deploy frontend"
   git push
   ```
4. No GitHub → Settings → Pages → Source: `main /docs`

### Export JSON (fallback offline)

No dashboard, clique em **"Exportar JSON"** e faça upload do arquivo como `docs/arthack-data.json` no repositório. O frontend usa esse arquivo automaticamente se a API estiver offline.

---

## Schema do Banco de Dados (SQLite)

```sql
-- Obras de arte
CREATE TABLE obras (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo        TEXT    NOT NULL,
  descricao     TEXT,
  preco         REAL    DEFAULT 0,
  imagem_url    TEXT,
  thumbnail_url TEXT,
  categoria     TEXT    DEFAULT 'escultura',
  colecao       TEXT,
  disponivel    INTEGER DEFAULT 1,   -- 1=disponível, 0=vendida
  destaque      INTEGER DEFAULT 0,
  posicao       INTEGER DEFAULT 0,   -- ordem de exibição
  created_at    TEXT    DEFAULT (datetime('now')),
  updated_at    TEXT    DEFAULT (datetime('now'))
);

-- Artigos do blog
CREATE TABLE artigos (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo           TEXT    NOT NULL,
  conteudo         TEXT,             -- HTML do Quill editor
  resumo           TEXT,
  imagem_url       TEXT,
  categoria        TEXT    DEFAULT 'geral',
  publicado        INTEGER DEFAULT 1,
  posicao          INTEGER DEFAULT 0,
  slug             TEXT    UNIQUE,   -- URL amigável
  data_publicacao  TEXT    DEFAULT (datetime('now')),
  created_at       TEXT    DEFAULT (datetime('now')),
  updated_at       TEXT    DEFAULT (datetime('now'))
);

-- Fotos e sessões
CREATE TABLE fotos (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  url           TEXT    NOT NULL,
  thumbnail_url TEXT,
  legenda       TEXT,
  categoria     TEXT    DEFAULT 'geral',
  posicao       INTEGER DEFAULT 0,
  obra_id       INTEGER REFERENCES obras(id) ON DELETE SET NULL,
  created_at    TEXT    DEFAULT (datetime('now'))
);

-- Admin
CREATE TABLE admin (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    UNIQUE NOT NULL,
  password_hash TEXT    NOT NULL,    -- bcrypt
  created_at    TEXT    DEFAULT (datetime('now'))
);
```

---

## API Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/login` | ❌ | Login (retorna JWT) |
| GET | `/api/auth/me` | ✅ | Dados do admin logado |
| GET | `/api/obras` | ❌ | Listar obras (filtros: categoria, colecao, disponivel) |
| GET | `/api/obras/:id` | ❌ | Obra por ID |
| POST | `/api/obras` | ✅ | Criar obra |
| PUT | `/api/obras/:id` | ✅ | Atualizar obra |
| PUT | `/api/obras/batch/reorder` | ✅ | Reordenar obras (drag-drop) |
| DELETE | `/api/obras/:id` | ✅ | Deletar obra |
| GET | `/api/artigos` | ❌ | Listar artigos publicados |
| GET | `/api/artigos/:id` | ❌ | Artigo por ID ou slug |
| POST | `/api/artigos` | ✅ | Criar artigo |
| PUT | `/api/artigos/:id` | ✅ | Atualizar artigo |
| PUT | `/api/artigos/batch/reorder` | ✅ | Reordenar artigos |
| DELETE | `/api/artigos/:id` | ✅ | Deletar artigo |
| GET | `/api/fotos` | ❌ | Listar fotos |
| POST | `/api/fotos` | ✅ | Criar registro de foto |
| DELETE | `/api/fotos/:id` | ✅ | Deletar foto |
| POST | `/api/upload/image` | ✅ | Upload imagem (→ Cloudinary ou local) |
| GET | `/api/export/json` | ✅ | Exportar tudo como JSON |
| GET | `/api/export/static` | ❌ | JSON público para fallback |
| GET | `/api/health` | ❌ | Health check |

### Exemplo de login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Exemplo de criar obra:
```bash
curl -X POST http://localhost:3001/api/obras \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Nova Escultura","preco":5000,"categoria":"escultura","disponivel":true}'
```

---

## Cloudinary (upload de imagens)

1. Crie conta gratuita em [cloudinary.com](https://cloudinary.com) (25GB grátis)
2. Copie Cloud Name, API Key e API Secret do dashboard
3. Cole no `backend/.env`

Se não configurar o Cloudinary, as imagens serão salvas localmente em `backend/uploads/` e servidas pela própria API.

---

## Configurações do `.env` do Backend

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3001` | Porta da API |
| `JWT_SECRET` | — | **Obrigatório.** String secreta longa |
| `JWT_EXPIRES_IN` | `7d` | Expiração do token |
| `DB_PATH` | `./data/arthack.db` | Caminho do banco SQLite |
| `ADMIN_USER` | `admin` | Usuário admin |
| `ADMIN_PASS` | `admin123` | **Mude em produção!** |
| `CLOUDINARY_CLOUD_NAME` | — | Opcional |
| `CLOUDINARY_API_KEY` | — | Opcional |
| `CLOUDINARY_API_SECRET` | — | Opcional |
| `FRONTEND_URL` | `http://localhost:5173` | CORS origin do frontend |
| `DASHBOARD_URL` | `http://localhost:5174` | CORS origin do dashboard |

---

## Estrutura de Arquivos Detalhada

```
arthack-cms/
│
├── backend/
│   ├── server.js              # Entry point Express
│   ├── .env.example           # Template de configuração
│   ├── models/
│   │   └── db.js              # SQLite init + schema + seed
│   ├── routes/
│   │   ├── auth.js            # Login, me, change password
│   │   ├── obras.js           # CRUD obras + reorder
│   │   ├── artigos.js         # CRUD artigos + slugify
│   │   ├── fotos.js           # CRUD fotos
│   │   ├── upload.js          # Upload Cloudinary/local + sharp
│   │   └── export.js          # Export JSON
│   ├── middleware/
│   │   └── auth.js            # JWT verify middleware
│   └── data/                  # arthack.db criado aqui
│
├── dashboard/
│   ├── electron/
│   │   ├── main.js            # Electron main process + tray
│   │   └── preload.js         # Context bridge
│   ├── src/
│   │   ├── App.jsx            # Router + auth guard
│   │   ├── api.js             # Axios instance + interceptors
│   │   ├── hooks/
│   │   │   └── useAuth.jsx    # Auth context + localStorage
│   │   ├── components/
│   │   │   └── Layout.jsx     # Sidebar + nav + dark theme
│   │   └── pages/
│   │       ├── Login.jsx      # Tela de login
│   │       ├── Dashboard.jsx  # Stats + ações rápidas
│   │       ├── Obras.jsx      # Lista drag-drop obras
│   │       ├── ObraEditor.jsx # Form edição + upload + preview
│   │       ├── Artigos.jsx    # Lista artigos
│   │       ├── ArtigoEditor.jsx # Editor Quill WYSIWYG
│   │       └── Fotos.jsx      # Upload em massa + galeria
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json           # Electron-builder config
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Portfólio completo
│   │   └── main.jsx
│   ├── vite.config.js         # base: /ArtHack/, outDir: ../docs
│   └── package.json
│
├── package.json               # Scripts do monorepo
└── README.md
```

---

## Checklist de Segurança para Produção

- [ ] Trocar `ADMIN_PASS` para senha forte (mínimo 16 caracteres)
- [ ] Trocar `JWT_SECRET` para string aleatória longa (use `openssl rand -base64 64`)
- [ ] Configurar HTTPS no Railway (automático)
- [ ] Remover `openDevTools()` no Electron main.js
- [ ] Configurar `NODE_ENV=production`
- [ ] Fazer backup periódico do `arthack.db`

---

## Tecnologias

| Camada | Stack |
|--------|-------|
| Backend | Node.js · Express · better-sqlite3 · JWT · bcrypt · Multer · Sharp |
| Dashboard | React · Vite · Tailwind · dnd-kit · Quill.js · React Dropzone |
| Desktop | Electron · electron-builder |
| Frontend | React · Vite · Tailwind · Framer Motion · react-masonry-css · React Helmet |
| Imagens | Cloudinary (cloud) ou local com Sharp (thumbnail auto) |
| Deploy | Railway (backend) · GitHub Pages (frontend) |

---

*ArtHack CMS · Tales Hack © 2025*
