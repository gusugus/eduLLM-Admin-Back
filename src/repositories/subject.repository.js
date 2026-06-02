const prisma = require('../config/prisma');
const ESTADOS = require('../constants/estados');

class SubjectRepository {
  async findAll(estadosPermitidos = [ESTADOS.ACTIVO]) {
    const where = estadosPermitidos.length > 0 ? { id_estado: { in: estadosPermitidos } } : {};

    return await prisma.materia.findMany({
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        id_estado: true,
        id_grado: true,
        grado: {
          select: { id_grado: true, grado: true, paralelo: true }
        }
      },
      where
    });
  }

  async findById(id) {
    return await prisma.materia.findUnique({
      where: { id_materia: parseInt(id) },
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        id_estado: true,
        id_grado: true,
        grado: {
          select: { id_grado: true, grado: true, paralelo: true }
        }
      }
    });
  }

  async create(data) {
    return await prisma.materia.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        nombre_normalizado: data.nombre_normalizado || null,
        id_estado: data.id_estado || ESTADOS.ACTIVO,
        usuario_creacion: data.usuario_creacion || null,
        id_grado: data.id_grado || null
      },
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        id_estado: true,
        id_grado: true,
        grado: {
          select: { id_grado: true, grado: true, paralelo: true }
        }
      }
    });
  }

  async update(id, data) {
    const updateData = {
      descripcion: data.descripcion,
      id_estado: data.id_estado,
      usuario_modificacion: data.usuario_modificacion || null,
      fecha_modificacion: new Date()
    };
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.nombre_normalizado !== undefined) updateData.nombre_normalizado = data.nombre_normalizado;
    if (data.id_grado !== undefined) updateData.id_grado = data.id_grado;

    return await prisma.materia.update({
      where: { id_materia: parseInt(id) },
      data: updateData,
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        id_estado: true,
        id_grado: true,
        grado: {
          select: { id_grado: true, grado: true, paralelo: true }
        }
      }
    });
  }

  async delete(id, usuarioModificacion = null) {
    return await prisma.materia.update({
      where: { id_materia: parseInt(id) },
      data: {
        id_estado: ESTADOS.ELIMINADO,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion
      }
    });
  }
}

module.exports = new SubjectRepository();
