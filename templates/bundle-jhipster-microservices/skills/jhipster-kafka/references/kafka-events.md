# Kafka Event Design Patterns

## Event Structure
```java
public sealed interface DomainEvent {
    String eventId();       // Unique ID for idempotency
    Instant occurredAt();   // When it happened
    String aggregateId();   // For partitioning
}
```

## Topic Naming
- One topic per bounded context
- Format: `<context>-events` (e.g., `demand-events`, `agent-events`)
- DLQ: `<topic>-dlq` (e.g., `demand-events-dlq`)

## Consumer Group Naming
- Group = service name (e.g., `agent-service`)
- Each service gets its own group for independent consumption

## Idempotency Pattern
```java
if (processedEventRepo.existsById(event.eventId())) return;
// process event
processedEventRepo.save(new ProcessedEvent(event.eventId(), Instant.now()));
```

## Error Handling
1. Retry (automatic, configurable)
2. Dead Letter Queue (after max retries)
3. Monitor DLQ for failed events
4. Manual replay from DLQ after fixing

## Monitoring Commands
```bash
kafka-topics --list --bootstrap-server localhost:9092
kafka-consumer-groups --describe --group <group> --bootstrap-server localhost:9092
kafka-console-consumer --topic <topic> --from-beginning --bootstrap-server localhost:9092
```
