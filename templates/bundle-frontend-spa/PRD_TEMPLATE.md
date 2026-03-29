# Product Requirements Document (PRD)

> Este documento define os requisitos do produto. Deve ser preenchido pelo analista de requisitos e/ou pelo dev antes de iniciar o desenvolvimento. O agente AI usa este documento como contexto para entender O QUE construir.

## 1. Resumo Executivo

<!-- Descreva em 2-3 frases o que é o produto e qual problema resolve -->

## 2. Usuários Alvo

<!-- Quem vai usar o sistema? Descreva as personas -->

### Persona 1: [Nome]
- **Perfil:**
- **Objetivos:**
- **Dores:**

## 3. Escopo do MVP

### Incluído no MVP
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

### Fora do MVP (futuro)
- [ ] Feature futura 1
- [ ] Feature futura 2

## 4. User Stories

### US01: [Título]
**Como** [persona], **quero** [ação], **para** [benefício].

**Critérios de aceite:**
- [ ] CA1:
- [ ] CA2:

### US02: [Título]
**Como** [persona], **quero** [ação], **para** [benefício].

**Critérios de aceite:**
- [ ] CA1:
- [ ] CA2:

## 5. Arquitetura de Alto Nível

<!-- Diagrama em Mermaid ou ASCII mostrando os componentes principais -->

```mermaid
graph LR
    A[Frontend] --> B[API]
    B --> C[Database]
```

### Estrutura de Diretórios

```
project/
├── src/
├── tests/
└── ...
```

## 6. Features Detalhadas

### Feature 1: [Nome]
- **Descrição:**
- **Regras de negócio:**
  -
- **Inputs:**
- **Outputs:**
- **Edge cases:**
  -

### Feature 2: [Nome]
- **Descrição:**
- **Regras de negócio:**
  -

## 7. Stack Tecnológica

| Componente | Tecnologia | Justificativa |
|---|---|---|
| Backend | | |
| Frontend | | |
| Banco de dados | | |
| Cache | | |
| Deploy | | |

## 8. API Specification

### Endpoints

#### `GET /api/v1/resource`
- **Descrição:**
- **Response:** `200 OK`
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "size": 20
}
```

#### `POST /api/v1/resource`
- **Descrição:**
- **Body:**
```json
{
  "field": "value"
}
```
- **Response:** `201 Created`

## 9. Modelo de Dados

```sql
CREATE TABLE example (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 10. Requisitos Não-Funcionais

| Requisito | Alvo | Prioridade |
|---|---|---|
| Performance | Response time < 500ms | Alta |
| Disponibilidade | 99.9% uptime | Média |
| Segurança | OWASP Top 10 | Alta |
| Escalabilidade | Até X usuários simultâneos | Média |

## 11. Fases de Implementação

### Fase 1: Foundation
- [ ] Setup do projeto
- [ ] Modelo de dados
- [ ] Endpoints básicos

### Fase 2: Core Features
- [ ] Feature 1 completa
- [ ] Feature 2 completa

### Fase 3: Polish
- [ ] Testes E2E
- [ ] Performance
- [ ] Documentação

## 12. Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|
| | | | |

## 13. Critérios de Sucesso

- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3
