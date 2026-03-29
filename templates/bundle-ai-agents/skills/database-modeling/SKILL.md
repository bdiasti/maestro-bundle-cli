---
name: database-modeling
description: Model PostgreSQL databases with migrations, indexes, and pgvector. Use when creating tables, defining schemas, writing migrations, or optimizing queries.
version: 1.0.0
author: Maestro
---

# Database Modeling

Design PostgreSQL schemas with proper conventions, Alembic migrations, performant indexes, pgvector for semantic search, and full-text search capabilities.

## When to Use
- Creating new database tables or modifying existing schemas
- Writing Alembic migrations
- Adding indexes to optimize slow queries
- Setting up pgvector for embedding storage
- Configuring full-text search
- Reviewing schema design for anti-patterns

## Available Operations
1. Design tables following naming conventions
2. Create Alembic migrations (upgrade and downgrade)
3. Add indexes for query optimization
4. Set up pgvector for semantic search
5. Configure full-text search with tsvector
6. Analyze and optimize slow queries with EXPLAIN

## Multi-Step Workflow

### Step 1: Design the Table Schema

Follow these naming conventions strictly:

- Table names: `snake_case`, plural (`demands`, `tasks`, `agents`)
- Primary keys: `id UUID DEFAULT gen_random_uuid()`
- Foreign keys: `<singular_table>_id` (e.g., `demand_id`)
- Timestamps: `created_at`, `updated_at` with default `NOW()`
- Soft delete: `deleted_at TIMESTAMP NULL`

### Step 2: Create the Alembic Migration

Generate and write the migration file.

```bash
# Generate a new migration
alembic revision --autogenerate -m "create_demands_table"

# Or create manually
alembic revision -m "create_demands_table"
```

Write the migration:

```python
# alembic/versions/001_create_demands.py
def upgrade():
    op.create_table(
        'demands',
        sa.Column('id', sa.UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.VARCHAR(20), nullable=False, server_default='created'),
        sa.Column('requester', sa.VARCHAR(100), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('NOW()')),
    )

def downgrade():
    op.drop_table('demands')
```

Run the migration:

```bash
# Apply migration
alembic upgrade head

# Verify the table was created
psql $DATABASE_URL -c "\d demands"

# Check migration history
alembic history
```

### Step 3: Add Performance Indexes

Index columns used in WHERE clauses, JOINs, and ORDER BY.

```sql
-- Partial index for active records (most queries filter by status)
CREATE INDEX idx_tasks_status ON tasks(status) WHERE status != 'completed';

-- Foreign key index for JOIN performance
CREATE INDEX idx_tasks_demand ON tasks(demand_id);

-- Composite index for common query patterns
CREATE INDEX idx_tracking_events_demand_agent ON tracking_events(demand_id, agent_id, created_at DESC);
```

### Step 4: Set Up pgvector for Semantic Search

```bash
# Enable pgvector extension
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

```sql
-- Create embeddings table
CREATE TABLE bundle_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding vector(1536) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HNSW index for fast cosine similarity search
CREATE INDEX idx_embeddings_vector ON bundle_embeddings
  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 200);
```

### Step 5: Configure Full-Text Search

```sql
-- Add generated tsvector column
ALTER TABLE bundles ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', name || ' ' || description)) STORED;

-- GIN index for full-text search
CREATE INDEX idx_bundles_search ON bundles USING GIN(search_vector);
```

### Step 6: Analyze and Optimize Queries

```bash
# Run EXPLAIN ANALYZE on slow queries
psql $DATABASE_URL -c "EXPLAIN ANALYZE SELECT * FROM tasks WHERE demand_id = 'abc-123' AND status = 'pending';"

# Check for missing indexes
psql $DATABASE_URL -c "SELECT schemaname, tablename, indexname FROM pg_indexes WHERE tablename = 'tasks';"

# Check table sizes
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_total_relation_size('tasks'));"
```

## Resources
- `references/naming-conventions.md` - Complete naming conventions for PostgreSQL schemas
- `references/index-strategies.md` - When and how to create indexes for different query patterns

## Examples

### Example 1: Create a New Feature Table
User asks: "Create a tasks table with status tracking and assignment to agents."
Response approach:
1. Design columns: id (UUID), title, description, status, demand_id (FK), agent_id (FK), timestamps
2. Write Alembic migration with proper types and defaults
3. Add foreign key constraints with ON DELETE behavior
4. Create indexes on demand_id, agent_id, and status
5. Run migration: `alembic upgrade head`
6. Verify: `psql $DATABASE_URL -c "\d tasks"`

### Example 2: Optimize a Slow Query
User asks: "The demands list endpoint is slow when filtering by status."
Response approach:
1. Run `EXPLAIN ANALYZE` on the slow query
2. Check if an index exists on the status column
3. Create a partial index: `CREATE INDEX idx_demands_status ON demands(status) WHERE deleted_at IS NULL;`
4. Re-run `EXPLAIN ANALYZE` and compare execution times
5. Verify the index is being used (look for "Index Scan" in the plan)

### Example 3: Add Soft Delete
User asks: "Implement soft delete for the demands table."
Response approach:
1. Write migration to add `deleted_at TIMESTAMP NULL` column
2. Update partial indexes to exclude soft-deleted rows: `WHERE deleted_at IS NULL`
3. Update repository queries to filter `WHERE deleted_at IS NULL` by default
4. Create a `restore` method that sets `deleted_at = NULL`
5. Run: `alembic upgrade head`

## Notes
- Never alter schema without a migration -- even in development
- Always write both `upgrade()` and `downgrade()` functions
- Do not create indexes on every column (increases write cost)
- Do not use `SELECT *` in production code -- select only needed columns
- Always run `EXPLAIN ANALYZE` before and after adding indexes to verify improvement
- Use `CASCADE DELETE` with extreme caution -- prefer soft delete or application-level cleanup
- Use `TIMESTAMP WITH TIME ZONE` for all timestamp columns
