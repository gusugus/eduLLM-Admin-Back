const logger = require('../config/logger');

const ADMIN_ROLE = 'ROLE_ADMINISTRADOR';

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.rol;

    if (!userRole) {
      logger.warn(`Role check: usuario sin rol en ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a este recurso.'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      logger.warn(`Role check: ${userRole} no autorizado para ${req.originalUrl}`);
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para acceder a esta página.'
      });
    }

    next();
  };
};

module.exports = { requireRole };
