const professorRepository = require('../repositories/professor.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const estadoService = require('./estado.service');
const rolService = require('./rol.service');
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const ESTADOS = require('../constants/estados');
const ROLES = require('../constants/roles');
const config = require('../config');

const ProfessorMapper = require('../mappers/professor.mapper');
const { sanitizeName, sanitizeEmail, sanitizeCedula } = require('../utils/sanitize');
const { generateUsername } = require('../utils/username');

const generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(4);
  let password = '';
  for (let i = 0; i < 4; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
};

const professorSanitizeMap = {
  primer_nombre: sanitizeName,
  segundo_nombre: sanitizeName,
  apellido_paterno: sanitizeName,
  apellido_materno: sanitizeName,
  cedula: sanitizeCedula,
  correo: sanitizeEmail,
};

class ProfessorService {
  async findAll(page = 1, limit = config.pagination.defaultLimit, search = '', estados = [ESTADOS.ACTIVO, ESTADOS.ELIMINADO]) {
    const skip = limit ? (page - 1) * limit : undefined;
    const options = limit ? { skip, take: limit, search } : { search };

    const [professors, total] = await Promise.all([
      professorRepository.findAll(estados, options),
      professorRepository.count(estados, search),
    ]);

    const enriched = await Promise.all(professors.map(async (prof) => {
      const [estadoNombre, rolNombre] = await Promise.all([
        estadoService.getNombreEstado(prof.estado),
        rolService.getNombreRol(prof.usuario.id_rol)
      ]);

      prof.estadoNombre = estadoNombre;
      prof.rolNombre = rolNombre;

      return prof;
    }));

    return {
      data: ProfessorMapper.toResponseList(enriched),
      pagination: limit ? {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      } : null,
    };
  }

  async findById(id) {
    const professor = await professorRepository.findById(id);
    if (!professor) return null;

    const [estadoNombre, rolNombre] = await Promise.all([
      estadoService.getNombreEstado(professor.estado),
      rolService.getNombreRol(professor.usuario.id_rol)
    ]);

    professor.estadoNombre = estadoNombre;
    professor.rolNombre = rolNombre;

    logger.info(`Obteniendo profesor con id: ${id}`);

    return ProfessorMapper.toResponse(professor, true);
  }

  async createWithUser(data, authToken = null) {
    const safe = {
      ...data,
      ...Object.fromEntries(
        Object.entries(professorSanitizeMap).map(([key, fn]) => [key, data[key] !== undefined ? fn(data[key]) : data[key]])
      )
    };

    const {
      cedula, primer_nombre, segundo_nombre,
      apellido_paterno, apellido_materno, correo,
      estado = ESTADOS.ACTIVO
    } = safe;

    if (!primer_nombre) throw new AppError('El primer nombre es requerido', 400);
    if (!apellido_paterno) throw new AppError('El apellido paterno es requerido', 400);

    const username = await generateUsername(primer_nombre, apellido_paterno);
    const password_hash = await bcrypt.hash(generateTempPassword(), 10);

    const result = await prisma.$transaction(async (tx) => {
      const usuario = await usuarioRepository.create({
        cedula, username, primer_nombre, segundo_nombre,
        apellido_paterno, apellido_materno, correo, password_hash,
        id_rol: ROLES.PROFESOR,
        estado: ESTADOS.ACTIVO,
        usuario_creacion: data.usuario_creacion || null
      }, tx);

      const profesor = await professorRepository.create({
        id_usuario: usuario.id_usuario,
        estado,
        usuario_creacion: data.usuario_creacion || null
      }, tx);

      return { ...profesor, usuario };
    });

    logger.info(`Created professor with user: ${result.usuario.primer_nombre} ${result.usuario.segundo_nombre || ''} ${result.usuario.apellido_paterno} (${username})`);

    const emailSent = await this._sendCredentials(username, authToken);

    return {
      id: result.id_profesor,
      id_usuario: result.usuario.id_usuario,
      nombreCompleto: `${result.usuario.primer_nombre} ${result.usuario.segundo_nombre || ''} ${result.usuario.apellido_paterno}`,
      cedula: result.usuario.cedula,
      correo: result.usuario.correo,
      username: result.usuario.username,
      message: emailSent
        ? `Profesor creado exitosamente. Se enviaron las credenciales a ${result.usuario.correo}`
        : 'Profesor creado exitosamente'
    };
  }

  async _sendCredentials(username, authToken = null) {
    try {
      const url = `${config.authServiceUrl}/api/auth/recreate-credentials`;
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username })
      });
      if (!response.ok) {
        const text = await response.text();
        logger.error(`recreate-credentials failed: ${response.status} ${text}`);
        return false;
      }
      logger.info(`Credentials sent for ${username}`);
      return true;
    } catch (err) {
      logger.error(`recreate-credentials error: ${err.message}`);
      return false;
    }
  }

  async delete(id, usuarioModificacion = null) {
    return await professorRepository.delete(id, usuarioModificacion);
  }

  async activate(id, usuarioModificacion = null) {
    const professor = await professorRepository.findById(id);
    if (!professor) throw new AppError('Profesor no encontrado', 404);

    await professorRepository.activate(id, usuarioModificacion);
    logger.info(`Profesor ${id} activado por usuario ${usuarioModificacion || 'system'}`);
    return { message: 'Profesor activado correctamente' };
  }

  async update(id, data, usuarioModificacion = null) {
    const existingProfessor = await professorRepository.findById(id);
    if (!existingProfessor) {
      throw new AppError('Profesor no encontrado', 404);
    }

    const safe = {
      ...data,
      ...Object.fromEntries(
        Object.entries(professorSanitizeMap).map(([key, fn]) => [key, data[key] !== undefined ? fn(data[key]) : data[key]])
      )
    };

    const professorUpdateData = {
      estado: safe.estado !== undefined ? safe.estado : existingProfessor.estado,
      usuario_modificacion: usuarioModificacion || null,
      fecha_modificacion: new Date()
    };

    const userUpdateData = {};
    if (safe.primer_nombre !== undefined) userUpdateData.primer_nombre = safe.primer_nombre;
    if (safe.segundo_nombre !== undefined) userUpdateData.segundo_nombre = safe.segundo_nombre;
    if (safe.apellido_paterno !== undefined) userUpdateData.apellido_paterno = safe.apellido_paterno;
    if (safe.apellido_materno !== undefined) userUpdateData.apellido_materno = safe.apellido_materno;
    if (safe.cedula !== undefined) userUpdateData.cedula = safe.cedula;
    if (safe.correo !== undefined) userUpdateData.correo = safe.correo;

    let updated;

    if (Object.keys(userUpdateData).length > 0) {
      updated = await prisma.$transaction(async (tx) => {
        await usuarioRepository.update(existingProfessor.id_usuario, {
          ...userUpdateData,
          usuario_modificacion: usuarioModificacion || null,
          fecha_modificacion: new Date()
        }, tx);

        return await professorRepository.update(id, professorUpdateData, tx);
      });
    } else {
      updated = await professorRepository.update(id, professorUpdateData);
    }

    logger.info(`Updated professor id ${id} by user ${usuarioModificacion || 'system'}`);

    return updated;
  }
}

module.exports = new ProfessorService();
