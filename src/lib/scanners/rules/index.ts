export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface Finding {
  id: string
  ruleId: string
  severity: Severity
  title: string
  description: string
  filePath?: string
  lineNumber?: number
  snippet?: string
  remediation: string
}

export interface ScanRule {
  id: string
  pattern: RegExp
  severity: Severity
  title: string
  description: string
  remediation: string
}

// GitHub Scanner Rules
// Common Supabase/AI backend credential patterns (checked per file path + content)
export const SUPABASE_FILE_PATTERNS = [
  /\.env(?:\.local|\.development|\.production)?$/i,
  /supabase\.ts$/i,
  /supabase[\/.\\]client/i,
  /lib[\/.\\]supabase/i,
  /[\/.\\]config\.ts$/i,
  /[\/.\\]config\.js$/i,
]

export function checkSupabaseCredentials(content: string, filePath: string): boolean {
  const hasSupabaseFile = SUPABASE_FILE_PATTERNS.some(p => p.test(filePath))
  if (!hasSupabaseFile) return false
  // Simple string-based detection for Supabase keys (avoids regex literal issues)
  const lower = content.toLowerCase()
  const indicators = [
    'supabase_anon_key',
    'supabase_service_role_key',
    'supabase_api_key',
    'sb_',
    'anon key',
    'service_role',
  ]
  const hasIndicator = indicators.some(i => lower.includes(i))
  if (!hasIndicator) return false
  // Check for JWT-like patterns (base64 encoded)
  const jwtPattern = /[a-zA-Z0-9_-]{50,}\.eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g
  const hasJwt = jwtPattern.test(content)
  // Check for long base64-like strings that could be keys
  const longKeyPattern = /["'][a-zA-Z0-9_\-]{40,}["']/g
  const hasLongKey = longKeyPattern.test(content)
  return hasJwt || hasLongKey
}

export const GITHUB_SCANNER_RULES: ScanRule[] = [
  {
    id: 'SUPABASE001',
    pattern: /(?:SUPABASE|supabase)[_-]?(?:ANON|SERVICE[_-]?ROLE|KEY|URL)[^\n]{0,50}["\'][a-zA-Z0-9_\-]{20,}["\']/gi,
    severity: 'critical',
    title: 'Exposed Supabase Credentials',
    description: 'Hardcoded Supabase API keys or service role keys found in source code. This allows full database access bypassing RLS policies.',
    remediation: 'Use environment variables: process.env.SUPABASE_KEY. Never commit Supabase anon/service keys to version control. Add .env to .gitignore and use a secrets manager for production.',
  },
  {
    id: 'CSRF001',
    pattern: /(?:csrf|_csrf|xsrf|xsrf-token|csrftoken)[^\n]{0,50}?(?:missing|not.?found|no.?token|undefined|null)/gi,
    severity: 'critical',
    title: 'Missing CSRF Protection',
    description: 'Potential missing CSRF protection detected. Forms or state-changing operations may be vulnerable to Cross-Site Request Forgery attacks. Found in 70% of vibe-coded apps.',
    remediation: 'Implement CSRF tokens for all state-changing requests. Use the SameSite=Strict/Lax cookie attribute. Libraries like csurf (Express) or built-in framework CSRF protection can help.',
  },
  {
    id: 'SUPPLY001',
    pattern: /(?:"dependencies"|'dependencies')[\s\S]{0,3000}?"(?!node_modules|npm|typescript|react|next|vite|webpack|eslint|prettier|tailwind|@)[a-zA-Z0-9@_+./-]{1,50}"[\s:]+["0-9^~>=<.\-]+/gi,
    severity: 'high',
    title: 'Suspicious Package Name (Slopsquatting Risk)',
    description: 'A package dependency name looks suspicious — it may be an AI-hallucinated package name (slopsquatting). Attackers can register these non-existent package names to inject malware when developers run npm install.',
    remediation: 'Verify each dependency exists in the official npm registry (npmjs.com). Remove unknown packages. Use package-lock.json to lock versions. Consider using tools like npm-audit or Snyk to validate dependencies.',
  },
  {
    id: 'ERRHAND001',
    pattern: /(?:stack[_-]?trace|stacktrace|error[_-]?stack|exception[_-]?trace)[^\n]{0,100}?(?:in|at|on|line)[^\n]{0,50}?\.(?:js|ts|tsx|jsx|py|rb|go|java|cs|php)/gi,
    severity: 'high',
    title: 'Exposed Stack Trace in Code',
    description: 'Stack trace or debug error information found in source code. Exposing stack traces in production leaks framework version, internal paths, and code structure (OWASP A10:2025 - Mishandling of Exceptional Conditions).',
    remediation: 'Remove stack traces from production code. Use structured error logging instead of printing errors directly. Implement global error handlers that return generic error messages to users.',
  },
  {
    id: 'SEC-001',
    pattern: /(?:api[_-]?key|apikey|api_secret|apiSecret)[^\n]{0,50}["']?(sk-|pk-|AIza|ghp_|gho_|eyJ|_[A-Z])[a-zA-Z0-9]{20,}/gi,
    severity: 'critical',
    title: 'API Key Detected',
    description: 'Potential API key or secret found in code. This could allow unauthorized access to services.',
    remediation: 'Remove API keys from code immediately. Use environment variables instead: process.env.API_KEY',
  },
  {
    id: 'SEC-002',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gi,
    severity: 'critical',
    title: 'Private Key Detected',
    description: 'Private cryptographic key found in source code. This is a critical security risk.',
    remediation: 'Remove private keys from code immediately. Store them securely in environment variables or a secrets manager.',
  },
  {
    id: 'SEC-003',
    pattern: /\.env(?:\.local|\.development|\.production)?/gi,
    severity: 'critical',
    title: '.env File Reference',
    description: 'Reference to .env file detected. Verify it is not committed to the repository.',
    remediation: 'Ensure .env files are in .gitignore and never committed. Use git-secrets or similar tools to prevent accidental commits.',
  },
  {
    id: 'SEC-004',
    pattern: /(?:password|passwd|pwd|secret)[^\n]{0,30}["'][^"']{6,32}["']/gi,
    severity: 'high',
    title: 'Hardcoded Password',
    description: 'Potential hardcoded password found. Credentials should never be in source code.',
    remediation: 'Move passwords to environment variables: process.env.DB_PASSWORD or use a secrets manager.',
  },
  {
    id: 'SEC-006',
    pattern: /\beval\s*\(/gi,
    severity: 'high',
    title: 'Eval Usage Detected',
    description: 'Use of eval() detected. This can execute arbitrary code and is a major security risk.',
    remediation: 'Replace eval() with safer alternatives. Use JSON.parse() for JSON, or restructure code to avoid dynamic execution.',
  },
  {
    id: 'SEC-007',
    pattern: /console\.(log|debug|info|warn|error)\s*\(/gi,
    severity: 'low',
    title: 'Console Statement',
    description: 'Debug console statement found in code. Should be removed before production.',
    remediation: 'Remove console statements or use a logging library with proper log levels for production.',
  },
  {
    id: 'SEC-008',
    pattern: /["'].*?(?:SELECT|INSERT|UPDATE|DELETE|DROP|UNION).*?(?:FROM|INTO|WHERE|TABLE).*?["'][+\s]/gi,
    severity: 'critical',
    title: 'SQL Injection Pattern',
    description: 'Potential SQL injection vulnerability. User input may be concatenated directly into SQL queries.',
    remediation: 'Use parameterized queries or an ORM. Never concatenate user input directly into SQL strings.',
  },
  {
    id: 'SEC-009',
    pattern: /(?:innerHTML|dangerouslySetInnerHTML|document\.write\s*\()/gi,
    severity: 'high',
    title: 'XSS Vulnerability Pattern',
    description: 'Potential XSS vulnerability. User input may be rendered without sanitization.',
    remediation: 'Sanitize user input before rendering. Use textContent instead of innerHTML, or use a sanitization library like DOMPurify.',
  },
  {
    id: 'SEC-010',
    pattern: /Access-Control-Allow-Origin[^\n]*[*:]/gi,
    severity: 'medium',
    title: 'Permissive CORS Configuration',
    description: 'CORS is configured to allow all origins (*). This may expose APIs to unauthorized use.',
    remediation: 'Restrict CORS to specific trusted origins. Use environment variables to configure allowed origins.',
  },
]

// Website Scanner Rules
export interface HeaderRule {
  id: string
  header: string
  severity: Severity
  title: string
  description: string
  remediation: string
}

export const HEADER_CHECKS: HeaderRule[] = [
  {
    id: 'WEB-001',
    header: 'content-security-policy',
    severity: 'medium',
    title: 'Content-Security-Policy Missing',
    description: 'Content-Security-Policy header is not set. This helps prevent XSS and data injection attacks.',
    remediation: 'Add a CSP header: Content-Security-Policy: default-src \'self\'; script-src \'self\'',
  },
  {
    id: 'WEB-002',
    header: 'strict-transport-security',
    severity: 'high',
    title: 'HSTS Header Missing',
    description: 'Strict-Transport-Security header is not set. Browsers won\'t enforce HTTPS.',
    remediation: 'Add HSTS header: Strict-Transport-Security: max-age=31536000; includeSubDomains',
  },
  {
    id: 'WEB-003',
    header: 'x-frame-options',
    severity: 'medium',
    title: 'X-Frame-Options Missing',
    description: 'X-Frame-Options header is not set. Site may be vulnerable to clickjacking.',
    remediation: 'Add X-Frame-Options: DENY or X-Frame-Options: SAMEORIGIN',
  },
  {
    id: 'WEB-004',
    header: 'x-content-type-options',
    severity: 'low',
    title: 'X-Content-Type-Options Missing',
    description: 'X-Content-Type-Options header is not set. Browsers may MIME-sniff content.',
    remediation: 'Add X-Content-Type-Options: nosniff',
  },
]

export const PATH_CHECKS = [
  { path: '/.env', severity: 'critical' as Severity, title: '.env File Accessible', remediation: 'Block access to .env files in web server config' },
  { path: '/.git/config', severity: 'high' as Severity, title: '.git Directory Accessible', remediation: 'Block access to .git directory, ensure it\'s not in public path' },
  { path: '/admin', severity: 'high' as Severity, title: 'Admin Panel Exposed', remediation: 'Protect admin routes with authentication, add to robots.txt' },
  { path: '/wp-admin', severity: 'high' as Severity, title: 'WordPress Admin Exposed', remediation: 'Protect WordPress admin with strong authentication, use security plugins' },
  { path: '/debug', severity: 'high' as Severity, title: 'Debug Endpoints Exposed (OWASP A10:2025)', remediation: 'Disable debug mode in production, restrict debug endpoints. Stack traces in HTTP responses leak internal information.' },
  { path: '/.env.local', severity: 'critical' as Severity, title: '.env.local File Accessible', remediation: 'Block access to .env files' },
  { path: '/config.js', severity: 'high' as Severity, title: 'Config File Exposed', remediation: 'Move config files outside public directory' },
  { path: '/api/debug', severity: 'critical' as Severity, title: 'Debug API Endpoint Exposed (OWASP A10:2025)', remediation: 'Disable all debug endpoints in production. Remove /debug, /trace, /actuator routes from production deployments.' },
  { path: '/actuator/health', severity: 'medium' as Severity, title: 'Health/Info Actuator Endpoint Exposed', remediation: 'Restrict actuator endpoints to internal networks. Do not expose /actuator/info or /actuator/env in production.' },
]

export function scanContent(content: string, filePath: string): Finding[] {
  const findings: Finding[] = []
  const lines = content.split('\n')
  
  // Run Supabase credential check (requires file path context)
  if (checkSupabaseCredentials(content, filePath)) {
    findings.push({
      id: `SUPABASE001-${findings.length}`,
      ruleId: 'SUPABASE001',
      severity: 'critical',
      title: 'Exposed Supabase Credentials',
      description: 'Hardcoded Supabase API keys or service role keys found in source code. This allows full database access bypassing RLS policies.',
      filePath,
      remediation: 'Use environment variables: process.env.SUPABASE_KEY. Never commit Supabase anon/service keys to version control. Add .env to .gitignore and use a secrets manager for production.',
    })
  }
  
  for (const rule of GITHUB_SCANNER_RULES) {
    // Skip SUPABASE001 in the pattern loop since we handle it above
    if (rule.id === 'SUPABASE001') continue
    
    const matches = content.match(rule.pattern)
    if (matches) {
      for (const match of matches) {
        // Find line number
        let lineNumber: number | undefined
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(match.substring(0, 50))) {
            lineNumber = i + 1
            break
          }
        }
        
        // Get snippet (line context)
        const snippet = lineNumber 
          ? lines.slice(Math.max(0, lineNumber - 2), lineNumber + 2).join('\n')
          : undefined
        
        findings.push({
          id: `${rule.id}-${findings.length}`,
          ruleId: rule.id,
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          filePath,
          lineNumber,
          snippet,
          remediation: rule.remediation,
        })
      }
    }
  }
  
  return findings
}
