# REST Conventions Reference

## URL Naming

- Use plural nouns: `/demands`, `/tasks`, `/users`
- Use kebab-case for multi-word resources: `/task-assignments`
- Nest for relationships: `/demands/{id}/tasks`
- Maximum 2 levels of nesting
- Query parameters for filtering: `?status=active&sort_by=created_at`

## HTTP Methods

| Method | Idempotent | Safe | Use For |
|---|---|---|---|
| GET | Yes | Yes | Read resources |
| POST | No | No | Create resources |
| PUT | Yes | No | Full update (replace) |
| PATCH | No | No | Partial update |
| DELETE | Yes | No | Remove resources |

## Status Codes

| Code | Meaning | When to Use |
|---|---|---|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Malformed request body |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource or state conflict |
| 422 | Unprocessable Entity | Valid syntax but business rule violation |
| 500 | Internal Server Error | Unexpected server failure |

## Error Response Format

```json
{
  "error": "not_found",
  "message": "Demand with id 'abc-123' not found",
  "details": ["Check the demand ID and try again"]
}
```

## Headers

- `Content-Type: application/json` on all responses
- `Location: /api/v1/demands/{id}` on 201 Created
- `X-Request-Id: uuid` for tracing
- `X-Total-Count: 42` for pagination metadata (optional)
