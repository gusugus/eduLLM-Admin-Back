const prisma = require('../config/prisma');

class GradoRepository {
  async findAll() {
    return await prisma.grado.findMany({
      orderBy: [{ grado: 'asc' }, { paralelo: 'asc' }]
    });
  }

  async findById(id) {
    return await prisma.grado.findUnique({
      where: { id_grado: parseInt(id) }
    });
  }

  async findByGradoAndParalelo(grado, paralelo, excludeId = null) {
    const where = { grado: parseInt(grado), paralelo };
    if (excludeId) where.id_grado = { not: parseInt(excludeId) };
    return await prisma.grado.findFirst({ where });
  }

  async create(data) {
    return await prisma.grado.create({
      data: {
        grado: data.grado,
        paralelo: data.paralelo
      }
    });
  }

  async update(id, data) {
    return await prisma.grado.update({
      where: { id_grado: parseInt(id) },
      data
    });
  }

  async delete(id) {
    return await prisma.grado.delete({
      where: { id_grado: parseInt(id) }
    });
  }
}

module.exports = new GradoRepository();
