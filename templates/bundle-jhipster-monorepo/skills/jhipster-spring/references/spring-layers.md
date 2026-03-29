# Spring Boot Layer Conventions

## Architecture
```
Controller (web/rest/) --> Service (service/) --> Repository (repository/) --> Entity (domain/)
                            |
                        DTO + Mapper (service/dto/ + service/mapper/)
```

## Controller Rules
- `@RestController` + `@RequestMapping`
- Constructor injection for dependencies
- `@Valid @RequestBody` for input validation
- Return `ResponseEntity` for proper HTTP semantics
- Use `PaginationUtil` for paginated responses
- No business logic -- delegate to service

## Service Rules
- `@Service` + `@Transactional`
- `@Transactional(readOnly = true)` for read operations
- Business logic and orchestration live here
- Work with Entities internally, return DTOs externally
- Constructor injection for repositories and mappers

## Repository Rules
- Extend `JpaRepository` and optionally `JpaSpecificationExecutor`
- Use Spring Data derived query methods
- Use `@Query` with JPQL for complex queries
- `LEFT JOIN FETCH` for eager loading relationships

## DTO Rules
- Use Java Records (Java 21)
- Validation annotations on request DTOs
- Separate Create/Update/Response DTOs
- Never expose Entity directly in API

## Mapper Rules
- Use MapStruct with `@Mapper(componentModel = "spring")`
- Extend `EntityMapper<DTO, Entity>` from JHipster
- Use `@Mapping` for field-level customization
- `uses = {OtherMapper.class}` for nested mappings
