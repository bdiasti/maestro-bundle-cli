# DDD Tactical Patterns Reference

## Decision Guide: Where to Put Business Logic

| Pattern | When to Use | Example |
|---|---|---|
| Value Object | Validation, simple behavior, no identity | Email, Money, ComplianceScore |
| Entity | Has identity, mutable state, behavior | Task, Agent, Demand |
| Aggregate | Cluster with invariants, transactional boundary | Demand (root) + Tasks (children) |
| Domain Event | Notify something happened | TaskCompleted, DemandCreated |
| Domain Service | Logic spanning multiple entities | TeamRecruitmentService |
| Repository (Port) | Persistence abstraction | DemandRepository (interface) |

## Value Object Checklist
- [ ] Immutable (frozen dataclass / Java record)
- [ ] Validated in constructor
- [ ] Compared by value, not reference
- [ ] Contains behavior methods
- [ ] No identity field

## Entity Checklist
- [ ] Has unique identity (ID)
- [ ] Mutable state with controlled transitions
- [ ] Contains behavior (not anemic)
- [ ] State changes enforce invariants
- [ ] Compared by identity, not value

## Aggregate Checklist
- [ ] Has a single root entity
- [ ] Children accessed only through root
- [ ] Invariants enforced by root
- [ ] Small boundary (prefer separate aggregates)
- [ ] Cross-aggregate references by ID only
- [ ] One aggregate per transaction

## Domain Event Checklist
- [ ] Immutable (record/frozen dataclass)
- [ ] Contains occurred_at timestamp
- [ ] Named in past tense (TaskCompleted, not CompleteTask)
- [ ] Contains only IDs and primitives (no entity references)
- [ ] Published after aggregate state change

## Domain Service Checklist
- [ ] Logic involves multiple aggregates
- [ ] Stateless (no internal state)
- [ ] Named after the operation (TeamRecruitmentService)
- [ ] Accepts entities as parameters
- [ ] Does not persist (caller persists)
