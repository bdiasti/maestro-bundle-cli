# Dockerfile Best Practices

## Multi-Stage Build Pattern
```dockerfile
# Stage 1: Build
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime (smaller image)
FROM python:3.11-slim
COPY --from=builder /install /usr/local
COPY src/ ./src/
CMD ["python", "-m", "src.main"]
```

## Security Checklist
- [ ] Non-root user: `RUN groupadd -r app && useradd -r -g app app` then `USER app`
- [ ] Pin base image versions: `python:3.11-slim` not `python:latest`
- [ ] No secrets in build args or ENV: use runtime environment variables
- [ ] Minimal packages: `--no-install-recommends` for apt-get
- [ ] Clean up apt cache: `rm -rf /var/lib/apt/lists/*`
- [ ] Scan images: `docker scout cves myimage`

## Layer Optimization
```dockerfile
# BAD: creates unnecessary layer cache misses
COPY . .
RUN pip install -r requirements.txt

# GOOD: dependencies cached separately from code
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ ./src/
```

## Health Checks
```dockerfile
# HTTP health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# TCP health check (no curl needed)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1
```

## Image Size Comparison
| Base Image | Size | Use Case |
|---|---|---|
| python:3.11 | ~900MB | Avoid |
| python:3.11-slim | ~120MB | Default choice |
| python:3.11-alpine | ~50MB | If musl-compatible |
| node:20 | ~1GB | Avoid |
| node:20-slim | ~200MB | Default choice |
| node:20-alpine | ~130MB | If no native deps |
