# Consul Configuration Reference

## Service Registration
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
```

## Centralized Config
```yaml
spring:
  cloud:
    consul:
      config:
        enabled: true
        format: yaml
        default-context: application  # Shared config key prefix
```

## KV Store Paths
| Path | Scope |
|---|---|
| `config/application/data` | Shared by all services |
| `config/demand-service/data` | Specific to demand-service |
| `config/agent-service/data` | Specific to agent-service |

## CLI Commands
```bash
# List services
consul catalog services

# Check service health
consul catalog nodes -service=demand-service

# Put KV data
consul kv put config/application/data @config.yml

# Get KV data
consul kv get config/application/data
```

## HTTP API
```bash
# List services
curl http://localhost:8500/v1/catalog/services

# Service health
curl http://localhost:8500/v1/health/service/demand-service

# KV operations
curl -X PUT -d @config.yml http://localhost:8500/v1/kv/config/application/data
curl http://localhost:8500/v1/kv/config/application/data?raw
```
