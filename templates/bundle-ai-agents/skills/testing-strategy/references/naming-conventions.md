# Test Naming Conventions Reference

## Test Method Naming

```
test_should_<expected_result>_when_<condition>
```

### Examples

```python
# Good names
test_should_return_error_when_email_is_invalid
test_should_decompose_demand_when_status_is_created
test_should_reject_merge_when_conflicts_exist
test_should_create_user_when_data_is_valid
test_should_raise_not_found_when_id_does_not_exist

# Bad names
test_demand()          # What about demand?
test_error()           # What error? When?
test_create()          # Create what? Under what condition?
test_1()               # Meaningless
```

## Test Class Naming

```python
class TestDemand:           # Domain entity tests
class TestDecomposeDemand:  # Use case tests
class TestPgDemandRepository:  # Repository integration tests
class TestDemandEndpoints:  # API e2e tests
```

## File Organization

```
tests/
  domain/
    test_demand.py
    test_task.py
    test_compliance_score.py
  application/
    test_decompose_demand.py
    test_create_demand.py
  infrastructure/
    test_pg_demand_repository.py
    test_pg_task_repository.py
  api/
    test_demand_endpoints.py
    test_task_endpoints.py
  conftest.py              # Shared fixtures
```

## Test Structure (AAA Pattern)

```python
def test_should_decompose_demand_when_status_is_created(self):
    # Arrange
    demand = Demand(id=DemandId.generate(), description="Create CRUD")
    planner = FakePlanner(tasks=[Task(...)])

    # Act
    tasks = demand.decompose(planner)

    # Assert
    assert len(tasks) == 1
    assert demand.status == DemandStatus.PLANNED
```
