---
name: rag-pipeline
description: Build complete RAG pipelines with ingestion, chunking, embedding, indexing, and retrieval using LangChain + pgvector. Use when implementing semantic search, answering questions over documents, or creating retrieval systems.
version: 1.0.0
author: Maestro
---

# RAG Pipeline

Build production-ready Retrieval-Augmented Generation pipelines with hybrid search, re-ranking, and quality evaluation.

## When to Use
- Building a semantic search system over documents
- Answering questions from a knowledge base (PDFs, Markdown, code)
- Creating a retrieval layer for an AI agent
- Indexing project documentation, skills, or bundles into a vector store
- Improving an existing RAG pipeline's accuracy or performance

## Available Operations
1. Ingest documents (load, split, enrich with metadata)
2. Generate embeddings and index into pgvector
3. Configure hybrid retrieval (semantic + keyword BM25)
4. Add re-ranking for precision
5. Build a query chain with LLM
6. Evaluate retrieval quality with golden datasets

## Multi-Step Workflow

### Step 1: Set Up Environment

Install required dependencies and verify database connectivity.

```bash
pip install langchain langchain-openai langchain-postgres langchain-community langchain-cohere pgvector rank-bm25
```

Verify pgvector is available:

```bash
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### Step 2: Ingest Documents

Load documents from the target directory and split into chunks with appropriate overlap.

```python
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Load documents by type
loader = DirectoryLoader(
    "./documents/",
    glob="**/*.md",
    loader_cls=UnstructuredMarkdownLoader
)
docs = loader.load()

# Split with Markdown-aware separators
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n## ", "\n### ", "\n\n", "\n", ". ", " "]
)
chunks = splitter.split_documents(docs)
```

### Step 3: Enrich Chunks with Metadata

Every chunk must carry metadata for filtering and traceability.

```python
from datetime import datetime

for chunk in chunks:
    chunk.metadata.update({
        "source": chunk.metadata.get("source", "unknown"),
        "doc_type": classify_document(chunk),  # skill, agent_md, prd, code
        "language": detect_language(chunk),
        "created_at": datetime.now().isoformat(),
    })
```

### Step 4: Embed and Index into pgvector

```python
from langchain_openai import OpenAIEmbeddings
from langchain_postgres import PGVector

embeddings = OpenAIEmbeddings(model="text-embedding-3-large", dimensions=1536)

vectorstore = PGVector(
    collection_name="documents",
    connection=DATABASE_URL,
    embedding_function=embeddings,
)
vectorstore.add_documents(chunks)
```

### Step 5: Configure Hybrid Retrieval

Combine semantic search with keyword-based BM25 using Reciprocal Rank Fusion.

```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

semantic_retriever = vectorstore.as_retriever(search_kwargs={"k": 20})
bm25_retriever = BM25Retriever.from_documents(chunks, k=20)

hybrid_retriever = EnsembleRetriever(
    retrievers=[semantic_retriever, bm25_retriever],
    weights=[0.6, 0.4]
)
```

### Step 6: Add Re-Ranking

Use Cohere re-ranker to refine top-k results for higher precision.

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain_cohere import CohereRerank

reranker = CohereRerank(top_n=5)
final_retriever = ContextualCompressionRetriever(
    base_compressor=reranker,
    base_retriever=hybrid_retriever
)
```

### Step 7: Build Query Chain

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

prompt = ChatPromptTemplate.from_template("""
Answer the question based only on the provided context.
If the answer is not in the context, say "I could not find that information."

Context: {context}
Question: {question}
""")

chain = (
    {"context": final_retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

result = chain.invoke("Which skill should I use to create React components?")
```

### Step 8: Evaluate Retrieval Quality

Run evaluation against a golden dataset to measure retrieval accuracy.

```bash
python -m evals.run_rag_eval --dataset evals/rag_golden_dataset.json --min-score 0.8
```

## Resources
- `references/chunking-strategies.md` - Guidance on chunk sizes and overlap for different document types
- `references/embedding-models.md` - Comparison of embedding models and their trade-offs
- `references/rag-evaluation.md` - How to build golden datasets and measure RAG quality

## Examples

### Example 1: Index Project Documentation
User asks: "Set up RAG for our project docs so the agent can answer questions about our architecture."
Response approach:
1. Scan the `docs/` directory for Markdown files
2. Split with Markdown-aware separators (chunk_size=1000, overlap=200)
3. Enrich metadata with doc_type and source path
4. Embed with text-embedding-3-large and index into pgvector
5. Configure hybrid retrieval with BM25 fallback
6. Wire up a query chain and test with sample questions

### Example 2: Improve Retrieval Accuracy
User asks: "Our RAG is returning irrelevant results for technical queries."
Response approach:
1. Check current chunk sizes -- may be too large or too small
2. Verify metadata filtering is applied for doc_type
3. Add Cohere re-ranking to refine top-k
4. Adjust ensemble weights (increase semantic weight for technical content)
5. Build a golden dataset of 10-20 question/answer pairs and run evals

### Example 3: Add a New Document Source
User asks: "Add our API specs (OpenAPI YAML) to the RAG pipeline."
Response approach:
1. Add a YAML loader to the ingestion pipeline
2. Configure appropriate splitter for structured YAML content
3. Set doc_type metadata to "api_spec"
4. Re-index and test retrieval with API-related queries

## Notes
- Always test chunks with real questions before deploying
- Keep metadata complete on all chunks for filtering and traceability
- Measure retrieval quality with a golden dataset (minimum 10 question/answer pairs)
- Re-ranking is critical for precision -- always enable it in production
- Implement a fallback response when retrieval returns no relevant results
- Monitor token costs: embedding large document sets can be expensive
