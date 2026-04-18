# VibeChecker Architecture

Documentation of the VibeChecker security scanner architecture.

---

## Overview

VibeChecker is a free security scanner for vibe-coded applications (built with tools like Lovable, Bolt.new, v0.dev, Cursor). It provides instant security analysis for GitHub repositories and websites, detecting critical vulnerabilities including OWASP Top 10 2025 categories.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main landing page with Scanner component
│   ├── layout.tsx            # Next.js root layout
│   └── api/
│       └── scan/
│           ├── github/
│           │   └── route.ts  # GitHub repo scan API endpoint
│           └── website/
│               └── route.ts  # Website scan API endpoint
└── lib/
    ├── types.ts              # Shared TypeScript interfaces
    ├── validation.ts         # Input validation utilities
    ├── pdf.ts                # PDF report generation
    └── scanners/
        ├── website.ts        # Website security scanner
        ├── github.ts         # GitHub repo scanner
        └── rules/
            └── index.ts      # GitHub scanning rules
```

---

## Scanner Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│                   (page.tsx - Scanner)                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │ POST /api/scan/{type}
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API ROUTE (route.ts)                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ Rate Limiter    │  │ Input          │  │ CORS           │    │
│  │ (checkRate     │  │ Validation     │  │ Headers        │    │
│  │  Limit)        │  │ (validation.ts)│  │               │    │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘    │
│          │                  │                   │               │
│          │          ┌───────▼────────┐          │               │
│          │          │ Validate URL  │◄─────────┘               │
│          │          │ Return result │                            │
│          │          └───────────────┘                            │
└──────────┼─────────────────────────────────────────────────────┘
           │ valid URL
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SCANNER (scanners/)                           │
│                                                                  │
│  For GitHub:                   For Website:                      │
│  ┌─────────────┐              ┌─────────────┐                    │
│  │ fetchRepo  │              │ fetch()     │                    │
│  │ Tree()     │              │ website    │                    │
│  └──────┬─────┘              └──────┬─────┘                    │
│         │ files                    │ HTML + headers             │
│         ▼                          ▼                            │
│  ┌─────────────┐              ┌─────────────┐                    │
│  │ scanContent│              │ SECURITY_  │                    │
│  │ (rules/)   │              │ CHECKS loop│                    │
│  └──────┬─────┘              └──────┬─────┘                    │
│         │ findings                 │ findings                  │
│         └──────────┬───────────────┘                            │
│                    ▼                                            │
│           ┌─────────────────┐                                   │
│           │ Build severity   │                                   │
│           │ counts          │                                   │
│           └─────────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
           │ ScanResult
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PDF Generator                              │
│                    (lib/pdf.ts)                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ Header         │  │ Summary Box    │  │ Findings List  │    │
│  │ (VibeChecker)  │  │ (severity      │  │ (sorted by    │    │
│  │                │  │  counts)       │  │  severity)     │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Checks (Website Scanner)

The website scanner runs **45+ security checks** organized by OWASP Top 10 categories:

| Category | Checks | Examples |
|----------|--------|----------|
| **A01:2021** - Broken Access Control | IDOR, Directory Traversal, CORS Misconfig | Direct object references, path traversal |
| **A02:2021** - Cryptographic Failures | HTTPS Missing, Mixed Content, Weak SSL | HTTP-only sites, mixed resource loading |
| **A03:2021** - Injection | XSS (Stored/Reflected/DOM), SQL Injection, Cmd Injection | Form input sanitization, eval usage |
| **A04:2021** - Insecure Design | Debug Endpoints, Missing Rate Limiting | Stack traces, no brute-force protection |
| **A05:2021** - Security Misconfiguration | Missing CSP, X-Frame-Options, Server Version | Missing security headers |
| **A06:2021** - Vulnerable Components | Old Dependencies, Unknown CDNs | jQuery 1.x, unverified third-party scripts |
| **A07:2021** - Auth Failures | Password Autocomplete, Weak Auth | No MFA, form without protection |
| **A08:2021** - Software Integrity | Missing SRI | External scripts without integrity hashes |
| **A09:2021** - Logging & Monitoring | Missing Security.txt | No security disclosure policy |
| **A10:2021** - SSRF | SSRF via URL Params | URL parameters accepting user input |
| **A03:2025** - Supply Chain | Suspicious CDN, Unknown Scripts | Unverified third-party scripts |
| **A05:2025** - Security Misconfiguration | Missing COOP/CORP/COEP | Cross-origin isolation headers |
| **A10:2025** - Mishandling of Exceptions | Error Stack Exposed, Missing Error Boundaries | Stack traces, no React ErrorBoundary |

---

## GitHub Scanner Rules

The GitHub scanner detects **13 types of vulnerabilities** in source code:

| Rule ID | Severity | Description |
|---------|----------|-------------|
| SUPABASE001 | CRITICAL | Exposed Supabase credentials in code |
| CSRF001 | CRITICAL | Missing CSRF protection |
| SUPPLY001 | HIGH | Suspicious package name (slopsquatting) |
| ERRHAND001 | HIGH | Exposed stack trace in code |
| SEC-001 | CRITICAL | API key detected |
| SEC-002 | CRITICAL | Private key in source code |
| SEC-003 | CRITICAL | .env file reference |
| SEC-004 | HIGH | Hardcoded password |
| SEC-006 | HIGH | Eval usage |
| SEC-007 | LOW | Console statement |
| SEC-008 | CRITICAL | SQL injection pattern |
| SEC-009 | HIGH | XSS vulnerability pattern |
| SEC-010 | MEDIUM | Permissive CORS configuration |

---

## Input Validation

All inputs are validated before scanning:

### Website URL Validation
- Must be valid URL format
- Must use http or https protocol
- Blocked: localhost, private IPs (10.x, 172.16-31.x, 192.168.x)
- Maximum length: 2000 characters

### GitHub URL Validation
- Must be valid GitHub URL format
- Must point to github.com
- Must contain owner/repo path

---

## Rate Limiting

In-memory rate limiting protects against abuse:

| Limit | Value |
|-------|-------|
| Requests per window | 20 |
| Window size | 60 seconds |
| Minimum interval | 500ms |
| Identifier | Client IP |

Rate limit responses include:
- `429 Too Many Requests` status
- `Retry-After` header
- `X-RateLimit-Remaining` header

---

## Error Handling

### API Error Response Format
```typescript
{
  error: string      // Human-readable error message
  code: string      // Machine-readable error code
  retryAfter?: number // For rate limit errors (ms)
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| URL_REQUIRED | 400 | No URL provided |
| URL_INVALID_FORMAT | 400 | Malformed URL |
| URL_NOT_GITHUB | 400 | Non-GitHub URL for GitHub scan |
| URL_LOCALHOST_BLOCKED | 400 | Localhost URLs not allowed |
| URL_PRIVATE_IP_BLOCKED | 400 | Private IPs not allowed |
| RATE_LIMITED | 429 | Too many requests |
| REPO_NOT_FOUND | 404 | GitHub repo doesn't exist |
| ACCESS_DENIED | 403 | Private repo or no access |
| GITHUB_RATE_LIMIT | 429 | GitHub API rate limit |
| FETCH_FAILED | 502 | Website unreachable |
| TIMEOUT | 504 | Request timed out |
| DNS_NOT_FOUND | 502 | DNS resolution failed |

---

## PDF Report Structure

Generated PDF reports include:

1. **Header** - VibeChecker branding, generation timestamp
2. **Target Info** - Scanned URL/repository
3. **Summary Box** - Severity counts by category
4. **Findings List** - Sorted by severity (critical first)
   - Severity badge
   - Title and rule ID
   - Description
   - Recommended fix (green remediation box)
5. **Footer** - Scan ID, generator attribution

---

## Design Decisions

### 1. In-Memory Rate Limiting
Using a simple Map-based rate limiter for this demo application. For production with multiple instances, consider Redis-based rate limiting.

### 2. Cheerio for HTML Parsing
Using `cheerio` instead of a full browser automation (Puppeteer/Playwright) for performance. This limits checks to static analysis only.

### 3. Octokit for GitHub API
Using `@octokit/rest` for GitHub API access. Rate limiting is handled server-side by Octokit.

### 4. No Database
Scan results are ephemeral - they're returned to the client but not stored. This keeps the service stateless and scalable.

---

## Pending Refactors

The following items are documented for future improvement:

1. **Rules Module Organization**: The `rules/index.ts` file contains both GitHub scanner rules and shared constants. Consider splitting into `rules/github.ts` and `rules/common.ts`.

2. **Security Check Registry**: The `SECURITY_CHECKS` array in `website.ts` is hardcoded. Consider loading from a configuration file for easier extension.

3. **PDF Customization**: The PDF generator uses fixed layouts. Add options for:
   - Custom header/footer
   - Finding filters
   - Export formats (JSON, CSV)

4. **Parallel File Scanning**: The GitHub scanner processes files sequentially. For large repos, consider parallel processing with concurrency limits.

5. **Client-Side Rate Limiting**: Currently only server-side rate limiting exists. Consider adding a client-side debounce/throttle.

6. **Scanner Middleware**: API routes share similar patterns (CORS, rate limiting, validation). Consider extracting to shared middleware.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `next` | React framework |
| `cheerio` | HTML parsing |
| `@octokit/rest` | GitHub API |
| `jspdf` | PDF generation |
| `lucide-react` | Icons |
