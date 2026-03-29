---
name: agent-orchestration
description: Build multi-agent systems with LangGraph including orchestrator, subagents, routing, and delegation. Use when coordinating multiple agents, creating agent teams, or implementing orchestration workflows.
version: 1.0.0
author: Maestro
---

# Agent Orchestration

Design and implement multi-agent systems where an orchestrator coordinates specialized subagents through task planning, intelligent routing, compliance validation, and human-in-the-loop approval.

## When to Use
- Coordinating multiple specialized agents (frontend, backend, devops)
- Implementing task decomposition and delegation workflows
- Building a LangGraph StateGraph with routing logic
- Adding human-in-the-loop approval gates for destructive operations
- Creating agent pipelines that validate compliance before merging work

## Available Operations
1. Define orchestrator state schema
2. Build the orchestrator graph with nodes and edges
3. Implement intelligent task routing
4. Delegate tasks to specialized subagents
5. Add compliance validation nodes
6. Wire up human-in-the-loop interrupt gates
7. Merge work from multiple agent branches

## Multi-Step Workflow

### Step 1: Define the Orchestrator State

Create a typed state schema that tracks the full lifecycle of a demand.

```python
from typing import TypedDict, Annotated, Literal
from langgraph.graph.message import add_messages

class OrchestratorState(TypedDict):
    messages: Annotated[list, add_messages]
    demand: dict
    task_plan: list[dict]
    current_task_index: int
    assigned_agents: dict[str, str]  # task_id -> agent_type
    branch_status: dict[str, str]    # agent -> branch_name
    compliance_results: list[dict]
    needs_human_review: bool
    final_status: str
```

### Step 2: Build the Graph Structure

Wire up the orchestrator nodes and conditional edges.

```python
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver

graph = StateGraph(OrchestratorState)

# Add nodes
graph.add_node("analyze_demand", analyze_demand_node)
graph.add_node("plan_tasks", plan_tasks_node)
graph.add_node("route_to_agent", route_to_agent_node)
graph.add_node("execute_agent", execute_agent_node)
graph.add_node("validate_compliance", validate_compliance_node)
graph.add_node("human_review", human_review_node)
graph.add_node("merge_work", merge_work_node)

# Wire edges
graph.add_edge(START, "analyze_demand")
graph.add_edge("analyze_demand", "plan_tasks")
graph.add_edge("plan_tasks", "route_to_agent")
graph.add_conditional_edges("route_to_agent", should_continue, {
    "execute": "execute_agent",
    "all_done": "validate_compliance"
})
graph.add_edge("execute_agent", "route_to_agent")
graph.add_conditional_edges("validate_compliance", needs_review, {
    "review": "human_review",
    "pass": "merge_work"
})
graph.add_edge("human_review", "merge_work")
graph.add_edge("merge_work", END)

app = graph.compile(checkpointer=PostgresSaver(conn))
```

### Step 3: Implement Intelligent Routing

Route tasks to the right subagent based on keywords or LLM classification.

```python
def route_to_agent(state: OrchestratorState) -> dict:
    task = state["task_plan"][state["current_task_index"]]

    routing_map = {
        "frontend": ["ui", "component", "screen", "react", "css"],
        "backend": ["api", "endpoint", "database", "service", "entity"],
        "devops": ["deploy", "pipeline", "docker", "k8s", "ci"],
    }

    for agent_type, keywords in routing_map.items():
        if any(kw in task["description"].lower() for kw in keywords):
            return {"assigned_agents": {task["id"]: agent_type}}

    # Fallback: use LLM to decide
    return {"assigned_agents": {task["id"]: llm_route(task)}}
```

### Step 4: Delegate to Subagents

Each subagent has its own graph, tools, and worktree.

```python
async def execute_agent_node(state: OrchestratorState):
    task = state["task_plan"][state["current_task_index"]]
    agent_type = state["assigned_agents"][task["id"]]

    agent = agent_registry.get(agent_type)
    result = await agent.ainvoke({
        "task": task,
        "bundle": bundles[agent_type],
        "worktree": worktrees[agent_type]
    })

    return {
        "current_task_index": state["current_task_index"] + 1,
        "branch_status": {
            **state["branch_status"],
            agent_type: result["branch_name"]
        }
    }
```

### Step 5: Add Human-in-the-Loop Approval

Use LangGraph interrupts for merge approval gates.

```python
from langgraph.types import interrupt

def human_review_node(state: OrchestratorState):
    approval = interrupt({
        "type": "merge_approval",
        "branches": state["branch_status"],
        "compliance": state["compliance_results"],
        "message": "Approve merging branches?"
    })
    return {"needs_human_review": False, "final_status": approval["decision"]}
```

### Step 6: Run and Test the Orchestrator

```bash
# Run the orchestrator with a test demand
python -m orchestrator.run --demand "Create CRUD for demands with REST API and React UI"

# Verify the graph structure
python -c "from orchestrator.graph import app; app.get_graph().print_ascii()"
```

## Resources
- `references/graph-patterns.md` - Common LangGraph graph patterns for orchestration
- `references/routing-strategies.md` - Detailed routing strategies and fallback mechanisms

## Examples

### Example 1: Decompose and Execute a Full-Stack Demand
User asks: "Set up an orchestrator that decomposes a demand into frontend and backend tasks and delegates them."
Response approach:
1. Define OrchestratorState with task_plan and assigned_agents
2. Create analyze_demand node that uses LLM to break down the demand
3. Create plan_tasks node that structures tasks with dependencies
4. Implement keyword-based routing for frontend vs backend
5. Wire up execute_agent to delegate each task to the right subagent
6. Add compliance validation before merge

### Example 2: Add a New Agent Type
User asks: "Add a QA agent that runs tests after backend tasks complete."
Response approach:
1. Create a QA agent graph with test-running tools
2. Register it in the agent_registry
3. Add "qa" keywords to the routing map (e.g., "test", "quality", "coverage")
4. Add a conditional edge from execute_agent to route QA tasks after backend

### Example 3: Implement Parallel Agent Execution
User asks: "Make frontend and backend agents run in parallel instead of sequentially."
Response approach:
1. Use LangGraph's `Send` API to fan out to multiple agents simultaneously
2. Add a `join_results` node that waits for all parallel branches
3. Wire conditional edges from join_results to validate_compliance

## Notes
- Always use a checkpointer (PostgresSaver) so the orchestrator can resume after failures
- Each subagent should operate in its own git worktree to avoid conflicts
- Compliance validation should run before any merge operation
- Human review gates are mandatory for destructive operations (merges, deployments)
- Use thread_id based on demand_id for consistent state across invocations
