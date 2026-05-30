# 6. Flujos de Datos

## 6.1 Profesor — Crear (POST /api/v1/professors)

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

## 6.2 Profesor — Listar (GET /api/v1/professors)

```mermaid
sequenceDiagram
    participant C as Controller
    participant S as ProfessorService
    participant R as ProfessorRepository
    participant ES as EstadoService
    participant RS as RolService
    participant M as ProfessorMapper

    C->>S: findAll()
    S->>R: findAll([1, 4])
    R-->>S: profesores[] (con admin_usuario)
    S->>ES: getNombreEstado(id_estado)
    S->>RS: getNombreRol(id_rol)
    ES-->>S: "Activo"
    RS-->>S: "Profesor"
    S->>M: toResponseList(enriched)
    M-->>S: DTOs[]
    S-->>C: data[]
    C-->>Client: 200 { success: true, data }
```

## 6.3 Profesor — Obtener por ID (GET /api/v1/professors/:id)

```mermaid
sequenceDiagram
    participant C as Controller
    participant S as ProfessorService
    participant R as ProfessorRepository

    C->>S: findById(id)
    S->>R: findById(id)
    R-->>S: profesor + admin_usuario + profesor_materia
    S->>S: enriquece con estadoNombre + rolNombre
    S->>M: toResponse(prof, includeMaterias=true)
    M-->>S: DTO con materias[]
    S-->>C: data
    C-->>Client: 200 { success: true, data }
```

## 6.4 Profesor — Actualizar (PUT /api/v1/professors/:id)

```
1. Route recibe PUT /professors/:id con body
2. Controller llama professorService.update(id, data, usuarioModificacion)
3. Service:
   a. Verifica que el profesor existe (professorRepository.findById)
   b. Si no existe → throw AppError('Profesor no encontrado', 404)
   c. Si hay campos de usuario (primer_nombre, apellido, cedula, correo):
      - Abre $transaction
      - Actualiza admin_usuario con los campos presentes
      - Actualiza admin_profesor (departamento, id_estado)
      - Retorna profesor actualizado
   d. Si solo hay campos de profesor:
      - ProfessorRepository.update(id, data) directo
4. Controller responde 200 con JSON
```

### PUT — Body esperado:
```json
{
  "primer_nombre": "Juan",
  "apellido_paterno": "Pérez",
  "apellido_materno": "López",
  "cedula": "0912345678",
  "correo": "juan@email.com",
  "departamento": "Física"
}
```

> **Nota**: `username` y `password` no se envían en edición.

## 6.5 Profesor — Soft Delete (DELETE /api/v1/professors/:id)

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

### Soft Delete — Detalle:
- **id_estado** cambia de `1` (Activo) a `4` (Eliminado)
- **fecha_modificacion** se actualiza a `new Date()`
- **usuario_modificacion** se toma de `req.user?.id_usuario` (o `null` si no hay auth)
- El registro NO se elimina físicamente de la BD
- Las consultas GET listan registros con `id_estado IN [1, 4]`
