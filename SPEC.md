# VibeCode Scanner MVP - Specification

## Release: v0.1.0 (MVP)

---

## 1. Overview

**Goal:** Ship a functional Vibe Coding Security Scanner with landing page in the shortest time possible.

**Scope:** 
- Landing page with value proposition
- GitHub repository scanner (public repos only)
- Website scanner (public URLs only)
- Results page with findings and remediation
- No authentication required for MVP

**Success Criteria:**
- User can scan a GitHub repo or website in < 60 seconds
- Results show severity-rated findings
- Each finding has clear remediation steps
- Works on mobile and desktop

---

## 2. Visual Specification

### Color Palette
```css
--background: #0a0a0a (near black)
--foreground: #fafafa (off-white)
--primary: #22c55e (green-500, "hacker" vibe)
--primary-foreground: #000000
--accent: #22d3ee (cyan-400)
--destructive: #ef4444 (red-500)
--warning: #f59e0b (amber-500)
--muted: #27272a (zinc-800)
--card: #18181b (zinc-900)
```

### Typography
- **Headings:** JetBrains Mono (monospace, hacker aesthetic)
- **Body:** Inter (clean, readable)
- **Code:** Fira Code

### Layout
- Single page landing with scanner embedded
- Dark theme default
- Responsive: mobile-first

---

## 3. Page Structure

### Landing Page (`/`)

**Hero Section:**
- Headline: "Ship faster. Audit smarter."
- Subheadline: "Free security scanner for vibe-coded apps. Find critical vulnerabilities before they become breaches."
- CTA: "Start Scanning" (scrolls to scanner)
- Badge: "50+ Security Checks • Free Forever"

**Scanner Section:**
- Tab toggle: "GitHub" | "Website"
- GitHub input: Repository URL field + "Scan Repository" button
- Website input: Website URL field + "Scan Website" button
- Loading state: Animated terminal with scan progress
- Results: Embedded below or in modal

**Features Section:**
- 3-column grid
- Feature 1: "Instant Results" - Get findings in seconds
- Feature 2: "No Signup" - Start scanning immediately  
- Feature 3: "Actionable Fixes" - Copy-paste remediation

**Pricing Preview:**
- Free tier card: 3 scans/day, basic checks
- Pro tier card: $19/mo, unlimited, OWASP, PDF reports
- "Coming Soon" badge on Pro

**Footer:**
- Links: GitHub, Twitter, Privacy, Terms
- Copyright: © 2026 VibeCode Scanner

### Results Page (`/scan/results/[id]`)

**Summary Header:**
- Scan type badge (GitHub/Website)
- Target URL
- Scan date
- Overall severity indicator (Critical/High/Medium/Low counts)

**Findings List:**
- Grouped by severity (Critical first)
- Each finding card shows:
  - Severity badge (color-coded)
  - Rule ID (e.g., SEC-001)
  - Title
  - Description
  - File path + line number (if applicable)
  - Code snippet (if applicable)
  - Remediation steps
  - Reference links

**Actions:**
- "Scan Another" button
- "Share Results" (copy link)
- "Download PDF" (disabled in MVP, Phase 2)

---

## 4. Functionality Specification

### GitHub Scanner

**Supported URLs:**
- `https://github.com/owner/repo`
- `https://github.com/owner/repo/tree/branch` (specific branch)

**Process:**
1. Parse URL → extract owner/repo/branch
2. Fetch repo tree via GitHub API (recursive)
3. Filter to code files (ts, js, py, go, java, etc.)
4. For each file, fetch content and run pattern matches
5. Aggregate findings
6. Return results

**Limits:**
- Max 1000 files scanned
- Timeout: 60 seconds
- Skip: node_modules, .git, binaries, >1MB files

**Rules to Implement (MVP):**
| ID | Title | Severity | OWASP |
|----|-------|----------|-------|
| SEC-001 | API Key Detected | Critical | CWE-798 |
| SEC-002 | Private Key Detected | Critical | CWE-320 |
| SEC-003 | .env File Exposed | Critical | CWE-552 |
| SEC-004 | Hardcoded Password | High | CWE-259 |
| SEC-006 | Eval Usage | High | CWE-95 |
| SEC-007 | Console.log Debug Statement | Low | CWE-489 |
| SEC-008 | SQL Injection Pattern | Critical | A03:2021 |
| SEC-009 | XSS Vulnerability Pattern | High | A03:2021 |
| SEC-010 | CORS Misconfiguration | High | A01:2021 |
| SEC-011 | Vue Devtools Enabled | High | CWE-489 |
| SEC-012 | React DevTools Enabled | High | CWE-489 |
| SEC-013 | Angular Debug Tools | High | CWE-489 |
| SEC-014 | .git Directory Exposed | Critical | CWE-552 |
| SEC-015 | Debug Mode Enabled | High | CWE-489 |
| SEC-016 | Local .env Reference | Critical | CWE-552 |
| SEC-017 | Config File Secrets | Critical | CWE-552 |
| SEC-018 | X-Content-Type-Options Disabled | Medium | CWE-693 |
| SEC-019 | Debug Env Variables | Low | CWE-489 |
| AUTH001 | JWT Algorithm Confusion | Critical | A07:2021 |
| RATE001 | Rate Limiting Disabled | High | A07:2021 |
| CSRF001 | Missing CSRF Protection | Critical | A07:2021 |
| CORS002 | CORS Credentials Wildcard | Critical | A01:2021 |
| ERRHAND001 | Exposed Stack Trace | High | A10:2025 |
| ERRHAND002 | Exception Handler Disabled | High | A10:2025 |
| SUPABASE001 | Exposed Supabase Credentials | Critical | A01:2021 |
| SUPABASE-RLS001 | Table Without RLS Enabled | Critical | A01:2021 |
| SUPABASE-RLS002 | Overly Permissive RLS Policy | High | A01:2021 |
| SUPABASE-RLS003 | Service Role Key Exposed | Critical | A01:2021 |
| SUPABASE-RLS004 | Anon Key in Server Context | High | A01:2021 |
| SUPABASE-RLS005 | Missing User Ownership Check | High | A01:2021 |
| LOVABLE001 | Lovable Supabase Without RLS | High | A01:2021 |
| LOVABLE002 | Lovable Unprotected API Routes | High | A01:2021 |
| BOLT001 | Bolt SvelteKit Without Auth | High | A01:2021 |
| BOLT002 | Bolt PUBLIC_ Prefix Secrets | High | A02:2021 |
| CURSOR001 | Cursor Next.js Without Auth | High | A01:2021 |
| CURSOR002 | Cursor Middleware Issues | Medium | A01:2021 |
| V0001 | v0 dangerouslySetInnerHTML | High | A03:2021 |
| V0002 | v0 Server Actions Without Auth | High | A01:2021 |
| REPLIT001 | Replit Secrets in .replit | Critical | CWE-552 |
| REPLIT002 | Replit Express Without Auth | High | A01:2021 |
| SUPPLY001 | Slopsquatting Risk | High | A03:2025 |
| SUPPLY001-TYPO | Typo-squatting Package | High | A03:2025 |
| SUPPLY002 | Unpinned Dependencies | Medium | A06:2021 |
| SUPPLY003 | Shell Injection in npm Scripts | Critical | A03:2025 |
| SUPPLY004 | .npmrc Contains Credentials | Critical | A03:2025 |
| SUPPLY005 | Lock File Missing | Medium | A06:2021 |
| DEP001 | Known Vulnerable Package | Medium | A06:2021 |
| DEP002 | Dev Dependencies in Prod | Medium | A06:2021 |
| SUPPLY006 | Actions Secrets May Be Logged | High | A03:2025 |
| SUPPLY007 | Malicious npm Postinstall | Critical | A03:2025 |
| SUPPLY008 | Suspicious Test Package | High | A03:2025 |
| SUPPLY009 | Non-default npm Registry | High | A03:2025 |

### Website Scanner

**Supported URLs:**
- Any valid HTTPS URL
- HTTP allowed but flagged

**Process:**
1. Fetch HTML at URL
2. Extract response headers
3. Run header security checks
4. Check for exposed paths (/admin, /.env, etc.)
5. Return results

**Limits:**
- Timeout: 30 seconds
- Max 10 path checks
- No subdomain enumeration

**Rules to Implement (MVP):**
| ID | Title | Severity |
|----|-------|----------|
| WEB-001 | Missing CSP Header | Medium |
| WEB-002 | Missing HSTS Header | High |
| WEB-003 | X-Frame-Options Missing | Medium |
| WEB-004 | .env File Accessible | Critical |
| WEB-005 | .git Directory Accessible | High |
| WEB-006 | Admin Panel Exposed | High |
| WEB-007 | Debug Endpoints Exposed | High |
| WEB-008 | Mixed Content Issues | Medium |

### Error Handling

| Error | User Message |
|-------|--------------|
| Invalid URL | "Please enter a valid GitHub repository or website URL" |
| Private repo | "This repository is private. VibeCode Scanner can only scan public repos." |
| Rate limited | "GitHub rate limit reached. Please wait a few minutes." |
| Scan timeout | "Scan timed out. The repository might be too large. Try a smaller repo." |
| Website unreachable | "Could not reach the website. Please check the URL." |
| No findings | "No security issues found! 🎉 (but double-check manually)" |

---

## 5. Technical Constraints

- **No authentication** for MVP
- **Supabase Database** (Phase 2 - IMPLEMENTED) - PostgreSQL via Supabase
  - Stores websites, scans, and scan_findings
  - Row Level Security enabled for public access
- **Rate limiting:** 10 requests/minute per IP (hardcoded)
- **No PDF generation** in MVP
- **No user accounts**

---

## 6. File Structure

```
src/
├── utils/
│   └── supabase/
│       ├── client.ts           # Browser client
│       ├── server.ts           # Server component client
│       └── middleware.ts        # Middleware helper
├── middleware.ts               # Supabase session refresh
├── app/
│   ├── page.tsx                 # Landing + Scanner
│   ├── layout.tsx               # Root layout with fonts
│   ├── globals.css              # Tailwind + custom CSS
│   └── api/
│       ├── scan/
│       │   ├── github/
│       │   │   └── route.ts     # POST handler
│       │   └── website/
│       │       └── route.ts     # POST handler
│       └── stats/
│           └── route.ts         # GET/POST scan stats to Supabase
├── components/
│   ├── Scanner.tsx              # Main scanner component
│   ├── ScanForm.tsx             # URL input form
│   ├── ScanResults.tsx          # Results display
│   ├── FindingCard.tsx          # Individual finding
│   ├── SeverityBadge.tsx        # Critical/High/Medium/Low
│   ├── Hero.tsx                 # Landing hero
│   ├── Features.tsx             # Features grid
│   ├── Pricing.tsx              # Pricing preview
│   └── Footer.tsx
└── lib/
    ├── scanners/
    │   ├── github.ts
    │   ├── website.ts
    │   └── rules/
    │       ├── index.ts         # All rules (~64 rules)
    │       └── patterns.ts      # Regex patterns
    └── utils.ts                 # Helpers
```

---

## 7. Dependencies (MVP)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@octokit/rest": "^20.0.0",
    "zod": "^3.22.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

---

## 8. Out of Scope (MVP)

- [ ] User authentication
- [ ] Database storage
- [ ] PDF reports
### OWASP Top 10 2021 & 2025 Coverage (Phase 2 - IMPLEMENTED)

- [x] **A01:2021 Broken Access Control** - RLS checks, CORS, IDOR, directory traversal
- [x] **A02:2021 Cryptographic Failures** - HTTPS checks, mixed content, weak SSL
- [x] **A03:2021 Injection** - SQL injection, XSS (stored, reflected, DOM), cmd injection
- [x] **A04:2021 Insecure Design** - Debug endpoints, rate limiting
- [x] **A05:2021 Security Misconfiguration** - CSP, HSTS, X-Frame-Options, headers
- [x] **A06:2021 Vulnerable Components** - Dependency checks, SRI, CVE detection
- [x] **A07:2021 Auth Failures** - JWT, CSRF, weak auth, rate limiting
- [x] **A08:2021 Software Integrity** - SRI, supply chain checks
- [x] **A09:2021 Logging Failures** - security.txt detection
- [x] **A10:2021 SSRF** - URL parameter checks
- [x] **A03:2025 Supply Chain Failures** - Slopsquatting, typosquatting, npm scripts
- [x] **A10:2025 Mishandling of Exceptional Conditions** - Error boundaries, fail-open
- [ ] History/scans dashboard
- [ ] Pro tier features
- [ ] Email capture
- [ ] Payment processing
- [ ] API access
- [ ] Team features

---

## 9. Testing Checklist

- [ ] Scan public GitHub repo → results display
- [ ] Scan private GitHub repo → error message
- [ ] Scan invalid URL → validation error
- [ ] Scan website → results display
- [ ] All 8 GitHub rules fire correctly on test repo
- [ ] All 8 Website rules fire correctly on test site
- [ ] Loading state shows during scan
- [ ] Error states handled gracefully
- [ ] Mobile responsive
- [ ] Page loads < 3 seconds
