---
name: branch-strategy
description: Create and manage Git branches following the organization's branching strategy. Use when creating branches, starting features, managing releases, or organizing Git workflow.
version: 1.0.0
author: Maestro
---

# Branch Strategy

Create and manage Git branches following the Maestro branching strategy with permanent and temporary branches.

## When to Use
- When creating a new feature branch
- When starting a bug fix or hotfix
- When preparing a release
- When merging branches or resolving conflicts
- When setting up agent worktrees

## Available Operations
1. Create a feature branch
2. Create a fix/hotfix branch
3. Create a release branch
4. Rebase and prepare for merge request
5. Set up agent worktree with isolated branch

## Multi-Step Workflow

### Step 1: Identify Branch Type

| Pattern | Example | Origin | Target |
|---|---|---|---|
| `feature/<module>-<desc>` | `feature/demands-auto-decompose` | `develop` | `develop` |
| `fix/<module>-<desc>` | `fix/agents-timeout-skill` | `develop` | `develop` |
| `hotfix/<desc>` | `hotfix/fix-login-crash` | `main` | `main` + `develop` |
| `release/<version>` | `release/1.2.0` | `develop` | `main` + `develop` |

Permanent branches:

| Branch | Purpose | Protection |
|---|---|---|
| `main` | Production code | Protected, merge only via approved MR |
| `develop` | Feature integration | Protected, MR with 1+ reviewer |

### Step 2: Create the Branch

```bash
# Feature branch
git checkout develop
git pull origin develop
git checkout -b feature/demands-auto-decompose

# Fix branch
git checkout develop
git pull origin develop
git checkout -b fix/agents-timeout-skill

# Hotfix branch (from main)
git checkout main
git pull origin main
git checkout -b hotfix/fix-login-crash

# Release branch
git checkout develop
git pull origin develop
git checkout -b release/1.2.0
```

### Step 3: Work and Commit
Follow the commit-pattern skill for commit messages.

```bash
git add <files>
git commit -m "feat(demands): adicionar decomposicao automatica de tasks"
```

### Step 4: Rebase Before Merge Request

```bash
git fetch origin
git rebase origin/develop
# Resolve conflicts if any, then:
git rebase --continue
```

### Step 5: Push and Create Merge Request

```bash
git push origin feature/demands-auto-decompose
# Create MR via GitLab/GitHub UI or CLI
```

### Step 6: Clean Up After Merge

```bash
git checkout develop
git pull origin develop
git branch -d feature/demands-auto-decompose
git push origin --delete feature/demands-auto-decompose
```

### Agent Worktree Flow
For Maestro agents working in isolated worktrees:

```bash
# Create worktree for agent
git worktree add ../agent-frontend-workspace feature/agent-frontend-<task-id>

# Agent works in its worktree
cd ../agent-frontend-workspace
# ... make changes, commit ...

# Remove worktree after merge
git worktree remove ../agent-frontend-workspace
```

Agent branch naming:
```
feature/agent-frontend-<task-id>
feature/agent-backend-<task-id>
feature/agent-devops-<task-id>
```

## Resources
- `references/branch-rules.md` - Branch naming rules and protection policies

## Examples
### Example 1: Start a New Feature
User asks: "Create a branch for the new dashboard feature"
Response approach:
1. Run `git checkout develop && git pull origin develop`
2. Run `git checkout -b feature/dashboard-metrics`
3. Confirm branch created with `git branch --show-current`

### Example 2: Hotfix in Production
User asks: "We need to fix a critical login bug in production"
Response approach:
1. Run `git checkout main && git pull origin main`
2. Run `git checkout -b hotfix/fix-login-crash`
3. After fix, merge to both `main` and `develop`

### Example 3: Prepare for Merge
User asks: "My feature is ready, prepare it for review"
Response approach:
1. Run `git fetch origin && git rebase origin/develop`
2. Resolve any conflicts
3. Run `git push origin feature/<branch-name>`
4. Guide user to create the MR

## Notes
- Never commit directly to `main` or `develop`
- Feature branches should live at most 5 days
- Always rebase before opening MR to keep clean history
- Delete branch after merge
- One branch = one task/issue
- The orchestrator agent handles merge after human approval
