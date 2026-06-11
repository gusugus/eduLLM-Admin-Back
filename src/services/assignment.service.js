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

    const existing = await prisma.tbl_t_profesor_materia.findFirst({
      where: {
        profesor_id: parseInt(id_profesor),
        materia_id: parseInt(id_materia),
        estado: true
      }
    });
    if (existing) throw new AppError('El profesor ya tiene esta materia asignada', 409);

    const assignment = await prisma.tbl_t_profesor_materia.create({
      data: {
        profesor_id: parseInt(id_profesor),
        materia_id: parseInt(id_materia),
        periodo_lectivo_id: periodo.id_periodo_lectivo,
        estado: true,
        usuario_creacion: data.usuario_creacion || null
      },
      include: {
        tbl_m_profesor: {
          select: {
            id_profesor: true,
            tbl_m_usuario: { select: { primer_nombre: true, segundo_nombre: true, apellido_paterno: true } }
          }
        },
        tbl_m_materia: {
          select: {
            id_materia: true,
            nombre: true,
            tbl_m_grado: { select: { grado: true, paralelo: true } }
          }
        }
      }
    });

    const g = assignment.tbl_m_materia.tbl_m_grado;
    const gradoStr = g ? `${g.grado} ${g.paralelo || ''}`.trim() : '';

    logger.info(`Asignado profesor ${id_profesor} a materia ${id_materia}`);
    return {
      id: assignment.id_profesor_materia,
      id_profesor: assignment.profesor_id,
      profesor: `${assignment.tbl_m_profesor.tbl_m_usuario.primer_nombre} ${assignment.tbl_m_profesor.tbl_m_usuario.segundo_nombre || ''} ${assignment.tbl_m_profesor.tbl_m_usuario.apellido_paterno}`.trim(),
      id_materia: assignment.materia_id,
      materia: assignment.tbl_m_materia.nombre + (gradoStr ? ` (${gradoStr})` : ''),
      id_periodo_lectivo: assignment.periodo_lectivo_id
    };
  }

  async listProfessorSubjects() {
    const items = await prisma.tbl_t_profesor_materia.findMany({
      select: {
        id_profesor_materia: true,
        estado: true,
        tbl_m_profesor: {
          select: {
            id_profesor: true,
            tbl_m_usuario: { select: { primer_nombre: true, segundo_nombre: true, apellido_paterno: true } }
          }
        },
        tbl_m_materia: {
          select: {
            id_materia: true,
            nombre: true,
            tbl_m_grado: { select: { grado: true, paralelo: true } }
          }
        },
        tbl_m_periodo_lectivo: { select: { id_periodo_lectivo: true, nombre: true } }
      },
      orderBy: { id_profesor_materia: 'desc' }
    });

    return items.map(i => {
      const g = i.tbl_m_materia.tbl_m_grado;
      const gradoStr = g ? `${g.grado} ${g.paralelo || ''}`.trim() : '';
      return {
        id: i.id_profesor_materia,
        id_profesor: i.tbl_m_profesor.id_profesor,
        profesor: `${i.tbl_m_profesor.tbl_m_usuario.primer_nombre} ${i.tbl_m_profesor.tbl_m_usuario.segundo_nombre || ''} ${i.tbl_m_profesor.tbl_m_usuario.apellido_paterno}`.trim(),
        id_materia: i.tbl_m_materia.id_materia,
        materia: i.tbl_m_materia.nombre + (gradoStr ? ` (${gradoStr})` : ''),
        periodo: i.tbl_m_periodo_lectivo.nombre,
        estado: i.estado ? 'Activo' : 'Inactivo'
      };
    });
  }

  async removeProfessorSubject(id) {
    logger.info(`Eliminando asignación profesor-materia id: ${id}`);
    return await prisma.tbl_t_profesor_materia.update({
      where: { id_profesor_materia: parseInt(id) },
      data: { estado: false, fecha_modificacion: new Date() }
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

      const existing = await prisma.tbl_m_estudiante_materia.findFirst({
        where: {
          id_estudiante: idEstudiante,
          id_materia: materiaId,
          id_periodo_lectivo: periodo.id_periodo_lectivo,
          estado: true
        }
      });

      if (existing) {
        const estudiante = await prisma.tbl_m_estudiante.findUnique({
          where: { id_estudiante: idEstudiante },
          select: { tbl_m_usuario: { select: { primer_nombre: true, segundo_nombre: true, apellido_paterno: true } } }
        });
        results.push({
          id_estudiante: idEstudiante,
          nombre: `${estudiante?.tbl_m_usuario?.primer_nombre || ''} ${estudiante?.tbl_m_usuario?.segundo_nombre || ''} ${estudiante?.tbl_m_usuario?.apellido_paterno || ''}`.trim(),
          error: 'Ya tiene esta materia asignada'
        });
        continue;
      }

      const assignment = await prisma.tbl_m_estudiante_materia.create({
        data: {
          id_estudiante: idEstudiante,
          id_materia: materiaId,
          id_periodo_lectivo: periodo.id_periodo_lectivo,
          estado: true,
          usuario_creacion: data.usuario_creacion || null
        },
        include: {
          tbl_m_estudiante: {
            select: {
              id_estudiante: true,
              tbl_m_usuario: { select: { primer_nombre: true, segundo_nombre: true, apellido_paterno: true } }
            }
          }
        }
      });

      results.push({
        id: assignment.id_estudiante_materia,
        id_estudiante: idEstudiante,
        nombre: `${assignment.tbl_m_estudiante.tbl_m_usuario.primer_nombre} ${assignment.tbl_m_estudiante.tbl_m_usuario.segundo_nombre || ''} ${assignment.tbl_m_estudiante.tbl_m_usuario.apellido_paterno}`.trim(),
        id_materia: materiaId,
        error: null
      });
    }

    const okCount = results.filter(r => !r.error).length;
    logger.info(`Asignados ${okCount}/${id_estudiantes.length} estudiantes a materia ${id_materia}`);
    return results;
  }

  async listStudentSubjects() {
    const items = await prisma.tbl_m_estudiante_materia.findMany({
      select: {
        id_estudiante_materia: true,
        estado: true,
        tbl_m_estudiante: {
          select: {
            id_estudiante: true,
            tbl_m_usuario: { select: { primer_nombre: true, segundo_nombre: true, apellido_paterno: true } }
          }
        },
        tbl_m_materia: {
          select: {
            id_materia: true,
            nombre: true,
            tbl_m_grado: { select: { grado: true, paralelo: true } }
          }
        },
        tbl_m_periodo_lectivo: { select: { id_periodo_lectivo: true, nombre: true } }
      },
      orderBy: { id_estudiante_materia: 'desc' }
    });

    return items.map(i => {
      const g = i.tbl_m_materia.tbl_m_grado;
      const gradoStr = g ? `${g.grado} ${g.paralelo || ''}`.trim() : '';
      return {
        id: i.id_estudiante_materia,
        id_estudiante: i.tbl_m_estudiante.id_estudiante,
        estudiante: `${i.tbl_m_estudiante.tbl_m_usuario.primer_nombre} ${i.tbl_m_estudiante.tbl_m_usuario.segundo_nombre || ''} ${i.tbl_m_estudiante.tbl_m_usuario.apellido_paterno}`.trim(),
        id_materia: i.tbl_m_materia.id_materia,
        materia: i.tbl_m_materia.nombre + (gradoStr ? ` (${gradoStr})` : ''),
        periodo: i.tbl_m_periodo_lectivo.nombre,
        estado: i.estado ? 'Activo' : 'Inactivo'
      };
    });
  }

  async removeStudentSubject(id) {
    logger.info(`Eliminando asignación estudiante-materia id: ${id}`);
    return await prisma.tbl_m_estudiante_materia.update({
      where: { id_estudiante_materia: parseInt(id) },
      data: { estado: false, fecha_modificacion: new Date() }
    });
  }
}

module.exports = new AssignmentService();
