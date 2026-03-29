---
name: jhipster-registry
description: Configure service discovery with Consul or Eureka and centralized configuration. Use when registering services, configuring discovery, centralizing configuration, or troubleshooting service registration.
version: 1.0.0
author: Maestro
---

# JHipster Registry / Service Discovery

Configure and manage service discovery using Consul (recommended) for automatic service registration, health checks, and centralized configuration.

## When to Use
- When setting up service discovery for new microservices
- When configuring centralized application properties
- When troubleshooting service registration issues
- When setting up Feign clients for inter-service communication
- When configuring health checks

## Available Operations
1. Set up Consul with Docker Compose
2. Configure service registration in each microservice
3. Store shared configuration in Consul KV
4. Set up Feign clients with service discovery
5. Monitor service health

## Multi-Step Workflow

### Step 1: Start Consul with Docker Compose

```yaml
# docker-compose/consul.yml
consul:
  image: consul:1.15
  ports:
    - "8500:8500"
  command: agent -server -bootstrap -ui -client=0.0.0.0
```

```bash
docker-compose -f docker-compose/consul.yml up -d

# Verify Consul is running
curl http://localhost:8500/v1/status/leader

# Open Consul UI
# http://localhost:8500
```

### Step 2: Configure Service Registration

Add to each microservice's `application.yml`:

```yaml
spring:
  cloud:
    consul:
      host: consul
      port: 8500
      discovery:
        service-name: ${spring.application.name}
        health-check-path: /management/health
        health-check-interval: 15s
        instance-id: ${spring.application.name}:${random.value}
      config:
        enabled: true
        format: yaml
        default-context: application
```

### Step 3: Store Shared Configuration in Consul KV

```yaml
# config/application/data in Consul KV store
spring:
  datasource:
    type: com.zaxxer.hikari.HikariDataSource
    hikari:
      maximum-pool-size: 20

management:
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
```

```bash
# Add config to Consul KV via CLI
consul kv put config/application/data @shared-config.yml

# Or via HTTP API
curl -X PUT -d @shared-config.yml http://localhost:8500/v1/kv/config/application/data
```

### Step 4: Set Up Feign Clients

```java
// Feign Client uses service discovery automatically
@FeignClient(name = "agent-service")
public interface AgentServiceClient {
    @GetMapping("/api/agents/{id}")
    AgentDTO getAgent(@PathVariable Long id);
}
// The name "agent-service" is resolved via Consul
```

### Step 5: Verify Service Registration

```bash
# List registered services
curl http://localhost:8500/v1/catalog/services

# Check specific service instances
curl http://localhost:8500/v1/health/service/demand-service

# Check service health in Consul UI
# http://localhost:8500/ui/dc1/services
```

## Resources
- `references/consul-config.md` - Consul configuration and KV store reference

## Examples
### Example 1: Register a New Service
User asks: "Register the new bundle-service with Consul"
Response approach:
1. Add Consul discovery config to `application.yml`
2. Set `spring.application.name: bundle-service`
3. Configure health check path
4. Start the service and verify in Consul UI

### Example 2: Add Shared Configuration
User asks: "Share database pool settings across all services"
Response approach:
1. Write shared config YAML
2. Store in Consul KV under `config/application/data`
3. Verify services pick up the configuration on restart

### Example 3: Debug Service Not Found
User asks: "Feign client cannot find agent-service"
Response approach:
1. Check Consul UI for the service registration
2. Verify health check is passing: `curl http://localhost:8500/v1/health/service/agent-service`
3. Check `spring.cloud.consul` config in the failing service
4. Review service logs for registration errors

## Notes
- Every service MUST register with discovery
- Health check endpoint MUST respond in < 1s
- Use `instance-id` with random value for multiple instances
- Shared configs in Consul KV, service-specific in local `application.yml`
- Gateway stops routing to unhealthy instances automatically
