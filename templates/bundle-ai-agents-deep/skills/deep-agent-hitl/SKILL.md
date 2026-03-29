---
name: deep-agent-hitl
description: Configure human-in-the-loop approval workflows for Deep Agents. Use when requiring human approval before destructive operations like file deletion, deployment, or email sending.
version: 1.0.0
author: Maestro
---

# Deep Agent Human-in-the-Loop

Configure approval gates that pause the agent and wait for human approval before executing sensitive operations.

## When to Use
- When the agent should ask before deleting files
- When deploys require human approval
- When sending emails/messages needs confirmation
- When any destructive operation needs a gate

## Available Operations
1. Configure `interrupt_on` per tool
2. Handle approval/rejection flow
3. Resume after approval
4. Custom approval decisions

## Multi-Step Workflow

### Step 1: Configure Interrupts

```python
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    tools=[delete_file, read_file, send_email, deploy],
    interrupt_on={
        "delete_file": True,       # Always ask
        "read_file": False,         # Never ask
        "send_email": True,         # Always ask
        "deploy": True,             # Always ask
        "write_file": {             # Custom decisions
            "allowed_decisions": ["approve", "reject", "modify"]
        }
    },
    checkpointer=MemorySaver()  # REQUIRED for interrupts
)
```

### Step 2: Run and Handle Interrupts

```python
config = {"configurable": {"thread_id": "session-1"}}

# Agent runs until it hits an interrupt
result = agent.invoke(
    {"messages": [{"role": "user", "content": "Delete the old log files"}]},
    config=config
)

# Check if agent is waiting for approval
if result.get("__interrupt__"):
    interrupt = result["__interrupt__"]
    print(f"Agent wants to: {interrupt['tool']} with args: {interrupt['args']}")

    # Approve
    result = agent.invoke(
        {"messages": [{"role": "user", "content": "approved"}]},
        config=config
    )

    # Or reject
    # result = agent.invoke(
    #     {"messages": [{"role": "user", "content": "rejected, don't delete those"}]},
    #     config=config
    # )
```

### Step 3: Build Approval UI (FastAPI)

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ApprovalRequest(BaseModel):
    session_id: str
    decision: str  # "approve" or "reject"
    reason: str = ""

@app.post("/api/approve")
async def approve(req: ApprovalRequest):
    config = {"configurable": {"thread_id": req.session_id}}
    result = agent.invoke(
        {"messages": [{"role": "user", "content": req.decision}]},
        config=config
    )
    return {"status": "resumed", "result": result["messages"][-1].content}
```

### Step 4: Verify

```bash
python -c "
from deepagents import create_deep_agent
from langchain.tools import tool
from langgraph.checkpoint.memory import MemorySaver

@tool
def dangerous_operation(action: str) -> str:
    '''Execute a dangerous operation.'''
    return f'Executed: {action}'

agent = create_deep_agent(
    tools=[dangerous_operation],
    interrupt_on={'dangerous_operation': True},
    checkpointer=MemorySaver()
)

config = {'configurable': {'thread_id': 'test-hitl'}}
result = agent.invoke(
    {'messages': [{'role': 'user', 'content': 'Run dangerous operation: cleanup'}]},
    config=config
)
print('Interrupted:', bool(result.get('__interrupt__')))
"
```

## Resources
- `references/hitl-patterns.md` — Human-in-the-loop patterns

## Examples

### Example 1: Approve Before Deploy
User asks: "Agent should ask before deploying"
Response approach:
1. Add `"deploy": True` to `interrupt_on`
2. Agent pauses before calling deploy tool
3. Show user what will be deployed
4. Resume on approval

### Example 2: Custom Approval Decisions
User asks: "For file writes, allow approve, reject, or modify"
Response approach:
1. Use `{"write_file": {"allowed_decisions": ["approve", "reject", "modify"]}}`
2. If "modify", user provides updated content
3. Agent retries with modified input

## Notes
- `checkpointer` is REQUIRED — without it, interrupts don't work
- Agent remembers state during interrupt — it resumes exactly where it paused
- Use for: delete, deploy, send email, run destructive commands
- Don't interrupt on read-only operations (wastes user's time)
