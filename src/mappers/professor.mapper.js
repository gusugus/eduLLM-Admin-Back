const ESTADOS = require('../constants/estados');
const config = require('../config');

class ProfessorMapper {
  static toResponse(professor, includeMaterias = false) {
    if (!professor) return null;

    const docActivo = professor.usuario.archivo?.find(d => d.estado === true);

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
      foto_url: docActivo ? `${config.gatewayUrl}/${docActivo.ruta}` : null,
      estado: professor.estadoNombre || null,
      rol: professor.rolNombre || null
    };

    if (includeMaterias && professor.profesor_materia) {
      baseResponse.materias = professor.profesor_materia.map(pm => ({
        nombre: pm.materia.nombre,
        descripcion: pm.materia.descripcion
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
