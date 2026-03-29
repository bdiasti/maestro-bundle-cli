# Chunking Strategies Reference

## Recommended Chunk Sizes by Document Type

| Document Type | Chunk Size | Overlap | Separators |
|---|---|---|---|
| Markdown docs | 1000 | 200 | `\n## `, `\n### `, `\n\n`, `\n` |
| Source code | 1500 | 300 | `\nclass `, `\ndef `, `\n\n`, `\n` |
| API specs (YAML/JSON) | 800 | 100 | `\n- `, `\n  `, `\n\n` |
| PDF documents | 1200 | 250 | `\n\n`, `\n`, `. ` |
| Plain text | 1000 | 200 | `\n\n`, `\n`, `. `, ` ` |

## Guidelines

- **Too small** (< 500 tokens): Loses context, retrieval finds fragments without meaning.
- **Too large** (> 2000 tokens): Dilutes relevance, wastes context window space.
- **Overlap**: 15-25% of chunk_size prevents information loss at boundaries.
- **Separators**: Order matters -- RecursiveCharacterTextSplitter tries separators in order, falling back to the next one.

## Metadata to Attach

Every chunk should carry:
- `source` -- file path or URL
- `doc_type` -- classification (skill, prd, code, api_spec, etc.)
- `language` -- content language for multilingual pipelines
- `created_at` -- timestamp for freshness filtering
- `section_title` -- nearest heading for context
