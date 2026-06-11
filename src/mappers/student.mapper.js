class StudentMapper {
  static toResponse(student, includeMaterias = false) {
    if (!student) return null;

    const usuario = student.tbl_m_usuario;
    const docActivo = usuario.tbl_m_archivo?.find(d => d.estado === true);

    const baseResponse = {
      id: student.id_estudiante,
      nombreCompleto: this.getNombreCompleto(usuario),
      primer_nombre: usuario.primer_nombre,
      segundo_nombre: usuario.segundo_nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      cedula: usuario.cedula,
      correo: usuario.correo,
      username: usuario.username,
      foto_url: docActivo ? `http://localhost:${process.env.PORT || 8002}/${docActivo.ruta}` : null,
      estado: student.estadoNombre || null,
      rol: student.rolNombre || null
    };

    if (includeMaterias && student.tbl_m_estudiante_materia) {
      baseResponse.materias = student.tbl_m_estudiante_materia.map(em => ({
        id: em.tbl_m_materia.id_materia,
        nombre: em.tbl_m_materia.nombre,
        descripcion: em.tbl_m_materia.descripcion
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
