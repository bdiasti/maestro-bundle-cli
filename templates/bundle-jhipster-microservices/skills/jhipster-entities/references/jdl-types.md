# JDL Types Reference

## Field Types
| JDL Type | Java | DB | Notes |
|---|---|---|---|
| String | String | varchar(255) | Default max 255 |
| Integer | Integer | integer | 32-bit |
| Long | Long | bigint | 64-bit |
| Float | Float | float | Single precision |
| Double | Double | double | Double precision |
| BigDecimal | BigDecimal | decimal | Exact precision |
| Boolean | Boolean | boolean | |
| LocalDate | LocalDate | date | Date only |
| Instant | Instant | timestamp | UTC timestamp |
| ZonedDateTime | ZonedDateTime | timestamp | With timezone |
| Duration | Duration | bigint | Duration in nanos |
| UUID | UUID | uuid | Unique identifier |
| Blob | byte[] | blob | Binary data |
| AnyBlob | byte[] | blob | Any binary |
| ImageBlob | byte[] | blob | Image with content type |
| TextBlob | String | clob | Large text |

## Validations
| Validation | Applies to | Example |
|---|---|---|
| `required` | All | `name String required` |
| `minlength(n)` | String | `name String minlength(3)` |
| `maxlength(n)` | String | `name String maxlength(100)` |
| `min(n)` | Numeric | `price BigDecimal min(0)` |
| `max(n)` | Numeric | `quantity Integer max(1000)` |
| `pattern(regex)` | String | `sku String pattern(/^[A-Z]{3}-[0-9]{4}$/)` |
| `unique` | All | `email String unique` |

## Relationship Types
```jdl
relationship OneToMany {
    Owner{children} to Child{owner(displayField) required}
}
relationship ManyToMany {
    A{bs} to B{as}
}
relationship OneToOne {
    A{b} to B with jpaDerivedIdentifier
}
relationship ManyToOne {
    Child{parent(name)} to Parent
}
```

## Enum Definition
```jdl
enum Status {
    ACTIVE("Active"),
    INACTIVE("Inactive")
}
```
