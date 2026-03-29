# Docker and Kubernetes Command Reference

## Docker Compose (Dev)
```bash
# Start all services
docker-compose -f docker-compose/docker-compose.yml up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f <service-name>

# Rebuild a single service
docker-compose up -d --build <service-name>

# View running containers
docker-compose ps
```

## Image Building
```bash
# Jib (no Docker daemon needed)
./mvnw -ntp verify -DskipTests jib:dockerBuild -Pprod

# Jib push to registry
./mvnw -ntp verify -DskipTests jib:build -Pprod -Djib.to.image=registry.local/service:tag

# Docker build
docker build -t service:tag .
docker push registry.local/service:tag
```

## Kubernetes (Prod)
```bash
# Apply manifests
kubectl apply -f k8s/

# Check pods
kubectl get pods -n maestro

# View logs
kubectl logs -f deployment/<service> -n maestro

# Scale
kubectl scale deployment <service> --replicas=3 -n maestro

# Rollback
kubectl rollout undo deployment/<service> -n maestro

# Rollout status
kubectl rollout status deployment/<service> -n maestro

# Port forward for debugging
kubectl port-forward svc/<service> 8080:8080 -n maestro

# Execute command in pod
kubectl exec -it <pod-name> -n maestro -- /bin/sh

# View secrets
kubectl get secrets -n maestro
```

## JHipster Generators
```bash
jhipster docker-compose   # Generate docker-compose files
jhipster kubernetes        # Generate K8s manifests
```
