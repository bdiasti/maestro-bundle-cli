---
name: jhipster-docker-k8s
description: Deploy JHipster microservices with Docker Compose for development and Kubernetes/K3s for production. Use when containerizing services, creating docker-compose, deploying to K8s, or scaling services.
version: 1.0.0
author: Maestro
---

# Docker & Kubernetes for JHipster Microservices

Deploy JHipster microservices using Docker Compose for local development and Kubernetes/K3s for production.

## When to Use
- When setting up local development environment
- When containerizing a microservice
- When deploying to Kubernetes/K3s
- When scaling services
- When troubleshooting container issues

## Available Operations
1. Generate Docker Compose with JHipster
2. Build Docker images with Jib
3. Generate Kubernetes manifests with JHipster
4. Deploy to K3s cluster
5. Scale and manage services

## Multi-Step Workflow

### Step 1: Generate Docker Compose

```bash
# Generate docker-compose via JHipster (from project root)
jhipster docker-compose

# Or use JDL deployment block
jhipster import-jdl jhipster-jdl.jdl
```

### Step 2: Configure Docker Compose for Dev

```yaml
# docker-compose/docker-compose.yml
services:
  gateway:
    image: gateway:latest
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - SPRING_CLOUD_CONSUL_HOST=consul

  demand-service:
    image: demand-service:latest
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - SPRING_CLOUD_CONSUL_HOST=consul
      - SPRING_DATASOURCE_URL=jdbc:postgresql://demand-db:5432/demand
    depends_on:
      - demand-db
      - consul
      - kafka

  demand-db:
    image: postgres:16
    environment:
      POSTGRES_DB: demand
      POSTGRES_USER: demand
      POSTGRES_PASSWORD: demand

  consul:
    image: consul:1.15
    ports:
      - "8500:8500"
    command: agent -server -bootstrap -ui -client=0.0.0.0

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    ports:
      - "9080:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    command: start-dev
```

### Step 3: Build Docker Images

```bash
# Build all services with Jib (no Docker daemon)
./mvnw -ntp verify -DskipTests jib:dockerBuild -Pprod

# Or build specific service
cd demand-service && ./mvnw -ntp verify -DskipTests jib:dockerBuild

# Tag and push to registry
docker tag demand-service:latest registry.local/demand-service:1.0.0
docker push registry.local/demand-service:1.0.0
```

### Step 4: Run Locally with Docker Compose

```bash
# Start all services
docker-compose -f docker-compose/docker-compose.yml up -d

# Check status
docker-compose ps

# View logs of a specific service
docker-compose logs -f demand-service

# Stop all
docker-compose down

# Stop and remove volumes (clean start)
docker-compose down -v
```

### Step 5: Generate Kubernetes Manifests

```bash
# Generate K8s manifests via JHipster
jhipster kubernetes

# Or via JDL deployment block
```

### Step 6: Deploy to Kubernetes/K3s

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n maestro
kubectl get svc -n maestro

# Watch pod logs
kubectl logs -f deployment/demand-service -n maestro

# Scale a service
kubectl scale deployment demand-service --replicas=3 -n maestro

# Rollback a deployment
kubectl rollout undo deployment/demand-service -n maestro

# Check events for troubleshooting
kubectl get events -n maestro --sort-by=.lastTimestamp
```

### Step 7: Verify

```bash
# Test gateway endpoint
curl http://localhost:8080/api/demands

# Check Consul UI for registered services
# http://localhost:8500

# Check Keycloak admin
# http://localhost:9080
```

## Resources
- `references/docker-compose-reference.md` - Docker Compose configuration reference
- `references/k8s-troubleshooting.md` - Common Kubernetes troubleshooting commands

## Examples

### Example 1: Set Up Dev Environment
User asks: "Set up the local development environment"
Response approach:
1. Run `jhipster docker-compose` to generate files
2. Run `docker-compose up -d` to start infrastructure
3. Verify Consul, Kafka, Keycloak are running
4. Start each service with `./mvnw spring-boot:run`

### Example 2: Deploy to Production
User asks: "Deploy demand-service to K3s"
Response approach:
1. Build image: `./mvnw jib:build -Djib.to.image=registry.local/demand-service:1.0.0`
2. Update K8s manifest with new image tag
3. Apply: `kubectl apply -f k8s/demand-service/`
4. Verify: `kubectl rollout status deployment/demand-service -n maestro`

### Example 3: Service Won't Start
User asks: "demand-service pod keeps crashing"
Response approach:
1. Check pod status: `kubectl describe pod <pod-name> -n maestro`
2. Check logs: `kubectl logs <pod-name> -n maestro`
3. Common causes: database not ready, Consul not reachable, missing env vars
4. Fix and redeploy

## Notes
- Use Jib for Docker builds (no Docker daemon needed, faster)
- Never use `latest` tag in production K8s manifests
- Each service has its own database container in docker-compose
- Use `docker-compose down -v` for a completely clean restart
- Set resource limits in K8s manifests (memory, CPU)
- Add readiness and liveness probes to all deployments
