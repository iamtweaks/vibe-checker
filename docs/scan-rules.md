# VibeChecker - Security Scan Rules

## Overview

VibeChecker uses pattern matching and heuristic analysis to detect security vulnerabilities in code repositories and websites. This document details all security rules implemented in the scanner.

---

## GitHub Scanner Rules

### SEC-001: API Key Detected
- **Severity:** 🔴 Critical
- **CWE:** CWE-798
- **Pattern:** Matches common API key formats (sk-, pk-, AIza, ghp_, eyJ...)
- **Files Scanned:** All text files
- **Example Matches:**
  - `api_key = "sk-1234567890abcdef"`
  - `const API_KEY = process.env.OPENAI_API_KEY`
  - `apiKey: "AIzaSy..."` (Google API)
  - `Authorization: Bearer sk-...` (OpenAI)
- **Remediation:** Remove API keys from code immediately. Use environment variables: `process.env.API_KEY`

### SEC-002: Private Key Detected
- **Severity:** 🔴 Critical
- **CWE:** CWE-320
- **Pattern:** Matches RSA, EC, OPENSSH private key headers
- **Files Scanned:** All text files
- **Example Matches:**
  - `-----BEGIN RSA PRIVATE KEY-----`
  - `-----BEGIN PRIVATE KEY-----`
  - `-----BEGIN EC PRIVATE KEY-----`
- **Remediation:** Remove private keys from code immediately. Store them securely in environment variables or a secrets manager.

### SEC-003: .env File Exposed
- **Severity:** 🔴 Critical
- **CWE:** CWE-552
- **Pattern:** .env files present in repository
- **Files Scanned:** Root and common directories
- **Remediation:** Ensure .env files are in .gitignore and never committed. Use git-secrets or similar tools to prevent accidental commits.

### SEC-004: Hardcoded Password
- **Severity:** 🟠 High
- **CWE:** CWE-259
- **Pattern:** Password assignments in code
- **Files Scanned:** All text files
- **Example Matches:**
  - `password = "admin123"`
  - `const pwd = "secret"`
  - `mysql_connect("root", "password")`
- **Remediation:** Move passwords to environment variables: `process.env.DB_PASSWORD` or use a secrets manager.

### SEC-006: Eval Usage
- **Severity:** 🟠 High
- **CWE:** CWE-95
- **Pattern:** JavaScript eval(), Python eval(), eval() equivalents
- **Files Scanned:** .js, .ts, .py, .rb files
- **Example Matches:**
  - `eval(userInput)`
  - `eval(codeString)`
  - `exec(compile(ast))`
- **Remediation:** Replace eval() with safer alternatives. Use JSON.parse() for JSON, or restructure code to avoid dynamic execution.

### SEC-007: Console.log Debug Statement
- **Severity:** 🟢 Low
- **CWE:** CWE-489
- **Pattern:** Debug logging left in code
- **Files Scanned:** .js, .ts, .jsx, .tsx files
- **Example Matches:**
  - `console.log(...)`
  - `console.error(...)`
  - `console.debug(...)`
- **Remediation:** Remove console statements or use a logging library with proper log levels for production.

### SEC-008: SQL Injection Pattern
- **Severity:** 🔴 Critical
- **CWE:** CWE-89
- **Pattern:** String concatenation in SQL queries
- **Files Scanned:** All code files
- **Example Matches:**
  - `"SELECT * FROM users WHERE id=" + userId`
  - `query("SELECT * FROM table WHERE name='" + name + "'")`
  - `f"SELECT * FROM users WHERE email={email}"` (Python f-string)
- **Remediation:** Use parameterized queries or an ORM. Never concatenate user input directly into SQL strings.

### SEC-009: XSS Vulnerability Pattern
- **Severity:** 🟠 High
- **CWE:** CWE-79
- **Pattern:** Unescaped user input in HTML/JS context
- **Files Scanned:** .js, .ts, .jsx, .tsx, .html files
- **Example Matches:**
  - `innerHTML = userInput`
  - `document.write(html)`
  - `dangerouslySetInnerHTML` without sanitization
- **Remediation:** Sanitize user input before rendering. Use textContent instead of innerHTML, or use a sanitization library like DOMPurify.

### SEC-010: CORS Misconfiguration
- **Severity:** 🟠 High
- **CWE:** CWE-942
- **Pattern:** Permissive CORS settings with wildcard origin
- **Files Scanned:** server configs, middleware files
- **Example Matches:**
  - `Access-Control-Allow-Origin: *`
  - `origin: '*'`
  - `cors({ origin: true })`
- **Remediation:** Restrict CORS to specific trusted origins. Never use * with `Access-Control-Allow-Credentials: true`.

### SEC-011: Vue Devtools or Debug Mode Enabled in Production
- **Severity:** 🟠 High
- **CWE:** CWE-489
- **Pattern:** Vue development tools exposed in production code
- **Example Matches:**
  - `__VUE__` global exposed
  - `Vue.config.devtools = true`
  - `vue-devtools` integration in production bundle
  - `__VUE_PROD_DEVTOOLS__` set to true
- **Remediation:** In Vue 3: set `Vue.config.devtools = false` in production. Ensure `process.env.NODE_ENV === 'production'`.

### SEC-012: React/Redux DevTools Enabled in Production
- **Severity:** 🟠 High
- **CWE:** CWE-489
- **Pattern:** React or Redux devtools exposed in production
- **Example Matches:**
  - `window.__REACT_DEVTOOLS_GLOBAL_HOOK__`
  - `window.__REDUX_DEVTOOLS_EXTENSION__`
  - `reduxDevtools` in production bundle
- **Remediation:** Remove __REACT_DEVTOOLS_GLOBAL_HOOK__ references from production builds. Use environment checks: `if (process.env.NODE_ENV !== 'production')`.

### SEC-013: Angular Debug Tools Enabled in Production
- **Severity:** 🟠 High
- **CWE:** CWE-489
- **Pattern:** Angular debug tools in production code
- **Example Matches:**
  - `ng.probe()` reference
  - `enableDebugTools()` call
  - `productionMode = false`
  - `BrowserModule.withServerTransition` without proper production mode
- **Remediation:** Call `enableProdMode()` in production builds. Remove all `ng.probe` and `enableDebugTools` references from production code.

### SEC-014: Exposed .git Directory or Metadata
- **Severity:** 🔴 Critical
- **CWE:** CWE-552
- **Pattern:** .git directory internals accessible
- **Example Matches:**
  - `.git/config` accessible
  - `.git/HEAD` exposed
  - `.git/ORIG_HEAD` reference
- **Remediation:** Block access to .git directory in web server: `nginx: location ~ /\.git { deny all; }` or `Apache: <Directory ~ "\.git"> Require all denied </Directory>`

### SEC-015: Debug Mode or Verbose Logging Enabled
- **Severity:** 🟠 High
- **CWE:** CWE-489, CWE-209
- **Pattern:** Debug flags or verbose logging in production code
- **Example Matches:**
  - `debug = true` or `DEBUG = true`
  - `process.env.DEBUG`
  - `app.use(require('express').logger)`
  - `helmet.csp.disabled` or security middleware bypassed
- **Remediation:** Set `process.env.NODE_ENV = 'production'`. Remove verbose logging (Morgan, connect.logger) from production. Ensure security middleware is not disabled.

### SEC-016: Local Environment File Reference
- **Severity:** 🔴 Critical
- **CWE:** CWE-552
- **Pattern:** .env.local, .env.development files referenced
- **Example Matches:**
  - `.env.local` file referenced
  - `.env.development` path mentioned
  - `.env.test` reference
- **Remediation:** Ensure `.env.local` is in `.gitignore`. Never commit local environment files. Use secrets manager for production.

### SEC-017: Configuration File May Contain Secrets
- **Severity:** 🔴 Critical
- **CWE:** CWE-552
- **Pattern:** config.yml or config.json near sensitive keywords
- **Example Matches:**
  - `config.yml` near `aws_secret`
  - `config.json` near `password`, `api_key`, `credential`
- **Remediation:** Move secrets from config files to environment variables. Never commit config files with secrets to version control.

### SEC-018: X-Content-Type-Options Explicitly Disabled
- **Severity:** 🟡 Medium
- **CWE:** CWE-693
- **Pattern:** X-Content-Type-Options disabled or set to insecure value
- **Remediation:** Always set `X-Content-Type-Options: nosniff` on all responses.

### SEC-019: Debug Environment Variables Referenced
- **Severity:** 🟢 Low
- **CWE:** CWE-489
- **Pattern:** DEBUG, VERBOSE, LOG_LEVEL environment variables in code
- **Remediation:** Use structured logging with appropriate log levels. Ensure DEBUG=false in production.

### ERRHAND001: Exposed Stack Trace in Code
- **Severity:** 🟠 High
- **CWE:** CWE-209, CWE-12
- **Pattern:** Stack traces in source code
- **Remediation:** Remove stack traces from production code. Use structured error logging. Implement global error handlers.

### ERRHAND002: Global Exception Handler Disabled
- **Severity:** 🟠 High
- **CWE:** CWE-755
- **Pattern:** Error handlers disabled or bypassed
- **Example Matches:**
  - `errorHandler = false`
  - `process.on('uncaughtException')` with disabled handler
- **Remediation:** Always implement global error handlers. Log details server-side, return generic errors to users.

### CORS002: CORS Allows Credentials with Wildcard Origin
- **Severity:** 🔴 Critical
- **CWE:** CWE-346
- **Pattern:** Access-Control-Allow-Credentials: true with Access-Control-Allow-Origin: *
- **Remediation:** Never combine credentials with wildcard origin. Use specific origin or dynamic validation.

### AUTH001: JWT Algorithm Confusion or None Algorithm
- **Severity:** 🔴 Critical
- **CWE:** CWE-347
- **Pattern:** JWT with weak or misconfigured algorithm
- **Example Matches:**
  - JWT algorithm set to 'none'
  - Using HS256 with asymmetric algorithm
- **Remediation:** Use RS256 or ES256 for JWTs. Never accept 'none' algorithm. Use libraries like jose to prevent algorithm confusion.

### RATE001: Rate Limiting Explicitly Disabled
- **Severity:** 🟠 High
- **CWE:** CWE-307
- **Pattern:** Rate limiting disabled or set to unlimited
- **Example Matches:**
  - `rateLimit: { disabled: true }`
  - `maxRequests: Infinity`
- **Remediation:** Enable rate limiting on all public endpoints. Use express-rate-limit or a WAF.

### SUPABASE001: Exposed Supabase Credentials
- **Severity:** 🔴 Critical
- **CWE:** CWE-798
- **Pattern:** Hardcoded Supabase keys in source code
- **Remediation:** Use environment variables: `process.env.SUPABASE_KEY`. Add .env to .gitignore.

### CSRF001: Missing CSRF Protection
- **Severity:** 🔴 Critical
- **CWE:** CWE-352
- **Pattern:** Missing or weak CSRF protection detected
- **Remediation:** Implement CSRF tokens for all state-changing requests. Use SameSite=Strict/Lax cookie attribute.

### SUPPLY001: Suspicious Package Name (Slopsquatting Risk)
- **Severity:** 🟠 High
- **CWE:** CWE-1359
- **Pattern:** Suspicious package dependency names
- **Remediation:** Verify each dependency exists in npm registry. Remove unknown packages. Use package-lock.json.

---

## Website Scanner Rules

### Header Security Rules

#### WEB-001: Content-Security-Policy Missing
- **Severity:** 🟠 High
- **CWE:** CWE-1021
- **OWASP:** A05:2025
- **Header:** Content-Security-Policy
- **Remediation:** Add CSP header: `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; object-src 'none'; base-uri 'self'`

#### WEB-002: HSTS Header Missing
- **Severity:** 🟠 High
- **CWE:** CWE-523
- **Header:** Strict-Transport-Security
- **Remediation:** Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

#### WEB-003: X-Frame-Options Missing
- **Severity:** 🟡 Medium
- **CWE:** CWE-1021
- **Header:** X-Frame-Options
- **Remediation:** Add `X-Frame-Options: DENY` or use CSP frame-ancestors directive.

#### WEB-004: X-Content-Type-Options Missing
- **Severity:** 🟡 Medium
- **CWE:** CWE-693
- **OWASP:** A05:2025
- **Header:** X-Content-Type-Options
- **Remediation:** Add `X-Content-Type-Options: nosniff` to prevent MIME-sniffing attacks.

#### WEB-005: Referrer-Policy Header Missing
- **Severity:** 🟢 Low
- **CWE:** CWE-116
- **OWASP:** A05:2025
- **Header:** Referrer-Policy
- **Remediation:** Add `Referrer-Policy: strict-origin-when-cross-origin` or `no-referrer`.

#### WEB-006: Permissions-Policy Header Missing
- **Severity:** 🟢 Low
- **CWE:** CWE-16
- **OWASP:** A05:2025
- **Header:** Permissions-Policy
- **Remediation:** Add `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`

#### WEB-007: X-Powered-By Header Discloses Technology Stack
- **Severity:** 🟢 Low
- **CWE:** CWE-200
- **Header:** X-Powered-By
- **Remediation:** Remove or genericize X-Powered-By header. In Express: `app.disable('x-powered-by')`.

#### WEB-008: Server Header Discloses Version Information
- **Severity:** 🟢 Low
- **CWE:** CWE-200
- **Header:** Server
- **Remediation:** Suppress version info: nginx `server_tokens off;`, Apache `ServerTokens Prod`.

#### WEB-009: Rate Limiting Headers Missing
- **Severity:** 🟡 Medium
- **CWE:** CWE-307
- **OWASP:** A04:2021
- **Header:** X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After
- **Remediation:** Implement rate limiting with appropriate headers.

#### WEB-010: Cross-Origin-Opener-Policy (COOP) Missing
- **Severity:** 🟡 Medium
- **CWE:** CWE-1021
- **OWASP:** A05:2025
- **Header:** Cross-Origin-Opener-Policy
- **Remediation:** Add `Cross-Origin-Opener-Policy: same-origin` to isolate from cross-origin documents.

#### WEB-011: Cross-Origin-Resource-Policy (CORP) Missing
- **Severity:** 🟡 Medium
- **CWE:** CWE-1021
- **OWASP:** A05:2025
- **Header:** Cross-Origin-Resource-Policy
- **Remediation:** Add `Cross-Origin-Resource-Policy: same-origin` or `cross-origin`.

#### WEB-012: Cross-Origin-Embedder-Policy (COEP) Missing
- **Severity:** 🟢 Low
- **CWE:** CWE-1021
- **OWASP:** A05:2025
- **Header:** Cross-Origin-Embedder-Policy
- **Remediation:** Add `Cross-Origin-Embedder-Policy: require-corp` if using SharedArrayBuffer or similar features.

### Path-Based Rules (Website Scanner)

| Path | Severity | Title |
|------|----------|-------|
| /.env | 🔴 Critical | .env File Accessible |
| /.env.local | 🔴 Critical | .env.local File Accessible |
| /.env.development | 🟠 High | .env.development File Accessible |
| /.git | 🔴 Critical | .git Directory Fully Accessible |
| /.git/config | 🔴 Critical | .git/config Accessible |
| /.git/HEAD | 🔴 Critical | .git/HEAD Accessible |
| /config.yml | 🟠 High | config.yml Exposed |
| /config.yaml | 🟠 High | config.yaml Exposed |
| /config.json | 🟠 High | config.json Exposed |
| /debug | 🔴 Critical | Debug Endpoints Exposed |
| /api/debug | 🔴 Critical | API Debug Endpoint Exposed |
| /actuator | 🟠 High | Spring Boot Actuator Fully Exposed |
| /actuator/health | 🟡 Medium | Spring Boot Actuator Health Exposed |
| /trace | 🟠 High | Trace Endpoint Exposed |
| /admin | 🟠 High | Admin Panel Exposed |
| /wp-admin | 🟠 High | WordPress Admin Exposed |
| /.aws/credentials | 🔴 Critical | AWS Credentials File Exposed |
| /id_rsa | 🔴 Critical | SSH Private Key Exposed |
| /backup | 🟠 High | Backup Directory Exposed |
| /.svn | 🟠 High | Subversion Directory Exposed |
| /.hg | 🟠 High | Mercurial Directory Exposed |
| /phpinfo.php | 🟠 High | phpinfo() Page Exposed |
| /server-status | 🟡 Medium | Apache Server Status Exposed |
| /.well-known/security.txt | 🟢 Low | security.txt Found (expected) |

### OWASP Top 10 2021 Aligned Checks

| ID | Title | OWASP | Severity |
|----|-------|-------|----------|
| idor | Insecure Direct Object Reference | A01:2021 | 🟠 High |
| directory-traversal | Directory Traversal | A01:2021 | 🔴 Critical |
| cors-misconfig | CORS Misconfiguration | A01:2021 | 🟠 High |
| https-missing | Page Loaded Over HTTP | A02:2021 | 🔴 Critical |
| mixed-content | Mixed Content Detected | A02:2021 | 🟠 High |
| weak-ssl | Weak/Missing SSL/TLS | A02:2021 | 🟠 High |
| xss-stored | Stored XSS via Form Input | A03:2021 | 🔴 Critical |
| xss-reflected | Reflected XSS in URL | A03:2021 | 🟠 High |
| xss-dom | DOM-based XSS | A03:2021 | 🟠 High |
| sql-injection-params | SQL Injection via Parameters | A03:2021 | 🔴 Critical |
| cmd-injection | Command Injection | A03:2021 | 🔴 Critical |
| ldap-injection | LDAP Injection | A03:2021 | 🟠 High |
| debug-endpoint | Debug/Development Endpoint | A04:2021 | 🟠 High |
| missing-rate-limit | Missing Rate Limiting | A04:2021 | 🟡 Medium |
| missing-csp | CSP Missing | A05:2021 | 🟠 High |
| missing-xfo | X-Frame-Options Missing | A05:2021 | 🟡 Medium |
| missing-xct | X-Content-Type Missing | A05:2021 | 🟡 Medium |
| missing-xxp | X-XSS-Protection Weak | A05:2021 | 🟢 Low |
| missing-referrer-policy | Referrer-Policy Missing | A05:2021 | 🟢 Low |
| permissions-policy | Permissions-Policy Missing | A05:2021 | 🟢 Low |
| server-version | Server Version Disclosed | A05:2021 | 🟢 Low |
| trace-method | HTTP TRACE Enabled | A05:2021 | 🟡 Medium |
| old-dep | Outdated Dependencies | A06:2021 | 🟡 Medium |
| cdn-unknown | Unknown Third-Party Scripts | A06:2021 | 🟡 Medium |
| autocomplete-password | Password Autocomplete Enabled | A07:2021 | 🟠 High |
| weak-auth | Weak Authentication | A07:2021 | 🟠 High |
| no-sri | Scripts Without SRI | A08:2021 | 🟡 Medium |
| no-security-page | Missing security.txt | A09:2021 | ℹ️ Info |
| ssrf-risk | SSRF Risk via URL Params | A10:2021 | 🟠 High |

### OWASP Top 10 2025 New Checks

| ID | Title | OWASP | Severity |
|----|-------|-------|----------|
| suspicious-cdn | Unverified Third-Party Script | A03:2025 | 🟠 High |
| error-stack-exposed | Error/Stack Information Exposed | A10:2025 | 🟠 High |
| missing-error-boundary | Missing Error Boundaries | A10:2025 | 🟡 Medium |
| fail-open | Fail-Open Authentication | A10:2025 | 🔴 Critical |
| permissions-policy-weak | Weak Permissions-Policy | A05:2025 | 🟢 Low |

---

## Severity Levels

| Level | Color | Description |
|-------|-------|-------------|
| Critical | 🔴 | Immediate action required. Likely exploited or highly exploitable. |
| High | 🟠 | Serious vulnerability. Should be fixed urgently. |
| Medium | 🟡 | Moderate risk. Fix when possible. |
| Low | 🟢 | Minor issue or informational. Low exploitability. |
| Info | ℹ️ | Informational. Not a vulnerability per se. |

---

## False Positives

VibeChecker aims to minimize false positives but some may occur:

- **SEC-001:** May flag example API keys in documentation
- **SEC-007:** May flag legitimate logging statements
- **WEB-001:** Some sites intentionally don't use CSP for compatibility

Always verify findings manually before taking action.

---

## CWE Reference

| CWE | Description |
|-----|-------------|
| CWE-79 | Cross-site Scripting (XSS) |
| CWE-89 | SQL Injection |
| CWE-95 | Eval Injection |
| CWE-116 | Improper Encoding or Escaping of Output |
| CWE-200 | Exposure of Sensitive Information |
| CWE-259 | Hard-coded Password |
| CWE-307 | Improper Restriction of Excessive Authentication Attempts |
| CWE-320 | Key Management Errors |
| CWE-346 | Origin Validation Error (CORS) |
| CWE-347 | Improper Verification of Cryptographic Signature |
| CWE-352 | Cross-Site Request Forgery (CSRF) |
| CWE-489 | Debug Mode Enabled |
| CWE-552 | Files or Directories Accessible by External Parties |
| CWE-693 | Protection Mechanism Not Used |
| CWE-755 | Improper Handling of Exceptional Conditions |
| CWE-798 | Use of Hard-coded Credentials |
| CWE-942 | Permissive Cross-Domain White List |
| CWE-1021 | Restriction of Rendered UI Layer or Frame |
| CWE-1359 | Information Exposure |

---

## Rule Updates

Rules are updated regularly based on:
- New vulnerability patterns
- OWASP Top 10 updates
- Community contributions
- CVE databases (NVD, OSV)

Last updated: 2026-04-18
