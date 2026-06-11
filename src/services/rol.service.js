const prisma = require('../config/prisma');

class RolService {
  async getNombreRol(idRol) {
    const rol = await prisma.tbl_m_rol.findUnique({
      where: { id_rol: idRol },
      select: { nombre: true }
    });
    return rol?.nombre || 'Desconocido';
  }

  async getRolById(idRol) {
    return await prisma.tbl_m_rol.findUnique({
      where: { id_rol: idRol }
    });
  }

  async getAllRoles() {
    return await prisma.tbl_m_rol.findMany({
      select: { id_rol: true, nombre: true }
    });
  }
}

module.exports = new RolService();
