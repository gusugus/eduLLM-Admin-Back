const profesorMateriaRepository = require('../repositories/profesor_materia.repository');
const estudianteMateriaRepository = require('../repositories/estudiante_materia.repository');
const estudianteRepository = require('../repositories/student.repository');
const periodoService = require('./periodo.service');
const prisma = require('../config/prisma');

const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const ESTADOS = require('../constants/estados');
const ROLES = require('../constants/roles');

class AssignmentService {

  // ─── Profesor ↔ Materia ─────────────────────────────────────

  async assignProfessorToSubject(data) {
    const { id_profesor, id_materia } = data;

    const periodo = await periodoService.getActivo();
    if (!periodo) throw new AppError('No hay un periodo lectivo activo', 400);

    const existing = await profesorMateriaRepository.findFirst({
      id_profesor: parseInt(id_profesor),
      id_materia: parseInt(id_materia),
      estado: { not: false }
    });
    if (existing) throw new AppError('El profesor ya tiene esta materia asignada', 409);

    const materiaTomada = await profesorMateriaRepository.findFirst({
      id_materia: parseInt(id_materia),
      id_periodo_lectivo: periodo.id_periodo_lectivo,
      estado: { not: false }
    });
    if (materiaTomada) throw new AppError('Esta materia ya tiene un profesor asignado', 409);

    const assignment = await profesorMateriaRepository.create({
      id_profesor: parseInt(id_profesor),
      id_materia: parseInt(id_materia),
      id_periodo_lectivo: periodo.id_periodo_lectivo,
      estado: ESTADOS.ACTIVO,
      usuario_creacion: data.usuario_creacion || null
    }, {
      profesor: { select: { id_profesor: true, usuario: { select: { primer_nombre: true, segundo_nombre: true, apellido_paterno: true } } } },
      materia: { select: { id_materia: true, nombre: true, grado: { select: { grado: true, paralelo: true } } } }
    });

    const g = assignment.materia.grado;
    const gradoStr = g ? `${g.grado} ${g.paralelo || ''}`.trim() : '';

    logger.info(`Asignado profesor ${id_profesor} a materia ${id_materia}`);
    return {
      id: assignment.id_profesor_materia,
      id_profesor: assignment.id_profesor,
      profesor: `${assignment.profesor.usuario.primer_nombre} ${assignment.profesor.usuario.segundo_nombre || ''} ${assignment.profesor.usuario.apellido_paterno}`.trim(),
      id_materia: assignment.id_materia,
      materia: assignment.materia.nombre + (gradoStr ? ` (${gradoStr})` : ''),
      id_periodo_lectivo: assignment.id_periodo_lectivo
    };
  }

  async listProfessorSubjects(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = {
      estado: true,
      profesor: { estado: true, usuario: { id_rol: ROLES.PROFESOR } }
    };
    const [items, total] = await Promise.all([
      profesorMateriaRepository.findMany(
        where,
        {
          id_profesor_materia: true,
          estado: true,
          profesor: {
            select: { id_profesor: true, usuario: { select: { primer_nombre: true, segundo_nombre: true, apellido_paterno: true } } }
          },
          materia: { select: { id_materia: true, nombre: true, grado: { select: { grado: true, paralelo: true } } } },
          periodo_lectivo: { select: { id_periodo_lectivo: true, nombre: true } }
        },
        { id_profesor_materia: 'desc' },
        { skip, take: limit }
      ),
      prisma.profesor_materia.count({ where }),
    ]);

    const data = items.map(i => {
      const g = i.materia.grado;
      const gradoStr = g ? `${g.grado} ${g.paralelo || ''}`.trim() : '';
      return {
        id: i.id_profesor_materia,
        id_profesor: i.profesor.id_profesor,
        profesor: `${i.profesor.usuario.primer_nombre} ${i.profesor.usuario.segundo_nombre || ''} ${i.profesor.usuario.apellido_paterno}`.trim(),
        id_materia: i.materia.id_materia,
        materia: i.materia.nombre + (gradoStr ? ` (${gradoStr})` : ''),
        periodo: i.periodo_lectivo.nombre,
        estado: i.estado === true ? 'Activo' : 'Eliminado'
      };
    });

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async removeProfessorSubject(id) {
    logger.info(`Eliminando asignación profesor-materia id: ${id}`);
    return await profesorMateriaRepository.update(id, {
      estado: ESTADOS.ELIMINADO,
      fecha_modificacion: new Date()
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

      const existing = await estudianteMateriaRepository.findFirst({
        id_estudiante: idEstudiante,
        id_materia: materiaId,
        id_periodo_lectivo: periodo.id_periodo_lectivo,
        estado: { not: false }
      });

      if (existing) {
        const estudiante = await estudianteRepository.findById(idEstudiante);
        results.push({
          id_estudiante: idEstudiante,
          nombre: `${estudiante?.usuario?.primer_nombre || ''} ${estudiante?.usuario?.segundo_nombre || ''} ${estudiante?.usuario?.apellido_paterno || ''}`.trim(),
          error: 'Ya tiene esta materia asignada'
        });
        continue;
      }

      const assignment = await estudianteMateriaRepository.create({
        id_estudiante: idEstudiante,
        id_materia: materiaId,
        id_periodo_lectivo: periodo.id_periodo_lectivo,
        estado: ESTADOS.ACTIVO,
        usuario_creacion: data.usuario_creacion || null
      }, {
        estudiante: {
          select: { id_estudiante: true, usuario: { select: { primer_nombre: true, segundo_nombre: true, apellido_paterno: true } } }
        }
      });

      results.push({
        id: assignment.id_estudiante_materia,
        id_estudiante: idEstudiante,
        nombre: `${assignment.estudiante.usuario.primer_nombre} ${assignment.estudiante.usuario.segundo_nombre || ''} ${assignment.estudiante.usuario.apellido_paterno}`.trim(),
        id_materia: materiaId,
        error: null
      });
    }

    const okCount = results.filter(r => !r.error).length;
    logger.info(`Asignados ${okCount}/${id_estudiantes.length} estudiantes a materia ${id_materia}`);
    return results;
  }

  async listStudentSubjects(page = 1, limit = 10, id_materia = null, all = false) {
    const where = {};
    if (id_materia) where.id_materia = parseInt(id_materia);
    where.estudiante = { estado: true, usuario: { id_rol: ROLES.ESTUDIANTE } };

    if (all) {
      where.estado = true;
      const items = await estudianteMateriaRepository.findMany(
        where,
        {
          id_estudiante_materia: true,
          estado: true,
          id_estudiante: true,
          estudiante: {
            select: { id_estudiante: true, usuario: { select: { primer_nombre: true, segundo_nombre: true, apellido_paterno: true } } }
          },
          materia: { select: { id_materia: true, nombre: true, grado: { select: { grado: true, paralelo: true } } } },
          periodo_lectivo: { select: { id_periodo_lectivo: true, nombre: true } }
        }
      );
      return { data: items.map(i => ({ id_estudiante: i.id_estudiante })) };
    }

    where.estado = true;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      estudianteMateriaRepository.findMany(
        where,
        {
          id_estudiante_materia: true,
          estado: true,
          estudiante: {
            select: { id_estudiante: true, usuario: { select: { primer_nombre: true, segundo_nombre: true, apellido_paterno: true } } }
          },
          materia: { select: { id_materia: true, nombre: true, grado: { select: { grado: true, paralelo: true } } } },
          periodo_lectivo: { select: { id_periodo_lectivo: true, nombre: true } }
        },
        { id_estudiante_materia: 'desc' },
        { skip, take: limit }
      ),
      prisma.estudiante_materia.count({ where }),
    ]);

    const data = items.map(i => {
      const g = i.materia.grado;
      const gradoStr = g ? `${g.grado} ${g.paralelo || ''}`.trim() : '';
      return {
        id: i.id_estudiante_materia,
        id_estudiante: i.estudiante.id_estudiante,
        estudiante: `${i.estudiante.usuario.primer_nombre} ${i.estudiante.usuario.segundo_nombre || ''} ${i.estudiante.usuario.apellido_paterno}`.trim(),
        id_materia: i.materia.id_materia,
        materia: i.materia.nombre + (gradoStr ? ` (${gradoStr})` : ''),
        periodo: i.periodo_lectivo.nombre,
        estado: i.estado === true ? 'Activo' : 'Eliminado'
      };
    });

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async removeStudentSubject(id) {
    logger.info(`Eliminando asignación estudiante-materia id: ${id}`);
    return await estudianteMateriaRepository.update(id, {
      estado: ESTADOS.ELIMINADO,
      fecha_modificacion: new Date()
    });
  }
}

module.exports = new AssignmentService();
