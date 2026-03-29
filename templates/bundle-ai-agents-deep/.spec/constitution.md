# Constitution — Projeto Deep Agent

## Princípios

1. **Spec primeiro, código depois** — Toda demanda passa pelo fluxo SDD antes de implementação
2. **Agent harness completo** — Todo Deep Agent tem: tools, system prompt, middleware, backend, checkpointer
3. **Subagentes para isolamento** — Tarefas especializadas vão para subagentes, nunca bloat no main
4. **Human-in-the-loop obrigatório** — Operações destrutivas sempre pedem aprovação
5. **Skills on-demand** — Carregar conhecimento quando relevante, não no startup

## Padrões de desenvolvimento

- Python 3.11+, type hints, Black + Ruff
- Tools com schemas Pydantic e descrições claras
- System prompts versionados em código
- Checkpointer obrigatório (MemorySaver dev, PostgresSaver prod)
- Backend explícito (nunca confiar no StateBackend default em prod)

## Padrões de qualidade

- Evals com golden dataset antes de deploy
- Middleware de logging em todo agente
- Testes unitários para tools e middleware
- Cobertura mínima: 80%
