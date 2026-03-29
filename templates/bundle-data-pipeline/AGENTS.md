# Project: Data and ML Pipeline

You are building a data pipeline that includes ingestion, processing, model training, and serving. The project uses Python with a focus on data engineering and machine learning.

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

- `references/pandas-patterns.md` — Pandas transformation patterns
- `references/mlflow-guide.md` — Experiment tracking guide
- `references/data-validation.md` — Validation with Pandera/Great Expectations

## Project Stack

- **Language:** Python 3.11+
- **Data:** Pandas, Polars, NumPy
- **ML:** Scikit-learn, XGBoost, LightGBM
- **Deep Learning:** PyTorch (when needed)
- **Pipeline:** Apache Airflow or Prefect
- **Experiment Tracking:** MLflow
- **RAG (if applicable):** LangChain + pgvector
- **Database:** PostgreSQL
- **Containers:** Docker
- **Validation:** Pandera, Great Expectations

## Project Structure

```
src/
├── data/
│   ├── raw/                    # Original data (immutable, never edit)
│   ├── processed/              # Transformed data
│   └── features/               # Feature store
├── pipelines/
│   ├── ingestion/              # Ingestion from external sources
│   ├── preprocessing/          # Cleaning and transformation
│   ├── feature_engineering/    # Feature creation
│   └── training/               # Training pipeline
├── models/
│   ├── training/               # Training scripts
│   ├── evaluation/             # Evaluation and metrics
│   └── serving/                # Inference API (FastAPI)
├── rag/                        # If applicable
│   ├── ingest.py
│   ├── retriever.py
│   └── embeddings.py
├── notebooks/                  # ONLY for exploration (does not go to prod)
├── tests/
│   ├── test_preprocessing.py
│   ├── test_features.py
│   └── test_model.py
└── config/
    ├── settings.py
    └── models_config.yaml
```

## Code Standards

- Maximum 500 lines per file, 20 lines per function
- Type hints on public functions
- Docstrings on data transformation functions (input/output)
- Black + Ruff for formatting
- Notebook -> Python script before going to production

## Data Standards

- Original data is IMMUTABLE -- never edit `raw/`
- Each transformation is a pure function (input -> output, no side effects)
- Validate schema at the entry of each pipeline step (Pandera)
- Dataset versioning with DVC
- Logging of all transformations

## ML Standards

- Every model needs a baseline (majority class, mean, linear regression)
- Cross-validation k=5 minimum
- Documented metrics: accuracy, precision, recall, F1, AUC
- Feature importance recorded in MLflow
- Serialized model with version
- A/B testing before replacing a model in production

## Git

- Commits: `feat(preprocessing): add salary normalization`
- Branches: `feature/<pipeline>-<description>`
- Never commit data (use .gitignore, DVC for data)
- Never commit binary models (use MLflow registry)

## Tests

- Schema tests (Pandera) for each transformation
- Unit tests for feature engineering functions
- Regression tests for model metrics
- Minimum coverage: 80% on transformation pipelines

## What NOT to do

- Do not put notebooks in production without refactoring
- Do not train without a baseline
- Do not ignore data drift
- Do not use inconsistent random seeds
- Do not hardcode paths -- use config
- Do not use SELECT * on large data queries
