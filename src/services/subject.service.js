const subjectRepository = require('../repositories/subject.repository');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

class SubjectService {
  async findAll() {
    const items = await subjectRepository.findAll();
    logger.info(`Retrieved ${items.length} subjects`);
    return items;
  }

  async findById(id) {
    const item = await subjectRepository.findById(id);
    if (!item) throw new AppError('subject not found', 404);
    return item;
  }

  async create(data) {
    // Aquí aplicar validaciones con Zod
    const newItem = await subjectRepository.create(data);
    logger.info(`Created subject with id ${newItem.id}`);
    return newItem;
  }

  async update(id, data) {
    const updated = await subjectRepository.update(id, data);
    logger.info(`Updated subject id ${id}`);
    return updated;
  }

  async delete(id) {
    await subjectRepository.delete(id);
    logger.info(`Deleted subject id ${id}`);
  }
}

module.exports = new SubjectService();