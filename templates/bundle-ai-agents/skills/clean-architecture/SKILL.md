---
name: clean-architecture
description: Implement Clean Architecture with domain, application, and infrastructure layers. Use when creating modules, organizing code in layers, separating business rules from infrastructure, or structuring a new project.
version: 1.0.0
author: Maestro
---

# Clean Architecture

Structure code into Domain, Application, and Infrastructure layers with strict dependency rules, ensuring business logic is isolated from frameworks and external services.

## When to Use
- Starting a new module or microservice
- Refactoring code that mixes business logic with infrastructure
- Creating entities, value objects, use cases, or repositories
- Reviewing code for layer violations
- Setting up project structure for a new feature

## Available Operations
1. Define domain entities with business rules and events
2. Create application use cases that orchestrate domain logic
3. Implement infrastructure adapters (repositories, HTTP clients)
4. Set up dependency injection wiring
5. Validate layer dependencies (no inward violations)

## Multi-Step Workflow

### Step 1: Set Up the Layer Structure

Create the directory structure following the dependency rule: outer layers depend on inner layers, never the reverse.

```bash
mkdir -p src/domain/entities src/domain/repositories src/domain/value_objects src/domain/events
mkdir -p src/application/use_cases src/application/dtos
mkdir -p src/infrastructure/persistence src/infrastructure/http
mkdir -p src/api/controllers
```

```
+------------------------------+
|         API / CLI            |  <- Controllers, Routers
+------------------------------+
|        APPLICATION           |  <- Use Cases, DTOs
+------------------------------+
|          DOMAIN              |  <- Entities, VOs, Events, Repos (interface)
+------------------------------+
|       INFRASTRUCTURE         |  <- DB, HTTP clients, Frameworks
+------------------------------+

Dependency Rule: arrows point INWARD (infra -> domain)
Domain NEVER imports from infrastructure
```

### Step 2: Build the Domain Layer

Domain contains entities with business rules, value objects, domain events, and repository interfaces (ports).

```python
# domain/entities/demand.py
class Demand:
    def __init__(self, id: DemandId, description: str):
        self._id = id
        self._description = description
        self._status = DemandStatus.CREATED
        self._events: list[DomainEvent] = []

    def decompose(self, planner: TaskPlanner) -> list[Task]:
        if self._status != DemandStatus.CREATED:
            raise DemandAlreadyDecomposedException(self._id)
        tasks = planner.plan(self._description)
        self._status = DemandStatus.PLANNED
        self._events.append(DemandDecomposed(self._id, [t.id for t in tasks]))
        return tasks

    @property
    def pending_events(self) -> list[DomainEvent]:
        return list(self._events)

# domain/repositories/demand_repository.py (PORT -- interface only)
from abc import ABC, abstractmethod

class DemandRepository(ABC):
    @abstractmethod
    def find_by_id(self, id: DemandId) -> Demand: ...
    @abstractmethod
    def save(self, demand: Demand) -> None: ...
```

### Step 3: Build the Application Layer

Application layer contains use cases that orchestrate domain entities. Use cases are the entry points for business operations.

```python
# application/use_cases/decompose_demand.py
class DecomposeDemand:
    def __init__(self, repo: DemandRepository, planner: TaskPlanner, event_bus: EventBus):
        self._repo = repo
        self._planner = planner
        self._event_bus = event_bus

    def execute(self, demand_id: str) -> DecomposeDemandOutput:
        demand = self._repo.find_by_id(DemandId(demand_id))
        tasks = demand.decompose(self._planner)
        self._repo.save(demand)
        for event in demand.pending_events:
            self._event_bus.publish(event)
        return DecomposeDemandOutput(tasks=[TaskDTO.from_entity(t) for t in tasks])
```

### Step 4: Build the Infrastructure Layer

Infrastructure implements the ports defined in the domain layer (adapters).

```python
# infrastructure/persistence/pg_demand_repository.py (ADAPTER)
class PgDemandRepository(DemandRepository):
    def __init__(self, session: Session):
        self._session = session

    def find_by_id(self, id: DemandId) -> Demand:
        model = self._session.query(DemandModel).get(str(id))
        if not model:
            raise DemandNotFoundException(id)
        return self._to_entity(model)

    def save(self, demand: Demand) -> None:
        model = self._to_model(demand)
        self._session.merge(model)
        self._session.commit()
```

### Step 5: Validate Layer Dependencies

Check that no layer violations exist. Domain must never import from infrastructure.

```bash
# Check for import violations (domain importing from infrastructure)
grep -r "from src.infrastructure" src/domain/ && echo "VIOLATION: Domain imports infrastructure!" || echo "OK: No violations"
grep -r "from src.api" src/domain/ && echo "VIOLATION: Domain imports API!" || echo "OK: No violations"
grep -r "from src.infrastructure" src/application/ && echo "VIOLATION: Application imports infrastructure!" || echo "OK: No violations"
```

Use a linter rule to enforce this:

```bash
ruff check src/ --select I  # Check import ordering
```

## Resources
- `references/layer-rules.md` - Detailed rules for what belongs in each layer
- `references/dependency-injection.md` - Patterns for wiring layers together

## Examples

### Example 1: Create a New Feature Module
User asks: "Create a user management module with CRUD operations."
Response approach:
1. Create domain entity `User` with validation rules and events
2. Create value objects: `UserId`, `Email`, `UserStatus`
3. Define `UserRepository` port (abstract class) in domain
4. Create use cases: `CreateUser`, `GetUser`, `ListUsers`, `UpdateUser`
5. Implement `PgUserRepository` adapter in infrastructure
6. Create `UserController` in API layer with FastAPI routes
7. Wire dependencies with dependency injection

### Example 2: Refactor a "Fat Controller"
User asks: "Our controller has all the business logic. Refactor it to Clean Architecture."
Response approach:
1. Identify business rules in the controller
2. Extract domain entity with those rules as methods
3. Create a use case that orchestrates the entity operations
4. Move database calls to a repository adapter
5. Controller should only: parse request -> call use case -> format response
6. Run import validation to confirm no layer violations

### Example 3: Add Domain Events
User asks: "When a demand is decomposed, we need to notify other services."
Response approach:
1. Create `DemandDecomposed` domain event class
2. Add event collection to the `Demand` entity
3. Emit the event in the `decompose()` method
4. Publish events in the use case after saving
5. Infrastructure layer handles event delivery (message queue, HTTP, etc.)

## Notes
- **Golden rule**: Use Case orchestrates -> Entity contains rules -> Repository persists
- Never put business logic in controllers, repositories, or generic "Service" classes
- Domain layer has zero external dependencies (no frameworks, no database drivers)
- Use cases should be small (one public method: `execute`)
- Value objects enforce validation at construction -- use them for all domain primitives
- Repository interfaces (ports) live in the domain; implementations (adapters) live in infrastructure
