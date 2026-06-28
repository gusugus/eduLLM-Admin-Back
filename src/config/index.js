require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  gatewayUrl: process.env.GATEWAY_URL || 'http://localhost:8085',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://auth-ms:8080',
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
};