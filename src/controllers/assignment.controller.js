const assignmentService = require('../services/assignment.service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const config = require('../config');

const parsePagination = (req) => ({
  page: Math.max(1, parseInt(req.query.page, 10) || 1),
  limit: Math.min(
    config.pagination.maxLimit,
    Math.max(1, parseInt(req.query.limit, 10) || config.pagination.defaultLimit)
  ),
});

// ─── Profesor ↔ Materia ─────────────────────────────────────

exports.assignProfessorToSubject = catchAsync(async (req, res) => {
  const result = await assignmentService.assignProfessorToSubject(req.body);
  res.status(201).json({ success: true, data: result });
});

exports.listProfessorSubjects = catchAsync(async (req, res) => {
  const { page, limit } = parsePagination(req);
  const result = await assignmentService.listProfessorSubjects(page, limit);
  res.json({ success: true, ...result });
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
  const { page, limit } = parsePagination(req);
  const result = await assignmentService.listStudentSubjects(page, limit);
  res.json({ success: true, ...result });
});

exports.removeStudentSubject = catchAsync(async (req, res) => {
  await assignmentService.removeStudentSubject(req.params.id);
  res.json({ success: true, message: 'Asignación eliminada correctamente' });
});
