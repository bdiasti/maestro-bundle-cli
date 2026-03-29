---
name: rag-pipeline
description: Build a complete RAG pipeline with document ingestion, chunking, embedding, vector indexing, and hybrid retrieval using LangChain and pgvector. Use when you need to implement semantic search, answer questions over documents, or create a retrieval-augmented generation system.
version: 1.0.0
author: Maestro
---

# RAG Pipeline

Build production-ready retrieval-augmented generation systems with LangChain, pgvector, and hybrid search.

## When to Use
- User needs to build a Q&A system over internal documents
- User wants to implement semantic search on a document corpus
- User needs to ingest and chunk documents for vector indexing
- User wants hybrid retrieval (semantic + keyword) with re-ranking
- User needs to set up a pgvector-backed vector store

## Available Operations
1. Ingest documents (Markdown, PDF, text) with LangChain loaders
2. Split documents into chunks with RecursiveCharacterTextSplitter
3. Generate embeddings and store in pgvector
4. Build hybrid retrieval (semantic + BM25 keyword search)
5. Add Cohere re-ranking for precision
6. Create a query chain with LLM and source attribution

## Multi-Step Workflow

### Step 1: Install Dependencies
```bash
pip install langchain langchain-openai langchain-community langchain-postgres langchain-cohere pgvector psycopg2-binary unstructured rank-bm25
```

Set required environment variables:
```bash
export OPENAI_API_KEY="sk-..."
export COHERE_API_KEY="..."
export DATABASE_URL="postgresql://user:pass@localhost:5432/vectordb"
```

### Step 2: Ingest Documents
```python
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader

# Load all markdown files from a directory
loader = DirectoryLoader(
    "./documents/",
    glob="**/*.md",
    loader_cls=UnstructuredMarkdownLoader,
    show_progress=True
)
docs = loader.load()
print(f"Loaded {len(docs)} documents")
```

For PDF files:
```python
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("documents/report.pdf")
docs = loader.load()
```

### Step 3: Split into Chunks
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n## ", "\n### ", "\n\n", "\n", ". ", " "]
)
chunks = splitter.split_documents(docs)
print(f"Split into {len(chunks)} chunks")
```

### Step 4: Enrich Metadata
```python
from datetime import datetime

for chunk in chunks:
    chunk.metadata.update({
        "source": chunk.metadata.get("source", "unknown"),
        "doc_type": chunk.metadata.get("source", "").split(".")[-1],
        "indexed_at": datetime.now().isoformat(),
        "chunk_size": len(chunk.page_content),
    })

# Verify metadata
print(chunks[0].metadata)
```

### Step 5: Generate Embeddings and Store in pgvector
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
print(f"Indexed {len(chunks)} chunks in pgvector")
```

### Step 6: Build Hybrid Retriever (Semantic + BM25)
```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

# Semantic retriever
semantic_retriever = vectorstore.as_retriever(search_kwargs={"k": 20})

# Keyword retriever (BM25)
bm25_retriever = BM25Retriever.from_documents(chunks, k=20)

# Combine with Reciprocal Rank Fusion
hybrid_retriever = EnsembleRetriever(
    retrievers=[semantic_retriever, bm25_retriever],
    weights=[0.6, 0.4]  # favor semantic
)
```

### Step 7: Add Re-Ranking
```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain_cohere import CohereRerank

reranker = CohereRerank(top_n=5)
final_retriever = ContextualCompressionRetriever(
    base_compressor=reranker,
    base_retriever=hybrid_retriever
)
```

### Step 8: Build Query Chain
```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

llm = ChatOpenAI(model="gpt-4o", temperature=0)

prompt = ChatPromptTemplate.from_template("""
Answer the question based only on the provided context.
If the answer is not in the context, say "I could not find that information."

Context: {context}
Question: {question}
""")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

chain = (
    {"context": final_retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# Test the chain
result = chain.invoke("What is the recommended chunk size for markdown documents?")
print(result)
```

### Step 9: Verify Retrieval Quality
```python
# Test retrieval with known questions
test_queries = [
    "How do I set up authentication?",
    "What database should I use?",
    "How do I deploy with Docker?",
]

for query in test_queries:
    docs = final_retriever.invoke(query)
    print(f"\nQuery: {query}")
    print(f"Top result source: {docs[0].metadata.get('source', 'unknown')}")
    print(f"Top result preview: {docs[0].page_content[:200]}...")
```

## Resources
- `references/chunking-strategies.md` - Guide to chunk sizes, overlap, and separators
- `references/embedding-models.md` - Comparison of embedding model options

## Examples
### Example 1: Build Q&A Over Documentation
User asks: "Set up a RAG system to answer questions about our API docs"
Response approach:
1. Load docs from the docs/ directory with DirectoryLoader
2. Split with RecursiveCharacterTextSplitter (1000 chars, 200 overlap)
3. Embed with OpenAI text-embedding-3-large and store in pgvector
4. Build hybrid retriever with BM25 fallback
5. Create query chain with GPT-4o
6. Test with sample questions and verify source attribution

### Example 2: Add Semantic Search to Existing App
User asks: "Add search to our knowledge base"
Response approach:
1. Ingest existing knowledge base documents
2. Index in pgvector with embeddings
3. Expose a retriever endpoint that returns top-5 results
4. Return results with source metadata and relevance scores

## Notes
- Chunk size 800-1200 works well for most text; use 400-600 for code
- Always include chunk_overlap (15-20% of chunk_size) to preserve context across boundaries
- Use hybrid retrieval (semantic + BM25) for better recall than either alone
- Re-ranking is critical for precision -- always add it for production systems
- Test retrieval quality with a golden dataset of question-answer pairs before deploying
- Monitor retrieval metrics: precision@k, recall@k, MRR
