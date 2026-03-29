---
name: ddd-tactical
description: Implement DDD tactical patterns -- Entities, Value Objects, Aggregates, Domain Events, Repositories, and Domain Services. Use when modeling domain, creating rich entities, defining aggregates, or applying DDD patterns.
version: 1.0.0
author: Maestro
---

# DDD Tactical Patterns

Implement Domain-Driven Design tactical patterns including Entities, Value Objects, Aggregates, Domain Events, Repositories, and Domain Services.

## When to Use
- When modeling domain entities with rich behavior
- When creating value objects for validated types
- When defining aggregate boundaries and invariants
- When implementing domain events for cross-aggregate communication
- When business logic spans multiple entities (Domain Services)

## Available Operations
1. Create Value Objects with validation
2. Create Entities with identity and behavior
3. Define Aggregates with invariant protection
4. Implement Domain Events
5. Create Domain Services for cross-entity logic

## Multi-Step Workflow

### Step 1: Identify Value Objects
Value Objects are immutable, compared by value, and contain self-validation.

```python
@dataclass(frozen=True)
class Email:
    value: str

    def __post_init__(self):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', self.value):
            raise InvalidEmailException(self.value)

@dataclass(frozen=True)
class ComplianceScore:
    value: float

    def __post_init__(self):
        if not 0 <= self.value <= 100:
            raise ValueError("Score must be between 0 and 100")

    def is_passing(self) -> bool:
        return self.value >= 80.0

    def __str__(self) -> str:
        return f"{self.value:.1f}%"
```

### Step 2: Create Entities
Entities have unique identity, are mutable, and contain behavior.

```python
class Task:
    def __init__(self, id: TaskId, description: str, agent_type: AgentType):
        self._id = id
        self._description = description
        self._agent_type = agent_type
        self._status = TaskStatus.PENDING
        self._started_at: datetime | None = None
        self._completed_at: datetime | None = None

    def start(self) -> None:
        if self._status != TaskStatus.PENDING:
            raise TaskNotPendingException(self._id)
        self._status = TaskStatus.IN_PROGRESS
        self._started_at = datetime.now()

    def complete(self, result: TaskResult) -> None:
        if self._status != TaskStatus.IN_PROGRESS:
            raise TaskNotInProgressException(self._id)
        self._status = TaskStatus.COMPLETED
        self._completed_at = datetime.now()

    @property
    def duration(self) -> timedelta | None:
        if self._started_at and self._completed_at:
            return self._completed_at - self._started_at
        return None
```

### Step 3: Define Aggregates
An Aggregate is a cluster of entities with a root that protects invariants.

```python
class Demand:  # Aggregate Root
    """Demand is the root. Tasks are only accessed via Demand."""

    def add_task(self, task: Task) -> None:
        if len(self._tasks) >= 20:
            raise TooManyTasksException("Maximum 20 tasks per demand")
        self._tasks.append(task)

    def start_task(self, task_id: TaskId) -> None:
        task = self._find_task(task_id)
        # Invariant: no more than 3 concurrent tasks
        active = [t for t in self._tasks if t.status == TaskStatus.IN_PROGRESS]
        if len(active) >= 3:
            raise TooManyActiveTasksException()
        task.start()
```

### Step 4: Implement Domain Events
Domain Events notify that something happened in the domain.

```python
@dataclass(frozen=True)
class DomainEvent:
    occurred_at: datetime = field(default_factory=datetime.now)

@dataclass(frozen=True)
class TaskCompleted(DomainEvent):
    task_id: TaskId
    agent_id: AgentId
    branch_name: str
    duration_seconds: float

@dataclass(frozen=True)
class ComplianceViolationDetected(DomainEvent):
    agent_id: AgentId
    bundle_name: str
    violations: list[str]
    severity: str  # "warning" | "critical"
```

### Step 5: Create Domain Services
For logic that does not belong to a single entity.

```python
class TeamRecruitmentService:
    def recruit_for_demand(self, demand: Demand, available: list[Agent]) -> AgentTeam:
        complexity = demand.assess_complexity()
        required = self._determine_roles(complexity)
        team = AgentTeam()
        for role in required:
            agent = next((a for a in available if a.type == role and a.is_available), None)
            if not agent:
                raise NoAvailableAgentException(role)
            team.add(agent)
        return team
```

### Step 6: Write Tests for Domain Logic

```bash
# Run domain unit tests (no infrastructure dependencies)
pytest tests/domain/ -v

# For Java/JUnit
./mvnw test -Dtest="*DomainTest,*ValueObjectTest"
```

```python
class TestComplianceScore:
    def test_passing_score(self):
        score = ComplianceScore(85.0)
        assert score.is_passing() is True

    def test_invalid_score_raises(self):
        with pytest.raises(ValueError):
            ComplianceScore(150.0)
```

## Resources
- `references/ddd-patterns.md` - DDD pattern decision guide and examples

## Examples
### Example 1: Create a Value Object
User asks: "Create a value object for email validation"
Response approach:
1. Create immutable dataclass/record with validation in constructor
2. Add behavior methods (e.g., `domain()`, `is_corporate()`)
3. Ensure equality by value, not reference
4. Write unit tests for valid and invalid cases

### Example 2: Define an Aggregate
User asks: "Model a Demand that contains Tasks with business rules"
Response approach:
1. Make Demand the Aggregate Root
2. Tasks are only accessed through Demand methods
3. Add invariants: max tasks, max concurrent, completion rules
4. Emit domain events on state changes
5. Write tests for each invariant

### Example 3: Implement a Domain Service
User asks: "I need logic that involves both Demands and Agents"
Response approach:
1. Create a Domain Service (not a generic "Service")
2. Accept entities as parameters, not IDs
3. Implement the cross-entity logic
4. Return results, let the use case persist
5. Write tests with test doubles for entities

## Notes
- Priority for placing business rules:
  1. **Value Object** -- validation and simple behavior
  2. **Entity** -- rules involving entity state
  3. **Domain Service** -- rules involving multiple entities
  4. **Use Case** -- orchestration only (NO business rules)
- Aggregates should be small -- prefer separate aggregates connected by ID
- Domain Events are immutable records of what happened
- Domain layer must have zero framework dependencies
