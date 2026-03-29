# Cross-Service Entity Patterns

## Rules
1. Each entity belongs to exactly ONE microservice
2. Cross-service references use plain ID fields (Long/UUID), not foreign keys
3. Data from other services is fetched via Feign or received via Kafka events
4. DTOs are duplicated between services, never shared as JARs

## JDL Pattern
```jdl
entity Task {
    agentId Long       // Reference to Agent in agent-service
    branchName String
}
microservice Task with demandService

entity Agent {
    name String required
}
microservice Agent with agentService
```

## Data Fetching Pattern
```java
// Option 1: Feign (synchronous, real-time)
AgentDTO agent = agentClient.getAgent(task.getAgentId());

// Option 2: Local cache from Kafka events (eventual consistency)
AgentSummary agent = localAgentCache.get(task.getAgentId());
```

## Anti-Patterns to Avoid
- Sharing database between services
- Using real foreign keys across service boundaries
- Sharing entity JARs between services
- Joining tables from different service databases
