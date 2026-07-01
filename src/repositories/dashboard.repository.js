const prisma = require('../config/prisma');
const { Prisma } = require('@prisma/client');

function periodoSql(periodo) {
  if (periodo === 'semana') return Prisma.sql`AND pa.finalizado_en >= NOW() - INTERVAL '7 days'`;
  if (periodo === 'mes')    return Prisma.sql`AND pa.finalizado_en >= NOW() - INTERVAL '30 days'`;
  return Prisma.empty;
}

class DashboardRepository {
  async getProfessorRanking({ periodo } = {}) {
    const pFilter = periodoSql(periodo);
    const rows = await prisma.$queryRaw`
      SELECT
        u.primer_nombre || ' ' || u.apellido_paterno AS nombre,
        ROUND(
          AVG(
            CASE WHEN q.total_preguntas > 0
                 THEN (pe.respuestas_correctas::float / q.total_preguntas) * 100
                  ELSE 0 END
          )::numeric, 1
        ) AS promedio,
        COUNT(DISTINCT pa.id_partida)::int AS "totalPartidas"
      FROM tbl_m_profesor prof
      JOIN tbl_m_usuario u ON u.id_usuario = prof.usuario_id
      JOIN tbl_t_profesor_materia pm
        ON pm.profesor_id = prof.id_profesor AND pm.estado = true
      JOIN tbl_m_materia m
        ON m.id_materia = pm.materia_id AND m.estado = true
      JOIN tbl_t_prueba pr
        ON pr.profesor_materia_id = pm.id_profesor_materia AND pr.estado = true
      LEFT JOIN (
        SELECT prueba_id, COUNT(*)::int AS total_preguntas
        FROM tbl_t_pregunta
        WHERE estado = true
        GROUP BY prueba_id
      ) q ON q.prueba_id = pr.id_prueba
      JOIN tbl_t_partida pa
        ON pa.prueba_id = pr.id_prueba
        AND pa.estado_partida = 'finalizada'
        AND pa.estado = true
      JOIN tbl_t_partida_estudiante pe
        ON pe.partida_id = pa.id_partida AND pe.estado = true
      WHERE prof.estado = true
      ${pFilter}
      GROUP BY prof.id_profesor, u.primer_nombre, u.apellido_paterno
      ORDER BY promedio DESC NULLS LAST
    `;
    return rows.map(r => ({
      nombre: r.nombre,
      promedio: Number(r.promedio),
      totalPartidas: Number(r.totalPartidas),
    }));
  }

  async getGradePerformance({ periodo } = {}) {
    const pFilter = periodoSql(periodo);
    const rows = await prisma.$queryRaw`
      SELECT
        g.grado, g.paralelo AS grado,
        ROUND(
          AVG(
            CASE WHEN q.total_preguntas > 0
                 THEN (pe.respuestas_correctas::float / q.total_preguntas) * 100
                  ELSE 0 END
          )::numeric, 1
        ) AS promedio,
        COUNT(DISTINCT em.id_estudiante)::int AS "totalEstudiantes"
      FROM tbl_m_grado g
      JOIN tbl_m_materia m
        ON m.grado_id = g.id_grado AND m.estado = true
      JOIN tbl_t_profesor_materia pm
        ON pm.materia_id = m.id_materia AND pm.estado = true
      JOIN tbl_t_prueba pr
        ON pr.profesor_materia_id = pm.id_profesor_materia AND pr.estado = true
      LEFT JOIN (
        SELECT prueba_id, COUNT(*)::int AS total_preguntas
        FROM tbl_t_pregunta
        WHERE estado = true
        GROUP BY prueba_id
      ) q ON q.prueba_id = pr.id_prueba
      JOIN tbl_t_partida pa
        ON pa.prueba_id = pr.id_prueba
        AND pa.estado_partida = 'finalizada'
        AND pa.estado = true
      JOIN tbl_t_partida_estudiante pe
        ON pe.partida_id = pa.id_partida AND pe.estado = true
      JOIN tbl_m_estudiante_materia em
        ON em.id_estudiante_materia = pe.estudiante_materia_id AND em.estado = true
      WHERE g.estado = true
        AND pe.estudiante_materia_id IS NOT NULL
      ${pFilter}
      GROUP BY g.id_grado, g.grado, g.paralelo
      ORDER BY g.grado ASC NULLS LAST, g.paralelo ASC NULLS LAST
    `;
    return rows.map(r => ({
      grado: r.grado,
      promedio: Number(r.promedio),
      totalEstudiantes: Number(r.totalEstudiantes),
    }));
  }

  async getScoreDistribution({ periodo, estudianteId } = {}) {
    const pFilter = periodoSql(periodo);

    if (estudianteId) {
      const eId = Number(estudianteId);
      // Vista por participación individual del estudiante seleccionado
      const rows = await prisma.$queryRaw`
        WITH scores AS (
          SELECT
            CASE WHEN q.total_preguntas > 0
                 THEN (pe.respuestas_correctas::float / q.total_preguntas) * 100
                  ELSE 0 END AS pct
          FROM tbl_t_partida_estudiante pe
          JOIN tbl_m_estudiante_materia em
            ON em.id_estudiante_materia = pe.estudiante_materia_id AND em.estado = true
          JOIN tbl_t_partida pa
            ON pa.id_partida = pe.partida_id
            AND pa.estado_partida = 'finalizada'
            AND pa.estado = true
          JOIN tbl_t_prueba pr
            ON pr.id_prueba = pa.prueba_id AND pr.estado = true
          JOIN tbl_t_profesor_materia pm
            ON pm.id_profesor_materia = pr.profesor_materia_id AND pm.estado = true
          JOIN tbl_m_materia m
            ON m.id_materia = pm.materia_id AND m.estado = true
          LEFT JOIN (
            SELECT prueba_id, COUNT(*) AS total_preguntas
            FROM tbl_t_pregunta WHERE estado = true
            GROUP BY prueba_id
          ) q ON q.prueba_id = pr.id_prueba
          WHERE pe.estado = true
            AND pe.estudiante_materia_id IS NOT NULL
            AND em.id_estudiante = ${eId}
          ${pFilter}
        )
        SELECT
          rango,
          COUNT(*)::int AS cantidad
        FROM (
          SELECT
            CASE
              WHEN pct >= 80 THEN 'Excelente'
              WHEN pct >= 60 THEN 'Bueno'
              WHEN pct >= 40 THEN 'Regular'
              ELSE 'Bajo'
            END AS rango
          FROM scores
        ) buckets
        GROUP BY rango
        ORDER BY
          CASE rango
            WHEN 'Excelente' THEN 1
            WHEN 'Bueno'     THEN 2
            WHEN 'Regular'   THEN 3
            ELSE 4
          END
      `;
      return rows.map(r => ({ rango: r.rango, cantidad: Number(r.cantidad) }));
    }

    // Vista por promedio global de cada estudiante
    const rows = await prisma.$queryRaw`
      WITH promedio_por_estudiante AS (
        SELECT
          em.id_estudiante,
          AVG(
            CASE WHEN q.total_preguntas > 0
                 THEN (pe.respuestas_correctas::float / q.total_preguntas) * 100
                  ELSE 0 END
          ) AS promedio_pct
        FROM tbl_t_partida_estudiante pe
        JOIN tbl_m_estudiante_materia em
          ON em.id_estudiante_materia = pe.estudiante_materia_id AND em.estado = true
        JOIN tbl_t_partida pa
          ON pa.id_partida = pe.partida_id
          AND pa.estado_partida = 'finalizada'
          AND pa.estado = true
        JOIN tbl_t_prueba pr
          ON pr.id_prueba = pa.prueba_id AND pr.estado = true
        JOIN tbl_t_profesor_materia pm
          ON pm.id_profesor_materia = pr.profesor_materia_id AND pm.estado = true
        JOIN tbl_m_materia m
          ON m.id_materia = pm.materia_id AND m.estado = true
        LEFT JOIN (
          SELECT prueba_id, COUNT(*) AS total_preguntas
          FROM tbl_t_pregunta WHERE estado = true
          GROUP BY prueba_id
        ) q ON q.prueba_id = pr.id_prueba
        WHERE pe.estado = true
          AND pe.estudiante_materia_id IS NOT NULL
        ${pFilter}
        GROUP BY em.id_estudiante
      )
      SELECT
        rango,
        COUNT(*)::int AS cantidad
      FROM (
        SELECT
          CASE
            WHEN promedio_pct >= 80 THEN 'Excelente'
            WHEN promedio_pct >= 60 THEN 'Bueno'
            WHEN promedio_pct >= 40 THEN 'Regular'
            ELSE 'Bajo'
          END AS rango
        FROM promedio_por_estudiante
      ) buckets
      GROUP BY rango
      ORDER BY
        CASE rango
          WHEN 'Excelente' THEN 1
          WHEN 'Bueno'     THEN 2
          WHEN 'Regular'   THEN 3
          ELSE 4
        END
    `;
    return rows.map(r => ({ rango: r.rango, cantidad: Number(r.cantidad) }));
  }
}

module.exports = new DashboardRepository();
