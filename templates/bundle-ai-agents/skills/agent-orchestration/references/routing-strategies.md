# Routing Strategies Reference

## Strategy 1: Keyword-Based Routing

Fast, deterministic, zero-cost. Use as primary router.

```python
routing_map = {
    "frontend": ["ui", "component", "screen", "react", "css", "layout", "form"],
    "backend": ["api", "endpoint", "database", "service", "entity", "migration"],
    "devops": ["deploy", "pipeline", "docker", "k8s", "ci", "monitoring"],
    "qa": ["test", "coverage", "quality", "e2e", "integration test"],
}
```

## Strategy 2: LLM-Based Routing (Fallback)

Use when keywords are ambiguous. Costs tokens but handles edge cases.

```python
async def llm_route(task: dict) -> str:
    response = await llm.ainvoke(f"""
    Classify this task into exactly one category: frontend, backend, devops, qa.
    Task: {task['description']}
    Respond with just the category name.
    """)
    return response.content.strip().lower()
```

## Strategy 3: Embedding Similarity

Pre-embed descriptions for each agent type, route by cosine similarity.

```python
agent_descriptions = {
    "frontend": "UI components, React, CSS, forms, layouts, user interactions",
    "backend": "REST APIs, business logic, database operations, services",
    "devops": "Docker, CI/CD, deployments, infrastructure, monitoring",
}
```

## Fallback Chain

1. Try keyword match first (fastest).
2. If no match, try embedding similarity (medium cost).
3. If confidence < 0.7, use LLM routing (highest cost, best accuracy).
4. If LLM is uncertain, default to "backend" and flag for human review.
