const prisma = require('../config/prisma');
const ESTADOS = require('../constants/estados');

const buildWhere = (estadosPermitidos, search) => {
  const where = {};
  if (estadosPermitidos.length === 1) {
    where.estado = estadosPermitidos[0];
  }
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { grado: { grado: parseInt(search) || 0 } },
    ];
  }
  return where;
};

class SubjectRepository {
  async findAll(estadosPermitidos = [ESTADOS.ACTIVO], options = {}, tx = null) {
    const { skip = 0, take = 50, search = '' } = options;
    const client = tx || prisma;
    const where = buildWhere(estadosPermitidos, search);

    return await client.materia.findMany({
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        estado: true,
        id_grado: true,
        grado: {
          select: { id_grado: true, grado: true, paralelo: true }
        }
      },
      where,
      skip,
      take,
      orderBy: { id_materia: 'asc' },
    });
  }

  async count(estadosPermitidos = [ESTADOS.ACTIVO], search = '', tx = null) {
    const client = tx || prisma;
    return await client.materia.count({
      where: buildWhere(estadosPermitidos, search),
    });
  }

  async findFirst(where) {
    return await prisma.materia.findFirst({ where });
  }

  async findById(id) {
    return await prisma.materia.findUnique({
      where: { id_materia: parseInt(id) },
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        estado: true,
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
        estado: data.estado !== undefined ? data.estado : ESTADOS.ACTIVO,
        usuario_creacion: data.usuario_creacion || null,
        id_grado: data.id_grado || null
      },
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        estado: true,
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
      estado: data.estado,
      usuario_modificacion: data.usuario_modificacion || null,
      fecha_modificacion: new Date()
    };
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.nombre_normalizado !== undefined) updateData.nombre_normalizado = data.nombre_normalizado;
    if (data.id_grado !== undefined) updateData.id_grado = data.id_grado;
    if (data.estado !== undefined) updateData.estado = data.estado;

    return await prisma.materia.update({
      where: { id_materia: parseInt(id) },
      data: updateData,
      select: {
        id_materia: true,
        nombre: true,
        descripcion: true,
        nombre_normalizado: true,
        estado: true,
        id_grado: true,
        grado: {
          select: { id_grado: true, grado: true, paralelo: true }
        }
      }
    });
  }

  async softDelete(id, usuarioModificacion = null) {
    return await prisma.materia.update({
      where: { id_materia: parseInt(id) },
      data: {
        estado: ESTADOS.ELIMINADO,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion
      }
    });
  }

  async activate(id, usuarioModificacion = null) {
    return await prisma.materia.update({
      where: { id_materia: parseInt(id) },
      data: {
        estado: ESTADOS.ACTIVO,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion
      },
      select: {
        id_materia: true,
        nombre: true
      }
    });
  }
}

module.exports = new SubjectRepository();
