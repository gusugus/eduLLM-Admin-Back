const usuarioRepository = require('../repositories/usuario.repository');
const { sanitizeUsername, sanitizeName } = require('../utils/sanitize');

class UserService {
  async checkUsername(username, excludeUserId = null) {
    const where = { username };
    if (excludeUserId) {
      where.id_usuario = { not: parseInt(excludeUserId) };
    }
    const existingUser = await usuarioRepository.findFirst(where);
    return {
      available: !existingUser,
      message: existingUser ? 'Username ya existe' : 'Username disponible'
    };
  }

  async suggestUsername(primerNombre, apellidoPaterno) {
    const normalize = (str) => {
      return str.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ñ/g, 'n')
        .replace(/[^a-z0-9]/g, '');
    };

    const base = `${normalize(primerNombre)}${normalize(apellidoPaterno)}`;
    const existingUsernames = await usuarioRepository.findUsernamesStartingWith(base);

    let suggestedUsername = base;
    let counter = 1;

    while (existingUsernames.includes(suggestedUsername)) {
      suggestedUsername = `${base}${counter}`;
      counter++;
    }

    return {
      username: suggestedUsername,
      base,
      isNew: counter === 1,
      exists: existingUsernames.length > 0
    };
  }

  async getAllUsers() {
    return await usuarioRepository.findMany({}, {
      id_usuario: true,
      cedula: true,
      username: true,
      primer_nombre: true,
      segundo_nombre: true,
      apellido_paterno: true,
      apellido_materno: true,
      correo: true,
      id_rol: true,
      estado: true
    });
  }

  async getUserById(id) {
    return await usuarioRepository.findById(id, {
      id_usuario: true,
      cedula: true,
      username: true,
      primer_nombre: true,
      segundo_nombre: true,
      apellido_paterno: true,
      apellido_materno: true,
      correo: true,
      id_rol: true,
      estado: true
    });
  }
}

module.exports = new UserService();
