require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/config/logger');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 8002;

const server = app.listen(PORT, HOST, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});