const prisma = require('../config/prisma');

class ProfessorRepository {
  async findAll(estadosPermitidos = [1]) {
  const where = estadosPermitidos.length > 0 ? { id_estado: { in: estadosPermitidos } } : {};

    return await prisma.admin_profesor.findMany({
      select: {
        id_profesor: true,
        departamento: true,
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
    return await prisma.admin_profesor.findUnique({
      where: { id_profesor: parseInt(id) },
      select: {
        id_profesor: true,
        id_usuario: true,
        departamento: true,
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
    return await prisma.admin_profesor.create({
      data: {
        id_usuario: data.id_usuario,
        departamento: data.departamento,
        id_estado: data.id_estado || 1,
        usuario_creacion: data.usuario_creacion || null
      },
      select: {
        id_profesor: true,
        id_usuario: true,
        departamento: true,
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
    return await prisma.admin_profesor.update({
      where: { id_profesor: parseInt(id) },
      data: {
        departamento: data.departamento,
        id_estado: data.id_estado,
        usuario_modificacion: data.usuario_modificacion || null,
        fecha_modificacion: new Date()
      },
      select: {
        id_profesor: true,
        id_usuario: true,
        departamento: true,
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
  return await prisma.admin_profesor.update({
    where: { id_profesor: parseInt(id) },
    data: {
      id_estado: 4,  //Eliminado 
      fecha_modificacion: new Date(),
      usuario_modificacion: usuarioModificacion
    }
  });
}

}

module.exports = new ProfessorRepository();