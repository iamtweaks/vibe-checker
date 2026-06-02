# OWASP Top 10 Coverage Map - VibeChecker

## Overview
This document tracks OWASP Top 10 2021 and 2025 coverage for VibeChecker scanner.

## OWASP Top 10 2021

| Category | Rule IDs | Status | Coverage |
|----------|----------|--------|----------|
| **A01 Broken Access Control** | idor, directory-traversal, cors-misconfig | ✅ Done | Partial |
| **A02 Cryptographic Failures** | https-missing, mixed-content, weak-ssl | ✅ Done | Good |
| **A03 Injection** | sql-injection, xss-*, cmd-injection, ldap-injection | ✅ Done | Good |
| **A04 Insecure Design** | debug-endpoint, missing-rate-limit | ✅ Done | Partial |
| **A05 Security Misconfiguration** | missing-csp, missing-xfo, headers, permissions | ✅ Done | Good |
| **A06 Vulnerable Components** | old-dep, cdn-unknown | ⚠️ Partial | Needs enhancement |
| **A07 Auth Failures** | autocomplete-password, weak-auth | ✅ Done | Good |
| **A08 Software Integrity** | no-sri, sri-not-used | ✅ Done | Good |
| **A09 Logging & Monitoring** | no-security-page | ✅ Done | Good |
| **A10 SSRF** | ssrf-risk | ✅ Done | Good |

## OWASP Top 10 2025

| Category | Rule IDs | Status | Coverage |
|----------|----------|--------|----------|
| **A01 Broken Access Control** | (same as 2021 + new patterns) | ✅ | Enhanced |
| **A02 Cryptographic Failures** | (same as 2021) | ✅ | Good |
| **A03 Software Supply Chain Failures** | suspicious-cdn, supply-chain-* | ⚠️ Partial | **NEEDS WORK** |
| **A04 Insecure Design** | (same as 2021) | ✅ | Good |
| **A05 Security Misconfiguration** | +missing-coop, +missing-corp, +missing-coep | ✅ | Good |
| **A06 Vulnerable Components** | (same as 2021) | ⚠️ Partial | **NEEDS WORK** |
| **A07 Auth Failures** | (same as 2021) | ✅ | Good |
| **A08 Software & Data Integrity Failures** | no-sri, sri-not-used | ✅ | Good |
| **A09 Security Logging Failures** | (same as 2021) | ✅ | Good |
| **A10 Mishandling of Exceptional Conditions** | error-stack-exposed, missing-error-boundary, fail-open | ✅ | Good |

---

## Critical Gaps to Fill

### 1. SUPABASE RLS Scanner (NEW)
**Priority:** Critical  
**Why:** 10.3% of Lovable apps have critical RLS flaws (per security audit)

```typescript
// Patterns to detect:
- Tables without RLS enabled
- Policies that allow SELECT to authenticated users without proper filtering
- Service role key exposed (allows bypass of RLS)
- Missing row-level security in supabase schema
```

### 2. Supply Chain Scanner (A03:2025)
**Priority:** Critical  
**Why:** AI-built apps commonly use hallucinated packages

```typescript
// Patterns to detect:
- package.json with unverified package names
- Unpinned dependencies (no exact versions)
- Dependencies from untrusted registries
- Scripts in package.json that execute unexpected commands
```

### 3. Vibe-Coded Builder Patterns (NEW)
**Priority:** High  
**Why:** AI builders have common insecure patterns

```typescript
// Patterns specific to each builder:

// Lovable patterns:
- supabase.ts without RLS check
- Generated middleware without auth validation
- Cursor patterns (Next.js with loose API routes)

// Bolt patterns:
- Svelte/SvelteKit with exposed env vars
- Unprotected +server.ts routes

// v0 patterns:
- React with dangerouslySetInnerHTML patterns
- Missing auth middleware

// Replit patterns:
- .replit or replit.nix exposing secrets
- Express routes without auth
```

### 4. A06 Vulnerable Components Enhanced
**Priority:** High  
**Why:** Need npm audit integration

```typescript
// Patterns to detect:
- Known CVEs by package version
- Outdated major versions
- Packages with known security advisories
```

---

## Implementation Roadmap

1. [ ] Add Supabase RLS Policy Scanner
2. [ ] Enhance Supply Chain scanner (A03:2025)
3. [ ] Add Vibe-coded builder specific patterns
4. [ ] Implement dependency vulnerability check
5. [ ] Add all rules to docs/scan-rules.md
6. [ ] Update SPEC.md with new capabilities