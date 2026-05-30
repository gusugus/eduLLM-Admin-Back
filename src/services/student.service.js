const studentRepository = require('../repositories/student.repository');
const estadoService = require('./estado.service');
const rolService = require('./rol.service');

const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const logger = require('../config/logger');
const AppError = require('../utils/AppError');

const StudentMapper = require('../mappers/student.mapper');

class StudentService {
  async findAll() {
    const students = await studentRepository.findAll([1, 4]);

    const enriched = await Promise.all(students.map(async (stu) => {
      const [estadoNombre, rolNombre] = await Promise.all([
        estadoService.getNombreEstado(stu.id_estado),
        rolService.getNombreRol(stu.admin_usuario.id_rol)
      ]);

      stu.estadoNombre = estadoNombre;
      stu.rolNombre = rolNombre;

      return stu;
    }));

    logger.info(`Listados ${enriched.length} estudiantes`);
    return StudentMapper.toResponseList(enriched);
  }

  async findById(id) {
    const student = await studentRepository.findById(id);
    if (!student) return null;

    const [estadoNombre, rolNombre] = await Promise.all([
      estadoService.getNombreEstado(student.id_estado),
      rolService.getNombreRol(student.admin_usuario.id_rol)
    ]);

    student.estadoNombre = estadoNombre;
    student.rolNombre = rolNombre;

    logger.info(`Obtenido estudiante id: ${id}`);
    return StudentMapper.toResponse(student, true);
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
      codigo_estudiante,
      grado,
      grupo,
      id_estado = 1
    } = data;

    const password_hash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.admin_usuario.create({
        data: {
          cedula,
          username,
          primer_nombre,
          apellido_paterno,
          apellido_materno,
          correo,
          password_hash,
          id_rol: 3,
          id_estado: 1,
          usuario_creacion: data.usuario_creacion || null
        }
      });

      const student = await tx.admin_estudiante.create({
        data: {
          id_usuario: usuario.id_usuario,
          codigo_estudiante,
          grado,
          grupo,
          id_estado,
          usuario_creacion: data.usuario_creacion || null
        },
        include: {
          admin_usuario: true
        }
      });

      return student;
    });

    logger.info(`Creado estudiante: ${result.admin_usuario.primer_nombre} ${result.admin_usuario.apellido_paterno}`);

    return {
      id: result.id_estudiante,
      nombreCompleto: `${result.admin_usuario.primer_nombre} ${result.admin_usuario.apellido_paterno}`,
      cedula: result.admin_usuario.cedula,
      correo: result.admin_usuario.correo,
      username: result.admin_usuario.username,
      codigo_estudiante: result.codigo_estudiante,
      grado: result.grado,
      grupo: result.grupo
    };
  }

  async delete(id, usuarioModificacion = null) {
    logger.info(`Eliminando estudiante id: ${id} por usuario: ${usuarioModificacion || 'system'}`);
    return await prisma.admin_estudiante.update({
      where: { id_estudiante: parseInt(id) },
      data: {
        id_estado: 4,
        fecha_modificacion: new Date(),
        usuario_modificacion: usuarioModificacion || null
      }
    });
  }

  async update(id, data, usuarioModificacion = null) {
    const existingStudent = await studentRepository.findById(id);
    if (!existingStudent) {
      throw new AppError('Estudiante no encontrado', 404);
    }

    const studentUpdateData = {
      codigo_estudiante: data.codigo_estudiante,
      grado: data.grado,
      grupo: data.grupo,
      id_estado: data.id_estado || existingStudent.id_estado,
      usuario_modificacion: usuarioModificacion || null,
      fecha_modificacion: new Date()
    };

    const userUpdateData = {};
    if (data.primer_nombre !== undefined) userUpdateData.primer_nombre = data.primer_nombre;
    if (data.apellido_paterno !== undefined) userUpdateData.apellido_paterno = data.apellido_paterno;
    if (data.apellido_materno !== undefined) userUpdateData.apellido_materno = data.apellido_materno;
    if (data.cedula !== undefined) userUpdateData.cedula = data.cedula;
    if (data.correo !== undefined) userUpdateData.correo = data.correo;

    let updated;

    if (Object.keys(userUpdateData).length > 0) {
      updated = await prisma.$transaction(async (tx) => {
        await tx.admin_usuario.update({
          where: { id_usuario: existingStudent.id_usuario },
          data: {
            ...userUpdateData,
            usuario_modificacion: usuarioModificacion || null,
            fecha_modificacion: new Date()
          }
        });

        const student = await tx.admin_estudiante.update({
          where: { id_estudiante: parseInt(id) },
          data: studentUpdateData,
          include: { admin_usuario: true }
        });

        return student;
      });
    } else {
      updated = await studentRepository.update(id, studentUpdateData);
    }

    logger.info(`Actualizado estudiante id ${id} por usuario ${usuarioModificacion || 'system'}`);
    return updated;
  }
}

module.exports = new StudentService();
