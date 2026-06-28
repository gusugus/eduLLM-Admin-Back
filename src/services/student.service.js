const studentRepository = require('../repositories/student.repository');
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

const StudentMapper = require('../mappers/student.mapper');
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

const studentSanitizeMap = {
  primer_nombre: sanitizeName,
  segundo_nombre: sanitizeName,
  apellido_paterno: sanitizeName,
  apellido_materno: sanitizeName,
  cedula: sanitizeCedula,
  correo: sanitizeEmail,
};

class StudentService {
  async findAll(page = 1, limit = config.pagination.defaultLimit, search = '', estados = [ESTADOS.ACTIVO, ESTADOS.ELIMINADO]) {
    const skip = limit ? (page - 1) * limit : undefined;
    const options = limit ? { skip, take: limit, search } : { search };

    const [students, total] = await Promise.all([
      studentRepository.findAll(estados, options),
      studentRepository.count(estados, search),
    ]);

    const enriched = await Promise.all(students.map(async (stu) => {
      const [estadoNombre, rolNombre] = await Promise.all([
        estadoService.getNombreEstado(stu.estado),
        rolService.getNombreRol(stu.usuario.id_rol)
      ]);

      stu.estadoNombre = estadoNombre;
      stu.rolNombre = rolNombre;

      return stu;
    }));

    logger.info(`Listados ${enriched.length} estudiantes`);
    return {
      data: StudentMapper.toResponseList(enriched),
      pagination: limit ? {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      } : null,
    };
  }

  async findById(id) {
    const student = await studentRepository.findById(id);
    if (!student) return null;

    const [estadoNombre, rolNombre] = await Promise.all([
      estadoService.getNombreEstado(student.estado),
      rolService.getNombreRol(student.usuario.id_rol)
    ]);

    student.estadoNombre = estadoNombre;
    student.rolNombre = rolNombre;

    logger.info(`Obtenido estudiante id: ${id}`);
    return StudentMapper.toResponse(student, true);
  }

  async createWithUser(data, authToken = null) {
    const safe = {
      ...data,
      ...Object.fromEntries(
        Object.entries(studentSanitizeMap).map(([key, fn]) => [key, data[key] !== undefined ? fn(data[key]) : data[key]])
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
        id_rol: ROLES.ESTUDIANTE,
        estado: ESTADOS.ACTIVO,
        usuario_creacion: data.usuario_creacion || null
      }, tx);

      const student = await studentRepository.create({
        id_usuario: usuario.id_usuario,
        estado,
        usuario_creacion: data.usuario_creacion || null
      }, tx);

      return { ...student, usuario };
    });

    const nom = result.usuario;
    logger.info(`Creado estudiante: ${nom.primer_nombre} ${nom.segundo_nombre || ''} ${nom.apellido_paterno} (${username})`);

    const emailSent = await this._sendCredentials(username, authToken);

    return {
      id: result.id_estudiante,
      id_usuario: result.usuario.id_usuario,
      nombreCompleto: `${nom.primer_nombre} ${nom.segundo_nombre || ''} ${nom.apellido_paterno}`,
      cedula: result.usuario.cedula,
      correo: result.usuario.correo,
      username: result.usuario.username,
      message: emailSent
        ? `Estudiante creado exitosamente. Se enviaron las credenciales a ${result.usuario.correo}`
        : 'Estudiante creado exitosamente'
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
    logger.info(`Eliminando estudiante id: ${id} por usuario: ${usuarioModificacion || 'system'}`);
    return await studentRepository.delete(id, usuarioModificacion);
  }

  async activate(id, usuarioModificacion = null) {
    const student = await studentRepository.findById(id);
    if (!student) throw new AppError('Estudiante no encontrado', 404);

    await studentRepository.activate(id, usuarioModificacion);
    logger.info(`Estudiante ${id} activado por usuario ${usuarioModificacion || 'system'}`);
    return { message: 'Estudiante activado correctamente' };
  }

  async update(id, data, usuarioModificacion = null) {
    const existingStudent = await studentRepository.findById(id);
    if (!existingStudent) {
      throw new AppError('Estudiante no encontrado', 404);
    }

    const safe = {
      ...data,
      ...Object.fromEntries(
        Object.entries(studentSanitizeMap).map(([key, fn]) => [key, data[key] !== undefined ? fn(data[key]) : data[key]])
      )
    };

    const studentUpdateData = {
      estado: safe.estado !== undefined ? safe.estado : existingStudent.estado,
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
        await usuarioRepository.update(existingStudent.id_usuario, {
          ...userUpdateData,
          usuario_modificacion: usuarioModificacion || null,
          fecha_modificacion: new Date()
        }, tx);

        return await studentRepository.update(id, studentUpdateData, tx);
      });
    } else {
      updated = await studentRepository.update(id, studentUpdateData);
    }

    logger.info(`Actualizado estudiante id ${id} por usuario ${usuarioModificacion || 'system'}`);
    return updated;
  }
}

module.exports = new StudentService();
