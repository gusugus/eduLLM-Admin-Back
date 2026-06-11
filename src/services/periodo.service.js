const prisma = require('../config/prisma');

class PeriodoService {
  async getActivo() {
    return await prisma.tbl_m_periodo_lectivo.findFirst({
      where: { es_activo: true, estado: true },
      select: { id_periodo_lectivo: true, nombre: true }
    });
  }

  async getAll() {
    return await prisma.tbl_m_periodo_lectivo.findMany({
      where: { estado: true },
      select: { id_periodo_lectivo: true, nombre: true, es_activo: true }
    });
  }
}

module.exports = new PeriodoService();
