# Model Selection Guide

## Classification

| Model | Best For | Pros | Cons |
|---|---|---|---|
| LogisticRegression | Binary/multi-class, linear boundaries | Fast, interpretable | Limited to linear |
| RandomForestClassifier | General purpose, mixed features | Robust, feature importance | Slower, less interpretable |
| GradientBoostingClassifier | High accuracy needed | Best accuracy usually | Slow to train, overfitting risk |
| XGBClassifier | Competitions, large data | Fast, regularization | Needs tuning |
| SVC | Small-medium data, non-linear | Flexible kernels | Slow on large data |

## Regression

| Model | Best For | Pros | Cons |
|---|---|---|---|
| LinearRegression | Linear relationships | Fast, interpretable | Limited to linear |
| Ridge/Lasso | Regularized linear | Handles multicollinearity | Still linear |
| RandomForestRegressor | Non-linear, mixed features | Robust | Slower |
| GradientBoostingRegressor | High accuracy | Best accuracy usually | Needs tuning |
| XGBRegressor | Large datasets | Fast, scalable | Complex tuning |

## Quick Start Recipes

### Binary Classification
```python
from sklearn.ensemble import GradientBoostingClassifier
model = GradientBoostingClassifier(n_estimators=200, max_depth=5, random_state=42)
```

### Multi-class Classification
```python
from sklearn.ensemble import RandomForestClassifier
model = RandomForestClassifier(n_estimators=200, random_state=42)
```

### Regression
```python
from sklearn.ensemble import GradientBoostingRegressor
model = GradientBoostingRegressor(n_estimators=200, max_depth=5, random_state=42)
```
