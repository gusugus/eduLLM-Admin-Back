# Dockerfile.dev
FROM node:20-alpine

# Crear usuario no-root
RUN addgroup -g 1001 -S nodegroup && \
    adduser -S nodeuser -G nodegroup -u 1001

WORKDIR /app

# Cambiar propietario
COPY --chown=nodeuser:nodegroup . .

RUN apk add --no-cache openssl
RUN npm install -g nodemon

COPY package*.json ./
RUN npm install

# No ejecutamos prisma generate aquí, lo hará el script dev

EXPOSE 8002

# Usar el script de desarrollo que genera prisma automáticamente
CMD ["npm", "run", "dev"]