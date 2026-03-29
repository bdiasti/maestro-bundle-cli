# Fixture Patterns Reference

## Database Session Fixture (with rollback)

```python
@pytest.fixture
def db_session():
    engine = create_engine(TEST_DATABASE_URL)
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()
```

## Factory Fixtures

```python
@pytest.fixture
def make_demand():
    def _make(
        description: str = "Test demand",
        status: DemandStatus = DemandStatus.CREATED,
    ) -> Demand:
        return Demand(
            id=DemandId.generate(),
            description=description,
            status=status,
        )
    return _make

# Usage in test
def test_something(make_demand):
    demand = make_demand(description="Custom demand")
```

## Async Fixtures

```python
@pytest.fixture
async def async_client(app):
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
```

## Fake Implementations

```python
class FakeDemandRepository(DemandRepository):
    def __init__(self):
        self._demands: dict[str, Demand] = {}

    def find_by_id(self, id: DemandId) -> Demand:
        demand = self._demands.get(str(id))
        if not demand:
            raise DemandNotFoundException(id)
        return demand

    def save(self, demand: Demand) -> None:
        self._demands[str(demand.id)] = demand

class FakeEventBus(EventBus):
    def __init__(self):
        self.published_events: list[DomainEvent] = []

    def publish(self, event: DomainEvent) -> None:
        self.published_events.append(event)
```

## Fixture Scoping

| Scope | Lifecycle | Use For |
|---|---|---|
| `function` (default) | Each test | Most fixtures |
| `class` | Each test class | Shared setup within a class |
| `module` | Each test file | Expensive setup (DB schema) |
| `session` | Entire test run | One-time setup (create DB) |
