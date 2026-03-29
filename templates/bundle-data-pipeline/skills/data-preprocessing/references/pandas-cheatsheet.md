# Pandas Cheatsheet

## Loading Data
```python
pd.read_csv("file.csv")
pd.read_parquet("file.parquet")
pd.read_json("file.json")
pd.read_excel("file.xlsx", sheet_name="Sheet1")
pd.read_sql("SELECT * FROM table", connection)
```

## Inspection
```python
df.shape              # (rows, cols)
df.dtypes             # column types
df.info()             # memory usage + types
df.describe()         # numeric statistics
df.head(10)           # first 10 rows
df.sample(5)          # random 5 rows
df.nunique()          # unique values per column
df.isnull().sum()     # null counts per column
df.duplicated().sum() # total duplicate rows
```

## Filtering
```python
df[df['col'] > 10]
df[df['col'].isin(['a', 'b'])]
df.query("col > 10 and status == 'active'")
df[df['col'].between(5, 15)]
df[df['col'].str.contains('pattern', na=False)]
```

## Transformations
```python
df['col'] = df['col'].astype(int)
df['date'] = pd.to_datetime(df['date'])
df['col'] = df['col'].str.strip().str.lower()
df['new'] = df['a'] + df['b']
df['binned'] = pd.cut(df['value'], bins=5)
```

## Aggregations
```python
df.groupby('category')['value'].mean()
df.groupby('category').agg({'value': ['mean', 'std', 'count']})
df.pivot_table(values='value', index='category', columns='type', aggfunc='mean')
```

## Handling Nulls
```python
df.dropna(subset=['critical_col'])
df['col'].fillna(df['col'].median())
df['col'].fillna(method='ffill')
df.interpolate()
```

## Export
```python
df.to_csv("output.csv", index=False)
df.to_parquet("output.parquet", index=False)
df.to_json("output.json", orient="records")
```
