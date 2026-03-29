# Namespace Conventions Reference

## Store Namespace Structure

```
("agent", agent_type, category)
```

## Standard Namespaces

| Namespace | Purpose | Example Key |
|---|---|---|
| `("agent", "backend", "patterns")` | Code patterns learned by backend agent | `"fastapi-crud-pattern"` |
| `("agent", "frontend", "patterns")` | UI patterns learned by frontend agent | `"react-form-pattern"` |
| `("agent", "backend", "errors")` | Common errors and their fixes | `"alembic-migration-conflict"` |
| `("agent", "backend", "preferences")` | Team preferences for code style | `"prefer-dataclass-over-dict"` |
| `("project", "decisions")` | Architectural decisions | `"chose-fastapi-over-flask"` |
| `("project", "standards")` | Project-wide coding standards | `"naming-conventions"` |

## Value Schema

Every store entry should include these fields:

```python
{
    "pattern": str,        # The actual knowledge
    "learned_from": str,   # Which demand/task this came from
    "confidence": float,   # 0.0 to 1.0 (boost on positive feedback, decay on negative)
    "created_at": str,     # ISO timestamp
    "updated_at": str,     # ISO timestamp (updated on reinforcement)
    "usage_count": int,    # How many times this memory was retrieved
}
```

## Confidence Management

- **Initial**: 0.7 (new learning, not yet validated)
- **Reinforced**: +0.1 per positive use (max 1.0)
- **Contradicted**: -0.2 per negative feedback (min 0.0)
- **Cleanup threshold**: < 0.3 (remove on next cleanup run)
- **Time decay**: -0.05 per month without usage
