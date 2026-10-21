'use strict';

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL. Configura PostgreSQL en .env o en las variables de Railway.');
}

const opciones = { connectionString: process.env.DATABASE_URL };
if (process.env.PGSSL === 'require') {
  opciones.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(opciones);
pool.on('error', (error) => {
  console.error('[db] Error inesperado en una conexión inactiva:', error.message);
});

async function inicializarEsquema() {
  const sql = `
    CREATE TABLE IF NOT EXISTS members (
      id BIGSERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL,
      telefono TEXT NOT NULL,
      documento TEXT NOT NULL,
      fecha_nacimiento DATE NOT NULL,
      plan TEXT NOT NULL CHECK (plan IN ('Básico', 'Premium', 'Profesional')),
      estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Activo', 'Inactivo')),
      metodo_pago_preferido TEXT NOT NULL DEFAULT 'Por definir',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE members ALTER COLUMN estado SET DEFAULT 'Pendiente';
    ALTER TABLE members DROP CONSTRAINT IF EXISTS members_estado_check;
    ALTER TABLE members ADD CONSTRAINT members_estado_check CHECK (estado IN ('Pendiente', 'Activo', 'Inactivo'));

    CREATE UNIQUE INDEX IF NOT EXISTS members_correo_lower_uq ON members (LOWER(correo));
    CREATE UNIQUE INDEX IF NOT EXISTS members_documento_uq ON members (documento);
    CREATE INDEX IF NOT EXISTS members_created_at_idx ON members (created_at DESC);

    CREATE TABLE IF NOT EXISTS contact_messages (
      id BIGSERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL,
      telefono TEXT NOT NULL,
      asunto TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      leido BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages (created_at DESC);

    CREATE TABLE IF NOT EXISTS site_collections (
      nombre TEXT PRIMARY KEY CHECK (nombre IN ('entrenadores', 'clases', 'servicios')),
      datos JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(datos) = 'array'),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  await pool.query(sql);
}

module.exports = { pool, inicializarEsquema };
