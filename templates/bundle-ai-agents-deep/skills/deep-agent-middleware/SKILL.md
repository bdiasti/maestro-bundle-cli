---
name: deep-agent-middleware
description: Configure and create custom middleware for Deep Agents including logging, validation, and tool interception. Use when adding cross-cutting concerns, logging tool calls, or modifying agent behavior.
version: 1.0.0
author: Maestro
---

# Deep Agent Middleware

Add cross-cutting concerns to Deep Agents with built-in and custom middleware for logging, validation, rate limiting, and tool interception.

## When to Use
- When you need to log all tool calls
- When you need to validate inputs before tools execute
- When you need rate limiting on API calls
- When you need custom behavior around tool execution

## Available Operations
1. Use built-in middleware (TodoList, Filesystem, SubAgent, Summarization)
2. Create custom middleware with `@wrap_tool_call`
3. Chain multiple middleware
4. Add conditional middleware

## Multi-Step Workflow

### Step 1: Understand Built-in Middleware

These are automatically active:

| Middleware | What it does | Can disable? |
|---|---|---|
| TodoListMiddleware | `write_todos` tool for planning | No |
| FilesystemMiddleware | `ls`, `read_file`, `write_file`, etc. | No |
| SubAgentMiddleware | `task` tool for delegation | No |
| SummarizationMiddleware | Compresses long conversations | No |
| AnthropicPromptCachingMiddleware | Token optimization for Anthropic | Auto |
| PatchToolCallsMiddleware | Repairs broken tool calls | Auto |

### Step 2: Create Custom Middleware

```python
# agent/middleware.py
from langchain.agents.middleware import wrap_tool_call
import time
import logging

logger = logging.getLogger(__name__)

@wrap_tool_call
def log_tool_calls(request, handler):
    """Log every tool call with timing."""
    start = time.time()
    logger.info(f"[TOOL] {request.name} called with: {request.args}")

    result = handler(request)

    duration = time.time() - start
    logger.info(f"[TOOL] {request.name} completed in {duration:.2f}s")
    return result

@wrap_tool_call
def validate_file_paths(request, handler):
    """Prevent access to sensitive files."""
    if request.name in ("read_file", "write_file", "edit_file"):
        path = request.args.get("path", "")
        blocked = [".env", "secrets", "credentials", ".git/config"]
        if any(b in path for b in blocked):
            return f"Access denied: {path} is a protected file"

    return handler(request)

@wrap_tool_call
def rate_limit_api_calls(request, handler):
    """Rate limit external API calls."""
    api_tools = ["internet_search", "call_api"]
    if request.name in api_tools:
        time.sleep(1)  # Simple rate limit

    return handler(request)
```

### Step 3: Register Middleware

```python
from deepagents import create_deep_agent
from agent.middleware import log_tool_calls, validate_file_paths, rate_limit_api_calls

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    middleware=[
        log_tool_calls,
        validate_file_paths,
        rate_limit_api_calls,
    ]
)
```

### Step 4: Verify

```bash
# Run agent and check logs
python agent/main.py 2>&1 | grep "[TOOL]"

# Run tests
pytest tests/test_middleware.py -v
```

## Resources
- `references/middleware-guide.md` — Middleware patterns and best practices

## Examples

### Example 1: Add Logging
User asks: "Log all tool calls with timing"
Response approach:
1. Create `@wrap_tool_call` that logs name, args, duration
2. Register in `create_deep_agent(middleware=[...])`
3. Run agent, check logs

### Example 2: Block Sensitive Files
User asks: "Agent should not read .env files"
Response approach:
1. Create middleware that checks file paths
2. Return "Access denied" for blocked paths
3. Test with agent trying to read .env

## Notes
- Do NOT mutate agent attributes after initialization — use graph state
- Middleware executes in order: first registered = outermost wrapper
- Built-in middleware cannot be removed
- Keep middleware lightweight — it runs on every tool call
