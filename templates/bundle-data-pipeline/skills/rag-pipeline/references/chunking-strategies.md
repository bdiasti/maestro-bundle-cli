# Chunking Strategies

## Recommended Defaults

| Content Type | chunk_size | chunk_overlap | Separators |
|---|---|---|---|
| Prose / documentation | 1000 | 200 | `["\n## ", "\n### ", "\n\n", "\n", ". "]` |
| Code files | 500 | 50 | `["\nclass ", "\ndef ", "\n\n", "\n"]` |
| Legal / contracts | 1500 | 300 | `["\n\n", "\n", ". "]` |
| Chat logs / Q&A | 500 | 100 | `["\n\n", "\n"]` |

## RecursiveCharacterTextSplitter
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

# For markdown docs
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n## ", "\n### ", "\n\n", "\n", ". ", " "]
)
```

## Code Splitting
```python
from langchain.text_splitter import Language, RecursiveCharacterTextSplitter

python_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON, chunk_size=500, chunk_overlap=50
)

ts_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.TS, chunk_size=500, chunk_overlap=50
)
```

## Validation
After chunking, verify:
1. No chunks are empty or whitespace-only
2. Average chunk size is close to target
3. Metadata is preserved on all chunks
4. Key information is not split across chunk boundaries (spot-check)

```python
sizes = [len(c.page_content) for c in chunks]
print(f"Chunks: {len(chunks)}")
print(f"Avg size: {sum(sizes)/len(sizes):.0f}")
print(f"Min: {min(sizes)}, Max: {max(sizes)}")
empty = [c for c in chunks if len(c.page_content.strip()) == 0]
print(f"Empty chunks: {len(empty)}")
```
