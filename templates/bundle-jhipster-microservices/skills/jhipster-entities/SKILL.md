---
name: jhipster-entities
description: Create and manage JHipster entities with JDL for microservices, including cross-service references and shared DTOs. Use when creating entities, defining data models, or managing cross-service relationships.
version: 1.0.0
author: Maestro
---

# JHipster Entities -- Microservices

Create and manage JHipster entities in a microservices architecture where entities belong to specific services and cross-service relationships use IDs instead of foreign keys.

## When to Use
- When creating entities assigned to specific microservices
- When defining cross-service relationships (by ID, not FK)
- When generating code with `jhipster import-jdl` for microservices
- When implementing Feign-based data fetching across services

## Available Operations
1. Define entities with microservice assignment in JDL
2. Handle cross-service references with ID fields
3. Generate code per microservice
4. Implement Feign-based data aggregation
5. Create shared DTOs for inter-service communication

## Multi-Step Workflow

### Step 1: Define Entities with Microservice Assignment

```jdl
/* demand-service entities */
entity Demand {
    description TextBlob required
    status DemandStatus required
    priority Priority required
    createdAt Instant required
}

entity Task {
    description String required maxlength(500)
    status TaskStatus required
    agentId Long             // ID from another service, not FK
    branchName String
}

relationship OneToMany {
    Demand{tasks} to Task{demand required}
}

microservice Demand, Task with demandService

/* agent-service entities */
entity Agent {
    name String required
    type AgentType required
    status AgentStatus required
    worktreePath String
}

entity AgentTeam {
    demandId Long required   // ID from another service, not FK
}

relationship ManyToMany {
    AgentTeam{agents} to Agent
}

microservice Agent, AgentTeam with agentService
```

### Step 2: Generate Code

```bash
# Generate all microservices from JDL
jhipster import-jdl jhipster-jdl.jdl

# Verify generated files per service
ls demand-service/src/main/java/*/domain/
ls agent-service/src/main/java/*/domain/
```

### Step 3: Implement Cross-Service Data Fetching

```java
// In demand-service -- Task stores only agentId
@Entity
public class Task {
    private Long agentId;  // Just the ID, not the Agent entity
}

// In demand-service -- fetch Agent data via Feign
@Service
public class DemandServiceImpl {
    private final AgentServiceClient agentClient;

    public TaskDetailDTO getTaskDetail(Long taskId) {
        Task task = taskRepository.findById(taskId).orElseThrow();
        AgentDTO agent = agentClient.getAgent(task.getAgentId()); // Feign call
        return new TaskDetailDTO(task, agent);
    }
}
```

### Step 4: Build and Test

```bash
# Build each service
cd demand-service && ./mvnw test
cd agent-service && ./mvnw test

# Run all services
cd demand-service && ./mvnw spring-boot:run &
cd agent-service && ./mvnw spring-boot:run &
```

## Resources
- `references/cross-service-entities.md` - Cross-service entity patterns and rules

## Examples
### Example 1: Create Entities for a New Service
User asks: "Create Product and Order entities for the order-service"
Response approach:
1. Define entities in JDL with `microservice Product, Order with orderService`
2. Use ID references for entities in other services
3. Run `jhipster import-jdl`
4. Verify generated code

### Example 2: Reference an Entity from Another Service
User asks: "Task needs to show the Agent name but Agent is in another service"
Response approach:
1. Store `agentId Long` in Task entity (not FK)
2. Create Feign client to agent-service
3. Fetch Agent data when needed via Feign call
4. Combine into a response DTO

## Notes
- Fundamental rule: entity belongs to ONE service
- Cross-service: store only the ID, never a real FK
- To display data from another service: Feign client or Kafka event
- Never share entity classes between services (duplicate DTOs if needed)
