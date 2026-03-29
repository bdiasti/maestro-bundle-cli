# Graph Patterns Reference

## Common LangGraph Orchestration Patterns

### 1. Sequential Pipeline
```
START -> analyze -> plan -> execute -> validate -> END
```
Best for: Simple workflows with no branching.

### 2. Router Pattern
```
START -> analyze -> router --(frontend)--> agent_frontend -> merge
                          \--(backend)---> agent_backend  -> merge
                          \--(devops)----> agent_devops   -> merge
```
Best for: Task delegation to specialized agents.

### 3. Loop with Exit Condition
```
START -> plan -> execute -> check_done --(more tasks)--> execute
                                       \--(all done)---> validate -> END
```
Best for: Iterating through a task list.

### 4. Fan-Out / Fan-In (Parallel)
```python
from langgraph.types import Send

def fan_out(state):
    return [Send("execute_agent", {"task": t}) for t in state["task_plan"]]
```
Best for: Independent tasks that can run concurrently.

### 5. Human-in-the-Loop Gate
```python
from langgraph.types import interrupt

def approval_gate(state):
    result = interrupt({"message": "Approve?", "data": state["summary"]})
    return {"approved": result["decision"] == "yes"}
```
Best for: Destructive operations requiring human approval.

## State Design Principles

- Use `Annotated[list, add_messages]` for message accumulation.
- Use `dict[str, str]` for mappings that grow over time (branch_status, assigned_agents).
- Keep state flat -- avoid deeply nested structures.
- Include a `current_task_index` integer for loop-based task execution.
