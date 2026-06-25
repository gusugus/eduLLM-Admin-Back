const periodoRepository = require('../repositories/periodo.repository');

class PeriodoService {
  async getActivo() {
    return await periodoRepository.findFirst(
      { es_activo: true, estado: true },
      { id_periodo_lectivo: true, nombre: true }
    );
  }

  async getAll() {
    return await periodoRepository.findMany(
      { estado: true },
      { id_periodo_lectivo: true, nombre: true, es_activo: true }
    );
  }
}

module.exports = new PeriodoService();
