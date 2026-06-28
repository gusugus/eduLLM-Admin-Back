const usuarioRepository = require('../repositories/usuario.repository');

const normalize = (str) => {
  if (typeof str !== 'string') return '';
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '');
};

const generateUsername = async (primerNombre, apellidoPaterno) => {
  const base = `${normalize(primerNombre)[0] || ''}${normalize(apellidoPaterno)}`;
  const existingUsernames = await usuarioRepository.findUsernamesStartingWith(base);

  let username = base;
  let counter = 1;

  while (existingUsernames.includes(username)) {
    username = `${base}${counter}`;
    counter++;
  }

  return username;
};

module.exports = { generateUsername };
