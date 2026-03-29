# Projeto: JHipster Monorepo

Você está construindo uma aplicação monolítica com JHipster. Backend em Java/Spring Boot, frontend em Angular, banco PostgreSQL, tudo em um único repositório.

## Specification-Driven Development (SDD)

A regra fundamental de SDD está definida no bundle-base (AGENTS.md base) e é inegociável:
**Sem spec, sem código. Sem exceção.** O agente deve recusar implementar qualquer demanda que
não tenha passado pelo fluxo `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.

Se o usuário pedir para codar algo sem spec, PARE e inicie o fluxo SDD primeiro.
Consulte `.specify/specs/` para verificar se já existe spec para a demanda.

## Product Requirements Document

O arquivo `PRD.md` na raiz do projeto contém os requisitos do produto definidos pelo analista/dev. Consulte-o para entender O QUE construir, as user stories, critérios de aceite, modelo de dados e API specification. Este AGENTS.md define COMO o agente deve trabalhar; o PRD define O QUE deve ser construído.

- `PRD.md` — Requisitos do produto, user stories, API spec, modelo de dados

## References

Documentos de referência que o agente deve consultar quando necessário:

- `references/jhipster-jdl-guide.md` — Guia completo de JDL
- `references/spring-boot-patterns.md` — Padrões Spring Boot
- `references/angular-patterns.md` — Padrões Angular no JHipster
- `references/liquibase-guide.md` — Guia de migrations Liquibase

## Stack do projeto

- **Backend:** Java 21 + Spring Boot 3.x (gerado pelo JHipster)
- **Frontend:** Angular 17+ com TypeScript
- **Banco:** PostgreSQL
- **Cache:** Ehcache ou Redis
- **Migrations:** Liquibase (padrão JHipster)
- **Auth:** JWT (padrão JHipster) ou OAuth2/Keycloak
- **Testes:** JUnit 5 + Mockito (back), Jest + Cypress (front)
- **Build:** Maven ou Gradle
- **API docs:** Swagger/OpenAPI (auto-gerado)

## Estrutura JHipster Monorepo

```
project/
├── src/
│   ├── main/
│   │   ├── java/com/empresa/projeto/
│   │   │   ├── domain/                  # Entidades JPA (enriquecer com DDD)
│   │   │   │   ├── Demand.java
│   │   │   │   ├── Task.java
│   │   │   │   └── enumeration/
│   │   │   ├── repository/              # Spring Data JPA repositories
│   │   │   ├── service/                 # Services (use cases)
│   │   │   │   ├── dto/                 # DTOs
│   │   │   │   ├── mapper/             # MapStruct mappers
│   │   │   │   └── impl/
│   │   │   ├── web/rest/               # REST controllers
│   │   │   ├── config/                 # Spring configs
│   │   │   └── security/              # Security configs
│   │   ├── resources/
│   │   │   ├── config/
│   │   │   │   ├── application.yml
│   │   │   │   ├── application-dev.yml
│   │   │   │   └── application-prod.yml
│   │   │   └── config/liquibase/       # Migrations
│   │   └── webapp/                     # Angular app
│   │       ├── app/
│   │       │   ├── entities/           # Entity CRUD modules
│   │       │   ├── shared/             # Shared components
│   │       │   ├── core/               # Core services
│   │       │   └── layouts/            # Page layouts
│   │       └── content/               # Assets
│   └── test/
│       ├── java/                       # JUnit tests
│       └── javascript/                 # Jest tests
├── .jhipster/                          # JDL entity definitions
│   ├── Demand.json
│   └── Task.json
├── jhipster-jdl.jdl                   # JDL model file
├── pom.xml                            # Maven
└── package.json                       # Frontend deps
```

## Padrões de código

### Java
- Máximo 500 linhas por classe
- Records para DTOs imutáveis (Java 21)
- Optional ao invés de null returns
- Streams API para coleções (não loops imperativos)
- Google Java Style Guide
- Lombok apenas para: `@Slf4j`, `@RequiredArgsConstructor`. Evitar `@Data`.
- Nunca `@Autowired` em campo — usar constructor injection

### Angular
- Strict mode habilitado
- Standalone components (Angular 17+)
- Signals para estado reativo quando possível
- Lazy loading por rota/feature
- Reactive Forms com validação

## JDL — Modelo de entidades

Usar JDL para definir entidades e gerar código:

```jdl
entity Demand {
    description TextBlob required
    status DemandStatus required
    priority Priority required
    createdAt Instant required
    completedAt Instant
}

entity Task {
    description String required maxlength(500)
    status TaskStatus required
    branchName String maxlength(100)
    startedAt Instant
    completedAt Instant
}

enum DemandStatus {
    CREATED, PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
}

enum TaskStatus {
    PENDING, IN_PROGRESS, COMPLETED, FAILED
}

enum Priority {
    LOW, MEDIUM, HIGH, CRITICAL
}

relationship OneToMany {
    Demand{tasks} to Task{demand required}
}

paginate Demand, Task with pagination
dto * with mapstruct
service * with serviceImpl
```

## Enriquecer JHipster com DDD

O JHipster gera entidades anêmicas por padrão. Enriqueça com comportamento:

```java
// NÃO FAZER — entidade anêmica (padrão JHipster)
public class Demand {
    private String description;
    private DemandStatus status;
    // apenas getters/setters
}

// FAZER — entidade rica
public class Demand {
    private String description;
    private DemandStatus status;
    private List<Task> tasks = new ArrayList<>();

    public List<Task> decompose(TaskPlanner planner) {
        if (this.status != DemandStatus.CREATED) {
            throw new DemandAlreadyDecomposedException(this.id);
        }
        this.tasks = planner.plan(this.description);
        this.status = DemandStatus.PLANNED;
        return Collections.unmodifiableList(this.tasks);
    }

    public void startTask(Long taskId) {
        Task task = findTaskOrThrow(taskId);
        long activeCount = tasks.stream()
            .filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS)
            .count();
        if (activeCount >= 3) {
            throw new TooManyActiveTasksException();
        }
        task.start();
    }
}
```

## Liquibase — Migrations

Sempre gerar changeset para mudanças de schema:

```xml
<changeSet id="20260327-1" author="dev">
    <createTable tableName="demand">
        <column name="id" type="bigint" autoIncrement="true">
            <constraints primaryKey="true"/>
        </column>
        <column name="description" type="clob">
            <constraints nullable="false"/>
        </column>
        <column name="status" type="varchar(20)">
            <constraints nullable="false"/>
        </column>
        <column name="created_at" type="timestamp">
            <constraints nullable="false"/>
        </column>
    </createTable>
</changeSet>
```

## Testes

- **JUnit 5:** Testar services e entidades enriquecidas
- **MockMvc:** Testar controllers (status codes, validação)
- **Testcontainers:** Integração com PostgreSQL real
- **Jest:** Componentes Angular
- **Cypress:** E2E flows
- Cobertura mínima: 80%

## Git

- Commits: `feat(demand): adicionar decomposição automática`
- Branches: `feature/<entity>-<descricao>`
- Nunca alterar arquivos gerados do JHipster sem necessidade
- Regenerar com `jhipster import-jdl` quando mudar modelo

## O que NÃO fazer

- Não editar manualmente arquivos que o JHipster regenera (liquibase gerado, webpack config)
- Não colocar regras de negócio no REST controller
- Não usar `@Transactional` em todo lugar — só onde necessário
- Não criar services genéricos "God class"
- Não ignorar DTOs — nunca expor entidade JPA na API
- Não usar Lombok `@Data` (gera equals/hashCode perigoso com JPA)
