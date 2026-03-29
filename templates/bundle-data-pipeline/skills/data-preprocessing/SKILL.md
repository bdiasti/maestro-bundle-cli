---
name: data-preprocessing
description: Preprocess data with Pandas and NumPy including cleaning, transformation, and exploratory analysis. Use when you need to clean data, run EDA, validate schemas, or prepare datasets for ML pipelines.
version: 1.0.0
author: Maestro
---

# Data Preprocessing

Build data cleaning and preparation pipelines using Pandas, NumPy, and Pandera.

## When to Use
- User needs to clean a raw CSV/Parquet/JSON dataset
- User asks for exploratory data analysis (EDA)
- User needs to handle missing values, duplicates, or type conversions
- User wants to validate data against a schema
- User needs to prepare data before feature engineering or model training

## Available Operations
1. Run exploratory data analysis (EDA) on a dataset
2. Build a cleaning pipeline (dedup, nulls, types, normalization)
3. Validate data with Pandera schemas
4. Profile data quality and generate reports
5. Export cleaned data to Parquet/CSV

## Multi-Step Workflow

### Step 1: Install Dependencies
```bash
pip install pandas numpy pandera pyarrow openpyxl
```

### Step 2: Load and Inspect Data
```python
import pandas as pd
import numpy as np

# Load data (adjust path/format as needed)
df = pd.read_csv("data/raw/dataset.csv")
# or: df = pd.read_parquet("data/raw/dataset.parquet")
# or: df = pd.read_json("data/raw/dataset.json")

# Quick inspection
print(f"Shape: {df.shape}")
print(f"Columns: {list(df.columns)}")
print(df.dtypes)
print(df.head())
```

### Step 3: Run Exploratory Data Analysis
```python
def eda_report(df: pd.DataFrame) -> dict:
    return {
        "shape": df.shape,
        "dtypes": df.dtypes.to_dict(),
        "nulls": df.isnull().sum().to_dict(),
        "null_pct": (df.isnull().sum() / len(df) * 100).round(2).to_dict(),
        "duplicates": df.duplicated().sum(),
        "numeric_stats": df.describe().to_dict(),
        "categorical_counts": {
            col: df[col].value_counts().head(10).to_dict()
            for col in df.select_dtypes(include='object').columns
        }
    }

report = eda_report(df)
for key, value in report.items():
    print(f"\n--- {key} ---")
    print(value)
```

### Step 4: Build and Run Cleaning Pipeline
```python
def clean_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # 1. Remove duplicates
    before = len(df)
    df = df.drop_duplicates()
    print(f"Removed {before - len(df)} duplicate rows")

    # 2. Fix date columns
    date_cols = [c for c in df.columns if 'date' in c.lower() or c.endswith('_at')]
    for col in date_cols:
        df[col] = pd.to_datetime(df[col], errors='coerce')

    # 3. Handle numeric nulls
    for col in df.select_dtypes(include=[np.number]).columns:
        null_pct = df[col].isnull().sum() / len(df)
        if null_pct < 0.05:
            df[col] = df[col].fillna(df[col].median())
        elif null_pct > 0.5:
            print(f"Dropping column '{col}' ({null_pct:.0%} nulls)")
            df = df.drop(columns=[col])

    # 4. Handle categorical nulls
    for col in df.select_dtypes(include='object').columns:
        df[col] = df[col].fillna('unknown')

    # 5. Normalize strings
    for col in df.select_dtypes(include='object').columns:
        df[col] = df[col].str.strip().str.lower()

    return df

df_clean = clean_pipeline(df)
```

### Step 5: Validate with Pandera
```python
import pandera as pa

schema = pa.DataFrameSchema({
    "id": pa.Column(str, nullable=False, unique=True),
    "description": pa.Column(str, nullable=False),
    "status": pa.Column(str, pa.Check.isin(["created", "planned", "completed"])),
    "score": pa.Column(float, pa.Check.between(0, 100), nullable=True),
    "created_at": pa.Column("datetime64[ns]", nullable=False),
})

validated_df = schema.validate(df_clean)
print("Validation passed!")
```

### Step 6: Export Cleaned Data
```bash
mkdir -p data/processed
```
```python
df_clean.to_parquet("data/processed/dataset_clean.parquet", index=False)
# or: df_clean.to_csv("data/processed/dataset_clean.csv", index=False)
print(f"Exported {len(df_clean)} rows to data/processed/")
```

### Step 7: Verify Output
```bash
python -c "import pandas as pd; df = pd.read_parquet('data/processed/dataset_clean.parquet'); print(f'Rows: {len(df)}, Cols: {len(df.columns)}'); print(df.dtypes)"
```

## Resources
- `references/pandas-cheatsheet.md` - Common Pandas operations and patterns
- `references/pandera-schemas.md` - Schema validation examples

## Examples
### Example 1: Clean a CSV for Analysis
User asks: "Clean this sales data CSV and remove duplicates"
Response approach:
1. Load CSV with `pd.read_csv()`
2. Run `eda_report()` to understand the data
3. Apply `clean_pipeline()` to remove duplicates and handle nulls
4. Export cleaned data to Parquet
5. Print before/after comparison of row counts and null percentages

### Example 2: Validate Data Before Training
User asks: "Make sure this dataset matches our expected schema before training"
Response approach:
1. Load dataset and inspect dtypes
2. Define Pandera schema matching expected columns and constraints
3. Run `schema.validate(df)` and fix any failures
4. Export validated dataset

## Notes
- Always run EDA before cleaning to understand data distribution
- Use Parquet over CSV for production pipelines (better types, compression)
- Log the number of rows removed at each cleaning step
- Never modify the original data file -- write to a separate output path
