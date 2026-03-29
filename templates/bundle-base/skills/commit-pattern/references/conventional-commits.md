# Conventional Commits Reference

## Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## Types
| Type | Description | Example |
|---|---|---|
| `feat` | New feature | `feat(demands): adicionar decomposicao automatica de tasks` |
| `fix` | Bug fix | `fix(agents): corrigir timeout na execucao de skill` |
| `refactor` | Code restructuring | `refactor(bundles): extrair validacao para value object` |
| `docs` | Documentation | `docs(readme): atualizar instrucoes de instalacao` |
| `test` | Tests | `test(tracking): adicionar testes para eventos MCP` |
| `chore` | Maintenance | `chore(deps): atualizar langchain para 0.3.x` |
| `ci` | CI/CD | `ci(gitlab): adicionar stage de compliance check` |
| `perf` | Performance | `perf(queries): otimizar consulta de demands ativas` |

## Rules
1. Imperative mood in Portuguese: "adicionar" not "adicionado"
2. First letter lowercase
3. No period at end
4. Max 72 characters on first line
5. Scope = affected module/feature
6. Breaking changes: add `BREAKING CHANGE:` in footer

## Body Guidelines
- Explain **why**, not what (the diff shows what)
- Wrap at 72 characters
- Separate from subject with blank line

## Footer Guidelines
- `BREAKING CHANGE: <description>` for incompatible changes
- `Refs: #123` for issue references
- `Co-authored-by: Name <email>` for pair programming
