const prisma = require('./prisma');
const ROLES = require('../constants/roles');

async function initRoles() {
  const roles = await prisma.rol.findMany({ where: { estado: true } });
  roles.forEach(r => {
    ROLES[r.nombre.toUpperCase()] = r.id_rol;
  });
}

module.exports = initRoles;
