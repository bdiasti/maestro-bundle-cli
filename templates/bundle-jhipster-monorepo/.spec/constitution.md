# Constitution — Projeto JHipster Monorepo

## Princípios

1. **Spec primeiro, código depois** — Toda demanda passa pelo fluxo SDD antes de implementação
2. **JDL como fonte de verdade** — Modelo de entidades definido em JDL, código gerado pelo JHipster
3. **Enriquecer, não substituir** — Entidades geradas pelo JHipster são enriquecidas com DDD, não reescritas do zero
4. **Migrations versionadas** — Toda mudança de schema via Liquibase changeset, nunca manual
5. **DTO na fronteira** — Nunca expor entidade JPA na API REST

## Padrões de desenvolvimento

### Java / Spring Boot
- Java 21+, Records para DTOs
- Constructor injection (nunca @Autowired em campo)
- @Transactional apenas no Service
- Entidades com comportamento rico (não anêmicas)
- MapStruct para conversão Entity ↔ DTO

### Angular
- Standalone components (Angular 17+)
- Lazy loading por rota
- Reactive Forms com validação
- Services para chamadas HTTP

## Padrões de qualidade

- Cobertura mínima: 80%
- JUnit 5 + Mockito para backend
- Jest + Cypress para frontend
- Code review obrigatório
- Commits seguem Conventional Commits
