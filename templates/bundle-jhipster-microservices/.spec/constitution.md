# Constitution — JHipster Microservices Project

## Principles

1. **Spec first, code later** — Every demand goes through the SDD flow before implementation
2. **Database per service** — Each microservice has its own database, never access another's
3. **Events over synchronous calls** — Prefer Kafka for communication, Feign only for queries
4. **Resilience mandatory** — Circuit breaker on every inter-service call
5. **Independent deploy** — Each service can be deployed on its own
6. **Saga over 2PC** — Distributed transactions via Saga pattern, never Two-Phase Commit

## Development Standards

### Java / Spring Boot
- Java 21+, Records for DTOs and Events
- Constructor injection
- Idempotency in Kafka consumers
- Fallback methods for circuit breakers
- Entities belong to ONE service

### Communication
- Kafka for domain events (asynchronous)
- Feign Client for queries (synchronous)
- DTOs shared by contract, never by JAR

### Infrastructure
- Docker Compose for dev
- Kubernetes/K3s for prod
- Consul for service discovery
- Keycloak for OAuth2

## Quality Standards

- Spring Cloud Contract between services
- Testcontainers for integration
- Gatling for load testing
- Deploy via CI/CD, never manual
