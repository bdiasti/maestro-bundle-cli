# Docker Compose Patterns Reference

## Health Check Pattern

Always use health checks so dependent services wait for readiness.

```yaml
postgres:
  image: pgvector/pgvector:pg16
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U maestro"]
    interval: 5s
    timeout: 5s
    retries: 5

api:
  depends_on:
    postgres:
      condition: service_healthy
```

## Hot Reload Pattern

Mount source code for development, but never in production.

```yaml
api:
  volumes:
    - ./src:/app/src          # Source code hot reload
    - /app/node_modules       # Exclude node_modules from mount
```

## Environment Variables Pattern

```yaml
# Development: inline values
api:
  environment:
    - DATABASE_URL=postgresql://maestro:maestro@postgres/maestro
    - DEBUG=true

# Production: use .env file or secrets
api:
  env_file:
    - .env.production
```

## Named Volumes for Persistence

```yaml
volumes:
  pgdata:      # PostgreSQL data
  redis-data:  # Redis persistence
  minio-data:  # MinIO object storage

services:
  postgres:
    volumes:
      - pgdata:/var/lib/postgresql/data
```

## Multi-Profile Pattern

```yaml
services:
  api:
    profiles: ["dev", "prod"]

  debug-tools:
    profiles: ["dev"]
    image: busybox

# Start only dev profile
# docker compose --profile dev up
```

## Networking Pattern

```yaml
services:
  api:
    networks:
      - backend

  postgres:
    networks:
      - backend

  frontend:
    networks:
      - frontend
      - backend  # Needs to reach API

networks:
  frontend:
  backend:
```
