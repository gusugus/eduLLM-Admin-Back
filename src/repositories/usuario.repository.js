const prisma = require('../config/prisma');

class UsuarioRepository {
  async findFirst(where, tx = null) {
    const client = tx || prisma;
    return await client.usuario.findFirst({ where });
  }

  async findById(id, select = null, tx = null) {
    const client = tx || prisma;
    const query = { where: { id_usuario: parseInt(id) } };
    if (select) query.select = select;
    return await client.usuario.findUnique(query);
  }

  async findMany(where = {}, select = null, tx = null) {
    const client = tx || prisma;
    const query = { where };
    if (select) query.select = select;
    return await client.usuario.findMany(query);
  }

  async findByUsername(username, select = null, tx = null) {
    const client = tx || prisma;
    const query = { where: { username } };
    if (select) query.select = select;
    return await client.usuario.findUnique(query);
  }

  async create(data, tx = null) {
    const client = tx || prisma;
    return await client.usuario.create({ data });
  }

  async update(id, data, tx = null) {
    const client = tx || prisma;
    return await client.usuario.update({
      where: { id_usuario: parseInt(id) },
      data
    });
  }

  async findUsernamesStartingWith(base) {
    const users = await prisma.usuario.findMany({
      where: { username: { startsWith: base } },
      select: { username: true }
    });
    return users.map(u => u.username);
  }
}

module.exports = new UsuarioRepository();
