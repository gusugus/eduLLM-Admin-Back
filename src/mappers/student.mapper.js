class StudentMapper {
  static toResponse(student, includeMaterias = false) {
    if (!student) return null;

    const baseResponse = {
      id: student.id_estudiante,
      nombreCompleto: this.getNombreCompleto(student.admin_usuario),
      primer_nombre: student.admin_usuario.primer_nombre,
      apellido_paterno: student.admin_usuario.apellido_paterno,
      apellido_materno: student.admin_usuario.apellido_materno,
      cedula: student.admin_usuario.cedula,
      correo: student.admin_usuario.correo,
      username: student.admin_usuario.username,
      codigo_estudiante: student.codigo_estudiante || null,
      grado: student.grado || null,
      grupo: student.grupo || null,
      estado: student.estadoNombre || null,
      rol: student.rolNombre || null
    };

    if (includeMaterias && student.estudiante_materia) {
      baseResponse.materias = student.estudiante_materia.map(em => ({
        id: em.info_materia.id_materia,
        nombre: em.info_materia.nombre,
        descripcion: em.info_materia.descripcion
      }));
    }

    return baseResponse;
  }

  static toResponseList(students) {
    return students.map(stu => this.toResponse(stu, false));
  }

  static getNombreCompleto(usuario) {
    const { primer_nombre, apellido_paterno, apellido_materno } = usuario;
    return `${primer_nombre} ${apellido_paterno} ${apellido_materno || ''}`.trim();
  }
}

module.exports = StudentMapper;
