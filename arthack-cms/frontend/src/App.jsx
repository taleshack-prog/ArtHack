import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Masonry from 'react-masonry-css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const STATIC_FALLBACK = import.meta.env.VITE_STATIC_FALLBACK || '/arthack-data.json';

// ─── Data fetching with static fallback ────────────────────────────────────
async function fetchData(endpoint, fallbackKey) {
  try {
    const res = await axios.get(`${API_URL}${endpoint}`, { timeout: 5000 });
    return res.data[fallbackKey] || res.data;
  } catch {
    try {
      const res = await axios.get(STATIC_FALLBACK);
      return res.data[fallbackKey] || [];
    } catch {
      return [];
    }
  }
}

// ─── Components ────────────────────────────────────────────────────────────

function Nav({ darkMode, toggleDark }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-stone-950/95 backdrop-blur-md border-b border-stone-800/50 shadow-xl' : 'bg-transparent'}`}
    >
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#home" className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          Tales <span className="text-amber-400">Hack</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {[['#home','Início'],['#gallery','Galeria'],['#blog','Blog'],['#contato','Contato']].map(([href, label]) => (
            <a key={href} href={href} className="text-sm text-stone-400 hover:text-white transition-colors">{label}</a>
          ))}
          <button onClick={toggleDark} className="text-stone-400 hover:text-white transition-colors text-sm">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <a href="https://linknabio.gg/tales-hack" className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Assinar
          </a>
        </div>

        {/* Mobile menu */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-stone-400 hover:text-white">☰</button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-stone-950 border-t border-stone-800 px-6 pb-4"
          >
            {[['#home','Início'],['#gallery','Galeria'],['#blog','Blog'],['#contato','Contato']].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block py-3 text-stone-400 hover:text-white transition-colors border-b border-stone-800 last:border-0">{label}</a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Hero() {
  const [config, setConfig] = useState({});
  useEffect(() => {
    fetch('http://localhost:3001/api/configuracoes')
      .then(r => r.json())
      .then(setConfig)
      .catch(() => {});
  }, []);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax bg */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 30% 50%, rgba(217,119,6,0.08) 0%, transparent 60%), radial-gradient(circle at 70% 20%, rgba(120,80,40,0.05) 0%, transparent 40%)`
        }} />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className="text-amber-400 text-sm font-medium tracking-[0.2em] uppercase mb-4">Artista Plástico · Porto Alegre</p>
            <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              {(config.hero_titulo || 'Tales Hack').split(' ')[0]}<br />
              <span className="text-amber-400">{(config.hero_titulo || 'Tales Hack').split(' ')[1]}</span>
            </h1>
            <p className="text-stone-400 text-lg leading-relaxed max-w-md mb-8">
              Escultor, pesquisador em neurodivergência. Transformando matéria em linguagem — madeira, tempo e significado.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#gallery" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5">
                Ver Galeria
              </a>
              <a href="/ArtHack/sobre" className="border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white px-6 py-3 rounded-xl transition-all">
                Minha História
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative"
        >
          <div className="relative rounded-2xl overflow-hidden aspect-[3/4] max-w-sm mx-auto lg:mx-0 lg:ml-auto">
            <img src={config.hero_foto || 'assets/familia.jpeg'} alt={config.hero_titulo || 'Tales Hack'} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
          </div>
          {/* Floating badge */}
          <div className="absolute -bottom-4 -left-4 bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 shadow-xl">
            <p className="text-xs text-stone-500">Coleção em destaque</p>
            <p className="text-sm font-semibold text-amber-400">URUGUAY</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-stone-600 text-xs flex flex-col items-center gap-2"
      >
        <span>scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-stone-600 to-transparent" />
      </motion.div>
    </section>
  );
}

function Specialties() {
  const items = [
    { icon: '🧠', title: 'Neurodivergência', desc: 'Estratégias científicas para transformar desafios em forças criativas.' },
    { icon: '🌳', title: 'Bonsai', desc: 'Técnicas milenares, filosofia zen e aplicações para equilíbrio.' },
    { icon: '🗿', title: 'Escultura', desc: 'Madeiras raras trabalhadas em forma e textura, coleções autorais.' },
  ];

  return (
    <section className="py-24 px-6 bg-stone-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Especialidades</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Onde Arte e Ciência se Encontram
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-stone-900 border border-stone-800 rounded-2xl p-7 hover:border-amber-500/30 transition-all hover:-translate-y-1 group"
            >
              <div className="text-4xl mb-5">{item.icon}</div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-amber-400 transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                {item.title}
              </h3>
              <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [lightbox, setLightbox] = useState(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    fetchData('/obras?sort=posicao&disponivel=true&limit=50', 'obras')
      .then(data => setObras(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const categorias = ['todas', ...new Set(obras.map(o => o.categoria).filter(Boolean))];
  const filtered = filter === 'todas' ? obras : obras.filter(o => o.categoria === filter);
  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  const breakpoints = { default: 3, 1024: 3, 768: 2, 640: 1 };

  return (
    <section id="gallery" className="py-24 px-6 bg-gradient-to-b from-stone-950 to-stone-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Portfólio</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Galeria de Obras Originais
          </h2>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {categorias.map(cat => (
              <button
                key={cat}
                onClick={() => { setFilter(cat); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm transition-all capitalize ${filter === cat ? 'bg-amber-500 text-stone-950 font-semibold' : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="bg-stone-800 rounded-2xl h-96 animate-pulse" />)}
          </div>
        ) : (
          <>
            <Masonry breakpointCols={breakpoints} className="flex gap-6" columnClassName="flex flex-col gap-6">
              {paginated.map((obra, i) => (
                <motion.article
                  key={obra.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
                  className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden group hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative overflow-hidden cursor-pointer" onClick={() => setLightbox(obra.imagem_url)}>
                    <img
                      src={obra.thumbnail_url || obra.imagem_url}
                      alt={obra.titulo}
                      loading="lazy"
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      style={{ minHeight: '200px' }}
                    />
                    {obra.imagem_secundaria && (
                      <div
                        className="absolute bottom-3 right-3 w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20 shadow-xl cursor-pointer hover:scale-110 transition-transform"
                        onClick={e => { e.stopPropagation(); setLightbox(obra.imagem_secundaria); }}
                      >
                        <img src={obra.imagem_secundaria} alt="Detalhe" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-white/90 text-stone-900 text-xs font-medium px-3 py-1.5 rounded-full">Ver ampliado</span>
                    </div>
                    {Boolean(obra.destaque) && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-stone-950 text-xs font-bold px-2 py-1 rounded-full">Destaque</div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{obra.titulo}</h3>
                    {obra.colecao && <p className="text-xs text-amber-400 mb-2">Coleção {obra.colecao}</p>}
                    <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-3">{obra.descricao}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-green-400">
                        R$ {Number(obra.preco).toLocaleString('pt-BR')}
                      </p>
                      <div className="flex gap-2">
                        <a
                          href="https://linknabio.gg/tales-hack"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                        >
                          Adquirir
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </Masonry>

            {hasMore && (
              <div className="text-center mt-10">
                <button onClick={() => setPage(p => p + 1)} className="border border-stone-700 hover:border-amber-500 text-stone-400 hover:text-amber-400 px-8 py-3 rounded-xl transition-all text-sm">
                  Carregar mais obras
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-6 cursor-pointer"
          >
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-8 text-white/60 hover:text-white text-4xl transition-colors">×</button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightbox}
              alt="Obra ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-default"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Blog() {
  const [artigos, setArtigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaAtiva, setCategoriaAtiva] = useState('todas');
  const categorias = ['todas', 'neurodivergência', 'bonsai', 'artes plásticas', 'jiu-jitsu'];
  const artigosFiltrados = categoriaAtiva === 'todas' ? artigos : artigos.filter(a => a.categoria === categoriaAtiva);

  useEffect(() => {
    fetchData('/artigos?limit=4&sort=posicao', 'artigos')
      .then(data => setArtigos(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const getCatIcon = (cat) => ({
    'neurodivergência': '🧠', 'bonsai': '🌳', 'artes plásticas': '🎨', 'jiu-jitsu': '🥋'
  }[cat] || '✍️');

  return (
    <section id="blog" className="py-24 px-6 bg-stone-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Blog</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Novidades & Artigos
            </h2>
          </div>
          <a href="blog/" className="text-sm text-stone-500 hover:text-amber-400 transition-colors hidden md:block">
            Ver todos →
          </a>
        </motion.div>

        {/* Filtros de categoria */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`px-4 py-1.5 rounded-full text-xs transition-all capitalize ${categoriaAtiva === cat ? 'bg-amber-500 text-stone-950 font-semibold' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'}`}
            >
              {cat === 'neurodivergência' ? '🧠 ' : cat === 'bonsai' ? '🌳 ' : cat === 'artes plásticas' ? '🎨 ' : cat === 'jiu-jitsu' ? '🥋 ' : ''}
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className="bg-stone-800 rounded-2xl h-48 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {artigosFiltrados.map((artigo, i) => (
              <motion.article
                key={artigo.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-amber-500/30 hover:-translate-y-1 transition-all group"
              >
                <div className="text-3xl mb-4">{getCatIcon(artigo.categoria)}</div>
                <p className="text-xs text-stone-600 mb-2 capitalize">{artigo.categoria} · {new Date(artigo.data_publicacao || artigo.created_at).toLocaleDateString('pt-BR')}</p>
                <h3 className="text-sm font-bold mb-2 group-hover:text-amber-400 transition-colors line-clamp-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {artigo.titulo}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed line-clamp-3 mb-4">{artigo.resumo}</p>
                <a href={`/ArtHack/artigo/${artigo.id}`} className="text-xs text-amber-400 hover:text-amber-300 font-medium">
                  Ler mais →
                </a>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Ebook() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-stone-900 to-stone-950">
      <div className="max-w-4xl mx-auto">
        <motion.a
          href="https://taleshack-prog.github.io/antifr-gil-blindado-ebook/"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          whileHover={{ y: -4 }}
          className="flex flex-col md:flex-row items-center gap-8 bg-stone-900 border border-stone-700 rounded-2xl p-8 hover:border-amber-500/40 transition-all shadow-2xl group"
        >
          <img
            src="Generatedimage_1764336359238.png"
            alt="Antifrágil Blindado"
            className="w-36 rounded-xl shadow-xl flex-shrink-0"
          />
          <div className="text-center md:text-left">
            <p className="text-xs text-amber-400 tracking-widest uppercase mb-2">E-book Gratuito</p>
            <h3 className="text-2xl font-bold mb-3 group-hover:text-amber-400 transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
              Antifrágil Blindado
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed max-w-lg">
              Guia prático para famílias neurodivergentes: artes, jiu-jitsu, natureza e autocompreensão como ferramentas de transformação.
            </p>
          </div>
          <div className="md:ml-auto flex-shrink-0">
            <span className="bg-amber-500 group-hover:bg-amber-400 text-stone-950 font-semibold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap">
              Acessar →
            </span>
          </div>
        </motion.a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-stone-950 border-t border-stone-800/50 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            Tales <span className="text-amber-400">Hack</span>
          </p>
          <p className="text-stone-600 text-xs mt-1">Artista Plástico · Porto Alegre, RS</p>
        </div>
        <div className="flex gap-6">
          {[['#gallery','Galeria'],['#blog','Blog'],['membros/','Membros']].map(([href, label]) => (
            <a key={href} href={href} className="text-stone-600 hover:text-stone-300 text-sm transition-colors">{label}</a>
          ))}
        </div>
        <p className="text-stone-700 text-xs">© 2025 Tales Hack · Todos os direitos reservados</p>
      </div>
    </footer>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <HelmetProvider>
      <Helmet>
        <title>Tales Hack · Artista Plástico & Escultor</title>
        <meta name="description" content="Portfólio de Tales Hack — escultor, pesquisador em neurodivergência e arte plástica. Obras originais, coleções URUGUAY e Metamorphosis." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
      </Helmet>

      <div className={darkMode ? 'dark' : ''} style={{ background: '#0c0a09', color: '#e7e5e4', minHeight: '100vh' }}>
        <Nav darkMode={darkMode} toggleDark={() => setDarkMode(!darkMode)} />
        <Hero />
        <Specialties />
        <Gallery />
        <Blog />
        <Ebook />
        <Footer />
      </div>
    </HelmetProvider>
  );
}
