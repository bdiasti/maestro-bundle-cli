# Liquibase Operations Reference

## Table Operations
```xml
<!-- Create table -->
<createTable tableName="name">
    <column name="id" type="bigint" autoIncrement="true">
        <constraints primaryKey="true" nullable="false"/>
    </column>
    <column name="field" type="varchar(255)">
        <constraints nullable="false"/>
    </column>
</createTable>

<!-- Drop table -->
<dropTable tableName="name"/>
```

## Column Operations
```xml
<!-- Add column -->
<addColumn tableName="name">
    <column name="new_col" type="varchar(100)">
        <constraints nullable="false"/>
    </column>
</addColumn>

<!-- Drop column -->
<dropColumn tableName="name" columnName="col"/>

<!-- Modify column type -->
<modifyDataType tableName="name" columnName="col" newDataType="varchar(500)"/>

<!-- Rename column -->
<renameColumn tableName="name" oldColumnName="old" newColumnName="new" columnDataType="varchar(255)"/>

<!-- Add default value -->
<addDefaultValue tableName="name" columnName="col" defaultValue="ACTIVE"/>
```

## Constraint Operations
```xml
<!-- Add NOT NULL -->
<addNotNullConstraint tableName="name" columnName="col" columnDataType="varchar(255)"/>

<!-- Add UNIQUE -->
<addUniqueConstraint tableName="name" columnNames="col1,col2" constraintName="ux_name_cols"/>

<!-- Add Foreign Key -->
<addForeignKeyConstraint
    baseTableName="child" baseColumnNames="parent_id"
    constraintName="fk_child_parent"
    referencedTableName="parent" referencedColumnNames="id"/>
```

## Index Operations
```xml
<!-- Create index -->
<createIndex indexName="idx_table_col" tableName="name">
    <column name="col"/>
</createIndex>

<!-- Composite index -->
<createIndex indexName="idx_table_cols" tableName="name">
    <column name="col1"/>
    <column name="col2"/>
</createIndex>

<!-- Drop index -->
<dropIndex tableName="name" indexName="idx_table_col"/>
```

## Data Operations
```xml
<!-- Insert data -->
<insert tableName="name">
    <column name="id" value="1"/>
    <column name="name" value="Admin"/>
</insert>

<!-- Load from CSV -->
<loadData file="config/liquibase/data/entity.csv" tableName="name" separator=";">
    <column name="id" type="numeric"/>
    <column name="name" type="string"/>
</loadData>
```

## Maven Commands
```bash
./mvnw liquibase:updateSQL    # Preview SQL
./mvnw liquibase:update       # Apply migrations
./mvnw liquibase:status       # Check pending
./mvnw liquibase:validate     # Validate changelogs
./mvnw liquibase:rollbackCount -Dliquibase.rollbackCount=1  # Rollback
```
