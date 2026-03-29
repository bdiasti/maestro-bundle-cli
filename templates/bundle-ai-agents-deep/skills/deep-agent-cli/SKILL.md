---
name: deep-agent-cli
description: Build and use the Deep Agents CLI for terminal-based coding agents. Use when creating a CLI coding agent, running Deep Agents from terminal, or building a Claude Code-like experience.
version: 1.0.0
author: Maestro
---

# Deep Agents CLI

Build a terminal-based coding agent similar to Claude Code using the Deep Agents CLI or by creating your own CLI interface.

## When to Use
- When you want a Claude Code-like experience in the terminal
- When building a CLI tool for AI-assisted coding
- When running Deep Agents interactively

## Available Operations
1. Install and use the official Deep Agents CLI
2. Build a custom CLI with rich terminal UI
3. Configure CLI with local file access + shell
4. Add skills and AGENTS.md to CLI agent

## Multi-Step Workflow

### Step 1: Install Deep Agents CLI

```bash
pip install deepagents
# or
uv tool install deepagents
```

### Step 2: Run the CLI

```bash
# Start interactive session
deepagents

# Start with a specific model
deepagents --model anthropic:claude-sonnet-4-6

# Start in a specific directory
deepagents --dir ./my-project

# Start with a prompt
deepagents "Fix the failing tests in src/auth/"
```

### Step 3: Build Custom CLI

```python
# cli.py
import asyncio
import sys
from deepagents import create_deep_agent
from deepagents.backends import LocalShellBackend
from langgraph.checkpoint.memory import MemorySaver

async def main():
    # Full coding agent with file + shell access
    agent = create_deep_agent(
        model="anthropic:claude-sonnet-4-6",
        backend=LocalShellBackend(root_dir="."),
        skills=["./skills/"],
        memory=["/AGENTS.md"],
        checkpointer=MemorySaver(),
        system_prompt="You are a coding assistant. Follow the project conventions."
    )

    config = {"configurable": {"thread_id": "cli-session"}}

    # One-shot mode
    if len(sys.argv) > 1:
        prompt = " ".join(sys.argv[1:])
        async for event in agent.astream_events(
            {"messages": [{"role": "user", "content": prompt}]},
            config=config, version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                print(event["data"]["chunk"].content, end="", flush=True)
        print()
        return

    # Interactive mode
    print("Coding Agent (type 'exit' to quit)\n")
    while True:
        try:
            user_input = input("> ")
        except (EOFError, KeyboardInterrupt):
            break

        if user_input.lower() in ("exit", "quit"):
            break

        async for event in agent.astream_events(
            {"messages": [{"role": "user", "content": user_input}]},
            config=config, version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                print(event["data"]["chunk"].content, end="", flush=True)
        print("\n")

asyncio.run(main())
```

### Step 4: Make it Installable

```toml
# pyproject.toml
[project]
name = "my-coding-agent"
version = "0.1.0"
dependencies = ["deepagents"]

[project.scripts]
myagent = "cli:main"
```

```bash
pip install -e .
myagent "Fix the auth tests"
```

### Step 5: Verify

```bash
# Run the CLI
python cli.py "List the files in the current directory"

# Interactive mode
python cli.py
```

## Resources
- `references/cli-patterns.md` — CLI design patterns

## Examples

### Example 1: Simple Coding Agent
User asks: "Create a CLI that can edit files and run tests"
Response approach:
1. Use `LocalShellBackend(root_dir=".")`
2. Add `skills=["./skills/"]` for project skills
3. Stream output with `astream_events`
4. Test in project directory

### Example 2: Add Project Context
User asks: "Agent should know our project conventions"
Response approach:
1. Create AGENTS.md with conventions
2. Pass `memory=["/AGENTS.md"]`
3. Agent loads it at startup

## Notes
- LocalShellBackend gives full filesystem + shell — use responsibly
- Always use `astream_events` for real-time output in CLI
- `checkpointer` enables conversation memory within session
- Skills load on-demand as user asks for things
