const archivoRepository = require('../repositories/archivo.repository');
const prisma = require('../config/prisma');

class UploadService {
  async uploadProfilePhoto(idUsuario, ruta) {
    const result = await prisma.$transaction(async (tx) => {
      if (idUsuario) {
        await archivoRepository.updateMany(
          { usuario_id: idUsuario, estado: true },
          { estado: false },
          tx
        );
      }

      return await archivoRepository.create(
        { ruta, usuario_id: idUsuario, estado: true },
        tx
      );
    });

    return result;
  }
}

module.exports = new UploadService();
