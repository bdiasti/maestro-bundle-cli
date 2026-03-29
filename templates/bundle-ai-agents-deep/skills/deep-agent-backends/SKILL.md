---
name: deep-agent-backends
description: Configure Deep Agent backends (StateBackend, FilesystemBackend, StoreBackend, LocalShellBackend, CompositeBackend, Sandboxes). Use when choosing storage, configuring file access, or setting up persistent state.
version: 1.0.0
author: Maestro
---

# Deep Agent Backends

Configure how your Deep Agent stores files and manages context. Backends determine where files live — in memory, on disk, in a database, or in a sandbox.

## When to Use
- When choosing between ephemeral vs persistent storage
- When the agent needs local filesystem access
- When you need shell execution capability
- When routing different paths to different storage
- When running in sandboxed environments (Modal, Daytona)

## Available Operations
1. Use StateBackend (ephemeral, default)
2. Use FilesystemBackend (local disk)
3. Use StoreBackend (persistent, cross-thread)
4. Use LocalShellBackend (filesystem + shell)
5. Use CompositeBackend (route paths to backends)
6. Use Sandboxes (isolated execution)

## Multi-Step Workflow

### Step 1: Choose Your Backend

| Backend | Persistence | Shell | Use when |
|---|---|---|---|
| StateBackend | Ephemeral (1 thread) | No | Prototyping, stateless tasks |
| FilesystemBackend | Local disk | No | Read/write project files |
| StoreBackend | DB (cross-thread) | No | Persistent memory, multi-session |
| LocalShellBackend | Local disk | Yes | Full coding agent (like Claude Code) |
| CompositeBackend | Mixed | Mixed | Different storage per path |
| Sandboxes | Isolated | Yes | Untrusted code execution |

### Step 2: StateBackend (Default)

```python
from deepagents import create_deep_agent

# Uses StateBackend automatically — files live in memory, gone after session
agent = create_deep_agent(model="anthropic:claude-sonnet-4-6")
```

### Step 3: FilesystemBackend (Local Files)

```python
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    backend=FilesystemBackend(root_dir=".", virtual_mode=True)
)
# Agent can now read/write files in the project directory
```

### Step 4: LocalShellBackend (Full Coding Agent)

```python
from deepagents import create_deep_agent
from deepagents.backends import LocalShellBackend

# WARNING: Agent can execute shell commands on your machine
agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    backend=LocalShellBackend(
        root_dir=".",
        env={"PATH": "/usr/bin:/bin", "HOME": "/home/user"}
    )
)
# Agent can now: read/write files, run shell commands, install packages
```

### Step 5: StoreBackend (Persistent Memory)

```python
from deepagents import create_deep_agent
from deepagents.backends import StoreBackend
from langgraph.store.memory import InMemoryStore
# Or for real persistence:
# from langgraph.store.postgres import PostgresStore

store = InMemoryStore()

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    backend=lambda rt: StoreBackend(rt),
    store=store  # Required for StoreBackend
)
```

### Step 6: CompositeBackend (Route by Path)

```python
from deepagents import create_deep_agent
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
from langgraph.store.memory import InMemoryStore

composite = lambda rt: CompositeBackend(
    default=StateBackend(rt),          # Everything else: ephemeral
    routes={
        "/memories/": StoreBackend(rt), # Memories: persistent
    }
)

agent = create_deep_agent(
    backend=composite,
    store=InMemoryStore()
)
```

### Step 7: Verify

```bash
python -c "
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend

agent = create_deep_agent(
    backend=FilesystemBackend(root_dir='.', virtual_mode=True)
)
result = agent.invoke({
    'messages': [{'role': 'user', 'content': 'List files in the current directory'}]
})
print(result['messages'][-1].content)
"
```

## Resources
- `references/backends-guide.md` — Detailed backend comparison and configuration

## Examples

### Example 1: Coding Agent with File Access
User asks: "Create an agent that can edit my project files"
Response approach:
1. Use `FilesystemBackend(root_dir=".", virtual_mode=True)`
2. Agent gets `ls`, `read_file`, `write_file`, `edit_file` tools
3. Test with "list files" command

### Example 2: Agent with Persistent Memory
User asks: "Agent should remember things across sessions"
Response approach:
1. Use `CompositeBackend` with `StoreBackend` for `/memories/`
2. Set up PostgresStore for production
3. Agent writes to `/memories/` for long-term storage

### Example 3: Full Coding Agent (like Claude Code)
User asks: "Build an agent that can run tests and install packages"
Response approach:
1. Use `LocalShellBackend(root_dir=".")`
2. Agent gets shell execution + file access
3. Add safety: limit commands, use virtual env

## Notes
- StateBackend is ephemeral — files are gone after the session
- FilesystemBackend `virtual_mode=True` is safer (sandboxed paths)
- LocalShellBackend gives full shell access — use with caution
- StoreBackend REQUIRES a `store` parameter
- CompositeBackend is the production choice (ephemeral default + persistent memory)
