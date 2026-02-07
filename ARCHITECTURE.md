# Architecture & Design Decisions

## Overview

This API uses a clean, layered architecture with clear separation of concerns, designed for simplicity, maintainability, and production readiness.

## Technology Choices

- **TypeScript (strict mode)** - Type safety, better IDE support, self-documenting code

- **Express.js** - Industry standard, lightweight, quick to implement

- **Raw SQL with `pg`** - Direct control, no ORM overhead, transparent queries

- **Custom Validation** - Lightweight, sufficient for requirements, no additional dependencies

- **PostgreSQL** - Required by spec, supports constraints, UUIDs, and ENUM types

## Architecture Layers

**Routes**: Define endpoints and validation rules

**Controllers**: Handle HTTP requests/responses

**Services**: Business logic and database operations

**Middleware**: Validation and error handling

## Database Design

- **UUID primary keys** - For distributed system compatibility and security
- **Foreign key constraints** - Ensures referential integrity
- **Check constraints** - Database-level data validation
- **ENUM types** - For fund status and investor type
- **Unique constraints** - On investor email addresses
- **Indexes** - On foreign keys for optimal query performance

## Error Handling

Maps PostgreSQL errors to HTTP status codes:
- `23505` (unique violation) → 400
- `23503` (foreign key violation) → 400
- `23514` (check constraint) → 400
- `22P02` (invalid data type) → 400

## Testing Strategy

Integration tests covering:
- Happy path (200/201)
- Validation errors (400)
- Not found (404)
- Constraint violations (400)
- Database errors (500)

Separate test database (`private_markets_test`).

## Production Features

**Connection Pooling**: 20 max connections, 30s idle timeout

**Environment Safety**: Prevents destructive operations in production, validates configuration

**Migration Safety**: 5-second warning delay in production environments

**Graceful Shutdown**: Properly closes database connections

**Query Logging**: Performance tracking in development mode

## Project Structure

```
.
├── migrations/          # SQL migration files
├── scripts/             # Utility scripts (migrate, seed)
├── src/
│   ├── controllers/     # Request handlers (fund, investor, investment)
│   ├── database/        # Database connection and safe query utilities
│   ├── middleware/      # Express middleware (validation, error handling)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic (fund, investor, investment)
│   ├── tests/           # Integration tests for all endpoints
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions (environment safety)
│   ├── app.ts           # Express app configuration
│   └── index.ts         # Application entry point
├── .env                 # Environment variables (not in version control)
├── .gitignore
├── jest.config.js
├── package.json
└── tsconfig.json
```
