# Architecture & Design Decisions

This document explains the key architectural decisions and design choices made for the Titanbay Private Markets API.

## Overview

The API follows a clean, layered architecture with clear separation of concerns. The system is designed for simplicity, maintainability, and rapid development while maintaining production-ready quality.

## Technology Choices

### TypeScript

**Decision**: Use TypeScript with strict mode enabled

**Rationale**:
- Type safety reduces runtime errors
- Better IDE support and autocomplete
- Self-documenting code through type definitions
- Required by the company

### Express.js

**Decision**: Use Express.js as the web framework

**Rationale**:
- Industry standard, battle-tested framework
- Large ecosystem and community support
- Lightweight and flexible
- Easy to understand and quick to implement

### Raw SQL with `pg` (No ORM)

**Decision**: Use `pg` library with raw SQL queries instead of an ORM like Prisma or TypeORM

**Rationale**:
- **Simplicity**: No additional layer of abstraction to learn
- **Speed of development**: For a 2-3 hour take-home test, setting up an ORM adds overhead
- **Performance**: Direct SQL queries with no ORM overhead
- **Transparency**: Easier to see exactly what queries are being executed
- **SQL skills**: Demonstrates understanding of relational database concepts
- **Flexibility**: Full control over queries and optimizations

### Custom Validation Middleware (No Zod/Joi)

**Decision**: Build custom validation middleware instead of using libraries like Zod or Joi

**Rationale**:
- **Minimal dependencies**: Keeps the project lightweight
- **Quick setup**: No learning curve for complex validation libraries
- **Sufficient for requirements**: The validation needs are straightforward
- **Educational**: Shows understanding of validation logic
- **Performance**: No additional parsing or schema compilation overhead

### PostgreSQL

**Decision**: Use PostgreSQL as the database

**Rationale**:
- Required by the task specifications
- Excellent support for constraints and data integrity
- UUID support with extensions
- ENUM types for fund status and investor type
- Strong ACID compliance

## Architecture Layers

### 1. Routes Layer (`src/routes/`)

**Responsibility**: Define API endpoints and attach middleware

- Map HTTP methods to controller functions
- Apply validation middleware
- Keep route definitions clean and declarative

### 2. Controllers Layer (`src/controllers/`)

**Responsibility**: Handle HTTP requests and responses

- Parse request data
- Call appropriate service methods
- Format responses
- Use asyncHandler to catch errors

**Why separate from routes?**
- Keeps route files focused on endpoint definitions
- Makes testing easier
- Allows reuse of controller logic

### 3. Services Layer (`src/services/`)

**Responsibility**: Business logic and database operations

- Encapsulate data access logic
- Handle complex business rules
- Throw AppError for business-level errors
- Return clean data structures

**Why not a separate repository layer?**
- For this application size, combining service and data access reduces complexity
- Easy to refactor later if needed
- Keeps the codebase simple and maintainable

### 4. Middleware Layer (`src/middleware/`)

**Components**:
- `validator.ts`: Input validation
- `errorHandler.ts`: Centralized error handling

**Validation Strategy**:
- Declarative validation rules
- Field-level checks (required, type, min, max, enum)
- Early validation before hitting controllers
- Descriptive error messages

**Error Handling Strategy**:
- Custom AppError class for operational errors
- Centralized error handler catches all errors
- Maps database errors to HTTP status codes
- Consistent error response format

## Database Design

### Schema Design Principles

1. **UUID Primary Keys**: Better for distributed systems, no auto-increment conflicts
2. **Foreign Key Constraints**: Ensures referential integrity
3. **Check Constraints**: Validates data at the database level
4. **Indexes**: Added on foreign keys for query performance
5. **ENUM Types**: Type-safe status and type fields
6. **Timestamps**: Audit trail with created_at fields

### Key Schema Decisions

**Fund Status ENUM**:
```sql
CREATE TYPE fund_status AS ENUM ('Fundraising', 'Investing', 'Closed');
```
- Prevents invalid status values
- Self-documenting

**Investor Type ENUM**:
```sql
CREATE TYPE investor_type AS ENUM ('Individual', 'Institution', 'Family Office');
```
- Ensures consistent categorization

**Email Uniqueness**:
- Unique constraint on investor email
- Prevents duplicate investor registrations

**Investment Constraints**:
- ON DELETE CASCADE for referential integrity
- Positive amount checks
- Date validation

## Error Handling Strategy

### Three Error Types

1. **Validation Errors (400)**:
   - Input validation failures
   - Missing required fields
   - Invalid data types

2. **Not Found Errors (404)**:
   - Resource doesn't exist
   - Invalid IDs

3. **Database Constraint Violations (400)**:
   - Unique constraint violations (duplicate emails)
   - Foreign key violations (non-existent references)
   - Check constraint violations (invalid data)

### PostgreSQL Error Code Mapping

```typescript
'23505' → Unique violation → 400
'23503' → Foreign key violation → 400
'23514' → Check constraint violation → 400
'22P02' → Invalid data type → 400
```

## Testing Strategy

### Integration Tests

**Decision**: Focus on integration tests over unit tests

**Rationale**:
- Tests real database interactions
- Validates entire request/response cycle
- Higher confidence in API functionality
- Catches integration issues early

### Test Structure

Each endpoint group (`funds`, `investors`, `investments`) has separate test files:
- Happy path tests (201, 200 responses)
- Validation error tests (400 responses)
- Not found tests (404 responses)
- Constraint violation tests (400 responses)

### Test Database

- Separate test database (`private_markets_test`)
- Clean state before each test suite
- Isolated from development data

## Development Workflow

### Database Migrations

**Simple SQL files** instead of migration frameworks:
- Easy to understand
- No abstraction layer
- Version controlled
- Rollback files provided

### Environment Configuration

**dotenv for configuration**:
- Simple and standard
- Separate configs for dev/test/prod
- Example file for documentation

### Scripts

**Utility scripts** for common tasks:
- `migrate.js`: Run migrations
- `seed.js`: Populate sample data

## Trade-offs and Alternatives

### What We Didn't Include (and why)

1. **Docker/Docker Compose**:
   - Assumption: PostgreSQL already installed locally
   - Reduces setup complexity for reviewer
   - Faster to get started

2. **ORM (Prisma/TypeORM)**:
   - Setup time would eat into development time
   - Raw SQL is more transparent
   - No schema code generation needed

3. **Validation Library (Zod/Joi)**:
   - Overkill for simple validation needs
   - Custom solution is lightweight and sufficient

4. **API Documentation (Swagger)**:
   - Time constraint (2-3 hours)
   - Specification already provided externally
   - README examples suffice

5. **Logging Library (Winston/Pino)**:
   - Simple console logging is sufficient
   - Easy to add later if needed

6. **Authentication/Authorization**:
   - Not required by specifications
   - Would add unnecessary complexity

## Scalability Considerations

### Current Architecture Supports

- Horizontal scaling (stateless API)
- Database connection pooling with timeout handling
- Async/await for non-blocking operations
- Proper indexing for query performance

### Future Enhancements

If this were a production system at scale:
- Add caching layer (Redis)
- Implement rate limiting
- Add request tracing (OpenTelemetry)
- Add monitoring (Prometheus/Grafana)
- Implement pagination for list endpoints
- Add soft deletes
- Add audit logging
- Implement RBAC

## Production-Ready Features

Beyond the core requirements, the implementation includes several production-ready features that enhance operational safety and maintainability.

### Environment Safety System

**Location**: `src/utils/environmentSafety.ts`

**Purpose**: Prevents destructive operations in production environments

**Features**:
- Validates environment configuration before starting the server
- Blocks destructive database operations (TRUNCATE, DROP) in production
- Provides safe query wrappers for test environments
- Ensures TEST_DB_NAME is configured for test runs

**Why This Matters**:
- Prevents accidental data loss in production
- Makes tests safer by enforcing test database usage
- Catches configuration errors early

### Advanced Database Connection Management

**Location**: `src/database/db.ts`

**Features**:
1. **Connection Pooling**:
   - Configures PostgreSQL connection pool with optimal settings
   - Max 20 connections, 30-second idle timeout
   - Query timeout set to 10 seconds

2. **Query Performance Logging**:
   - Logs slow queries in development mode
   - Tracks query execution time
   - Helps identify performance bottlenecks

3. **Client Timeout Monitoring**:
   - Detects and logs idle client connections
   - Helps identify connection leaks
   - Automatic cleanup of stuck connections

4. **Graceful Shutdown**:
   - Properly closes database pool on server shutdown
   - Prevents connection leaks
   - Ensures clean application exit

### Migration Safety

**Location**: `scripts/migrate.js`

**Features**:
- Environment validation before running migrations
- 5-second warning delay in production environments
- Visual countdown to prevent accidental production changes
- Clear feedback on migration status

**Why This Matters**:
- Gives operators time to cancel accidental production migrations
- Reduces risk of schema changes in wrong environment
- Provides clear audit trail

### Request Logging

**Location**: `src/app.ts`

**Features**:
- Logs all HTTP requests in development mode
- Includes timestamp, method, and path
- Automatically disabled in test environment
- Helps with debugging during development

### Error Context Enhancement

**Error Handling Improvements**:
- Stack trace capture for debugging
- Request context preservation
- PostgreSQL error code mapping with detailed messages
- Structured error responses

## Code Quality Practices

1. **TypeScript Strict Mode**: Catch errors at compile time
2. **Async/Await**: Clean asynchronous code
3. **Error Handling**: Consistent patterns throughout with custom AppError class
4. **Code Organization**: Clear folder structure with separation of concerns
5. **Naming Conventions**: Descriptive variable/function names
6. **Comments**: Used sparingly, code is self-documenting
7. **Environment-Aware Logging**: Conditional logging based on environment
8. **Production Safeguards**: Environment safety checks prevent destructive operations
9. **Connection Management**: Proper resource cleanup and graceful shutdown
10. **Comprehensive Testing**: Integration tests covering all endpoints and error cases

## Conclusion

This architecture prioritizes:
- **Simplicity**: Easy to understand and maintain
- **Speed**: Rapid development without sacrificing quality
- **Correctness**: Type safety and validation at multiple layers
- **Testability**: Comprehensive test coverage with integration tests
- **Production-Ready**: Proper error handling, data integrity, and operational safety
- **Robustness**: Environment safeguards, graceful shutdown, and connection management
- **Maintainability**: Clear separation of concerns and self-documenting code

The design choices reflect a balance between building quickly (2-3 hour constraint) and demonstrating professional, production-quality code. The additional safety features (environment protection, graceful shutdown, migration safeguards) show attention to operational concerns that go beyond basic requirements, making this a deployment-ready API implementation.
