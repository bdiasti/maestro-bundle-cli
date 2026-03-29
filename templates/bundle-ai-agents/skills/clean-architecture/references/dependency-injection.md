# Dependency Injection Reference

## FastAPI Dependency Injection

```python
# infrastructure/dependencies.py
from fastapi import Depends
from sqlalchemy.orm import Session

def get_db_session() -> Session:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def get_demand_repository(session: Session = Depends(get_db_session)) -> DemandRepository:
    return PgDemandRepository(session)

def get_decompose_demand(
    repo: DemandRepository = Depends(get_demand_repository),
    planner: TaskPlanner = Depends(get_task_planner),
    event_bus: EventBus = Depends(get_event_bus),
) -> DecomposeDemand:
    return DecomposeDemand(repo=repo, planner=planner, event_bus=event_bus)
```

## Usage in Controller

```python
@router.post("/demands/{demand_id}/decompose")
async def decompose_demand(
    demand_id: str,
    use_case: DecomposeDemand = Depends(get_decompose_demand),
):
    return use_case.execute(demand_id)
```

## Testing with Fakes

```python
# In tests, inject fakes instead of real implementations
def test_decompose_demand():
    repo = FakeDemandRepository()
    planner = FakePlanner(tasks=[Task(...)])
    event_bus = FakeEventBus()

    use_case = DecomposeDemand(repo=repo, planner=planner, event_bus=event_bus)
    result = use_case.execute("demand-123")

    assert len(result.tasks) == 1
    assert len(event_bus.published_events) == 1
```

## Principle

- Controllers depend on use cases (via interface).
- Use cases depend on repository interfaces (ports).
- Infrastructure provides concrete implementations (adapters).
- Tests inject fakes that implement the same interfaces.
