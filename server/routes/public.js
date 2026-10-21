'use strict';

const express = require('express');
const { rateLimit } = require('express-rate-limit');
const { pool } = require('../db');
const { validarRegistro, validarContacto, COLECCIONES_PUBLICAS } = require('../validation');
const { exigirAdministrador, crearToken, compararSeguro } = require('../auth');

const router = express.Router();

const limiteFormularios = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Has enviado varias solicitudes en poco tiempo. Intenta nuevamente más tarde.' }
});

const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de acceso. Espera unos minutos e inténtalo otra vez.' }
});

router.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'ok' });
  } catch (error) {
    console.error('[health] PostgreSQL no responde:', error.message);
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

router.post('/contact', limiteFormularios, async (req, res, next) => {
  const validacion = validarContacto(req.body);
  if (!validacion.ok) return res.status(400).json({ error: validacion.errores[0], errors: validacion.errores });
  const { nombre, correo, telefono, asunto, mensaje } = validacion.datos;
  try {
    const resultado = await pool.query(
      `INSERT INTO contact_messages (nombre, correo, telefono, asunto, mensaje)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [nombre, correo, telefono, asunto, mensaje]
    );
    res.status(201).json({ ok: true, message: 'Mensaje recibido correctamente.', id: resultado.rows[0].id });
  } catch (error) { next(error); }
});

router.post('/register', limiteFormularios, async (req, res, next) => {
  const validacion = validarRegistro(req.body);
  if (!validacion.ok) return res.status(400).json({ error: validacion.errores[0], errors: validacion.errores });
  const d = validacion.datos;
  try {
    const resultado = await pool.query(
      `INSERT INTO members
        (nombre, correo, telefono, documento, fecha_nacimiento, plan, metodo_pago_preferido)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, nombre, correo, telefono, documento, fecha_nacimiento, plan, estado, created_at`,
      [d.nombre, d.correo, d.telefono, d.documento, d.fecha, d.plan, d.metodoPago || 'Por definir']
    );
    res.status(201).json({
      ok: true,
      message: 'Solicitud de membresía recibida. FitZone se pondrá en contacto para confirmar los siguientes pasos.',
      member: resultado.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: error.constraint === 'members_documento_uq'
        ? 'Ya existe una membresía registrada con ese documento.'
        : 'Ya existe una membresía registrada con ese correo electrónico.' });
    }
    next(error);
  }
});

router.get('/content/:nombre', async (req, res, next) => {
  const { nombre } = req.params;
  if (!COLECCIONES_PUBLICAS.has(nombre)) return res.status(404).json({ error: 'Contenido no encontrado.' });
  try {
    const resultado = await pool.query('SELECT datos FROM site_collections WHERE nombre = $1', [nombre]);
    res.json({ data: resultado.rows[0]?.datos ?? null });
  } catch (error) { next(error); }
});

router.post('/admin/login', limiteLogin, (req, res) => {
  const usuario = typeof req.body?.usuario === 'string' ? req.body.usuario.trim() : '';
  const clave = typeof req.body?.clave === 'string' ? req.body.clave : '';
  const usuarioCorrecto = compararSeguro(usuario, process.env.ADMIN_USERNAME || '');
  const claveCorrecta = compararSeguro(clave, process.env.ADMIN_PASSWORD || '');
  if (!usuarioCorrecto || !claveCorrecta) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }
  res.json({ ok: true, token: crearToken(usuario), expiresIn: 28800 });
});

router.get('/admin/session', exigirAdministrador, (req, res) => {
  res.json({ ok: true, usuario: req.admin.usuario });
});

router.get('/admin/members', exigirAdministrador, async (_req, res, next) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nombre, correo, telefono, documento, fecha_nacimiento AS fecha,
              plan, estado, metodo_pago_preferido AS "metodoPago", created_at
       FROM members ORDER BY created_at DESC, id DESC`
    );
    res.json({ data: resultado.rows });
  } catch (error) { next(error); }
});

router.put('/admin/members', exigirAdministrador, async (req, res, next) => {
  const usuarios = req.body?.data;
  if (!Array.isArray(usuarios) || usuarios.length > 500) {
    return res.status(400).json({ error: 'La lista de miembros no es válida.' });
  }
  const normalizados = [];
  const emails = new Set();
  for (const item of usuarios) {
    const id = Number.isSafeInteger(Number(item?.id)) && Number(item.id) > 0 ? Number(item.id) : null;
    const nombre = typeof item?.nombre === 'string' ? item.nombre.trim().slice(0, 120) : '';
    const correo = typeof item?.correo === 'string' ? item.correo.trim().toLowerCase().slice(0, 254) : '';
    const plan = typeof item?.plan === 'string' ? item.plan.trim() : '';
    const estado = typeof item?.estado === 'string' ? item.estado.trim() : 'Activo';
    if (nombre.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return res.status(400).json({ error: 'Uno de los miembros tiene nombre o correo no válido.' });
    }
    if (!['Básico', 'Premium', 'Profesional'].includes(plan) || !['Pendiente', 'Activo', 'Inactivo'].includes(estado)) {
      return res.status(400).json({ error: 'Uno de los miembros tiene plan o estado no válido.' });
    }
    if (emails.has(correo)) return res.status(400).json({ error: 'Hay correos duplicados en la lista.' });
    emails.add(correo);
    normalizados.push({ id, nombre, correo, plan, estado });
  }

  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const idsConservados = [];
    for (const item of normalizados) {
      let idGuardado = null;
      if (item.id) {
        const actualizado = await cliente.query(
          `UPDATE members SET nombre = $2, correo = $3, plan = $4, estado = $5, updated_at = NOW()
           WHERE id = $1 RETURNING id`,
          [item.id, item.nombre, item.correo, item.plan, item.estado]
        );
        if (actualizado.rowCount) idGuardado = actualizado.rows[0].id;
      }
      if (!idGuardado) {
        const insertado = await cliente.query(
          `INSERT INTO members (nombre, correo, telefono, documento, fecha_nacimiento, plan, estado, metodo_pago_preferido)
           VALUES ($1, $2, '', $3, DATE '2000-01-01', $4, $5, 'Por definir')
           ON CONFLICT ((LOWER(correo))) DO UPDATE SET nombre = EXCLUDED.nombre, correo = EXCLUDED.correo,
             plan = EXCLUDED.plan, estado = EXCLUDED.estado, updated_at = NOW()
           RETURNING id`,
          [item.nombre, item.correo, `FITZONE-DASH-${item.correo}`, item.plan, item.estado]
        );
        idGuardado = insertado.rows[0].id;
      }
      idsConservados.push(String(idGuardado));
    }

    if (idsConservados.length === 0) {
      await cliente.query('DELETE FROM members');
    } else {
      await cliente.query('DELETE FROM members WHERE NOT (id = ANY($1::bigint[]))', [idsConservados]);
    }
    await cliente.query('COMMIT');
    res.json({ ok: true, count: normalizados.length });
  } catch (error) {
    await cliente.query('ROLLBACK');
    if (error.code === '23505') return res.status(409).json({ error: 'Hay un correo o documento duplicado en la base de datos.' });
    next(error);
  } finally { cliente.release(); }
});

router.get('/admin/messages', exigirAdministrador, async (_req, res, next) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nombre, correo, telefono, asunto, mensaje, leido, created_at
       FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT 200`
    );
    res.json({ data: resultado.rows });
  } catch (error) { next(error); }
});

router.patch('/admin/messages/:id/read', exigirAdministrador, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Identificador de mensaje no válido.' });
  try {
    const resultado = await pool.query('UPDATE contact_messages SET leido = $1 WHERE id = $2 RETURNING id', [req.body?.leido === true, id]);
    if (!resultado.rowCount) return res.status(404).json({ error: 'No se encontró el mensaje.' });
    res.json({ ok: true });
  } catch (error) { next(error); }
});

router.delete('/admin/messages/:id', exigirAdministrador, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Identificador de mensaje no válido.' });
  try {
    const resultado = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [id]);
    if (!resultado.rowCount) return res.status(404).json({ error: 'No se encontró el mensaje.' });
    res.json({ ok: true });
  } catch (error) { next(error); }
});

router.get('/admin/collections/:nombre', exigirAdministrador, async (req, res, next) => {
  const { nombre } = req.params;
  if (!COLECCIONES_PUBLICAS.has(nombre)) return res.status(404).json({ error: 'Colección no permitida.' });
  try {
    const resultado = await pool.query('SELECT datos FROM site_collections WHERE nombre = $1', [nombre]);
    res.json({ data: resultado.rows[0]?.datos ?? null });
  } catch (error) { next(error); }
});

router.put('/admin/collections/:nombre', exigirAdministrador, async (req, res, next) => {
  const { nombre } = req.params;
  const datos = req.body?.data;
  if (!COLECCIONES_PUBLICAS.has(nombre)) return res.status(404).json({ error: 'Colección no permitida.' });
  if (!Array.isArray(datos) || datos.length > 200) return res.status(400).json({ error: 'La lista de contenido no es válida (máximo 200 elementos).' });
  try {
    await pool.query(
      `INSERT INTO site_collections (nombre, datos) VALUES ($1, $2::jsonb)
       ON CONFLICT (nombre) DO UPDATE SET datos = EXCLUDED.datos, updated_at = NOW()`,
      [nombre, JSON.stringify(datos)]
    );
    res.json({ ok: true, count: datos.length });
  } catch (error) { next(error); }
});

module.exports = router;
