# 📚 eduLLM Admin — Backend: Índice de Documentación

> Microservicio de administración para la plataforma eduLLM.  
> Stack: **Node.js + Express + Prisma ORM + PostgreSQL**

---

## Índice

| #  | Documento | Descripción |
|----|-----------|-------------|
| 1  | [Visión General](./01_VISION_GENERAL.md) | Qué es, puertos, arquitectura por capas y principios SOLID |
| 2  | [Estructura de Archivos](./02_ESTRUCTURA.md) | Árbol de directorios con estado de cada archivo |
| 3  | [Configuración](./03_CONFIGURACION.md) | Variables de entorno, scripts npm y Docker |
| 4  | [Base de Datos](./04_BASE_DE_DATOS.md) | Prisma schema, tablas, relaciones, convenciones de estados/roles |
| 5  | [API Endpoints](./05_API_ENDPOINTS.md) | Todos los endpoints con request/response de ejemplo |
| 6  | [Flujos de Datos](./06_FLUJOS.md) | Flujo detallado de crear, listar y eliminar profesor |
| 7  | [Patrones y Convenciones](./07_PATRONES.md) | Manejo de errores, soft delete, transacciones, logging |
| 8  | [Dependencias](./08_DEPENDENCIAS.md) | Tabla de paquetes con versión y uso |
| 9  | [Guía para Extender](./09_GUIA_EXTENSION.md) | Paso a paso para agregar nuevas entidades |

---

## Estado Actual

| Módulo      | Estado |
|------------|--------|
| Profesores | ✅ CRUD funcional completo |
| Usuarios   | ✅ check/suggest username |
| Estudiantes| ⚠️ Stub (sin implementación real) |
| Materias   | ⚠️ Stub (sin implementación real) |
