---
name: api-design
description: Design REST APIs with FastAPI or Spring Boot following patterns for versioning, pagination, error handling, and documentation. Use when creating endpoints, defining API contracts, or structuring controllers.
version: 1.0.0
author: Maestro
---

# API Design

Build production-ready REST APIs with standardized patterns for routing, pagination, error handling, versioning, and OpenAPI documentation.

## When to Use
- Creating new REST API endpoints
- Defining API contracts and response schemas
- Adding pagination, filtering, or sorting to list endpoints
- Implementing standardized error handling
- Setting up API versioning strategy
- Generating OpenAPI/Swagger documentation

## Available Operations
1. Create CRUD endpoints with FastAPI
2. Define request/response models with Pydantic
3. Implement standardized error handling
4. Add pagination to list endpoints
5. Configure API versioning
6. Generate and validate OpenAPI documentation

## Multi-Step Workflow

### Step 1: Define the REST Contract

Map business operations to HTTP methods and paths.

| Operation | Method | Path | Status | Body |
|---|---|---|---|---|
| List | GET | `/api/v1/demands` | 200 | Paginated list |
| Get | GET | `/api/v1/demands/{id}` | 200 | Single object |
| Create | POST | `/api/v1/demands` | 201 | Created object |
| Update | PUT | `/api/v1/demands/{id}` | 200 | Updated object |
| Patch | PATCH | `/api/v1/demands/{id}` | 200 | Updated object |
| Delete | DELETE | `/api/v1/demands/{id}` | 204 | Empty |

### Step 2: Create the Controller with FastAPI

```python
from fastapi import APIRouter, Depends, HTTPException, Query

router = APIRouter(prefix="/api/v1/demands", tags=["demands"])

@router.get("/", response_model=PaginatedResponse[DemandResponse])
async def list_demands(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    use_case: ListDemands = Depends()
):
    result = use_case.execute(page=page, size=size, status=status)
    return PaginatedResponse(
        items=result.items,
        total=result.total,
        page=page,
        size=size
    )

@router.post("/", response_model=DemandResponse, status_code=201)
async def create_demand(
    body: CreateDemandRequest,
    use_case: CreateDemand = Depends()
):
    return use_case.execute(body)

@router.get("/{demand_id}", response_model=DemandResponse)
async def get_demand(
    demand_id: str,
    use_case: GetDemand = Depends()
):
    result = use_case.execute(demand_id)
    if not result:
        raise HTTPException(status_code=404, detail="Demand not found")
    return result
```

### Step 3: Implement Error Handling

Standardize error responses across all endpoints.

```python
from pydantic import BaseModel
from fastapi.responses import JSONResponse

class ErrorResponse(BaseModel):
    error: str
    message: str
    details: list[str] | None = None

@app.exception_handler(DomainException)
async def domain_exception_handler(request, exc: DomainException):
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(error="domain_error", message=str(exc)).model_dump()
    )

@app.exception_handler(NotFoundException)
async def not_found_handler(request, exc: NotFoundException):
    return JSONResponse(
        status_code=404,
        content=ErrorResponse(error="not_found", message=str(exc)).model_dump()
    )
```

### Step 4: Add Pagination

Create a reusable pagination response model.

```python
from math import ceil
from pydantic import BaseModel, model_validator
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
        values["pages"] = ceil(values["total"] / values["size"])
        return values
```

### Step 5: Configure Versioning

Use path-based versioning: `/api/v1/`, `/api/v2/`.

```python
from fastapi import FastAPI

app = FastAPI(title="Maestro API", version="1.0.0")

# Mount versioned routers
app.include_router(demands_v1_router, prefix="/api/v1")
app.include_router(demands_v2_router, prefix="/api/v2")
```

**Rule**: Keep v1 running until all clients have migrated to v2.

### Step 6: Validate the API

Test endpoints and verify OpenAPI docs.

```bash
# Run the API server
uvicorn src.main:app --reload --port 8000

# Test an endpoint
curl -s http://localhost:8000/api/v1/demands?page=1&size=10 | python -m json.tool

# Verify OpenAPI schema is valid
curl -s http://localhost:8000/openapi.json | python -m json.tool > /dev/null && echo "Valid OpenAPI schema"

# Run API tests
pytest tests/api/ -v
```

## Resources
- `references/rest-conventions.md` - Complete REST naming and status code conventions
- `references/pydantic-patterns.md` - Common Pydantic model patterns for API schemas

## Examples

### Example 1: Build a Complete CRUD API
User asks: "Create a full CRUD API for managing tasks."
Response approach:
1. Define the 6 REST operations (list, get, create, update, patch, delete)
2. Create Pydantic models: `CreateTaskRequest`, `UpdateTaskRequest`, `TaskResponse`
3. Create `PaginatedResponse[TaskResponse]` for the list endpoint
4. Wire each endpoint to its corresponding use case
5. Add error handlers for `NotFoundException` and `ValidationError`
6. Test all endpoints with `pytest` and `httpx.AsyncClient`

### Example 2: Add Filtering and Sorting
User asks: "Add status filtering and date sorting to the demands list endpoint."
Response approach:
1. Add query parameters: `status: str | None`, `sort_by: str = "created_at"`, `sort_order: str = "desc"`
2. Pass parameters to the use case
3. Update the repository query to support filtering and ordering
4. Add index on the filtered/sorted columns if not present
5. Test with: `curl "http://localhost:8000/api/v1/demands?status=active&sort_by=created_at&sort_order=desc"`

### Example 3: Add API Authentication
User asks: "Protect our endpoints with JWT authentication."
Response approach:
1. Create a `get_current_user` dependency that validates JWT tokens
2. Add the dependency to protected endpoints
3. Create a `/auth/token` endpoint for token generation
4. Add 401 and 403 error handlers
5. Update OpenAPI schema with security definitions

## Notes
- Controllers should be thin: parse request -> call use case -> format response
- Always use Pydantic models for request validation (never trust raw input)
- Use `response_model` in route decorators to enforce response schema
- Pagination defaults: page=1, size=20, max size=100
- Path-based versioning (`/api/v1/`) is the simplest and most maintainable approach
- Generate OpenAPI docs automatically -- never maintain them manually
