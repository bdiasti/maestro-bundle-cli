# GitLab CI Templates Reference

## Pipeline Stages
```yaml
stages:
  - lint
  - test
  - security
  - build
  - deploy-staging
  - deploy-prod
```

## Java/Maven Lint Template
```yaml
.lint-java:
  stage: lint
  image: maven:3.9-eclipse-temurin-21
  script:
    - ./mvnw checkstyle:check -DskipTests
    - ./mvnw pmd:check -DskipTests
```

## Java/Maven Test Template
```yaml
.test-java:
  stage: test
  image: maven:3.9-eclipse-temurin-21
  services:
    - postgres:16
  variables:
    SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/testdb
  script:
    - ./mvnw verify -Pprod -DskipTests=false
  artifacts:
    reports:
      junit: target/surefire-reports/*.xml
```

## Angular Test Template
```yaml
.test-angular:
  stage: test
  image: node:20-slim
  script:
    - npm ci
    - npm run lint
    - npm test -- --coverage
```

## Jib Build Template
```yaml
.build-jib:
  stage: build
  script:
    - ./mvnw -ntp verify -DskipTests jib:build
        -Djib.to.image=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
        -Djib.to.auth.username=$CI_REGISTRY_USER
        -Djib.to.auth.password=$CI_REGISTRY_PASSWORD
  only:
    - main
    - develop
```

## K8s Deploy Template
```yaml
.deploy-k8s:
  image: bitnami/kubectl:latest
  script:
    - kubectl -n $NAMESPACE set image deployment/$SERVICE app=$IMAGE:$TAG
    - kubectl -n $NAMESPACE rollout status deployment/$SERVICE --timeout=120s
```

## Security Scan Template
```yaml
.security-scan:
  stage: security
  script:
    - ./mvnw org.owasp:dependency-check-maven:check
  allow_failure: true
  artifacts:
    paths:
      - target/dependency-check-report.html
```

## CI Variables to Configure
| Variable | Purpose |
|---|---|
| `CI_REGISTRY_IMAGE` | Docker registry URL |
| `CI_REGISTRY_USER` | Registry username |
| `CI_REGISTRY_PASSWORD` | Registry password |
| `K3S_NAMESPACE` | Kubernetes namespace |
| `KUBECONFIG` | K8s config (file variable) |
