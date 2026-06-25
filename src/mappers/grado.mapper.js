class GradoMapper {
  static toResponse(grado) {
    if (!grado) return null;

    return {
      id: grado.id_grado,
      grado: grado.grado,
      paralelo: grado.paralelo || null,
      nombre_completo: this.getNombreCompleto(grado),
      estado: grado.estado === true ? 'Activo' : grado.estado === false ? 'Inactivo' : null,
    };
  }

  static toResponseList(grados) {
    return grados.map(g => this.toResponse(g));
  }

  static getNombreCompleto(grado) {
    if (!grado) return '';
    return `${grado.grado} ${grado.paralelo || ''}`.trim();
  }
}

module.exports = GradoMapper;
