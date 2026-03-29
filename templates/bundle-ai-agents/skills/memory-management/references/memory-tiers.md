# Memory Tiers Reference

## Comparison

| Tier | Duration | Mechanism | Storage | Cost | Use Case |
|---|---|---|---|---|---|
| Short-term | 1 session | Context window | In-memory | Free | Current conversation messages |
| Medium-term | 1 demand | Checkpointer | PostgreSQL | Low | Graph state between invocations |
| Long-term | Permanent | Store | PostgreSQL | Low | Patterns, preferences, learnings |

## Short-Term Memory

- **What**: Messages in the current invocation chain.
- **How**: `Annotated[list, add_messages]` in state schema.
- **Limit**: Bounded by context window size.
- **When it resets**: End of the invocation chain.

## Medium-Term Memory

- **What**: Full graph state (all state fields) at each node execution.
- **How**: `graph.compile(checkpointer=PostgresSaver(...))`.
- **Limit**: Bounded by database storage.
- **When it resets**: When the demand is completed or explicitly cleared.
- **Key feature**: Enables resume after crash.

## Long-Term Memory

- **What**: Extracted patterns, preferences, and learnings.
- **How**: `store.aput(namespace=..., key=..., value=...)`.
- **Limit**: Bounded by database storage and relevance decay.
- **When it resets**: Only when explicitly cleaned up.
- **Key feature**: Enables cross-demand learning.

## Decision Guide

| Question | Answer | Use |
|---|---|---|
| Does the agent need to remember within this conversation? | Yes | Short-term |
| Does the agent need to resume after a crash? | Yes | Medium-term (checkpointer) |
| Should the agent learn from past demands? | Yes | Long-term (store) |
| Does the agent need to share knowledge with other agents? | Yes | Long-term (store with shared namespace) |
