# VibeChecker - Security Scan Rules

## Overview

VibeChecker uses pattern matching and heuristic analysis to detect security vulnerabilities in code repositories and websites. This document details all security rules implemented in the scanner.

---

## GitHub Scanner Rules

### SEC-001: API Key Detected
- **Severity:** 🔴 Critical
- **Pattern:** Matches common API key formats
- **Files Scanned:** All text files
- **Example Matches:**
  - `api_key = "sk-1234567890abcdef"`
  - `const API_KEY = process.env.OPENAI_API_KEY`
  - `apiKey: "AIzaSy..."` (Google API)
  - `Authorization: Bearer sk-...` (OpenAI)

### SEC-002: Private Key Detected
- **Severity:** 🔴 Critical
- **Pattern:** Matches RSA, AWS, and other private key headers
- **Files Scanned:** All text files
- **Example Matches:**
  - `-----BEGIN RSA PRIVATE KEY-----`
  - `-----BEGIN PRIVATE KEY-----`
  - `-----BEGIN EC PRIVATE KEY-----`

### SEC-003: .env File Exposed
- **Severity:** 🔴 Critical
- **Pattern:** .env files present in repository
- **Files Scanned:** Root and common directories
- **Note:** Checks if .env is tracked in git

### SEC-004: Hardcoded Password
- **Severity:** 🟠 High
- **Pattern:** Password assignments in code
- **Files Scanned:** All text files
- **Example Matches:**
  - `password = "admin123"`
  - `const pwd = "secret"`
  - `mysql_connect("root", "password")`

### SEC-005: Outdated Dependency
- **Severity:** 🟡 Medium
- **Pattern:** Version numbers in package files
- **Files Scanned:** package.json, requirements.txt, Gemfile, go.mod
- **Note:** Flags known-vulnerable versions

### SEC-006: Eval Usage
- **Severity:** 🟠 High
- **Pattern:** JavaScript eval(), Python eval(), eval() equivalents
- **Files Scanned:** .js, .ts, .py, .rb files
- **Example Matches:**
  - `eval(userInput)`
  - `eval(codeString)`
  - `exec(compile(ast))`

### SEC-007: Console.log Debug Statement
- **Severity:** 🟢 Low
- **Pattern:** Debug logging left in code
- **Files Scanned:** .js, .ts, .jsx, .tsx files
- **Example Matches:**
  - `console.log(...)`
  - `console.error(...)`
  - `console.debug(...)`

### SEC-008: SQL Injection Pattern
- **Severity:** 🔴 Critical
- **Pattern:** String concatenation in SQL queries
- **Files Scanned:** All code files
- **Example Matches:**
  - `"SELECT * FROM users WHERE id=" + userId`
  - `query("SELECT * FROM table WHERE name='" + name + "'")`
  - `f"SELECT * FROM users WHERE email={email}"` (Python f-string)

### SEC-009: XSS Vulnerability Pattern
- **Severity:** 🟠 High
- **Pattern:** Unescaped user input in HTML/JS context
- **Files Scanned:** .js, .ts, .jsx, .tsx, .html files
- **Example Matches:**
  - `innerHTML = userInput`
  - `document.write(html)`
  - `dangerouslySetInnerHTML` without sanitization

### SEC-010: CORS Misconfiguration
- **Severity:** 🟡 Medium
- **Pattern:** Permissive CORS settings
- **Files Scanned:** server configs, middleware files
- **Example Matches:**
  - `Access-Control-Allow-Origin: *`
  - `origin: '*'`
  - `cors({ origin: true })`

---

## Website Scanner Rules

### WEB-001: Missing Content-Security-Policy
- **Severity:** 🟡 Medium
- **Header:** Content-Security-Policy
- **Check:** Header is present and not empty
- **Remediation:** Add CSP header blocking inline scripts and unknown sources

### WEB-002: Missing HSTS Header
- **Severity:** 🟠 High
- **Header:** Strict-Transport-Security
- **Check:** Header is present with max-age > 0
- **Remediation:** Add `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### WEB-003: X-Frame-Options Missing
- **Severity:** 🟡 Medium
- **Header:** X-Frame-Options
- **Check:** Header is DENY or SAMEORIGIN
- **Remediation:** Add `X-Frame-Options: DENY` to prevent clickjacking

### WEB-004: .env File Accessible
- **Severity:** 🔴 Critical
- **Path:** /.env
- **Check:** HTTP 200 response with env content
- **Remediation:** Block .env files in web server config, remove from public directory

### WEB-005: .git Directory Accessible
- **Severity:** 🟠 High
- **Path:** /.git/config or /.git/HEAD
- **Check:** Git metadata is accessible
- **Remediation:** Block .git directory in web server, ensure it's not in public path

### WEB-006: Admin Panel Exposed
- **Severity:** 🟠 High
- **Paths:** /admin, /administrator, /wp-admin, /login, /dashboard
- **Check:** HTTP 200 on any admin path
- **Remediation:** Protect admin routes with authentication, use robots.txt to disallow

### WEB-007: Debug Endpoints Exposed
- **Severity:** 🟠 High
- **Paths:** /debug, /actuator, /health, /metrics, /graphql
- **Check:** HTTP 200 with debug/info data
- **Remediation:** Disable debug endpoints in production, restrict access

### WEB-008: Mixed Content Issues
- **Severity:** 🟡 Medium
- **Check:** Page loaded over HTTPS but contains HTTP resources
- **Remediation:** Update all resource URLs to HTTPS

---

## Severity Levels

| Level | Color | Description |
|-------|-------|-------------|
| Critical | 🔴 | Immediate action required. Likely exploited or highly exploitable. |
| High | 🟠 | Serious vulnerability. Should be fixed urgently. |
| Medium | 🟡 | Moderate risk. Fix when possible. |
| Low | 🟢 | Minor issue or informational. Low exploitability. |

---

## False Positives

VibeChecker aims to minimize false positives but some may occur:

- **SEC-001:** May flag example API keys in documentation
- **SEC-007:** May flag legitimate logging statements
- **WEB-001:** Some sites intentionally don't use CSP for compatibility

Always verify findings manually before taking action.

---

## Rule Updates

Rules are updated regularly based on:
- New vulnerability patterns
- OWASP Top 10 updates
- Community contributions
- CVE databases (NVD, OSV)

Last updated: 2026-04-15
