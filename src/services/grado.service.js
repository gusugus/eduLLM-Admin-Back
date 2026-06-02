const gradoRepository = require('../repositories/grado.repository');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const GradoMapper = require('../mappers/grado.mapper');
const { sanitizeString } = require('../utils/sanitize');

class GradoService {
  async findAll() {
    const grados = await gradoRepository.findAll();
    logger.info(`Listados ${grados.length} grados`);
    return GradoMapper.toResponseList(grados);
  }

  async findById(id) {
    const grado = await gradoRepository.findById(id);
    if (!grado) return null;
    logger.info(`Obtenido grado id: ${id}`);
    return GradoMapper.toResponse(grado);
  }

  async create(data) {
    const paralelo = sanitizeString(data.paralelo || '');

    const duplicado = await gradoRepository.findByGradoAndParalelo(data.grado, paralelo);
    if (duplicado) {
      throw new AppError(`El grado ${data.grado} ${paralelo} ya existe`, 409);
    }

    const grado = await gradoRepository.create({ ...data, paralelo });
    logger.info(`Creado grado: ${GradoMapper.getNombreCompleto(grado)}`);
    return GradoMapper.toResponse(grado);
  }

  async update(id, data) {
    const existing = await gradoRepository.findById(id);
    if (!existing) throw new AppError('Grado no encontrado', 404);

    const paralelo = sanitizeString(data.paralelo || '');

    const duplicado = await gradoRepository.findByGradoAndParalelo(data.grado, paralelo, id);
    if (duplicado) {
      throw new AppError(`El grado ${data.grado} ${paralelo} ya existe`, 409);
    }

    const updated = await gradoRepository.update(id, { ...data, paralelo });
    logger.info(`Actualizado grado id ${id}`);
    return GradoMapper.toResponse(updated);
  }

  async delete(id) {
    const existing = await gradoRepository.findById(id);
    if (!existing) throw new AppError('Grado no encontrado', 404);

    await gradoRepository.delete(id);
    logger.info(`Eliminado grado id: ${id}`);
    return { message: 'Grado eliminado correctamente' };
  }
}

module.exports = new GradoService();
