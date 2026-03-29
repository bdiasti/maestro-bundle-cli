# maestro-bundle

One command. Full context for your AI agent. Any editor.

```bash
npx maestro-bundle ai-agents claude
```

## The problem

AI agents (Claude Code, Cursor, Codex) are powerful, but without context they don't know:

- What stack the project uses
- Which coding standards to follow
- What the application does (requirements)
- What tools to use and when
- That they should plan before coding

The result is **vibing code** — the agent generates code with no direction, no standards, no planning. Fine for prototypes, unacceptable for real projects with teams.

## The solution: layered context

maestro-bundle solves this by installing **4 layers of context** that work together:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  PRD.md              WHAT to build                      │
│  (requirements)      User stories, API spec, data       │
│                      model, acceptance criteria         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  AGENTS.md           HOW to build                       │
│  (standards)         Stack, architecture, conventions,  │
│                      project structure, git flow        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Skills              WITH WHAT to build                 │
│  (capabilities)      RAG pipeline, clean architecture,  │
│                      deploy, testing, etc.              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Spec Kit (SDD)      IN WHAT ORDER to build             │
│  (process)           /speckit.specify → plan → tasks    │
│                      → implement                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Each layer gives the agent a different type of context. Together, they make the agent work like a senior dev who knows the project, follows the standards, and plans before coding.

## What it installs

```bash
npx maestro-bundle ai-agents claude
```

| What | Purpose | Who fills it |
|---|---|---|
| **AGENTS.md** | Standards, stack, conventions | Bundle (automatic) |
| **Skills** | Specific capabilities (RAG, clean arch, tests...) | Bundle (automatic) |
| **PRD.md** | Product requirements, user stories, API spec | Analyst / Dev |
| **Spec Kit** | SDD process — spec → plan → tasks → implement | Agent + Dev |
| **Constitution** | Non-negotiable project principles | Bundle (automatic) |
| **LangChain Skills** | 11 official LangChain skills (AI bundles) | Bundle (automatic) |

The dev only needs to fill in `PRD.md`. Everything else comes ready.

## How it works in practice

```
1. Dev installs the bundle
   $ npx maestro-bundle ai-agents claude

2. Analyst/dev fills PRD.md with requirements

3. Dev opens the editor and requests a feature:
   "Create the JWT authentication endpoint"

4. The agent already knows:
   - The requirements (PRD.md)
   - The stack and standards (AGENTS.md)
   - How to do JWT (authentication skill)
   - That it needs to create a spec before coding (Spec Kit)

5. Result: governed, consistent, planned code
```

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

## What happens when you install

```
$ npx maestro-bundle ai-agents claude

  Bundle:  Multi-Agent AI System
  Editor:  Claude Code

  ✔ Claude Code: AGENTS.md, CLAUDE.md, 14 skills in .claude/skills/
  ✔ PRD.md template installed
  ✔ 11 LangChain Skills installed
  ✔ specify-cli v0.4.3 installed
  ✔ Spec Kit initialized (/speckit.* commands available)
  ✔ Bundle constitution integrated

  Done!

  Next steps:
    1. Fill in PRD.md with your product requirements
    2. Open the project in your AI editor
    3. Use /speckit.specify to start your first feature
```

## Project structure

```
your-project/
├── CLAUDE.md                    # Points to AGENTS.md
├── AGENTS.md                    # Stack, standards, conventions (automatic)
├── PRD.md                       # Product requirements (fill this in!)
├── .claude/
│   ├── skills/                  # Agent capabilities
│   │   ├── rag-pipeline/
│   │   ├── clean-architecture/
│   │   ├── testing-strategy/
│   │   └── ...
│   └── commands/                # Spec Kit commands
│       ├── speckit.specify.md
│       ├── speckit.plan.md
│       ├── speckit.tasks.md
│       └── speckit.implement.md
├── .specify/                    # Feature specs, plans, tasks
│   ├── memory/constitution.md
│   ├── templates/
│   └── specs/
│       └── 001-feature-name/
│           ├── spec.md
│           ├── plan.md
│           └── tasks.md
├── skills/                      # Canonical skills (Deep Agents)
└── references/                  # Reference docs
```

## SDD process with Spec Kit

The bundle installs [GitHub Spec Kit](https://github.com/github/spec-kit) which adds commands to your editor for Specification-Driven Development:

| Command | What it does |
|---|---|
| `/speckit.specify` | Specify WHAT to build and WHY |
| `/speckit.plan` | Plan architecture and technical decisions |
| `/speckit.tasks` | Break down into atomic tasks |
| `/speckit.implement` | Execute tasks following the plan |

The agent is instructed to follow this flow for new features. Simple bug fixes can go directly.

## LangChain Skills (AI bundles)

The `ai-agents` and `ai-agents-deep` bundles automatically install the [11 official LangChain skills](https://github.com/langchain-ai/langchain-skills) covering LangChain, LangGraph, and Deep Agents.

## Prerequisites

- **Node.js 18+**
- **Git**
- **uv** or **pip** (for Spec Kit — installed automatically)

## Links

- [AGENTS.md](https://agents.md/) — Universal standard for AI agent instructions
- [GitHub Spec Kit](https://github.com/github/spec-kit) — Specification-Driven Development
- [LangChain Skills](https://github.com/langchain-ai/langchain-skills) — Official LangChain skills
- [Agent Skills](https://agentskills.io) — Open standard for agent skills
