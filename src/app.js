const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const logger = require('./config/logger');
const { errorHandler } = require('./middlewares/errorHandler');
const { logRequest } = require('./middlewares/logger.middleware');
const routes = require('./routes');

const app = express();

// Seguridad básica (puede moverse al gateway)
app.use(helmet());
app.use(cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Logging de cada request
app.use(logRequest);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/v1', routes);

// Manejador de errores (siempre al final)
app.use(errorHandler);

module.exports = app;