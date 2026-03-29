# Layer Rules Reference

## Domain Layer

**Contains**: Entities, Value Objects, Domain Events, Repository Interfaces (Ports), Domain Services.

**Rules**:
- ZERO external dependencies (no frameworks, no database drivers, no HTTP clients)
- Contains all business rules and invariants
- Entities have identity and lifecycle
- Value Objects are immutable and compared by value
- Domain Events record things that happened
- Repository interfaces define WHAT, not HOW

**Allowed imports**: Only Python standard library and other domain classes.

**Forbidden imports**: SQLAlchemy, FastAPI, requests, any infrastructure package.

## Application Layer

**Contains**: Use Cases, DTOs (Data Transfer Objects), Application Services.

**Rules**:
- Orchestrates domain entities and services
- One use case = one business operation
- Each use case has a single public method (`execute`)
- Receives raw data, returns DTOs (never entities)
- Publishes domain events after persisting changes

**Allowed imports**: Domain layer classes.

**Forbidden imports**: FastAPI, SQLAlchemy, any infrastructure or API package.

## Infrastructure Layer

**Contains**: Repository Implementations (Adapters), ORM Models, HTTP Clients, Message Queue Clients, External Service Integrations.

**Rules**:
- Implements interfaces defined in the domain layer
- Converts between domain entities and persistence models
- Handles all framework-specific code
- Contains database migrations

**Allowed imports**: Domain layer, Application layer, third-party libraries.

## API Layer

**Contains**: Controllers/Routers, Request/Response Models, Middleware, Authentication.

**Rules**:
- Thin layer: parse request -> call use case -> format response
- No business logic
- Handles HTTP-specific concerns (status codes, headers, auth)
- Input validation at the boundary (Pydantic models)

**Allowed imports**: Application layer (use cases, DTOs). Never domain entities directly.
