# 3. Configuración

## Variables de Entorno (.env)

```env
PORT=8002
DATABASE_URL="postgresql://admin:admin@localhost:5432/edu_llm?schema=comun"
JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
NODE_ENV=development
```

## Scripts npm

```bash
npm start              # Inicia con node server.js
npm run dev            # Inicia con nodemon (hot-reload)
npm run prisma:pull    # Sincroniza schema.prisma desde la BD existente
npm run prisma:generate # Genera el cliente Prisma
```

## Docker

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

## Middleware Pipeline (app.js)

El orden de middleware en Express es:

1. `helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })` — Headers de seguridad (permite cargar imágenes estáticas desde otros orígenes, necesario para fotos de perfil)
2. `cors()` — Cross-Origin Resource Sharing (abierto)
3. `rateLimit()` — Máximo 100 requests por 15 minutos
4. `logRequest` — Logger de cada request con duración
5. `express.json()` — Parseo JSON
6. `express.urlencoded()` — Parseo form data
7. **Rutas** — `app.use('/api/v1', routes)`
8. `errorHandler` — Captura errores (siempre al final)
