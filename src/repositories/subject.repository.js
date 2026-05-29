// TODO: Implementar con Prisma cuando se haga db pull
const prisma = require('../config/prisma');

class SubjectRepository {
  async findAll() {
    // return await prisma.subject.findMany();
    return [];
  }

  async findById(id) {
    // return await prisma.subject.findUnique({ where: { id } });
    return null;
  }

  async create(data) {
    // return await prisma.subject.create({ data });
    return { id: 1, ...data };
  }

  async update(id, data) {
    // return await prisma.subject.update({ where: { id }, data });
    return { id, ...data };
  }

  async delete(id) {
    // return await prisma.subject.delete({ where: { id } });
    return true;
  }
}

module.exports = new SubjectRepository();