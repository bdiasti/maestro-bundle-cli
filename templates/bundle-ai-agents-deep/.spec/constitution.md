# Constitution — Deep Agent Project

## Principles

1. **Spec first, code later** — Every demand goes through the SDD flow before implementation
2. **Complete agent harness** — Every Deep Agent has: tools, system prompt, middleware, backend, checkpointer
3. **Subagents for isolation** — Specialized tasks go to subagents, never bloat the main agent
4. **Human-in-the-loop mandatory** — Destructive operations always require approval
5. **Skills on-demand** — Load knowledge when relevant, not at startup

## Development Standards

- Python 3.11+, type hints, Black + Ruff
- Tools with Pydantic schemas and clear descriptions
- System prompts versioned in code
- Checkpointer mandatory (MemorySaver dev, PostgresSaver prod)
- Explicit backend (never rely on the default StateBackend in prod)

## Quality Standards

- Evals with golden dataset before deploy
- Logging middleware on every agent
- Unit tests for tools and middleware
- Minimum coverage: 80%
