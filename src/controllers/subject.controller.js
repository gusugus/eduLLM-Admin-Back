const subjectService = require('../services/subject.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllSubjects = catchAsync(async (req, res) => {
  const data = await subjectService.findAll();
  res.json({ success: true, data });
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
