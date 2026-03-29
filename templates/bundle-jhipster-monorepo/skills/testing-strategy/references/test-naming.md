# Test Naming Conventions

## Pattern
```
test_should_<expected_result>_when_<condition>
```

## Examples
```
test_should_return_error_when_email_is_invalid
test_should_decompose_demand_when_status_is_created
test_should_reject_merge_when_conflicts_exist
test_should_allocate_agent_when_team_has_capacity
test_should_raise_exception_when_score_exceeds_100
test_should_complete_demand_when_all_tasks_done
```

## Java/JUnit Equivalent
```java
@Test
void shouldReturnErrorWhenEmailIsInvalid() { ... }

@Test
void shouldDecomposeDemandWhenStatusIsCreated() { ... }
```

## Test Structure (AAA Pattern)
```python
def test_should_decompose_new_demand(self):
    # Arrange
    demand = Demand(id=DemandId.generate(), description="Create CRUD")
    planner = FakePlanner(tasks=[Task(...), Task(...)])

    # Act
    tasks = demand.decompose(planner)

    # Assert
    assert len(tasks) == 2
    assert demand.status == DemandStatus.PLANNED
```

## Test Categories
| Category | Location | Dependencies | Speed |
|---|---|---|---|
| Unit (Domain) | tests/domain/ | None | Fast |
| Unit (Application) | tests/application/ | Mocked | Fast |
| Integration | tests/infrastructure/ | DB, Kafka | Medium |
| API/Controller | tests/api/ | Full stack | Medium |
| E2E | tests/e2e/ | Full system | Slow |

## Coverage Targets
- Domain logic: 90%+
- Application layer: 80%+
- Infrastructure: 70%+
- Overall minimum: 80%
