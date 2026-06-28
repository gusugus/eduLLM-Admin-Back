const prisma = require('../config/prisma');
const ESTADOS = require('../constants/estados');

const buildWhere = (search) => {
  if (!search) return {};
  return {
    OR: [
      { grado: { equals: parseInt(search) || 0 } },
      { paralelo: { contains: search, mode: 'insensitive' } },
    ],
  };
};

class GradoRepository {
  async findAll(options = {}, tx = null) {
    const { skip = 0, take = 50, search = '' } = options;
    const client = tx || prisma;
    return await client.grado.findMany({
      where: buildWhere(search),
      skip,
      take,
      orderBy: [{ grado: 'asc' }, { paralelo: 'asc' }]
    });
  }

  async count(search = '', tx = null) {
    const client = tx || prisma;
    return await client.grado.count({
      where: buildWhere(search),
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
    const maxResult = await prisma.$queryRaw`SELECT COALESCE(MAX(id_grado), 0) + 1 AS next_id FROM comun.tbl_m_grado`;
    const nextId = Number(maxResult[0].next_id);

    return await prisma.grado.create({
      data: {
        id_grado: nextId,
        grado: data.grado !== undefined ? parseInt(data.grado) : null,
        paralelo: data.paralelo || null
      }
    });
  }

  async update(id, data) {
    return await prisma.grado.update({
      where: { id_grado: parseInt(id) },
      data
    });
  }

  async delete(id, usuarioModificacion = null) {
    return await prisma.grado.update({
      where: { id_grado: parseInt(id) },
      data: {
        estado: ESTADOS.ELIMINADO,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion
      }
    });
  }

  async activate(id, usuarioModificacion = null) {
    return await prisma.grado.update({
      where: { id_grado: parseInt(id) },
      data: {
        estado: ESTADOS.ACTIVO,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion
      }
    });
  }
}

module.exports = new GradoRepository();
