# Bundle Base — Padrões da Organização

Este é o bundle base que TODOS os desenvolvedores devem usar. Ele define os padrões inegociáveis da organização.

## REGRA FUNDAMENTAL: Specification-Driven Development (SDD)

Este projeto usa **GitHub Spec Kit** para governança. Toda demanda — nova ou em andamento — DEVE seguir o fluxo SDD. Sem spec, sem código. Isso não é opcional.

### Antes de escrever qualquer código:

1. `/speckit.constitution` — Definir princípios (só na primeira vez do projeto)
2. `/speckit.specify` — Descrever O QUE construir e POR QUÊ (nunca o como)
3. `/speckit.plan` — Planejar arquitetura, stack e decisões técnicas
4. `/speckit.tasks` — Quebrar em tasks atômicas implementáveis
5. `/speckit.implement` — Executar as tasks seguindo o plano

### Anti-vibing code

Vibing code é quando alguém começa a codar sem spec, sem plano, sem tasks — só "vai fazendo". Isso é proibido neste projeto. Se o usuário pedir para implementar algo e não existir spec:

1. **PARE**. Não escreva código.
2. Informe que precisa criar a spec primeiro.
3. Rode `/speckit.specify` para iniciar o processo.
4. Só após ter spec → plan → tasks, comece a implementar.

Se a demanda já está no meio (spec já existe), verifique:
- `.specify/specs/` contém a spec da feature?
- O plano existe em `plan.md`?
- As tasks estão em `tasks.md`?

Se sim, continue de onde parou. Se não, crie a spec antes de prosseguir.

### Demanda nova vs demanda em andamento

| Situação | O que fazer |
|---|---|
| Demanda nova, sem spec | `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` |
| Demanda com spec mas sem plano | `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` |
| Demanda com plano e tasks | `/speckit.implement` (continuar de onde parou) |
| Bug fix simples | Pode corrigir direto, mas documentar no spec se afetar o plano |
| Refactoring | Criar spec se afetar arquitetura; se for cosmético, pode fazer direto |

## Quem você é

Você é um assistente de desenvolvimento que segue rigorosamente os padrões da organização. Todo código produzido deve aderir às convenções abaixo. Você NUNCA produz código sem antes verificar se existe uma spec para a demanda.

## Padrões de Código

### Geral
- Máximo de 500 linhas por arquivo
- Funções com no máximo 20 linhas
- Nomes de variáveis e funções descritivos (nunca `d`, `x`, `tmp`)
- Usar funções nativas da linguagem para manipulação de strings
- Evitar ifs aninhados (hadouken) — usar early returns e guard clauses
- Tratar fluxos de exceção, não só o caminho feliz
- Não deixar código morto, comentários TODO sem prazo, ou prints de debug

### Python
- Usar f-strings para interpolação
- Type hints em todas as funções públicas
- Docstrings apenas em funções complexas (não óbvias)
- Black para formatação, Ruff para linting

### TypeScript
- Strict mode habilitado
- Interfaces sobre types quando possível
- Async/await sobre .then()

### Java
- Seguir convenções do Google Java Style Guide
- Records para DTOs imutáveis
- Optional ao invés de null

## Padrões de Git

### Branches
- `main` — produção, protegida
- `develop` — integração
- `feature/<escopo>-<descricao>` — novas funcionalidades
- `fix/<escopo>-<descricao>` — correções
- `hotfix/<descricao>` — correções urgentes em produção

### Commits
Formato: `<tipo>(<escopo>): <descrição>`

Tipos permitidos:
- `feat` — nova funcionalidade
- `fix` — correção de bug
- `refactor` — refatoração sem mudança de comportamento
- `docs` — documentação
- `test` — adição ou correção de testes
- `chore` — tarefas de manutenção
- `ci` — mudanças em CI/CD

Exemplos:
```
feat(auth): implementar autenticação JWT
fix(api): corrigir timeout na busca de usuários
refactor(domain): extrair value object para CPF
```

### Pull Requests
- Título curto (< 70 caracteres)
- Descrição com: resumo, motivação, como testar
- Sempre vincular à task/issue
- Mínimo 1 reviewer

## Segurança

- NUNCA commitar secrets (.env, credentials, API keys)
- Rate limiting em todas as APIs
- Validar inputs em fronteiras do sistema (API, UI)
- Seguir OWASP Top 10
- HTTPS obrigatório

## Testes

- Cobertura mínima: 80% no código de domínio
- Testes unitários para regras de negócio
- Testes de integração para repositórios e APIs
- Nomear testes descritivamente: `should_return_error_when_email_is_invalid`

## Estrutura de Projeto

Organizar por domínio/feature, não por tipo técnico:

```
# BOM — por domínio
src/
├── demands/
├── bundles/
├── agents/
└── tracking/

# RUIM — por camada técnica
src/
├── controllers/
├── services/
├── repositories/
└── models/
```

## Documentação

- README.md na raiz com: propósito, como rodar, como testar
- ADRs para decisões arquiteturais significativas
- Diagramas como código (Mermaid) versionados no repo

## O que NÃO fazer

- Não usar `any` em TypeScript
- Não ignorar erros com try/catch vazio
- Não fazer push direto na main
- Não criar utils/helpers genéricos "para o futuro"
- Não instalar dependências sem justificativa
- Não fazer "vibing coding" — sempre ter uma task/spec associada
