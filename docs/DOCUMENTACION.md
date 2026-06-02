# eduLLM Admin — Backend (BACK)

> Microservicio de administración para la plataforma eduLLM.  
> Stack: **Node.js + Express + Prisma ORM + PostgreSQL**

---

## 1. Visión General

Panel de administración backend que gestiona **Profesores, Estudiantes y Materias** de la plataforma educativa eduLLM. Sigue principios **SOLID** con una arquitectura por capas.

### Puertos y URLs

| Servicio   | Puerto | Base URL          |
|-----------|--------|-------------------|
| Backend   | `8002` | `http://localhost:8002/api/v1` |

---

## 2. Arquitectura por Capas

```
┌──────────────┐
│   Routes     │  ← Define endpoints HTTP y conecta con controladores
├──────────────┤
│ Controllers  │  ← Maneja req/res, delega lógica al servicio
├──────────────┤
│  Services    │  ← Lógica de negocio, validaciones, transacciones
├──────────────┤
│ Repositories │  ← Acceso a datos con Prisma ORM
├──────────────┤
│   Mappers    │  ← Transforma entidades DB → DTOs de respuesta
├──────────────┤
│   Prisma     │  ← ORM que mapea modelos PostgreSQL
└──────────────┘
```

### Principios SOLID aplicados

- **S** (Single Responsibility): Cada capa tiene una sola responsabilidad.
- **O** (Open/Closed): Nuevas entidades se agregan creando archivos nuevos, sin modificar los existentes.
- **D** (Dependency Inversion): Controllers dependen de Services, Services de Repositories.

---

## 3. Estructura de Archivos

```
BACK/
├── server.js                          # Entry point: levanta Express en PORT
├── Dockerfile                         # Multi-stage Docker build (node:18-alpine)
├── package.json                       # Dependencias y scripts
├── .env                               # Variables de entorno
├── .gitignore
├── prisma/
│   └── schema.prisma                  # Modelos de BD (generado con `prisma db pull`)
├── logs/
│   ├── combined.log                   # Todos los logs
│   └── error.log                      # Solo errores
└── src/
    ├── app.js                         # Configuración Express (middleware, rutas)
    ├── config/
    │   ├── index.js                   # Exporta variables de entorno
    │   ├── logger.js                  # Winston logger (console + archivos)
    │   └── prisma.js                  # Singleton PrismaClient
    ├── controllers/
    │   ├── professor.controller.js    # ✅ FUNCIONAL - CRUD completo
    │   ├── student.controller.js      # ⚠️ STUB - Solo estructura
    │   ├── subject.controller.js      # ⚠️ STUB - Solo estructura
    │   └── user.controller.js         # ✅ FUNCIONAL - check/suggest username
    ├── mappers/
    │   └── professor.mapper.js        # ✅ Transforma profesor DB → DTO
    ├── middlewares/
    │   ├── auth.middleware.js          # JWT verification (deshabilitado en rutas)
    │   ├── errorHandler.js            # Captura errores y responde JSON
    │   └── logger.middleware.js        # Logea cada request con duración
    ├── repositories/
    │   ├── professor.repository.js    # ✅ FUNCIONAL - Prisma queries reales
    │   ├── student.repository.js      # ⚠️ STUB - Retorna datos mock
    │   └── subject.repository.js      # ⚠️ STUB - Retorna datos mock
    ├── routes/
    │   ├── index.js                   # Router central, monta /professors, /students, /subjects, /users
    │   └── v1/
    │       ├── professor.routes.js    # GET/POST / , GET/PUT/DELETE /:id
    │       ├── student.routes.js      # GET/POST / , GET/PUT/DELETE /:id
    │       ├── subject.routes.js      # GET/POST / , GET/PUT/DELETE /:id
    │       └── user.routes.js         # POST /check-username, /suggest-username, GET /, /:id
    ├── services/
    │   ├── professor.service.js       # ✅ FUNCIONAL - Lógica completa con transacciones
    │   ├── student.service.js         # ⚠️ STUB - Delega a repository stub
    │   ├── subject.service.js         # ⚠️ STUB - Delega a repository stub
    │   ├── estado.service.js          # ✅ FUNCIONAL - Lookup de estados desde admin_estado
    │   └── rol.service.js             # ✅ FUNCIONAL - Lookup de roles desde admin_rol
    ├── types/                         # (vacío, reservado para futuro)
    └── utils/
        ├── AppError.js                # Clase de error operacional con statusCode
        ├── catchAsync.js              # Wrapper para async handlers
        └── validators/
            ├── professor.schema.js    # Zod schema (básico, no usado activamente)
            ├── student.schema.js      # Zod schema (básico, no usado activamente)
            └── subject.schema.js      # Zod schema (básico, no usado activamente)
```

---

## 4. Variables de Entorno (.env)

```env
PORT=8002
DATABASE_URL="postgresql://admin:admin@localhost:5432/edu_llm?schema=comun"
JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
NODE_ENV=development
```

---

## 5. Base de Datos (Prisma Schema)

La BD usa el schema `comun` en PostgreSQL. Los modelos principales son:

### Tablas Clave para el Admin

| Modelo Prisma       | Tabla BD            | Descripción                              |
|---------------------|---------------------|------------------------------------------|
| `usuario`           | `admin_usuario`     | Usuario base (cedula, username, password, id_rol, id_estado) |
| `profesor`          | `admin_profesor`    | Extiende usuario con `departamento`      |
| `estudiante`        | `admin_estudiante`  | Extiende usuario con `id_grado` (FK → `grado`) |
| `grado`             | `comun.grado`       | Catálogo de grados (grado, paralelo)     |
| `estado`            | `admin_estado`      | Catálogo de estados (Activo, Inactivo, Eliminado...) |
| `rol`               | `admin_rol`         | Catálogo de roles (Admin, Profesor, Estudiante) |
| `materia`           | `info_materia`      | Materias (nombre, descripcion, nombre_normalizado) |

### Relaciones Importantes

```
usuario (1) ←→ (1) profesor        [via id_usuario]
usuario (1) ←→ (1) estudiante      [via id_usuario]
estudiante (1) ←→ (1) grado        [via id_grado]
profesor (1) ←→ (N) profesor_materia  [via id_profesor]
estudiante (1) ←→ (N) materia      [via id_estudiante]
materia (1) ←→ (N) profesor_materia  [via id_materia]
info_materia (1) ←→ (N) estudiante_materia [via id_materia]
```

### Convención de Estados

| id_estado | Significado |
|-----------|-------------|
| 1         | Activo      |
| 4         | Eliminado (soft delete) |

### Convención de Roles

| id_rol | Significado |
|--------|-------------|
| 1      | Administrador |
| 2      | Profesor    |
| 3      | Estudiante  |

---

## 6. API Endpoints

### 6.1 Profesores — `/api/v1/professors`

| Método | Ruta                    | Descripción                          | Estado |
|--------|------------------------|--------------------------------------|--------|
| GET    | `/professors`           | Lista todos los profesores (estado 1 y 4) | ✅ |
| GET    | `/professors/:id`       | Obtiene profesor con materias asignadas | ✅ |
| POST   | `/professors`           | Crea usuario + profesor en transacción | ✅ |
| PUT    | `/professors/:id`       | Actualiza profesor y usuario (transacción) | ✅ |
| DELETE | `/professors/:id`       | Soft delete (cambia estado a 4)       | ✅ |

#### POST /professors — Body esperado:
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

#### PUT /professors/:id — Body esperado:
```json
{
  "primer_nombre": "Juan",
  "segundo_nombre": "Carlos",
  "apellido_paterno": "Pérez",
  "apellido_materno": "López",
  "cedula": "0912345678",
  "correo": "juan@email.com",
  "departamento": "Física"
}
```

#### Respuesta tipo (GET lista):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombreCompleto": "Juan Carlos Pérez López",
      "primer_nombre": "Juan",
      "segundo_nombre": "Carlos",
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

### 6.2 Usuarios — `/api/v1/users`

| Método | Ruta                    | Descripción                          | Estado |
|--------|------------------------|--------------------------------------|--------|
| POST   | `/users/check-username` | Verifica si un username está disponible | ✅ |
| POST   | `/users/suggest-username`| Sugiere username basado en nombre    | ✅ |
| GET    | `/users`                | Lista todos los usuarios             | ✅ |
| GET    | `/users/:id`            | Obtiene usuario por ID               | ✅ |

### 6.3 Estudiantes — `/api/v1/students` ⚠️ STUB

| Método | Ruta                    | Descripción | Estado |
|--------|------------------------|-------------|--------|
| GET    | `/students`             | Retorna `[]` | ⚠️ Stub |
| GET    | `/students/:id`         | Retorna `null` | ⚠️ Stub |
| POST   | `/students`             | Retorna mock | ⚠️ Stub |
| PUT    | `/students/:id`         | Retorna mock | ⚠️ Stub |
| DELETE | `/students/:id`         | Retorna `true` | ⚠️ Stub |

### 6.4 Materias — `/api/v1/subjects` ⚠️ STUB

Misma estructura que Students, también retorna datos mock.

---

## 7. Flujo de Datos del Profesor (Ejemplo Funcional)

### Crear Profesor (POST)

```
1. Route recibe POST /professors
2. Controller llama professorService.createWithUser(req.body)
3. Service:
   a. Hashea password con bcrypt (10 rounds)
   b. Abre transacción Prisma ($transaction):
      - Crea admin_usuario (id_rol=2, id_estado=1)
      - Crea admin_profesor (vinculado al usuario)
   c. Retorna DTO con datos combinados
4. Controller responde 201 con JSON
```

### Listar Profesores (GET)

```
1. Route recibe GET /professors  
2. Controller llama professorService.findAll()
3. Service:
   a. Repository.findAll([1,4]) → query Prisma con include admin_usuario
   b. Enriquece con estadoService.getNombreEstado() y rolService.getNombreRol()
   c. Pasa por ProfessorMapper.toResponseList() para formatear
4. Controller responde 200 con array de DTOs
```

### Soft Delete (DELETE)

```
1. Route recibe DELETE /professors/:id
2. Controller llama professorService.delete(id, usuarioModificacion)
3. Service actualiza id_estado = 4, fecha_modificacion = now()
4. El registro NO se borra de la BD
```

---

## 8. Patrones y Convenciones

### Manejo de Errores
- Todos los controllers usan `catchAsync()` wrapper que captura errores async y los pasa a `next()`.
- `AppError` permite lanzar errores con status code: `throw new AppError('Not found', 404)`.
- `errorHandler` middleware captura `AppError` → respuesta JSON con status correcto, otros errores → 500.

### Soft Delete
- Nunca se borran registros. Se cambia `id_estado` a `4` (Eliminado).
- Las consultas del listado incluyen `id_estado: { in: [1, 4] }` para mostrar activos y eliminados.

### Transacciones
- Crear/Actualizar profesor usa `prisma.$transaction()` porque modifica `admin_usuario` + `admin_profesor` atómicamente.

### Respuesta JSON Standard
```json
{ "success": true, "data": {...} }     // Éxito
{ "success": false, "message": "..." } // Error
```

### Logging
- Winston logger con 3 transportes: Console, `logs/error.log`, `logs/combined.log`.
- Middleware `logRequest` registra cada request con método, URL, status y duración.

---

## 9. Dependencias Clave

| Paquete            | Versión  | Uso                                |
|-------------------|----------|------------------------------------|
| express           | ^4.18.2  | Framework HTTP                     |
| @prisma/client    | ^5.8.0   | ORM para PostgreSQL                |
| bcryptjs          | ^2.4.3   | Hash de contraseñas                |
| jsonwebtoken      | ^9.0.2   | Verificación JWT (auth middleware) |
| helmet            | ^7.1.0   | Headers de seguridad               |
| cors              | ^2.8.5   | Cross-Origin Resource Sharing      |
| express-rate-limit| ^7.1.5   | Rate limiting (100 req/15min)      |
| winston           | ^3.11.0  | Logger estructurado                |
| zod               | ^3.22.4  | Validación de schemas (preparado)  |
| nodemon           | ^3.0.2   | Dev: auto-restart                  |

---

## 10. Scripts

```bash
npm start          # Inicia con node server.js
npm run dev        # Inicia con nodemon (hot-reload)
npm run prisma:pull    # Sincroniza schema.prisma desde la BD existente
npm run prisma:generate # Genera el cliente Prisma
```

---

## 11. Guía para Extender (Agregar Nueva Entidad)

Para agregar una entidad como Estudiante o Materia siguiendo el patrón de Profesor:

### Paso 1: Repository (`src/repositories/[entity].repository.js`)
- Crear clase con métodos `findAll()`, `findById()`, `create()`, `update()`, `delete()`
- Usar el singleton de Prisma (`require('../config/prisma')`)
- `findAll()`: incluir `admin_usuario` y filtrar por `id_estado`
- `findById()`: incluir relaciones (admin_usuario, materias, etc.)
- `delete()`: soft delete → `update id_estado = 4`
- Exportar como `new EntityRepository()`

### Paso 2: Mapper (`src/mappers/[entity].mapper.js`)
- Clase estática con `toResponse()`, `toResponseList()`, `getNombreCompleto()`
- Transforma la estructura de Prisma a DTO plano para el frontend

### Paso 3: Service (`src/services/[entity].service.js`)
- Importar repository, estadoService, rolService, mapper
- `findAll()`: consulta → enriquece con nombre de estado/rol → mapea
- `findById()`: consulta → enriquece → mapea (con relaciones)
- `createWithUser()`: hashear password → `prisma.$transaction` (crear usuario + entidad) → retornar DTO
- `update()`: verificar existencia → `prisma.$transaction` si hay datos de usuario → actualizar
- `delete()`: soft delete via update a `id_estado = 4`

### Paso 4: Controller (`src/controllers/[entity].controller.js`)
- Importar service, catchAsync, AppError
- Funciones exportadas: `getAll`, `getById`, `create`, `update`, `delete`
- Siempre usar `catchAsync()` wrapper
- Respuesta: `res.json({ success: true, data: ... })`

### Paso 5: Routes (`src/routes/v1/[entity].routes.js`)
- Router Express con `.route('/')` → GET, POST
- `.route('/:id')` → GET, PUT, DELETE

### Paso 6: Registrar en `src/routes/index.js`
- Importar y montar con `router.use('/[entities]', entityRoutes)`

### Paso 7: Validator (opcional, `src/utils/validators/[entity].schema.js`)
- Zod schema para validar body de request

---

## 12. Docker

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

> **Nota**: El Dockerfile expone puerto 3000 pero el .env configura 8002. Ajustar según deployment.
