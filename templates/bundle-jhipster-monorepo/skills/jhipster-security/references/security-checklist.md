# JHipster Security Checklist

## Authentication
- [ ] JWT or OAuth2/OIDC properly configured
- [ ] Token expiration set appropriately
- [ ] Refresh token mechanism in place
- [ ] Password policy enforced (BCrypt, min length)

## Authorization
- [ ] Endpoints protected with proper roles
- [ ] Method-level security with @PreAuthorize where needed
- [ ] User can only access their own resources (data isolation)
- [ ] Admin endpoints separated under /api/admin/

## API Security
- [ ] Rate limiting on public endpoints
- [ ] Input validation on all request bodies (@Valid)
- [ ] CORS configured (not wildcard in production)
- [ ] CSRF enabled for browser clients
- [ ] Content-Type validation
- [ ] Response does not leak internal details

## Data Security
- [ ] No hardcoded secrets in source code
- [ ] Secrets stored in environment variables or vault
- [ ] Parameterized queries (no SQL injection)
- [ ] Sensitive data encrypted at rest
- [ ] Passwords hashed with BCrypt

## Infrastructure
- [ ] HTTPS enforced in production
- [ ] Security headers configured (X-Frame-Options, CSP, etc.)
- [ ] Audit trail for critical operations
- [ ] Logging does not contain sensitive data
- [ ] Dependencies scanned for vulnerabilities

## Commands for Verification
```bash
# Check for hardcoded secrets
grep -rn "password\|secret\|api.key" src/ --include="*.java" --include="*.yml"

# Run security tests
./mvnw test -Dtest="*Security*,*Auth*"

# Check dependencies for vulnerabilities
./mvnw dependency-check:check
```
