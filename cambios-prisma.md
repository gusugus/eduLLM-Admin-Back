# Cambios realizados — sincronización con base de datos

**Fecha:** 2026-06-11  
**Base de datos:** `edu_llm` / schema `comun`  
**Prisma:** v5.22.0

---

## 1. `prisma/schema.prisma` — reescritura completa

El schema fue regenerado desde la DB real con `prisma db pull --print` (usando el binario local, no el global).

### Tablas eliminadas del schema anterior
| Tabla antigua | Razón |
|---|---|
| `tbl_m_estado` | Eliminada de la DB; el estado ahora es un boolean en cada tabla |
| `tbl_m_documento` | Renombrada a `tbl_m_archivo` en la DB |

### Tablas añadidas
| Tabla nueva | Descripción |
|---|---|
| `tbl_m_archivo` | Antes `tbl_m_documento`; almacena archivos/fotos de usuario |
| `tbl_m_parametro` | Parámetros de configuración del sistema |
| `tbl_t_opcion` | Opciones de respuesta para preguntas de pruebas |
| `tbl_t_partida` | Partidas/sesiones de pruebas |
| `tbl_t_partida_estudiante` | Registro de estudiantes en una partida |
| `tbl_t_pregunta` | Preguntas de pruebas |
| `tbl_t_prueba` | Pruebas/cuestionarios |
| `tbl_t_respuesta` | Respuestas de estudiantes |
| `tbl_t_retroalimentacion_llm` | Retroalimentación generada por el LLM |

### Cambio global: `estado Int` → `estado Boolean`
Todas las tablas reemplazaron la FK `id_estado Int` (que apuntaba a `tbl_m_estado`) por una columna local:

```prisma
estado Boolean? @default(true)
```

### Renombre de columnas FK

| Tabla | Columna anterior | Columna nueva |
|---|---|---|
| `tbl_m_administrador` | `id_usuario` | `usuario_id` |
| `tbl_m_profesor` | `id_usuario` | `usuario_id` |
| `tbl_m_materia` | `id_grado` | `grado_id` |
| `tbl_t_profesor_materia` | `id_profesor` | `profesor_id` |
| `tbl_t_profesor_materia` | `id_materia` | `materia_id` |
| `tbl_t_profesor_materia` | `id_periodo_lectivo` | `periodo_lectivo_id` |
| `tbl_m_usuario` | `id_rol` | `rol_id` |
| `tbl_m_archivo` | `id_usuario` | `usuario_id` |

> `tbl_m_estudiante` **conserva** `id_usuario` (no fue renombrado en la DB).  
> `tbl_m_estudiante_materia` **conserva** `id_estudiante`, `id_materia`, `id_periodo_lectivo`.

### `tbl_m_grado` — PK sin autoincrement
```prisma
// Antes
id_grado Int @id @default(autoincrement())

// Ahora
id_grado Int @id(map: "grado_pk")   // sin @default(autoincrement())
```
La tabla no tiene sequence en la DB. El ID se genera manualmente en el repositorio con `MAX(id_grado) + 1`.

### `tbl_m_periodo_lectivo` — columna eliminada
Se eliminó `id_estado Int` (ya no existe en la DB).

### `tbl_m_usuario` — relación cambiada
```prisma
// Antes
tbl_m_documento tbl_m_documento[]

// Ahora
tbl_m_archivo   tbl_m_archivo[]
```

---

## 2. Archivos de código actualizados

### `src/constants/estados.js`
```js
// Antes: IDs enteros apuntando a tbl_m_estado
const ESTADOS = { ACTIVO: 1, INACTIVO: 2, ELIMINADO: 3 };

// Ahora: booleanos directos
const ESTADOS = { ACTIVO: true, INACTIVO: false, ELIMINADO: false };
```

### `src/services/estado.service.js`
Eliminadas las consultas a `tbl_m_estado`. El servicio ahora es sincrónico:
```js
getNombreEstado(estado) { return estado ? 'Activo' : 'Inactivo'; }
```

### `src/services/rol.service.js`
Modelo cambiado de `prisma.rol` → `prisma.tbl_m_rol`.

### `src/services/periodo.service.js`
- Modelo: `prisma.tbl_m_periodo_lectivo`
- Eliminado el filtro `id_estado` (campo ya no existe)
- Filtro de período activo: `{ es_activo: true, estado: true }`

### `src/repositories/grado.repository.js`
- Modelo: `prisma.tbl_m_grado`
- Creación con `MAX(id_grado) + 1` (PK no-autoincrement):
  ```js
  const maxResult = await prisma.$queryRaw`SELECT COALESCE(MAX(id_grado), 0) + 1 AS next_id FROM comun.tbl_m_grado`;
  const nextId = Number(maxResult[0].next_id);
  ```
- Coerción `parseInt(data.grado)` para evitar error de tipo string→Int de Prisma

### `src/repositories/subject.repository.js`
- Modelo: `prisma.tbl_m_materia`
- FK: `grado_id` (era `id_grado`)
- Relación: `tbl_m_grado` (era `grado`)
- `estado`: boolean

### `src/repositories/professor.repository.js`
- Modelo: `prisma.tbl_m_profesor`
- FK: `usuario_id` (era `id_usuario`)
- Relaciones: `tbl_m_usuario`, `tbl_m_archivo` (era `documento`), `tbl_t_profesor_materia`
- FK en asignación: `periodo_lectivo_id` (era `id_periodo_lectivo`)

### `src/repositories/student.repository.js`
- Modelo: `prisma.tbl_m_estudiante`
- FK: `id_usuario` (se mantiene)
- Relaciones: `tbl_m_usuario`, `tbl_m_archivo`, `tbl_m_estudiante_materia`

### `src/services/subject.service.js`
- `estadoService.getNombreEstado(sub.estado)` → ahora sincrónico (sin `await`)
- FK `grado_id` (era `id_grado`)

### `src/services/professor.service.js` / `student.service.js`
- Nombres de modelos y relaciones actualizados a `tbl_m_*`
- `usuario_id` en lugar de `id_usuario` (profesor/admin)
- `estado: true` en lugar de `id_estado: ESTADOS.ACTIVO`
- `rol_id` en lugar de `id_rol`
- `estadoService.getNombreEstado()` sincrónico

### `src/services/assignment.service.js`
- `tbl_t_profesor_materia`: `profesor_id`, `materia_id`, `periodo_lectivo_id`
- `tbl_m_estudiante_materia`: mantiene `id_estudiante`, `id_materia`, `id_periodo_lectivo`
- Relaciones anidadas renombradas a `tbl_m_*`

### `src/controllers/upload.controller.js`
- `tx.tbl_m_archivo` (era `tx.documento`)
- `usuario_id` (era `id_usuario`)
- `estado: true/false` (era `id_estado: ESTADOS.ACTIVO/ELIMINADO`)

### `src/controllers/user.controller.js`
- Modelo: `prisma.tbl_m_usuario`
- Select: `rol_id`, `estado` boolean (era `id_rol`, `id_estado`)

### `src/mappers/professor.mapper.js` / `student.mapper.js` / `subject.mapper.js`
- Acceso a relaciones por nombre `tbl_m_*`
- `tbl_m_archivo` (era `documento`)
- `estado === true` para filtrar archivo activo
- `grado_id` (era `id_grado`)

---

## 3. Fix CORS — doble header `Access-Control-Allow-Origin`

**Problema:** el header `Access-Control-Allow-Origin` llegaba duplicado al browser porque tanto el Express middleware (`cors()`) como el Spring Cloud Gateway lo estaban inyectando.

**Solución:** eliminar `app.use(cors(...))` de `src/app.js`. El CORS lo gestiona exclusivamente el gateway (`eduLLM-Gateway/config/application.yml`).

```js
// src/app.js — línea eliminada:
// app.use(cors({ origin: true, credentials: true }));
```

---

## 4. Verificación final

```
POST /api/admin/grados  {"grado":5,"paralelo":"A"}
→ 200 { "success": true, "data": { "id": 1, "grado": 5, "paralelo": "A", "nombre_completo": "5 A" } }

POST /api/admin/grados  {"grado":6,"paralelo":"B"}
→ 200 { "success": true, "data": { "id": 2, "grado": 6, "paralelo": "B", "nombre_completo": "6 B" } }

GET  /api/admin/grados
→ 200 { "success": true, "data": [ { "id":1, ... }, { "id":2, ... } ] }
```
