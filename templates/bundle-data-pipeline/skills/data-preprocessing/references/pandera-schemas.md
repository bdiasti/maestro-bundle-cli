# Pandera Schema Validation Reference

## Basic Schema
```python
import pandera as pa

schema = pa.DataFrameSchema({
    "id": pa.Column(int, nullable=False, unique=True),
    "name": pa.Column(str, nullable=False),
    "score": pa.Column(float, pa.Check.between(0, 100)),
    "status": pa.Column(str, pa.Check.isin(["active", "inactive"])),
})

validated = schema.validate(df)
```

## Common Checks
```python
pa.Check.between(0, 100)           # range check
pa.Check.isin(["a", "b", "c"])     # allowed values
pa.Check.str_matches(r"^\d{3}$")   # regex match
pa.Check.gt(0)                     # greater than
pa.Check.le(1.0)                   # less than or equal
pa.Check(lambda s: s.str.len() > 3) # custom check
```

## Schema-Level Checks
```python
schema = pa.DataFrameSchema(
    columns={...},
    checks=[
        pa.Check(lambda df: df["end_date"] > df["start_date"]),
    ],
    index=pa.Index(int, name="idx"),
    coerce=True,  # auto-coerce types
)
```

## Decorator Validation
```python
@pa.check_input(schema)
def process_data(df: pd.DataFrame) -> pd.DataFrame:
    return df.assign(processed=True)
```
