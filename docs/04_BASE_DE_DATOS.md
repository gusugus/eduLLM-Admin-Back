# 4. Base de Datos (Prisma Schema)

La BD usa el schema `comun` en PostgreSQL. Los modelos se generan con `prisma db pull`.

## Tablas Clave para el Admin

| Modelo Prisma       | Tabla BD            | Descripción                              |
|---------------------|---------------------|------------------------------------------|
| `admin_usuario`     | `admin_usuario`     | Usuario base (cedula, username, password, id_rol, id_estado) |
| `admin_profesor`    | `admin_profesor`    | Extiende usuario con `departamento`      |
| `admin_estudiante`  | `admin_estudiante`  | Extiende usuario con `codigo_estudiante`, `grado`, `grupo` |
| `admin_estado`      | `admin_estado`      | Catálogo de estados (Activo, Inactivo, Eliminado...) |
| `admin_rol`         | `admin_rol`         | Catálogo de roles (Admin, Profesor, Estudiante) |
| `info_materia`      | `info_materia`      | Materias (nombre, descripcion, nombre_normalizado) |

## Relaciones Importantes

```
admin_usuario (1) ←→ (1) admin_profesor    [via id_usuario]
admin_usuario (1) ←→ (1) admin_estudiante  [via id_usuario]
admin_profesor (1) ←→ (N) profesor_materia  [via id_profesor]
admin_estudiante (1) ←→ (N) estudiante_materia [via id_estudiante]
info_materia (1) ←→ (N) profesor_materia   [via id_materia]
info_materia (1) ←→ (N) estudiante_materia [via id_materia]
```

## Campos de admin_usuario

| Campo               | Tipo          | Descripción                    |
|---------------------|---------------|--------------------------------|
| `id_usuario`        | Int (PK, auto)| ID único                       |
| `cedula`            | VarChar(20)   | Cédula única                   |
| `username`          | VarChar(100)  | Username único                 |
| `primer_nombre`     | VarChar(100)  | Nombre                         |
| `apellido_paterno`  | VarChar(100)  | Apellido paterno               |
| `apellido_materno`  | VarChar(100)? | Apellido materno (opcional)    |
| `password_hash`     | VarChar(255)  | Hash bcrypt                    |
| `id_rol`            | Int (FK)      | Rol del usuario                |
| `id_estado`         | Int (FK)      | Estado del registro            |
| `correo`            | String?       | Correo electrónico             |
| `fecha_creacion`    | Timestamp     | Auto (now())                   |
| `usuario_creacion`  | Int?          | Quién lo creó                  |
| `fecha_modificacion`| Timestamp?    | Última modificación            |
| `usuario_modificacion`| Int?        | Quién lo modificó              |

## Campos de admin_profesor

| Campo               | Tipo          | Descripción                    |
|---------------------|---------------|--------------------------------|
| `id_profesor`       | Int (PK, auto)| ID único                       |
| `id_usuario`        | Int (FK, unique)| Relación 1:1 con usuario     |
| `departamento`      | VarChar(100)? | Departamento del profesor      |
| `id_estado`         | Int (FK)      | Estado del registro            |

## Campos de admin_estudiante

| Campo               | Tipo          | Descripción                    |
|---------------------|---------------|--------------------------------|
| `id_estudiante`     | Int (PK, auto)| ID único                       |
| `id_usuario`        | Int (FK, unique)| Relación 1:1 con usuario     |
| `codigo_estudiante` | VarChar(50)?  | Código único del estudiante    |
| `grado`             | VarChar(50)?  | Grado del estudiante           |
| `grupo`             | VarChar(20)?  | Grupo del estudiante           |
| `id_estado`         | Int (FK)      | Estado del registro            |

## Campos de info_materia

| Campo               | Tipo          | Descripción                    |
|---------------------|---------------|--------------------------------|
| `id_materia`        | Int (PK, auto)| ID único                       |
| `nombre`            | VarChar(100)  | Nombre de la materia           |
| `descripcion`       | String?       | Descripción                    |
| `nombre_normalizado`| String?       | Nombre sin acentos para búsqueda |
| `id_estado`         | Int (FK)      | Estado del registro            |

## Convención de Estados (admin_estado)

| id_estado | Significado          |
|-----------|----------------------|
| 1         | Activo               |
| 4         | Eliminado (soft delete) |

## Convención de Roles (admin_rol)

| id_rol | Significado    |
|--------|----------------|
| 1      | Administrador  |
| 2      | Profesor       |
| 3      | Estudiante     |

## Auditoría

Todas las tablas principales tienen campos de auditoría:
- `fecha_creacion` — Timestamp automático al crear
- `usuario_creacion` — ID del usuario que creó el registro
- `fecha_modificacion` — Timestamp al modificar
- `usuario_modificacion` — ID del usuario que modificó
