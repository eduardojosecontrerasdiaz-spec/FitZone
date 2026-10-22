'use strict';

const PLANES_PERMITIDOS = new Set(['Básico', 'Premium', 'Profesional']);
const METODOS_PAGO_PERMITIDOS = new Set(['Tarjeta', 'Transferencia', 'Efectivo', 'Por definir', '']);
const COLECCIONES_PUBLICAS = new Set(['entrenadores', 'clases', 'servicios']);
const PARTICULAS_NOMBRE = new Set(['de', 'del', 'la', 'las', 'los', 'y']);
const CAMPOS_COLECCION = new Set([
  'id', 'nombre', 'titulo', 'descripcion', 'foto', 'imagen', 'nivel', 'duracion',
  'horario', 'instructor', 'especialidad', 'experiencia', 'precio', 'beneficios',
  'icono', 'activo', 'orden', 'detalles', 'categoria', 'modalidad', 'color', 'url',
  'enlace', 'ubicacion', 'telefono', 'correo'
]);

function texto(valor, maximo = 500, permitirSaltos = false) {
  if (typeof valor !== 'string') return '';
  const controles = permitirSaltos ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  return valor.normalize('NFC').replace(controles, '').trim().slice(0, maximo);
}

// Normaliza espacios y mayúsculas de nombres sin inventar la ortografía de la persona.
function normalizarNombre(valor) {
  const entrada = texto(valor, 120).replace(/\s+/g, ' ');
  if (!entrada) return '';
  return entrada.toLocaleLowerCase('es-CO').split(' ').map((palabra, indice) => {
    return palabra.split(/([-'])/).map((parte, subindice) => {
      if (parte === '-' || parte === "'") return parte;
      if (indice > 0 && subindice === 0 && PARTICULAS_NOMBRE.has(parte)) return parte;
      return parte.replace(/^[\p{L}]/u, (letra) => letra.toLocaleUpperCase('es-CO'));
    }).join('');
  }).join(' ');
}

function normalizarTelefono(valor) {
  return texto(valor, 40).replace(/[\s().-]/g, '');
}

function normalizarDocumento(valor) {
  return texto(valor, 40).replace(/[\s.-]/g, '').toLocaleUpperCase('es-CO');
}

function correoValido(valor) {
  const correo = texto(valor, 254).toLowerCase();
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
    nombre: normalizarNombre(body.nombre),
    correo: texto(body.correo, 254).toLowerCase(),
    telefono: normalizarTelefono(body.telefono),
    documento: normalizarDocumento(body.documento),
    fecha: texto(body.fecha, 10),
    plan: texto(body.plan, 30),
    metodoPago: texto(body.metodoPago, 30),
    consentimiento: body.consentimiento === true
  };

  const errores = [];
  if (datos.nombre.length < 3 || !/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(datos.nombre)) {
    errores.push('Escribe un nombre válido de al menos 3 caracteres.');
  }
  if (!correoValido(datos.correo)) errores.push('Escribe un correo electrónico válido.');
  if (!/^\+?\d{7,15}$/.test(datos.telefono)) errores.push('Escribe un teléfono válido (7 a 15 dígitos).');
  if (!/^[\p{L}\d]{4,40}$/u.test(datos.documento)) errores.push('Escribe un documento válido.');
  if (!fechaISOValida(datos.fecha)) errores.push('La fecha no es válida.');
  if (!PLANES_PERMITIDOS.has(datos.plan)) errores.push('El plan seleccionado no es válido.');
  if (!METODOS_PAGO_PERMITIDOS.has(datos.metodoPago)) errores.push('La preferencia de pago no es válida.');
  if (!datos.consentimiento) errores.push('Debes aceptar la política de tratamiento de datos para enviar la solicitud.');

  return { ok: errores.length === 0, errores, datos };
}

function validarContacto(body = {}) {
  const datos = {
    nombre: normalizarNombre(body.nombre),
    correo: texto(body.correo, 254).toLowerCase(),
    telefono: normalizarTelefono(body.telefono),
    asunto: texto(body.asunto, 160),
    mensaje: texto(body.mensaje, 4000, true),
    consentimiento: body.consentimiento === true
  };
  const errores = [];
  if (datos.nombre.length < 3 || !/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(datos.nombre)) errores.push('Escribe un nombre válido.');
  if (!correoValido(datos.correo)) errores.push('Escribe un correo electrónico válido.');
  if (!/^\+?\d{7,15}$/.test(datos.telefono)) errores.push('Escribe un teléfono válido (7 a 15 dígitos).');
  if (datos.asunto.length < 3) errores.push('Escribe el asunto del mensaje.');
  if (datos.mensaje.length < 10) errores.push('El mensaje debe tener al menos 10 caracteres.');
  if (!datos.consentimiento) errores.push('Debes aceptar la política de tratamiento de datos para enviar el mensaje.');
  return { ok: errores.length === 0, errores, datos };
}

function validarColeccion(nombre, datos) {
  if (!COLECCIONES_PUBLICAS.has(nombre) || !Array.isArray(datos) || datos.length > 200) return false;
  return datos.every((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const claves = Object.keys(item);
    if (claves.length > 24 || claves.some((clave) => !CAMPOS_COLECCION.has(clave))) return false;
    return claves.every((clave) => {
      const valor = item[clave];
      if (valor === null || typeof valor === 'boolean') return true;
      if (typeof valor === 'number') return Number.isFinite(valor);
      if (Array.isArray(valor) && clave === 'beneficios') {
        return valor.length <= 30 && valor.every((elemento) => typeof elemento === 'string' && elemento.length <= 300);
      }
      if (typeof valor !== 'string') return false;
      const maximo = ['foto', 'imagen'].includes(clave) ? 700000 : 5000;
      if (valor.length > maximo || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(valor)) return false;
      if (['url', 'enlace'].includes(clave) && /^https?:/i.test(valor)) {
        try { if (new URL(valor).protocol !== 'https:') return false; } catch { return false; }
      }
      if (['foto', 'imagen'].includes(clave) && /^data:/i.test(valor)) {
        return /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/i.test(valor);
      }
      return !/^(javascript|vbscript):/i.test(valor.trim());
    });
  });
}

module.exports = {
  PLANES_PERMITIDOS,
  COLECCIONES_PUBLICAS,
  validarRegistro,
  validarContacto,
  validarColeccion,
  correoValido,
  fechaISOValida,
  normalizarNombre,
  normalizarTelefono,
  normalizarDocumento,
  texto
};
