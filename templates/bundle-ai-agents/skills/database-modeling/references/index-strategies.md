# Index Strategies Reference

## When to Create Indexes

| Query Pattern | Index Type | Example |
|---|---|---|
| `WHERE column = value` | B-tree (default) | `CREATE INDEX idx_tasks_status ON tasks(status)` |
| `WHERE col1 = X AND col2 = Y` | Composite | `CREATE INDEX idx_tasks_demand_status ON tasks(demand_id, status)` |
| `WHERE status != 'completed'` | Partial | `CREATE INDEX idx_tasks_active ON tasks(status) WHERE status != 'completed'` |
| `WHERE deleted_at IS NULL` | Partial | `CREATE INDEX idx_demands_live ON demands(id) WHERE deleted_at IS NULL` |
| Full-text search | GIN on tsvector | `CREATE INDEX idx_search ON docs USING GIN(search_vector)` |
| Vector similarity | HNSW | `CREATE INDEX idx_vec ON embeddings USING hnsw(embedding vector_cosine_ops)` |
| JSONB queries | GIN | `CREATE INDEX idx_meta ON docs USING GIN(metadata)` |

## When NOT to Create Indexes

- Tables with fewer than 1,000 rows (sequential scan is faster)
- Columns with very low cardinality (e.g., boolean with 50/50 distribution)
- Columns that are rarely used in WHERE, JOIN, or ORDER BY
- Write-heavy tables where index maintenance cost exceeds read benefit

## Composite Index Column Order

Put the most selective column first (the one that filters out the most rows).

```sql
-- Good: demand_id is more selective than status
CREATE INDEX idx_tasks_demand_status ON tasks(demand_id, status);

-- Bad: status has few distinct values, less selective
CREATE INDEX idx_tasks_status_demand ON tasks(status, demand_id);
```

## Monitoring Index Usage

```sql
-- Find unused indexes
SELECT indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find missing indexes (sequential scans on large tables)
SELECT relname, seq_scan, idx_scan, n_live_tup
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan AND n_live_tup > 10000
ORDER BY seq_scan - idx_scan DESC;
```
