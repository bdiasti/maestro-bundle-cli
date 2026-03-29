# Encoding Guide

## Decision Matrix

| Scenario | Encoder | Example |
|---|---|---|
| Unordered, low cardinality (<15) | OneHotEncoder | department, color |
| Ordered categories | OrdinalEncoder | level (junior/mid/senior) |
| Binary target variable | LabelEncoder | yes/no, churn/retain |
| High cardinality (>50) | TargetEncoder | zip_code, product_id |
| Text-like categories | HashingEncoder | free-text categories |

## OneHotEncoder
```python
from sklearn.preprocessing import OneHotEncoder
ohe = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
encoded = ohe.fit_transform(df[['department', 'city']])
feature_names = ohe.get_feature_names_out()
```

## OrdinalEncoder
```python
from sklearn.preprocessing import OrdinalEncoder
oe = OrdinalEncoder(categories=[['junior', 'mid', 'senior']])
df['level_encoded'] = oe.fit_transform(df[['level']])
```

## LabelEncoder (target only)
```python
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
y = le.fit_transform(df['target'])
# Decode: le.inverse_transform(y)
```

## TargetEncoder (high cardinality)
```python
from sklearn.preprocessing import TargetEncoder
te = TargetEncoder(smooth="auto")
df['zip_encoded'] = te.fit_transform(df[['zip_code']], y)
```
