---
name: jhipster-kafka
description: Configure Apache Kafka in JHipster for asynchronous communication between microservices with domain events. Use when setting up messaging, event-driven communication, producers, consumers, or dead letter queues.
version: 1.0.0
author: Maestro
---

# Kafka in JHipster Microservices

Configure Apache Kafka for asynchronous event-driven communication between JHipster microservices using domain events, producers, consumers, and dead letter queues.

## When to Use
- When setting up asynchronous messaging between services
- When implementing domain events (DemandCreated, TaskCompleted, etc.)
- When creating Kafka producers and consumers
- When configuring dead letter queues for failed messages
- When designing event schemas

## Available Operations
1. Set up Kafka with Docker Compose
2. Define domain events as Java records
3. Create Kafka producers
4. Create idempotent consumers
5. Configure dead letter queues

## Multi-Step Workflow

### Step 1: Start Kafka with Docker Compose

```yaml
# docker-compose/kafka.yml
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
```

```bash
# Start Kafka
docker-compose -f docker-compose/kafka.yml up -d

# Verify Kafka is running
docker-compose logs kafka | tail -5

# List topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:29092
```

### Step 2: Design Topics by Bounded Context

| Topic | Producer | Consumer | Events |
|---|---|---|---|
| `demand-events` | demand-service | agent-service, tracking-service | DemandCreated, DemandDecomposed |
| `agent-events` | agent-service | demand-service, tracking-service | AgentAllocated, TaskCompleted |
| `bundle-events` | bundle-service | agent-service | BundleUpdated, SkillAdded |
| `tracking-events` | tracking-service | gateway (WebSocket) | MetricsUpdated |

### Step 3: Define Domain Events

```java
// Events are immutable records with eventId and timestamp
public sealed interface DomainEvent
    permits DemandCreated, DemandDecomposed, TaskCompleted {
    String eventId();
    Instant occurredAt();
    String aggregateId();
}

public record DemandCreated(
    String eventId,
    Instant occurredAt,
    String aggregateId,
    String description,
    String priority
) implements DomainEvent {}

public record TaskCompleted(
    String eventId,
    Instant occurredAt,
    String aggregateId,
    Long taskId,
    Long agentId,
    String branchName,
    double durationSeconds
) implements DomainEvent {}
```

### Step 4: Create Producer

```java
@Service
@RequiredArgsConstructor
public class DemandEventProducer {

    private final KafkaTemplate<String, DomainEvent> kafkaTemplate;

    public void publish(DomainEvent event) {
        kafkaTemplate.send("demand-events", event.aggregateId(), event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish event {}", event.eventId(), ex);
                } else {
                    log.info("Published {} to partition {}",
                        event.eventId(),
                        result.getRecordMetadata().partition());
                }
            });
    }
}
```

### Step 5: Create Idempotent Consumer

```java
@Service
@RequiredArgsConstructor
public class DemandEventConsumer {

    private final ProcessedEventRepository processedEventRepo;
    private final AgentAllocationService allocationService;

    @KafkaListener(topics = "demand-events", groupId = "agent-service")
    public void onDemandEvent(DomainEvent event) {
        // Idempotency: skip already processed events
        if (processedEventRepo.existsById(event.eventId())) {
            log.info("Event {} already processed, skipping", event.eventId());
            return;
        }

        switch (event) {
            case DemandDecomposed e -> allocationService.allocateForDemand(e);
            case DemandCreated e -> log.info("Demand created: {}", e.aggregateId());
            default -> log.warn("Unknown event type: {}", event.getClass());
        }

        processedEventRepo.save(new ProcessedEvent(event.eventId(), Instant.now()));
    }
}
```

### Step 6: Configure Dead Letter Queue

```yaml
# application.yml
spring:
  cloud:
    stream:
      kafka:
        bindings:
          demandEvents-in-0:
            consumer:
              enableDlq: true
              dlqName: demand-events-dlq
              autoCommitOnError: false
```

### Step 7: Verify and Monitor

```bash
# List topics
docker exec kafka kafka-topics --list --bootstrap-server localhost:29092

# Consume from a topic (for debugging)
docker exec kafka kafka-console-consumer \
  --bootstrap-server localhost:29092 \
  --topic demand-events \
  --from-beginning

# Check consumer group lag
docker exec kafka kafka-consumer-groups \
  --bootstrap-server localhost:29092 \
  --group agent-service \
  --describe

# Check DLQ for failed messages
docker exec kafka kafka-console-consumer \
  --bootstrap-server localhost:29092 \
  --topic demand-events-dlq \
  --from-beginning

# Run tests
./mvnw test -Dtest="*EventProducer*,*EventConsumer*"
```

## Resources
- `references/kafka-patterns.md` - Kafka messaging patterns and best practices
- `references/event-schema.md` - Domain event schema conventions

## Examples

### Example 1: Add New Event Type
User asks: "Create a TaskCompleted event"
Response approach:
1. Create `TaskCompleted` record implementing `DomainEvent`
2. Add to sealed interface permits list
3. Publish from agent-service when task completes
4. Add consumer in demand-service to update demand status
5. Run `./mvnw test`

### Example 2: Debug Missing Events
User asks: "Consumers are not receiving events"
Response approach:
1. Check Kafka is running: `docker-compose logs kafka`
2. Verify topic exists: `kafka-topics --list`
3. Check consumer group: `kafka-consumer-groups --describe`
4. Produce test message: `kafka-console-producer`
5. Check DLQ for errors

### Example 3: Handle Duplicate Events
User asks: "Consumer is processing the same event twice"
Response approach:
1. Add `ProcessedEvent` entity and repository
2. Check `processedEventRepo.existsById(eventId)` before processing
3. Save event ID after successful processing
4. Test with duplicate messages

## Notes
- One topic per bounded context (not per entity)
- Consumers MUST be idempotent (same event can arrive 2x)
- DLQ for events that failed processing
- Events are immutable (Java records)
- Always include `eventId` and `occurredAt` in every event
- Consumer group = service name
- Use `aggregateId` as Kafka message key for ordering
