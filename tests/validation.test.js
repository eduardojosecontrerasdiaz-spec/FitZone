'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validarRegistro, validarContacto, validarColeccion, correoValido, fechaISOValida } = require('../server/validation');

const registroValido = {
  nombre: 'María Pérez', correo: 'maria@example.com', telefono: '3001234567',
  documento: '123456789', fecha: '1998-06-15', plan: 'Básico', metodoPago: 'Transferencia'
};

test('acepta un registro de membresía válido', () => {
  assert.equal(validarRegistro(registroValido).ok, true);
});

test('rechaza correo, plan y fecha inválidos', () => {
  const resultado = validarRegistro({ ...registroValido, correo: 'correo-mal', plan: 'Diamante', fecha: '1998-02-31' });
  assert.equal(resultado.ok, false);
  assert.ok(resultado.errores.length >= 3);
});

test('valida el contacto y recorta los campos', () => {
  assert.equal(validarContacto({ nombre: 'Ana María', correo: 'ana@example.com', telefono: '3001234567', asunto: 'Horarios', mensaje: 'Quiero conocer sus horarios.' }).ok, true);
  assert.equal(validarContacto({ nombre: 'A', correo: 'x', telefono: '1', asunto: '', mensaje: 'Hola' }).ok, false);
});

test('permite solo colecciones públicas previstas y limita el tamaño', () => {
  assert.equal(validarColeccion('servicios', []), true);
  assert.equal(validarColeccion('miembros', []), false);
  assert.equal(validarColeccion('clases', Array(201).fill({})), false);
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
