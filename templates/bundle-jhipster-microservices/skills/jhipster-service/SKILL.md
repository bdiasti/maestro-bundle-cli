---
name: jhipster-service
description: Create and configure JHipster microservices with Spring Boot, including API, own database, Feign clients, and Kafka communication. Use when creating a new microservice, configuring inter-service communication, or defining internal APIs.
version: 1.0.0
author: Maestro
---

# JHipster Microservice

Create and configure JHipster microservices with their own database, Feign clients for synchronous communication, and Kafka for asynchronous messaging.

## When to Use
- When creating a new microservice
- When configuring Feign clients for service-to-service calls
- When setting up Kafka producers/consumers
- When defining internal API contracts
- When implementing circuit breakers and fallbacks

## Available Operations
1. Generate a new microservice with JHipster
2. Configure database and service properties
3. Create Feign clients with fallbacks
4. Set up Kafka producers and consumers
5. Define internal API contracts with DTOs

## Multi-Step Workflow

### Step 1: Generate the Microservice

```bash
# Generate via JDL (recommended)
jhipster import-jdl jhipster-jdl.jdl

# Or generate manually
mkdir bundle-service && cd bundle-service
jhipster --blueprints="" --skip-client
```

### Step 2: Configure the Service

```yaml
# application.yml
spring:
  application:
    name: bundle-service
server:
  port: 8084

# Own database (database per service)
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/bundle_service
    username: bundle
    password: bundle

# Kafka bindings
spring:
  cloud:
    stream:
      kafka:
        binder:
          brokers: kafka:9092
      bindings:
        bundleEvents-out-0:
          destination: bundle-events
        demandEvents-in-0:
          destination: demand-events
          group: bundle-service
```

### Step 3: Create Feign Clients (Synchronous Communication)

```java
@FeignClient(name = "demand-service", fallback = DemandServiceFallback.class)
public interface DemandServiceClient {

    @GetMapping("/api/demands/{id}")
    DemandDTO getDemand(@PathVariable Long id);

    @PutMapping("/api/demands/{id}/status")
    void updateStatus(@PathVariable Long id, @RequestBody StatusUpdateDTO dto);
}

@Component
public class DemandServiceFallback implements DemandServiceClient {

    @Override
    public DemandDTO getDemand(Long id) {
        log.warn("Demand service unavailable for demand {}", id);
        return null;
    }

    @Override
    public void updateStatus(Long id, StatusUpdateDTO dto) {
        log.warn("Cannot update demand {} status, service unavailable", id);
        throw new ServiceUnavailableException("demand-service");
    }
}
```

### Step 4: Set Up Kafka (Asynchronous Communication)

```java
// Producer
@Service
public class BundleEventProducer {
    private final StreamBridge streamBridge;

    public void publishBundleUpdated(Bundle bundle) {
        BundleUpdatedEvent event = new BundleUpdatedEvent(
            bundle.getId(), bundle.getName(), bundle.getVersion()
        );
        streamBridge.send("bundleEvents-out-0", event);
    }
}

// Consumer
@Bean
public Consumer<DemandCreatedEvent> demandEvents() {
    return event -> {
        log.info("Demand created: {}", event.demandId());
        bundleService.suggestBundleForDemand(event.demandId(), event.description());
    };
}
```

### Step 5: Define Internal API DTOs

```java
// Shared DTO -- package separado or duplicated (never share JARs)
public record AgentAllocationRequest(
    Long taskId,
    AgentType requiredType,
    String branchName
) {}

public record AgentAllocationResponse(
    Long agentId,
    String worktreePath,
    String status
) {}
```

### Step 6: Build and Run

```bash
# Build the service
./mvnw compile

# Run tests
./mvnw test

# Start the service
./mvnw spring-boot:run

# Verify registration in Consul
curl http://localhost:8500/v1/health/service/bundle-service
```

## Resources
- `references/service-patterns.md` - Microservice communication patterns and best practices

## Examples
### Example 1: Create a New Microservice
User asks: "Create a new notification-service"
Response approach:
1. Generate with `jhipster --skip-client` in a new directory
2. Configure `spring.application.name: notification-service`
3. Set up its own PostgreSQL database
4. Register with Consul
5. Add Kafka consumer for events it needs

### Example 2: Add Inter-Service Communication
User asks: "The demand-service needs to call agent-service to allocate an agent"
Response approach:
1. Create `AgentServiceClient` Feign interface in demand-service
2. Add fallback class for circuit breaker
3. Call Feign client from service layer
4. Test with agent-service running

### Example 3: Handle Service Unavailability
User asks: "What happens if agent-service is down?"
Response approach:
1. Verify Feign fallback is implemented
2. Add circuit breaker configuration
3. Log warnings when fallback is triggered
4. Consider using Kafka for non-critical operations

## Notes
- Each service has its own database -- NEVER access another service's database
- One service failing MUST NOT bring down others (circuit breaker)
- Kafka for notifications, Feign for queries
- Kafka consumers MUST be idempotent (same event can arrive twice)
- Duplicate DTOs between services rather than sharing JARs
