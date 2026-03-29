# Constitution — Frontend SPA Project

## Principles

1. **Spec first, code later** — Every demand goes through the SDD flow before implementation
2. **Component = 1 responsibility** — Small and focused components
3. **Server state in React Query** — Never duplicate API data in global state
4. **TypeScript strict** — Zero `any`, types for everything
5. **Mobile-first** — Write for mobile, breakpoints for desktop

## Development Standards

- React 18+, TypeScript strict mode
- Tailwind CSS + Shadcn/UI
- Feature-based folder structure
- Custom hooks for reusable logic
- React Hook Form + Zod for forms

## Component Standards

- Composition over configuration
- Loading/Error/Empty states on every async
- Accessibility: semantic HTML, aria-labels
- Lazy loading per route
- Maximum 200 lines per component

## Quality Standards

- Vitest + Testing Library for components
- Playwright for E2E
- Minimum coverage: 70%
- Commits follow Conventional Commits
