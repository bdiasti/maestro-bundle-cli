# Project: Deep Agent (Claude Code-like)

You are building a Deep Agent — an autonomous AI agent that can plan, execute tasks, manage files, delegate to subagents, and interact with the user. Similar to Claude Code, Cursor Agent, or Codex. Built with the LangChain Deep Agents framework.

## Specification-Driven Development (SDD)

The fundamental SDD rule is defined in the bundle-base (base AGENTS.md) and is non-negotiable:
**No spec, no code. No exception.** The agent must refuse to implement any demand that
has not gone through the `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` flow.

If the user asks to code something without a spec, STOP and initiate the SDD flow first.
Check `.specify/specs/` to verify if a spec already exists for the demand.

## Product Requirements Document

The `PRD.md` file at the project root contains the product requirements defined by the analyst/dev. Consult it to understand WHAT to build. This AGENTS.md defines HOW the agent should work; the PRD defines WHAT should be built.

- `PRD.md` — Product requirements, user stories, API spec, data model

## Project Stack

- **Language:** Python 3.11+
- **Framework:** Deep Agents SDK (`deepagents`)
- **Execution:** LangGraph (under the hood)
- **Models:** Claude (Anthropic), GPT (OpenAI), Gemini (Google), Ollama (local)
- **Backends:** StateBackend, FilesystemBackend, StoreBackend, LocalShellBackend, Sandboxes
- **API:** FastAPI (to serve the agent as an API)
- **Observability:** LangSmith or Langfuse
- **Tests:** Pytest + custom evals

## Project Structure

```
src/
├── agent/                      # Main Deep Agent definition
│   ├── main.py                 # create_deep_agent + configuration
│   ├── tools.py                # Custom tools
│   ├── subagents.py            # Subagent definitions
│   ├── middleware.py            # Custom middleware
│   └── prompts.py              # Versioned system prompts
├── skills/                     # Skills the agent can load
│   ├── code-review/SKILL.md
│   ├── deploy/SKILL.md
│   └── ...
├── backends/                   # Backend configuration
│   ├── filesystem.py
│   ├── store.py
│   └── composite.py
├── api/                        # Serve agent as API (optional)
│   ├── server.py               # FastAPI
│   └── websocket.py            # Streaming via WebSocket
├── evals/                      # Agent evaluation
│   ├── golden_dataset.json
│   ├── evaluators.py
│   └── run_evals.py
└── config/
    ├── settings.py
    └── models.py
```

## Code Standards

- Maximum 500 lines per file, 20 lines per function
- Type hints on public functions
- f-strings, Black + Ruff
- Descriptive names, guard clauses
- Handle exceptions with specific types

## Deep Agent Standards

- System prompts versioned in `prompts.py`, never hardcoded
- Tools with Pydantic schemas and clear descriptions
- Each subagent has ONE responsibility
- Human-in-the-loop for destructive operations (delete, deploy, email)
- Timeout and max_iterations on every agent
- Checkpointer mandatory for state persistence
- Explicit backend (never rely on the default in production)
- Skills loaded on-demand, never all in the system prompt

## Mandatory Middleware

The Deep Agent comes with default middleware that should not be disabled:
- **TodoListMiddleware** — Task planning
- **FilesystemMiddleware** — File management
- **SubAgentMiddleware** — Delegation to subagents
- **SummarizationMiddleware** — Context compression

## Git

- Commits: `feat(agent): add semantic search tool`
- Branches: `feature/<component>-<description>`
- Never commit API keys, .env

## Tests

- Unit tests for tools and middleware
- Integration tests for the full agent
- Evals with golden dataset + LLM-as-judge
- Minimum coverage: 80%

## References

- `references/deep-agents-api.md` — Deep Agents SDK API reference
- `references/backends-guide.md` — Backends guide and when to use each one
- `references/middleware-guide.md` — Default and custom middleware
