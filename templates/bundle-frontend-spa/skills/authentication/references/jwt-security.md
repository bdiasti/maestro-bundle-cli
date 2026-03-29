# JWT Security Best Practices

## Token Storage
| Method | Security | XSS Risk | CSRF Risk |
|---|---|---|---|
| localStorage | Low | High | None |
| httpOnly Cookie | High | None | Medium |
| In-memory (variable) | Highest | None | None |

Recommendation: Use httpOnly cookies for production, localStorage for development/SPAs.

## Token Expiry
| Token Type | Recommended Expiry |
|---|---|
| Access Token | 15 min - 1 hour |
| Refresh Token | 7 - 30 days |

## Security Checklist
- [ ] Use strong secret key (256+ bits): `openssl rand -hex 32`
- [ ] Set algorithm explicitly (HS256 or RS256), never "none"
- [ ] Validate token type (access vs refresh) on every endpoint
- [ ] Implement refresh token rotation (new refresh token on each use)
- [ ] Rate limit login endpoint (5 attempts per minute)
- [ ] Log failed login attempts
- [ ] Clear all tokens on logout (both client and server)
- [ ] Use HTTPS in production

## Common Vulnerabilities
1. **Algorithm confusion**: Always specify algorithm in `jwt.decode()`, never accept from token
2. **Missing expiry check**: Always include `exp` claim
3. **Token reuse after logout**: Maintain a blocklist or use short-lived tokens
4. **Refresh without rotation**: Rotate refresh tokens to limit damage from stolen tokens

## Generating a Secure Secret
```bash
# Generate a 256-bit hex secret
openssl rand -hex 32

# Or with Python
python -c "import secrets; print(secrets.token_hex(32))"
```
