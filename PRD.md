# VibeChecker - Product Requirements Document (PRD)

## 1. Concept & Vision

**VibeChecker** is a free security scanner and solo founder toolkit designed to help developers and non-technical founders identify vulnerabilities in vibe-coded applications (built with tools like Lovable, Cursor, Bolt, v0, etc.). 

The platform provides instant, actionable security feedback without requiring sign-up, positioning itself as the first line of defense before paying for expensive professional audits.

**Personality:** Direct, no-BS security advice with a hint of hacker culture. We tell you what's broken and exactly how to fix it.

**Tagline:** *"Ship faster. Audit smarter."*

---

## 2. Problem Statement

Vibe coding tools have democratized app development, but they've also introduced a new class of security vulnerabilities. Common issues include:
- Exposed API keys and secrets in client-side code
- Missing security headers
- Vulnerable dependencies
- Improper CORS configurations
- Debug endpoints left in production

Solo founders often ship without security audits, leading to:
- Data breaches (as documented in the "State of Vibe Coding Security 2026" report)
- Stolen credentials and API abuse
- Compliance issues
- Reputational damage

---

## 3. Target Users

### Primary
- **Solo founders** building apps with no-code/vibe-coding tools
- **Small startups** with limited security expertise
- **Developers** wanting quick security checks before deployment

### Secondary
- **Freelancers** delivering projects to clients
- **Security professionals** doing preliminary assessments

---

## 4. Core Features

### 4.1 Vibe Coding Security Scanner (MVP)

**Input:** 
- GitHub repository URL (public repos)
- Website URL (public sites)

**Checks (50+ in Phase 1, expanding to OWASP Top 10):**

#### GitHub Scanner
- [ ] API keys / secrets in code (AWS, GitHub, OpenAI, etc.)
- [ ] Exposed .env files
- [ ] Vulnerable dependencies (outdated packages)
- [ ] Security misconfigurations in CI/CD
- [ ] Debug statements left in code
- [ ] Hardcoded credentials
- [ ] Insecure random number generation
- [ ] SQL injection patterns
- [ ] XSS vulnerability patterns
- [ ] Authentication bypass patterns

#### Website Scanner
- [ ] Missing security headers (CSP, HSTS, X-Frame-Options)
- [ ] SSL/TLS certificate issues
- [ ] Debug / admin endpoints exposed
- [ ] Open .git directories
- [ ] Sensitive paths (.env, .DS_Store)
- [ ] Missing rate limiting indicators
- [ ] Cookie security issues
- [ ] Mixed content issues

#### Output
- **Instant Results:** On-page display of findings
- **Severity Rating:** Critical, High, Medium, Low, Info
- **Actionable Fixes:** Step-by-step remediation instructions
- **Professional PDF Report:** (Premium tier - $99)

### 4.2 Solo Founder Tools (Phase 2)

Free calculators and generators:
- [ ] Startup Cost Calculator
- [ ] Pricing Calculator
- [ ] Burn Rate Calculator
- [ ] Invoice Generator
- [ ] API Key Generator

---

## 5. Monetization

### Tier Model

| Feature | Free | Pro ($19/mo) | Enterprise |
|---------|------|--------------|------------|
| GitHub Scanner | 3 scans/day | Unlimited | Unlimited |
| Website Scanner | 3 scans/day | Unlimited | Unlimited |
| OWASP Scanner | Limited | Full | Full |
| PDF Reports | 1/month | Unlimited | Unlimited |
| History | 7 days | 1 year | Unlimited |
| Team Access | - | - | 5 seats |
| API Access | - | - | Yes |

### Revenue Streams
1. **Pro Subscriptions** - $19/month
2. **Professional Audits** - $99 (outsourced to security pros)
3. **Enterprise Licenses** - Custom pricing

---

## 6. User Flow

### Free Tier Flow
1. User lands on homepage
2. Pastes GitHub URL or Website URL
3. Clicks "Scan Now"
4. System performs security checks (30-60 seconds)
5. Results displayed instantly with severity ratings
6. User can view detailed fixes or download PDF (if available)

### Paid Tier Flow
1. User signs up (email or OAuth)
2. Selects Pro plan
3. Unlimited scans + PDF reports
4. Access to scan history

---

## 7. Success Metrics

### Phase 1 (MVP)
- [ ] 100 unique scans per week
- [ ] 10% conversion to Pro
- [ ] < 5 min scan time average
- [ ] 0 critical bugs in production

### Phase 2
- [ ] 1000 unique scans per week
- [ ] State of Vibe Coding Security report published
- [ ] 50 Pro subscribers

---

## 8. Out of Scope (Phase 1)
- User accounts / authentication (Phase 2)
- Payment processing (Phase 2)
- Enterprise features
- Mobile app
- API access

---

## 9. Competitive Analysis

### Direct Competitors
- **Notelon.ai** - Inspiration, $99 audits
- **Snyk** - Enterprise focused, not free
- **OWASP ZAP** - Too technical for founders

### VibeCheck Advantage
- **Free first** - Always free tier
- **Founder-focused** - No technical jargon
- **Instant results** - No signup required
- **Actionable fixes** - Copy-paste solutions

---

## 10. Assumptions & Risks

### Assumptions
- Vibe coding tools will continue to grow
- Security awareness will increase post-2026 report
- Solo founders will pay for convenience

### Risks
- GitHub rate limiting on public APIs
- False positives causing alarm
- Competitors replicating model
- Scanning could be abused for malicious purposes
