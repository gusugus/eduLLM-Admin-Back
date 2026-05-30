const  studentService  = require('../services/student.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAllStudents = catchAsync(async (req, res) => {
  const data = await studentService.findAll();
  res.json({ success: true, data });
});

exports.getStudentById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const item = await studentService.findById(id);
  if (!item) throw new AppError('Student not found', 404);
  res.json({ success: true, data: item });
});

exports.createStudent = catchAsync(async (req, res) => {
  const newItem = await studentService.createWithUser(req.body);
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