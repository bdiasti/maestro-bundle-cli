# Projeto: Sistema Multi-Agente com AI

Você está construindo um sistema de agentes AI com orquestração, RAG e execução autônoma de tarefas. O backend é Python com FastAPI, a orquestração usa LangChain + LangGraph, e a infra roda em containers.

## Specification-Driven Development (SDD)

A regra fundamental de SDD está definida no bundle-base (AGENTS.md base) e é inegociável:
**Sem spec, sem código. Sem exceção.** O agente deve recusar implementar qualquer demanda que
não tenha passado pelo fluxo `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.

Se o usuário pedir para codar algo sem spec, PARE e inicie o fluxo SDD primeiro.
Consulte `.specify/specs/` para verificar se já existe spec para a demanda.

## Product Requirements Document

O arquivo `PRD.md` na raiz do projeto contém os requisitos do produto definidos pelo analista/dev. Consulte-o para entender O QUE construir, as user stories, critérios de aceite, modelo de dados e API specification. Este AGENTS.md define COMO o agente deve trabalhar; o PRD define O QUE deve ser construído.

- `PRD.md` — Requisitos do produto, user stories, API spec, modelo de dados

## References

Documentos de referência que o agente deve consultar quando necessário:

- `references/fastapi-patterns.md` — Padrões de endpoints FastAPI
- `references/langgraph-patterns.md` — Padrões de grafos LangGraph
- `references/rag-best-practices.md` — Melhores práticas de RAG
- `references/eval-framework.md` — Framework de avaliação de agentes

## Stack do projeto

- **Linguagem:** Python 3.11+
- **Agentes:** LangChain + LangGraph + Deep Agents
- **API:** FastAPI
- **Banco:** PostgreSQL (relacional + pgvector para RAG)
- **Cache/Filas:** Redis Streams
- **Embeddings:** text-embedding-3-large ou multilingual-e5-large
- **Observabilidade:** Langfuse (self-hosted)
- **Containers:** Docker + K3s
- **Testes:** Pytest + evals customizados

## Estrutura do projeto

```
src/
├── agents/                     # Definição dos agentes
│   ├── orchestrator/
│   │   ├── agent.py            # Deep Agent orquestrador
│   │   ├── state.py            # AgentState do LangGraph
│   │   ├── nodes.py            # Nós do grafo
│   │   ├── tools.py            # Tools do agente
│   │   └── prompts.py          # System prompts versionados
│   ├── frontend_agent/
│   ├── backend_agent/
│   └── devops_agent/
├── domain/                     # Clean Architecture — regras de negócio
│   ├── entities/
│   ├── value_objects/
│   ├── events/
│   ├── services/
│   └── repositories/           # Interfaces (ports)
├── application/                # Use cases
│   ├── use_cases/
│   ├── dtos/
│   └── mappers/
├── infrastructure/             # Implementações (adapters)
│   ├── persistence/
│   ├── mcp/
│   ├── langfuse/
│   └── config/
├── rag/                        # Pipeline de RAG
│   ├── ingest.py
│   ├── retriever.py
│   ├── embeddings.py
│   └── reranker.py
├── api/                        # Endpoints REST + WebSocket
│   ├── controllers/
│   └── middlewares/
├── evals/                      # Avaliação dos agentes
│   ├── golden_dataset.json
│   ├── evaluators.py
│   ├── run_evals.py
│   └── judges.py
└── memory/                     # Memória longo prazo
    ├── store.py
    └── checkpointer.py
```

## Padrões de código

- Máximo 500 linhas por arquivo, 20 linhas por função
- Type hints em funções públicas
- f-strings para interpolação
- Black + Ruff para formatação
- Nomes descritivos, sem abreviações
- Guard clauses em vez de ifs aninhados
- Tratar exceções com tipos específicos, nunca `except Exception` vazio

## Padrões de agentes

- Cada agente tem UMA responsabilidade
- System prompts versionados em `prompts.py`, nunca hardcoded
- Tools com nomes claros, descrições precisas e schemas Pydantic
- Timeout e limite de iterações em todo loop
- Human-in-the-loop para: merge, deploy, delete, operações destrutivas
- Traces no Langfuse para toda execução
- Eval com golden dataset antes de deploy

## Context Engineering

- **Write:** Este CLAUDE.md + skills por contexto
- **Select:** RAG para injetar contexto relevante ao agente
- **Compress:** Summarization de código longo antes de enviar
- **Isolate:** Cada agente com contexto isolado (worktree + janela separada)

## RAG

- RecursiveCharacterTextSplitter (chunk 1000, overlap 200)
- Metadados obrigatórios: source, doc_type, language, created_at
- Hybrid search: pgvector + ts_vector + RRF
- Re-ranking com cross-encoder no top-k
- Testar retrieval quality antes de ir para produção

## Git

- Commits: `feat(agents): adicionar roteamento condicional`
- Branches: `feature/<modulo>-<descricao>`
- Nunca commitar secrets, .env, API keys
- Worktrees isoladas por agente quando em execução paralela

## Testes

- Unitários: Value Objects, Entities, regras de domínio (>= 90%)
- Integração: Repositórios, APIs (>= 70%)
- Evals: Golden dataset + LLM-as-judge + rule-based (>= 80% score)
- Nome: `test_should_<resultado>_when_<condição>`

## Segurança

- Rate limiting em todas as APIs
- Guardrails contra prompt injection nos inputs
- JWT para autenticação, API keys para agentes
- HTTPS obrigatório
- Validar inputs nas fronteiras do sistema
