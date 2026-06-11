const prisma = require('../config/prisma');

class GradoRepository {
  async findAll() {
    return await prisma.tbl_m_grado.findMany({
      orderBy: [{ grado: 'asc' }, { paralelo: 'asc' }]
    });
  }

  async findById(id) {
    return await prisma.tbl_m_grado.findUnique({
      where: { id_grado: parseInt(id) }
    });
  }

  async findByGradoAndParalelo(grado, paralelo, excludeId = null) {
    const where = { grado: parseInt(grado), paralelo };
    if (excludeId) where.id_grado = { not: parseInt(excludeId) };
    return await prisma.tbl_m_grado.findFirst({ where });
  }

  async create(data) {
    const maxResult = await prisma.$queryRaw`SELECT COALESCE(MAX(id_grado), 0) + 1 AS next_id FROM comun.tbl_m_grado`;
    const nextId = Number(maxResult[0].next_id);

    return await prisma.tbl_m_grado.create({
      data: {
        id_grado: nextId,
        grado: data.grado !== undefined ? parseInt(data.grado) : null,
        paralelo: data.paralelo || null
      }
    });
  }

  async update(id, data) {
    return await prisma.tbl_m_grado.update({
      where: { id_grado: parseInt(id) },
      data
    });
  }

  async delete(id) {
    return await prisma.tbl_m_grado.delete({
      where: { id_grado: parseInt(id) }
    });
  }
}

module.exports = new GradoRepository();
