const express = require('express');
const router = express.Router();
const subjectController = require('../../controllers/subject.controller');

router.route('/')
  .get(subjectController.getAllSubjects)
  .post(subjectController.createSubject);

router.route('/:id')
  .get(subjectController.getSubjectById)
  .put(subjectController.updateSubject)
  .delete(subjectController.deleteSubject);

module.exports = router;