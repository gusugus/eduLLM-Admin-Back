const ESTADOS = require('../constants/estados');

class ProfessorMapper {
  static toResponse(professor, includeMaterias = false) {
    if (!professor) return null;

    const docActivo = professor.usuario.documento?.find(d => d.id_estado === ESTADOS.ACTIVO);

    const baseResponse = {
      id: professor.id_profesor,
      id_usuario: professor.usuario.id_usuario,
      nombreCompleto: this.getNombreCompleto(professor.usuario),
      primer_nombre: professor.usuario.primer_nombre,
      segundo_nombre: professor.usuario.segundo_nombre,
      apellido_paterno: professor.usuario.apellido_paterno,
      apellido_materno: professor.usuario.apellido_materno,
      cedula: professor.usuario.cedula,
      correo: professor.usuario.correo,
      username: professor.usuario.username,
      foto_url: docActivo ? `http://localhost:${process.env.PORT || 8002}/${docActivo.ruta}` : null,
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
    const { primer_nombre, segundo_nombre, apellido_paterno, apellido_materno } = usuario;
    return `${primer_nombre} ${segundo_nombre || ''} ${apellido_paterno} ${apellido_materno || ''}`.trim();
  }
}

module.exports = ProfessorMapper;