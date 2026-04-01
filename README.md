# maestro-bundle

One command. Full context for your AI agent. Any editor.

```bash
npx maestro-bundle ai-agents claude
```

## The problem

AI agents (Claude Code, Cursor, Codex) are powerful, but without context they don't know your stack, your standards, or what the application does. The result is **vibing code** — code with no direction and no consistency.

## The solution: layered context

maestro-bundle installs **context layers** that make the agent work like a senior dev who knows the project:

```
  PRD.md        → WHAT to build (requirements, user stories, API spec)
  AGENTS.md     → HOW to build (stack, architecture, conventions)
  Skills        → WITH WHAT to build (RAG, clean arch, testing, deploy...)
  Spec Kit      → IN WHAT ORDER to build (spec → plan → tasks → implement)
```

## Two modes

### Full mode (with SDD)

Includes everything above — the agent follows Specification-Driven Development via [GitHub Spec Kit](https://github.com/github/spec-kit). New features go through `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` before any code is written.

```bash
npx maestro-bundle ai-agents claude
```

### Lightweight mode (`--no-sdd`)

Skips Spec Kit entirely. Installs only AGENTS.md, skills, and PRD.md. The agent still knows your stack and patterns, but won't enforce the SDD process. Faster for smaller projects or when you just want good defaults without the ceremony.

```bash
npx maestro-bundle ai-agents claude --no-sdd
```

| | Full mode | `--no-sdd` |
|---|---|---|
| AGENTS.md | ✅ | ✅ |
| Skills | ✅ | ✅ |
| PRD.md template | ✅ | ✅ |
| LangChain Skills (AI bundles) | ✅ | ✅ |
| GitHub Spec Kit | ✅ | ❌ |
| `/speckit.*` commands | ✅ | ❌ |
| Anti-vibing code enforcement | ✅ | ❌ |

## Available bundles

| Bundle | Project type | Stack |
|---|---|---|
| `ai-agents` | Multi-agent AI systems | Python, LangChain, LangGraph, FastAPI, pgvector |
| `ai-agents-deep` | Deep Agent (Claude Code-like) | Python, Deep Agents SDK, LangGraph, Subagents |
| `jhipster-monorepo` | JHipster monolithic app | Java 21, Spring Boot, Angular, PostgreSQL |
| `jhipster-microservices` | JHipster microservices | Java 21, Spring Boot, Kafka, Consul, K8s |
| `data-pipeline` | Data & ML pipeline | Python, Pandas, Scikit-learn, MLflow |
| `frontend-spa` | Frontend SPA | React, TypeScript, Tailwind, Vite |

```bash
npx maestro-bundle ai-agents claude
npx maestro-bundle ai-agents claude --no-sdd
npx maestro-bundle ai-agents-deep cursor
npx maestro-bundle jhipster-monorepo claude
npx maestro-bundle jhipster-microservices codex
npx maestro-bundle data-pipeline copilot
npx maestro-bundle frontend-spa windsurf
```

## Supported editors

| Editor | Command | Where it installs |
|---|---|---|
| **Claude Code** | `npx maestro-bundle <bundle> claude` | `CLAUDE.md` + `.claude/skills/` |
| **Cursor** | `npx maestro-bundle <bundle> cursor` | `AGENTS.md` + `.cursor/skills/` |
| **OpenAI Codex** | `npx maestro-bundle <bundle> codex` | `AGENTS.md` + `.agents/skills/` |
| **GitHub Copilot** | `npx maestro-bundle <bundle> copilot` | `.github/copilot-instructions.md` |
| **Windsurf** | `npx maestro-bundle <bundle> windsurf` | `.windsurfrules` |
| **All** | `npx maestro-bundle <bundle> all` | All of the above in the same repo |

## What happens

### Full mode

```
$ npx maestro-bundle ai-agents claude

  ✔ Claude Code: AGENTS.md, CLAUDE.md, 14 skills in .claude/skills/
  ✔ PRD.md template installed
  ✔ 11 LangChain Skills installed
  ✔ specify-cli v0.4.3 installed
  ✔ Spec Kit initialized (/speckit.* commands available)
  ✔ Bundle constitution integrated

  Next steps:
    1. Fill in PRD.md with your product requirements
    2. Open the project in your AI editor
    3. Use /speckit.specify to start your first feature
```

### Lightweight mode

```
$ npx maestro-bundle ai-agents claude --no-sdd

  ✔ Claude Code: AGENTS.md, CLAUDE.md, 14 skills in .claude/skills/
  ✔ PRD.md template installed
  ✔ 11 LangChain Skills installed
  ℹ Spec Kit skipped. Using AGENTS.md + skills only.

  Next steps:
    1. Fill in PRD.md with your product requirements
    2. Open the project in your AI editor and start coding
```

## Project structure

### Full mode
```
your-project/
├── CLAUDE.md                    # Points to AGENTS.md
├── AGENTS.md                    # Stack, standards, conventions
├── PRD.md                       # Product requirements (fill this in!)
├── .claude/
│   ├── skills/                  # Agent capabilities
│   │   ├── rag-pipeline/
│   │   ├── clean-architecture/
│   │   └── ...
│   └── commands/                # /speckit.* commands
│       ├── speckit.specify.md
│       ├── speckit.plan.md
│       └── speckit.implement.md
├── .specify/                    # Spec Kit (specs, plans, tasks)
└── references/
```

### Lightweight mode (`--no-sdd`)
```
your-project/
├── CLAUDE.md                    # Points to AGENTS.md
├── AGENTS.md                    # Stack, standards, conventions
├── PRD.md                       # Product requirements (fill this in!)
├── .claude/
│   └── skills/                  # Agent capabilities
│       ├── rag-pipeline/
│       ├── clean-architecture/
│       └── ...
└── references/
```

## AGENTS.md vs PRD.md vs Skills

| File | Who writes it | What it contains |
|---|---|---|
| **AGENTS.md** | Bundle (automatic) | HOW to build — stack, patterns, conventions, git flow |
| **PRD.md** | Analyst / Dev | WHAT to build — requirements, user stories, API spec |
| **Skills** | Bundle (automatic) | WITH WHAT — specific capabilities the agent loads on-demand |

## LangChain Skills (AI bundles)

The `ai-agents` and `ai-agents-deep` bundles automatically install the [11 official LangChain skills](https://github.com/langchain-ai/langchain-skills) covering LangChain, LangGraph, and Deep Agents.

## Prerequisites

- **Node.js 18+**
- **Git**
- **uv** or **pip** (for Spec Kit — only needed in full mode, installed automatically)

## Links

- [AGENTS.md](https://agents.md/) — Universal standard for AI agent instructions
- [GitHub Spec Kit](https://github.com/github/spec-kit) — Specification-Driven Development
- [LangChain Skills](https://github.com/langchain-ai/langchain-skills) — Official LangChain skills
- [Agent Skills](https://agentskills.io) — Open standard for agent skills
