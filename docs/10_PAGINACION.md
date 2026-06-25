# 10. Paginación y Búsqueda

## Convención general

Todos los endpoints `GET /api/admin/:resource` que devuelven listas **deben** soportar paginación con los siguientes query params:

| Param | Tipo | Default | Máximo | Descripción |
|-------|------|---------|--------|-------------|
| `page` | int | 1 | — | Número de página (1-indexed) |
| `limit` | int | 10 | 100 | Items por página |
| `search` | string | '' | — | Búsqueda por nombre/username (case-insensitive) |
| `all` | bool | false | — | Si es `true`, devuelve **todos** los registros sin paginar |

Los valores default de `limit` y el máximo están definidos en `src/config/index.js`:
```js
pagination: {
  defaultLimit: 10,
  maxLimit: 100,
}
```

## Response

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 234,
    "totalPages": 24
  }
}
```

Cuando se usa `?all=true`, `pagination` es `null`.

## Implementación

### Controller

```js
const config = require('../config');

exports.getAll = catchAsync(async (req, res) => {
  // Escape para dropdowns — devuelve todos sin paginar
  if (req.query.all === 'true') {
    const result = await service.findAll(1, null, '');
    return res.json({ success: true, data: result.data, pagination: null });
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    config.pagination.maxLimit,
    Math.max(1, parseInt(req.query.limit, 10) || config.pagination.defaultLimit)
  );
  const search = req.query.search?.trim() || '';
  const result = await service.findAll(page, limit, search);
  res.json({ success: true, ...result });
});
```

### Service

```js
async findAll(page = 1, limit = config.pagination.defaultLimit, search = '') {
  const skip = limit ? (page - 1) * limit : undefined;
  const estados = [ESTADOS.ACTIVO, ESTADOS.ELIMINADO];
  const options = limit ? { skip, take: limit, search } : { search };

  const [items, total] = await Promise.all([
    repository.findAll(estados, options),
    repository.count(estados, search),
  ]);

  // enrich (estadoNombre, rolNombre, etc.)…

  return {
    data: Mapper.toResponseList(items),
    pagination: limit ? {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    } : null,
  };
}
```

### Repository

```js
const buildWhere = (estadosPermitidos, search) => {
  const where = {};
  if (estadosPermitidos.length === 1) {
    where.estado = estadosPermitidos[0];
  }
  if (search) {
    where.OR = [
      { campo: { contains: search, mode: 'insensitive' } },
      // … más campos
    ];
  }
  return where;
};

async findAll(estadosPermitidos = [ESTADOS.ACTIVO], options = {}, tx = null) {
  const { skip = 0, take = 50, search = '' } = options;
  const client = tx || prisma;
  return await client.modelo.findMany({
    where: buildWhere(estadosPermitidos, search),
    skip,
    take,
    orderBy: { id: 'asc' },
    select: { … },
  });
}

async count(estadosPermitidos = [ESTADOS.ACTIVO], search = '', tx = null) {
  const client = tx || prisma;
  return await client.modelo.count({
    where: buildWhere(estadosPermitidos, search),
  });
}
```

### Frontend — Service

```js
getAll: (params = {}) => api.get('/resource', { params })
  .then(res => ({
    data: res.data.data || [],
    pagination: res.data.pagination || null,
  }))
  .catch(err => {
    console.error('Error:', err);
    return { data: [], pagination: null };
  }),

getActive: () => api.get('/resource', { params: { all: true } })
  .then(res => res.data.data || [])
  .catch(() => []),
```

### Frontend — Hook

```js
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
const [search, setSearch] = useState('');

const { data, isLoading } = useQuery({
  queryKey: [QUERY_KEY, page, limit, search],
  queryFn: () => service.getAll({ page, limit, search }),
  enabled: enableList,
});
```

### Frontend — DataTable

El componente `DataTable` acepta las props `pagination`, `onPageChange`, `onRowsPerPageChange`, `search` y `onSearchChange`. El search se dispara con botón "Buscar" o Enter (no en cada tecleo).

## Endpoints que implementan paginación

| Recurso | Endpoint | Search fields | `?all=true` |
|---------|----------|---------------|-------------|
| Profesores | `GET /api/admin/professors` | nombre, apellido, username | ✅ |
| Estudiantes | `GET /api/admin/students` | nombre, apellido, username | ✅ |
| Materias | `GET /api/admin/subjects` | nombre, descripción | ✅ |
| Grados | `GET /api/admin/grados` | grado (int), paralelo | ✅ |
| Asignaciones Profesor-Materia | `GET /api/admin/assignments/professor-subject` | — | — |
| Asignaciones Estudiante-Materia | `GET /api/admin/assignments/student-subject` | — | — |
