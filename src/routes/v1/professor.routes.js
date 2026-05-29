const express = require('express');
const router = express.Router();
const professorController = require('../../controllers/professor.controller');

router.route('/')
  .get(professorController.getAllProfessors)
  .post(professorController.createProfessor);

router.route('/:id')
  .get(professorController.getProfessorById)
  .put(professorController.updateProfessor)
  .delete(professorController.deleteProfessor);

module.exports = router;