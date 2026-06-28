const prisma = require('../config/prisma');
const ESTADOS = require('../constants/estados');
const ROLES = require('../constants/roles');

const buildWhere = (estadosPermitidos, search) => {
  const where = {
    usuario: { id_rol: ROLES.PROFESOR }
  };
  if (estadosPermitidos.length === 1) {
    where.estado = estadosPermitidos[0];
  }
  if (search) {
    where.OR = [
      { usuario: { primer_nombre: { contains: search, mode: 'insensitive' } } },
      { usuario: { segundo_nombre: { contains: search, mode: 'insensitive' } } },
      { usuario: { apellido_paterno: { contains: search, mode: 'insensitive' } } },
      { usuario: { apellido_materno: { contains: search, mode: 'insensitive' } } },
      { usuario: { username: { contains: search, mode: 'insensitive' } } },
    ];
  }
  return where;
};

class ProfessorRepository {
  async findAll(estadosPermitidos = [ESTADOS.ACTIVO], options = {}, tx = null) {
    const { skip = 0, take = 50, search = '' } = options;
    const client = tx || prisma;
    const where = buildWhere(estadosPermitidos, search);

    return await client.profesor.findMany({
      select: {
        id_profesor: true,
        estado: true,
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
            archivo: {
              where: { estado: true },
              select: { id_documento: true, ruta: true, estado: true }
            }
          }
        }
      },
      where,
      skip,
      take,
      orderBy: { id_profesor: 'asc' },
    });
  }

  async count(estadosPermitidos = [ESTADOS.ACTIVO], search = '', tx = null) {
    const client = tx || prisma;
    return await client.profesor.count({
      where: buildWhere(estadosPermitidos, search),
    });
  }

  async findById(id, tx = null) {
    const client = tx || prisma;
    return await client.profesor.findUnique({
      where: { id_profesor: parseInt(id) },
      select: {
        id_profesor: true,
        id_usuario: true,
        estado: true,
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
            archivo: {
              where: { estado: true },
              select: { id_documento: true, ruta: true, estado: true }
            }
          }
        },
        profesor_materia: {
          select: {
            id_profesor_materia: true,
            id_periodo_lectivo: true,
            materia: {
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

  async create(data, tx = null) {
    const client = tx || prisma;
    return await client.profesor.create({
      data: {
        id_usuario: data.id_usuario,
        estado: data.estado !== undefined ? data.estado : ESTADOS.ACTIVO,
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

  async update(id, data, tx = null) {
    const client = tx || prisma;
    return await client.profesor.update({
      where: { id_profesor: parseInt(id) },
      data: {
        estado: data.estado,
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

  async delete(id, usuarioModificacion = null, tx = null) {
  const client = tx || prisma;
  return await client.profesor.update({
    where: { id_profesor: parseInt(id) },
    data: {
      estado: ESTADOS.ELIMINADO,
      fecha_modificacion: new Date(),
      usuario_modificacion: usuarioModificacion
    }
  });
}

  async activate(id, usuarioModificacion = null, tx = null) {
    const client = tx || prisma;
    return await client.profesor.update({
      where: { id_profesor: parseInt(id) },
      data: {
        estado: ESTADOS.ACTIVO,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion
      },
      select: {
        id_profesor: true,
        id_usuario: true
      }
    });
  }

}

module.exports = new ProfessorRepository();
