# Projeto: JHipster Microservices

Você está construindo uma arquitetura de microsserviços com JHipster. Múltiplos serviços Spring Boot, gateway centralizado, service discovery, messaging assíncrono e frontend Angular.

## Specification-Driven Development (SDD)

A regra fundamental de SDD está definida no bundle-base (AGENTS.md base) e é inegociável:
**Sem spec, sem código. Sem exceção.** O agente deve recusar implementar qualquer demanda que
não tenha passado pelo fluxo `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.

Se o usuário pedir para codar algo sem spec, PARE e inicie o fluxo SDD primeiro.
Consulte `.specify/specs/` para verificar se já existe spec para a demanda.

## Product Requirements Document

O arquivo `PRD.md` na raiz do projeto contém os requisitos do produto definidos pelo analista/dev. Consulte-o para entender O QUE construir, as user stories, critérios de aceite, modelo de dados e API specification. Este AGENTS.md define COMO o agente deve trabalhar; o PRD define O QUE deve ser construído.

- `PRD.md` — Requisitos do produto, user stories, API spec, modelo de dados

## References

Documentos de referência que o agente deve consultar quando necessário:

- `references/jhipster-microservices-guide.md` — Guia de microsserviços JHipster
- `references/kafka-patterns.md` — Padrões de eventos Kafka
- `references/saga-patterns.md` — Saga pattern para transações distribuídas
- `references/k8s-deployment.md` — Deploy em Kubernetes

## Stack do projeto

- **Backend:** Java 21 + Spring Boot 3.x (múltiplos serviços JHipster)
- **Gateway:** JHipster Gateway (Spring Cloud Gateway)
- **Service Discovery:** JHipster Registry (Eureka) ou Consul
- **Frontend:** Angular 17+ (no Gateway ou app separado)
- **Banco:** PostgreSQL (um banco por serviço)
- **Messaging:** Apache Kafka (padrão JHipster para microservices)
- **Cache:** Redis (compartilhado)
- **Auth:** OAuth2 + Keycloak (recomendado para microservices)
- **Containers:** Docker Compose (dev) + Kubernetes/K3s (prod)
- **Migrations:** Liquibase (por serviço)
- **CI/CD:** GitLab CI
- **Monitoring:** Prometheus + Grafana + ELK/Loki

## Estrutura Multi-Repo ou Monorepo

### Monorepo (recomendado para times pequenos)
```
maestro/
├── gateway/                    # JHipster Gateway + Angular
│   ├── src/main/java/
│   ├── src/main/webapp/        # Angular app
│   └── pom.xml
├── demand-service/             # Microserviço de demandas
│   ├── src/main/java/com/empresa/demand/
│   │   ├── domain/
│   │   ├── repository/
│   │   ├── service/
│   │   ├── web/rest/
│   │   └── config/
│   ├── src/main/resources/
│   │   └── config/liquibase/
│   └── pom.xml
├── agent-service/              # Microserviço de agentes
│   └── ...
├── tracking-service/           # Microserviço de rastreamento
│   └── ...
├── bundle-service/             # Microserviço de bundles/skills
│   └── ...
├── docker-compose/             # Docker Compose para dev
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
└── jhipster-jdl.jdl           # JDL completo
```

## JDL para Microservices

```jdl
application {
    config {
        baseName gateway
        applicationType gateway
        packageName com.empresa.gateway
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
        packageName com.empresa.demand
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
        packageName com.empresa.agent
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
        packageName com.empresa.tracking
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

## Comunicação entre serviços

### Síncrona — Feign Client (entre serviços)
```java
@FeignClient(name = "agentService")
public interface AgentServiceClient {
    @GetMapping("/api/agents/available")
    List<AgentDTO> getAvailableAgents(@RequestParam("type") AgentType type);

    @PostMapping("/api/agents/{id}/allocate")
    AgentDTO allocateAgent(@PathVariable Long id, @RequestBody AllocateRequest request);
}
```

### Assíncrona — Kafka (eventos de domínio)
```java
// Producer — demand-service
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

// Consumer — agent-service
@Service
public class DemandEventConsumer {
    @KafkaListener(topics = "demand-events", groupId = "agent-service")
    public void onDemandDecomposed(DemandDecomposed event) {
        // Alocar agentes para as tasks
        taskAllocationService.allocateForDemand(event.demandId(), event.taskIds());
    }
}
```

## Padrões obrigatórios

### Database per Service
Cada microsserviço tem seu próprio banco PostgreSQL. Nunca acessar banco de outro serviço diretamente.

### Saga Pattern para transações distribuídas
```
demand-service: CreateDemand
    → kafka: DemandCreated
        → agent-service: AllocateAgents
            → kafka: AgentsAllocated
                → demand-service: UpdateDemandStatus(PLANNED)

Se AgentAllocation falhar:
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

## Docker Compose para dev

```bash
# Subir tudo
docker-compose -f docker-compose/docker-compose.yml up -d

# Subir serviço específico
docker-compose -f docker-compose/docker-compose.yml up -d demand-service
```

## Kubernetes para prod

```bash
# Deploy via JHipster
jhipster kubernetes

# Aplicar
kubectl apply -f k8s/
```

## Testes

- **Unit:** JUnit 5 — entidades e services (>= 90% domínio)
- **Integration:** Testcontainers + PostgreSQL real (>= 70%)
- **Contract:** Spring Cloud Contract — contratos entre serviços
- **E2E:** Cypress no gateway
- **Load:** Gatling (incluso no JHipster)

## Git

- Commits: `feat(demand-service): adicionar saga de alocação`
- Branches: `feature/<service>-<descricao>`
- Um PR por serviço quando possível
- Nunca fazer breaking change em API sem versionar

## O que NÃO fazer

- Não acessar banco de outro serviço diretamente
- Não fazer chamadas síncronas em cadeia (A→B→C→D) — usar eventos
- Não compartilhar entities entre serviços — cada um tem seus DTOs
- Não deployar todos os serviços juntos — deploy independente
- Não ignorar circuit breakers em chamadas inter-serviço
- Não usar transações distribuídas (2PC) — usar Saga
- Não criar um "serviço de tudo" — manter bounded contexts
