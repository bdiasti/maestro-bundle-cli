---
name: jhipster-liquibase
description: Manage database migrations with Liquibase in JHipster. Use when creating tables, altering schema, adding columns, creating indexes, or managing database changesets.
version: 1.0.0
author: Maestro
---

# JHipster Liquibase

Manage database schema migrations using Liquibase in JHipster projects, including creating tables, adding columns, indexes, and foreign keys.

## When to Use
- When creating new database tables
- When adding or modifying columns
- When creating indexes or foreign keys
- When reviewing or fixing auto-generated changesets
- When rolling back database changes

## Available Operations
1. Create a new table changeset
2. Add columns to existing tables
3. Create indexes and foreign keys
4. Preview SQL before execution
5. Rollback changesets

## Multi-Step Workflow

### Step 1: Understand the Structure

```
src/main/resources/config/liquibase/
  master.xml                    # Main file (lists all changelogs)
  changelog/
    00000000000000_initial_schema.xml
    20260327100000_added_entity_Demand.xml
    20260327100100_added_entity_Task.xml
  data/
    authority.csv               # Initial data
    user.csv
```

```bash
# View existing changelogs
ls src/main/resources/config/liquibase/changelog/

# View master.xml includes
cat src/main/resources/config/liquibase/master.xml
```

### Step 2: Create a Changeset

**New table:**
```xml
<changeSet id="20260327-1" author="dev">
    <createTable tableName="demand">
        <column name="id" type="bigint" autoIncrement="true">
            <constraints primaryKey="true" nullable="false"/>
        </column>
        <column name="description" type="clob">
            <constraints nullable="false"/>
        </column>
        <column name="status" type="varchar(20)">
            <constraints nullable="false"/>
        </column>
        <column name="priority" type="varchar(20)">
            <constraints nullable="false"/>
        </column>
        <column name="created_at" type="timestamp">
            <constraints nullable="false"/>
        </column>
        <column name="completed_at" type="timestamp"/>
    </createTable>

    <createIndex indexName="idx_demand_status" tableName="demand">
        <column name="status"/>
    </createIndex>
</changeSet>
```

**Add column:**
```xml
<changeSet id="20260327-2" author="dev">
    <addColumn tableName="demand">
        <column name="requester" type="varchar(100)">
            <constraints nullable="false"/>
        </column>
    </addColumn>
</changeSet>
```

**Foreign key:**
```xml
<changeSet id="20260327-3" author="dev">
    <addForeignKeyConstraint
        baseTableName="task"
        baseColumnNames="demand_id"
        constraintName="fk_task_demand"
        referencedTableName="demand"
        referencedColumnNames="id"/>
</changeSet>
```

### Step 3: Add Rollback

Always include rollback instructions:
```xml
<changeSet id="20260327-1" author="dev">
    <addColumn tableName="demand">
        <column name="priority" type="varchar(20)"/>
    </addColumn>
    <rollback>
        <dropColumn tableName="demand" columnName="priority"/>
    </rollback>
</changeSet>
```

### Step 4: Register in master.xml

```xml
<include file="config/liquibase/changelog/20260327120000_added_column_priority.xml"
         relativeToChangelogFile="false"/>
```

### Step 5: Preview and Apply

```bash
# Preview SQL without executing
./mvnw liquibase:updateSQL

# Apply migrations
./mvnw liquibase:update

# Check migration status
./mvnw liquibase:status

# Rollback last changeset
./mvnw liquibase:rollbackCount -Dliquibase.rollbackCount=1

# Run the application (auto-applies pending migrations)
./mvnw spring-boot:run

# Verify database state
./mvnw liquibase:status
```

### Step 6: Verify

```bash
# Run integration tests that validate schema
./mvnw test -Dtest="*RepositoryIT,*ResourceIT"

# Check for migration issues
./mvnw liquibase:validate
```

## Resources
- `references/liquibase-operations.md` - Complete reference of Liquibase XML operations

## Examples
### Example 1: Create a New Entity Table
User asks: "Create a products table with name, price, and SKU"
Response approach:
1. Create changelog file `YYYYMMDD_added_entity_Product.xml`
2. Define `createTable` with columns and constraints
3. Add index on frequently queried columns
4. Add rollback with `dropTable`
5. Register in `master.xml`
6. Run `./mvnw liquibase:updateSQL` to preview
7. Run `./mvnw spring-boot:run` to apply

### Example 2: Add Column to Existing Table
User asks: "Add a priority column to the demand table"
Response approach:
1. Create changelog file `YYYYMMDD_added_column_priority.xml`
2. Use `addColumn` with type and constraints
3. Add rollback with `dropColumn`
4. Register in `master.xml`
5. Preview with `./mvnw liquibase:updateSQL`
6. Apply by running the app

### Example 3: Fix a Migration Issue
User asks: "The migration is failing on startup"
Response approach:
1. Check error in application logs
2. Run `./mvnw liquibase:status` to see pending changesets
3. Run `./mvnw liquibase:validate` to check for issues
4. If needed, rollback with `./mvnw liquibase:rollbackCount`
5. Fix the changeset and reapply

## Notes
- Changeset IDs follow format: `YYYYMMDD-N` (date + sequential number)
- NEVER modify a changeset already executed in production
- Always add rollback instructions to changesets
- Preview SQL with `./mvnw liquibase:updateSQL` before applying
- JHipster auto-generates changesets from JDL -- review before running
