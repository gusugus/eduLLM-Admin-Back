const studentRepository = require('../repositories/student.repository');
const usuarioRepository = require('../repositories/usuario.repository');
const estadoService = require('./estado.service');
const rolService = require('./rol.service');
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const ESTADOS = require('../constants/estados');
const ROLES = require('../constants/roles');
const config = require('../config');

const StudentMapper = require('../mappers/student.mapper');
const { sanitizeName, sanitizeUsername, sanitizeEmail, sanitizeCedula } = require('../utils/sanitize');

const studentSanitizeMap = {
  primer_nombre: sanitizeName,
  segundo_nombre: sanitizeName,
  apellido_paterno: sanitizeName,
  apellido_materno: sanitizeName,
  cedula: sanitizeCedula,
  correo: sanitizeEmail,
  username: sanitizeUsername
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

  async createWithUser(data) {
    const safe = {
      ...data,
      ...Object.fromEntries(
        Object.entries(studentSanitizeMap).map(([key, fn]) => [key, data[key] !== undefined ? fn(data[key]) : data[key]])
      )
    };

    const {
      cedula, username, primer_nombre, segundo_nombre,
      apellido_paterno, apellido_materno, correo, password,
      estado = ESTADOS.ACTIVO
    } = safe;

    if (!username) throw new AppError('El username es requerido', 400);
    if (!primer_nombre) throw new AppError('El primer nombre es requerido', 400);
    if (!apellido_paterno) throw new AppError('El apellido paterno es requerido', 400);

    const usernameExists = await usuarioRepository.findByUsername(username);
    if (usernameExists) {
      throw new AppError(`El username '${username}' ya está en uso`, 409);
    }

    const password_hash = await bcrypt.hash(password, 10);

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

    const nom = result.tbl_m_usuario;
    logger.info(`Creado estudiante: ${nom.primer_nombre} ${nom.segundo_nombre || ''} ${nom.apellido_paterno}`);

    return {
      id: result.id_estudiante,
      id_usuario: result.tbl_m_usuario.id_usuario,
      nombreCompleto: `${nom.primer_nombre} ${nom.segundo_nombre || ''} ${nom.apellido_paterno}`,
      cedula: result.tbl_m_usuario.cedula,
      correo: result.tbl_m_usuario.correo,
      username: result.tbl_m_usuario.username
    };
  }

  async delete(id, usuarioModificacion = null) {
    logger.info(`Eliminando estudiante id: ${id} por usuario: ${usuarioModificacion || 'system'}`);
    return await studentRepository.delete(id, usuarioModificacion);
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
