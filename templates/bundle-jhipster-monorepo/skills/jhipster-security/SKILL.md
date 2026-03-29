---
name: jhipster-security
description: Configure security in JHipster with JWT, OAuth2, roles, and permissions. Use when implementing authentication, authorization, roles, protecting endpoints, or configuring CORS/CSRF.
version: 1.0.0
author: Maestro
---

# JHipster Security

Configure and customize security in JHipster applications using JWT, OAuth2/Keycloak, role-based access control, and method-level security.

## When to Use
- When protecting REST endpoints by role
- When creating custom roles and authorities
- When configuring JWT or OAuth2/Keycloak
- When adding method-level security (@PreAuthorize)
- When setting up CORS, CSRF, or rate limiting

## Available Operations
1. Configure endpoint security by role
2. Create custom roles and authorities
3. Add method-level security annotations
4. Configure OAuth2 with Keycloak
5. Apply security checklist

## Multi-Step Workflow

### Step 1: Configure Endpoint Protection

```java
@Configuration
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasAuthority(AuthoritiesConstants.ADMIN)
                .requestMatchers("/api/demands/**").hasAnyAuthority(
                    AuthoritiesConstants.USER, AuthoritiesConstants.ADMIN)
                .requestMatchers("/api/agents/**").hasAuthority("ROLE_AGENT")
                .requestMatchers("/api/**").authenticated()
            );
        return http.build();
    }
}
```

### Step 2: Define Custom Roles

```java
public final class AuthoritiesConstants {
    public static final String ADMIN = "ROLE_ADMIN";
    public static final String USER = "ROLE_USER";
    public static final String AGENT = "ROLE_AGENT";        // AI Agents
    public static final String TECH_LEAD = "ROLE_TECH_LEAD"; // Merge approver
}
```

Add roles to Liquibase data:
```bash
# Edit authority.csv to add new roles
cat src/main/resources/config/liquibase/data/authority.csv
```

### Step 3: Add Method-Level Security

```java
@Service
public class DemandServiceImpl implements DemandService {

    @PreAuthorize("hasAuthority('ROLE_TECH_LEAD')")
    public void approveMerge(Long demandId) {
        // Only tech lead can approve merge
    }

    @PreAuthorize("#login == authentication.name or hasAuthority('ROLE_ADMIN')")
    public DemandDTO findByUser(String login) {
        // User sees only their demands, admin sees all
    }
}
```

### Step 4: Configure OAuth2 + Keycloak (for production)

```yaml
# application.yml
spring:
  security:
    oauth2:
      client:
        provider:
          oidc:
            issuer-uri: http://keycloak:9080/realms/jhipster
        registration:
          oidc:
            client-id: web_app
            client-secret: web_app
            scope: openid,profile,email
```

```bash
# Start Keycloak with Docker
docker-compose -f src/main/docker/keycloak.yml up -d

# Access Keycloak admin console
# URL: http://localhost:9080
# User: admin / Password: admin
```

### Step 5: Apply Security Checklist

```bash
# Verify no hardcoded secrets
grep -r "password\|secret\|api.key" src/main/resources/ --include="*.yml" --include="*.properties"

# Check CORS configuration
grep -r "cors" src/main/java/ --include="*.java"

# Verify HTTPS configuration for prod profile
grep -r "ssl\|https" src/main/resources/config/application-prod.yml
```

Checklist:
- [ ] Rate limiting on public endpoints
- [ ] CORS properly configured (not `*` in production)
- [ ] CSRF enabled for browser, disabled for API
- [ ] Secrets in environment variables, never in code
- [ ] Passwords with BCrypt (JHipster default)
- [ ] Audit trail for critical operations
- [ ] HTTPS in production

### Step 6: Test Security

```bash
# Run security-related tests
./mvnw test -Dtest="*Security*,*Auth*"

# Test endpoint protection manually
curl -v http://localhost:8080/api/demands  # Should return 401
curl -v -H "Authorization: Bearer <token>" http://localhost:8080/api/demands  # Should return 200
```

## Resources
- `references/security-checklist.md` - Complete security checklist for JHipster applications

## Examples
### Example 1: Protect an Endpoint by Role
User asks: "Only admins should access the /api/admin/reports endpoint"
Response approach:
1. Add `.requestMatchers("/api/admin/reports/**").hasAuthority(AuthoritiesConstants.ADMIN)` to SecurityConfiguration
2. Run `./mvnw test -Dtest="*Security*"` to verify
3. Test manually with curl

### Example 2: Add a Custom Role
User asks: "Create a TECH_LEAD role that can approve merges"
Response approach:
1. Add `ROLE_TECH_LEAD` to `AuthoritiesConstants`
2. Add to `authority.csv` in Liquibase data
3. Add `@PreAuthorize("hasAuthority('ROLE_TECH_LEAD')")` to the approval method
4. Run `./mvnw test`

### Example 3: Setup Keycloak
User asks: "Configure OAuth2 with Keycloak for this project"
Response approach:
1. Add OAuth2 configuration to `application.yml`
2. Start Keycloak with `docker-compose -f src/main/docker/keycloak.yml up -d`
3. Configure realm and client in Keycloak admin console
4. Test login flow

## Notes
- JWT is the default for monorepo; OAuth2/Keycloak recommended for microservices
- Always use `@PreAuthorize` for fine-grained access control in services
- Never expose security configuration details in API responses
- Test both authenticated and unauthenticated access in integration tests
