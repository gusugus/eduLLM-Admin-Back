class SubjectMapper {
  static toResponse(subject) {
    if (!subject) return null;

    return {
      id: subject.id_materia,
      nombre: subject.nombre,
      descripcion: subject.descripcion || null,
      nombre_normalizado: subject.nombre_normalizado || null,
      estado: subject.estado,
      estadoNombre: subject.estadoNombre || null,
      grado_id: subject.grado_id || null,
      grado: subject.tbl_m_grado ? {
        id: subject.tbl_m_grado.id_grado,
        grado: subject.tbl_m_grado.grado,
        paralelo: subject.tbl_m_grado.paralelo,
        nombre_completo: `${subject.tbl_m_grado.grado} ${subject.tbl_m_grado.paralelo || ''}`.trim()
      } : null
    };
  }

  static toResponseList(subjects) {
    return subjects.map(sub => this.toResponse(sub));
  }
}

module.exports = SubjectMapper;
