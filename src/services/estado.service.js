const prisma = require('../config/prisma');

class EstadoService {
  async getNombreEstado(idEstado) {
    const estado = await prisma.estado.findUnique({
      where: { id_estado: idEstado },
      select: { nombre: true, codigo: true }
    });
    return estado?.nombre || 'Desconocido';
  }

  async getEstadoById(idEstado) {
    return await prisma.estado.findUnique({
      where: { id_estado: idEstado }
    });
  }

  async getAllEstados() {
    return await prisma.estado.findMany({
      select: { id_estado: true, nombre: true, codigo: true }
    });
  }

  async getCodigoEstado(idEstado) {
    const estado = await prisma.estado.findUnique({
      where: { id_estado: idEstado },
      select: { codigo: true }
    });
    return estado?.codigo || 'UNK';
  }
}

module.exports = new EstadoService();