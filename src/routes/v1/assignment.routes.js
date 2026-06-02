const express = require('express');
const router = express.Router();
const assignmentController = require('../../controllers/assignment.controller');

// Profesor ↔ Materia
router.post('/professor-subject', assignmentController.assignProfessorToSubject);
router.get('/professor-subject', assignmentController.listProfessorSubjects);
router.delete('/professor-subject/:id', assignmentController.removeProfessorSubject);

// Estudiante ↔ Materia
router.post('/student-subject', assignmentController.assignStudentsToSubject);
router.get('/student-subject', assignmentController.listStudentSubjects);
router.delete('/student-subject/:id', assignmentController.removeStudentSubject);

module.exports = router;
