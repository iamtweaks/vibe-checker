# VibeChecker - Technical Architecture

## 1. Tech Stack

### Core
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL (via Supabase or Dokploy Postgres)
- **ORM:** Drizzle ORM
- **Auth:** Supabase Auth (Phase 2)

### Security Scanning
- **GitHub API:** @octokit/rest for repository access
- **Web Scanning:** Custom fetch + Cheerio for HTML parsing
- **Pattern Matching:** Custom regex rules for vulnerability detection
- **PDF Generation:** @react-pdf/renderer for reports

### Infrastructure
- **Hosting:** Dokploy (self-hosted)
- **Container:** Docker via Dokploy
- **Domain:** vibe-checker.com (TBD)
- **SSL:** Auto-managed by Traefik

---

## 2. Project Structure

```
vibe-checker/
├── src/
│   ├── app/
│   │   ├── (marketing)/         # Landing page, tools pages
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── scan/
│   │   │   │   ├── page.tsx     # Scanner interface
│   │   │   │   └── results/
│   │   │   │       └── [id]/    # Results page
│   │   │   └── tools/
│   │   │       └── calculators/ # Future tools
│   │   ├── (dashboard)/         # Phase 2: User dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── scans/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── scan/
│   │   │   │   ├── github/
│   │   │   │   │   └── route.ts
│   │   │   │   └── website/
│   │   │   │       └── route.ts
│   │   │   └── auth/
│   │   │       └── [...supabase]/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn components
│   │   ├── scanner/
│   │   │   ├── ScanForm.tsx
│   │   │   ├── ScanResults.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   └── FindingCard.tsx
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   └── Pricing.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── lib/
│   │   ├── scanners/
│   │   │   ├── github.ts        # GitHub scanning logic
│   │   │   ├── website.ts       # Website scanning logic
│   │   │   └── rules/           # Detection rules
│   │   │       ├── secrets.ts
│   │   │       ├── headers.ts
│   │   │       └── patterns.ts
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── rate-limit.ts
│   │       └── validators.ts
│   └── types/
│       └── index.ts
├── prisma/ or db/
│   ├── schema.sql
│   └── migrations/
├── public/
│   └── assets/
├── tests/
│   ├── scanners/
│   └── e2e/
├── docs/
│   └── scan-rules.md
├── SPEC.md
├── README.md
├── package.json
└── next.config.ts
```

---

## 3. Data Model

### Scans Table
```sql
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('github', 'website')) NOT NULL,
  target_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'running', 'completed', 'failed')) DEFAULT 'pending',
  findings JSONB DEFAULT '[]',
  severity_counts JSONB DEFAULT '{"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}',
  user_id UUID REFERENCES auth.users,  -- Phase 2
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

### Findings Schema
```typescript
interface Finding {
  id: string;
  rule_id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  file_path?: string;
  line_number?: number;
  snippet?: string;
  remediation: string;
  references: string[];
}
```

### Users Table (Phase 2)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  scans_used_today INT DEFAULT 0,
  scans_limit INT DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. API Design

### POST /api/scan/github
**Request:**
```json
{
  "repoUrl": "https://github.com/user/repo"
}
```

**Response:**
```json
{
  "scanId": "uuid",
  "status": "completed",
  "findings": [...],
  "severityCounts": {...}
}
```

### POST /api/scan/website
**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "scanId": "uuid", 
  "status": "completed",
  "findings": [...],
  "severityCounts": {...}
}
```

### GET /api/scan/[id]
Retrieve scan results by ID.

---

## 5. GitHub Scanner Logic

### Process Flow
1. Parse GitHub URL → extract owner/repo
2. Validate repository is public
3. Fetch repository contents via GitHub API
4. Recursively scan files for patterns
5. Run security rules against file contents
6. Aggregate findings
7. Store results and return

### GitHub API Rate Limits
- Unauthenticated: 60 requests/hour
- Authenticated (PAT): 5,000 requests/hour
- Strategy: Use unauthenticated for free tier, PAT for Pro

### Scan Rules (Phase 1)
| Rule ID | Description | Severity |
|---------|-------------|----------|
| SEC-001 | API Key detected | Critical |
| SEC-002 | Private key detected | Critical |
| SEC-003 | .env file exposed | Critical |
| SEC-004 | Hardcoded password | High |
| SEC-005 | Outdated dependency | Medium |
| SEC-006 | Eval usage | High |
| SEC-007 | Debug console.log | Low |
| SEC-008 | SQL injection pattern | Critical |
| SEC-009 | XSS pattern | High |
| SEC-010 | CORS misconfiguration | Medium |

---

## 6. Website Scanner Logic

### Process Flow
1. Fetch website HTML
2. Parse response headers
3. Run header security checks
4. Scan for exposed paths/files
5. Check for common vulnerabilities
6. Aggregate findings
7. Return results

### Header Checks
| Header | Expected | Severity if Missing |
|--------|----------|---------------------|
| Content-Security-Policy | Present | Medium |
| Strict-Transport-Security | Present | High |
| X-Frame-Options | DENY or SAMEORIGIN | Medium |
| X-Content-Type-Options | nosniff | Low |
| Referrer-Policy | strict-origin-when-cross-origin | Low |

### Path Checks
- `/.env` - Sensitive
- `/.git/config` - Information disclosure
- `/admin` - Admin panel exposure
- `/debug` - Debug endpoints
- `/api-docs` - API documentation exposure

---

## 7. Scanning Rules Expansion (OWASP Top 10)

Phase 2 will implement full OWASP Top 10 checks:

1. **A01:2021 – Broken Access Control**
   - IDOR detection
   - Privilege escalation checks
   - Mass assignment patterns

2. **A02:2021 – Cryptographic Failures**
   - Weak hashing algorithms
   - Hardcoded secrets
   - Missing encryption

3. **A03:2021 – Injection**
   - SQL injection patterns
   - Command injection
   - LDAP/XPath injection

4. **A04:2021 – Insecure Design**
   - Missing rate limiting
   - Business logic flaws

5. **A05:2021 – Security Misconfiguration**
   - Default credentials
   - Debug mode enabled
   - Unnecessary features

6. **A06:2021 – Vulnerable Components**
   - CVE checking (via OSV.dev API)
   - Outdated packages

7. **A07:2021 – Authentication Failures**
   - Weak session tokens
   - Missing auth on sensitive routes

8. **A08:2021 – Software and Data Integrity Failures**
   - CI/CD misconfigurations
   - Unverified dependencies

9. **A09:2021 – Security Logging Failures**
   - Missing logging indicators
   - No audit trail

10. **A10:2021 – SSRF**
    - URL validation issues
    - Internal endpoint access

---

## 8. Rate Limiting

### Free Tier
- 3 scans per day per IP
- Rate limited via in-memory store (Upstash Redis optional)

### Pro Tier
- Unlimited scans
- Priority queue

---

## 9. Deployment (Dokploy)

### Docker Configuration
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GITHUB_TOKEN=           # Optional, for higher rate limits
DATABASE_URL=
```

### Dokploy Setup
1. Connect GitHub repo to Dokploy
2. Configure build command: `npm run build`
3. Configure start command: `npm start`
4. Set environment variables
5. Deploy to `vibe-checker` subdomain

---

## 10. Security Considerations

### Scanner Safety
- Only scan public repositories/websites
- Implement request throttling
- No subdomain enumeration (too aggressive)
- Log all scan requests for abuse detection

### Application Security
- RLS enabled on all database tables
- Input validation on all endpoints
- Rate limiting on API routes
- CSP headers configured
- No secrets in client-side code

---

## 11. Future Enhancements

- [ ] AI-powered remediation suggestions
- [ ] Integration with GitHub Actions
- [ ] Browser extension
- [ ] Slack/Discord notifications
- [ ] Team collaboration
- [ ] API access for Pro/Enterprise
- [ ] Custom rule creation
