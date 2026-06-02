const subjectRepository = require('../repositories/subject.repository');
const estadoService = require('./estado.service');

const prisma = require('../config/prisma');

const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const ESTADOS = require('../constants/estados');

const SubjectMapper = require('../mappers/subject.mapper');
const { sanitizeText, sanitizeString } = require('../utils/sanitize');

class SubjectService {
  async findAll() {
    const subjects = await subjectRepository.findAll([ESTADOS.ACTIVO, ESTADOS.ELIMINADO]);

    const enriched = await Promise.all(subjects.map(async (sub) => {
      const estadoNombre = await estadoService.getNombreEstado(sub.id_estado);
      sub.estadoNombre = estadoNombre;
      return sub;
    }));

    logger.info(`Listadas ${enriched.length} materias`);
    return SubjectMapper.toResponseList(enriched);
  }

  async findById(id) {
    const subject = await subjectRepository.findById(id);
    if (!subject) return null;

    const estadoNombre = await estadoService.getNombreEstado(subject.id_estado);
    subject.estadoNombre = estadoNombre;

    logger.info(`Obtenida materia id: ${id}`);
    return SubjectMapper.toResponse(subject);
  }

  async create(data) {
    const nombre = sanitizeString(data.nombre);
    if (!nombre) throw new AppError('El nombre de la materia es requerido', 400);

    if (!data.id_grado) throw new AppError('El curso es requerido', 400);

    const nombre_normalizado = sanitizeText(nombre);

    const duplicado = await prisma.materia.findFirst({
      where: {
        nombre_normalizado,
        id_estado: ESTADOS.ACTIVO,
        id_grado: data.id_grado
      }
    });
    if (duplicado) {
      throw new AppError(`La materia "${duplicado.nombre}" ya existe para este curso`, 409);
    }

    const subject = await subjectRepository.create({
      nombre,
      nombre_normalizado,
      descripcion: data.descripcion,
      id_estado: data.id_estado || ESTADOS.ACTIVO,
      usuario_creacion: data.usuario_creacion,
      id_grado: data.id_grado
    });

    logger.info(`Creada materia: ${subject.nombre}`);
    return SubjectMapper.toResponse(subject);
  }

  async update(id, data) {
    const existing = await subjectRepository.findById(id);
    if (!existing) {
      throw new AppError('Materia no encontrada', 404);
    }

    let nombre_normalizado;
    if (data.nombre !== undefined) {
      const nombre = sanitizeString(data.nombre);
      nombre_normalizado = sanitizeText(nombre);

      const duplicado = await prisma.materia.findFirst({
        where: {
          nombre_normalizado,
          id_estado: ESTADOS.ACTIVO,
          id_grado: data.id_grado || existing.id_grado,
          id_materia: { not: parseInt(id) }
        }
      });
      if (duplicado) {
        throw new AppError(`La materia "${duplicado.nombre}" ya existe para este curso`, 409);
      }
    }

    const updated = await subjectRepository.update(id, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      nombre_normalizado,
      id_estado: data.id_estado,
      id_grado: data.id_grado
    });

    logger.info(`Actualizada materia id ${id}`);
    return SubjectMapper.toResponse(updated);
  }

  async delete(id) {
    logger.info(`Eliminando materia id: ${id}`);
    return await prisma.materia.update({
      where: { id_materia: parseInt(id) },
      data: {
        id_estado: ESTADOS.ELIMINADO,
        fecha_modificacion: new Date()
      }
    });
  }
}

module.exports = new SubjectService();
