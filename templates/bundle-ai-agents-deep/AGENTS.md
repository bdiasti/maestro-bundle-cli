# Projeto: Deep Agent (tipo Claude Code)

Você está construindo um Deep Agent — um agente AI autônomo que pode planejar, executar tarefas, gerenciar arquivos, delegar para subagentes e interagir com o usuário. Similar ao Claude Code, Cursor Agent ou Codex. Construído com o framework Deep Agents do LangChain.

## Specification-Driven Development (SDD)

A regra fundamental de SDD está definida no bundle-base (AGENTS.md base) e é inegociável:
**Sem spec, sem código. Sem exceção.** O agente deve recusar implementar qualquer demanda que
não tenha passado pelo fluxo `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.

Se o usuário pedir para codar algo sem spec, PARE e inicie o fluxo SDD primeiro.
Consulte `.specify/specs/` para verificar se já existe spec para a demanda.

## Product Requirements Document

O arquivo `PRD.md` na raiz do projeto contém os requisitos do produto definidos pelo analista/dev. Consulte-o para entender O QUE construir. Este AGENTS.md define COMO o agente deve trabalhar; o PRD define O QUE deve ser construído.

- `PRD.md` — Requisitos do produto, user stories, API spec, modelo de dados

## Stack do projeto

- **Linguagem:** Python 3.11+
- **Framework:** Deep Agents SDK (`deepagents`)
- **Execução:** LangGraph (por baixo)
- **Modelos:** Claude (Anthropic), GPT (OpenAI), Gemini (Google), Ollama (local)
- **Backends:** StateBackend, FilesystemBackend, StoreBackend, LocalShellBackend, Sandboxes
- **API:** FastAPI (para servir o agente como API)
- **Observabilidade:** LangSmith ou Langfuse
- **Testes:** Pytest + evals customizados

## Estrutura do projeto

```
src/
├── agent/                      # Definição do Deep Agent principal
│   ├── main.py                 # create_deep_agent + configuração
│   ├── tools.py                # Tools customizadas
│   ├── subagents.py            # Definição de subagentes
│   ├── middleware.py            # Middleware customizado
│   └── prompts.py              # System prompts versionados
├── skills/                     # Skills que o agente pode carregar
│   ├── code-review/SKILL.md
│   ├── deploy/SKILL.md
│   └── ...
├── backends/                   # Configuração de backends
│   ├── filesystem.py
│   ├── store.py
│   └── composite.py
├── api/                        # Servir agente como API (opcional)
│   ├── server.py               # FastAPI
│   └── websocket.py            # Streaming via WebSocket
├── evals/                      # Avaliação do agente
│   ├── golden_dataset.json
│   ├── evaluators.py
│   └── run_evals.py
└── config/
    ├── settings.py
    └── models.py
```

## Padrões de código

- Máximo 500 linhas por arquivo, 20 linhas por função
- Type hints em funções públicas
- f-strings, Black + Ruff
- Nomes descritivos, guard clauses
- Tratar exceções com tipos específicos

## Padrões de Deep Agent

- System prompts versionados em `prompts.py`, nunca hardcoded
- Tools com schemas Pydantic e descrições claras
- Cada subagente tem UMA responsabilidade
- Human-in-the-loop para operações destrutivas (delete, deploy, email)
- Timeout e max_iterations em todo agente
- Checkpointer obrigatório para persistência de estado
- Backend explícito (nunca confiar no default em produção)
- Skills carregadas on-demand, nunca todas no system prompt

## Middleware obrigatório

O Deep Agent já vem com middleware padrão que não deve ser desabilitado:
- **TodoListMiddleware** — Planejamento de tarefas
- **FilesystemMiddleware** — Gerenciamento de arquivos
- **SubAgentMiddleware** — Delegação para subagentes
- **SummarizationMiddleware** — Compressão de contexto

## Git

- Commits: `feat(agent): adicionar tool de busca semântica`
- Branches: `feature/<componente>-<descricao>`
- Nunca commitar API keys, .env

## Testes

- Testes unitários para tools e middleware
- Testes de integração para o agente completo
- Evals com golden dataset + LLM-as-judge
- Cobertura mínima: 80%

## References

- `references/deep-agents-api.md` — API reference do Deep Agents SDK
- `references/backends-guide.md` — Guia de backends e quando usar cada um
- `references/middleware-guide.md` — Middleware padrão e customizado
