# Branch Rules Reference

## Naming Convention
```
feature/<module>-<short-description>
fix/<module>-<short-description>
hotfix/<short-description>
release/<semver>
```

## Branch Lifecycle
1. Create from correct base branch
2. Work and commit (max 5 days for features)
3. Rebase onto latest base before MR
4. Open Merge Request with 1+ reviewer
5. Merge after approval
6. Delete branch after merge

## Protection Rules
| Branch | Direct Push | MR Required | Reviewers |
|---|---|---|---|
| `main` | No | Yes | 2+ |
| `develop` | No | Yes | 1+ |
| `feature/*` | Yes | N/A | N/A |
| `release/*` | Yes | Yes (to main) | 2+ |

## Agent Worktree Branches
```
feature/agent-frontend-<task-id>
feature/agent-backend-<task-id>
feature/agent-devops-<task-id>
```
- Each agent works in an isolated Git worktree
- Orchestrator merges after human approval
- Worktree is removed after merge

## Merge Strategy
- Feature/Fix to develop: Squash merge (clean history)
- Release to main: Merge commit (preserve history)
- Hotfix to main: Merge commit, then cherry-pick to develop
