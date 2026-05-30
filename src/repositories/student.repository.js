const prisma = require('../config/prisma');

class StudentRepository {
  async findAll(estadosPermitidos = [1]) {
    const where = estadosPermitidos.length > 0 ? { id_estado: { in: estadosPermitidos } } : {};

    return await prisma.admin_estudiante.findMany({
      select: {
        id_estudiante: true,
        codigo_estudiante: true,
        grado: true,
        grupo: true,
        id_estado: true,
        admin_usuario: {
          select: {
            id_usuario: true,
            cedula: true,
            username: true,
            primer_nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            correo: true,
            id_rol: true
          }
        },
      },
      where
    });
  }

  async findById(id) {
    return await prisma.admin_estudiante.findUnique({
      where: { id_estudiante: parseInt(id) },
      select: {
        id_estudiante: true,
        id_usuario: true,
        codigo_estudiante: true,
        grado: true,
        grupo: true,
        id_estado: true,
        admin_usuario: {
          select: {
            id_usuario: true,
            cedula: true,
            username: true,
            primer_nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            correo: true,
            id_rol: true
          }
        },
        estudiante_materia: {
          select: {
            id_estudiante_materia: true,
            id_periodo_lectivo: true,
            info_materia: {
              select: {
                id_materia: true,
                nombre: true,
                descripcion: true
              }
            }
          }
        }
      }
    });
  }

  async create(data) {
    return await prisma.admin_estudiante.create({
      data: {
        id_usuario: data.id_usuario,
        codigo_estudiante: data.codigo_estudiante || null,
        grado: data.grado || null,
        grupo: data.grupo || null,
        id_estado: data.id_estado || 1,
        usuario_creacion: data.usuario_creacion || null
      },
      select: {
        id_estudiante: true,
        id_usuario: true,
        codigo_estudiante: true,
        grado: true,
        grupo: true,
        admin_usuario: {
          select: {
            id_usuario: true,
            primer_nombre: true,
            apellido_paterno: true,
            correo: true
          }
        }
      }
    });
  }

  async update(id, data) {
    return await prisma.admin_estudiante.update({
      where: { id_estudiante: parseInt(id) },
      data: {
        codigo_estudiante: data.codigo_estudiante,
        grado: data.grado,
        grupo: data.grupo,
        id_estado: data.id_estado,
        usuario_modificacion: data.usuario_modificacion || null,
        fecha_modificacion: new Date()
      },
      select: {
        id_estudiante: true,
        id_usuario: true,
        codigo_estudiante: true,
        grado: true,
        grupo: true,
        admin_usuario: {
          select: {
            id_usuario: true,
            primer_nombre: true,
            apellido_paterno: true,
            correo: true
          }
        }
      }
    });
  }

  async delete(id, usuarioModificacion = null) {
    return await prisma.admin_estudiante.update({
      where: { id_estudiante: parseInt(id) },
      data: {
        id_estado: 4,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion
      }
    });
  }
}

module.exports = new StudentRepository();
