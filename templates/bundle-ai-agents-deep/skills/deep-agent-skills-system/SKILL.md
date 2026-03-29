---
name: deep-agent-skills-system
description: Create and load skills (SKILL.md) in Deep Agents for contextual knowledge loading. Use when creating skills for your agent, loading documentation on-demand, or reducing token usage.
version: 1.0.0
author: Maestro
---

# Deep Agent Skills System

Create SKILL.md files that your Deep Agent loads contextually — only when relevant. This reduces startup tokens while keeping the agent knowledgeable.

## When to Use
- When the agent needs domain knowledge loaded on-demand
- When creating reusable instructions for the agent
- When reducing context window usage
- When organizing agent capabilities into modules

## Available Operations
1. Create SKILL.md files with frontmatter
2. Organize skills in directories
3. Load skills into the agent
4. Create skills with supporting files

## Multi-Step Workflow

### Step 1: Create Skill Directory

```bash
mkdir -p skills/deploy/
mkdir -p skills/code-review/
mkdir -p skills/database-migration/
```

### Step 2: Write SKILL.md

```markdown
# skills/deploy/SKILL.md

---
name: deploy
description: Deploy application to production
---

# Deploy Skill

## Steps
1. Run tests: `pytest --tb=short`
2. Build Docker image: `docker build -t app:latest .`
3. Push to registry: `docker push registry/app:latest`
4. Update K8s: `kubectl set image deployment/app app=registry/app:latest`
5. Verify: `kubectl rollout status deployment/app`

## Rollback
If deploy fails: `kubectl rollout undo deployment/app`
```

### Step 3: Add Supporting Files

```
skills/deploy/
├── SKILL.md              # Main instructions
├── references/
│   └── k8s-commands.md   # Reference doc loaded when needed
└── scripts/
    └── healthcheck.sh    # Script the agent can execute
```

### Step 4: Load Skills into Agent

```python
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend
from langgraph.checkpoint.memory import MemorySaver

agent = create_deep_agent(
    model="anthropic:claude-sonnet-4-6",
    backend=FilesystemBackend(root_dir=".", virtual_mode=True),
    skills=["./skills/"],  # Directory containing skill folders
    checkpointer=MemorySaver()  # Required for skills
)
```

### Step 5: Load Skills via Store (No Filesystem)

```python
from deepagents import create_deep_agent
from deepagents.backends import StoreBackend
from deepagents.backends.utils import create_file_data
from langgraph.store.memory import InMemoryStore

store = InMemoryStore()

# Inject skill content into store
skill_content = open("skills/deploy/SKILL.md").read()
store.put(
    namespace=("filesystem",),
    key="/skills/deploy/SKILL.md",
    value=create_file_data(skill_content)
)

agent = create_deep_agent(
    backend=lambda rt: StoreBackend(rt),
    store=store,
    skills=["/skills/"]
)
```

### Step 6: Verify

```bash
# Test that skills are discovered
python -c "
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend
from langgraph.checkpoint.memory import MemorySaver

agent = create_deep_agent(
    backend=FilesystemBackend(root_dir='.', virtual_mode=True),
    skills=['./skills/'],
    checkpointer=MemorySaver()
)
result = agent.invoke({
    'messages': [{'role': 'user', 'content': 'What skills do you have available?'}]
}, config={'configurable': {'thread_id': 'test'}})
print(result['messages'][-1].content)
"
```

## Resources
- `references/skill-format.md` — SKILL.md format specification

## Examples

### Example 1: Create a Skill
User asks: "Create a skill for database migrations"
Response approach:
1. Create `skills/database-migration/SKILL.md`
2. Add step-by-step instructions for Alembic
3. Add `references/alembic-commands.md`
4. Register skill directory in agent

### Example 2: Agent Uses Skill Automatically
User asks: "Deploy the app"
Response approach:
1. Agent detects "deploy" matches skill description
2. Loads `skills/deploy/SKILL.md` into context
3. Follows the steps in the skill
4. Reports result

## Notes
- Skills load on-demand, not at startup — saves tokens
- `checkpointer` is REQUIRED for skills to work
- Skill descriptions must be specific for auto-matching
- Keep SKILL.md under 500 lines — use references for detail
- Skills are NOT inherited by subagents — pass explicitly
