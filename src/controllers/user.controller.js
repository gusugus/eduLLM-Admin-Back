const prisma = require('../config/prisma');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sanitizeUsername, sanitizeName } = require('../utils/sanitize');

// Verificar si un username está disponible
exports.checkUsername = catchAsync(async (req, res) => {
  const username = sanitizeUsername(req.body.username);
  const { excludeUserId } = req.body;
  
  if (!username) {
    throw new AppError('Username es requerido', 400);
  }
  
  const where = { username };
  if (excludeUserId) {
    where.id_usuario = { not: parseInt(excludeUserId) };
  }
  
  const existingUser = await prisma.usuario.findFirst({ where });
  
  res.json({ 
    available: !existingUser,
    message: existingUser ? 'Username ya existe' : 'Username disponible'
  });
});

// Sugerir username basado en nombre y apellido (devuelve el PRIMERO disponible)
exports.suggestUsername = catchAsync(async (req, res) => {
  const primerNombre = sanitizeName(req.body.primerNombre || '');
  const apellidoPaterno = sanitizeName(req.body.apellidoPaterno || '');
  
  if (!primerNombre || !apellidoPaterno) {
    throw new AppError('Nombre y apellido son requeridos', 400);
  }
  
  // Limpiar y normalizar
  const normalize = (str) => {
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]/g, '');
  };
  
  const base = `${normalize(primerNombre)}${normalize(apellidoPaterno)}`;
  
  // Buscar todos los usernames que comiencen con la base
  const existingUsers = await prisma.usuario.findMany({
    where: {
      username: {
        startsWith: base
      }
    },
    select: { username: true }
  });
  
  const existingUsernames = existingUsers.map(u => u.username);
  
  // Encontrar el primer username disponible
  let suggestedUsername = base;
  let counter = 1;
  
  while (existingUsernames.includes(suggestedUsername)) {
    suggestedUsername = `${base}${counter}`;
    counter++;
  }
  
  res.json({ 
    username: suggestedUsername,
    base,
    isNew: counter === 1,
    exists: existingUsernames.length > 0
  });
});

// Obtener todos los usuarios
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await prisma.usuario.findMany({
    select: {
      id_usuario: true,
      cedula: true,
      username: true,
      primer_nombre: true,
      segundo_nombre: true,
      apellido_paterno: true,
      apellido_materno: true,
      correo: true,
      id_rol: true,
      id_estado: true
    }
  });
  
  res.json({ success: true, data: users });
});

// Obtener usuario por ID
exports.getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const user = await prisma.usuario.findUnique({
    where: { id_usuario: parseInt(id) },
    select: {
      id_usuario: true,
      cedula: true,
      username: true,
      primer_nombre: true,
      segundo_nombre: true,
      apellido_paterno: true,
      apellido_materno: true,
      correo: true,
      id_rol: true,
      id_estado: true
    }
  });
  
  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }
  
  res.json({ success: true, data: user });
});