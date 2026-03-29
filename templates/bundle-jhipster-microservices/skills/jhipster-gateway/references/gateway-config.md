# Gateway Configuration Reference

## Route Configuration
```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: service-name          # Unique route ID
          uri: lb://service-name    # Load-balanced URI via discovery
          predicates:
            - Path=/api/resource/** # Path matching
          filters:
            - TokenRelay            # Forward OAuth2 token
```

## Built-in Filters
| Filter | Purpose |
|---|---|
| `TokenRelay` | Forward OAuth2 token to downstream |
| `RequestRateLimiter` | Rate limit requests |
| `CircuitBreaker` | Circuit breaker pattern |
| `Retry` | Retry failed requests |
| `StripPrefix` | Remove path prefix |
| `AddRequestHeader` | Add header to request |

## Rate Limiting
```yaml
filters:
  - name: RequestRateLimiter
    args:
      redis-rate-limiter.replenishRate: 10   # Requests per second
      redis-rate-limiter.burstCapacity: 20   # Max burst
      key-resolver: "#{@userKeyResolver}"    # Key resolver bean
```

## Useful Endpoints
```bash
GET /actuator/gateway/routes       # List all routes
GET /actuator/health               # Service health
GET /actuator/gateway/globalfilters # Global filters
GET /actuator/gateway/routefilters  # Route filters
```
