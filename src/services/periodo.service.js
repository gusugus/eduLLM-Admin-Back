const prisma = require('../config/prisma');

class PeriodoService {
  async getActivo() {
    return await prisma.admin_periodo_lectivo.findFirst({
      where: { es_activo: true, id_estado: 1 },
      select: { id_periodo_lectivo: true, nombre: true }
    });
  }

  async getAll() {
    return await prisma.admin_periodo_lectivo.findMany({
      where: { id_estado: 1 },
      select: { id_periodo_lectivo: true, nombre: true, es_activo: true }
    });
  }
}

module.exports = new PeriodoService();
