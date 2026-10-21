'use strict';

const crypto = require('node:crypto');

const DURACION_TOKEN_SEGUNDOS = 8 * 60 * 60;

function firma(contenido) {
  return crypto.createHmac('sha256', process.env.SESSION_SECRET).update(contenido).digest('base64url');
}

function crearToken(usuario) {
  const payload = Buffer.from(JSON.stringify({
    sub: usuario,
    exp: Math.floor(Date.now() / 1000) + DURACION_TOKEN_SEGUNDOS
  })).toString('base64url');
  return `${payload}.${firma(payload)}`;
}

function compararSeguro(a, b) {
  const valorA = Buffer.from(String(a));
  const valorB = Buffer.from(String(b));
  if (valorA.length !== valorB.length) return false;
  return crypto.timingSafeEqual(valorA, valorB);
}

function verificarToken(token) {
  if (typeof token !== 'string' || token.length > 2048) return null;
  const partes = token.split('.');
  if (partes.length !== 2) return null;
  const [payload, firmaRecibida] = partes;
  const firmaEsperada = firma(payload);
  if (!compararSeguro(firmaRecibida, firmaEsperada)) return null;
  try {
    const datos = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!datos.sub || !Number.isInteger(datos.exp) || datos.exp <= Math.floor(Date.now() / 1000)) return null;
    if (!compararSeguro(datos.sub, process.env.ADMIN_USERNAME || '')) return null;
    return datos;
  } catch {
    return null;
  }
}

function exigirAdministrador(req, res, next) {
  const cabecera = req.get('authorization') || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : '';
  const usuario = verificarToken(token);
  if (!usuario) return res.status(401).json({ error: 'Sesión vencida o no autorizada. Inicia sesión nuevamente.' });
  req.admin = { usuario: usuario.sub };
  next();
}

module.exports = { crearToken, compararSeguro, verificarToken, exigirAdministrador };
