const prisma = require('../config/prisma');

class SubjectRepository {
  async findAll(estadosPermitidos = [1]) {
    const where = estadosPermitidos.length > 0 ? { id_estado: { in: estadosPermitidos } } : {};

    return await prisma.info_materia.findMany({
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        id_estado: true
      },
      where
    });
  }

  async findById(id) {
    return await prisma.info_materia.findUnique({
      where: { id_materia: parseInt(id) },
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        id_estado: true
      }
    });
  }

  async create(data) {
    return await prisma.info_materia.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        nombre_normalizado: data.nombre_normalizado || null,
        id_estado: data.id_estado || 1,
        usuario_creacion: data.usuario_creacion || null
      },
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        id_estado: true
      }
    });
  }

  async update(id, data) {
    return await prisma.info_materia.update({
      where: { id_materia: parseInt(id) },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        nombre_normalizado: data.nombre_normalizado,
        id_estado: data.id_estado,
        usuario_modificacion: data.usuario_modificacion || null,
        fecha_modificacion: new Date()
      },
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        id_estado: true
      }
    });
  }

  async delete(id, usuarioModificacion = null) {
    return await prisma.info_materia.update({
      where: { id_materia: parseInt(id) },
      data: {
        id_estado: 4,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion
      }
    });
  }
}

module.exports = new SubjectRepository();
