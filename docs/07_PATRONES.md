# 7. Patrones y Convenciones

## 7.1 Manejo de Errores

### AppError (`src/utils/AppError.js`)
```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```
- Uso: `throw new AppError('Not found', 404)`
- Todos los errores operacionales (esperados) usan esta clase
- Errores no operacionales (bugs) caen en el catch del `errorHandler`

### catchAsync (`src/utils/catchAsync.js`)
```javascript
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```
- Envuelve cada función de controller
- Captura cualquier error async y lo pasa a `next(err)`
- Evita try/catch repetitivos en cada controller

### errorHandler (`src/middlewares/errorHandler.js`)
```javascript
if (err instanceof AppError) {
  return res.status(err.statusCode).json({ success: false, message: err.message });
}
res.status(500).json({ success: false, message: 'Internal Server Error' });
```

| Tipo de error | Status | Respuesta |
|--------------|--------|-----------|
| `AppError` (404, 400, 401) | Según AppError | `{ success: false, message }` |
| Error inesperado (Prisma, Zod) | 500 | `{ success: false, message: "Internal Server Error" }` |

> El errorHandler se registra **siempre al final** del pipeline en `app.js`.

## 7.2 Formato de Respuesta JSON

### Éxito:
```json
{ "success": true, "data": {...} }
{ "success": true, "data": [...] }
{ "success": true, "message": "Profesor eliminado correctamente" }
```

### Error:
```json
{ "success": false, "message": "Descripción del error" }
```

## 7.3 Soft Delete

Nunca se eliminan registros físicamente. Se cambia `id_estado` al valor correspondiente:

| id_estado | Significado |
|-----------|-------------|
| 1 | Activo |
| 4 | Eliminado |

### Implementación en Repository:
```javascript
async delete(id, usuarioModificacion = null) {
  return await prisma.admin_profesor.update({
    where: { id_profesor: parseInt(id) },
    data: {
      id_estado: 4,
      fecha_modificacion: new Date(),
      usuario_modificacion: usuarioModificacion
    }
  });
}
```

### Consultas de listado:
```javascript
async findAll(estadosPermitidos = [1]) {
  const where = estadosPermitidos.length > 0
    ? { id_estado: { in: estadosPermitidos } }
    : {};
  return await prisma.admin_profesor.findMany({ where, ... });
}
```
- Se pasan `[1, 4]` para mostrar activos + eliminados
- Si se pasa `[]` vacío, no hay filtro de estado

## 7.4 Transacciones

Uso de `prisma.$transaction()` para operaciones que afectan múltiples tablas:

### Crear profesor (usuario + profesor):
```javascript
const result = await prisma.$transaction(async (tx) => {
  const usuario = await tx.admin_usuario.create({ ... });
  const profesor = await tx.admin_profesor.create({ id_usuario: usuario.id_usuario, ... });
  return profesor;
});
```

### Actualizar profesor (usuario + profesor):
```javascript
const updated = await prisma.$transaction(async (tx) => {
  await tx.admin_usuario.update({ where: { id_usuario }, data: ... });
  const profesor = await tx.admin_profesor.update({ where: { id_profesor }, data: ..., include: { admin_usuario: true } });
  return profesor;
});
```

> Si solo se actualizan campos del profesor (sin datos de usuario), se hace un `update` directo sin transacción.

## 7.5 Logging

### Winston Logger (`src/config/logger.js`)
```javascript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

| Transporte | Archivo | Nivel |
|-----------|---------|-------|
| Console | stdout | info+ |
| File | `logs/error.log` | error+ |
| File | `logs/combined.log` | info+ |

### Middleware de Request (`src/middlewares/logger.middleware.js`)
```javascript
const logRequest = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
};
```
- Se ejecuta en cada request
- Logea: método, URL, status code y duración en ms
- Formato: `GET /api/v1/professors 200 - 45ms`

### Logs en Services
```javascript
logger.info(`Created professor with user: ${name}`);
logger.info(`Updated professor id ${id} by user ${userId}`);
logger.info(`Deleted professor id ${id}`);
```

## 7.6 Hash de Contraseñas

- Algoritmo: **bcryptjs** con **10 salt rounds**
- Se aplica solo en creación (`createWithUser`)
- En actualización **no** se permite cambiar password (no está en el body de PUT)

```javascript
const password_hash = await bcrypt.hash(password, 10);
```

## 7.7 Auth Middleware

El middleware `auth.middleware.js` es **no-bloqueante**: decodifica el JWT si existe pero nunca bloquea la request:

```javascript
const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
if (token) {
  try {
    req.user = jwt.verify(token, jwtSecret);
  } catch (err) {
    req.user = null;
  }
}
next();
```

- Si hay token válido → `req.user` tiene los datos decodificados
- Si no hay token o es inválido → `req.user = null`, la request continúa

## 7.8 Capas y Responsabilidades

| Capa | Responsabilidad | Prohibición |
|------|----------------|-------------|
| **Routes** | Definir endpoints, conectar con controller | No contiene lógica |
| **Controllers** | Parsear req, llamar service, responder | No accede a BD directamente |
| **Services** | Lógica de negocio, transacciones, enriquecer datos | No llama a Prisma directamente (usa repos) |
| **Repositories** | Consultas Prisma con select/where/include | No modifica datos (solo query) |
| **Mappers** | Transformar entidad DB → DTO plano | No tiene dependencias externas |

## 7.9 Estado de Implementación

| Módulo | Controller | Service | Repository | Mapper | Status |
|--------|-----------|---------|------------|--------|--------|
| Profesores | ✅ | ✅ | ✅ | ✅ | Funcional |
| Estudiantes | ✅ | ✅ | ✅ | ✅ | Funcional |
| Materias | ✅ | ✅ | ✅ | ✅ | Funcional |
| Asignaciones | ✅ | ✅ | N/A | N/A | Funcional |
| Usuarios | ✅ | N/A (usa Prisma directo) | N/A | N/A | Funcional |
| Estado/Rol | N/A | ✅ | N/A | N/A | Funcional |
