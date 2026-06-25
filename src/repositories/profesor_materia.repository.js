const prisma = require('../config/prisma');

class ProfesorMateriaRepository {
  async findFirst(where, select = null, tx = null) {
    const client = tx || prisma;
    const query = { where };
    if (select) query.select = select;
    return await client.profesor_materia.findFirst(query);
  }

  async create(data, include = null, tx = null) {
    const client = tx || prisma;
    const query = { data };
    if (include) query.include = include;
    return await client.profesor_materia.create(query);
  }

  async findMany(where = {}, select = null, orderBy = null, pagination = {}) {
    const { skip, take } = pagination;
    const query = { where };
    if (select) query.select = select;
    if (orderBy) query.orderBy = orderBy;
    if (skip) query.skip = skip;
    if (take) query.take = take;
    return await prisma.profesor_materia.findMany(query);
  }

  async update(id, data, tx = null) {
    const client = tx || prisma;
    return await client.profesor_materia.update({
      where: { id_profesor_materia: parseInt(id) },
      data
    });
  }
}

module.exports = new ProfesorMateriaRepository();
