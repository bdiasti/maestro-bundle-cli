# Constitution — Projeto de Agentes AI

## Princípios

1. **Spec primeiro, código depois** — Toda demanda passa pelo fluxo SDD antes de implementação
2. **Agente governado** — Todo agente segue seu AGENTS.md e skills, sem "vibing coding"
3. **Observável** — Toda execução de agente é rastreada no Langfuse
4. **Avaliável** — Todo agente tem evals com golden dataset antes de ir para produção
5. **Context-aware** — Gerenciar janela de contexto com as 4 estratégias (Write, Select, Compress, Isolate)

## Padrões de desenvolvimento

- Clean Architecture para separar domínio de infraestrutura
- Entidades ricas com comportamento (não anêmicas)
- Value Objects para validação
- Testes: >= 80% cobertura, evals para agentes
- Python 3.11+, type hints, Black + Ruff

## Padrões de agentes

- System prompts versionados, nunca hardcoded
- Tools com schemas Pydantic
- Human-in-the-loop para operações destrutivas
- Timeout e limite de iterações em loops
- Memória de longo prazo via LangGraph Store

## Padrões de qualidade

- Code review obrigatório
- Commits seguem Conventional Commits
- Branches seguem estratégia feature/fix/hotfix
- Nunca commitar secrets
- Rate limiting em todas as APIs
