const subjectService = require('../services/subject.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const config = require('../config');

exports.getAllSubjects = catchAsync(async (req, res) => {
  if (req.query.all === 'true') {
    const ESTADOS = require('../constants/estados');
    const result = await subjectService.findAll(1, null, '', [ESTADOS.ACTIVO]);
    return res.json({ success: true, data: result.data, pagination: null });
  }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    config.pagination.maxLimit,
    Math.max(1, parseInt(req.query.limit, 10) || config.pagination.defaultLimit)
  );
  const search = req.query.search?.trim() || '';
  const result = await subjectService.findAll(page, limit, search);
  res.json({ success: true, ...result });
});

exports.getSubjectById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const item = await subjectService.findById(id);
  if (!item) throw new AppError('Subject not found', 404);
  res.json({ success: true, data: item });
});

exports.createSubject = catchAsync(async (req, res) => {
  const newItem = await subjectService.create(req.body);
  res.status(201).json({ success: true, message: `Materia "${newItem.nombre}" creada exitosamente`, data: newItem });
});

exports.updateSubject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await subjectService.update(id, req.body);
  res.json({ success: true, message: `Materia "${updated.nombre}" actualizada exitosamente`, data: updated });
});

exports.deleteSubject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await subjectService.delete(id);
  res.json({ success: true, message: result.message || 'Materia eliminada correctamente' });
});

exports.activateSubject = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await subjectService.activate(id);
  res.json({ success: true, ...result });
});
