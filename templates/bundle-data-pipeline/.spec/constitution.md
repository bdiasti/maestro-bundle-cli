# Constitution — Projeto Pipeline de Dados e ML

## Princípios

1. **Spec primeiro, código depois** — Toda demanda passa pelo fluxo SDD antes de implementação
2. **Dados originais são imutáveis** — Nunca editar dados em `raw/`
3. **Reprodutibilidade** — Todo pipeline deve ser reproduzível com mesma entrada = mesma saída
4. **Baseline obrigatório** — Todo modelo precisa de baseline para comparação
5. **Notebook para exploração, script para produção** — Refatorar antes de merge

## Padrões de desenvolvimento

- Python 3.11+, type hints, Black + Ruff
- Funções puras para transformações (input → output)
- Validação de schema em cada etapa (Pandera)
- Versionamento de datasets com DVC
- Experiment tracking com MLflow

## Padrões de ML

- Cross-validation k=5 mínimo
- Métricas documentadas no MLflow
- Feature importance registrada
- Random seed consistente
- A/B testing antes de substituir modelo

## Padrões de qualidade

- Testes de schema para transformações
- Testes de regressão para métricas
- Cobertura mínima: 80% em pipelines
- Commits seguem Conventional Commits
