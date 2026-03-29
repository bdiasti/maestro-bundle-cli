# Projeto: Pipeline de Dados e ML

Você está construindo um pipeline de dados que inclui ingestão, processamento, treinamento de modelos e serving. O projeto usa Python com foco em engenharia de dados e machine learning.

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

- `references/pandas-patterns.md` — Padrões de transformação com Pandas
- `references/mlflow-guide.md` — Guia de experiment tracking
- `references/data-validation.md` — Validação com Pandera/Great Expectations

## Stack do projeto

- **Linguagem:** Python 3.11+
- **Dados:** Pandas, Polars, NumPy
- **ML:** Scikit-learn, XGBoost, LightGBM
- **Deep Learning:** PyTorch (quando necessário)
- **Pipeline:** Apache Airflow ou Prefect
- **Experiment Tracking:** MLflow
- **RAG (se aplicável):** LangChain + pgvector
- **Banco:** PostgreSQL
- **Containers:** Docker
- **Validação:** Pandera, Great Expectations

## Estrutura do projeto

```
src/
├── data/
│   ├── raw/                    # Dados originais (imutáveis, nunca editar)
│   ├── processed/              # Dados transformados
│   └── features/               # Feature store
├── pipelines/
│   ├── ingestion/              # Ingestão de fontes externas
│   ├── preprocessing/          # Limpeza e transformação
│   ├── feature_engineering/    # Criação de features
│   └── training/               # Pipeline de treino
├── models/
│   ├── training/               # Scripts de treino
│   ├── evaluation/             # Avaliação e métricas
│   └── serving/                # API de inferência (FastAPI)
├── rag/                        # Se aplicável
│   ├── ingest.py
│   ├── retriever.py
│   └── embeddings.py
├── notebooks/                  # APENAS exploração (não vai para prod)
├── tests/
│   ├── test_preprocessing.py
│   ├── test_features.py
│   └── test_model.py
└── config/
    ├── settings.py
    └── models_config.yaml
```

## Padrões de código

- Máximo 500 linhas por arquivo, 20 linhas por função
- Type hints em funções públicas
- Docstrings em funções de transformação de dados (input/output)
- Black + Ruff para formatação
- Notebook → script Python antes de ir para produção

## Padrões de dados

- Dados originais são IMUTÁVEIS — nunca editar `raw/`
- Cada transformação é uma função pura (input → output, sem side effects)
- Validar schema na entrada de cada pipeline step (Pandera)
- Versionamento de datasets com DVC
- Logging de todas as transformações

## Padrões de ML

- Todo modelo precisa de baseline (majority class, média, regressão linear)
- Cross-validation k=5 mínimo
- Métricas documentadas: accuracy, precision, recall, F1, AUC
- Feature importance registrada no MLflow
- Modelo serializado com versão
- A/B testing antes de substituir modelo em produção

## Git

- Commits: `feat(preprocessing): adicionar normalização de salários`
- Branches: `feature/<pipeline>-<descricao>`
- Nunca commitar dados (usar .gitignore, DVC para dados)
- Nunca commitar modelos binários (usar MLflow registry)

## Testes

- Testes de schema (Pandera) para cada transformação
- Testes unitários para funções de feature engineering
- Testes de regressão para métricas do modelo
- Cobertura mínima: 80% em pipelines de transformação

## O que NÃO fazer

- Não colocar notebook em produção sem refatorar
- Não treinar sem baseline
- Não ignorar data drift
- Não usar random seed inconsistente
- Não hardcodar paths — usar config
- Não fazer SELECT * em queries de dados grandes
