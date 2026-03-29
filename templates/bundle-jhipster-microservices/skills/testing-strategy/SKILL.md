---
name: testing-strategy
description: Implement testing strategy with unit, integration, and e2e tests using Pytest or JUnit. Use when writing tests, defining test strategy, improving coverage, or setting up test infrastructure.
version: 1.0.0
author: Maestro
---

# Testing Strategy

Implement a comprehensive testing strategy following the test pyramid with unit tests for domain logic, integration tests for infrastructure, and e2e tests for critical flows.

## When to Use
- When writing tests for new features
- When defining the test strategy for a module
- When improving test coverage
- When setting up test infrastructure (fixtures, factories)
- When reviewing test quality

## Available Operations
1. Write unit tests for domain entities and value objects
2. Write integration tests for repositories
3. Write API integration tests for controllers
4. Set up test fixtures and factories
5. Run tests with coverage reporting

## Multi-Step Workflow

### Step 1: Understand the Test Pyramid

```
        /  E2E  \          Few, slow, expensive
       /  Integr. \        Moderate
      / Unit Tests  \      Many, fast, cheap
```

### Step 2: Write Unit Tests for Domain Logic
Test business rules without infrastructure dependencies.

```python
# tests/domain/test_demand.py
class TestDemand:
    def test_should_decompose_new_demand(self):
        demand = Demand(id=DemandId.generate(), description="Create CRUD")
        planner = FakePlanner(tasks=[Task(...), Task(...)])

        tasks = demand.decompose(planner)

        assert len(tasks) == 2
        assert demand.status == DemandStatus.PLANNED

    def test_should_reject_decompose_if_already_planned(self):
        demand = Demand(id=DemandId.generate(), description="Create CRUD")
        demand.decompose(FakePlanner(tasks=[Task(...)]))

        with pytest.raises(DemandAlreadyDecomposedException):
            demand.decompose(FakePlanner(tasks=[]))

    def test_should_not_allow_more_than_20_tasks(self):
        demand = Demand(id=DemandId.generate(), description="Large project")
        for i in range(20):
            demand.add_task(Task(...))

        with pytest.raises(TooManyTasksException):
            demand.add_task(Task(...))
```

### Step 3: Write Unit Tests for Value Objects

```python
class TestComplianceScore:
    def test_passing_score(self):
        score = ComplianceScore(85.0)
        assert score.is_passing() is True

    def test_failing_score(self):
        score = ComplianceScore(60.0)
        assert score.is_passing() is False

    def test_invalid_score_raises(self):
        with pytest.raises(ValueError):
            ComplianceScore(150.0)
```

### Step 4: Write Integration Tests for Repositories

```python
# tests/infrastructure/test_pg_demand_repository.py
@pytest.fixture
def db_session():
    engine = create_engine(TEST_DATABASE_URL)
    with Session(engine) as session:
        yield session
        session.rollback()

class TestPgDemandRepository:
    def test_should_save_and_find_demand(self, db_session):
        repo = PgDemandRepository(db_session)
        demand = Demand(id=DemandId.generate(), description="Test")

        repo.save(demand)
        found = repo.find_by_id(demand.id)

        assert found.description == "Test"
```

### Step 5: Run Tests with Coverage

```bash
# Python with Pytest
pytest --cov=src --cov-report=html --cov-fail-under=80
pytest tests/domain/ -v          # Unit tests only
pytest tests/infrastructure/ -v  # Integration tests only

# Java with Maven
./mvnw test                                    # All tests
./mvnw test -Dtest="*DomainTest"              # Domain tests only
./mvnw test -Dtest="*RepositoryIT"            # Repository integration tests
./mvnw test -Dtest="*ResourceIT"              # API integration tests
./mvnw verify -Pcoverage                       # With coverage report

# Angular
npm test                        # Unit tests
npm run test -- --code-coverage # With coverage
npm run e2e                     # End-to-end tests
```

### Step 6: Review Coverage Report

```bash
# Python
open htmlcov/index.html

# Java (JaCoCo)
open target/site/jacoco/index.html

# Angular
open coverage/index.html
```

## Resources
- `references/test-naming.md` - Test naming conventions and patterns

## Examples
### Example 1: Test a New Entity
User asks: "Write tests for the Demand entity"
Response approach:
1. Test happy path: create, decompose, complete
2. Test invariants: max tasks, status transitions
3. Test edge cases: empty description, null values
4. Use `test_should_<result>_when_<condition>` naming
5. Run `pytest tests/domain/test_demand.py -v`

### Example 2: Test a Repository
User asks: "Write integration tests for the DemandRepository"
Response approach:
1. Set up test database fixture with rollback
2. Test save and find operations
3. Test query methods (findByStatus, etc.)
4. Test not-found scenarios
5. Run `pytest tests/infrastructure/ -v`

### Example 3: Improve Test Coverage
User asks: "Our coverage is at 60%, we need 80%"
Response approach:
1. Run `pytest --cov=src --cov-report=html` to see uncovered lines
2. Identify untested domain logic (highest priority)
3. Write tests for uncovered business rules first
4. Then cover integration points
5. Verify with `pytest --cov-fail-under=80`

## Notes
- Test naming convention: `test_should_<result>_when_<condition>`
- Domain tests should have ZERO infrastructure dependencies
- Integration tests should use rollback to avoid polluting the database
- Minimum coverage target: 80% for business logic
- Use fakes/stubs for domain tests, real implementations for integration tests
