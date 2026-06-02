const prisma = require('../config/prisma');
const ESTADOS = require('../constants/estados');

class PeriodoService {
  async getActivo() {
    return await prisma.periodo_lectivo.findFirst({
      where: { es_activo: true, id_estado: ESTADOS.ACTIVO },
      select: { id_periodo_lectivo: true, nombre: true }
    });
  }

  async getAll() {
    return await prisma.periodo_lectivo.findMany({
      where: { id_estado: ESTADOS.ACTIVO },
      select: { id_periodo_lectivo: true, nombre: true, es_activo: true }
    });
  }
}

module.exports = new PeriodoService();
