class EstadoService {
  getNombreEstado(estado) {
    return estado ? 'Activo' : 'Inactivo';
  }
}

module.exports = new EstadoService();
