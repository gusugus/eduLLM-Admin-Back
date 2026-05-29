// TODO: Implementar con Prisma cuando se haga db pull
const prisma = require('../config/prisma');

class StudentRepository {
  async findAll() {
    // return await prisma.student.findMany();
    return [];
  }

  async findById(id) {
    // return await prisma.student.findUnique({ where: { id } });
    return null;
  }

  async create(data) {
    // return await prisma.student.create({ data });
    return { id: 1, ...data };
  }

  async update(id, data) {
    // return await prisma.student.update({ where: { id }, data });
    return { id, ...data };
  }

  async delete(id) {
    // return await prisma.student.delete({ where: { id } });
    return true;
  }
}

module.exports = new StudentRepository();