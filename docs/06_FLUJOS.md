# 6. Flujos de Datos

## 6.1 Autenticación — Login

```
Cliente                  Gateway                    Backend
  │                        │                          │
  │  POST /api/auth/login  │                          │
  │  {username, password}  │                          │
  │───────────────────────>│                          │
  │                        │  POST /auth/login        │
  │                        │─────────────────────────>│
  │                        │                          │
  │                        │  Validar credenciales    │
  │                        │  Generar token JWT       │
  │                        │  Setear cookie HttpOnly  │
  │                        │<─────────────────────────│
  │  200 + Set-Cookie      │                          │
  │<───────────────────────│                          │
```

## 6.2 Autenticación — Verify

```
Cliente                    Gateway                    Backend
  │                          │                          │
  │  GET /api/auth/verify    │                          │
  │  (cookie automática)     │                          │
  │─────────────────────────>│                          │
  │                          │  GET /auth/verify        │
  │                          │  (con cookie)            │
  │                          │─────────────────────────>│
  │                          │                          │
  │                          │  Decodificar token       │
  │                          │  Retornar usuario + rol  │
  │                          │<─────────────────────────│
  │  200 {authenticated,     │                          │
  │  username, rol, ...}     │                          │
  │<─────────────────────────│                          │
```

## 6.3 Profesor — Crear (POST /api/admin/professors)

```mermaid
sequenceDiagram
    participant C as Controller
    participant S as ProfessorService
    participant R as ProfessorRepository
    participant P as Prisma
    participant BC as bcrypt

    C->>S: createWithUser(req.body)
    S->>BC: hash(password, 10)
    BC-->>S: password_hash
    S->>P: $transaction()
    P->>P: admin_usuario.create({ id_rol: 2, id_estado: 1 })
    P->>P: admin_profesor.create({ id_usuario })
    P-->>S: profesor + admin_usuario
    S-->>C: DTO { id, nombreCompleto, cedula, ... }
    C-->>Client: 201 { success: true, data }
```

## 6.4 Profesor — Soft Delete (DELETE /api/admin/professors/:id)

```mermaid
sequenceDiagram
    participant C as Controller
    participant S as ProfessorService
    participant P as Prisma

    C->>S: delete(id, usuarioModificacion)
    S->>P: admin_profesor.update({ where: { id_profesor }, data: { id_estado: 4, fecha_modificacion: now() } })
    P-->>S: registro actualizado
    S-->>C: resultado
    C-->>Client: 200 { success: true, message: "Profesor eliminado correctamente" }
```

## 6.5 Asignaciones — Profesor → Materia

```mermaid
sequenceDiagram
    participant C as AssignmentController
    participant AS as AssignmentService
    participant PS as PeriodoService
    participant P as Prisma

    C->>AS: assignProfessorToSubject({ idProfesor, idMaterias, idPeriodoLectivo })
    AS->>PS: getPeriodoActivo()
    PS-->>AS: periodo
    AS->>P: admin_profesor_materia.deleteMany({ idProfesor, idPeriodoLectivo })
    loop por cada materia
        AS->>P: admin_profesor_materia.create({ idProfesor, idMateria, idPeriodoLectivo })
    end
    P-->>AS: asignaciones creadas
    AS-->>C: resultado
    C-->>Client: 201 { success: true, data }
```

## 6.6 Asignaciones — Estudiantes → Materia

```mermaid
sequenceDiagram
    participant C as AssignmentController
    participant AS as AssignmentService
    participant PS as PeriodoService
    participant P as Prisma

    C->>AS: assignStudentsToSubject({ idMateria, idEstudiantes, idPeriodoLectivo })
    AS->>PS: getPeriodoActivo()
    PS-->>AS: periodo
    AS->>P: admin_detalle_matricula.deleteMany({ idMateria, idPeriodoLectivo })
    loop por cada estudiante
        AS->>P: admin_detalle_matricula.create({ idMatricula, idMateria, idPeriodoLectivo })
    end
    P-->>AS: asignaciones creadas
    AS-->>C: resultado
    C-->>Client: 201 { success: true, data }
```

> Ambos flujos de asignación reemplazan todas las asignaciones existentes del profesor/estudiante en el período (deleteMany + createMany).
