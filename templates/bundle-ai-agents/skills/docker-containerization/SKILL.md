---
name: docker-containerization
description: Create optimized Dockerfiles with multi-stage builds, security hardening, and docker-compose for development. Use when containerizing applications, creating Dockerfiles, or configuring dev environments.
version: 1.0.0
author: Maestro
---

# Docker Containerization

Build production-ready Docker images with multi-stage builds, non-root users, health checks, and docker-compose configurations for local development.

## When to Use
- Containerizing a Python (FastAPI/Django) or Node.js (React/Next.js) application
- Creating or optimizing a Dockerfile
- Setting up docker-compose for local development
- Adding health checks, security hardening, or image size optimization
- Configuring multi-service development environments (API + DB + Redis + MinIO)

## Available Operations
1. Create multi-stage Dockerfiles for Python applications
2. Create multi-stage Dockerfiles for React/Node.js applications
3. Configure docker-compose for development
4. Add security hardening (non-root user, minimal base image)
5. Add health checks for container orchestration
6. Create .dockerignore for build optimization

## Multi-Step Workflow

### Step 1: Create .dockerignore

Always start with .dockerignore to prevent unnecessary files from entering the build context.

```
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
```

### Step 2: Create the Dockerfile (Python)

Use multi-stage build for minimal image size.

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
RUN groupadd -r appuser && useradd -r -g appuser appuser
COPY --from=builder /install /usr/local
COPY src/ ./src/
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 3: Create the Dockerfile (React)

```dockerfile
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Step 4: Configure Docker Compose for Development

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

### Step 5: Build and Test

```bash
# Build the image
docker build -t maestro-api -f docker/Dockerfile.api .

# Check image size
docker images maestro-api

# Run and test health check
docker run -d --name test-api -p 8000:8000 maestro-api
curl -f http://localhost:8000/health
docker stop test-api && docker rm test-api

# Start the full dev environment
docker compose -f docker-compose.dev.yml up -d

# Verify all services are healthy
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f api
```

### Step 6: Security Audit

```bash
# Scan for vulnerabilities
docker scout cves maestro-api

# Verify non-root user
docker run --rm maestro-api whoami  # Should output "appuser"

# Check no secrets in the image
docker history maestro-api --no-trunc | grep -i "secret\|password\|key"
```

## Resources
- `references/dockerfile-checklist.md` - Security and optimization checklist for Dockerfiles
- `references/compose-patterns.md` - Common docker-compose patterns for dev environments

## Examples

### Example 1: Containerize a FastAPI Application
User asks: "Containerize our FastAPI backend for production."
Response approach:
1. Create .dockerignore to exclude .venv, __pycache__, .env
2. Write multi-stage Dockerfile: builder installs deps, runtime copies only what's needed
3. Add non-root user (appuser)
4. Add HEALTHCHECK on /health endpoint
5. Build: `docker build -t api -f Dockerfile .`
6. Test: `docker run -p 8000:8000 api && curl localhost:8000/health`
7. Check size: `docker images api` (target: < 200MB)

### Example 2: Set Up Local Dev Environment
User asks: "Set up docker-compose so new developers can run everything locally."
Response approach:
1. Create docker-compose.dev.yml with api, postgres (pgvector), redis, minio
2. Add health checks on postgres so api waits for DB readiness
3. Mount source code as volume for hot reload
4. Set environment variables for local database URLs
5. Start: `docker compose -f docker-compose.dev.yml up -d`
6. Verify: `docker compose ps` (all services should be "healthy")

### Example 3: Optimize Image Size
User asks: "Our Docker image is 1.2GB. Make it smaller."
Response approach:
1. Switch to multi-stage build if not already using one
2. Use `python:3.11-slim` instead of `python:3.11`
3. Use `--no-cache-dir` on pip install
4. Use `--no-install-recommends` on apt-get
5. Remove apt cache: `rm -rf /var/lib/apt/lists/*`
6. Check .dockerignore for missing exclusions
7. Target: under 200MB for Python, under 50MB for React (nginx)

## Notes
- Always use multi-stage builds to keep production images small
- Never run containers as root -- create a dedicated appuser
- Never put secrets in Dockerfiles or docker-compose files -- use environment variables
- Always add HEALTHCHECK for production containers
- Use `docker compose` (v2) not `docker-compose` (v1)
- Pin base image versions in production (e.g., `python:3.11.7-slim`, not `python:3.11-slim`)
- Volume mounts for hot reload should only be used in development
