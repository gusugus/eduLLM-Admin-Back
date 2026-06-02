const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/student.controller');
const { sanitizeStudent } = require('../../middlewares/sanitize.middleware');

router.route('/')
  .get(studentController.getAllStudents)
  .post(sanitizeStudent, studentController.createStudent);

router.route('/:id')
  .get(studentController.getStudentById)
  .put(sanitizeStudent, studentController.updateStudent)
  .delete(studentController.deleteStudent);

module.exports = router;