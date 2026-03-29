# Projeto: Frontend SPA (Single Page Application)

Você está construindo uma aplicação frontend moderna com React, TypeScript e Tailwind CSS que consome APIs REST ou GraphQL.

## Specification-Driven Development (SDD)

A regra fundamental de SDD está definida no bundle-base (AGENTS.md base) e é inegociável:
**Sem spec, sem código. Sem exceção.** O agente deve recusar implementar qualquer demanda que
não tenha passado pelo fluxo `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.

Se o usuário pedir para codar algo sem spec, PARE e inicie o fluxo SDD primeiro.
Consulte `.specify/specs/` para verificar se já existe spec para a demanda.

## Product Requirements Document

O arquivo `PRD.md` na raiz do projeto contém os requisitos do produto definidos pelo analista/dev. Consulte-o para entender O QUE construir, as user stories, critérios de aceite, modelo de dados e API specification. Este AGENTS.md define COMO o agente deve trabalhar; o PRD define O QUE deve ser construído.

- `PRD.md` — Requisitos do produto, user stories, API spec, modelo de dados

## References

Documentos de referência que o agente deve consultar quando necessário:

- `references/react-component-patterns.md` — Padrões de componentes React
- `references/tailwind-design-system.md` — Design system com Tailwind
- `references/testing-library-guide.md` — Guia de testes com Testing Library

## Stack do projeto

- **Framework:** React 18+ com TypeScript (strict mode)
- **Bundler:** Vite
- **Estilização:** Tailwind CSS + Shadcn/UI
- **Estado:** Zustand (global) + React Query (server state)
- **Roteamento:** React Router v6+
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios
- **WebSocket:** Socket.io-client (se real-time)
- **Testes:** Vitest + Testing Library + Playwright (E2E)

## Estrutura do projeto

```
src/
├── features/                   # Organizado por feature/domínio
│   ├── demands/
│   │   ├── components/         # Componentes da feature
│   │   │   ├── DemandList.tsx
│   │   │   ├── DemandCard.tsx
│   │   │   └── DemandForm.tsx
│   │   ├── hooks/              # Custom hooks
│   │   │   └── useDemands.ts
│   │   ├── services/           # Chamadas API
│   │   │   └── demandApi.ts
│   │   ├── types.ts            # Types da feature
│   │   └── index.ts            # Barrel export
│   ├── dashboard/
│   └── auth/
├── shared/                     # Compartilhado entre features
│   ├── components/             # Button, Modal, Table, etc.
│   ├── hooks/                  # useDebounce, useLocalStorage, etc.
│   ├── lib/                    # api.ts (axios instance), utils
│   └── types/                  # Types globais
├── layouts/                    # AppLayout, AuthLayout
├── routes/                     # Configuração de rotas
├── config/                     # Constantes, env vars
├── styles/                     # Globals CSS
└── tests/
    ├── e2e/                    # Playwright
    └── setup.ts                # Vitest setup
```

## Padrões de código

- Máximo 200 linhas por componente
- Props tipadas com interface (não type)
- Um componente = uma responsabilidade
- Custom hooks para lógica reutilizável
- Server state no React Query, UI state no Zustand
- React Hook Form + Zod para formulários
- Lazy loading por rota

## Padrões de componentes

- Composição > configuração (slots > props booleanas)
- Container/Presenter para componentes complexos
- Loading/Error/Empty states em todo componente async
- Acessibilidade: semantic HTML, aria-labels, keyboard nav

## Git

- Commits: `feat(demands): adicionar filtro por status`
- Branches: `feature/<feature>-<descricao>`
- Nunca commitar node_modules, .env, dist/

## Testes

- Vitest + Testing Library: componentes e hooks
- Playwright: fluxos E2E (login, CRUD, navegação)
- Cobertura mínima: 70%
- Testar comportamento, não implementação

## O que NÃO fazer

- Não usar `any` em TypeScript
- Não fazer fetch dentro do componente (usar React Query)
- Não duplicar dados da API no estado global
- Não usar index como key em listas dinâmicas
- Não criar mega-componentes de 500+ linhas
- Não ignorar loading/error states
- Não estilizar com CSS inline quando tem Tailwind
