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
export const GITHUB_SCANNER_RULES: ScanRule[] = [
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
  { path: '/debug', severity: 'high' as Severity, title: 'Debug Endpoints Exposed', remediation: 'Disable debug mode in production, restrict debug endpoints' },
  { path: '/.env.local', severity: 'critical' as Severity, title: '.env.local File Accessible', remediation: 'Block access to .env files' },
  { path: '/config.js', severity: 'high' as Severity, title: 'Config File Exposed', remediation: 'Move config files outside public directory' },
]

export function scanContent(content: string, filePath: string): Finding[] {
  const findings: Finding[] = []
  const lines = content.split('\n')
  
  for (const rule of GITHUB_SCANNER_RULES) {
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
