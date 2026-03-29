---
name: mlops-pipeline
description: Build MLOps pipelines with MLflow for experiment tracking, model registry, and automated deployment. Use when you need to version models, track experiments, automate training pipelines, or configure a model registry.
version: 1.0.0
author: Maestro
---

# MLOps Pipeline

Set up end-to-end MLOps workflows using MLflow for experiment tracking, model versioning, and automated training pipelines.

## When to Use
- User needs to track experiments (parameters, metrics, artifacts)
- User wants to version and register models
- User needs to compare runs and select the best model
- User wants to automate a training pipeline with promotion logic
- User needs to serve a model via MLflow

## Available Operations
1. Set up MLflow tracking server
2. Log experiments (params, metrics, artifacts, models)
3. Register models in the Model Registry
4. Promote models through stages (Staging -> Production)
5. Build an automated training pipeline with comparison logic
6. Serve a model via MLflow REST API

## Multi-Step Workflow

### Step 1: Install Dependencies
```bash
pip install mlflow scikit-learn pandas boto3
```

### Step 2: Start MLflow Tracking Server (Local Development)
```bash
mlflow server --host 0.0.0.0 --port 5000 --backend-store-uri sqlite:///mlflow.db --default-artifact-root ./mlflow-artifacts
```

For production, use a remote tracking URI:
```bash
export MLFLOW_TRACKING_URI=http://mlflow.your-domain.com
```

### Step 3: Create an Experiment and Log a Run
```python
import mlflow
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score

mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("my-classifier")

with mlflow.start_run(run_name="rf-baseline"):
    # Log parameters
    params = {"n_estimators": 200, "max_depth": 20, "cv_folds": 5}
    mlflow.log_params(params)

    # Train model
    model = RandomForestClassifier(**{k: v for k, v in params.items() if k != "cv_folds"}, random_state=42)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # Log metrics
    metrics = {
        "accuracy": accuracy_score(y_test, y_pred),
        "f1": f1_score(y_test, y_pred, average="weighted"),
        "precision": precision_score(y_test, y_pred, average="weighted"),
    }
    mlflow.log_metrics(metrics)
    print(f"Metrics: {metrics}")

    # Log model
    mlflow.sklearn.log_model(model, "model")
    print(f"Run ID: {mlflow.active_run().info.run_id}")
```

### Step 4: Compare Runs
```bash
mlflow runs list --experiment-id 1 --order-by "metrics.f1 DESC"
```

Or programmatically:
```python
import mlflow

experiment = mlflow.get_experiment_by_name("my-classifier")
runs = mlflow.search_runs(experiment_ids=[experiment.experiment_id], order_by=["metrics.f1 DESC"])
print(runs[["run_id", "params.n_estimators", "metrics.f1", "metrics.accuracy"]].head(10))
```

### Step 5: Register the Best Model
```python
run_id = runs.iloc[0]["run_id"]  # best run by F1
model_uri = f"runs:/{run_id}/model"

result = mlflow.register_model(model_uri, "my-classifier")
print(f"Registered model version: {result.version}")
```

### Step 6: Promote to Production
```python
client = mlflow.MlflowClient()

# Move to staging first
client.transition_model_version_stage(
    name="my-classifier", version=result.version, stage="Staging"
)
print(f"Model v{result.version} moved to Staging")

# After validation, promote to production
client.transition_model_version_stage(
    name="my-classifier", version=result.version, stage="Production"
)
print(f"Model v{result.version} promoted to Production")
```

### Step 7: Build Automated Training Pipeline
```python
# pipelines/training.py
import mlflow
from sklearn.model_selection import train_test_split

def training_pipeline(data_path: str, experiment_name: str, model_name: str):
    """End-to-end pipeline: load -> train -> evaluate -> register if better."""
    mlflow.set_experiment(experiment_name)

    # 1. Load and split
    df = pd.read_parquet(data_path)
    X = df.drop(columns=["target"])
    y = df["target"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 2. Train with tracking
    with mlflow.start_run():
        model = train_model(X_train, y_train)
        metrics = evaluate_model(model, X_test, y_test)
        mlflow.log_metrics(metrics)
        mlflow.sklearn.log_model(model, "model")

        # 3. Compare with current production
        client = mlflow.MlflowClient()
        try:
            prod_versions = client.get_latest_versions(model_name, stages=["Production"])
            prod_run = client.get_run(prod_versions[0].run_id)
            prod_f1 = float(prod_run.data.metrics.get("f1", 0))
        except Exception:
            prod_f1 = 0.0

        # 4. Register if better
        if metrics["f1"] > prod_f1:
            result = mlflow.register_model(f"runs:/{mlflow.active_run().info.run_id}/model", model_name)
            client.transition_model_version_stage(name=model_name, version=result.version, stage="Staging")
            print(f"New candidate v{result.version}: F1={metrics['f1']:.3f} > Production F1={prod_f1:.3f}")
        else:
            print(f"Model not better: F1={metrics['f1']:.3f} <= Production F1={prod_f1:.3f}")

if __name__ == "__main__":
    training_pipeline("data/processed/dataset.parquet", "my-classifier", "my-classifier")
```

### Step 8: Serve Model via REST API
```bash
mlflow models serve -m "models:/my-classifier/Production" --port 5001 --no-conda
```

Test the endpoint:
```bash
curl -X POST http://localhost:5001/invocations -H "Content-Type: application/json" -d '{"inputs": [{"age": 30, "salary": 50000}]}'
```

## Resources
- `references/mlflow-commands.md` - MLflow CLI and Python API quick reference

## Examples
### Example 1: Track a New Experiment
User asks: "Set up experiment tracking for our fraud detection model"
Response approach:
1. Install mlflow and set tracking URI
2. Create experiment with `mlflow.set_experiment("fraud-detection")`
3. Log params, metrics, and model inside `mlflow.start_run()`
4. Show how to view results in MLflow UI at http://localhost:5000

### Example 2: Promote a Model
User asks: "Our latest model passed validation, deploy it to production"
Response approach:
1. Find the latest Staging model version with `get_latest_versions`
2. Transition to Production with `transition_model_version_stage`
3. Verify with `mlflow models serve`
4. Test the endpoint with curl

## Notes
- Always log both parameters and metrics for every run
- Use `mlflow.autolog()` for automatic logging with sklearn, pytorch, etc.
- Set meaningful run names for easier comparison in the UI
- Never skip the baseline comparison step when training new models
- For team setups, use a shared PostgreSQL backend instead of SQLite
