const gradoService = require('../services/grado.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const config = require('../config');

exports.getAllGrados = catchAsync(async (req, res) => {
  if (req.query.all === 'true') {
    const result = await gradoService.findAll(1, null, '');
    return res.json({ success: true, data: result.data, pagination: null });
  }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    config.pagination.maxLimit,
    Math.max(1, parseInt(req.query.limit, 10) || config.pagination.defaultLimit)
  );
  const search = req.query.search?.trim() || '';
  const result = await gradoService.findAll(page, limit, search);
  res.json({ success: true, ...result });
});

exports.getGradoById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const item = await gradoService.findById(id);
  if (!item) throw new AppError('Grado not found', 404);
  res.json({ success: true, data: item });
});

exports.createGrado = catchAsync(async (req, res) => {
  const newItem = await gradoService.create(req.body);
  res.status(201).json({ success: true, message: `Grado ${newItem.nombre_completo} creado exitosamente`, data: newItem });
});

exports.updateGrado = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await gradoService.update(id, req.body);
  res.json({ success: true, message: `Grado ${updated.nombre_completo} actualizado exitosamente`, data: updated });
});

exports.deleteGrado = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await gradoService.delete(id, req.user?.id);
  res.json({ success: true, message: result.message || 'Grado eliminado correctamente' });
});

exports.activateGrado = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await gradoService.activate(id);
  res.json({ success: true, ...result });
});
