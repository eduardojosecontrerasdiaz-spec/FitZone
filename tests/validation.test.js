'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validarRegistro, validarContacto, validarColeccion, correoValido, fechaISOValida, normalizarNombre
} = require('../server/validation');

const registroValido = {
  nombre: 'María Pérez', correo: 'Maria@Example.com', telefono: '+57 300-123-4567',
  documento: ' 123.456.789 ', fecha: '1998-06-15', plan: 'Básico',
  metodoPago: 'Transferencia', consentimiento: true
};

test('acepta un registro válido y normaliza nombre, correo, teléfono y documento', () => {
  const resultado = validarRegistro(registroValido);
  assert.equal(resultado.ok, true);
  assert.equal(resultado.datos.nombre, 'María Pérez');
  assert.equal(resultado.datos.correo, 'maria@example.com');
  assert.equal(resultado.datos.telefono, '+573001234567');
  assert.equal(resultado.datos.documento, '123456789');
});

test('rechaza correo, plan y fecha inválidos', () => {
  const resultado = validarRegistro({ ...registroValido, correo: 'correo-mal', plan: 'Diamante', fecha: '1998-02-31' });
  assert.equal(resultado.ok, false);
  assert.ok(resultado.errores.length >= 3);
});

test('rechaza solicitud sin consentimiento explícito', () => {
  const resultado = validarRegistro({ ...registroValido, consentimiento: false });
  assert.equal(resultado.ok, false);
  assert.ok(resultado.errores.some((error) => error.includes('política')));
});

test('valida contacto y exige consentimiento explícito', () => {
  const base = { nombre: 'Ana María', correo: 'ana@example.com', telefono: '3001234567', asunto: 'Horarios', mensaje: 'Quiero conocer sus horarios.', consentimiento: true };
  assert.equal(validarContacto(base).ok, true);
  assert.equal(validarContacto({ ...base, consentimiento: false }).ok, false);
  assert.equal(validarContacto({ ...base, nombre: 'A', correo: 'x', telefono: '1', asunto: '', mensaje: 'Hola' }).ok, false);
});

test('permite solo colecciones previstas y limita elementos y propiedades', () => {
  assert.equal(validarColeccion('servicios', []), true);
  assert.equal(validarColeccion('miembros', []), false);
  assert.equal(validarColeccion('clases', Array(201).fill({})), false);
  assert.equal(validarColeccion('clases', [{ nombre: 'Yoga', descripcion: 'Clase' }]), true);
  assert.equal(validarColeccion('clases', [{ nombre: 'Yoga', __proto__: { admin: true } }]), true);
  assert.equal(validarColeccion('clases', [{ nombre: 'Yoga', campoDesconocido: 'dato' }]), false);
  assert.equal(validarColeccion('clases', [{ nombre: 'x', foto: 'data:text/html;base64,PHNjcmlwdD4=' }]), false);
  assert.equal(validarColeccion('clases', [{ nombre: 'x', foto: 'data:image/png;base64,AAAA' }]), true);
  assert.equal(validarColeccion('clases', [{ nombre: 'x', url: 'http://sitio.test' }]), false);
});

test('rechaza fechas imposibles, no solo formatos incorrectos', () => {
  assert.equal(fechaISOValida('2000-02-29'), true);
  assert.equal(fechaISOValida('2001-02-29'), false);
  assert.equal(fechaISOValida('2000-13-01'), false);
  assert.equal(validarRegistro({ ...registroValido, fecha: '1998-02-31' }).ok, false);
});

test('valida correo sin aceptar espacios', () => {
  assert.equal(correoValido('fitzone@example.com'), true);
  assert.equal(correoValido('fitzone example.com'), false);
});

test('normaliza mayúsculas y espacios en nombres sin inventar ortografía', () => {
  assert.equal(normalizarNombre('   pEdRo   DE   la   cruz '), 'Pedro de la Cruz');
  assert.equal(normalizarNombre('MARÍA PÉREZ'), 'María Pérez');
  assert.equal(normalizarNombre('peddro'), 'Peddro');
});
