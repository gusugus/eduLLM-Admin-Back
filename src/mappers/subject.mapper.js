class SubjectMapper {
  static toResponse(subject) {
    if (!subject) return null;

    return {
      id: subject.id_materia,
      nombre: subject.nombre,
      descripcion: subject.descripcion || null,
      nombre_normalizado: subject.nombre_normalizado || null,
      estado: subject.estado === true ? 'Activo' : subject.estado === false ? 'Inactivo' : null,
      grado: subject.grado ? {
        grado: subject.grado.grado,
        paralelo: subject.grado.paralelo,
        nombre_completo: `${subject.grado.grado} ${subject.grado.paralelo || ''}`.trim()
      } : null
    };
  }

  static toResponseList(subjects) {
    return subjects.map(sub => this.toResponse(sub));
  }
}

module.exports = SubjectMapper;
