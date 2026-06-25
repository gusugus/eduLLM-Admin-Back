const prisma = require('../config/prisma');

class RolRepository {
  async findById(id, select = null) {
    const query = { where: { id_rol: id } };
    if (select) query.select = select;
    return await prisma.rol.findUnique(query);
  }

  async findAll(select = null) {
    const query = {};
    if (select) query.select = select;
    return await prisma.rol.findMany(query);
  }
}

module.exports = new RolRepository();
