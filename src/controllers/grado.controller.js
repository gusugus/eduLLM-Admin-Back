const gradoService = require('../services/grado.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllGrados = catchAsync(async (req, res) => {
  const data = await gradoService.findAll();
  res.json({ success: true, data });
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
  const result = await gradoService.delete(id);
  res.json({ success: true, message: result.message || 'Grado eliminado correctamente' });
});
