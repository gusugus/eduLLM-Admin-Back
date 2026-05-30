# 8. Dependencias

## Producción

| Paquete | Versión | Uso |
|---------|---------|-----|
| `express` | ^4.18.2 | Framework HTTP |
| `@prisma/client` | ^5.8.0 | ORM para PostgreSQL |
| `bcryptjs` | ^2.4.3 | Hash de contraseñas |
| `jsonwebtoken` | ^9.0.2 | Verificación JWT |
| `helmet` | ^7.1.0 | Headers de seguridad |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing |
| `express-rate-limit` | ^7.1.5 | Rate limiting (100 req/15 min) |
| `winston` | ^3.11.0 | Logger estructurado |
| `zod` | ^3.22.4 | Validación de schemas |
| `dotenv` | ^16.3.1 | Variables de entorno (.env) |

## Desarrollo

| Paquete | Versión | Uso |
|---------|---------|-----|
| `nodemon` | ^3.0.2 | Auto-restart en desarrollo |
| `prisma` | ^5.8.0 | CLI de Prisma (generate, db pull) |

## Jerarquía de Dependencias

```
server.js
  └── app.js
        ├── helmet
        ├── cors
        ├── express-rate-limit
        ├── winston (logger)
        ├── express (json, urlencoded)
        └── routes (index.js)
              ├── professor.routes → professor.controller → professor.service
              │     ├── bcryptjs
              │     ├── @prisma/client
              │     ├── winston
              │     └── AppError + catchAsync
              ├── student.routes → student.controller → student.service (stub)
              ├── subject.routes → subject.controller → subject.service (stub)
              └── user.routes → user.controller
                    ├── @prisma/client
                    └── AppError + catchAsync
```

## Versiones de Node y PostgreSQL

| Herramienta | Versión |
|------------|---------|
| Node.js | 18.x (Alpine en Docker) |
| PostgreSQL | 15+ (con schema `comun`) |
| Prisma CLI | 5.8.x |

## Scripts npm

```bash
npm start              # node server.js
npm run dev            # nodemon server.js (hot-reload)
npm run prisma:pull    # prisma db pull (sincroniza schema de BD existente)
npm run prisma:generate # prisma generate (genera Prisma Client)
```
