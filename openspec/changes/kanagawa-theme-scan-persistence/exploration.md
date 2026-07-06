## Exploration: Kanagawa theme, OWASP scanner research, and persistent vulnerability storage

### Current State
The app is currently styled with a mostly green/emerald visual system: `src/app/page.tsx`, `src/app/globals.css`, and `src/app/layout.tsx` hardcode the palette and motion effects, while `tailwind.config.ts` only defines fonts. The scanner is already split between website and GitHub paths, with broad heuristic rules in `src/lib/scanners/website.ts` and `src/lib/scanners/rules/index.ts`.

Persistence is fragmented. `src/app/api/scan/website/route.ts` and `src/app/api/scan/github/route.ts` write to Supabase tables (`websites`, `scans`, `scan_findings`) and dedupe stats by `rule_id`; `src/app/api/stats/route.ts` reads those tables. But `src/app/api/scans/history/route.ts` still reads a legacy Prisma/SQLite `Scan` model from `prisma/schema.prisma`, and that schema does not model the Supabase tables. So the requested “persistent database of unique vulnerabilities and scanned URLs” is only partially true today.

OWASP research should treat the official pages as source of truth: https://owasp.org/www-project-top-ten/ (current released Top 10: 2025), https://owasp.org/Top10/2025/, and https://cheatsheetseries.owasp.org/. Relevant cheat sheets for this codebase include Access Control, Authentication, Content Security Policy, Cross-Site Scripting Prevention, SQL Injection Prevention, Server Side Request Forgery Prevention, Session Management, Error Handling, and Software Supply Chain Security.

### Affected Areas
- `src/app/page.tsx` — main UI uses hardcoded emerald/slate classes and inline visual accents that need Kanagawa Dragon tokens.
- `src/app/globals.css` — global gradients, buttons, particles, shimmer, and loading states are color-coded with the current green palette.
- `tailwind.config.ts` — likely place to centralize semantic color tokens for the theme.
- `src/lib/scanners/website.ts` and `src/lib/scanners/rules/index.ts` — scanner heuristics, OWASP coverage, and rule taxonomy.
- `src/app/api/scan/website/route.ts`, `src/app/api/scan/github/route.ts`, `src/app/api/stats/route.ts`, `src/app/api/scans/history/route.ts` — current write/read paths for scans, findings, and stats.
- `src/lib/db.ts` and `prisma/schema.prisma` — legacy local database layer that currently conflicts with the Supabase-backed persistence path.
- `ARCHITECTURE.md`, `SPEC.md`, `docs/scan-rules.md` — docs drift from the current code and should be reconciled with any implementation.

### Approaches
1. **Split into three SDD changes** — separate Kanagawa Dragon theming, scanner/OWASP research, and persistence/database hardening.
   - Pros: keeps each PR under review budget, isolates risk, and matches the actual dependency boundaries.
   - Cons: requires coordination across multiple change sets.
   - Effort: Medium

2. **Single umbrella change with phased sub-tasks** — do theme, research, and database work in one PR.
   - Pros: one review thread and one deployment window.
   - Cons: too broad for the current scope, likely exceeds review budget, and mixes UI with security/data-model work.
   - Effort: High

### Recommendation
Split the work. The right order is: (1) theme refresh, (2) scanner research/rule expansion, (3) persistent vulnerability storage cleanup. The persistence piece is the highest-risk area because the codebase already has two competing storage paths (Supabase vs Prisma/SQLite), and that should be designed independently.

### Risks
- The working tree already contains unrelated uncommitted changes in scan routes, stats, middleware, and the homepage; the new work should not overwrite that WIP.
- The scanner currently mixes official OWASP 2021 guidance with newer 2025-inspired heuristics, so research needs source verification before any rule claims are promoted to product language.
- Persistence semantics are inconsistent today: unique findings are deduped in stats, but history is still split across different backends, which can lead to duplicate counts or stale records.

### Ready for Proposal
No — first tell the user this should be split into three proposals, with persistence/database handled as its own change because it affects data integrity and storage contracts.
