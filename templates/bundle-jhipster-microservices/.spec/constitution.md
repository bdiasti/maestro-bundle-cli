# Constitution — Projeto JHipster Microservices

## Princípios

1. **Spec primeiro, código depois** — Toda demanda passa pelo fluxo SDD antes de implementação
2. **Database per service** — Cada microsserviço tem seu próprio banco, nunca acessar banco de outro
3. **Eventos sobre chamadas síncronas** — Preferir Kafka para comunicação, Feign apenas para queries
4. **Resiliência obrigatória** — Circuit breaker em toda chamada inter-serviço
5. **Deploy independente** — Cada serviço pode ser deployado sozinho
6. **Saga over 2PC** — Transações distribuídas via Saga pattern, nunca Two-Phase Commit

## Padrões de desenvolvimento

### Java / Spring Boot
- Java 21+, Records para DTOs e Events
- Constructor injection
- Idempotência em consumers Kafka
- Fallback methods para circuit breakers
- Entidades pertencem a UM serviço

### Comunicação
- Kafka para eventos de domínio (assíncrono)
- Feign Client para queries (síncrono)
- DTOs compartilhados por contrato, nunca por JAR

### Infraestrutura
- Docker Compose para dev
- Kubernetes/K3s para prod
- Consul para service discovery
- Keycloak para OAuth2

## Padrões de qualidade

- Spring Cloud Contract entre serviços
- Testcontainers para integração
- Gatling para load testing
- Deploy via CI/CD, nunca manual
