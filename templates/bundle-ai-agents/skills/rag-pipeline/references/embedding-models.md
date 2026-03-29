# Embedding Models Reference

## Model Comparison

| Model | Dimensions | Max Tokens | Cost | Quality |
|---|---|---|---|---|
| text-embedding-3-large | 3072 (or 1536) | 8191 | $0.13/1M tokens | Best |
| text-embedding-3-small | 1536 | 8191 | $0.02/1M tokens | Good |
| text-embedding-ada-002 | 1536 | 8191 | $0.10/1M tokens | Legacy |

## Recommendations

- **Production**: Use `text-embedding-3-large` with `dimensions=1536` for best quality/cost balance.
- **Development/Prototyping**: Use `text-embedding-3-small` to reduce costs.
- **Consistency**: Never mix embedding models in the same collection -- re-embed everything if you switch.

## pgvector Index Types

| Index | Build Speed | Query Speed | Recall | Use Case |
|---|---|---|---|---|
| HNSW | Slow | Fast | High | Production (< 10M vectors) |
| IVFFlat | Fast | Medium | Medium | Large datasets, quick setup |
| None (brute force) | N/A | Slow | Perfect | Small datasets (< 50k) |

### Recommended HNSW Settings

```sql
CREATE INDEX idx_embeddings ON documents
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 200);
```
