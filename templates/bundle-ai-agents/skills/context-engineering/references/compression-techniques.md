# Compression Techniques Reference

## Technique 1: Code Skeleton

Keep signatures and types, remove implementation details.

**Before** (450 tokens):
```python
class DemandRepository:
    def __init__(self, session: Session):
        self._session = session

    def find_by_id(self, id: DemandId) -> Demand:
        model = self._session.query(DemandModel).filter_by(id=str(id)).first()
        if not model:
            raise DemandNotFoundException(id)
        return Demand(
            id=DemandId(model.id),
            description=model.description,
            status=DemandStatus(model.status),
        )

    def save(self, demand: Demand) -> None:
        model = DemandModel(
            id=str(demand.id),
            description=demand.description,
            status=demand.status.value,
        )
        self._session.merge(model)
        self._session.commit()
```

**After** (120 tokens):
```python
class DemandRepository:
    def __init__(self, session: Session): ...
    def find_by_id(self, id: DemandId) -> Demand: ...  # raises DemandNotFoundException
    def save(self, demand: Demand) -> None: ...  # merges and commits
```

## Technique 2: Summary with Key Facts

For documentation, extract bullet points instead of full text.

**Before**: 500-word architecture document.
**After**: 5 bullet points with the critical decisions.

## Technique 3: History Trimming

Keep only the last N messages, or summarize older messages.

```python
def trim_history(messages: list, max_messages: int = 10) -> list:
    if len(messages) <= max_messages:
        return messages
    # Keep system message + last N messages
    return [messages[0]] + messages[-max_messages:]
```

## Technique 4: Selective File Loading

Load only the files the agent will interact with, not the entire directory.

```python
def select_files(task_description: str, file_index: dict) -> list[str]:
    # Use embedding similarity to find relevant files
    relevant = retriever.invoke(task_description)
    return [f.metadata["path"] for f in relevant[:5]]
```

## When NOT to Compress

- Code the agent is about to modify (needs full context)
- Error messages and stack traces (details matter)
- Test files being debugged
- Configuration files being updated
