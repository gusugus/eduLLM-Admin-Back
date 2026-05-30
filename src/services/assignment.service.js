const prisma = require('../config/prisma');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const periodoService = require('./periodo.service');

class AssignmentService {

  // ─── Profesor ↔ Materia ─────────────────────────────────────

  async assignProfessorToSubject(data) {
    const { id_profesor, id_materia } = data;

    const periodo = await periodoService.getActivo();
    if (!periodo) throw new AppError('No hay un periodo lectivo activo', 400);

    const existing = await prisma.profesor_materia.findFirst({
      where: { id_profesor: parseInt(id_profesor), id_materia: parseInt(id_materia), id_estado: { not: 4 } }
    });
    if (existing) throw new AppError('El profesor ya tiene esta materia asignada', 409);

    const assignment = await prisma.profesor_materia.create({
      data: {
        id_profesor: parseInt(id_profesor),
        id_materia: parseInt(id_materia),
        id_periodo_lectivo: periodo.id_periodo_lectivo,
        id_estado: 1,
        usuario_creacion: data.usuario_creacion || null
      },
      include: {
        admin_profesor: { select: { id_profesor: true, admin_usuario: { select: { primer_nombre: true, apellido_paterno: true } } } },
        info_materia: { select: { id_materia: true, nombre: true } }
      }
    });

    logger.info(`Asignado profesor ${id_profesor} a materia ${id_materia}`);
    return {
      id: assignment.id_profesor_materia,
      id_profesor: assignment.id_profesor,
      profesor: `${assignment.admin_profesor.admin_usuario.primer_nombre} ${assignment.admin_profesor.admin_usuario.apellido_paterno}`,
      id_materia: assignment.id_materia,
      materia: assignment.info_materia.nombre,
      id_periodo_lectivo: assignment.id_periodo_lectivo
    };
  }

  async listProfessorSubjects() {
    const items = await prisma.profesor_materia.findMany({
      where: { id_estado: { in: [1, 4] } },
      select: {
        id_profesor_materia: true,
        id_estado: true,
        admin_profesor: {
          select: { id_profesor: true, admin_usuario: { select: { primer_nombre: true, apellido_paterno: true } } }
        },
        info_materia: { select: { id_materia: true, nombre: true } },
        admin_periodo_lectivo: { select: { id_periodo_lectivo: true, nombre: true } }
      },
      orderBy: { id_profesor_materia: 'desc' }
    });

    return items.map(i => ({
      id: i.id_profesor_materia,
      id_profesor: i.admin_profesor.id_profesor,
      profesor: `${i.admin_profesor.admin_usuario.primer_nombre} ${i.admin_profesor.admin_usuario.apellido_paterno}`,
      id_materia: i.info_materia.id_materia,
      materia: i.info_materia.nombre,
      periodo: i.admin_periodo_lectivo.nombre,
      estado: i.id_estado === 1 ? 'Activo' : 'Eliminado'
    }));
  }

  async removeProfessorSubject(id) {
    logger.info(`Eliminando asignación profesor-materia id: ${id}`);
    return await prisma.profesor_materia.update({
      where: { id_profesor_materia: parseInt(id) },
      data: { id_estado: 4, fecha_modificacion: new Date() }
    });
  }

  // ─── Estudiante ↔ Materia ───────────────────────────────────

  async assignStudentsToSubject(data) {
    const { id_estudiantes, id_materia } = data;

    if (!id_estudiantes || !Array.isArray(id_estudiantes) || id_estudiantes.length === 0) {
      throw new AppError('Debe enviar al menos un estudiante', 400);
    }

    const periodo = await periodoService.getActivo();
    if (!periodo) throw new AppError('No hay un periodo lectivo activo', 400);

    const materiaId = parseInt(id_materia);
    const results = [];

    for (const idEst of id_estudiantes) {
      const idEstudiante = parseInt(idEst);

      const existing = await prisma.estudiante_materia.findFirst({
        where: {
          id_estudiante: idEstudiante,
          id_materia: materiaId,
          id_periodo_lectivo: periodo.id_periodo_lectivo,
          id_estado: { not: 4 }
        }
      });

      if (existing) {
        const estudiante = await prisma.admin_estudiante.findUnique({
          where: { id_estudiante: idEstudiante },
          select: { admin_usuario: { select: { primer_nombre: true, apellido_paterno: true } } }
        });
        results.push({
          id_estudiante: idEstudiante,
          nombre: `${estudiante?.admin_usuario?.primer_nombre || ''} ${estudiante?.admin_usuario?.apellido_paterno || ''}`.trim(),
          error: 'Ya tiene esta materia asignada'
        });
        continue;
      }

      const assignment = await prisma.estudiante_materia.create({
        data: {
          id_estudiante: idEstudiante,
          id_materia: materiaId,
          id_periodo_lectivo: periodo.id_periodo_lectivo,
          id_estado: 1,
          usuario_creacion: data.usuario_creacion || null
        },
        include: {
          admin_estudiante: {
            select: { id_estudiante: true, admin_usuario: { select: { primer_nombre: true, apellido_paterno: true } } }
          }
        }
      });

      results.push({
        id: assignment.id_estudiante_materia,
        id_estudiante: idEstudiante,
        nombre: `${assignment.admin_estudiante.admin_usuario.primer_nombre} ${assignment.admin_estudiante.admin_usuario.apellido_paterno}`,
        id_materia: materiaId,
        error: null
      });
    }

    const okCount = results.filter(r => !r.error).length;
    logger.info(`Asignados ${okCount}/${id_estudiantes.length} estudiantes a materia ${id_materia}`);
    return results;
  }

  async listStudentSubjects() {
    const items = await prisma.estudiante_materia.findMany({
      where: { id_estado: { in: [1, 4] } },
      select: {
        id_estudiante_materia: true,
        id_estado: true,
        admin_estudiante: {
          select: { id_estudiante: true, admin_usuario: { select: { primer_nombre: true, apellido_paterno: true } } }
        },
        info_materia: { select: { id_materia: true, nombre: true } },
        admin_periodo_lectivo: { select: { id_periodo_lectivo: true, nombre: true } }
      },
      orderBy: { id_estudiante_materia: 'desc' }
    });

    return items.map(i => ({
      id: i.id_estudiante_materia,
      id_estudiante: i.admin_estudiante.id_estudiante,
      estudiante: `${i.admin_estudiante.admin_usuario.primer_nombre} ${i.admin_estudiante.admin_usuario.apellido_paterno}`,
      id_materia: i.info_materia.id_materia,
      materia: i.info_materia.nombre,
      periodo: i.admin_periodo_lectivo.nombre,
      estado: i.id_estado === 1 ? 'Activo' : 'Eliminado'
    }));
  }

  async removeStudentSubject(id) {
    logger.info(`Eliminando asignación estudiante-materia id: ${id}`);
    return await prisma.estudiante_materia.update({
      where: { id_estudiante_materia: parseInt(id) },
      data: { id_estado: 4, fecha_modificacion: new Date() }
    });
  }
}

module.exports = new AssignmentService();
