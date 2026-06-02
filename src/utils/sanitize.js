const stripHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
};

const removeSqlInject = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*|\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/union/gi, '')
    .replace(/drop\s+table/gi, '')
    .replace(/delete\s+from/gi, '')
    .replace(/insert\s+into/gi, '')
    .replace(/exec\b/gi, '')
    .replace(/select\b/gi, '')
    .replace(/alter\b/gi, '')
    .replace(/truncate\b/gi, '');
};

const trimStr = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim();
};

const collapseSpaces = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/\s+/g, ' ');
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return trimStr(collapseSpaces(removeSqlInject(stripHtml(str))));
};

const sanitizeName = (str) => {
  if (typeof str !== 'string') return str;
  return sanitizeString(str)
    .replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s.-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.\s]+|[-.\s]+$/g, '');
};

const sanitizeUsername = (str) => {
  if (typeof str !== 'string') return str;
  return sanitizeString(str).replace(/[^a-zA-Z0-9_-]/g, '');
};

const sanitizeEmail = (str) => {
  if (typeof str !== 'string') return str;
  return sanitizeString(str).toLowerCase();
};

const sanitizeCedula = (str) => {
  if (typeof str !== 'string') return str;
  return sanitizeString(str).replace(/\D/g, '');
};

const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return sanitizeString(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const sanitizeObject = (obj, fieldMap) => {
  const result = { ...obj };
  Object.entries(fieldMap).forEach(([field, sanitizer]) => {
    if (result[field] !== undefined && result[field] !== null) {
      result[field] = sanitizer(result[field]);
    }
  });
  return result;
};

module.exports = {
  sanitizeString, sanitizeName, sanitizeUsername,
  sanitizeEmail, sanitizeCedula, sanitizeText,
  sanitizeObject, stripHtml, removeSqlInject
};
