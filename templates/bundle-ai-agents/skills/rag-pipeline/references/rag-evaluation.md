# RAG Evaluation Reference

## Golden Dataset Format

```json
{
  "evals": [
    {
      "id": "rag-eval-001",
      "question": "Which skill handles React component creation?",
      "expected_answer": "The react-patterns skill covers component creation.",
      "expected_sources": ["skills/react-patterns/SKILL.md"],
      "relevance_threshold": 0.8
    }
  ]
}
```

## Key Metrics

| Metric | What It Measures | Target |
|---|---|---|
| Retrieval Precision | % of retrieved docs that are relevant | > 0.7 |
| Retrieval Recall | % of relevant docs that are retrieved | > 0.8 |
| Faithfulness | Answer grounded in retrieved context | > 0.9 |
| Answer Relevancy | Answer addresses the question | > 0.85 |

## Evaluation Workflow

1. Build golden dataset with 20+ question/answer/source triples.
2. Run retrieval for each question and compare against expected sources.
3. Generate answers and evaluate faithfulness with LLM-as-judge.
4. Track metrics over time -- regression means something changed in ingestion or indexing.

## Common Failure Modes

- **Low precision**: Chunks too large, no re-ranking, or poor metadata filtering.
- **Low recall**: Chunks too small, missing document sources, or embedding model mismatch.
- **Low faithfulness**: LLM hallucinating beyond context -- tighten the system prompt.
