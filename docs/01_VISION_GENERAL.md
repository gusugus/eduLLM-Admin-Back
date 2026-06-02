# 1. Visión General

Panel de administración backend que gestiona **Profesores, Estudiantes, Materias y Asignaciones** de la plataforma educativa eduLLM. Sigue principios **SOLID** con una arquitectura por capas.

## Puertos y URLs

| Servicio   | Puerto | Base URL          |
|-----------|--------|-------------------|
| Gateway    | `8085` | `http://localhost:8085/api` |
| Backend    | `8002` | `http://localhost:8002/api/admin` |

> El frontend siempre apunta al **gateway (8085)**, nunca directamente al backend. El gateway maneja autenticación (cookies HttpOnly) y enruta `/api/*` al backend.

## Arquitectura por Capas

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

## Principios SOLID Aplicados

- **S** (Single Responsibility): Cada capa tiene una sola responsabilidad.
- **O** (Open/Closed): Nuevas entidades se agregan creando archivos nuevos, sin modificar los existentes.
- **D** (Dependency Inversion): Controllers dependen de Services, Services de Repositories.
