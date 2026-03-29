# Pydantic Patterns Reference

## Request Models

```python
from pydantic import BaseModel, Field, EmailStr

class CreateDemandRequest(BaseModel):
    description: str = Field(..., min_length=10, max_length=1000)
    requester: str = Field(..., min_length=1)
    priority: str = Field(default="medium", pattern="^(low|medium|high|critical)$")

class UpdateDemandRequest(BaseModel):
    description: str | None = Field(None, min_length=10, max_length=1000)
    priority: str | None = Field(None, pattern="^(low|medium|high|critical)$")
    status: str | None = Field(None, pattern="^(created|planned|in_progress|completed)$")
```

## Response Models

```python
from datetime import datetime

class DemandResponse(BaseModel):
    id: str
    description: str
    status: str
    requester: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
```

## Pagination

```python
from math import ceil
from typing import Generic, TypeVar

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    size: int
    pages: int

    @model_validator(mode="before")
    def calc_pages(cls, values):
        if values.get("size", 0) > 0:
            values["pages"] = ceil(values["total"] / values["size"])
        return values
```

## Validation Patterns

```python
from pydantic import field_validator

class CreateUserRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError("Username must be alphanumeric (with _ and -)")
        return v.lower()
```
