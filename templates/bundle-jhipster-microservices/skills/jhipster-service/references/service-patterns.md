# Microservice Communication Patterns

## Synchronous (Feign)
- Use for: queries, real-time data needs
- Pattern: Request/Response
- Failure: Circuit breaker + fallback
- Discovery: Resolved via Consul/Eureka

```java
@FeignClient(name = "service-name", fallback = Fallback.class)
public interface ServiceClient {
    @GetMapping("/api/resource/{id}")
    ResourceDTO get(@PathVariable Long id);
}
```

## Asynchronous (Kafka)
- Use for: notifications, event-driven flows
- Pattern: Publish/Subscribe
- Failure: DLQ (Dead Letter Queue)
- Guarantee: At-least-once delivery

```java
// Producer
streamBridge.send("topic-out-0", event);

// Consumer
@Bean
public Consumer<EventType> topicName() {
    return event -> { /* handle */ };
}
```

## Rules
1. Database per service -- never share databases
2. Feign for queries, Kafka for events
3. Fallbacks for all Feign clients
4. Idempotent Kafka consumers
5. Duplicate DTOs, never share JARs
6. One topic per bounded context
