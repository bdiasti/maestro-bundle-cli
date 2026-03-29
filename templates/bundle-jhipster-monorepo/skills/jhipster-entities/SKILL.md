---
name: jhipster-entities
description: Create and manage JHipster entities with JDL, relationships, enums, validations, and code generation. Use when creating entities, defining data models, generating CRUD, or writing JDL files.
version: 1.0.0
author: Maestro
---

# JHipster Entities

Create and manage JHipster entities using JDL (JHipster Domain Language) with relationships, validations, and DDD enrichment.

## When to Use
- When creating new entities or data models
- When defining relationships between entities
- When generating CRUD code from JDL
- When enriching generated entities with business behavior (DDD)
- When updating existing entity definitions

## Available Operations
1. Define entities in JDL with types and validations
2. Define relationships (OneToMany, ManyToMany, OneToOne)
3. Generate code with `jhipster import-jdl`
4. Enrich generated entities with domain behavior
5. Create/update enums

## Multi-Step Workflow

### Step 1: Define Entity in JDL
Create or edit the JDL file with entity definitions.

Available types:
| JDL Type | Java Type | DB Column |
|---|---|---|
| String | String | varchar(255) |
| Integer | Integer | integer |
| Long | Long | bigint |
| BigDecimal | BigDecimal | decimal |
| Boolean | Boolean | boolean |
| LocalDate | LocalDate | date |
| Instant | Instant | timestamp |
| ZonedDateTime | ZonedDateTime | timestamp |
| UUID | UUID | uuid |
| Blob/AnyBlob/ImageBlob | byte[] | blob |
| TextBlob | String | clob |

Example with validations:
```jdl
entity Product {
    name String required minlength(3) maxlength(100)
    price BigDecimal required min(0)
    description TextBlob
    active Boolean required
    sku String required unique pattern(/^[A-Z]{3}-[0-9]{4}$/)
}
```

### Step 2: Define Relationships
```jdl
relationship OneToMany {
    Department{employees} to Employee{department(name) required}
}

relationship ManyToMany {
    Project{members(login)} to User with builtInEntity
}

relationship OneToOne {
    Employee{address} to Address with jpaDerivedIdentifier
}
```

### Step 3: Define Enums
```jdl
enum Status {
    ACTIVE("Ativo"),
    INACTIVE("Inativo"),
    SUSPENDED("Suspenso")
}
```

### Step 4: Generate Code

```bash
# Generate from JDL (recommended)
jhipster import-jdl jhipster-jdl.jdl

# Generate individual entity interactively
jhipster entity Demand

# Verify generated files
ls src/main/java/com/myapp/domain/
ls src/main/java/com/myapp/web/rest/
ls src/main/java/com/myapp/repository/
ls src/main/resources/config/liquibase/changelog/
```

### Step 5: Enrich with DDD Behavior
After generation, add rich domain behavior to the entity:

```java
@Entity
@Table(name = "demand")
public class Demand implements Serializable {

    // Generated fields (keep as-is)
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @NotNull
    @Lob
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING)
    private DemandStatus status;

    @OneToMany(mappedBy = "demand", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    // ADD -- rich behavior
    public void addTask(Task task) {
        if (this.tasks.size() >= 20) {
            throw new BusinessException("Maximo 20 tasks por demanda");
        }
        this.tasks.add(task);
        task.setDemand(this);
    }

    public void removeTask(Task task) {
        this.tasks.remove(task);
        task.setDemand(null);
    }

    public boolean isCompletable() {
        return this.tasks.stream().allMatch(t -> t.getStatus() == TaskStatus.COMPLETED);
    }

    public void complete() {
        if (!isCompletable()) {
            throw new BusinessException("Nem todas as tasks foram concluidas");
        }
        this.status = DemandStatus.COMPLETED;
    }
}
```

### Step 6: Adjust Liquibase and Tests

```bash
# Verify generated changelog
cat src/main/resources/config/liquibase/changelog/*_added_entity_*.xml

# Run tests to verify generation
./mvnw test -Dtest="*DemandResourceIT"

# Run the app to verify
./mvnw spring-boot:run
```

## Resources
- `references/jdl-types.md` - Complete JDL type reference and validation options

## Examples
### Example 1: Create a New Entity
User asks: "Create a Product entity with name, price, and SKU"
Response approach:
1. Write JDL definition with proper types and validations
2. Run `jhipster import-jdl jhipster-jdl.jdl`
3. Verify generated files in domain/, repository/, web/rest/
4. Add any domain behavior needed
5. Run `./mvnw test` to verify

### Example 2: Add Relationship Between Entities
User asks: "A Department has many Employees"
Response approach:
1. Add `relationship OneToMany { Department{employees} to Employee{department required} }` to JDL
2. Regenerate with `jhipster import-jdl jhipster-jdl.jdl`
3. Check generated foreign keys in Liquibase changelog
4. Run `./mvnw test`

### Example 3: Enrich Entity with Business Rules
User asks: "Add a rule that a demand cannot have more than 20 tasks"
Response approach:
1. Open the Demand entity class
2. Add `addTask()` method with the invariant check
3. Add corresponding unit test
4. Run `./mvnw test`

## Notes
- Always run `jhipster import-jdl` to regenerate after JDL changes
- Mark custom code clearly to preserve during regeneration
- Liquibase changelogs are auto-generated -- review before running
- Use `references/jdl-types.md` for the complete type reference
