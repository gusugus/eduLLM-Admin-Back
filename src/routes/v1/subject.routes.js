const express = require('express');
const router = express.Router();
const subjectController = require('../../controllers/subject.controller');
const { sanitizeSubject } = require('../../middlewares/sanitize.middleware');

router.route('/')
  .get(subjectController.getAllSubjects)
  .post(sanitizeSubject, subjectController.createSubject);

router.route('/:id')
  .get(subjectController.getSubjectById)
  .put(sanitizeSubject, subjectController.updateSubject)
  .delete(subjectController.deleteSubject);

module.exports = router;