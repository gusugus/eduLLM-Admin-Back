const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');


// Verificar disponibilidad de username
router.post('/check-username', userController.checkUsername);

// Sugerir username automático
router.post('/suggest-username', userController.suggestUsername);

// CRUD de usuarios (opcional)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

module.exports = router;