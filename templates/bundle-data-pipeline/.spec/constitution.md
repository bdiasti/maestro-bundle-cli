# Constitution — Data and ML Pipeline Project

## Principles

1. **Spec first, code later** — Every demand goes through the SDD flow before implementation
2. **Original data is immutable** — Never edit data in `raw/`
3. **Reproducibility** — Every pipeline must be reproducible with same input = same output
4. **Baseline mandatory** — Every model needs a baseline for comparison
5. **Notebook for exploration, script for production** — Refactor before merge

## Development Standards

- Python 3.11+, type hints, Black + Ruff
- Pure functions for transformations (input -> output)
- Schema validation at each step (Pandera)
- Dataset versioning with DVC
- Experiment tracking with MLflow

## ML Standards

- Cross-validation k=5 minimum
- Metrics documented in MLflow
- Feature importance recorded
- Consistent random seed
- A/B testing before replacing model

## Quality Standards

- Schema tests for transformations
- Regression tests for metrics
- Minimum coverage: 80% on pipelines
- Commits follow Conventional Commits
