# Code Review Checklist

## Correctness
- [ ] Code implements the task/spec requirements
- [ ] Edge cases are handled
- [ ] Exception flows are treated properly
- [ ] No off-by-one errors
- [ ] Null/undefined values are handled

## Quality
- [ ] Files under 500 lines
- [ ] Functions under 20 lines
- [ ] No nested ifs (use early return)
- [ ] Descriptive variable and function names
- [ ] No duplicated code (DRY: extract if repeated 3+ times)
- [ ] No dead code or commented-out code
- [ ] Single Responsibility Principle followed

## Security
- [ ] Inputs validated at boundaries (controllers, API endpoints)
- [ ] No hardcoded secrets, API keys, or passwords
- [ ] Parameterized queries used (no SQL injection risk)
- [ ] Rate limiting on public endpoints
- [ ] CORS properly configured (not `*` in production)
- [ ] Authentication/authorization enforced on protected endpoints

## Tests
- [ ] Unit tests for business rules
- [ ] Descriptive test names (`test_should_X_when_Y`)
- [ ] Happy path covered
- [ ] Error/alternative flows covered
- [ ] No test interdependencies

## Patterns
- [ ] Commits follow Conventional Commits
- [ ] Branch follows naming convention
- [ ] Directory structure follows domain organization
- [ ] Ubiquitous language respected
- [ ] DTOs at API boundary, entities in domain

## Feedback Categories
- **[BLOCKER]** -- Must fix before merge
- **[SUGGESTION]** -- Recommended, not mandatory
- **[QUESTION]** -- Clarification needed
- **[PRAISE]** -- Well done, worth highlighting
