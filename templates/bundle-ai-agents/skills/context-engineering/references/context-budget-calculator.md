# Context Budget Calculator Reference

## Budget Formula

```
total_available = model_context_window
reasoning_space = total_available * 0.45  # NEVER reduce below 40%
usable_context = total_available - reasoning_space

system_prompt_budget = usable_context * 0.09    # ~5% of total
skills_budget = usable_context * 0.18           # ~10% of total
retrieved_context_budget = usable_context * 0.45 # ~25% of total
history_budget = usable_context * 0.27          # ~15% of total
```

## Budget by Model

| Model | Context Window | System + Skills | Retrieved | History | Reasoning |
|---|---|---|---|---|---|
| Claude Sonnet (200k) | 200,000 | 30,000 | 50,000 | 30,000 | 90,000 |
| Claude Haiku (200k) | 200,000 | 30,000 | 50,000 | 30,000 | 90,000 |
| GPT-4 Turbo (128k) | 128,000 | 19,200 | 32,000 | 19,200 | 57,600 |
| GPT-4o (128k) | 128,000 | 19,200 | 32,000 | 19,200 | 57,600 |

## Warning Signs of Context Bloat

1. Agent starts ignoring rules mentioned in the system prompt -> system prompt too far back
2. Agent repeats itself -> conversation history too long, compress or trim
3. Agent hallucinates code structure -> retrieved context is stale or missing
4. Agent is slow and expensive -> too much context being sent per invocation

## Quick Check

```python
import tiktoken

def check_budget(system_prompt, skills, retrieved, history, model_limit=200000):
    enc = tiktoken.encoding_for_model("gpt-4")  # approximate
    total = sum(len(enc.encode(t)) for t in [system_prompt, skills, retrieved, history])
    usage_pct = total / model_limit * 100
    reasoning_pct = (model_limit - total) / model_limit * 100
    print(f"Context usage: {usage_pct:.1f}% | Reasoning space: {reasoning_pct:.1f}%")
    if reasoning_pct < 40:
        print("WARNING: Reasoning space below 40%. Reduce context.")
```
