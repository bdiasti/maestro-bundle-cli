# Scaling Guide

## Decision Matrix

| Scenario | Scaler | When to Use |
|---|---|---|
| Normal distribution, no outliers | StandardScaler | Default choice for most models |
| Need 0-1 range | MinMaxScaler | Neural networks, image data |
| Data has outliers | RobustScaler | Uses median/IQR, outlier-resistant |
| Sparse data | MaxAbsScaler | Preserves sparsity |

## StandardScaler (z-score normalization)
```python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

## MinMaxScaler (0-1 range)
```python
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler(feature_range=(0, 1))
X_scaled = scaler.fit_transform(X_train)
```

## RobustScaler (outlier-resistant)
```python
from sklearn.preprocessing import RobustScaler
scaler = RobustScaler()
X_scaled = scaler.fit_transform(X_train)
```

## Important Rules
1. Always fit on training data only
2. Save the scaler with joblib alongside the model
3. Tree-based models (RF, XGBoost) do NOT need scaling
4. Linear models, SVM, KNN, neural nets DO need scaling
