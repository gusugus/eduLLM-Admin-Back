const prisma = require('../config/prisma');
const ESTADOS = require('../constants/estados');

class StudentRepository {
  async findAll(estadosPermitidos = [ESTADOS.ACTIVO]) {
    const where = estadosPermitidos.length > 0 ? { id_estado: { in: estadosPermitidos } } : {};

    return await prisma.estudiante.findMany({
      select: {
        id_estudiante: true,
        id_estado: true,
        usuario: {
          select: {
            id_usuario: true,
            cedula: true,
            username: true,
            primer_nombre: true,
            segundo_nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            correo: true,
            id_rol: true,
            documento: {
              where: { id_estado: ESTADOS.ACTIVO },
              select: { id_documento: true, ruta: true, id_estado: true }
            }
          }
        }
      },
      where
    });
  }

  async findById(id) {
    return await prisma.estudiante.findUnique({
      where: { id_estudiante: parseInt(id) },
      select: {
        id_estudiante: true,
        id_usuario: true,
        id_estado: true,
        usuario: {
          select: {
            id_usuario: true,
            cedula: true,
            username: true,
            primer_nombre: true,
            segundo_nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            correo: true,
            id_rol: true,
            documento: {
              where: { id_estado: ESTADOS.ACTIVO },
              select: { id_documento: true, ruta: true, id_estado: true }
            }
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
    return await prisma.estudiante.create({
      data: {
        id_usuario: data.id_usuario,
        id_estado: data.id_estado || ESTADOS.ACTIVO,
        usuario_creacion: data.usuario_creacion || null
      },
      select: {
        id_estudiante: true,
        id_usuario: true,
        usuario: {
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
    return await prisma.estudiante.update({
      where: { id_estudiante: parseInt(id) },
      data: {
        id_estado: data.id_estado,
        usuario_modificacion: data.usuario_modificacion || null,
        fecha_modificacion: new Date()
      },
      select: {
        id_estudiante: true,
        id_usuario: true,
        usuario: {
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
    return await prisma.estudiante.update({
      where: { id_estudiante: parseInt(id) },
      data: {
        id_estado: ESTADOS.ELIMINADO,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion
      }
    });
  }
}

module.exports = new StudentRepository();
