---
name: clean-architecture
description: Implement Clean Architecture with domain, application, and infrastructure layers. Use when creating modules, organizing code in layers, separating business rules from infrastructure, or structuring a new project.
version: 1.0.0
author: Maestro
---

# Clean Architecture

Implement Clean Architecture with properly separated layers, dependency inversion, and domain-centric design.

## When to Use
- When creating a new module or bounded context
- When organizing code into proper layers
- When separating business rules from infrastructure
- When reviewing architecture compliance
- When refactoring a monolithic service class

## Available Operations
1. Create domain layer with entities and repository interfaces
2. Create application layer with use cases
3. Create infrastructure layer with adapters
4. Verify dependency direction compliance
5. Refactor code to follow Clean Architecture

## Multi-Step Workflow

### Step 1: Understand the Layer Structure

```
+------------------------------+
|         API / CLI            |  <-- Controllers, Routers
+------------------------------+
|        APPLICATION           |  <-- Use Cases, DTOs
+------------------------------+
|          DOMAIN              |  <-- Entities, VOs, Events, Repos (interface)
+------------------------------+
|       INFRASTRUCTURE         |  <-- DB, HTTP clients, Frameworks
+------------------------------+

Dependency Rule: arrows point INWARD (infra -> domain)
Domain NEVER imports from infrastructure
```

### Step 2: Implement the Domain Layer
The domain layer contains entities, value objects, domain events, and repository interfaces (ports).

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

# domain/repositories/demand_repository.py (PORT - interface only)
class DemandRepository(ABC):
    @abstractmethod
    def find_by_id(self, id: DemandId) -> Demand: ...
    @abstractmethod
    def save(self, demand: Demand) -> None: ...
```

### Step 3: Implement the Application Layer
Use cases orchestrate domain operations. They contain NO business rules.

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

### Step 4: Implement the Infrastructure Layer
Adapters implement the ports defined in the domain layer.

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

### Step 5: Verify Architecture Compliance

```bash
# Check for dependency violations: domain should not import infrastructure
grep -rn "from infrastructure" src/domain/ --include="*.py"
grep -rn "from.*infrastructure" src/domain/ --include="*.java"

# Run tests per layer
pytest tests/domain/       # Unit tests (no infra deps)
pytest tests/application/  # Use case tests (mocked deps)
pytest tests/infrastructure/  # Integration tests
```

## Resources
- `references/layer-rules.md` - Layer dependency rules and package organization

## Examples
### Example 1: Create a New Domain Module
User asks: "Create the demand management module with Clean Architecture"
Response approach:
1. Create `domain/entities/demand.py` with entity and behavior
2. Create `domain/repositories/demand_repository.py` as interface (port)
3. Create `application/use_cases/create_demand.py` as orchestrator
4. Create `infrastructure/persistence/pg_demand_repository.py` as adapter
5. Wire dependencies via DI container

### Example 2: Refactor a Fat Service
User asks: "This service has 500 lines and mixes business logic with database calls"
Response approach:
1. Extract business rules into domain entities
2. Extract repository interface from data access code
3. Create use case class for orchestration
4. Move database code to infrastructure adapter
5. Verify no domain imports from infrastructure

### Example 3: Verify Architecture
User asks: "Check if our code follows Clean Architecture"
Response approach:
1. Search for dependency violations with grep
2. Check that domain layer has no framework imports
3. Verify use cases only orchestrate, not contain logic
4. Check that entities have behavior, not just data

## Notes
- Golden Rule: Use Case orchestrates -> Entity contains rules -> Repository persists
- Never put business logic in Controller, Repository, or generic "Service"
- Domain layer must be testable without any infrastructure
- Use dependency injection to wire adapters to ports
