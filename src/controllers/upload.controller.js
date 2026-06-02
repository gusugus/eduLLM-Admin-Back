const prisma = require('../config/prisma');
const logger = require('../config/logger');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const ESTADOS = require('../constants/estados');

exports.uploadProfilePhoto = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('No se envió ninguna imagen', 400);
  }

  const idUsuario = req.body.id_usuario ? parseInt(req.body.id_usuario) : null;
  const ruta = `uploads/profiles/${req.file.filename}`;

  const result = await prisma.$transaction(async (tx) => {
    if (idUsuario) {
      await tx.documento.updateMany({
        where: { id_usuario: idUsuario, id_estado: ESTADOS.ACTIVO },
        data: { id_estado: ESTADOS.ELIMINADO }
      });
    }

    const documento = await tx.documento.create({
      data: { ruta, id_usuario: idUsuario, id_estado: ESTADOS.ACTIVO }
    });

    return documento;
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
