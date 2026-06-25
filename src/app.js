const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');
const { errorHandler } = require('./middlewares/errorHandler');
const { logRequest } = require('./middlewares/logger.middleware');
const authMiddleware = require('./middlewares/auth.middleware');
const { requireRole } = require('./middlewares/role.middleware');
const { globalSanitizer } = require('./middlewares/sanitize.middleware');
const routes = require('./routes');

const path = require('path');
const app = express();

// Seguridad básica (CORS lo maneja el gateway)
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 200,
}));

// Archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging de cada request
app.use(logRequest);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cookie-parser')());

// Auth middleware (débil: no bloquea, solo decodifica si hay token válido)
app.use(authMiddleware);

// Bloqueo por rol — solo administradores
app.use('/api/admin', requireRole('ROLE_ADMINISTRADOR'));

// Sanitización global automática
app.use(globalSanitizer);

// Rutas
app.use('/api/admin', routes);

// Manejador de errores (siempre al final)
app.use(errorHandler);

module.exports = app;