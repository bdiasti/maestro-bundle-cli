---
name: deep-agent-creation
description: Create Deep Agents with create_deep_agent(), configure model, tools, system prompt, and run. Use when starting a new deep agent project, configuring an agent, or adding tools.
version: 1.0.0
author: Maestro
---

# Deep Agent Creation

Create and configure Deep Agents using `create_deep_agent()` with tools, system prompts, and model selection.

## When to Use
- When creating a new Deep Agent from scratch
- When adding custom tools to an agent
- When configuring model and system prompt
- When setting up the main agent entry point

## Available Operations
1. Install Deep Agents SDK
2. Define custom tools
3. Create agent with `create_deep_agent()`
4. Run agent with `invoke()` or `stream()`
5. Configure model provider

## Multi-Step Workflow

### Step 1: Install

```bash
pip install deepagents
# or
uv add deepagents

# For search capability
pip install tavily-python
```

### Step 2: Set API Keys

```bash
export ANTHROPIC_API_KEY=your-key
# or
export OPENAI_API_KEY=your-key
```

### Step 3: Define Custom Tools

```python
# agent/tools.py
from langchain.tools import tool

@tool
def search_codebase(query: str, file_pattern: str = "**/*.py") -> str:
    """Search the codebase for files matching a pattern and containing a query."""
    import glob
    results = []
    for filepath in glob.glob(file_pattern, recursive=True):
        with open(filepath) as f:
            content = f.read()
            if query.lower() in content.lower():
                results.append(f"Found in {filepath}")
    return "\n".join(results) if results else "No matches found"

@tool
def run_tests(test_path: str = "tests/") -> str:
    """Run pytest on the specified path and return results."""
    import subprocess
    result = subprocess.run(
        ["pytest", test_path, "-v", "--tb=short"],
        capture_output=True, text=True, timeout=120
    )
    return result.stdout + result.stderr

@tool
def lint_code(path: str = "src/") -> str:
    """Run ruff linter on the specified path."""
    import subprocess
    result = subprocess.run(
        ["ruff", "check", path],
        capture_output=True, text=True
    )
    return result.stdout or "No lint issues found"
```

### Step 4: Create the Agent

```python
# agent/main.py
from deepagents import create_deep_agent
from agent.tools import search_codebase, run_tests, lint_code

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    tools=[search_codebase, run_tests, lint_code],
    system_prompt="""You are a coding assistant that helps developers write,
    test, and review code. You follow clean architecture principles and
    always run tests after making changes."""
)

# Run
config = {"configurable": {"thread_id": "session-1"}}
result = agent.invoke(
    {"messages": [{"role": "user", "content": "Review the auth module"}]},
    config=config
)
print(result["messages"][-1].content)
```

### Step 5: Stream Responses

```python
# For real-time output (like Claude Code)
async for event in agent.astream_events(
    {"messages": [{"role": "user", "content": "Fix the failing tests"}]},
    config=config,
    version="v2"
):
    if event["event"] == "on_chat_model_stream":
        print(event["data"]["chunk"].content, end="", flush=True)
```

### Step 6: Verify

```bash
# Run the agent
python agent/main.py

# Run tests
pytest tests/ -v
```

## Resources
- `references/deep-agents-api.md` — Full API reference for create_deep_agent()
- `references/model-providers.md` — Supported model providers and format

## Examples

### Example 1: Minimal Agent
User asks: "Create a simple deep agent with web search"
Response approach:
1. `pip install deepagents tavily-python`
2. Create `@tool` for Tavily search
3. Call `create_deep_agent(tools=[search])`
4. Test with `agent.invoke()`

### Example 2: Coding Agent
User asks: "Create an agent that can edit files and run tests"
Response approach:
1. Define tools: `run_tests`, `lint_code`, `search_codebase`
2. Use `FilesystemBackend` for file access
3. Add system prompt with coding conventions
4. Test end-to-end

### Example 3: Multi-Model Agent
User asks: "Use Claude for reasoning and GPT for code generation"
Response approach:
1. Main agent: `model="anthropic:claude-sonnet-4-6"`
2. Subagent for code: `model="openai:gpt-4o"`
3. Route tasks based on type

## Notes
- Built-in tools: `write_todos`, `ls`, `read_file`, `write_file`, `edit_file`, `glob`, `grep`, `task`
- Model format: `"provider:model-name"` (e.g., `"anthropic:claude-sonnet-4-6"`)
- Always use `thread_id` for conversation persistence
- System prompt is appended to built-in prompts, not replaces them
