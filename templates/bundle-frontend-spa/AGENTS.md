# Project: Frontend SPA (Single Page Application)

You are building a modern frontend application with React, TypeScript, and Tailwind CSS that consumes REST or GraphQL APIs.

## Specification-Driven Development (SDD)

The fundamental SDD rule is defined in the bundle-base (base AGENTS.md) and is non-negotiable:
**No spec, no code. No exception.** The agent must refuse to implement any demand that
has not gone through the `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` flow.

If the user asks to code something without a spec, STOP and initiate the SDD flow first.
Check `.specify/specs/` to verify if a spec already exists for the demand.

## Product Requirements Document

The `PRD.md` file at the project root contains the product requirements defined by the analyst/dev. Consult it to understand WHAT to build, the user stories, acceptance criteria, data model, and API specification. This AGENTS.md defines HOW the agent should work; the PRD defines WHAT should be built.

- `PRD.md` — Product requirements, user stories, API spec, data model

## References

Reference documents that the agent should consult when necessary:

- `references/react-component-patterns.md` — React component patterns
- `references/tailwind-design-system.md` — Design system with Tailwind
- `references/testing-library-guide.md` — Testing Library guide

## Project Stack

- **Framework:** React 18+ with TypeScript (strict mode)
- **Bundler:** Vite
- **Styling:** Tailwind CSS + Shadcn/UI
- **State:** Zustand (global) + React Query (server state)
- **Routing:** React Router v6+
- **Forms:** React Hook Form + Zod
- **HTTP:** Axios
- **WebSocket:** Socket.io-client (if real-time)
- **Tests:** Vitest + Testing Library + Playwright (E2E)

## Project Structure

```
src/
├── features/                   # Organized by feature/domain
│   ├── demands/
│   │   ├── components/         # Feature components
│   │   │   ├── DemandList.tsx
│   │   │   ├── DemandCard.tsx
│   │   │   └── DemandForm.tsx
│   │   ├── hooks/              # Custom hooks
│   │   │   └── useDemands.ts
│   │   ├── services/           # API calls
│   │   │   └── demandApi.ts
│   │   ├── types.ts            # Feature types
│   │   └── index.ts            # Barrel export
│   ├── dashboard/
│   └── auth/
├── shared/                     # Shared across features
│   ├── components/             # Button, Modal, Table, etc.
│   ├── hooks/                  # useDebounce, useLocalStorage, etc.
│   ├── lib/                    # api.ts (axios instance), utils
│   └── types/                  # Global types
├── layouts/                    # AppLayout, AuthLayout
├── routes/                     # Route configuration
├── config/                     # Constants, env vars
├── styles/                     # Global CSS
└── tests/
    ├── e2e/                    # Playwright
    └── setup.ts                # Vitest setup
```

## Code Standards

- Maximum 200 lines per component
- Props typed with interface (not type)
- One component = one responsibility
- Custom hooks for reusable logic
- Server state in React Query, UI state in Zustand
- React Hook Form + Zod for forms
- Lazy loading per route

## Component Standards

- Composition > configuration (slots > boolean props)
- Container/Presenter for complex components
- Loading/Error/Empty states on every async component
- Accessibility: semantic HTML, aria-labels, keyboard nav

## Git

- Commits: `feat(demands): adicionar filtro por status`
- Branches: `feature/<feature>-<description>`
- Never commit node_modules, .env, dist/

## Tests

- Vitest + Testing Library: components and hooks
- Playwright: E2E flows (login, CRUD, navigation)
- Minimum coverage: 70%
- Test behavior, not implementation

## What NOT to do

- Do not use `any` in TypeScript
- Do not fetch inside the component (use React Query)
- Do not duplicate API data in global state
- Do not use index as key in dynamic lists
- Do not create mega-components of 500+ lines
- Do not ignore loading/error states
- Do not style with inline CSS when you have Tailwind
