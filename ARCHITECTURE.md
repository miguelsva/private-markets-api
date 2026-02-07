# Architecture & Design Decisions

## Overview

Clean, layered architecture with separation of concerns. Designed for simplicity, maintainability, and production-ready quality.

## Technology Choices

**TypeScript (strict mode)**: Type safety, better IDE support, self-documenting code

**Express.js**: Industry standard, lightweight, quick to implement

**Raw SQL with `pg`**: Direct control, no ORM overhead, transparent queries

**Custom Validation**: Lightweight, sufficient for requirements, no additional dependencies

**PostgreSQL**: Required by spec, constraint support, UUID and ENUM types

## Architecture Layers

**Routes** → Define endpoints and validation rules
**Controllers** → Handle HTTP requests/responses
**Services** → Business logic and database operations
**Middleware** → Validation and error handling

## Database Design

- UUID primary keys for distributed system compatibility
- Foreign key constraints
- Check constraints for data validation
- ENUM types for fund status and investor type
- Unique constraint on investor email
- Indexes on foreign keys for query performance

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

Separate test database (`private_markets_test`) with clean state before each suite.

## Production Features

**Connection Pooling**: 20 max connections, 30s idle timeout, client leak detection

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

## Error Handling

The API returns appropriate HTTP status codes:

- `200 OK` - Successful GET/PUT requests
- `201 Created` - Successful POST requests
- `400 Bad Request` - Validation errors or invalid data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Unexpected server errors

Error responses include descriptive messages:

```json
{
  "message": "Validation failed",
  "errors": [
    "name is required",
    "vintage_year must be at least 1900"
  ]
}
```
