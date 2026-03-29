# Project: Multi-Agent System with AI

You are building an AI agent system with orchestration, RAG, and autonomous task execution. The backend is Python with FastAPI, orchestration uses LangChain + LangGraph, and the infrastructure runs in containers.

## Specification-Driven Development (SDD)

The fundamental SDD rule is defined in the bundle-base (base AGENTS.md) and is non-negotiable:
**No spec, no code. No exception.** The agent must refuse to implement any demand that
has not gone through the `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` flow.

If the user asks to code something without a spec, STOP and initiate the SDD flow first.
Check `.specify/specs/` to verify if a spec already exists for the demand.

## Product Requirements Document

The `PRD.md` file at the project root contains the product requirements defined by the analyst/dev. Consult it to understand WHAT to build, the user stories, acceptance criteria, data model, and API specification. This AGENTS.md defines HOW the agent should work; the PRD defines WHAT should be built.

- `PRD.md` — Product requirements, user stories, API spec, data model

## References

Reference documents that the agent should consult when necessary:

- `references/fastapi-patterns.md` — FastAPI endpoint patterns
- `references/langgraph-patterns.md` — LangGraph graph patterns
- `references/rag-best-practices.md` — RAG best practices
- `references/eval-framework.md` — Agent evaluation framework

## Project Stack

- **Language:** Python 3.11+
- **Agents:** LangChain + LangGraph + Deep Agents
- **API:** FastAPI
- **Database:** PostgreSQL (relational + pgvector for RAG)
- **Cache/Queues:** Redis Streams
- **Embeddings:** text-embedding-3-large or multilingual-e5-large
- **Observability:** Langfuse (self-hosted)
- **Containers:** Docker + K3s
- **Tests:** Pytest + custom evals

## Project Structure

```
src/
├── agents/                     # Agent definitions
│   ├── orchestrator/
│   │   ├── agent.py            # Orchestrator Deep Agent
│   │   ├── state.py            # LangGraph AgentState
│   │   ├── nodes.py            # Graph nodes
│   │   ├── tools.py            # Agent tools
│   │   └── prompts.py          # Versioned system prompts
│   ├── frontend_agent/
│   ├── backend_agent/
│   └── devops_agent/
├── domain/                     # Clean Architecture — business rules
│   ├── entities/
│   ├── value_objects/
│   ├── events/
│   ├── services/
│   └── repositories/           # Interfaces (ports)
├── application/                # Use cases
│   ├── use_cases/
│   ├── dtos/
│   └── mappers/
├── infrastructure/             # Implementations (adapters)
│   ├── persistence/
│   ├── mcp/
│   ├── langfuse/
│   └── config/
├── rag/                        # RAG Pipeline
│   ├── ingest.py
│   ├── retriever.py
│   ├── embeddings.py
│   └── reranker.py
├── api/                        # REST + WebSocket endpoints
│   ├── controllers/
│   └── middlewares/
├── evals/                      # Agent evaluation
│   ├── golden_dataset.json
│   ├── evaluators.py
│   ├── run_evals.py
│   └── judges.py
└── memory/                     # Long-term memory
    ├── store.py
    └── checkpointer.py
```

## Code Standards

- Maximum 500 lines per file, 20 lines per function
- Type hints on public functions
- f-strings for interpolation
- Black + Ruff for formatting
- Descriptive names, no abbreviations
- Guard clauses instead of nested ifs
- Handle exceptions with specific types, never empty `except Exception`

## Agent Standards

- Each agent has ONE responsibility
- System prompts versioned in `prompts.py`, never hardcoded
- Tools with clear names, precise descriptions, and Pydantic schemas
- Timeout and iteration limits on every loop
- Human-in-the-loop for: merge, deploy, delete, destructive operations
- Traces in Langfuse for every execution
- Eval with golden dataset before deploy

## Context Engineering

- **Write:** This CLAUDE.md + skills per context
- **Select:** RAG to inject relevant context to the agent
- **Compress:** Summarization of long code before sending
- **Isolate:** Each agent with isolated context (worktree + separate window)

## RAG

- RecursiveCharacterTextSplitter (chunk 1000, overlap 200)
- Required metadata: source, doc_type, language, created_at
- Hybrid search: pgvector + ts_vector + RRF
- Re-ranking with cross-encoder on top-k
- Test retrieval quality before going to production

## Git

- Commits: `feat(agents): adicionar roteamento condicional`
- Branches: `feature/<module>-<description>`
- Never commit secrets, .env, API keys
- Isolated worktrees per agent when running in parallel

## Tests

- Unit: Value Objects, Entities, domain rules (>= 90%)
- Integration: Repositories, APIs (>= 70%)
- Evals: Golden dataset + LLM-as-judge + rule-based (>= 80% score)
- Naming: `test_should_<result>_when_<condition>`

## Security

- Rate limiting on all APIs
- Guardrails against prompt injection on inputs
- JWT for authentication, API keys for agents
- HTTPS mandatory
- Validate inputs at system boundaries
