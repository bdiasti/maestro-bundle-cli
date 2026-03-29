---
name: memory-management
description: Implement short-term, medium-term, and long-term memory for AI agents using LangGraph Store and checkpointers. Use when agents need to remember past interactions, persist state, or learn from previous executions.
version: 1.0.0
author: Maestro
---

# Memory Management

Implement three tiers of agent memory -- short-term (context window), medium-term (checkpointer), and long-term (store) -- to enable persistent learning and state management.

## When to Use
- Agent needs to resume work after interruption
- Agent should learn from past executions and avoid repeating mistakes
- Persisting state between nodes in a LangGraph workflow
- Storing and retrieving patterns learned across multiple demands
- Implementing memory decay to remove stale or low-confidence knowledge

## Available Operations
1. Configure short-term memory via context window
2. Set up medium-term memory with LangGraph checkpointer
3. Implement long-term memory with LangGraph Store
4. Integrate memory into Deep Agent configuration
5. Implement memory cleanup and decay policies

## Multi-Step Workflow

### Step 1: Set Up Short-Term Memory (Context Window)

Short-term memory is automatic -- LangGraph accumulates messages within a session.

```python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]  # Accumulates automatically
```

No additional setup needed. Messages persist for the duration of a single invocation chain.

### Step 2: Set Up Medium-Term Memory (Checkpointer)

Persists graph state between invocations of the same demand. Enables resume after failure.

```bash
pip install langgraph-checkpoint-postgres psycopg
```

```python
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langgraph.graph import StateGraph

checkpointer = AsyncPostgresSaver.from_conn_string(DATABASE_URL)

graph = StateGraph(OrchestratorState)
# ... define nodes and edges ...
app = graph.compile(checkpointer=checkpointer)

# Use consistent thread_id per demand
config = {"configurable": {"thread_id": f"demand-{demand_id}"}}
result = await app.ainvoke({"messages": [...]}, config=config)

# Next invocation with same thread_id resumes from saved state
result2 = await app.ainvoke({"messages": [new_msg]}, config=config)
```

Verify checkpointer is working:

```bash
psql $DATABASE_URL -c "SELECT thread_id, created_at FROM checkpoints ORDER BY created_at DESC LIMIT 5;"
```

### Step 3: Set Up Long-Term Memory (Store)

Persists knowledge across different demands. The agent remembers patterns, preferences, and learnings.

```bash
pip install langgraph-store-postgres
```

```python
from langgraph.store.postgres import AsyncPostgresStore

store = AsyncPostgresStore.from_conn_string(DATABASE_URL)

# Save a learned pattern
await store.aput(
    namespace=("agent", "backend", "patterns"),
    key="spring-crud-pattern",
    value={
        "pattern": "Use record for DTO, entity for domain",
        "learned_from": "demand-123",
        "confidence": 0.95,
        "created_at": "2026-03-27"
    }
)

# Search for relevant learnings
results = await store.asearch(
    namespace=("agent", "backend", "patterns"),
    query="how to create DTO for REST API",
    limit=5
)
```

### Step 4: Integrate Memory into Deep Agent

Wire all three memory tiers into a Deep Agent configuration.

```python
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.store.postgres import PostgresStore

agent = create_deep_agent(
    model="claude-sonnet-4-5-20250929",
    backend=FilesystemBackend(root_dir=".", virtual_mode=True),
    checkpointer=PostgresSaver(conn_string=DATABASE_URL),
    store=PostgresStore(conn_string=DATABASE_URL),
    system_prompt="You are a backend agent..."
)
```

### Step 5: Implement Memory Cleanup and Decay

Memories age. Remove stale or low-confidence entries to keep the store relevant.

```python
from datetime import datetime, timedelta

async def cleanup_stale_memories(store, max_age_days: int = 90):
    """Remove old or low-confidence memories."""
    cutoff = datetime.now() - timedelta(days=max_age_days)
    memories = await store.alist(namespace=("agent",))
    removed = 0
    for mem in memories:
        if mem.value.get("created_at", "") < cutoff.isoformat():
            await store.adelete(namespace=mem.namespace, key=mem.key)
            removed += 1
        elif mem.value.get("confidence", 1.0) < 0.3:
            await store.adelete(namespace=mem.namespace, key=mem.key)
            removed += 1
    return removed
```

Run cleanup:

```bash
python -m memory.cleanup --max-age-days 90 --min-confidence 0.3
```

## Resources
- `references/memory-tiers.md` - Detailed comparison of memory tiers with use cases
- `references/namespace-conventions.md` - Naming conventions for store namespaces

## Examples

### Example 1: Enable Resume After Failure
User asks: "Our agent crashes mid-task and loses all progress. Fix it."
Response approach:
1. Add PostgresSaver checkpointer to the agent's graph compilation
2. Use `thread_id` based on the demand ID for consistent state
3. On restart, invoke with the same thread_id -- LangGraph automatically resumes
4. Verify with: `psql $DATABASE_URL -c "SELECT * FROM checkpoints WHERE thread_id='demand-xyz';"`

### Example 2: Agent Should Learn From Past Work
User asks: "The backend agent keeps making the same pagination mistake. Make it learn."
Response approach:
1. After each successful demand, save patterns to the Store
2. Before each new task, search the Store for relevant learnings
3. Inject top-3 relevant learnings into the agent's context
4. Track confidence scores -- boost on positive feedback, decay on negative

### Example 3: Clean Up Old Memories
User asks: "The memory store has grown too large. Clean it up."
Response approach:
1. Run `memory.cleanup --max-age-days 90` to remove entries older than 90 days
2. Remove entries with confidence below 0.3
3. Audit remaining entries for duplicates
4. Set up a weekly cron job for automatic cleanup

## Notes
- Always use `thread_id` based on a stable identifier (demand_id, session_id)
- Checkpointer handles resume automatically -- no custom logic needed
- Store namespaces should follow the convention: `("agent", agent_type, category)`
- Memory cleanup should run on a schedule (weekly recommended)
- Include `confidence` and `created_at` in all store entries for decay management
- Long-term memories should be surfaced via retrieval, not dumped into the prompt
