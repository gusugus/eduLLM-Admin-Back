const logger = require('../config/logger');

const authMiddleware = (req, res, next) => {
  const idUsuario = req.headers['x-user-id'];
  const rol = req.headers['x-user-role'];
  const username = req.headers['x-username'];

  if (idUsuario) {
    req.user = {
      id_usuario: parseInt(idUsuario, 10),
      rol: rol || null,
      username: username || null,
    };
    logger.info(`Auth: usuario ${idUsuario} (${username || 'desconocido'}) autenticado vía Gateway`);
  } else {
    logger.debug('Auth: sin headers de Gateway — request sin autenticar');
  }

  next();
};

module.exports = authMiddleware;