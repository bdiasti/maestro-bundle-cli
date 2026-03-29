---
name: model-training
description: Train ML models with scikit-learn including preprocessing pipelines, cross-validation, hyperparameter tuning, and evaluation. Use when you need to train a classifier or regressor, run cross-validation, tune hyperparameters, or compare models against baselines.
version: 1.0.0
author: Maestro
---

# Model Training

Train, evaluate, and export ML models using scikit-learn pipelines with proper cross-validation and hyperparameter tuning.

## When to Use
- User wants to train a classification or regression model
- User needs cross-validation scores for model selection
- User wants to tune hyperparameters with GridSearch or RandomizedSearch
- User needs to compare a model against a baseline
- User wants to save a trained model for deployment

## Available Operations
1. Build a full sklearn Pipeline (preprocessing + model)
2. Run cross-validation with multiple scoring metrics
3. Tune hyperparameters with GridSearchCV or RandomizedSearchCV
4. Evaluate on held-out test set with classification_report / regression metrics
5. Compare against baseline (DummyClassifier/DummyRegressor)
6. Save the best model with joblib

## Multi-Step Workflow

### Step 1: Install Dependencies
```bash
pip install scikit-learn pandas numpy joblib
```

### Step 2: Load Prepared Data
```python
import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_parquet("data/processed/dataset_clean.parquet")
X = df.drop(columns=["target"])
y = df["target"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y  # stratify for classification
)
print(f"Train: {X_train.shape}, Test: {X_test.shape}")
print(f"Class distribution:\n{y_train.value_counts(normalize=True)}")
```

### Step 3: Build Preprocessing + Model Pipeline
```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier

numeric_features = ["age", "salary", "experience"]
categorical_features = ["department", "role"]

preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
    ]
)

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(random_state=42)),
])
```

### Step 4: Run Cross-Validation
```python
from sklearn.model_selection import cross_val_score

scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring="f1_weighted")
print(f"F1 Score (5-fold CV): {scores.mean():.3f} (+/- {scores.std():.3f})")
```

### Step 5: Compare Against Baseline
```python
from sklearn.dummy import DummyClassifier

baseline = DummyClassifier(strategy="most_frequent")
baseline.fit(X_train.select_dtypes(include="number"), y_train)
baseline_score = baseline.score(X_test.select_dtypes(include="number"), y_test)

print(f"Baseline accuracy: {baseline_score:.3f}")
```

### Step 6: Hyperparameter Tuning
```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    "classifier__n_estimators": [100, 200, 500],
    "classifier__max_depth": [10, 20, None],
    "classifier__min_samples_split": [2, 5, 10],
}

grid_search = GridSearchCV(
    pipeline, param_grid, cv=5, scoring="f1_weighted", n_jobs=-1, verbose=1
)
grid_search.fit(X_train, y_train)

print(f"Best params: {grid_search.best_params_}")
print(f"Best CV score: {grid_search.best_score_:.3f}")
```

For larger search spaces, use RandomizedSearchCV:
```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import randint, uniform

param_distributions = {
    "classifier__n_estimators": randint(50, 500),
    "classifier__max_depth": [5, 10, 20, None],
    "classifier__min_samples_split": randint(2, 20),
}

random_search = RandomizedSearchCV(
    pipeline, param_distributions, n_iter=50, cv=5,
    scoring="f1_weighted", n_jobs=-1, random_state=42
)
random_search.fit(X_train, y_train)
```

### Step 7: Final Evaluation on Test Set
```python
from sklearn.metrics import classification_report, confusion_matrix

y_pred = grid_search.predict(X_test)
print(classification_report(y_test, y_pred))
print(f"\nConfusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
print(f"Model accuracy: {grid_search.score(X_test, y_test):.3f}")
```

### Step 8: Save the Best Model
```bash
mkdir -p models
```
```python
import joblib

best_model = grid_search.best_estimator_
joblib.dump(best_model, "models/model_v1.pkl")
print("Saved best model to models/model_v1.pkl")

# Verify the saved model works
loaded_model = joblib.load("models/model_v1.pkl")
assert (loaded_model.predict(X_test) == y_pred).all()
print("Model verification passed!")
```

## Resources
- `references/model-selection-guide.md` - Which model to use for which problem
- `references/evaluation-metrics.md` - Metrics reference for classification and regression

## Examples
### Example 1: Train a Classifier
User asks: "Train a model to predict customer churn"
Response approach:
1. Load and split data with stratification
2. Build ColumnTransformer for numeric + categorical features
3. Create Pipeline with RandomForestClassifier
4. Run 5-fold cross-validation to get baseline performance
5. Compare against DummyClassifier
6. Tune with GridSearchCV
7. Evaluate on test set with classification_report
8. Save best model with joblib

### Example 2: Quick Model Comparison
User asks: "Which algorithm works best for this dataset?"
Response approach:
1. Build pipelines for multiple models (RF, LogisticRegression, GradientBoosting)
2. Run cross_val_score on each
3. Print comparison table of mean and std scores
4. Pick the best and run hyperparameter tuning
5. Report final test set performance

## Notes
- Always compare against a baseline before claiming good performance
- Use stratify=y in train_test_split for imbalanced classification
- GridSearchCV for small param spaces (<100 combos), RandomizedSearchCV for larger ones
- Never look at test set metrics until final evaluation
- Save both the model and the preprocessing pipeline together (Pipeline does this automatically)
