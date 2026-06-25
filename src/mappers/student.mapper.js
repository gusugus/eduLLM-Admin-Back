const ESTADOS = require('../constants/estados');
const config = require('../config');

class StudentMapper {
  static toResponse(student, includeMaterias = false) {
    if (!student) return null;

    const docActivo = student.usuario.archivo?.find(d => d.estado === true);

    const baseResponse = {
      id: student.id_estudiante,
      nombreCompleto: this.getNombreCompleto(student.usuario),
      primer_nombre: student.usuario.primer_nombre,
      segundo_nombre: student.usuario.segundo_nombre,
      apellido_paterno: student.usuario.apellido_paterno,
      apellido_materno: student.usuario.apellido_materno,
      cedula: student.usuario.cedula,
      correo: student.usuario.correo,
      username: student.usuario.username,
      foto_url: docActivo ? `${config.gatewayUrl}/${docActivo.ruta}` : null,
      estado: student.estadoNombre || null,
      rol: student.rolNombre || null
    };

    if (includeMaterias && student.estudiante_materia) {
      baseResponse.materias = student.estudiante_materia.map(em => ({
        nombre: em.materia.nombre,
        descripcion: em.materia.descripcion
      }));
    }

    return baseResponse;
  }

  static toResponseList(students) {
    return students.map(stu => this.toResponse(stu, false));
  }

  static getNombreCompleto(usuario) {
    const { primer_nombre, segundo_nombre, apellido_paterno, apellido_materno } = usuario;
    return `${primer_nombre} ${segundo_nombre || ''} ${apellido_paterno} ${apellido_materno || ''}`.trim();
  }

  static getGradoNombreCompleto(grado) {
    if (!grado) return '';
    return `${grado.grado} ${grado.paralelo || ''}`.trim();
  }
}

module.exports = StudentMapper;
