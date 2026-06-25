const professorService = require('../services/professor.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const config = require('../config');

exports.getAllProfessors = catchAsync(async (req, res) => {
  if (req.query.all === 'true') {
    const ESTADOS = require('../constants/estados');
    const result = await professorService.findAll(1, null, '', [ESTADOS.ACTIVO]);
    return res.json({ success: true, data: result.data, pagination: null });
  }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    config.pagination.maxLimit,
    Math.max(1, parseInt(req.query.limit, 10) || config.pagination.defaultLimit)
  );
  const search = req.query.search?.trim() || '';
  const result = await professorService.findAll(page, limit, search);
  res.json({ success: true, ...result });
});

exports.getProfessorById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const item = await professorService.findById(id);
  if (!item) throw new AppError('Professor not found', 404);
  res.json({ success: true, data: item });
});

exports.createProfessor = catchAsync(async (req, res) => {
  const newItem = await professorService.createWithUser(req.body);
  res.status(201).json({ success: true, data: newItem });
});

exports.updateProfessor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updated = await professorService.update(id, req.body);
  res.json({ success: true, data: updated });
});

exports.deleteProfessor = catchAsync(async (req, res) => {
  const { id } = req.params;
  const usuarioModificacion = req.user?.id_usuario || null;
  
  const result = await professorService.delete(id, usuarioModificacion);
  
  res.json({ 
    success: true, 
    message: result.message || 'Profesor eliminado correctamente'
  });
});