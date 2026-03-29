# Golden Dataset Template

## Structure

```json
{
  "metadata": {
    "name": "Backend Agent Eval Suite",
    "version": "1.0.0",
    "created_at": "2026-03-27",
    "min_pass_score": 0.8
  },
  "evals": [
    {
      "id": "eval-001",
      "category": "endpoint-creation",
      "difficulty": "basic",
      "prompt": "Create a GET /api/v1/demands endpoint that returns a paginated list",
      "expected": {
        "has_controller": true,
        "has_use_case": true,
        "has_repository": true,
        "has_pagination": true,
        "follows_clean_arch": true,
        "has_error_handling": true,
        "has_tests": true
      },
      "judge_criteria": {
        "clarity": ">= 4",
        "correctness": ">= 4",
        "patterns": ">= 3",
        "tests": ">= 3"
      }
    },
    {
      "id": "eval-002",
      "category": "error-handling",
      "difficulty": "intermediate",
      "prompt": "Add proper error handling to the demands API: 404 for not found, 422 for validation errors, 500 for server errors",
      "expected": {
        "has_exception_handler": true,
        "has_error_response_model": true,
        "handles_404": true,
        "handles_422": true,
        "handles_500": true
      }
    }
  ]
}
```

## Guidelines for Building Golden Datasets

1. Cover basic, intermediate, and advanced scenarios.
2. Include both happy path and error path cases.
3. Make expected outcomes binary (true/false) for rule-based checks.
4. Add judge criteria for subjective quality scoring.
5. Update the dataset as the agent's capabilities evolve.
6. Minimum 10 cases for initial validation, 50+ for production.
