---
name: prompt-engineering
description: Create and optimize system prompts for AI agents following context engineering best practices. Use when writing prompts, improving existing prompts, or creating agent instructions.
version: 1.0.0
author: Maestro
---

# Prompt Engineering

Craft effective system prompts for AI agents using structured templates, best practices, and iterative refinement.

## When to Use
- Writing a new system prompt for an agent
- Improving an underperforming agent's instructions
- Creating role-specific prompts for multi-agent systems
- Reviewing prompts for anti-patterns and clarity issues
- Optimizing prompts to reduce token usage without losing quality

## Available Operations
1. Write a structured system prompt from scratch
2. Audit an existing prompt for anti-patterns
3. Refine a prompt based on agent evaluation results
4. Create few-shot examples for a prompt
5. Optimize prompt token count

## Multi-Step Workflow

### Step 1: Define the Prompt Structure

Every agent system prompt should follow this 6-part structure:

```
1. IDENTITY   -- Who the agent is
2. OBJECTIVE  -- What it must achieve
3. TOOLS      -- What it has available
4. RULES      -- Non-negotiable constraints
5. FORMAT     -- How to structure output
6. EXAMPLES   -- Concrete demonstrations
```

### Step 2: Write the System Prompt

Use the template below, filling in each section with specific details.

```python
SYSTEM_PROMPT = """
## Identity
You are {role}, specialized in {specialty}.

## Objective
Your mission is {primary_objective}. You work within Maestro,
a development governance platform.

## Available Tools
{list_of_tools_with_descriptions}

## Rules
1. Always follow the {bundle_name} bundle for code standards
2. Every commit must reference the task: {task_id}
3. Work only in the designated worktree: {worktree_path}
4. Report progress at every significant step
5. Request human review for destructive operations

## Response Format
- For code: use fenced code blocks with language specified
- For decisions: justify with "why"
- For errors: include context and suggested fix

## Example
Task: "Create endpoint GET /api/v1/demands"
Action: Create controller, use case, repository following Clean Architecture
Branch: feature/backend-{task_id}
"""
```

### Step 3: Apply Best Practices

Review the prompt against these rules:

1. **Be specific** -- "Create a REST API with FastAPI" > "Create an API"
2. **Explain why** -- "Use Value Objects because they enforce validation at construction" > "Use Value Objects"
3. **Give examples** -- One good example is worth 10 lines of instruction
4. **Avoid negatives** -- "Keep functions under 20 lines" > "Don't write long functions"
5. **Prioritize** -- Put the most important rules first (models pay more attention to early content)
6. **Test** -- Run the prompt with real scenarios before deploying

### Step 4: Check for Anti-Patterns

Audit the prompt for these common problems:

```bash
# Count NEVER/ALWAYS occurrences (too many weaken their impact)
grep -c -i "never\|always" prompt.md

# Check prompt length (over 5000 words causes focus loss)
wc -w prompt.md
```

Anti-patterns to fix:
- Excessive NEVER/ALWAYS (loses emphasis when overused)
- Contradictory instructions (e.g., "be concise" + "explain everything in detail")
- Prompts over 5000 words (agent loses focus on key instructions)
- Rules without justification (agent cannot reason about when to flex)

### Step 5: Test and Iterate

Run the prompt through evaluation scenarios to measure effectiveness.

```bash
python -m evals.run_prompt_eval --prompt prompts/agent_backend.md --scenarios evals/prompt_scenarios.json
```

Compare scores across prompt versions:

```bash
python -m evals.compare_prompts --v1 prompts/v1.md --v2 prompts/v2.md --scenarios evals/prompt_scenarios.json
```

## Resources
- `references/prompt-templates.md` - Ready-to-use prompt templates for common agent roles
- `references/anti-patterns.md` - Detailed anti-pattern catalog with fix examples

## Examples

### Example 1: Write a Backend Agent Prompt
User asks: "Create a system prompt for our backend agent that builds FastAPI endpoints."
Response approach:
1. Set identity to "Backend Engineer Agent, specialized in FastAPI and Clean Architecture"
2. Define objective: "Build production-ready REST API endpoints following bundle standards"
3. List tools: file operations, git commands, test runner, linter
4. Set rules: follow clean-architecture skill, enforce test coverage > 80%, use typed DTOs
5. Add format section for code blocks and error reporting
6. Include a concrete example of building a CRUD endpoint

### Example 2: Fix an Underperforming Prompt
User asks: "Our agent keeps ignoring the coding standards. Fix the prompt."
Response approach:
1. Read the current prompt and check for vague instructions
2. Look for missing justifications on rules (agent doesn't understand importance)
3. Move coding standards rules higher in the prompt (priority by position)
4. Add a concrete example showing compliant vs non-compliant code
5. Add a "Common Mistakes" section with specific things to avoid

### Example 3: Reduce Prompt Token Count
User asks: "The system prompt is too long, cut it down without losing quality."
Response approach:
1. Count current tokens with `tiktoken`
2. Move detailed reference material to skill files loaded on-demand
3. Replace verbose explanations with concise bullet points
4. Keep examples (they're high-value) but trim redundant ones
5. Target: system prompt under 2000 tokens, details in skills

## Notes
- System prompts should stay under 2000 tokens; move details to on-demand skills
- Test every prompt change with at least 5 real-world scenarios
- Version your prompts (v1, v2, etc.) and track performance across versions
- The first 500 tokens of a prompt get the most attention from the model
- Few-shot examples are the single most effective prompting technique
