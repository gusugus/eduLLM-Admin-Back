const express = require('express');
const router = express.Router();
const gradoController = require('../../controllers/grado.controller');
const { sanitizeGrado } = require('../../middlewares/sanitize.middleware');

router.route('/')
  .get(gradoController.getAllGrados)
  .post(sanitizeGrado, gradoController.createGrado);

router.route('/:id')
  .get(gradoController.getGradoById)
  .put(sanitizeGrado, gradoController.updateGrado)
  .delete(gradoController.deleteGrado);

router.post('/:id/activate', gradoController.activateGrado);

module.exports = router;
