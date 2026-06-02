const professorRepository = require('../repositories/professor.repository');
const estadoService = require('./estado.service');
const rolService = require('./rol.service');

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const ESTADOS = require('../constants/estados');
const ROLES = require('../constants/roles');

const ProfessorMapper = require('../mappers/professor.mapper');
const { sanitizeName, sanitizeUsername, sanitizeEmail, sanitizeCedula, sanitizeString } = require('../utils/sanitize');

const professorSanitizeMap = {
  primer_nombre: sanitizeName,
  segundo_nombre: sanitizeName,
  apellido_paterno: sanitizeName,
  apellido_materno: sanitizeName,
  cedula: sanitizeCedula,
  correo: sanitizeEmail,
  username: sanitizeUsername
};

class ProfessorService {
    async findAll() {
    const professors = await professorRepository.findAll([ESTADOS.ACTIVO, ESTADOS.ELIMINADO]);
    
    const enriched = await Promise.all(professors.map(async (prof) => {
      const [estadoNombre, rolNombre] = await Promise.all([
        estadoService.getNombreEstado(prof.id_estado),
        rolService.getNombreRol(prof.usuario.id_rol)
      ]);
      
      prof.estadoNombre = estadoNombre;
      prof.rolNombre = rolNombre;
      
      return prof;
    }));
    
    return ProfessorMapper.toResponseList(enriched);
  }

  async findById(id) {
    const professor = await professorRepository.findById(id);
    if (!professor) return null;
    
    const [estadoNombre, rolNombre] = await Promise.all([
      estadoService.getNombreEstado(professor.id_estado),
      rolService.getNombreRol(professor.usuario.id_rol)
    ]);
    
    professor.estadoNombre = estadoNombre;
    professor.rolNombre = rolNombre;
    
    logger.info(`Obteniendo profesor con id: ${id}`);
    
    return ProfessorMapper.toResponse(professor, true);
  }

  getNombreCompleto(usuario) {
    const { primer_nombre, segundo_nombre, apellido_paterno, apellido_materno } = usuario;
    return `${primer_nombre} ${segundo_nombre || ''} ${apellido_paterno} ${apellido_materno || ''}`.trim();
  }

  async createWithUser(data) {
    const safe = {
      ...data,
      ...Object.fromEntries(
        Object.entries(professorSanitizeMap).map(([key, fn]) => [key, data[key] !== undefined ? fn(data[key]) : data[key]])
      )
    };

    const {
      cedula, username, primer_nombre, segundo_nombre,
      apellido_paterno, apellido_materno, correo, password,
      id_estado = ESTADOS.ACTIVO
    } = safe;

    if (!username) throw new AppError('El username es requerido', 400);
    if (!primer_nombre) throw new AppError('El primer nombre es requerido', 400);

    const usernameExists = await prisma.usuario.findUnique({ where: { username } });
    if (usernameExists) {
      throw new AppError(`El username '${username}' ya está en uso`, 409);
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          cedula, username, primer_nombre, segundo_nombre,
          apellido_paterno, apellido_materno, correo, password_hash,
          id_rol: ROLES.PROFESOR,
          id_estado: ESTADOS.ACTIVO,
          usuario_creacion: data.usuario_creacion || null
        }
      });

      const profesor = await tx.profesor.create({
        data: {
          id_usuario: usuario.id_usuario,
          id_estado,
          usuario_creacion: data.usuario_creacion || null
        },
        include: { usuario: true }
      });

      return profesor;
    });

    logger.info(`Created professor with user: ${result.usuario.primer_nombre} ${result.usuario.segundo_nombre || ''} ${result.usuario.apellido_paterno}`);
    
    return {
      id: result.id_profesor,
      id_usuario: result.usuario.id_usuario,
      nombreCompleto: `${result.usuario.primer_nombre} ${result.usuario.segundo_nombre || ''} ${result.usuario.apellido_paterno}`,
      cedula: result.usuario.cedula,
      correo: result.usuario.correo,
      username: result.usuario.username
    };
  }

async delete(id, usuarioModificacion = null) {
  return await prisma.profesor.update({
    where: { id_profesor: parseInt(id) },
    data: {
      id_estado: ESTADOS.ELIMINADO,
      fecha_modificacion: new Date(),
      usuario_modificacion: usuarioModificacion || null
    }
  });
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
      id_estado: safe.id_estado || existingProfessor.id_estado,
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
      await tx.usuario.update({
        where: { id_usuario: existingProfessor.id_usuario },
        data: {
          ...userUpdateData,
          usuario_modificacion: usuarioModificacion || null,
          fecha_modificacion: new Date()
        }
      });

      const profesor = await tx.profesor.update({
        where: { id_profesor: parseInt(id) },
        data: professorUpdateData,
        include: { usuario: true }
      });

      return profesor;
    });
  } else {
    updated = await professorRepository.update(id, professorUpdateData);
  }

  logger.info(`Updated professor id ${id} by user ${usuarioModificacion || 'system'}`);
  
  return updated;
}

}

module.exports = new ProfessorService();
