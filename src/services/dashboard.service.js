const prisma = require('../config/prisma');
const professorRepository = require('../repositories/professor.repository');
const studentRepository = require('../repositories/student.repository');
const subjectRepository = require('../repositories/subject.repository');
const ESTADOS = require('../constants/estados');

class DashboardService {
  async getStats() {
    const [profesores, estudiantes, materias, grados] = await Promise.all([
      professorRepository.count([ESTADOS.ACTIVO]),
      studentRepository.count([ESTADOS.ACTIVO]),
      subjectRepository.count([ESTADOS.ACTIVO]),
      prisma.grado.count(),
    ]);

    return { profesores, estudiantes, materias, grados };
  }
}

module.exports = new DashboardService();
