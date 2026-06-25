const prisma = require('../config/prisma');

class ArchivoRepository {
  async updateMany(where, data, tx = null) {
    const client = tx || prisma;
    return await client.archivo.updateMany({ where, data });
  }

  async create(data, tx = null) {
    const client = tx || prisma;
    return await client.archivo.create({ data });
  }
}

module.exports = new ArchivoRepository();
