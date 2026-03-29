# Constitution — Projeto Frontend SPA

## Princípios

1. **Spec primeiro, código depois** — Toda demanda passa pelo fluxo SDD antes de implementação
2. **Componente = 1 responsabilidade** — Componentes pequenos e focados
3. **Server state no React Query** — Nunca duplicar dados da API no estado global
4. **TypeScript strict** — Zero `any`, types para tudo
5. **Mobile-first** — Escrever para mobile, breakpoints para desktop

## Padrões de desenvolvimento

- React 18+, TypeScript strict mode
- Tailwind CSS + Shadcn/UI
- Feature-based folder structure
- Custom hooks para lógica reutilizável
- React Hook Form + Zod para formulários

## Padrões de componentes

- Composição sobre configuração
- Loading/Error/Empty states em todo async
- Acessibilidade: semantic HTML, aria-labels
- Lazy loading por rota
- Máximo 200 linhas por componente

## Padrões de qualidade

- Vitest + Testing Library para componentes
- Playwright para E2E
- Cobertura mínima: 70%
- Commits seguem Conventional Commits
