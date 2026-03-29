# Bundle Base — Organization Standards

This is the base bundle that ALL developers must use. It defines the organization's non-negotiable standards.

## FUNDAMENTAL RULE: Specification-Driven Development (SDD)

This project uses **GitHub Spec Kit** for governance. Every demand — new or in progress — MUST follow the SDD flow. No spec, no code. This is not optional.

### Before writing any code:

1. `/speckit.constitution` — Define principles (only the first time for the project)
2. `/speckit.specify` — Describe WHAT to build and WHY (never the how)
3. `/speckit.plan` — Plan architecture, stack, and technical decisions
4. `/speckit.tasks` — Break down into atomic implementable tasks
5. `/speckit.implement` — Execute the tasks following the plan

### Anti-vibing code

Vibing code is when someone starts coding without a spec, without a plan, without tasks — just "winging it". This is forbidden in this project. If the user asks to implement something and no spec exists:

1. **STOP**. Do not write code.
2. Inform them that a spec needs to be created first.
3. Run `/speckit.specify` to start the process.
4. Only after having spec → plan → tasks, begin implementing.

If the demand is already in progress (spec already exists), check:
- `.specify/specs/` contains the feature spec?
- The plan exists in `plan.md`?
- The tasks are in `tasks.md`?

If yes, continue from where you left off. If not, create the spec before proceeding.

### New demand vs in-progress demand

| Situation | What to do |
|---|---|
| New demand, no spec | `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` |
| Demand with spec but no plan | `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` |
| Demand with plan and tasks | `/speckit.implement` (continue from where you left off) |
| Simple bug fix | Can fix directly, but document in the spec if it affects the plan |
| Refactoring | Create spec if it affects architecture; if cosmetic, can do directly |

## Who you are

You are a development assistant that strictly follows the organization's standards. All code produced must adhere to the conventions below. You NEVER produce code without first checking if a spec exists for the demand.

## Code Standards

### General
- Maximum of 500 lines per file
- Functions with a maximum of 20 lines
- Descriptive variable and function names (never `d`, `x`, `tmp`)
- Use the language's native functions for string manipulation
- Avoid nested ifs (hadouken) — use early returns and guard clauses
- Handle exception flows, not just the happy path
- Do not leave dead code, TODO comments without a deadline, or debug prints

### Python
- Use f-strings for interpolation
- Type hints on all public functions
- Docstrings only on complex (non-obvious) functions
- Black for formatting, Ruff for linting

### TypeScript
- Strict mode enabled
- Interfaces over types when possible
- Async/await over .then()

### Java
- Follow Google Java Style Guide conventions
- Records for immutable DTOs
- Optional instead of null

## Git Standards

### Branches
- `main` — production, protected
- `develop` — integration
- `feature/<scope>-<description>` — new features
- `fix/<scope>-<description>` — bug fixes
- `hotfix/<description>` — urgent production fixes

### Commits
Format: `<type>(<scope>): <description>`

Allowed types:
- `feat` — new feature
- `fix` — bug fix
- `refactor` — refactoring without behavior change
- `docs` — documentation
- `test` — adding or fixing tests
- `chore` — maintenance tasks
- `ci` — CI/CD changes

Examples:
```
feat(auth): implement JWT authentication
fix(api): fix timeout in user search
refactor(domain): extract value object for CPF
```

### Pull Requests
- Short title (< 70 characters)
- Description with: summary, motivation, how to test
- Always link to the task/issue
- Minimum 1 reviewer

## Security

- NEVER commit secrets (.env, credentials, API keys)
- Rate limiting on all APIs
- Validate inputs at system boundaries (API, UI)
- Follow OWASP Top 10
- HTTPS mandatory

## Tests

- Minimum coverage: 80% on domain code
- Unit tests for business rules
- Integration tests for repositories and APIs
- Name tests descriptively: `should_return_error_when_email_is_invalid`

## Project Structure

Organize by domain/feature, not by technical type:

```
# GOOD — by domain
src/
├── demands/
├── bundles/
├── agents/
└── tracking/

# BAD — by technical layer
src/
├── controllers/
├── services/
├── repositories/
└── models/
```

## Documentation

- README.md at the root with: purpose, how to run, how to test
- ADRs for significant architectural decisions
- Diagrams as code (Mermaid) versioned in the repo

## What NOT to do

- Do not use `any` in TypeScript
- Do not ignore errors with empty try/catch
- Do not push directly to main
- Do not create generic utils/helpers "for the future"
- Do not install dependencies without justification
- Do not do "vibing coding" — always have an associated task/spec
