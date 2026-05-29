const professorRepository = require('../repositories/professor.repository');
const estadoService = require('./estado.service');
const rolService = require('./rol.service');

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const logger = require('../config/logger');
const AppError = require('../utils/AppError');

const ProfessorMapper = require('../mappers/professor.mapper');


class ProfessorService {
    async findAll() {
    const professors = await professorRepository.findAll([1,4]);
    
    const enriched = await Promise.all(professors.map(async (prof) => {
      const [estadoNombre, rolNombre] = await Promise.all([
        estadoService.getNombreEstado(prof.id_estado),
        rolService.getNombreRol(prof.admin_usuario.id_rol)
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
      rolService.getNombreRol(professor.admin_usuario.id_rol)
    ]);
    
    professor.estadoNombre = estadoNombre;
    professor.rolNombre = rolNombre;
    
    logger.info(`Obteniendo profesor con id: ${id}`);
    
    return ProfessorMapper.toResponse(professor, true);
  }

  getNombreCompleto(usuario) {
    const { primer_nombre, apellido_paterno, apellido_materno } = usuario;
    return `${primer_nombre} ${apellido_paterno} ${apellido_materno || ''}`.trim();
  }

  async createWithUser(data) {
    const {
      cedula,
      username,
      primer_nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      password,
      departamento,
      id_estado = 1
    } = data;

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear usuario
      const usuario = await tx.admin_usuario.create({
        data: {
          cedula,
          username,
          primer_nombre,
          apellido_paterno,
          apellido_materno,
          correo,
          password_hash,
          id_rol: 2,
          id_estado: 1,
          usuario_creacion: data.usuario_creacion || null
        }
      });

      // 2. Crear profesor vinculado al usuario
      const profesor = await tx.admin_profesor.create({
        data: {
          id_usuario: usuario.id_usuario,
          departamento,
          id_estado,
          usuario_creacion: data.usuario_creacion || null
        },
        include: {
          admin_usuario: true
        }
      });

      return profesor;
    });

    logger.info(`Created professor with user: ${result.admin_usuario.primer_nombre} ${result.admin_usuario.apellido_paterno}`);
    
    return {
      id: result.id_profesor,
      nombreCompleto: `${result.admin_usuario.primer_nombre} ${result.admin_usuario.apellido_paterno}`,
      cedula: result.admin_usuario.cedula,
      correo: result.admin_usuario.correo,
      username: result.admin_usuario.username,
      departamento: result.departamento
    };
  }

async delete(id, usuarioModificacion = null) {
  return await prisma.admin_profesor.update({
    where: { id_profesor: parseInt(id) },
    data: {
      id_estado: 4,
      fecha_modificacion: new Date(),
      usuario_modificacion: usuarioModificacion || null
    }
  });
}






async update(id, data, usuarioModificacion = null) {
  // Verificar que el profesor existe
  const existingProfessor = await professorRepository.findById(id);
  if (!existingProfessor) {
    throw new AppError('Profesor no encontrado', 404);
  }

  // Datos para actualizar el profesor
  const professorUpdateData = {
    departamento: data.departamento,
    id_estado: data.id_estado || existingProfessor.id_estado,
    usuario_modificacion: usuarioModificacion || null,
    fecha_modificacion: new Date()
  };

  // Datos para actualizar el usuario (si vienen)
  const userUpdateData = {};
  if (data.primer_nombre !== undefined) userUpdateData.primer_nombre = data.primer_nombre;
  if (data.apellido_paterno !== undefined) userUpdateData.apellido_paterno = data.apellido_paterno;
  if (data.apellido_materno !== undefined) userUpdateData.apellido_materno = data.apellido_materno;
  if (data.cedula !== undefined) userUpdateData.cedula = data.cedula;
  if (data.correo !== undefined) userUpdateData.correo = data.correo;

  // Usar transacción para actualizar profesor y usuario
  let updated;
  
  if (Object.keys(userUpdateData).length > 0) {
    // Actualizar ambos
    updated = await prisma.$transaction(async (tx) => {
      // Actualizar usuario
      await tx.admin_usuario.update({
        where: { id_usuario: existingProfessor.id_usuario },
        data: {
          ...userUpdateData,
          usuario_modificacion: usuarioModificacion || null,
          fecha_modificacion: new Date()
        }
      });

      // Actualizar profesor
      const profesor = await tx.admin_profesor.update({
        where: { id_profesor: parseInt(id) },
        data: professorUpdateData,
        include: {
          admin_usuario: true
        }
      });

      return profesor;
    });
  } else {
    // Solo actualizar profesor
    updated = await professorRepository.update(id, professorUpdateData);
  }

  logger.info(`Updated professor id ${id} by user ${usuarioModificacion || 'system'}`);
  
  return updated;
}





}

module.exports = new ProfessorService();