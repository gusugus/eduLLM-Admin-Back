# 9. Guía para Extender (Agregar Nueva Entidad)

Para implementar estudiantes, materias, o cualquier entidad nueva siguiendo el patrón funcional de **Profesor**.

## Paso 1: Repository (`src/repositories/[entity].repository.js`)

```javascript
const prisma = require('../config/prisma');

class EntityRepository {
  async findAll(estadosPermitidos = [1]) {
    const where = estadosPermitidos.length > 0
      ? { id_estado: { in: estadosPermitidos } }
      : {};
    return await prisma.admin_[entity].findMany({
      select: { ... },
      where
    });
  }

  async findById(id) {
    return await prisma.admin_[entity].findUnique({
      where: { id_[entity]: parseInt(id) },
      select: { ... }  // incluir admin_usuario + relaciones
    });
  }

  async update(id, data) {
    return await prisma.admin_[entity].update({
      where: { id_[entity]: parseInt(id) },
      data: { ...data, fecha_modificacion: new Date() }
    });
  }

  async delete(id, usuarioModificacion = null) {
    return await prisma.admin_[entity].update({
      where: { id_[entity]: parseInt(id) },
      data: { id_estado: 4, fecha_modificacion: new Date(), usuario_modificacion }
    });
  }
}

module.exports = new EntityRepository();
```

**Reglas:**
- `findAll()`: incluir `admin_usuario` con select de campos relevantes, filtrar por `id_estado: { in: estadosPermitidos }`
- `findById()`: incluir `admin_usuario` + relaciones (materias, etc.)
- `delete()`: **siempre** soft delete (cambiar `id_estado = 4`)
- Exportar como instancia única (`new EntityRepository()`)

## Paso 2: Mapper (`src/mappers/[entity].mapper.js`)

```javascript
class EntityMapper {
  static toResponse(entity, includeRelations = false) {
    if (!entity) return null;
    const base = {
      id: entity.id_[entity],
      nombreCompleto: this.getNombreCompleto(entity.admin_usuario),
      primer_nombre: entity.admin_usuario.primer_nombre,
      segundo_nombre: entity.admin_usuario.segundo_nombre,
      apellido_paterno: entity.admin_usuario.apellido_paterno,
      apellido_materno: entity.admin_usuario.apellido_materno,
      cedula: entity.admin_usuario.cedula,
      correo: entity.admin_usuario.correo,
      username: entity.admin_usuario.username,
      estado: entity.estadoNombre || null,
      rol: entity.rolNombre || null
    };
    if (includeRelations && entity.[relation]) {
      base.[relations] = entity.[relation].map(r => ({ ... }));
    }
    return base;
  }

  static toResponseList(entities) {
    return entities.map(e => this.toResponse(e, false));
  }

  static getNombreCompleto(usuario) {
    const { primer_nombre, segundo_nombre, apellido_paterno, apellido_materno } = usuario;
    return `${primer_nombre} ${segundo_nombre || ''} ${apellido_paterno} ${apellido_materno || ''}`.trim();
  }
}

module.exports = EntityMapper;
```

**Reglas:**
- No depende de nada externo (solo transforma datos)
- `toResponse()` debe devolver un DTO plano (JSON serializable)
- `getNombreCompleto()` es estático y reutilizable

## Paso 3: Service (`src/services/[entity].service.js`)

```javascript
const repository = require('../repositories/[entity].repository');
const estadoService = require('./estado.service');
const rolService = require('./rol.service');
const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');
const AppError = require('../utils/AppError');
const Mapper = require('../mappers/[entity].mapper');

class EntityService {
  async findAll() {
    const items = await repository.findAll([1, 4]);
    const enriched = await Promise.all(items.map(async (item) => {
      const [estadoNombre, rolNombre] = await Promise.all([
        estadoService.getNombreEstado(item.id_estado),
        rolService.getNombreRol(item.admin_usuario.id_rol)
      ]);
      item.estadoNombre = estadoNombre;
      item.rolNombre = rolNombre;
      return item;
    }));
    return Mapper.toResponseList(enriched);
  }

  async findById(id) {
    const item = await repository.findById(id);
    if (!item) return null;
    const [estadoNombre, rolNombre] = await Promise.all([
      estadoService.getNombreEstado(item.id_estado),
      rolService.getNombreRol(item.admin_usuario.id_rol)
    ]);
    item.estadoNombre = estadoNombre;
    item.rolNombre = rolNombre;
    return Mapper.toResponse(item, true);
  }

  async createWithUser(data) {
    const password_hash = await bcrypt.hash(data.password, 10);
    const result = await prisma.$transaction(async (tx) => {
      const usuario = await tx.admin_usuario.create({
        data: {
          cedula: data.cedula,
          username: data.username,
          primer_nombre: data.primer_nombre,
          segundo_nombre: data.segundo_nombre,
          apellido_paterno: data.apellido_paterno,
          apellido_materno: data.apellido_materno,
          correo: data.correo,
          password_hash,
          id_rol: <ID_ROL>,  // 2=profesor, 3=estudiante
          id_estado: 1
        }
      });
      const entity = await tx.admin_[entity].create({
        data: { id_usuario: usuario.id_usuario, ... },
        include: { admin_usuario: true }
      });
      return entity;
    });
    logger.info(`Created ${entity} with user: ${result.admin_usuario.primer_nombre} ${result.admin_usuario.segundo_nombre || ''}`);
    return { id: result.id_[entity], ... };
  }

  async update(id, data, usuarioModificacion = null) {
    const existing = await repository.findById(id);
    if (!existing) throw new AppError('Not found', 404);
    // Separar datos de usuario vs entidad
    const userFields = {};
    if (data.primer_nombre !== undefined) userFields.primer_nombre = data.primer_nombre;
    if (data.segundo_nombre !== undefined) userFields.segundo_nombre = data.segundo_nombre;
    // ... otros campos de admin_usuario
    // Si hay cambios en usuario → $transaction, si no → update directo
    // (seguir patrón de professor.service.js)
  }

  async delete(id, usuarioModificacion = null) {
    return await repository.delete(id, usuarioModificacion);
  }
}

module.exports = new EntityService();
```

**Reglas:**
- `createWithUser()`: recibir y pasar `segundo_nombre` opcional; hashear password con bcrypt (10 rounds), crear `admin_usuario` + entidad en transacción
- `findAll()`: consultar → enriquecer con estado/rol → mapear a DTO
- `update()`: verificar existencia primero, separar campos de usuario vs entidad
- `delete()`: delegar al repository (soft delete)
- Loggear operaciones importantes (create, update, delete)

## Paso 4: Controller (`src/controllers/[entity].controller.js`)

```javascript
const service = require('../services/[entity].service');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.getAll = catchAsync(async (req, res) => {
  const data = await service.findAll();
  res.json({ success: true, data });
});

exports.getById = catchAsync(async (req, res) => {
  const item = await service.findById(req.params.id);
  if (!item) throw new AppError('Not found', 404);
  res.json({ success: true, data: item });
});

exports.create = catchAsync(async (req, res) => {
  const newItem = await service.createWithUser(req.body);
  res.status(201).json({ success: true, data: newItem });
});

exports.update = catchAsync(async (req, res) => {
  const updated = await service.update(req.params.id, req.body);
  res.json({ success: true, data: updated });
});

exports.delete = catchAsync(async (req, res) => {
  await service.delete(req.params.id);
  res.json({ success: true, message: 'Eliminado correctamente' });
});
```

**Reglas:**
- Siempre usar `catchAsync()` wrapper
- Siempre responder con `{ success: true, data }`
- Lanzar `AppError` con 404 si no se encuentra
- `create()` responde con **status 201**

## Paso 5: Routes (`src/routes/v1/[entity].routes.js`)

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/[entity].controller');

router.route('/')
  .get(controller.getAll)
  .post(controller.create);

router.route('/:id')
  .get(controller.getById)
  .put(controller.update)
  .delete(controller.delete);

module.exports = router;
```

## Paso 6: Registrar en Routes Central (`src/routes/index.js`)

```javascript
const entityRoutes = require('./v1/[entity].routes');
router.use('/[entities]', entityRoutes);
```

## Paso 7: Validator (Opcional — `src/utils/validators/[entity].schema.js`)

```javascript
const { z } = require('zod');

const createSchema = z.object({
  cedula: z.string().length(10),
  primer_nombre: z.string().min(2),
  segundo_nombre: z.string().optional(),
  username: z.string().min(3),
  password: z.string().min(6),
  // campos específicos de la entidad
});

const updateSchema = createSchema.partial();

module.exports = { createSchema, updateSchema };
```

> **Nota**: Actualmente Zod está instalado pero los validators no están integrados en el pipeline. Los schemas existentes (`professor.schema.js`, `student.schema.js`, `subject.schema.js`) son básicos y no reflejan los campos reales.

## Resumen de Archivos a Crear/Modificar

| # | Archivo | Acción |
|---|---------|--------|
| 1 | `src/repositories/[entity].repository.js` | Crear |
| 2 | `src/mappers/[entity].mapper.js` | Crear |
| 3 | `src/services/[entity].service.js` | Crear |
| 4 | `src/controllers/[entity].controller.js` | Crear |
| 5 | `src/routes/v1/[entity].routes.js` | Crear |
| 6 | `src/routes/index.js` | Modificar (agregar `router.use`) |
| 7 | `src/utils/validators/[entity].schema.js` | Crear (opcional) |
