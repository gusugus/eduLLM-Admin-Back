# 4. Base de Datos (Prisma Schema)

La BD usa el schema `comun` en PostgreSQL. Los modelos se generan con `prisma db pull`.

## Tablas Clave para el Admin

| Modelo Prisma | Tabla BD | Descripción |
|--------------|----------|-------------|
| `usuario` | `admin_usuario` | Usuario base (cedula, username, password, id_rol, id_estado) |
| `profesor` | `admin_profesor` | Extiende usuario con `departamento` |
| `estudiante` | `admin_estudiante` | Extiende usuario con `id_grado` (FK → `grado`) |
| `grado` | `comun.grado` | Catálogo de grados (grado, paralelo) |
| `estado` | `admin_estado` | Catálogo de estados (Activo, Inactivo, Eliminado...) |
| `rol` | `admin_rol` | Catálogo de roles (Admin, Profesor, Estudiante) |
| `materia` | `info_materia` | Materias (nombre, descripcion, nombre_normalizado) |
| `profesor_materia` | `admin_profesor_materia` | Asignación profesor → materia (con período lectivo) |
| `periodo_lectivo` | `admin_periodo_lectivo` | Períodos lectivos (nombre, fechas, flag activo) |
| `matricula` | `admin_matricula` | Matrícula de estudiante en un período lectivo |
| `detalle_matricula` | `admin_detalle_matricula` | Detalle: estudiante matriculado en materia específica |

## Relaciones Importantes

```
usuario (1) ←→ (1) profesor        [via id_usuario]
usuario (1) ←→ (1) estudiante      [via id_usuario]
estudiante (1) ←→ (1) grado        [via id_grado]
profesor (1) ←→ (N) profesor_materia  [via id_profesor]
estudiante (1) ←→ (N) matricula    [via id_estudiante]
matricula (1) ←→ (N) detalle_matricula  [via id_matricula]
materia (1) ←→ (N) profesor_materia  [via id_materia]
materia (1) ←→ (N) detalle_matricula  [via id_materia]
periodo_lectivo (1) ←→ (N) profesor_materia  [via id_periodo_lectivo]
periodo_lectivo (1) ←→ (N) matricula  [via id_periodo_lectivo]
grado (1) ←→ (N) estudiante        [via id_grado]
```

## Campos de usuario

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_usuario` | Int (PK, auto) | ID único |
| `cedula` | VarChar(20) | Cédula (no única) |
| `username` | VarChar(100) | Username único |
| `primer_nombre` | VarChar(100) | Nombre |
| `segundo_nombre` | VarChar(100)? | Segundo nombre (opcional) |
| `apellido_paterno` | VarChar(100) | Apellido paterno |
| `apellido_materno` | VarChar(100)? | Apellido materno (opcional) |
| `password_hash` | VarChar(255) | Hash bcrypt |
| `id_rol` | Int (FK) | Rol del usuario |
| `id_estado` | Int (FK) | Estado del registro |
| `correo` | String? | Correo electrónico |
| `id_documento` | Int? (FK) | Documento asociado |
| `fecha_creacion` | Timestamp | Auto (now()) |
| `usuario_creacion` | Int? | Quién lo creó |
| `fecha_modificacion` | Timestamp? | Última modificación |
| `usuario_modificacion` | Int? | Quién lo modificó |

## Campos de profesor

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_profesor` | Int (PK, auto) | ID único |
| `id_usuario` | Int (FK, unique) | Relación 1:1 con usuario |
| `departamento` | VarChar(100)? | Departamento del profesor |
| `id_estado` | Int (FK) | Estado del registro |

## Campos de estudiante

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_estudiante` | Int (PK, auto) | ID único |
| `id_usuario` | Int (FK, unique) | Relación 1:1 con usuario |
| `id_grado` | Int (FK) | Relación con tabla `grado` |
| `id_estado` | Int (FK) | Estado del registro |

## Campos de grado

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_grado` | Int (PK, auto) | ID único |
| `grado` | Int? | Número de grado |
| `paralelo` | VarChar(1)? | Letra del paralelo |

## Campos de materia

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_materia` | Int (PK, auto) | ID único |
| `nombre` | VarChar(100) | Nombre de la materia |
| `descripcion` | String? | Descripción |
| `nombre_normalizado` | String? | Nombre sin acentos para búsqueda |
| `id_estado` | Int (FK) | Estado del registro |

## Campos de admin_profesor_materia

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Int (PK, auto) | ID único |
| `id_profesor` | Int (FK) | Profesor asignado |
| `id_materia` | Int (FK) | Materia asignada |
| `id_periodo_lectivo` | Int (FK) | Período lectivo |

## Campos de admin_periodo_lectivo

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_periodo_lectivo` | Int (PK, auto) | ID único |
| `nombre` | VarChar(100) | Nombre del período |
| `activo` | Boolean? | Flag: período activo (usado en asignaciones) |

## Convención de Estados (admin_estado)

| id_estado | Significado |
|-----------|-------------|
| 1 | Activo |
| 4 | Eliminado (soft delete) |

## Convención de Roles (admin_rol)

| id_rol | Significado |
|--------|-------------|
| 1 | Administrador |
| 2 | Profesor |
| 3 | Estudiante |

## Auditoría

Todas las tablas principales tienen campos de auditoría:
- `fecha_creacion` — Timestamp automático al crear
- `usuario_creacion` — ID del usuario que creó el registro
- `fecha_modificacion` — Timestamp al modificar
- `usuario_modificacion` — ID del usuario que modificó
