---
name: code-review
description: Review code following organization standards for quality, security, and patterns. Use when reviewing a PR, evaluating code quality, or when a developer asks for a review.
version: 1.0.0
author: Maestro
---

# Code Review

Perform structured code reviews following the organization's quality, security, and pattern standards.

## When to Use
- When asked to review a pull request or merge request
- When evaluating code quality of a file or module
- When a developer asks for feedback on their code
- Before approving a merge

## Available Operations
1. Full PR review with categorized feedback
2. Focused review (security-only, quality-only, tests-only)
3. Quick review of a single file
4. Compliance check against organization patterns

## Multi-Step Workflow

### Step 1: Gather Context
Read the changed files and understand the purpose of the changes.

```bash
# If reviewing a PR/MR
git diff main...HEAD --stat
git diff main...HEAD
git log main...HEAD --oneline

# If reviewing specific files
git diff --cached
```

### Step 2: Run Automated Checks
Execute linters, tests, and static analysis before manual review.

```bash
# Backend (Java/Spring)
./mvnw checkstyle:check
./mvnw test

# Frontend (Angular)
npm run lint
npm run test
```

### Step 3: Apply Review Checklist

**Correctness:**
- Does the code do what the task/spec requires?
- Are edge cases covered?
- Are exception flows handled?

**Quality:**
- Files with more than 500 lines? Split them.
- Functions with more than 20 lines? Extract.
- Nested ifs (hadouken)? Use early return.
- Descriptive names? (`calculateComplianceScore` > `calc`)
- Duplicated code? Extract if repeated 3+ times.
- Dead code? Remove it.

**Security:**
- Inputs validated at boundaries?
- Hardcoded secrets? REJECT.
- SQL injection possible? Use parameterized queries.
- Rate limiting present on APIs?

**Tests:**
- Unit tests for business rules?
- Descriptive test names?
- Tests cover happy path AND alternative flows?

**Patterns:**
- Commit follows Conventional Commits?
- Branch follows naming convention?
- Directory structure by domain?
- Project ubiquitous language respected?

### Step 4: Categorize and Deliver Feedback

Use these categories for each comment:

- **[BLOCKER]** -- Must be fixed before merge
- **[SUGGESTION]** -- Recommended improvement, not mandatory
- **[QUESTION]** -- Question about code intent
- **[PRAISE]** -- Something well done worth highlighting

Format:
```
[BLOCKER] line 45: API key hardcoded. Move to environment variable.
[SUGGESTION] line 120: This nested if would be more readable with early return.
[PRAISE] Good extraction of the ComplianceScore value object.
```

### Step 5: Provide Summary
End the review with an overall assessment:
- APPROVE: Ready to merge
- REQUEST CHANGES: Has blockers that must be fixed
- COMMENT: Has suggestions but no blockers

## Resources
- `references/review-checklist.md` - Complete review checklist with detailed criteria

## Examples
### Example 1: Full PR Review
User asks: "Review this PR"
Response approach:
1. Run `git diff main...HEAD` to see all changes
2. Read each changed file
3. Apply the checklist to each file
4. Deliver categorized feedback with line references
5. Provide overall assessment (APPROVE / REQUEST CHANGES / COMMENT)

### Example 2: Security-Focused Review
User asks: "Check this code for security issues"
Response approach:
1. Read the target files
2. Check for hardcoded secrets, SQL injection, missing input validation
3. Verify CORS, CSRF, rate limiting configuration
4. Report findings with severity

### Example 3: Quick File Review
User asks: "Is this service class well-structured?"
Response approach:
1. Read the file
2. Check method length, naming, separation of concerns
3. Verify dependency injection patterns
4. Provide focused feedback

## Notes
- Always read the full file context before commenting -- do not review snippets in isolation
- Be specific with line numbers and concrete suggestions
- Balance criticism with praise -- highlight what was done well
- For security issues, always mark as [BLOCKER]
