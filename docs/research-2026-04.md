# VibeChecker Research - Abril 2026

## OWASP Top 10 2025 Updates

### Nuevas categorías
1. **A03:2025 - Software Supply Chain Failures** (NUEVA)
   - Dependencias vulnerables, CI/CD comprometido, hallucinated packages
   - 5 CWEs, alto exploit score
   - slopsquatting: AI sugiere packages que no existen, atacantes los registran

2. **A10:2025 - Mishandling of Exceptional Conditions** (NUEVA)
   - Error handling malo, logical flaws, fail-open conditions
   - 24 CWEs
   - Ej: exponer stack traces en producción

### Cambios importantes
- SSRF (A10:2021) → mergeado en A01:2025 Broken Access Control
- Security Misconfiguration sube a #2 (era #5)
- Authentication Failures renombrado (era Identification and Authentication Failures)

---

## Estadísticas de Vibe-Coded Apps (Reales)

### Estudio: 100 apps escaneadas
| Finding | % Apps | Severidad |
|---------|--------|-----------|
| Missing CSRF protection | 70% | CRITICAL |
| Exposed secrets/API keys | 41% | CRITICAL |
| Poor error handling | 36% | WARNING |
| Missing input validation | 28% | WARNING |
| No authentication on endpoints | 21% | CRITICAL |
| Missing security headers | 20% | WARNING |
| XSS vulnerabilities | 18% | CRITICAL |
| Exposed Supabase credentials | 12% | CRITICAL |

**Total: 318 vulnerabilidades en 100 apps, 89 CRITICALs**
**Score promedio: 65/100 (D grade)**

### Por plataforma
| Platform | Avg Score | % With Issues | % CRITICAL |
|----------|-----------|---------------|------------|
| Lovable | 58/100 | 79% | 72% |
| Bolt.new | 66/100 | 60% | 57% |
| v0.dev | 71/100 | 60% | 20% |
| Cursor | 75/100 | 50% | 42% |

---

## Ataques vectors específicos para vibe-coded

### 1. Slopsquatting (NUEVO - OWASP A03)
- AI genera código con `importar paquete-inexistente`
- Atacante registra el paquete malicioso
- Al hacer `npm install`, ejecuta malware

### 2. Supabase/REST API keys hardcodeados
- Lovable genera apps con credenciales en `.env`
- Service role key committeada a repos públicos
- RLS bypassed = acceso a todas las tablas

### 3. CSRF tokens faltantes
- 70% de vibe-coded apps sin protección CSRF
- Más crítico en apps con cookies de sesión

### 4. Error handling expuesto
- Stack traces en producción
- Información del framework/version leaks
- Fail-open en condiciones anormales

---

## Mejoras recomendadas para VibeChecker

### Prioridad ALTA
1. **Slopsquatting detection** - detectar packages hallucinated
2. **Supabase auth detection** - encontrar credenciales hardcodeadas
3. **CSRF check** - más agresivo
4. **Error handling scan** - detectar stack traces, debug endpoints

### Prioridad MEDIA
5. **Security headers completos** - agregar Permissions-Policy, Cross-Origin-Opener-Policy
6. **Supply chain checks** - packages desactualizados con vulnerabilities conocidas
7. **Rate limiting detection** - falta de rate limits en APIs

### Prioridad BAJA
8. **SEO checks** - no es security pero agrega valor (63% fallan)
9. **Accessibility** - WCAG compliance básico

---

## Recursos
- https://owasp.org/www-project-top-ten/
- https://www.invicti.com/blog/security-labs/security-issues-in-vibe-coded-web-apps-analyzed
- https://dev.to/vibewrench/i-scanned-100-vibe-coded-apps-for-security-i-found-318-vulnerabilities-4dp7
- https://www.bleepingcomputer.com/news/security/ai-hallucinated-code-dependencies-become-new-supply-chain-risk/
- https://cybersecuritynews.com/owasp-top-10-2025/
