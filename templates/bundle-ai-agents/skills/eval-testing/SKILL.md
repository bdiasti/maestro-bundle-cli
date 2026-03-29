---
name: eval-testing
description: Build evaluation frameworks for AI agents with LLM-as-judge, rule-based evals, and golden datasets. Use when testing agents, evaluating RAG quality, or creating compliance benchmarks.
version: 1.0.0
author: Maestro
---

# Eval Testing

Build comprehensive evaluation pipelines for AI agents using rule-based checks, LLM-as-judge scoring, golden datasets, and CI/CD integration.

## When to Use
- Testing whether an agent produces correct, compliant output
- Evaluating RAG retrieval quality with RAGAS metrics
- Building a golden dataset for regression testing
- Setting up automated eval pipelines in CI/CD
- Comparing agent performance across prompt versions

## Available Operations
1. Create rule-based evaluators for compliance checks
2. Build LLM-as-judge scoring prompts
3. Design golden datasets with expected outcomes
4. Run evaluation benchmarks
5. Integrate evals into CI/CD pipelines
6. Analyze and compare eval results

## Multi-Step Workflow

### Step 1: Create Rule-Based Evaluators

Start with deterministic checks -- they are fast, free, and reliable.

```python
class ComplianceEvaluator:
    """Verify code follows bundle standards."""

    def evaluate(self, code: str, bundle: Bundle) -> EvalResult:
        checks = []
        checks.append(self._check_max_lines(code, max=500))
        checks.append(self._check_no_hardcoded_secrets(code))
        checks.append(self._check_function_length(code, max=20))
        checks.append(self._check_naming_convention(code))
        checks.append(self._check_test_coverage(code, min=80))

        score = sum(c.passed for c in checks) / len(checks)
        return EvalResult(score=score, checks=checks)

    def _check_max_lines(self, code: str, max: int) -> Check:
        lines = len(code.split('\n'))
        return Check(
            name="max_lines",
            passed=lines <= max,
            detail=f"{lines}/{max} lines"
        )
```

Run rule-based checks:

```bash
python -m evals.rules --code-dir src/ --bundle bundles/backend.json
```

### Step 2: Build LLM-as-Judge Evaluator

For subjective quality assessments, use an LLM to score agent output.

```python
JUDGE_PROMPT = """
Evaluate the code below on these criteria:
1. Clarity (1-5): Is the code easy to understand?
2. Correctness (1-5): Does the code do what it should?
3. Patterns (1-5): Does it follow Clean Architecture and DDD?
4. Tests (1-5): Are tests adequate?

Code:
{code}

Respond in JSON:
{{"clarity": X, "correctness": X, "patterns": X, "tests": X, "justification": "..."}}
"""

async def llm_judge(code: str) -> dict:
    response = await llm.ainvoke(JUDGE_PROMPT.format(code=code))
    return json.loads(response.content)
```

### Step 3: Build a Golden Dataset

Create a set of input/expected-output pairs for regression testing.

```json
{
  "evals": [
    {
      "id": "eval-001",
      "prompt": "Create a GET /api/v1/demands endpoint with pagination",
      "expected": {
        "has_controller": true,
        "has_use_case": true,
        "has_repository": true,
        "has_pagination": true,
        "follows_clean_arch": true
      }
    }
  ]
}
```

Store golden datasets in `evals/golden_dataset.json`.

### Step 4: Build the Eval Runner

Combine rule-based and LLM-as-judge evaluations into a single runner.

```python
async def run_evals(agent, eval_set: list[dict]) -> BenchmarkResult:
    results = []
    for eval_case in eval_set:
        output = await agent.ainvoke(eval_case["prompt"])

        rule_score = rule_evaluator.evaluate(output)
        judge_score = await llm_judge(output)

        results.append({
            "eval_id": eval_case["id"],
            "rule_score": rule_score,
            "judge_score": judge_score,
            "output": output
        })

    return BenchmarkResult(results=results, aggregate=aggregate(results))
```

Run the eval suite:

```bash
python -m evals.run_evals --dataset evals/golden_dataset.json --output results/eval_run_$(date +%Y%m%d).json
```

### Step 5: Integrate into CI/CD

Add eval checks to your pipeline so regressions are caught automatically.

```yaml
eval:
  stage: test
  script:
    - python -m evals.run_evals --dataset evals/golden_dataset.json
    - python -m evals.check_threshold --min-score 0.8
  allow_failure: false
```

Run locally before pushing:

```bash
python -m evals.run_evals --dataset evals/golden_dataset.json && python -m evals.check_threshold --min-score 0.8
```

### Step 6: Compare Results Across Versions

```bash
python -m evals.compare --baseline results/eval_v1.json --current results/eval_v2.json
```

## Resources
- `references/eval-types.md` - Detailed comparison of evaluation types and when to use each
- `references/golden-dataset-template.md` - Template for building golden datasets

## Examples

### Example 1: Evaluate a Backend Agent
User asks: "Set up evals for our backend agent that generates FastAPI endpoints."
Response approach:
1. Create rule-based checks: has controller, has use case, has repository, has tests
2. Create LLM-as-judge prompt that scores code clarity, correctness, and patterns
3. Build a golden dataset with 10 endpoint-generation scenarios
4. Run the eval suite and establish a baseline score
5. Add to CI/CD with a minimum score threshold of 0.8

### Example 2: Evaluate RAG Quality
User asks: "Our RAG agent gives wrong answers sometimes. Set up evals to catch this."
Response approach:
1. Build a golden dataset of 20 question/expected-answer pairs
2. Create rule-based checks for source citation and answer format
3. Create LLM-as-judge that scores faithfulness (is the answer grounded in context?)
4. Run evals and identify patterns in failures
5. Use results to guide chunking and retrieval improvements

### Example 3: A/B Test Prompt Changes
User asks: "I changed the system prompt. How do I know if it's better?"
Response approach:
1. Run the golden dataset against the old prompt (baseline)
2. Run the same dataset against the new prompt
3. Compare scores with `evals.compare` to see deltas
4. Check for regressions in specific eval cases
5. Only deploy if the new prompt scores >= baseline on all categories

## Notes
- Rule-based evals run first (fast, free) -- fail early before spending on LLM-as-judge
- Golden datasets should have at least 10 cases for meaningful results
- Track eval scores over time to detect gradual drift
- LLM-as-judge is non-deterministic -- run 3 times and average for reliable scores
- Store all eval results as JSON for historical comparison
