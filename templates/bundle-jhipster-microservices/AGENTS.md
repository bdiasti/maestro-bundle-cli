# Project: JHipster Microservices

You are building a microservices architecture with JHipster. Multiple Spring Boot services, centralized gateway, service discovery, asynchronous messaging, and Angular frontend.

## Specification-Driven Development (SDD)

The fundamental SDD rule is defined in the bundle-base (base AGENTS.md) and is non-negotiable:
**No spec, no code. No exception.** The agent must refuse to implement any demand that
has not gone through the `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` flow.

If the user asks to code something without a spec, STOP and initiate the SDD flow first.
Check `.specify/specs/` to verify if a spec already exists for the demand.

## Product Requirements Document

The `PRD.md` file at the project root contains the product requirements defined by the analyst/dev. Consult it to understand WHAT to build, the user stories, acceptance criteria, data model, and API specification. This AGENTS.md defines HOW the agent should work; the PRD defines WHAT should be built.

- `PRD.md` — Product requirements, user stories, API spec, data model

## References

Reference documents that the agent should consult when necessary:

- `references/jhipster-microservices-guide.md` — JHipster microservices guide
- `references/kafka-patterns.md` — Kafka event patterns
- `references/saga-patterns.md` — Saga pattern for distributed transactions
- `references/k8s-deployment.md` — Kubernetes deployment

## Project Stack

- **Backend:** Java 21 + Spring Boot 3.x (multiple JHipster services)
- **Gateway:** JHipster Gateway (Spring Cloud Gateway)
- **Service Discovery:** JHipster Registry (Eureka) or Consul
- **Frontend:** Angular 17+ (in the Gateway or separate app)
- **Database:** PostgreSQL (one database per service)
- **Messaging:** Apache Kafka (JHipster default for microservices)
- **Cache:** Redis (shared)
- **Auth:** OAuth2 + Keycloak (recommended for microservices)
- **Containers:** Docker Compose (dev) + Kubernetes/K3s (prod)
- **Migrations:** Liquibase (per service)
- **CI/CD:** GitLab CI
- **Monitoring:** Prometheus + Grafana + ELK/Loki

## Multi-Repo or Monorepo Structure

### Monorepo (recommended for small teams)
```
maestro/
├── gateway/                    # JHipster Gateway + Angular
│   ├── src/main/java/
│   ├── src/main/webapp/        # Angular app
│   └── pom.xml
├── demand-service/             # Demand microservice
│   ├── src/main/java/com/company/demand/
│   │   ├── domain/
│   │   ├── repository/
│   │   ├── service/
│   │   ├── web/rest/
│   │   └── config/
│   ├── src/main/resources/
│   │   └── config/liquibase/
│   └── pom.xml
├── agent-service/              # Agent microservice
│   └── ...
├── tracking-service/           # Tracking microservice
│   └── ...
├── bundle-service/             # Bundle/skills microservice
│   └── ...
├── docker-compose/             # Docker Compose for dev
│   ├── docker-compose.yml
│   ├── keycloak.yml
│   ├── kafka.yml
│   ├── postgresql.yml
│   └── monitoring.yml
├── k8s/                        # Kubernetes manifests
│   ├── demand-service/
│   ├── agent-service/
│   ├── gateway/
│   └── registry/
└── jhipster-jdl.jdl           # Complete JDL
```

## JDL for Microservices

```jdl
application {
    config {
        baseName gateway
        applicationType gateway
        packageName com.company.gateway
        serviceDiscoveryType consul
        authenticationType oauth2
        prodDatabaseType postgresql
        buildTool maven
        clientFramework angular
    }
}

application {
    config {
        baseName demandService
        applicationType microservice
        packageName com.company.demand
        serviceDiscoveryType consul
        authenticationType oauth2
        prodDatabaseType postgresql
        buildTool maven
        serverPort 8081
    }
    entities Demand, Task
}

application {
    config {
        baseName agentService
        applicationType microservice
        packageName com.company.agent
        serviceDiscoveryType consul
        authenticationType oauth2
        prodDatabaseType postgresql
        buildTool maven
        serverPort 8082
    }
    entities Agent, AgentTeam, Worktree
}

application {
    config {
        baseName trackingService
        applicationType microservice
        packageName com.company.tracking
        serviceDiscoveryType consul
        authenticationType oauth2
        prodDatabaseType postgresql
        buildTool maven
        serverPort 8083
    }
    entities TrackingEvent, TrackingSession
}

/* Entities */
entity Demand {
    description TextBlob required
    status DemandStatus required
    priority Priority required
}

entity Task {
    description String required
    status TaskStatus required
    branchName String
}

entity Agent {
    name String required
    type AgentType required
    status AgentStatus required
}

/* Enums */
enum DemandStatus { CREATED, PLANNED, IN_PROGRESS, COMPLETED }
enum TaskStatus { PENDING, IN_PROGRESS, COMPLETED, FAILED }
enum AgentType { FRONTEND, BACKEND, DEVOPS, ML, QA }
enum AgentStatus { IDLE, BUSY, OFFLINE }

/* Relationships */
relationship OneToMany {
    Demand{tasks} to Task{demand required}
}

/* Options */
paginate * with pagination
dto * with mapstruct
service * with serviceImpl

/* Deployments */
deployment {
    deploymentType docker-compose
    dockerRepositoryName "registry.local/maestro"
    appsFolders [gateway, demandService, agentService, trackingService]
    monitoring yes
    serviceDiscoveryType consul
}

deployment {
    deploymentType kubernetes
    kubernetesNamespace maestro
    kubernetesServiceType Ingress
    appsFolders [gateway, demandService, agentService, trackingService]
    dockerRepositoryName "registry.local/maestro"
    monitoring yes
    serviceDiscoveryType consul
}
```

## Inter-Service Communication

### Synchronous -- Feign Client (between services)
```java
@FeignClient(name = "agentService")
public interface AgentServiceClient {
    @GetMapping("/api/agents/available")
    List<AgentDTO> getAvailableAgents(@RequestParam("type") AgentType type);

    @PostMapping("/api/agents/{id}/allocate")
    AgentDTO allocateAgent(@PathVariable Long id, @RequestBody AllocateRequest request);
}
```

### Asynchronous -- Kafka (domain events)
```java
// Producer -- demand-service
@Service
public class DemandEventProducer {
    private final KafkaTemplate<String, DemandEvent> kafka;

    public void publishDemandDecomposed(Demand demand) {
        DemandDecomposed event = new DemandDecomposed(
            demand.getId(), demand.getTasks().stream().map(Task::getId).toList()
        );
        kafka.send("demand-events", demand.getId().toString(), event);
    }
}

// Consumer -- agent-service
@Service
public class DemandEventConsumer {
    @KafkaListener(topics = "demand-events", groupId = "agent-service")
    public void onDemandDecomposed(DemandDecomposed event) {
        // Allocate agents for the tasks
        taskAllocationService.allocateForDemand(event.demandId(), event.taskIds());
    }
}
```

## Mandatory Patterns

### Database per Service
Each microservice has its own PostgreSQL database. Never access another service's database directly.

### Saga Pattern for distributed transactions
```
demand-service: CreateDemand
    → kafka: DemandCreated
        → agent-service: AllocateAgents
            → kafka: AgentsAllocated
                → demand-service: UpdateDemandStatus(PLANNED)

If AgentAllocation fails:
    → kafka: AllocationFailed
        → demand-service: CompensateDemand(CANCELLED)
```

### Circuit Breaker
```java
@CircuitBreaker(name = "agentService", fallbackMethod = "fallbackGetAgents")
public List<AgentDTO> getAvailableAgents(AgentType type) {
    return agentServiceClient.getAvailableAgents(type);
}

public List<AgentDTO> fallbackGetAgents(AgentType type, Throwable t) {
    log.warn("Agent service unavailable, returning cached agents", t);
    return cachedAgentService.getCachedAgents(type);
}
```

## Docker Compose for dev

```bash
# Start everything
docker-compose -f docker-compose/docker-compose.yml up -d

# Start a specific service
docker-compose -f docker-compose/docker-compose.yml up -d demand-service
```

## Kubernetes for prod

```bash
# Deploy via JHipster
jhipster kubernetes

# Apply
kubectl apply -f k8s/
```

## Tests

- **Unit:** JUnit 5 -- entities and services (>= 90% domain)
- **Integration:** Testcontainers + real PostgreSQL (>= 70%)
- **Contract:** Spring Cloud Contract -- contracts between services
- **E2E:** Cypress on the gateway
- **Load:** Gatling (included in JHipster)

## Git

- Commits: `feat(demand-service): add allocation saga`
- Branches: `feature/<service>-<description>`
- One PR per service when possible
- Never make breaking API changes without versioning

## What NOT to do

- Do not access another service's database directly
- Do not make synchronous call chains (A->B->C->D) -- use events
- Do not share entities between services -- each has its own DTOs
- Do not deploy all services together -- deploy independently
- Do not ignore circuit breakers on inter-service calls
- Do not use distributed transactions (2PC) -- use Saga
- Do not create an "everything service" -- maintain bounded contexts
