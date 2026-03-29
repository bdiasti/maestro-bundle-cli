---
name: deep-agent-memory
description: Configure persistent memory for Deep Agents using AGENTS.md and LangGraph Store. Use when the agent needs to remember context across sessions, persist learnings, or maintain long-term knowledge.
version: 1.0.0
author: Maestro
---

# Deep Agent Memory

Give your Deep Agent persistent memory that survives across sessions using AGENTS.md files and LangGraph Store.

## When to Use
- When the agent should remember context between sessions
- When loading project-specific knowledge at startup
- When persisting learnings across threads
- When configuring AGENTS.md for persistent context

## Available Operations
1. Load AGENTS.md as persistent context
2. Configure LangGraph Store for cross-thread memory
3. Use CompositeBackend for memory routing
4. Persist agent learnings

## Multi-Step Workflow

### Step 1: AGENTS.md as Memory

```python
from deepagents import create_deep_agent
from deepagents.backends.utils import create_file_data
from langgraph.checkpoint.memory import MemorySaver

agents_md = """
# Project Context

## Architecture
This project uses Clean Architecture with Python FastAPI.

## Conventions
- Use Pydantic for all DTOs
- Pytest for testing
- Ruff for linting
"""

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    memory=["/AGENTS.md"],
    checkpointer=MemorySaver()
)

result = agent.invoke(
    {
        "messages": [{"role": "user", "content": "What architecture do we use?"}],
        "files": {"/AGENTS.md": create_file_data(agents_md)}
    },
    config={"configurable": {"thread_id": "session-1"}}
)
```

### Step 2: Persistent Store Memory

```python
from deepagents import create_deep_agent
from deepagents.backends import StoreBackend
from langgraph.store.postgres import PostgresStore
from langgraph.checkpoint.postgres import PostgresSaver

# Production: PostgreSQL for both
store = PostgresStore(conn_string="postgresql://user:pass@localhost/agents")
checkpointer = PostgresSaver(conn_string="postgresql://user:pass@localhost/agents")

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    backend=lambda rt: StoreBackend(rt),
    store=store,
    checkpointer=checkpointer,
    memory=["/AGENTS.md"]
)
```

### Step 3: CompositeBackend with Memory

```python
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend

composite = lambda rt: CompositeBackend(
    default=StateBackend(rt),
    routes={
        "/memories/": StoreBackend(rt),   # Long-term memory: persistent
        "/workspace/": StateBackend(rt),   # Working files: ephemeral
    }
)

agent = create_deep_agent(
    backend=composite,
    store=InMemoryStore()
)
# Agent writes to /memories/ for things it wants to remember
# Agent writes to /workspace/ for temporary work
```

### Step 4: Consistent Thread IDs

```python
# Same thread_id = same conversation context
config = {"configurable": {"thread_id": f"project-{project_id}"}}

# First invocation
agent.invoke({"messages": [msg1]}, config=config)

# Later invocation — agent remembers the first one
agent.invoke({"messages": [msg2]}, config=config)
```

### Step 5: Verify

```bash
python -c "
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver

agent = create_deep_agent(checkpointer=MemorySaver())
config = {'configurable': {'thread_id': 'test-memory'}}

# First message
agent.invoke({'messages': [{'role': 'user', 'content': 'My name is João'}]}, config=config)

# Second message — should remember
result = agent.invoke({'messages': [{'role': 'user', 'content': 'What is my name?'}]}, config=config)
print(result['messages'][-1].content)
"
```

## Resources
- `references/memory-patterns.md` — Memory architecture patterns

## Examples

### Example 1: Project Context Memory
User asks: "Agent should know our project conventions"
Response approach:
1. Write AGENTS.md with conventions
2. Pass via `memory=["/AGENTS.md"]`
3. Agent loads it every session

### Example 2: Learning Memory
User asks: "Agent should remember what worked in previous sessions"
Response approach:
1. Use CompositeBackend with StoreBackend for `/memories/`
2. Agent writes learnings to `/memories/`
3. Next session, agent reads from `/memories/`

## Notes
- `checkpointer` is REQUIRED for memory to persist
- AGENTS.md follows the agents.md standard (https://agents.md/)
- Use PostgresStore for production, InMemoryStore for dev
- Thread ID determines conversation scope
- Memory files are loaded at session start
