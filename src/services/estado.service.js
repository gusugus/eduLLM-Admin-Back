class EstadoService {
  getNombreEstado(estado) {
    return estado === true ? 'Activo' : estado === false ? 'Inactivo' : 'Desconocido';
  }

  getCodigoEstado(estado) {
    return estado === true ? 'ACT' : estado === false ? 'INA' : 'UNK';
  }
}

module.exports = new EstadoService();
