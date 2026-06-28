const gradoRepository = require('../repositories/grado.repository');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const config = require('../config');
const GradoMapper = require('../mappers/grado.mapper');
const { sanitizeString } = require('../utils/sanitize');

class GradoService {
  async findAll(page = 1, limit = config.pagination.defaultLimit, search = '') {
    const skip = limit ? (page - 1) * limit : undefined;
    const options = limit ? { skip, take: limit, search } : { search };

    const [grados, total] = await Promise.all([
      gradoRepository.findAll(options),
      gradoRepository.count(search),
    ]);

    logger.info(`Listados ${grados.length} grados`);
    return {
      data: GradoMapper.toResponseList(grados),
      pagination: limit ? {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      } : null,
    };
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

  async delete(id, usuarioModificacion = null) {
    const existing = await gradoRepository.findById(id);
    if (!existing) throw new AppError('Grado no encontrado', 404);

    await gradoRepository.delete(id, usuarioModificacion);
    logger.info(`Eliminado grado id: ${id}`);
    return { message: 'Grado eliminado correctamente' };
  }

  async activate(id) {
    const existing = await gradoRepository.findById(id);
    if (!existing) throw new AppError('Grado no encontrado', 404);

    await gradoRepository.activate(id);
    logger.info(`Grado ${id} activado`);
    return { message: 'Grado activado correctamente' };
  }
}

module.exports = new GradoService();
