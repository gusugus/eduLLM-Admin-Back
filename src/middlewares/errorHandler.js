const logger = require('../config/logger');
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Error de Prisma, Zod, etc.
  res.status(500).json({ success: false, message: 'Internal Server Error' });
};

module.exports = { errorHandler };