# Evaluation Metrics Reference

## Classification Metrics

```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score
)

# All-in-one report
print(classification_report(y_test, y_pred))

# Individual metrics
accuracy_score(y_test, y_pred)
precision_score(y_test, y_pred, average='weighted')
recall_score(y_test, y_pred, average='weighted')
f1_score(y_test, y_pred, average='weighted')
roc_auc_score(y_test, y_pred_proba, multi_class='ovr')
```

### When to Use Which
| Metric | Use When |
|---|---|
| Accuracy | Balanced classes |
| Precision | False positives are costly (spam detection) |
| Recall | False negatives are costly (disease detection) |
| F1 | Imbalanced classes, need balance of precision/recall |
| ROC AUC | Need threshold-independent evaluation |

## Regression Metrics

```python
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    mean_absolute_percentage_error
)

mean_squared_error(y_test, y_pred)            # MSE
mean_squared_error(y_test, y_pred, squared=False)  # RMSE
mean_absolute_error(y_test, y_pred)           # MAE
r2_score(y_test, y_pred)                      # R-squared
mean_absolute_percentage_error(y_test, y_pred) # MAPE
```

### When to Use Which
| Metric | Use When |
|---|---|
| RMSE | Penalize large errors more |
| MAE | Robust to outliers |
| R-squared | Compare to baseline (0 = same as mean) |
| MAPE | Need percentage-based interpretation |
