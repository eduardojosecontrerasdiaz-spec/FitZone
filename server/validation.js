'use strict';

const PLANES_PERMITIDOS = new Set(['Básico', 'Premium', 'Profesional']);
const METODOS_PAGO_PERMITIDOS = new Set(['Tarjeta', 'Transferencia', 'Efectivo', 'Por definir', '']);
const COLECCIONES_PUBLICAS = new Set(['entrenadores', 'clases', 'servicios']);

function texto(valor, maximo = 500) {
  return typeof valor === 'string' ? valor.trim().slice(0, maximo) : '';
}

function correoValido(valor) {
  const correo = texto(valor, 254);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function fechaISOValida(valor) {
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  return fecha.getUTCFullYear() === anio
    && fecha.getUTCMonth() === mes - 1
    && fecha.getUTCDate() === dia;
}

function validarRegistro(body = {}) {
  const datos = {
    nombre: texto(body.nombre, 120),
    correo: texto(body.correo, 254).toLowerCase(),
    telefono: texto(body.telefono, 40),
    documento: texto(body.documento, 40),
    fecha: texto(body.fecha, 10),
    plan: texto(body.plan, 30),
    metodoPago: texto(body.metodoPago, 30)
  };

  const errores = [];
  if (datos.nombre.length < 3) errores.push('Escribe tu nombre completo (mínimo 3 caracteres).');
  if (!correoValido(datos.correo)) errores.push('Escribe un correo electrónico válido.');
  if (datos.telefono.length < 7) errores.push('Escribe un teléfono válido.');
  if (datos.documento.length < 4) errores.push('Escribe un documento válido.');
  if (!fechaISOValida(datos.fecha)) errores.push('La fecha no es válida.');
  if (!PLANES_PERMITIDOS.has(datos.plan)) errores.push('El plan seleccionado no es válido.');
  if (!METODOS_PAGO_PERMITIDOS.has(datos.metodoPago)) errores.push('La preferencia de pago no es válida.');

  return { ok: errores.length === 0, errores, datos };
}

function validarContacto(body = {}) {
  const datos = {
    nombre: texto(body.nombre, 120),
    correo: texto(body.correo, 254).toLowerCase(),
    telefono: texto(body.telefono, 40),
    asunto: texto(body.asunto, 160),
    mensaje: texto(body.mensaje, 4000)
  };
  const errores = [];
  if (datos.nombre.length < 3) errores.push('Escribe tu nombre completo.');
  if (!correoValido(datos.correo)) errores.push('Escribe un correo electrónico válido.');
  if (datos.telefono.length < 7) errores.push('Escribe un teléfono válido.');
  if (datos.asunto.length < 3) errores.push('Escribe el asunto del mensaje.');
  if (datos.mensaje.length < 10) errores.push('El mensaje debe tener al menos 10 caracteres.');
  return { ok: errores.length === 0, errores, datos };
}

function validarColeccion(nombre, datos) {
  return COLECCIONES_PUBLICAS.has(nombre)
    && Array.isArray(datos)
    && datos.length <= 200;
}

module.exports = {
  PLANES_PERMITIDOS,
  COLECCIONES_PUBLICAS,
  validarRegistro,
  validarContacto,
  validarColeccion,
  correoValido,
  fechaISOValida
};
