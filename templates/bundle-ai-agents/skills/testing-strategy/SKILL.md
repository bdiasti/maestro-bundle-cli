---
name: testing-strategy
description: Implement testing strategies with unit, integration, and e2e tests using Pytest or JUnit. Use when writing tests, defining test strategy, or improving test coverage.
version: 1.0.0
author: Maestro
---

# Testing Strategy

Implement the testing pyramid with domain unit tests, integration tests for repositories, and e2e tests for API endpoints, following consistent naming and fixture patterns.

## When to Use
- Writing tests for new features or bug fixes
- Setting up test infrastructure for a new project
- Improving test coverage on existing code
- Reviewing test quality and naming conventions
- Configuring CI/CD test pipelines

## Available Operations
1. Write unit tests for domain entities and value objects
2. Write integration tests for repositories and external services
3. Write e2e tests for API endpoints
4. Configure test fixtures and factories
5. Run tests and measure coverage
6. Set up test pipelines in CI/CD

## Multi-Step Workflow

### Step 1: Understand the Testing Pyramid

```
        /  E2E  \          Few, slow, expensive
       / Integr. \         Moderate count
      / Unit Tests \       Many, fast, cheap
```

- **Unit tests**: Test domain logic in isolation. No database, no HTTP, no external services.
- **Integration tests**: Test adapters (repositories, clients) against real infrastructure.
- **E2E tests**: Test full API request/response cycles.

### Step 2: Write Unit Tests for Domain Entities

Test business rules without any infrastructure dependency.

```python
# tests/domain/test_demand.py
import pytest

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
        demand = Demand(id=DemandId.generate(), description="Mega project")
        for i in range(20):
            demand.add_task(Task(...))

        with pytest.raises(TooManyTasksException):
            demand.add_task(Task(...))
```

### Step 3: Write Unit Tests for Value Objects

```python
# tests/domain/test_compliance_score.py
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

Test against a real database using fixtures with rollback.

```python
# tests/infrastructure/test_pg_demand_repository.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

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

### Step 5: Run Tests and Measure Coverage

```bash
# Run all tests
pytest tests/ -v

# Run only unit tests
pytest tests/domain/ -v

# Run only integration tests
pytest tests/infrastructure/ -v --timeout=30

# Run with coverage report
pytest tests/ --cov=src --cov-report=term-missing --cov-fail-under=80

# Run specific test file
pytest tests/domain/test_demand.py -v

# Run tests matching a pattern
pytest tests/ -k "test_should_decompose" -v
```

### Step 6: Set Up CI/CD Test Pipeline

```yaml
test:
  stage: test
  script:
    - pip install -r requirements-test.txt
    - pytest tests/domain/ -v --junitxml=reports/unit.xml
    - pytest tests/infrastructure/ -v --junitxml=reports/integration.xml --timeout=60
    - pytest tests/ --cov=src --cov-report=xml --cov-fail-under=80
  artifacts:
    reports:
      junit:
        - reports/*.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
```

## Resources
- `references/naming-conventions.md` - Test naming patterns and organization guidelines
- `references/fixture-patterns.md` - Common pytest fixture patterns and factories

## Examples

### Example 1: Write Tests for a New Feature
User asks: "Write tests for the new user registration feature."
Response approach:
1. Unit test the `User` entity: valid creation, email validation, password rules
2. Unit test the `RegisterUser` use case: happy path, duplicate email, invalid data
3. Integration test the `PgUserRepository`: save and find
4. E2e test the `POST /api/v1/users` endpoint: 201 on success, 422 on invalid data
5. Run: `pytest tests/ -v --cov=src`

### Example 2: Improve Test Coverage
User asks: "Our coverage is at 45%. Get it to 80%."
Response approach:
1. Run `pytest --cov=src --cov-report=term-missing` to find uncovered lines
2. Prioritize domain layer (business rules are the most valuable to test)
3. Add edge case tests for existing entities (error paths, boundary values)
4. Add integration tests for untested repositories
5. Skip e2e tests for now (lowest ROI per coverage point)
6. Target: domain 95%, application 85%, infrastructure 70%

### Example 3: Set Up Testing for a New Project
User asks: "Set up the test infrastructure for our new Python project."
Response approach:
1. Install dependencies: `pip install pytest pytest-cov pytest-asyncio`
2. Create `conftest.py` with database session fixtures
3. Create directory structure: `tests/domain/`, `tests/application/`, `tests/infrastructure/`, `tests/api/`
4. Add `pytest.ini` or `pyproject.toml` with test configuration
5. Create a sample test to verify the setup
6. Add test commands to Makefile or scripts

## Notes
- Follow the naming convention: `test_should_<result>_when_<condition>`
- Unit tests must run without any external dependencies (no DB, no HTTP)
- Use fakes/stubs for dependencies in unit tests, not mocks (fakes are more maintainable)
- Integration tests should roll back database changes after each test
- Coverage threshold: 80% minimum, but focus on testing business rules, not getters/setters
- Run unit tests first in CI (fast feedback), integration tests second, e2e last
- Each test should test one behavior -- avoid testing multiple things in a single test
