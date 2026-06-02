const { body, query, param } = require('express-validator');
const validator = require('validator');

/**
 * Sanitización global automática: limpia req.body, req.query, req.params
 * usando validator. Se aplica a todas las rutas.
 */
const globalSanitizer = (req, _res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return validator.trim(validator.escape(value));
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (value && typeof value === 'object') {
      return sanitizeObject(value);
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeValue(value);
    }
    return result;
  };

  if (req.body && typeof req.body === 'object' && !(req.body instanceof Buffer)) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Middleware express-validator para rutas de login/registro.
 * Sanitiza y valida campos comunes.
 */
const sanitizeAuth = [
  body('username').trim().toLowerCase().escape(),
  body('password').trim(),
];

/**
 * Sanitiza campos de nombre (primer_nombre, segundo_nombre, apellido_paterno, etc.)
 */
const sanitizeNameFields = [
  body(['primer_nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno'])
    .trim()
    .escape()
    .customSanitizer(value => {
      if (typeof value !== 'string') return value;
      return value.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s.'-]/g, '');
    }),
];

/**
 * Sanitiza email
 */
const sanitizeEmailFields = [
  body(['correo', 'email'])
    .trim()
    .normalizeEmail({ all_lowercase: true })
    .escape(),
];

/**
 * Sanitiza username
 */
const sanitizeUsernameFields = [
  body('username')
    .trim()
    .toLowerCase()
    .escape()
    .customSanitizer(value => {
      if (typeof value !== 'string') return value;
      return value.replace(/[^a-zA-Z0-9_-]/g, '');
    }),
];

/**
 * Sanitiza cédula
 */
const sanitizeCedulaFields = [
  body('cedula')
    .trim()
    .customSanitizer(value => {
      if (typeof value !== 'string') return value;
      return value.replace(/\D/g, '');
    }),
];

/**
 * Sanitiza campos de texto libre (nombre, descripcion, titulo)
 */
const sanitizeTextFields = [
  body(['nombre', 'descripcion', 'titulo'])
    .trim()
    .escape(),
];

/**
 * Sanitización completa para formularios de estudiantes.
 * Se puede componer combinando los arrays de sanitización.
 */
const sanitizeStudent = [
  ...sanitizeCedulaFields,
  ...sanitizeNameFields,
  ...sanitizeEmailFields,
  body('username').trim().toLowerCase().escape(),
  body('password').optional().trim(),
];

const sanitizeProfessor = [
  ...sanitizeCedulaFields,
  ...sanitizeNameFields,
  ...sanitizeEmailFields,
  body('username').trim().toLowerCase().escape(),
  body('password').optional().trim(),
];

const sanitizeSubject = [
  body('nombre')
    .trim()
    .escape(),
  body('id_grado')
    .toInt()
    .isInt({ min: 1 }).withMessage('El curso es requerido'),
];

const sanitizeGrado = [
  body('grado').trim().escape(),
  body('paralelo').trim().escape(),
];

module.exports = {
  globalSanitizer,
  sanitizeAuth,
  sanitizeNameFields,
  sanitizeEmailFields,
  sanitizeUsernameFields,
  sanitizeCedulaFields,
  sanitizeTextFields,
  sanitizeStudent,
  sanitizeProfessor,
  sanitizeSubject,
  sanitizeGrado,
};
