# MLflow Quick Reference

## CLI Commands
```bash
# Start tracking server
mlflow server --host 0.0.0.0 --port 5000 --backend-store-uri sqlite:///mlflow.db

# List experiments
mlflow experiments list

# List runs in an experiment
mlflow runs list --experiment-id 1

# Serve a model
mlflow models serve -m "models:/model-name/Production" --port 5001 --no-conda

# Download artifacts
mlflow artifacts download -r <run-id> -d ./downloaded-artifacts
```

## Python API - Tracking
```python
import mlflow

mlflow.set_tracking_uri("http://localhost:5000")
mlflow.set_experiment("experiment-name")

# Auto-log everything (sklearn, pytorch, etc.)
mlflow.autolog()

# Manual logging
with mlflow.start_run(run_name="descriptive-name"):
    mlflow.log_param("learning_rate", 0.01)
    mlflow.log_params({"epochs": 100, "batch_size": 32})
    mlflow.log_metric("loss", 0.5)
    mlflow.log_metrics({"accuracy": 0.95, "f1": 0.92})
    mlflow.log_artifact("path/to/file.csv")
    mlflow.sklearn.log_model(model, "model")
```

## Python API - Model Registry
```python
client = mlflow.MlflowClient()

# Register model
mlflow.register_model("runs:/<run-id>/model", "model-name")

# List versions
versions = client.search_model_versions("name='model-name'")

# Get latest production version
prod = client.get_latest_versions("model-name", stages=["Production"])

# Transition stage
client.transition_model_version_stage("model-name", version=1, stage="Production")

# Load production model
model = mlflow.sklearn.load_model("models:/model-name/Production")
```

## Python API - Search Runs
```python
runs = mlflow.search_runs(
    experiment_ids=["1"],
    filter_string="metrics.f1 > 0.9",
    order_by=["metrics.f1 DESC"],
    max_results=10
)
```
