'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SESSION_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.ADMIN_USERNAME = 'fitzone-test-admin';

const { crearToken, verificarToken, compararSeguro } = require('../server/auth');

test('crea una sesión firmada y la valida solo para el administrador configurado', () => {
  const token = crearToken(process.env.ADMIN_USERNAME);
  assert.equal(verificarToken(token)?.sub, process.env.ADMIN_USERNAME);
  assert.equal(verificarToken(token + 'x'), null);
  assert.equal(verificarToken('not-a-token'), null);
});

test('compara credenciales sin aceptar valores distintos', () => {
  assert.equal(compararSeguro('secreto-largo', 'secreto-largo'), true);
  assert.equal(compararSeguro('secreto-largo', 'secreto-corto'), false);
});
