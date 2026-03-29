---
name: ci-cd-pipeline
description: Create CI/CD pipelines with GitLab CI for JHipster microservices including lint, test, build, compliance check, and deploy. Use when setting up CI/CD, creating pipelines, automating deployments, or adding quality gates.
version: 1.0.0
author: Maestro
---

# CI/CD Pipeline

Create and configure GitLab CI pipelines for JHipster microservices with stages for lint, test, security, compliance, build, and deploy.

## When to Use
- When setting up CI/CD for a new microservice
- When adding quality gates (lint, test, security scan)
- When automating Docker builds and pushes
- When configuring deployment to K3s/Kubernetes
- When adding compliance checks

## Available Operations
1. Create `.gitlab-ci.yml` with all stages
2. Configure lint and test stages
3. Set up Docker image build with Jib
4. Configure deployment to Kubernetes
5. Add security scanning

## Multi-Step Workflow

### Step 1: Create Pipeline File

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - test
  - security
  - build
  - deploy-staging
  - deploy-prod

variables:
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE
  K3S_NAMESPACE: maestro
  MAVEN_OPTS: "-Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository"

cache:
  paths:
    - .m2/repository/
    - node_modules/
```

### Step 2: Add Lint and Test Stages

```yaml
lint:backend:
  stage: lint
  image: maven:3.9-eclipse-temurin-21
  script:
    - ./mvnw checkstyle:check -DskipTests
    - ./mvnw pmd:check -DskipTests

lint:frontend:
  stage: lint
  image: node:20-slim
  script:
    - npm ci
    - npm run lint

test:backend:
  stage: test
  image: maven:3.9-eclipse-temurin-21
  services:
    - postgres:16
  variables:
    SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/testdb
    SPRING_DATASOURCE_USERNAME: test
    SPRING_DATASOURCE_PASSWORD: test
  script:
    - ./mvnw verify -Pprod -DskipTests=false
    - ./mvnw test -Dtest="*IT" -DfailIfNoTests=false
  artifacts:
    reports:
      junit: target/surefire-reports/*.xml

test:frontend:
  stage: test
  image: node:20-slim
  script:
    - npm ci
    - npm test -- --coverage
```

### Step 3: Add Security Scanning

```yaml
security:dependencies:
  stage: security
  image: maven:3.9-eclipse-temurin-21
  script:
    - ./mvnw org.owasp:dependency-check-maven:check
  allow_failure: true
  artifacts:
    paths:
      - target/dependency-check-report.html
```

### Step 4: Add Docker Build

```yaml
build:image:
  stage: build
  script:
    # Build with Jib (no Docker daemon needed)
    - ./mvnw -ntp verify -DskipTests jib:build
        -Djib.to.image=$DOCKER_IMAGE:$CI_COMMIT_SHA
        -Djib.to.auth.username=$CI_REGISTRY_USER
        -Djib.to.auth.password=$CI_REGISTRY_PASSWORD
  only:
    - main
    - develop
```

### Step 5: Add Deployment Stages

```yaml
deploy:staging:
  stage: deploy-staging
  image: bitnami/kubectl:latest
  script:
    - kubectl -n $K3S_NAMESPACE-staging set image
        deployment/$CI_PROJECT_NAME
        app=$DOCKER_IMAGE:$CI_COMMIT_SHA
    - kubectl -n $K3S_NAMESPACE-staging rollout status
        deployment/$CI_PROJECT_NAME --timeout=120s
  only:
    - develop

deploy:prod:
  stage: deploy-prod
  image: bitnami/kubectl:latest
  script:
    - kubectl -n $K3S_NAMESPACE set image
        deployment/$CI_PROJECT_NAME
        app=$DOCKER_IMAGE:$CI_COMMIT_SHA
    - kubectl -n $K3S_NAMESPACE rollout status
        deployment/$CI_PROJECT_NAME --timeout=120s
  only:
    - main
  when: manual  # Requires manual approval
```

### Step 6: Verify Pipeline

```bash
# Validate gitlab-ci.yml syntax
gitlab-ci-lint .gitlab-ci.yml

# Or validate via GitLab API
curl --header "PRIVATE-TOKEN: $TOKEN" \
  "https://gitlab.local/api/v4/ci/lint" \
  --form "content=@.gitlab-ci.yml"

# Check pipeline status
git push && echo "Check pipeline at: https://gitlab.local/$PROJECT/pipelines"
```

## Resources
- `references/gitlab-ci-templates.md` - Reusable GitLab CI templates and patterns

## Examples

### Example 1: Setup CI for New Service
User asks: "Set up CI/CD for the new notification-service"
Response approach:
1. Create `.gitlab-ci.yml` in service root
2. Add lint, test, build stages
3. Configure PostgreSQL service for tests
4. Add Jib build step
5. Push and verify pipeline runs

### Example 2: Add Deployment Stage
User asks: "Add automatic deploy to staging on develop branch"
Response approach:
1. Add `deploy:staging` stage with kubectl
2. Configure K8s credentials as CI variables
3. Set `only: develop` trigger
4. Test with a push to develop

### Example 3: Pipeline is Failing
User asks: "Tests are failing in CI but pass locally"
Response approach:
1. Check CI logs for the specific failure
2. Compare CI environment (Java version, PostgreSQL version)
3. Verify environment variables are set in CI
4. Check if test depends on local-only resources
5. Fix and push to re-trigger pipeline

## Notes
- Use `cache` for Maven/npm dependencies to speed up builds
- `when: manual` for production deploys (requires human approval)
- Store secrets in GitLab CI variables, never in `.gitlab-ci.yml`
- Use Jib for Docker builds (no Docker daemon required)
- Each microservice has its own pipeline
