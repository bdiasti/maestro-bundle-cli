---
name: deep-agent-subagents
description: Create and configure subagents for task delegation in Deep Agents. Use when delegating work to specialized agents, splitting complex tasks, or avoiding context bloat.
version: 1.0.0
author: Maestro
---

# Deep Agent Subagents

Create specialized subagents that the main agent delegates tasks to via the built-in `task` tool. Subagents run in isolation with their own context window.

## When to Use
- When the main agent needs to delegate specialized work
- When tasks would bloat the main agent's context
- When different tasks need different models or tools
- When building multi-agent orchestration

## Available Operations
1. Define subagent configurations
2. Register subagents with the main agent
3. Use different models per subagent
4. Give subagents their own tools and skills

## Multi-Step Workflow

### Step 1: Define Subagent Configs

```python
# agent/subagents.py

research_agent = {
    "name": "research-agent",
    "description": "Research topics in-depth using web search and documentation",
    "system_prompt": "You are a thorough researcher. Always cite sources.",
    "tools": [internet_search, read_documentation],
    "model": "anthropic:claude-sonnet-4-6",
}

code_agent = {
    "name": "code-agent",
    "description": "Write, refactor, and fix code following clean architecture",
    "system_prompt": "You are an expert programmer. Follow SOLID principles.",
    "tools": [run_tests, lint_code],
    "model": "anthropic:claude-sonnet-4-6",
}

review_agent = {
    "name": "review-agent",
    "description": "Review code for quality, security, and best practices",
    "system_prompt": "You are a senior code reviewer. Be thorough but constructive.",
    "tools": [lint_code, search_codebase],
    "model": "openai:gpt-4o",  # Can use different model
}
```

### Step 2: Register with Main Agent

```python
from deepagents import create_deep_agent

orchestrator = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    tools=[custom_tool],
    subagents=[research_agent, code_agent, review_agent],
    system_prompt="""You are an orchestrator. Delegate tasks to subagents:
    - research-agent: for research and documentation
    - code-agent: for writing and fixing code
    - review-agent: for code reviews"""
)
```

### Step 3: How Delegation Works

The main agent uses the built-in `task` tool to delegate:

```
Main Agent thinks: "I need to research authentication patterns"
Main Agent calls: task(agent="research-agent", task="Research JWT vs OAuth2 patterns")
→ research-agent runs independently
→ Returns summary to main agent
Main Agent continues with the research results
```

### Step 4: Subagents with Their Own Skills

```python
code_agent = {
    "name": "code-agent",
    "description": "Write code following project patterns",
    "system_prompt": "You are a coder.",
    "tools": [run_tests],
    "skills": ["/skills/clean-architecture/"],  # Subagent-specific skills
}
```

### Step 5: Test

```bash
python -c "
from deepagents import create_deep_agent

research = {'name': 'researcher', 'description': 'Research topics', 'system_prompt': 'Research thoroughly.'}
agent = create_deep_agent(subagents=[research])
result = agent.invoke({'messages': [{'role': 'user', 'content': 'Research best practices for error handling in Python'}]})
print(result['messages'][-1].content)
"
```

## Resources
- `references/subagent-patterns.md` — Common multi-agent patterns

## Examples

### Example 1: Research + Code Split
User asks: "Research auth patterns, then implement JWT"
Response approach:
1. Orchestrator delegates research to `research-agent`
2. Gets research summary back
3. Delegates implementation to `code-agent` with research context
4. Gets code back, runs tests

### Example 2: Parallel Reviews
User asks: "Review the PR from security and quality perspectives"
Response approach:
1. Create `security-reviewer` and `quality-reviewer` subagents
2. Delegate both reviews simultaneously
3. Aggregate results

### Example 3: Different Models per Task
User asks: "Use a cheaper model for simple tasks"
Response approach:
1. Main agent: `claude-sonnet-4-6` (reasoning)
2. Code subagent: `claude-sonnet-4-6` (code gen)
3. Summary subagent: `openai:gpt-4o-mini` (cheap summarization)

## Notes
- Subagents run in isolated context (no access to main agent's conversation)
- Skills are NOT inherited — pass them explicitly to each subagent
- Use subagents to avoid context bloat — delegate detailed work
- The `task` tool is built-in, no need to define it
- Each subagent can use a different model
