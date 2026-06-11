const prisma = require('../config/prisma');
const logger = require('../config/logger');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.uploadProfilePhoto = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('No se envió ninguna imagen', 400);
  }

  const idUsuario = req.body.id_usuario ? parseInt(req.body.id_usuario) : null;
  const ruta = `uploads/profiles/${req.file.filename}`;

  const result = await prisma.$transaction(async (tx) => {
    if (idUsuario) {
      await tx.tbl_m_archivo.updateMany({
        where: { usuario_id: idUsuario, estado: true },
        data: { estado: false }
      });
    }

    return await tx.tbl_m_archivo.create({
      data: { ruta, usuario_id: idUsuario, estado: true }
    });
  });

  logger.info(`Foto subida: ${ruta}, id_documento: ${result.id_documento}, usuario: ${idUsuario}`);

  res.status(201).json({
    success: true,
    data: {
      id_documento: result.id_documento,
      ruta: result.ruta,
      url: `${req.protocol}://${req.get('host')}/${ruta}`
    }
  });
});
