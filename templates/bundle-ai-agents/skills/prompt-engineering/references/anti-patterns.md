# Prompt Anti-Patterns Reference

## 1. NEVER/ALWAYS Overuse

**Problem**: Using NEVER and ALWAYS too frequently dilutes their impact.

**Bad**:
```
NEVER use var. ALWAYS use const. NEVER use any. ALWAYS type everything.
NEVER skip tests. ALWAYS write docs. NEVER commit without review.
```

**Good**:
```
Use const by default, let when reassignment is needed.
Type all function parameters and return values.
Critical: NEVER commit secrets or credentials to the repository.
```

**Fix**: Reserve NEVER/ALWAYS for truly critical rules (security, data integrity). Use softer language for preferences.

## 2. Contradictory Instructions

**Problem**: Instructions that conflict cause unpredictable behavior.

**Bad**:
```
Be concise in your responses.
Explain every decision in detail with full justification.
```

**Good**:
```
Be concise by default. When making architectural decisions, explain the reasoning.
```

**Fix**: Qualify when each instruction applies.

## 3. Excessive Length (> 5000 words)

**Problem**: The agent loses focus on key instructions when the prompt is too long.

**Fix**: Move reference material to skill files. Keep the system prompt under 2000 tokens. Load details on-demand.

## 4. Rules Without Justification

**Problem**: Without knowing why, the agent cannot reason about edge cases.

**Bad**: "Use Value Objects for all domain primitives."

**Good**: "Use Value Objects for domain primitives because they enforce validation at construction time and make the domain model self-documenting."

## 5. Vague Instructions

**Problem**: Ambiguity leads to inconsistent agent behavior.

**Bad**: "Write good code."

**Good**: "Write code that follows Clean Architecture: separate controllers, use cases, and repositories. Keep functions under 20 lines. Include type hints on all function signatures."
