---
name: commit-pattern
description: Generate commit messages following Conventional Commits standard. Use when committing changes, creating commit messages, staging files, or finishing a task.
version: 1.0.0
author: Maestro
---

# Commit Pattern

Generate structured commit messages following Conventional Commits and the organization's standards.

## When to Use
- When committing code changes
- When asked to generate a commit message
- When finishing a task and need to commit the result
- When reviewing commit messages for compliance

## Available Operations
1. Generate a commit message from staged changes
2. Validate an existing commit message
3. Create a multi-line commit with body and footer
4. Stage and commit changes in one workflow

## Multi-Step Workflow

### Step 1: Review Staged Changes
Inspect what has been changed to determine the appropriate commit type and scope.

```bash
git status
git diff --cached --stat
git diff --cached
```

### Step 2: Determine Commit Type

| Type | When to use |
|---|---|
| `feat` | New user-facing functionality |
| `fix` | Bug fix |
| `refactor` | Code change that does not alter behavior |
| `docs` | Documentation-only changes |
| `test` | Adding or fixing tests |
| `chore` | Build, deps, configs, maintenance tasks |
| `ci` | CI/CD changes (pipelines, workflows) |
| `perf` | Performance improvement |

### Step 3: Compose the Message
Follow the format:
```
<type>(<scope>): <imperative description in Portuguese>
```

Rules:
1. Imperative mood: "adicionar", not "adicionado" or "adicionando"
2. First letter lowercase
3. No period at the end
4. Maximum 72 characters on the first line
5. Scope is the affected module/feature
6. If the change breaks compatibility, add `BREAKING CHANGE:` in the body

### Step 4: Commit

```bash
# Simple commit
git commit -m "feat(demands): adicionar decomposicao automatica de tasks"

# Commit with body for complex changes
git commit -m "refactor(orchestrator): simplificar alocacao de agentes

A alocacao anterior usava um loop O(n^2) comparando todos os agentes
com todas as tasks. Agora usa um mapa indexado por tipo de agente,
reduzindo para O(n)."
```

### Step 5: Verify
```bash
git log --oneline -1
```

## Resources
- `references/conventional-commits.md` - Full Conventional Commits specification and examples

## Examples
### Example 1: New Feature
User asks: "Commit these changes that add automatic task decomposition"
Response approach:
1. Run `git diff --cached --stat` to see changed files
2. Identify scope from file paths (e.g., `demands/`)
3. Generate: `feat(demands): adicionar decomposicao automatica de tasks`
4. Run `git commit -m "..."` with the message

### Example 2: Bug Fix with Context
User asks: "Commit the timeout fix"
Response approach:
1. Run `git diff --cached` to understand the fix
2. Generate: `fix(agents): corrigir timeout na execucao de skill`
3. If the fix is complex, add a body explaining why it happened

### Example 3: Breaking Change
User asks: "Commit these API changes that break backward compatibility"
Response approach:
1. Review changes to confirm breaking nature
2. Generate message with BREAKING CHANGE footer:
```
feat(api): alterar formato de resposta do endpoint de demands

BREAKING CHANGE: o campo 'tasks' agora retorna objetos completos
ao inves de apenas IDs. Clientes que dependem do formato antigo
precisam atualizar.
```

## Notes
- Always check `git diff --cached` before composing the message to ensure accuracy
- When in doubt about scope, use the top-level directory name of the changed files
- For commits touching multiple scopes, use the most significant one or omit the scope
- Never commit secrets, credentials, or `.env` files
