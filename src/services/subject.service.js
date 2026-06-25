const subjectRepository = require('../repositories/subject.repository');

const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const ESTADOS = require('../constants/estados');
const config = require('../config');

const SubjectMapper = require('../mappers/subject.mapper');
const { sanitizeText, sanitizeString } = require('../utils/sanitize');

class SubjectService {
  async findAll(page = 1, limit = config.pagination.defaultLimit, search = '', estados = [ESTADOS.ACTIVO, ESTADOS.ELIMINADO]) {
    const skip = limit ? (page - 1) * limit : undefined;
    const options = limit ? { skip, take: limit, search } : { search };

    const [subjects, total] = await Promise.all([
      subjectRepository.findAll(estados, options),
      subjectRepository.count(estados, search),
    ]);

    logger.info(`Listadas ${subjects.length} materias`);
    return {
      data: SubjectMapper.toResponseList(subjects),
      pagination: limit ? {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      } : null,
    };
  }

  async findById(id) {
    const subject = await subjectRepository.findById(id);
    if (!subject) return null;
    logger.info(`Obtenida materia id: ${id}`);
    return SubjectMapper.toResponse(subject);
  }

  async create(data) {
    const nombre = sanitizeString(data.nombre);
    if (!nombre) throw new AppError('El nombre de la materia es requerido', 400);
    if (!data.id_grado) throw new AppError('El curso es requerido', 400);

    const nombre_normalizado = sanitizeText(nombre);

    const duplicado = await subjectRepository.findFirst({
      nombre_normalizado,
      estado: ESTADOS.ACTIVO,
      id_grado: data.id_grado
    });
    if (duplicado) {
      throw new AppError(`La materia "${duplicado.nombre}" ya existe para este curso`, 409);
    }

    const subject = await subjectRepository.create({
      nombre,
      nombre_normalizado,
      descripcion: data.descripcion,
      estado: data.estado !== undefined ? data.estado : ESTADOS.ACTIVO,
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

      const duplicado = await subjectRepository.findFirst({
        nombre_normalizado,
        estado: ESTADOS.ACTIVO,
        id_grado: data.id_grado || existing.id_grado,
        id_materia: { not: parseInt(id) }
      });
      if (duplicado) {
        throw new AppError(`La materia "${duplicado.nombre}" ya existe para este curso`, 409);
      }
    }

    const updated = await subjectRepository.update(id, {
      nombre: data.nombre,
      descripcion: data.descripcion,
      nombre_normalizado,
      estado: data.estado,
      id_grado: data.id_grado
    });

    logger.info(`Actualizada materia id ${id}`);
    return SubjectMapper.toResponse(updated);
  }

  async delete(id) {
    logger.info(`Eliminando materia id: ${id}`);
    return await subjectRepository.softDelete(id);
  }
}

module.exports = new SubjectService();
