'use strict';

const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL. Configura PostgreSQL en .env o en las variables de Railway.');
}

const opciones = {
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 8000,
  query_timeout: 10000,
  application_name: 'fitzone-api'
};
// En la red privada de Railway no suele hacer falta TLS. Si se exige TLS, valida el certificado.
if (process.env.PGSSL === 'require') {
  opciones.ssl = { rejectUnauthorized: true };
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
      privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
      privacy_policy_version TEXT NOT NULL DEFAULT 'unknown',
      privacy_consent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE members ALTER COLUMN estado SET DEFAULT 'Pendiente';
    ALTER TABLE members DROP CONSTRAINT IF EXISTS members_estado_check;
    ALTER TABLE members ADD CONSTRAINT members_estado_check CHECK (estado IN ('Pendiente', 'Activo', 'Inactivo'));
    ALTER TABLE members ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE members ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT NOT NULL DEFAULT 'unknown';
    ALTER TABLE members ADD COLUMN IF NOT EXISTS privacy_consent_at TIMESTAMPTZ;

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
      privacy_consent BOOLEAN NOT NULL DEFAULT FALSE,
      privacy_policy_version TEXT NOT NULL DEFAULT 'unknown',
      privacy_consent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS privacy_consent BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT NOT NULL DEFAULT 'unknown';
    ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS privacy_consent_at TIMESTAMPTZ;
    CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages (created_at DESC);

    CREATE TABLE IF NOT EXISTS site_collections (
      nombre TEXT PRIMARY KEY CHECK (nombre IN ('entrenadores', 'clases', 'servicios')),
      datos JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(datos) = 'array'),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS security_events (
      id BIGSERIAL PRIMARY KEY,
      event_type VARCHAR(80) NOT NULL,
      severity VARCHAR(16) NOT NULL CHECK (severity IN ('warning', 'high', 'critical')),
      source_ip VARCHAR(64) NOT NULL DEFAULT 'unknown',
      request_path VARCHAR(200) NOT NULL DEFAULT '/',
      http_method VARCHAR(12) NOT NULL DEFAULT 'UNKNOWN',
      user_agent VARCHAR(180) NOT NULL DEFAULT '',
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS security_events_created_at_idx ON security_events (created_at DESC);
    CREATE INDEX IF NOT EXISTS security_events_type_created_at_idx ON security_events (event_type, created_at DESC);
  `;
  await pool.query(sql);
  // Los registros antiguos no deben conservarse indefinidamente. Se eliminan eventos de seguridad
  // con más de 90 días al iniciar el servicio, sin tocar miembros ni mensajes.
  await pool.query("DELETE FROM security_events WHERE created_at < NOW() - INTERVAL '90 days'");
}

module.exports = { pool, inicializarEsquema };
