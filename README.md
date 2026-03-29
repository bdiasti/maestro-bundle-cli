# maestro-bundle

Um comando. Contexto completo pro agente AI. Qualquer editor.

```bash
npx maestro-bundle ai-agents claude
```

## O problema

Agentes AI (Claude Code, Cursor, Codex) são poderosos, mas sem contexto eles não sabem:

- Qual a stack do projeto
- Quais padrões de código seguir
- O que a aplicação faz (requisitos)
- Que ferramentas usar e quando
- Qual o plano antes de sair codando

O resultado é **vibing code** — o agente gera código sem direção, sem padrões, sem planejamento. Funciona para protótipos, mas é inviável para projetos reais com time.

## A solução: contexto em camadas

O maestro-bundle resolve isso instalando **3 camadas de contexto** que trabalham juntas:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  PRD.md              O QUE construir                    │
│  (requisitos)        User stories, API spec, modelo     │
│                      de dados, critérios de aceite      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  AGENTS.md           COMO construir                     │
│  (padrões)           Stack, arquitetura, convenções,    │
│                      estrutura de projeto, git flow     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Skills              COM O QUE construir                │
│  (capacidades)       RAG pipeline, clean architecture,  │
│                      deploy, testes, etc.               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Spec Kit (SDD)      EM QUE ORDEM construir             │
│  (processo)          /speckit.specify → plan → tasks    │
│                      → implement                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Cada camada dá ao agente um tipo de contexto diferente. Juntas, elas fazem o agente trabalhar como um dev senior que conhece o projeto, segue os padrões e planeja antes de codar.

## O que instala

```bash
npx maestro-bundle ai-agents claude
```

| O que | Para que | Quem preenche |
|---|---|---|
| **AGENTS.md** | Padrões, stack, convenções do projeto | Bundle (automático) |
| **Skills** | Capacidades específicas (RAG, clean arch, testes...) | Bundle (automático) |
| **PRD.md** | Requisitos do produto, user stories, API spec | Analista / Dev |
| **Spec Kit** | Processo SDD — spec → plan → tasks → implement | Agente + Dev |
| **Constitution** | Princípios inegociáveis do projeto | Bundle (automático) |
| **LangChain Skills** | 11 skills oficiais LangChain (bundles AI) | Bundle (automático) |

O dev só precisa preencher o `PRD.md`. Todo o resto vem pronto.

## Como funciona na prática

```
1. Dev instala o bundle
   $ npx maestro-bundle ai-agents claude

2. Analista/dev preenche o PRD.md com os requisitos

3. Dev abre o editor e pede uma feature:
   "Cria o endpoint de autenticação JWT"

4. O agente já sabe:
   - Os requisitos (PRD.md)
   - A stack e padrões (AGENTS.md)
   - Como fazer JWT (skill de authentication)
   - Que precisa criar spec antes de codar (Spec Kit)

5. Resultado: código governado, consistente, planejado
```

## Bundles disponíveis

| Bundle | Tipo de projeto | Stack |
|---|---|---|
| `ai-agents` | Sistemas multi-agente com AI | Python, LangChain, LangGraph, FastAPI, pgvector |
| `ai-agents-deep` | Deep Agent (tipo Claude Code) | Python, Deep Agents SDK, LangGraph, Subagentes |
| `jhipster-monorepo` | Aplicação JHipster monolítica | Java 21, Spring Boot, Angular, PostgreSQL |
| `jhipster-microservices` | Microsserviços JHipster | Java 21, Spring Boot, Kafka, Consul, K8s |
| `data-pipeline` | Pipeline de dados e ML | Python, Pandas, Scikit-learn, MLflow |
| `frontend-spa` | Frontend SPA | React, TypeScript, Tailwind, Vite |

```bash
npx maestro-bundle ai-agents claude
npx maestro-bundle ai-agents-deep cursor
npx maestro-bundle jhipster-monorepo claude
npx maestro-bundle jhipster-microservices codex
npx maestro-bundle data-pipeline copilot
npx maestro-bundle frontend-spa windsurf
```

## Editores suportados

| Editor | Comando | Onde instala |
|---|---|---|
| **Claude Code** | `npx maestro-bundle <bundle> claude` | `CLAUDE.md` + `.claude/skills/` |
| **Cursor** | `npx maestro-bundle <bundle> cursor` | `AGENTS.md` + `.cursor/skills/` |
| **OpenAI Codex** | `npx maestro-bundle <bundle> codex` | `AGENTS.md` + `.agents/skills/` |
| **GitHub Copilot** | `npx maestro-bundle <bundle> copilot` | `.github/copilot-instructions.md` |
| **Windsurf** | `npx maestro-bundle <bundle> windsurf` | `.windsurfrules` |
| **Todos** | `npx maestro-bundle <bundle> all` | Tudo acima no mesmo repo |

## O que acontece ao instalar

```
$ npx maestro-bundle ai-agents claude

  Bundle:  Sistema Multi-Agente com AI
  Editor:  Claude Code

  ✔ Claude Code: AGENTS.md, CLAUDE.md, 14 skills em .claude/skills/
  ✔ PRD.md template instalado
  ✔ 11 LangChain Skills instaladas
  ✔ specify-cli v0.4.3 instalado
  ✔ Spec Kit inicializado (/speckit.* commands disponíveis)
  ✔ Constitution do bundle integrado

  Pronto!

  Próximo passo:
    1. Preencha o PRD.md com os requisitos do produto
    2. Abra o projeto no editor AI
    3. Use /speckit.specify para começar a primeira feature
```

## Estrutura no projeto

```
seu-projeto/
├── CLAUDE.md                    # Aponta para AGENTS.md
├── AGENTS.md                    # Stack, padrões, convenções (automático)
├── PRD.md                       # Requisitos do produto (preencher!)
├── .claude/
│   ├── skills/                  # Capacidades do agente
│   │   ├── rag-pipeline/
│   │   ├── clean-architecture/
│   │   ├── testing-strategy/
│   │   └── ...
│   └── commands/                # Spec Kit commands
│       ├── speckit.specify.md
│       ├── speckit.plan.md
│       ├── speckit.tasks.md
│       └── speckit.implement.md
├── .specify/                    # Specs, plans, tasks das features
│   ├── memory/constitution.md
│   ├── templates/
│   └── specs/
│       └── 001-feature-name/
│           ├── spec.md
│           ├── plan.md
│           └── tasks.md
├── skills/                      # Skills canônicas (Deep Agents)
└── references/                  # Docs de referência
```

## Processo SDD com Spec Kit

O bundle instala o [GitHub Spec Kit](https://github.com/github/spec-kit) que adiciona commands no editor para o fluxo de Specification-Driven Development:

| Command | O que faz |
|---|---|
| `/speckit.specify` | Especificar O QUE construir e POR QUÊ |
| `/speckit.plan` | Planejar arquitetura e decisões técnicas |
| `/speckit.tasks` | Quebrar em tasks atômicas |
| `/speckit.implement` | Executar as tasks seguindo o plano |

O agente é instruído a seguir esse fluxo para features novas. Bug fixes simples podem ir direto.

## LangChain Skills (bundles AI)

Os bundles `ai-agents` e `ai-agents-deep` instalam automaticamente as [11 skills oficiais do LangChain](https://github.com/langchain-ai/langchain-skills) cobrindo LangChain, LangGraph e Deep Agents.

## Pré-requisitos

- **Node.js 18+**
- **Git**
- **uv** ou **pip** (para o Spec Kit — instalado automaticamente)

## Links

- [AGENTS.md](https://agents.md/) — Padrão universal para instruções de agentes AI
- [GitHub Spec Kit](https://github.com/github/spec-kit) — Specification-Driven Development
- [LangChain Skills](https://github.com/langchain-ai/langchain-skills) — Skills oficiais LangChain
- [Agent Skills](https://agentskills.io) — Padrão aberto para skills de agentes
