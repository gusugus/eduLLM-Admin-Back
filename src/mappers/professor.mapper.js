class ProfessorMapper {
  static toResponse(professor, includeMaterias = false) {
    if (!professor) return null;

    const usuario = professor.tbl_m_usuario;
    const docActivo = usuario.tbl_m_archivo?.find(d => d.estado === true);

    const baseResponse = {
      id: professor.id_profesor,
      id_usuario: usuario.id_usuario,
      nombreCompleto: this.getNombreCompleto(usuario),
      primer_nombre: usuario.primer_nombre,
      segundo_nombre: usuario.segundo_nombre,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      cedula: usuario.cedula,
      correo: usuario.correo,
      username: usuario.username,
      foto_url: docActivo ? `http://localhost:${process.env.PORT || 8002}/${docActivo.ruta}` : null,
      estado: professor.estadoNombre || null,
      rol: professor.rolNombre || null
    };

    if (includeMaterias && professor.tbl_t_profesor_materia) {
      baseResponse.materias = professor.tbl_t_profesor_materia.map(pm => ({
        id: pm.tbl_m_materia.id_materia,
        nombre: pm.tbl_m_materia.nombre,
        descripcion: pm.tbl_m_materia.descripcion
      }));
    }

    return baseResponse;
  }

  static toResponseList(professors) {
    return professors.map(prof => this.toResponse(prof, false));
  }

  static getNombreCompleto(usuario) {
    const { primer_nombre, segundo_nombre, apellido_paterno, apellido_materno } = usuario;
    return `${primer_nombre} ${segundo_nombre || ''} ${apellido_paterno} ${apellido_materno || ''}`.trim();
  }
}

module.exports = ProfessorMapper;
