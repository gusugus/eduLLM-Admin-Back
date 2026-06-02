const prisma = require('../config/prisma');
const ESTADOS = require('../constants/estados');

class ProfessorRepository {
  async findAll(estadosPermitidos = [ESTADOS.ACTIVO]) {
  const where = estadosPermitidos.length > 0 ? { id_estado: { in: estadosPermitidos } } : {};

    return await prisma.profesor.findMany({
      select: {
        id_profesor: true,
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
      },
      where 
    });
  }

  async findById(id) {
    return await prisma.profesor.findUnique({
      where: { id_profesor: parseInt(id) },
      select: {
        id_profesor: true,
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
        profesor_materia: {
          select: {
            id_profesor_materia: true,
            id_periodo_lectivo: true,
            info_materia: {
              select: {
                id_materia: true,
                nombre: true,
                descripcion: true,
                nombre_normalizado: true
              }
            }
          }
        }
      }
    });
  }

  async create(data) {
    return await prisma.profesor.create({
      data: {
        id_usuario: data.id_usuario,
        id_estado: data.id_estado || ESTADOS.ACTIVO,
        usuario_creacion: data.usuario_creacion || null
      },
      select: {
        id_profesor: true,
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
    return await prisma.profesor.update({
      where: { id_profesor: parseInt(id) },
      data: {
        id_estado: data.id_estado,
        usuario_modificacion: data.usuario_modificacion || null,
        fecha_modificacion: new Date()
      },
      select: {
        id_profesor: true,
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
  return await prisma.profesor.update({
    where: { id_profesor: parseInt(id) },
    data: {
      id_estado: ESTADOS.ELIMINADO,
      fecha_modificacion: new Date(),
      usuario_modificacion: usuarioModificacion
    }
  });
}

}

module.exports = new ProfessorRepository();