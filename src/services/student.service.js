const studentRepository = require('../repositories/student.repository');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');

class StudentService {
  async findAll() {
    const items = await studentRepository.findAll();
    logger.info(`Retrieved ${items.length} students`);
    return items;
  }

  async findById(id) {
    const item = await studentRepository.findById(id);
    if (!item) throw new AppError('student not found', 404);
    return item;
  }

  async create(data) {
    // Aquí aplicar validaciones con Zod
    const newItem = await studentRepository.create(data);
    logger.info(`Created student with id ${newItem.id}`);
    return newItem;
  }

  async update(id, data) {
    const updated = await studentRepository.update(id, data);
    logger.info(`Updated student id ${id}`);
    return updated;
  }

  async delete(id) {
    await studentRepository.delete(id);
    logger.info(`Deleted student id ${id}`);
  }
}

module.exports = new StudentService();