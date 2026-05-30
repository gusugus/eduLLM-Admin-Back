const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const logger = require('../config/logger');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    logger.info(`Auth: usuario ${decoded.id_usuario || 'desconocido'} autenticado`);
  } catch (err) {
    logger.warn(`Auth: token inválido recibido - ${err.message}`);
  }

  next();
};

module.exports = authMiddleware;