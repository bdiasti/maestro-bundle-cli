---
name: context-engineering
description: Implement the 4 context engineering strategies (Write, Select, Compress, Isolate) for AI agents. Use when managing context windows, optimizing what an agent receives, or reducing token costs.
version: 1.0.0
author: Maestro
---

# Context Engineering

Apply the four context engineering strategies -- Write, Select, Compress, Isolate -- to maximize agent effectiveness while minimizing token costs.

## When to Use
- Designing what context an agent receives before execution
- Optimizing a system prompt that is too long or unfocused
- Reducing token costs on expensive LLM calls
- Setting up context isolation between agents in a multi-agent system
- Debugging an agent that "forgets" instructions or loses focus

## Available Operations
1. Write persistent context (CLAUDE.md, agents.md, skills)
2. Select relevant context via retrieval
3. Compress context to reduce token usage
4. Isolate context per agent scope
5. Budget context allocation across the window

## Multi-Step Workflow

### Step 1: Write Context -- Persistent Memory

Define what the agent "knows" before any task begins. This is your baseline context layer.

```
CLAUDE.md          -> Project standards, architecture, decisions
agents.md          -> Agent-specific behavior and role definition
skills/SKILL.md    -> On-demand capabilities loaded when needed
memory/            -> Learnings from previous executions
```

Check your CLAUDE.md token count:

```bash
wc -w CLAUDE.md  # Should be under ~1500 words (~2000 tokens)
```

**Rule**: CLAUDE.md must stay under 2000 tokens. If it grows beyond that, move details into skills that are loaded on-demand.

### Step 2: Select Context -- Retrieval for the Current Task

Inject only the context relevant to the current task. Never dump everything.

```python
def select_context(task: Task, retriever) -> str:
    # Retrieve skills relevant to the task
    relevant_skills = retriever.invoke(task.description)

    # Search for related code in the repository
    related_code = code_search(task.description, worktree_path)

    # Find similar past decisions
    past_decisions = memory_store.search(task.description, k=3)

    return format_context(relevant_skills, related_code, past_decisions)
```

**Rule**: Never inject more than 30% of the context window with selected context. Leave space for the agent to reason.

### Step 3: Compress Context -- Reduce Without Losing Essentials

When context exceeds budget, compress it while preserving critical information.

```python
async def compress_code(code: str, max_tokens: int = 2000) -> str:
    if count_tokens(code) <= max_tokens:
        return code

    summary = await llm.ainvoke(f"""
    Summarize this code keeping:
    - Function/class signatures
    - Input/output types
    - Main logic (without implementation details)
    - Relevant imports

    Code:
    {code}
    """)
    return summary.content
```

**Rule**: Never compress code the agent is about to modify. That code must remain complete and uncompressed.

### Step 4: Isolate Context -- Scope Per Agent

Each agent should see only what it needs. No shared context windows.

```python
agent_contexts = {
    "frontend": {
        "sees": ["src/features/", "src/shared/", "package.json"],
        "not_sees": ["src/domain/", "infra/", "alembic/"],
        "skills": ["react-patterns", "component-design"],
    },
    "backend": {
        "sees": ["src/domain/", "src/application/", "src/api/"],
        "not_sees": ["src/features/", "node_modules/"],
        "skills": ["clean-architecture", "ddd-tactical"],
    }
}
```

**Rule**: Agents never share a context window. Communication happens via structured messages, not shared context.

### Step 5: Budget Context Allocation

For a 200k token model, allocate the context window as follows:

| Component | % | Tokens | Description |
|---|---|---|---|
| System prompt + CLAUDE.md | 5% | 10k | Identity, rules, format |
| Loaded skills | 10% | 20k | On-demand capabilities |
| Retrieved code/docs (Select) | 25% | 50k | Task-relevant context |
| Conversation history | 15% | 30k | Previous messages |
| **Reasoning space** | **45%** | **90k** | Model's working memory |

Verify current usage:

```bash
python -m context.budget --prompt system_prompt.md --skills skills/ --history conversation.json
```

## Resources
- `references/context-budget-calculator.md` - Formulas and guidelines for calculating context budgets
- `references/compression-techniques.md` - Techniques for compressing different content types

## Examples

### Example 1: Set Up Context for a New Agent
User asks: "Configure the context strategy for our new QA agent."
Response approach:
1. Write: Create agents/qa.md with QA agent identity, rules, and test standards
2. Select: Configure retriever to pull test files and coverage reports relevant to the task
3. Isolate: Limit visibility to `tests/`, `src/` (read-only), and CI config files
4. Budget: Allocate 5% system prompt, 20% test context, 20% source code, 55% reasoning

### Example 2: Fix an Agent That Loses Focus
User asks: "Our backend agent keeps forgetting to follow Clean Architecture halfway through long tasks."
Response approach:
1. Check CLAUDE.md size -- if over 2000 tokens, move details to skills
2. Move Clean Architecture rules into a skill that gets loaded per-task
3. Add a "checkpoint" mechanism: after every 5 tool calls, re-inject key rules
4. Reduce conversation history to last 10 messages to free reasoning space

### Example 3: Reduce Token Costs
User asks: "Our agent costs are too high. Optimize the context usage."
Response approach:
1. Audit current context window usage with the budget calculator
2. Compress code summaries for files the agent reads but does not modify
3. Reduce retrieved context from k=20 to k=5 with re-ranking
4. Shorten system prompt by moving examples to a skill file
5. Target: 40% reduction in input tokens per invocation

## Notes
- The 45% reasoning space is sacred -- never fill more than 55% of the window with context
- CLAUDE.md changes affect all agents -- be deliberate about what goes there
- Skills are the pressure release valve: move detailed instructions there for on-demand loading
- Monitor token usage per agent invocation to catch context bloat early
- Code the agent will modify must always be included uncompressed
