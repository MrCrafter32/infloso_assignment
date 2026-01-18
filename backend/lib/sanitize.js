// filepath: c:\Projects\infloso_assignment\backend\lib\sanitize.js
const validator = require('validator');

const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return validator.escape(validator.trim(value));
};

const sanitizeEmail = (value) => {
  if (typeof value !== 'string') return value;
  const trimmed = validator.trim(value);
  const normalized = validator.normalizeEmail(trimmed) || trimmed;
  return validator.escape(normalized);
};

module.exports = { sanitizeString, sanitizeEmail };
