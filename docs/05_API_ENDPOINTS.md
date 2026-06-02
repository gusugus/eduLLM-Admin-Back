# 5. API Endpoints

El backend expone rutas bajo el prefijo `/api/admin`. El gateway en puerto `8085` las sirve como `/api/admin/*`.

---

## 5.1 Autenticación — `/api/auth`

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/api/auth/login` | Login con username/password, retorna cookie HttpOnly | ✅ |
| GET | `/api/auth/verify` | Verifica cookie de sesión, retorna usuario y rol | ✅ |

### POST /api/auth/login — Body:
```json
{ "username": "admin1", "password": "123456" }
```

### GET /api/auth/verify — Respuesta:
```json
{
  "username": "admin1",
  "authenticated": true,
  "rol": "ROLE_ADMINISTRADOR",
  "idUsuario": 3
}
```

---

## 5.2 Profesores — `/api/admin/professors`

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/professors` | Lista todos los profesores | ✅ |
| GET | `/professors/:id` | Obtiene profesor con materias asignadas | ✅ |
| POST | `/professors` | Crea usuario + profesor en transacción | ✅ |
| PUT | `/professors/:id` | Actualiza solo los campos enviados (actualización parcial, transacción) | ✅ |
| DELETE | `/professors/:id` | Soft delete (cambia estado a 4) | ✅ |

### POST /professors — Body:
```json
{
  "cedula": "0912345678",
  "username": "juanperez",
  "primer_nombre": "Juan",
  "segundo_nombre": "Carlos",
  "apellido_paterno": "Pérez",
  "apellido_materno": "López",
  "correo": "juan@email.com",
  "password": "123456",
  "departamento": "Matemáticas"
}
```

---

## 5.3 Estudiantes — `/api/admin/students`

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/students` | Lista todos los estudiantes | ✅ |
| GET | `/students/:id` | Obtiene estudiante por ID | ✅ |
| POST | `/students` | Crea usuario + estudiante en transacción | ✅ |
| PUT | `/students/:id` | Actualiza solo los campos enviados (actualización parcial) | ✅ |
| DELETE | `/students/:id` | Soft delete (cambia estado a 4) | ✅ |

### POST /students — Body:
```json
{
  "cedula": "0998765432",
  "username": "mariatech",
  "primer_nombre": "María",
  "segundo_nombre": "Elena",
  "apellido_paterno": "Tech",
  "correo": "maria@email.com",
  "password": "123456"
}
```

---

## 5.4 Materias — `/api/admin/subjects`

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/subjects` | Lista todas las materias | ✅ |
| GET | `/subjects/:id` | Obtiene materia por ID | ✅ |
| POST | `/subjects` | Crea materia | ✅ |
| PUT | `/subjects/:id` | Actualiza materia | ✅ |
| DELETE | `/subjects/:id` | Soft delete | ✅ |

### POST /subjects — Body:
```json
{
  "nombre": "Matemáticas I",
  "descripcion": "Curso introductorio de matemáticas"
}
```

---

## 5.5 Asignaciones — `/api/admin/assignments`

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/assignments/professor-subject` | Asigna profesor a materia(s) | ✅ |
| GET | `/assignments/professor-subject` | Lista asignaciones profesor-materia | ✅ |
| DELETE | `/assignments/professor-subject/:id` | Elimina asignación profesor-materia | ✅ |
| POST | `/assignments/student-subject` | Asigna estudiante(s) a materia | ✅ |
| GET | `/assignments/student-subject` | Lista asignaciones estudiante-materia | ✅ |
| DELETE | `/assignments/student-subject/:id` | Elimina asignación estudiante-materia | ✅ |

### POST /assignments/professor-subject — Body:
```json
{
  "idPeriodoLectivo": 1,
  "idProfesor": 5,
  "idMaterias": [1, 2, 3]
}
```

### POST /assignments/student-subject — Body:
```json
{
  "idPeriodoLectivo": 1,
  "idMateria": 1,
  "idEstudiantes": [10, 11, 12]
}
```

> Las asignaciones usan el período lectivo activo (`admin_periodo_lectivo` con flag activo).

---

## 5.6 Usuarios — `/api/admin/users`

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| POST | `/users/check-username` | Verifica si un username está disponible | ✅ |
| POST | `/users/suggest-username` | Sugiere username basado en nombre | ✅ |

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
