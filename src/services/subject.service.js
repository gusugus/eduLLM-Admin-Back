const subjectRepository = require('../repositories/subject.repository');
const estadoService = require('./estado.service');

const prisma = require('../config/prisma');

const logger = require('../config/logger');
const AppError = require('../utils/AppError');

const SubjectMapper = require('../mappers/subject.mapper');

class SubjectService {
  async findAll() {
    const subjects = await subjectRepository.findAll([1, 4]);

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
    const subject = await subjectRepository.create(data);
    logger.info(`Creada materia: ${subject.nombre}`);
    return subject;
  }

  async update(id, data) {
    const existing = await subjectRepository.findById(id);
    if (!existing) {
      throw new AppError('Materia no encontrada', 404);
    }

    const updated = await subjectRepository.update(id, data);
    logger.info(`Actualizada materia id ${id}`);
    return updated;
  }

  async delete(id) {
    logger.info(`Eliminando materia id: ${id}`);
    return await prisma.info_materia.update({
      where: { id_materia: parseInt(id) },
      data: {
        id_estado: 4,
        fecha_modificacion: new Date()
      }
    });
  }
}

module.exports = new SubjectService();
