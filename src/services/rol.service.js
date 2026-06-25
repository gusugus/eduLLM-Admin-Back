const rolRepository = require('../repositories/rol.repository');

class RolService {
  async getNombreRol(idRol) {
    const rol = await rolRepository.findById(idRol, { nombre: true });
    return rol?.nombre || 'Desconocido';
  }

  async getRolById(idRol) {
    return await rolRepository.findById(idRol);
  }

  async getAllRoles() {
    return await rolRepository.findAll({ id_rol: true, nombre: true });
  }
}

module.exports = new RolService();
