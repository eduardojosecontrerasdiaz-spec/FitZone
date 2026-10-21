'use strict';

require('dotenv').config();

const faltantes = ['DATABASE_URL', 'ADMIN_USERNAME', 'ADMIN_PASSWORD', 'SESSION_SECRET']
  .filter((key) => !process.env[key]);
if (faltantes.length) {
  console.error(`[FitZone] Faltan variables obligatorias: ${faltantes.join(', ')}.`);
  process.exit(1);
}
if (process.env.SESSION_SECRET.length < 32) {
  console.error('[FitZone] SESSION_SECRET debe contener al menos 32 caracteres aleatorios.');
  process.exit(1);
}
if (process.env.ADMIN_PASSWORD.length < 12) {
  console.error('[FitZone] ADMIN_PASSWORD debe contener al menos 12 caracteres.');
  process.exit(1);
}

const { app, cerrarServidor } = require('./app');
const { inicializarEsquema, pool } = require('./db');

async function iniciar() {
  await inicializarEsquema();
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[FitZone] Web y API disponibles en el puerto ${port}.`);
  });

  const parar = async (signal) => {
    console.log(`[FitZone] Recibida señal ${signal}; cerrando con seguridad...`);
    server.close(async () => {
      await cerrarServidor();
      process.exit(0);
    });
  };
  process.once('SIGTERM', () => parar('SIGTERM'));
  process.once('SIGINT', () => parar('SIGINT'));
}

iniciar().catch(async (error) => {
  console.error('[FitZone] No se pudo iniciar:', error.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
