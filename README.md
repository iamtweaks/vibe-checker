# VibeChecker 🔍

**Free Vibe Coding Security Scanner & Solo Founder Tools**

[![Deploy with Dokploy](https://img.shields.io/badge/Deploy-Dokploy-blue)](https://dokploy.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> *Ship faster. Audit smarter.*

VibeChecker is a free security scanner designed for solo founders and developers building apps with vibe-coding tools (Lovable, Cursor, Bolt, v0, etc.). Find critical vulnerabilities before they become breaches.

## ✨ Features

### Security Scanner
- **GitHub Repository Scanner** - Scan public repos for exposed secrets, vulnerable patterns, and security misconfigurations
- **Website Scanner** - Analyze websites for missing security headers, exposed paths, and vulnerabilities
- **50+ Security Checks** - Coverage including OWASP Top 10 patterns
- **Instant Results** - Get actionable findings in seconds
- **No Signup Required** - Start scanning immediately, no account needed

### Solo Founder Tools (Coming Soon)
- Startup Cost Calculator
- Pricing Calculator
- Burn Rate Calculator
- Invoice Generator

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/iamtweaks/vibe-checker.git
cd vibe-checker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy with Dokploy

1. Connect your GitHub repository to [Dokploy](https://dokploy.com)
2. Configure the build settings:
   - **Build Command:** `npm run build`
   - **Node Version:** `20`
   - **Output Directory:** `standalone`
3. Add environment variables (if needed):
   - `GITHUB_TOKEN` - Optional, for higher GitHub API rate limits
4. Deploy!

## 📁 Project Structure

```
vibe-checker/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx        # Root layout
│   │   └── api/               # API routes
│   ├── components/            # React components
│   └── lib/                   # Utilities & scanners
├── docs/                      # Documentation
├── SPEC.md                    # MVP Specification
├── PRD.md                     # Product Requirements
├── ARCHITECTURE.md            # Technical Architecture
└── README.md
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [SPEC.md](SPEC.md) | MVP specification and feature details |
| [PRD.md](PRD.md) | Product requirements and vision |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Technical architecture and design |
| [docs/scan-rules.md](docs/scan-rules.md) | Security rules and detection patterns |

## 🛡️ Security Rules

### GitHub Scanner Rules

| Rule ID | Description | Severity |
|---------|-------------|----------|
| SEC-001 | API Key Detected | 🔴 Critical |
| SEC-002 | Private Key Detected | 🔴 Critical |
| SEC-003 | .env File Exposed | 🔴 Critical |
| SEC-004 | Hardcoded Password | 🟠 High |
| SEC-005 | Outdated Dependency | 🟡 Medium |
| SEC-006 | Eval Usage | 🟠 High |
| SEC-007 | Console.log Debug | 🟢 Low |
| SEC-008 | SQL Injection Pattern | 🔴 Critical |
| SEC-009 | XSS Vulnerability | 🟠 High |
| SEC-010 | CORS Misconfiguration | 🟡 Medium |

### Website Scanner Rules

| Rule ID | Description | Severity |
|---------|-------------|----------|
| WEB-001 | Missing CSP Header | 🟡 Medium |
| WEB-002 | Missing HSTS Header | 🟠 High |
| WEB-003 | X-Frame-Options Missing | 🟡 Medium |
| WEB-004 | .env File Accessible | 🔴 Critical |
| WEB-005 | .git Directory Accessible | 🟠 High |
| WEB-006 | Admin Panel Exposed | 🟠 High |
| WEB-007 | Debug Endpoints | 🟠 High |
| WEB-008 | Mixed Content | 🟡 Medium |

## 💰 Pricing

| Feature | Free | Pro |
|---------|------|-----|
| Scans per day | 3 | Unlimited |
| GitHub Scanner | ✅ | ✅ |
| Website Scanner | ✅ | ✅ |
| OWASP Top 10 | Limited | Full |
| PDF Reports | - | ✅ |
| Scan History | - | ✅ |
| API Access | - | ✅ |
| **Price** | **Free** | **$19/mo** |

## 🔧 Development

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Environment Variables

```env
# Optional - for higher GitHub API rate limits
GITHUB_TOKEN=ghp_xxxx

# Not required for MVP
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Inspired by [Notelon.ai](https://notelon.ai/) - The original vibe coding security scanner
- Built with Next.js, Tailwind CSS, and love
- Security rules based on OWASP Top 10 and industry best practices

---

**Made for solo founders who ship fast.** 🚀
