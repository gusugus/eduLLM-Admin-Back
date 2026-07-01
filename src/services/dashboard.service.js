const prisma = require('../config/prisma');
const professorRepository = require('../repositories/professor.repository');
const studentRepository = require('../repositories/student.repository');
const subjectRepository = require('../repositories/subject.repository');
const dashboardRepository = require('../repositories/dashboard.repository');
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

  async getCharts({ periodo, estudianteId } = {}) {
    const [profesorRanking, rendimientoGrado, distribucionPuntajes] = await Promise.all([
      dashboardRepository.getProfessorRanking({ periodo }),
      dashboardRepository.getGradePerformance({ periodo }),
      dashboardRepository.getScoreDistribution({ periodo, estudianteId }),
    ]);
    return { profesorRanking, rendimientoGrado, distribucionPuntajes };
  }
}

module.exports = new DashboardService();
