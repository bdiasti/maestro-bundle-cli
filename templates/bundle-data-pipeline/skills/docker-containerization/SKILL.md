---
name: docker-containerization
description: Create optimized Dockerfiles with multi-stage builds, security hardening, and docker-compose for development environments. Use when you need to containerize an application, write Dockerfiles, set up docker-compose, or debug container issues.
version: 1.0.0
author: Maestro
---

# Docker Containerization

Build production-ready containers with multi-stage builds, security best practices, and full docker-compose dev environments.

## When to Use
- User needs to containerize a Python/Node.js application
- User wants to create a docker-compose setup for local development
- User needs to optimize Docker image size with multi-stage builds
- User wants to add health checks, non-root users, or security hardening
- User needs to debug container build or runtime issues

## Available Operations
1. Create a multi-stage Dockerfile for Python (FastAPI/Flask)
2. Create a multi-stage Dockerfile for React/Node.js
3. Set up docker-compose with PostgreSQL, Redis, MinIO
4. Configure .dockerignore for optimal build context
5. Debug build failures and optimize image size

## Multi-Step Workflow

### Step 1: Create .dockerignore
```bash
cat > .dockerignore << 'EOF'
.git
node_modules
__pycache__
*.pyc
.env
.venv
dist
build
coverage
.pytest_cache
.mypy_cache
*.egg-info
.DS_Store
EOF
```

### Step 2: Write Dockerfile for Python API (Multi-Stage)
```dockerfile
# === Build stage ===
FROM python:3.11-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# === Runtime stage ===
FROM python:3.11-slim
WORKDIR /app

# Security: non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy only installed packages from builder
COPY --from=builder /install /usr/local
COPY src/ ./src/

# Switch to non-root
USER appuser

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 3: Write Dockerfile for React Frontend (Multi-Stage)
```dockerfile
# === Build stage ===
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# === Runtime stage ===
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s CMD wget -q --spider http://localhost/ || exit 1
```

### Step 4: Build and Test Locally
```bash
# Build Python API image
docker build -t myapp-api -f docker/Dockerfile.api .

# Build React frontend image
docker build -t myapp-frontend -f docker/Dockerfile.frontend .

# Verify image sizes
docker images | grep myapp

# Test API container
docker run --rm -p 8000:8000 myapp-api

# Test frontend container
docker run --rm -p 3000:80 myapp-frontend
```

### Step 5: Set Up docker-compose for Development
```yaml
# docker-compose.dev.yml
services:
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://maestro:maestro@postgres/maestro
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./src:/app/src  # Hot reload
    depends_on:
      postgres:
        condition: service_healthy

  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: maestro
      POSTGRES_USER: maestro
      POSTGRES_PASSWORD: maestro
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U maestro"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin

volumes:
  pgdata:
```

### Step 6: Start and Manage the Stack
```bash
# Start all services
docker compose -f docker-compose.dev.yml up -d

# Check service health
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f api

# Stop everything
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (clean slate)
docker compose -f docker-compose.dev.yml down -v
```

### Step 7: Debug Common Issues
```bash
# Check why a container exited
docker compose -f docker-compose.dev.yml logs api

# Shell into a running container
docker compose -f docker-compose.dev.yml exec api bash

# Check container resource usage
docker stats

# Rebuild a single service after code changes
docker compose -f docker-compose.dev.yml up -d --build api

# Prune unused images to free disk space
docker image prune -f
```

## Resources
- `references/dockerfile-best-practices.md` - Security and optimization patterns
- `references/compose-patterns.md` - Common docker-compose service configurations

## Examples
### Example 1: Containerize a FastAPI App
User asks: "Create a Dockerfile for our Python API"
Response approach:
1. Create .dockerignore to exclude unnecessary files
2. Write multi-stage Dockerfile (builder + runtime)
3. Add non-root user and health check
4. Build and test with `docker build` and `docker run`
5. Verify image size with `docker images`

### Example 2: Set Up Local Dev Environment
User asks: "Set up docker-compose with Postgres and Redis for development"
Response approach:
1. Create docker-compose.dev.yml with all services
2. Add health checks and dependency ordering
3. Mount source code as volume for hot reload
4. Start with `docker compose up -d`
5. Verify services with `docker compose ps`

## Notes
- Always use multi-stage builds to keep production images small
- Never run containers as root -- create a dedicated appuser
- Add HEALTHCHECK to every Dockerfile for orchestrator integration
- Use `.dockerignore` to keep build context small and fast
- Pin base image versions (python:3.11-slim, not python:latest)
- Mount source code as volumes only in dev, not in production builds
