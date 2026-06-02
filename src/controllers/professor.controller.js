const  professorService  = require('../services/professor.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllProfessors = catchAsync(async (req, res) => {
  const data = await professorService.findAll();
  res.json({ success: true, data });
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