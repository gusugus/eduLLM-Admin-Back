# 2. Estructura de Archivos

```
BACK/
├── server.js                          # Entry point: levanta Express en PORT
├── Dockerfile                         # Multi-stage Docker build (node:18-alpine)
├── docker-compose.yml                 # Orquestación: backend + base de datos
├── package.json                       # Dependencias y scripts
├── nodemon.json                       # Configuración de file watching
├── .env                               # Variables de entorno
├── .gitignore
├── prisma/
│   └── schema.prisma                  # Modelos de BD (generado con `prisma db pull`)
├── logs/
│   ├── combined.log                   # Todos los logs
│   └── error.log                      # Solo errores
└── src/
    ├── app.js                         # Configuración Express (middleware, rutas montadas en /api/admin)
    ├── config/
    │   ├── index.js                   # Exporta variables de entorno (port, jwtSecret, env)
    │   ├── logger.js                  # Winston logger (console + archivos)
    │   └── prisma.js                  # Singleton PrismaClient
    ├── controllers/
    │   ├── professor.controller.js    # ✅ CRUD completo
    │   ├── student.controller.js      # ✅ CRUD completo
    │   ├── subject.controller.js      # ✅ CRUD completo
    │   ├── assignment.controller.js   # ✅ Asignaciones (profesor-materia, estudiante-materia)
    │   └── user.controller.js         # ✅ check/suggest username
    ├── mappers/
    │   ├── professor.mapper.js        # ✅ Transforma profesor DB → DTO
    │   ├── student.mapper.js          # ✅ Transforma estudiante DB → DTO
    │   └── subject.mapper.js          # ✅ Transforma materia DB → DTO
    ├── middlewares/
    │   ├── auth.middleware.js          # JWT decoder no-bloqueante (enriquece req.user si hay token)
    │   ├── errorHandler.js            # Captura errores y responde JSON
    │   └── logger.middleware.js        # Logea cada request con duración
    ├── repositories/
    │   ├── professor.repository.js    # ✅ Prisma queries reales
    │   ├── student.repository.js      # ✅ Prisma queries reales
    │   └── subject.repository.js      # ✅ Prisma queries reales
    ├── routes/
    │   ├── index.js                   # Router central: monta /professors, /students, /subjects, /users, /assignments
    │   └── v1/
    │       ├── professor.routes.js    # GET/POST / , GET/PUT/DELETE /:id
    │       ├── student.routes.js      # GET/POST / , GET/PUT/DELETE /:id
    │       ├── subject.routes.js      # GET/POST / , GET/PUT/DELETE /:id
    │       ├── user.routes.js         # POST /check-username, /suggest-username
    │       └── assignment.routes.js   # POST /professor-subject, /student-subject, GET, DELETE
    ├── services/
    │   ├── professor.service.js       # ✅ CRUD completo con transacciones
    │   ├── student.service.js         # ✅ CRUD completo con transacciones
    │   ├── subject.service.js         # ✅ CRUD completo
    │   ├── assignment.service.js      # ✅ Asignaciones batch con reemplazo
    │   ├── periodo.service.js         # ✅ Período lectivo activo
    │   ├── estado.service.js          # ✅ Lookup de estados desde admin_estado
    │   └── rol.service.js             # ✅ Lookup de roles desde admin_rol
    ├── types/                         # (vacío, reservado para futuro)
    └── utils/
        ├── AppError.js                # Clase de error operacional con statusCode
        ├── catchAsync.js              # Wrapper para async handlers
        └── validators/
            ├── professor.schema.js    # Zod schema (básico, no usado activamente)
            ├── student.schema.js      # Zod schema (básico, no usado activamente)
            └── subject.schema.js      # Zod schema (básico, no usado activamente)
```
