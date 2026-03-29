# Eval Types Reference

## Comparison Matrix

| Type | When to Use | Speed | Cost | Deterministic |
|---|---|---|---|---|
| Rule-based | Validate format, structure, compliance | Fast | Free | Yes |
| LLM-as-judge | Evaluate quality, coherence, usefulness | Slow | $$ | No |
| Golden dataset | Compare against expected outcomes | Medium | Free | Yes |
| RAGAS | RAG metrics (faithfulness, relevancy) | Medium | $ | No |

## Rule-Based Evals

Best for: Structure validation, compliance checks, format verification.

```python
# Examples of rule-based checks
def check_has_tests(output: str) -> bool:
    return "def test_" in output or "class Test" in output

def check_no_secrets(output: str) -> bool:
    return not re.search(r'(password|secret|api_key)\s*=\s*["\'][^"\']+["\']', output)

def check_clean_arch_layers(output: str) -> bool:
    return all(layer in output for layer in ["controller", "use_case", "repository"])
```

## LLM-as-Judge

Best for: Subjective quality assessment, code review, explanation quality.

Scoring rubric should be explicit:
- 1: Completely wrong or missing
- 2: Present but seriously flawed
- 3: Acceptable with notable issues
- 4: Good with minor issues
- 5: Excellent, production-ready

## Golden Datasets

Best for: Regression testing, baseline comparison, prompt A/B testing.

Minimum size: 10 cases for initial validation, 50+ for production confidence.

## RAGAS Metrics

Best for: RAG pipeline evaluation.

- **Faithfulness**: Is the answer supported by the retrieved context?
- **Answer Relevancy**: Does the answer address the question?
- **Context Precision**: Are the retrieved documents relevant?
- **Context Recall**: Did retrieval find all relevant documents?
