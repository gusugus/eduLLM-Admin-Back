const prisma = require('../config/prisma');
const ESTADOS = require('../constants/estados');

class SubjectRepository {
  async findAll(soloActivos = true) {
    const where = soloActivos ? { estado: true } : {};

    return await prisma.tbl_m_materia.findMany({
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        estado: true,
        grado_id: true,
        tbl_m_grado: {
          select: { id_grado: true, grado: true, paralelo: true }
        }
      },
      where
    });
  }

  async findById(id) {
    return await prisma.tbl_m_materia.findUnique({
      where: { id_materia: parseInt(id) },
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        estado: true,
        grado_id: true,
        tbl_m_grado: {
          select: { id_grado: true, grado: true, paralelo: true }
        }
      }
    });
  }

  async create(data) {
    return await prisma.tbl_m_materia.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        nombre_normalizado: data.nombre_normalizado || null,
        estado: true,
        usuario_creacion: data.usuario_creacion || null,
        grado_id: data.id_grado || null
      },
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        estado: true,
        grado_id: true,
        tbl_m_grado: {
          select: { id_grado: true, grado: true, paralelo: true }
        }
      }
    });
  }

  async update(id, data) {
    const updateData = {
      descripcion: data.descripcion,
      usuario_modificacion: data.usuario_modificacion || null,
      fecha_modificacion: new Date()
    };
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.nombre_normalizado !== undefined) updateData.nombre_normalizado = data.nombre_normalizado;
    if (data.id_grado !== undefined) updateData.grado_id = data.id_grado;
    if (data.estado !== undefined) updateData.estado = data.estado;

    return await prisma.tbl_m_materia.update({
      where: { id_materia: parseInt(id) },
      data: updateData,
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        estado: true,
        grado_id: true,
        tbl_m_grado: {
          select: { id_grado: true, grado: true, paralelo: true }
        }
      }
    });
  }

  async delete(id, usuarioModificacion = null) {
    return await prisma.tbl_m_materia.update({
      where: { id_materia: parseInt(id) },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion
      }
    });
  }
}

module.exports = new SubjectRepository();
