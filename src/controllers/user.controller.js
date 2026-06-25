const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const userService = require('../services/user.service');
const { sanitizeUsername, sanitizeName } = require('../utils/sanitize');

exports.checkUsername = catchAsync(async (req, res) => {
  const username = sanitizeUsername(req.body.username);
  if (!username) {
    throw new AppError('Username es requerido', 400);
  }

  const result = await userService.checkUsername(username, req.body.excludeUserId);
  res.json(result);
});

exports.suggestUsername = catchAsync(async (req, res) => {
  const primerNombre = sanitizeName(req.body.primerNombre || '');
  const apellidoPaterno = sanitizeName(req.body.apellidoPaterno || '');

  if (!primerNombre || !apellidoPaterno) {
    throw new AppError('Nombre y apellido son requeridos', 400);
  }

  const result = await userService.suggestUsername(primerNombre, apellidoPaterno);
  res.json(result);
});

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers();
  res.json({ success: true, data: users });
});

exports.getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  res.json({ success: true, data: user });
});
