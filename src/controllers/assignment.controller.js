const assignmentService = require('../services/assignment.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// ─── Profesor ↔ Materia ─────────────────────────────────────

exports.assignProfessorToSubject = catchAsync(async (req, res) => {
  const result = await assignmentService.assignProfessorToSubject(req.body);
  res.status(201).json({ success: true, data: result });
});

exports.listProfessorSubjects = catchAsync(async (req, res) => {
  const data = await assignmentService.listProfessorSubjects();
  res.json({ success: true, data });
});

exports.removeProfessorSubject = catchAsync(async (req, res) => {
  await assignmentService.removeProfessorSubject(req.params.id);
  res.json({ success: true, message: 'Asignación eliminada correctamente' });
});

// ─── Estudiante ↔ Materia ───────────────────────────────────

exports.assignStudentsToSubject = catchAsync(async (req, res) => {
  const results = await assignmentService.assignStudentsToSubject(req.body);
  res.status(201).json({ success: true, data: results });
});

exports.listStudentSubjects = catchAsync(async (req, res) => {
  const data = await assignmentService.listStudentSubjects();
  res.json({ success: true, data });
});

exports.removeStudentSubject = catchAsync(async (req, res) => {
  await assignmentService.removeStudentSubject(req.params.id);
  res.json({ success: true, message: 'Asignación eliminada correctamente' });
});
