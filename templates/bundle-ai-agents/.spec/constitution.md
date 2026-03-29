# Constitution — AI Agents Project

## Principles

1. **Spec first, code later** — Every demand goes through the SDD flow before implementation
2. **Governed agent** — Every agent follows its AGENTS.md and skills, no "vibing coding"
3. **Observable** — Every agent execution is traced in Langfuse
4. **Evaluable** — Every agent has evals with golden dataset before going to production
5. **Context-aware** — Manage context window with the 4 strategies (Write, Select, Compress, Isolate)

## Development Standards

- Clean Architecture to separate domain from infrastructure
- Rich entities with behavior (not anemic)
- Value Objects for validation
- Tests: >= 80% coverage, evals for agents
- Python 3.11+, type hints, Black + Ruff

## Agent Standards

- System prompts versioned, never hardcoded
- Tools with Pydantic schemas
- Human-in-the-loop for destructive operations
- Timeout and iteration limits on loops
- Long-term memory via LangGraph Store

## Quality Standards

- Code review mandatory
- Commits follow Conventional Commits
- Branches follow feature/fix/hotfix strategy
- Never commit secrets
- Rate limiting on all APIs
