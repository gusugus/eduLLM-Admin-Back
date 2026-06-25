const prisma = require('../config/prisma');

class PeriodoRepository {
  async findFirst(where, select = null) {
    const query = { where };
    if (select) query.select = select;
    return await prisma.periodo_lectivo.findFirst(query);
  }

  async findMany(where = {}, select = null) {
    const query = { where };
    if (select) query.select = select;
    return await prisma.periodo_lectivo.findMany(query);
  }
}

module.exports = new PeriodoRepository();
