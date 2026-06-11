const prisma = require('../config/prisma');
const ESTADOS = require('../constants/estados');

class ProfessorRepository {
  async findAll(soloActivos = true) {
    const where = soloActivos ? { estado: true } : {};

    return await prisma.tbl_m_profesor.findMany({
      select: {
        id_profesor: true,
        estado: true,
        tbl_m_usuario: {
          select: {
            id_usuario: true,
            cedula: true,
            username: true,
            primer_nombre: true,
            segundo_nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            correo: true,
            rol_id: true,
            tbl_m_archivo: {
              where: { estado: true },
              select: { id_documento: true, ruta: true, estado: true }
            }
          }
        }
      },
      where
    });
  }

  async findById(id) {
    return await prisma.tbl_m_profesor.findUnique({
      where: { id_profesor: parseInt(id) },
      select: {
        id_profesor: true,
        usuario_id: true,
        estado: true,
        tbl_m_usuario: {
          select: {
            id_usuario: true,
            cedula: true,
            username: true,
            primer_nombre: true,
            segundo_nombre: true,
            apellido_paterno: true,
            apellido_materno: true,
            correo: true,
            rol_id: true,
            tbl_m_archivo: {
              where: { estado: true },
              select: { id_documento: true, ruta: true, estado: true }
            }
          }
        },
        tbl_t_profesor_materia: {
          select: {
            id_profesor_materia: true,
            periodo_lectivo_id: true,
            tbl_m_materia: {
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
    return await prisma.tbl_m_profesor.create({
      data: {
        usuario_id: data.id_usuario,
        estado: true,
        usuario_creacion: data.usuario_creacion || null
      },
      select: {
        id_profesor: true,
        usuario_id: true,
        tbl_m_usuario: {
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
    return await prisma.tbl_m_profesor.update({
      where: { id_profesor: parseInt(id) },
      data: {
        estado: data.estado,
        usuario_modificacion: data.usuario_modificacion || null,
        fecha_modificacion: new Date()
      },
      select: {
        id_profesor: true,
        usuario_id: true,
        tbl_m_usuario: {
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
    return await prisma.tbl_m_profesor.update({
      where: { id_profesor: parseInt(id) },
      data: {
        estado: false,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion
      }
    });
  }
}

module.exports = new ProfessorRepository();
