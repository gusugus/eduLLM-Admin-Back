const studentService = require('../services/student.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const config = require('../config');

exports.getAllStudents = catchAsync(async (req, res) => {
  if (req.query.all === 'true') {
    const ESTADOS = require('../constants/estados');
    const result = await studentService.findAll(1, null, '', [ESTADOS.ACTIVO]);
    return res.json({ success: true, data: result.data, pagination: null });
  }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    config.pagination.maxLimit,
    Math.max(1, parseInt(req.query.limit, 10) || config.pagination.defaultLimit)
  );
  const search = req.query.search?.trim() || '';
  const result = await studentService.findAll(page, limit, search);
  res.json({ success: true, ...result });
});

exports.getStudentById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const item = await studentService.findById(id);
  if (!item) throw new AppError('Student not found', 404);
  res.json({ success: true, data: item });
});

exports.createStudent = catchAsync(async (req, res) => {
  const token = req.cookies?.jwtToken || req.headers?.authorization?.replace('Bearer ', '');
  const newItem = await studentService.createWithUser(req.body, token);
  res.status(201).json({ success: true, data: newItem });
});

exports.updateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const usuarioModificacion = req.user?.id_usuario || null;
  const updated = await studentService.update(id, req.body, usuarioModificacion);
  res.json({ success: true, data: updated });
});

exports.deleteStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const usuarioModificacion = req.user?.id_usuario || null;
  const result = await studentService.delete(id, usuarioModificacion);
  res.json({ success: true, message: result.message || 'Estudiante eliminado correctamente' });
});

exports.activateStudent = catchAsync(async (req, res) => {
  const { id } = req.params;
  const usuarioModificacion = req.user?.id_usuario || null;
  const result = await studentService.activate(id, usuarioModificacion);
  res.json({ success: true, ...result });
});