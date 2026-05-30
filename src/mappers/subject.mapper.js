class SubjectMapper {
  static toResponse(subject) {
    if (!subject) return null;

    return {
      id: subject.id_materia,
      nombre: subject.nombre,
      descripcion: subject.descripcion || null,
      nombre_normalizado: subject.nombre_normalizado || null,
      estado: subject.estadoNombre || null
    };
  }

  static toResponseList(subjects) {
    return subjects.map(sub => this.toResponse(sub));
  }
}

module.exports = SubjectMapper;
