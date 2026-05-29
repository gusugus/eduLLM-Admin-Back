class ProfessorMapper {
  static toResponse(professor, includeMaterias = false) {
    if (!professor) return null;

    const baseResponse = {
      id: professor.id_profesor,
      nombreCompleto: this.getNombreCompleto(professor.admin_usuario),
      primer_nombre: professor.admin_usuario.primer_nombre,
      apellido_paterno: professor.admin_usuario.apellido_paterno,
      apellido_materno: professor.admin_usuario.apellido_materno,
      cedula: professor.admin_usuario.cedula,
      correo: professor.admin_usuario.correo,
      username: professor.admin_usuario.username,
      departamento: professor.departamento,
      estado: professor.estadoNombre || null,
      rol: professor.rolNombre || null
    };

    // Incluir materias solo si se solicita (para findById)
    if (includeMaterias && professor.profesor_materia) {
      baseResponse.materias = professor.profesor_materia.map(pm => ({
        id: pm.info_materia.id_materia,
        nombre: pm.info_materia.nombre,
        descripcion: pm.info_materia.descripcion
      }));
    }

    return baseResponse;
  }

  static toResponseList(professors) {
    return professors.map(prof => this.toResponse(prof, false));
  }

  static getNombreCompleto(usuario) {
    const { primer_nombre, apellido_paterno, apellido_materno } = usuario;
    return `${primer_nombre} ${apellido_paterno} ${apellido_materno || ''}`.trim();
  }
}

module.exports = ProfessorMapper;