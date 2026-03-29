---
name: jhipster-gateway
description: Configure the JHipster Gateway with Spring Cloud Gateway, routing, rate limiting, CORS, and frontend Angular. Use when configuring gateway routes, load balancing, rate limiting, or CORS between services.
version: 1.0.0
author: Maestro
---

# JHipster Gateway

Configure and manage the JHipster Gateway as the single entry point for microservices, handling routing, rate limiting, CORS, and serving the Angular frontend.

## When to Use
- When configuring routes to backend microservices
- When setting up rate limiting on API endpoints
- When configuring CORS for cross-origin requests
- When checking health/status of backend services
- When debugging routing issues

## Available Operations
1. Configure service routes with load balancing
2. Add rate limiting per route
3. Configure CORS policies
4. Monitor service health via actuator
5. Add custom gateway filters

## Multi-Step Workflow

### Step 1: Configure Routes

```yaml
# application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: demand-service
          uri: lb://demand-service
          predicates:
            - Path=/api/demands/**,/api/tasks/**
        - id: agent-service
          uri: lb://agent-service
          predicates:
            - Path=/api/agents/**,/api/teams/**
        - id: tracking-service
          uri: lb://tracking-service
          predicates:
            - Path=/api/tracking/**,/api/events/**
      default-filters:
        - TokenRelay
```

### Step 2: Add Rate Limiting

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: demand-service
          uri: lb://demand-service
          predicates:
            - Path=/api/demands/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
                key-resolver: "#{@userKeyResolver}"
```

```java
@Bean
public KeyResolver userKeyResolver() {
    return exchange -> Mono.just(
        exchange.getRequest().getHeaders().getFirst("Authorization") != null
            ? exchange.getRequest().getHeaders().getFirst("Authorization")
            : exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
    );
}
```

### Step 3: Configure CORS

```java
@Bean
public CorsWebFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:4200", "https://maestro.local"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", config);
    return new CorsWebFilter(source);
}
```

### Step 4: Enable Health Monitoring

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,gateway
  endpoint:
    gateway:
      enabled: true
```

```bash
# View active routes
curl http://localhost:8080/actuator/gateway/routes

# Check service health
curl http://localhost:8080/actuator/health
```

### Step 5: Build and Verify

```bash
# Build gateway
./mvnw compile

# Run gateway
./mvnw spring-boot:run

# Verify routing works
curl http://localhost:8080/api/demands
curl http://localhost:8080/api/agents

# Run tests
./mvnw test
```

## Resources
- `references/gateway-config.md` - Gateway routing and filter configuration reference

## Examples
### Example 1: Add a New Service Route
User asks: "Route /api/bundles to the new bundle-service"
Response approach:
1. Add route entry in `application.yml` with `lb://bundle-service` URI
2. Add path predicate for `/api/bundles/**`
3. Restart gateway and verify with `curl http://localhost:8080/api/bundles`

### Example 2: Add Rate Limiting
User asks: "Limit the demands API to 10 requests per second"
Response approach:
1. Add `RequestRateLimiter` filter to the demand-service route
2. Configure `replenishRate` and `burstCapacity`
3. Add `KeyResolver` bean for user-based limiting
4. Test with load tool or rapid curl requests

### Example 3: Debug Routing Issues
User asks: "Requests to /api/agents return 404"
Response approach:
1. Check `curl http://localhost:8080/actuator/gateway/routes` for the route
2. Verify agent-service is registered in Consul/Eureka
3. Check agent-service health: `curl http://localhost:8080/actuator/health`
4. Review gateway logs for routing errors

## Notes
- The Gateway is the single entry point -- all client traffic goes through it
- `lb://` prefix enables load-balanced routing via service discovery
- `TokenRelay` filter forwards OAuth2 tokens to downstream services
- Frontend Angular app is served by the Gateway
