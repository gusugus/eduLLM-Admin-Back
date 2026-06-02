const express = require('express');
const router = express.Router();
const professorController = require('../../controllers/professor.controller');
const { sanitizeProfessor } = require('../../middlewares/sanitize.middleware');

router.route('/')
  .get(professorController.getAllProfessors)
  .post(sanitizeProfessor, professorController.createProfessor);

router.route('/:id')
  .get(professorController.getProfessorById)
  .put(sanitizeProfessor, professorController.updateProfessor)
  .delete(professorController.deleteProfessor);

module.exports = router;