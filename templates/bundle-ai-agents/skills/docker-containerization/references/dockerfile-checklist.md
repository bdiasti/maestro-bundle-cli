# Dockerfile Checklist Reference

## Security

- [ ] Non-root user created and used (`USER appuser`)
- [ ] Base image is minimal (`-slim` or `-alpine`)
- [ ] No secrets or credentials in the Dockerfile
- [ ] No `sudo` or `setuid` binaries
- [ ] `COPY` specific files, not `COPY . .` without .dockerignore

## Optimization

- [ ] Multi-stage build (separate builder and runtime stages)
- [ ] `--no-cache-dir` on pip install
- [ ] `--no-install-recommends` on apt-get
- [ ] `rm -rf /var/lib/apt/lists/*` after apt-get
- [ ] `.dockerignore` excludes .git, node_modules, .env, __pycache__
- [ ] Dependencies installed before source code (layer caching)
- [ ] Final image size under 200MB (Python) or 50MB (React/nginx)

## Production Readiness

- [ ] HEALTHCHECK defined
- [ ] EXPOSE declares the correct port
- [ ] CMD uses exec form (`["cmd", "arg"]`), not shell form
- [ ] WORKDIR is set
- [ ] Labels for metadata (optional): `LABEL maintainer="team"`

## Common Mistakes

| Mistake | Fix |
|---|---|
| `COPY . .` before `pip install` | Copy requirements.txt first, then install, then copy source |
| Running as root | `RUN useradd appuser` + `USER appuser` |
| Using `latest` tag | Pin version: `python:3.11.7-slim` |
| Installing dev dependencies | Use `pip install --no-dev` or separate requirements files |
| Large final image | Use multi-stage build; check with `docker images` |
