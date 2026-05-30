# 2. Estructura de Archivos

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
    │   ├── index.js                   # Exporta variables de entorno (port, jwtSecret, env)
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
    │   ├── index.js                   # Router central: monta /professors, /students, /subjects, /users
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
