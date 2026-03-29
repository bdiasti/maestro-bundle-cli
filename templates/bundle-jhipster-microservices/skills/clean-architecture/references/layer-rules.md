# Clean Architecture Layer Rules

## Dependency Direction
```
API/CLI --> APPLICATION --> DOMAIN <-- INFRASTRUCTURE
```
- All dependencies point toward DOMAIN
- Domain NEVER imports from Application, Infrastructure, or API
- Infrastructure implements Domain interfaces (Dependency Inversion)

## Layer Contents

### Domain Layer
- Entities (with behavior, not anemic)
- Value Objects (immutable, validated)
- Domain Events
- Repository Interfaces (Ports)
- Domain Services (cross-entity logic)
- Exceptions (business exceptions)

### Application Layer
- Use Cases (one per operation)
- Input/Output DTOs
- Application Services (orchestration only)
- NO business rules here

### Infrastructure Layer
- Repository Implementations (Adapters)
- Database Models/Mappings
- HTTP Clients
- Message Queue Producers/Consumers
- Framework Configuration

### API Layer
- REST Controllers
- GraphQL Resolvers
- CLI Commands
- Request/Response mapping

## Package Organization (Java)
```
com.myapp/
  domain/
    model/         # Entities, VOs
    event/         # Domain Events
    repository/    # Repository interfaces
    service/       # Domain Services
    exception/     # Business exceptions
  application/
    usecase/       # Use Cases
    dto/           # Input/Output DTOs
  infrastructure/
    persistence/   # JPA Repositories
    messaging/     # Kafka/RabbitMQ
    http/          # REST clients
  web/
    rest/          # Controllers
```

## Package Organization (Python)
```
src/
  domain/
    entities/
    value_objects/
    events/
    repositories/  # ABC interfaces
    services/
  application/
    use_cases/
    dto/
  infrastructure/
    persistence/
    messaging/
    http_clients/
  api/
    routes/
```
