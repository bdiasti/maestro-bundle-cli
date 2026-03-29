---
name: feature-engineering
description: Create and transform features for ML models including encoding, scaling, and feature selection. Use when you need to prepare data for training, create new features, encode categoricals, or select the most relevant variables.
version: 1.0.0
author: Maestro
---

# Feature Engineering

Build feature pipelines that transform raw data into model-ready inputs using scikit-learn.

## When to Use
- User needs to encode categorical variables (one-hot, ordinal, label)
- User needs to scale or normalize numeric features
- User wants to select the best features for a model
- User needs to create derived features (interactions, aggregations, date parts)
- User needs to remove outliers from a dataset

## Available Operations
1. Clean data and remove outliers (IQR method)
2. Encode categorical features (OneHot, Ordinal, Label)
3. Scale numeric features (Standard, MinMax, Robust)
4. Create derived features (date parts, interactions, aggregations)
5. Select top features (statistical tests, model importance)
6. Build a reusable sklearn ColumnTransformer pipeline

## Multi-Step Workflow

### Step 1: Install Dependencies
```bash
pip install pandas numpy scikit-learn joblib
```

### Step 2: Load and Split Data
```python
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

df = pd.read_parquet("data/processed/dataset_clean.parquet")

# Separate target
X = df.drop(columns=["target"])
y = df["target"]

# Split BEFORE any fitting -- prevents data leakage
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"Train: {X_train.shape}, Test: {X_test.shape}")
```

### Step 3: Remove Outliers (IQR Method)
```python
def remove_outliers_iqr(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    df = df.copy()
    for col in columns:
        Q1, Q3 = df[col].quantile([0.25, 0.75])
        IQR = Q3 - Q1
        mask = (df[col] >= Q1 - 1.5 * IQR) & (df[col] <= Q3 + 1.5 * IQR)
        before = len(df)
        df = df[mask]
        print(f"  {col}: removed {before - len(df)} outliers")
    return df

numeric_cols = X_train.select_dtypes(include=[np.number]).columns.tolist()
X_train = remove_outliers_iqr(X_train, numeric_cols)
y_train = y_train.loc[X_train.index]
```

### Step 4: Build Encoding and Scaling Pipeline
```python
from sklearn.preprocessing import StandardScaler, OneHotEncoder, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

numeric_features = ["age", "salary", "experience"]
categorical_features = ["department", "city"]
ordinal_features = ["level"]

preprocessor = ColumnTransformer(
    transformers=[
        ("num", StandardScaler(), numeric_features),
        ("cat", OneHotEncoder(sparse_output=False, handle_unknown="ignore"), categorical_features),
        ("ord", OrdinalEncoder(categories=[["junior", "mid", "senior"]]), ordinal_features),
    ],
    remainder="drop"
)

# Fit on train only, transform both
X_train_transformed = preprocessor.fit_transform(X_train)
X_test_transformed = preprocessor.transform(X_test)
print(f"Features after transform: {X_train_transformed.shape[1]}")
```

### Step 5: Feature Selection
```python
from sklearn.feature_selection import SelectKBest, f_classif, mutual_info_classif

# Statistical filter
selector = SelectKBest(score_func=f_classif, k=10)
X_selected = selector.fit_transform(X_train_transformed, y_train)

# Get selected feature names
feature_names = preprocessor.get_feature_names_out()
selected_mask = selector.get_support()
selected_features = feature_names[selected_mask]
print(f"Selected features: {list(selected_features)}")
```

Alternatively, use model-based importance:
```python
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train_transformed, y_train)
importances = pd.Series(rf.feature_importances_, index=feature_names)
top_features = importances.nlargest(10)
print(top_features)
```

### Step 6: Save Transformer for Reuse
```bash
mkdir -p models
```
```python
import joblib

joblib.dump(preprocessor, "models/preprocessor_v1.pkl")
print("Saved preprocessor to models/preprocessor_v1.pkl")

# To reload later:
# preprocessor = joblib.load("models/preprocessor_v1.pkl")
```

### Step 7: Verify Pipeline End-to-End
```bash
python -c "
import joblib, pandas as pd
p = joblib.load('models/preprocessor_v1.pkl')
df = pd.read_parquet('data/processed/dataset_clean.parquet').head(5)
X = df.drop(columns=['target'])
result = p.transform(X)
print(f'Input: {X.shape} -> Output: {result.shape}')
"
```

## Resources
- `references/encoding-guide.md` - When to use which encoder
- `references/scaling-guide.md` - Scaler comparison and selection

## Examples
### Example 1: Encode Categoricals
User asks: "Encode the department and city columns for my classifier"
Response approach:
1. Identify column cardinality with `df['col'].nunique()`
2. Use OneHotEncoder for low-cardinality unordered categoricals
3. Use OrdinalEncoder for ordered categoricals
4. Build a ColumnTransformer and fit on training data only
5. Save the fitted transformer with joblib

### Example 2: Select Best Features
User asks: "Which features matter most for predicting churn?"
Response approach:
1. Preprocess all features through the ColumnTransformer
2. Run SelectKBest with f_classif to rank features
3. Also run RandomForest feature_importances_ for comparison
4. Report the top 10 features from both methods
5. Recommend dropping low-importance features

## Notes
- Never fit encoders/scalers on test data -- fit on train, transform both
- Save transformers alongside the model with joblib for reproducibility
- Document each created feature: name, type, source column, transformation
- Check correlation between features and remove redundants (threshold > 0.95)
- For high-cardinality categoricals (>50 values), consider target encoding
