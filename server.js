require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/config/logger');
const initRoles = require('./src/config/roles.init');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 8002;

async function start() {
  try {
    await initRoles();
    logger.info('Roles cargados correctamente');
  } catch (err) {
    logger.error('Error al cargar roles:', err);
  }

  const server = app.listen(PORT, HOST, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
}

start();