# Embedding Models Comparison

## OpenAI Models

| Model | Dimensions | Max Tokens | Best For |
|---|---|---|---|
| text-embedding-3-large | 3072 (or custom) | 8191 | Highest quality, production |
| text-embedding-3-small | 1536 | 8191 | Cost-effective, good quality |
| text-embedding-ada-002 | 1536 | 8191 | Legacy, still widely used |

## Usage with LangChain
```python
from langchain_openai import OpenAIEmbeddings

# Default (text-embedding-3-large with reduced dimensions)
embeddings = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=1536)

# Full dimensions for maximum quality
embeddings = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=3072)

# Cost-effective option
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
```

## Open Source Alternatives
```python
from langchain_community.embeddings import HuggingFaceEmbeddings

# All-MiniLM (fast, lightweight)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# BGE (high quality, multilingual)
embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-large-en-v1.5")
```

## Dimensionality and pgvector
When creating the pgvector extension and table:
```sql
CREATE EXTENSION IF NOT EXISTS vector;

-- Match dimensions to your embedding model
CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    content TEXT,
    embedding vector(1536)  -- adjust to match model dimensions
);

CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
```
