'use strict';

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const apiRoutes = require('./routes/public');
const { pool } = require('./db');

const ROOT = path.resolve(__dirname, '..');
const app = express();

app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", 'data:'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://jsonplaceholder.typicode.com'],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  }
}));
app.use(express.json({ limit: '8mb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));

app.use('/api', apiRoutes);

// Solo se exponen directorios públicos; la configuración, el servidor y las pruebas no se sirven.
app.use('/css', express.static(path.join(ROOT, 'css'), { maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
app.use('/js', express.static(path.join(ROOT, 'js'), { maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0 }));
app.use('/assets', express.static(path.join(ROOT, 'assets'), { maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0 }));

app.get(['/', '/index.html'], (_req, res) => res.sendFile(path.join(ROOT, 'index.html')));
const PAGINAS_PERMITIDAS = new Set([
  'admin.html', 'clases.html', 'contacto.html', 'dashboard.html', 'detalle-clase.html',
  'entrenadores.html', 'perfil-entrenador.html', 'planes.html', 'registro.html'
]);
app.get('/pages/:pagina', (req, res, next) => {
  if (!PAGINAS_PERMITIDAS.has(req.params.pagina)) return res.status(404).send('Página no encontrada.');
  res.sendFile(path.join(ROOT, 'pages', req.params.pagina), (error) => { if (error) next(error); });
});

app.use((_req, res) => res.status(404).json({ error: 'Recurso no encontrado.' }));

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'El contenido enviado supera el tamaño permitido.' });
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'El formato JSON enviado no es válido.' });
  }
  console.error('[api] Error inesperado:', error.message);
  res.status(500).json({ error: 'Ocurrió un error interno. Intenta nuevamente más tarde.' });
});

async function cerrarServidor() {
  try { await pool.end(); } catch (error) { console.error('[db] No se pudo cerrar el pool:', error.message); }
}

module.exports = { app, cerrarServidor };
