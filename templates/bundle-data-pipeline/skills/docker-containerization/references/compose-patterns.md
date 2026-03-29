# Docker Compose Patterns

## PostgreSQL with pgvector
```yaml
postgres:
  image: pgvector/pgvector:pg16
  environment:
    POSTGRES_DB: mydb
    POSTGRES_USER: myuser
    POSTGRES_PASSWORD: mypassword
  ports:
    - "5432:5432"
  volumes:
    - pgdata:/var/lib/postgresql/data
    - ./init.sql:/docker-entrypoint-initdb.d/init.sql
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U myuser"]
    interval: 5s
    timeout: 5s
    retries: 5
```

## Redis
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redisdata:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 3s
```

## MinIO (S3-compatible storage)
```yaml
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
    - miniodata:/data
```

## MLflow Server
```yaml
mlflow:
  image: ghcr.io/mlflow/mlflow:latest
  command: mlflow server --host 0.0.0.0 --port 5000 --backend-store-uri postgresql://mlflow:mlflow@postgres/mlflow --default-artifact-root s3://mlflow/
  ports:
    - "5000:5000"
  depends_on:
    postgres:
      condition: service_healthy
```

## Dependency Ordering
```yaml
services:
  api:
    depends_on:
      postgres:
        condition: service_healthy  # wait for healthy, not just started
      redis:
        condition: service_started
```

## Development Volumes (hot reload)
```yaml
services:
  api:
    volumes:
      - ./src:/app/src          # mount source code
      - /app/node_modules       # exclude node_modules from mount
```
