# 5. API Endpoints

Todas las rutas están bajo el prefijo `/api/v1`.

---

## 5.1 Profesores — `/api/v1/professors`

| Método | Ruta                    | Descripción                          | Estado |
|--------|------------------------|--------------------------------------|--------|
| GET    | `/professors`           | Lista todos los profesores (estado 1 y 4) | ✅ |
| GET    | `/professors/:id`       | Obtiene profesor con materias asignadas | ✅ |
| POST   | `/professors`           | Crea usuario + profesor en transacción | ✅ |
| PUT    | `/professors/:id`       | Actualiza profesor y usuario (transacción) | ✅ |
| DELETE | `/professors/:id`       | Soft delete (cambia estado a 4)       | ✅ |

### POST /professors — Body esperado:
```json
{
  "cedula": "0912345678",
  "username": "juanperez",
  "primer_nombre": "Juan",
  "apellido_paterno": "Pérez",
  "apellido_materno": "López",
  "correo": "juan@email.com",
  "password": "123456",
  "departamento": "Matemáticas"
}
```

### PUT /professors/:id — Body esperado:
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

> **Nota**: En edición no se envían `username` ni `password`.

### GET /professors — Respuesta:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombreCompleto": "Juan Pérez López",
      "primer_nombre": "Juan",
      "apellido_paterno": "Pérez",
      "apellido_materno": "López",
      "cedula": "0912345678",
      "correo": "juan@email.com",
      "username": "juanperez",
      "departamento": "Matemáticas",
      "estado": "Activo",
      "rol": "Profesor"
    }
  ]
}
```

### GET /professors/:id — Respuesta (incluye materias):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombreCompleto": "Juan Pérez López",
    "primer_nombre": "Juan",
    "apellido_paterno": "Pérez",
    "apellido_materno": "López",
    "cedula": "0912345678",
    "correo": "juan@email.com",
    "username": "juanperez",
    "departamento": "Matemáticas",
    "estado": "Activo",
    "rol": "Profesor",
    "materias": [
      {
        "id": 1,
        "nombre": "Matemáticas I",
        "descripcion": "Curso introductorio"
      }
    ]
  }
}
```

### DELETE /professors/:id — Respuesta:
```json
{
  "success": true,
  "message": "Profesor eliminado correctamente"
}
```

---

## 5.2 Usuarios — `/api/v1/users`

| Método | Ruta                    | Descripción                          | Estado |
|--------|------------------------|--------------------------------------|--------|
| POST   | `/users/check-username` | Verifica si un username está disponible | ✅ |
| POST   | `/users/suggest-username`| Sugiere username basado en nombre    | ✅ |
| GET    | `/users`                | Lista todos los usuarios             | ✅ |
| GET    | `/users/:id`            | Obtiene usuario por ID               | ✅ |

### POST /users/check-username — Body:
```json
{
  "username": "juanperez",
  "excludeUserId": 5
}
```

### POST /users/check-username — Respuesta:
```json
{
  "available": true,
  "message": "Username disponible"
}
```

### POST /users/suggest-username — Body:
```json
{
  "primerNombre": "Juan",
  "apellidoPaterno": "Pérez"
}
```

### POST /users/suggest-username — Respuesta:
```json
{
  "username": "juanperez",
  "base": "juanperez",
  "isNew": true,
  "exists": false
}
```

> Si `juanperez` ya existe, retorna `juanperez1`, `juanperez2`, etc.

---

## 5.3 Estudiantes — `/api/v1/students` ⚠️ STUB

| Método | Ruta                    | Descripción | Estado |
|--------|------------------------|-------------|--------|
| GET    | `/students`             | Retorna `[]` | ⚠️ Stub |
| GET    | `/students/:id`         | Retorna `null` | ⚠️ Stub |
| POST   | `/students`             | Retorna mock `{ id: 1, ...data }` | ⚠️ Stub |
| PUT    | `/students/:id`         | Retorna mock `{ id, ...data }` | ⚠️ Stub |
| DELETE | `/students/:id`         | Retorna `true` | ⚠️ Stub |

---

## 5.4 Materias — `/api/v1/subjects` ⚠️ STUB

Misma estructura que Students. Todos los endpoints retornan datos mock.

---

## Formato de Respuesta Standard

### Éxito:
```json
{ "success": true, "data": {...} }
```

### Error:
```json
{ "success": false, "message": "Descripción del error" }
```
