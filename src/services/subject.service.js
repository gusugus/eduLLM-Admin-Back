const subjectRepository = require('../repositories/subject.repository');
const estadoService = require('./estado.service');

const prisma = require('../config/prisma');

const logger = require('../config/logger');
const AppError = require('../utils/AppError');

const SubjectMapper = require('../mappers/subject.mapper');
const { sanitizeText, sanitizeString } = require('../utils/sanitize');

class SubjectService {
  async findAll() {
    const subjects = await subjectRepository.findAll(false);

    const enriched = subjects.map((sub) => {
      sub.estadoNombre = estadoService.getNombreEstado(sub.estado);
      return sub;
    });

    logger.info(`Listadas ${enriched.length} materias`);
    return SubjectMapper.toResponseList(enriched);
  }

  async findById(id) {
    const subject = await subjectRepository.findById(id);
    if (!subject) return null;

    subject.estadoNombre = estadoService.getNombreEstado(subject.estado);

    logger.info(`Obtenida materia id: ${id}`);
    return SubjectMapper.toResponse(subject);
  }

  async create(data) {
    const nombre = sanitizeString(data.nombre);
    if (!nombre) throw new AppError('El nombre de la materia es requerido', 400);
    if (!data.id_grado) throw new AppError('El curso es requerido', 400);

    const nombre_normalizado = sanitizeText(nombre);

    const duplicado = await prisma.tbl_m_materia.findFirst({
      where: {
        nombre_normalizado,
        estado: true,
        grado_id: data.id_grado
      }
    });
    if (duplicado) {
      throw new AppError(`La materia "${duplicado.nombre}" ya existe para este curso`, 409);
    }

    const subject = await subjectRepository.create({
      nombre,
      nombre_normalizado,
      descripcion: data.descripcion,
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

      const duplicado = await prisma.tbl_m_materia.findFirst({
        where: {
          nombre_normalizado,
          estado: true,
          grado_id: data.id_grado || existing.grado_id,
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
      estado: data.estado,
      id_grado: data.id_grado,
      usuario_modificacion: data.usuario_modificacion
    });

    logger.info(`Actualizada materia id ${id}`);
    return SubjectMapper.toResponse(updated);
  }

  async delete(id) {
    logger.info(`Eliminando materia id: ${id}`);
    return await prisma.tbl_m_materia.update({
      where: { id_materia: parseInt(id) },
      data: {
        estado: false,
        fecha_modificacion: new Date()
      }
    });
  }
}

module.exports = new SubjectService();
