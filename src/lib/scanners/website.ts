import * as cheerio from 'cheerio'

export interface WebsiteScanResult {
  findings: Array<{
    id: string
    ruleId: string
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
    title: string
    description: string
    remediation: string
  }>
  severityCounts: Record<string, number>
  scannedUrls: number
}

interface SecurityCheck {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  check: ($: cheerio.CheerioAPI, url: string) => boolean
  remediation: string
}

const SECURITY_CHECKS: SecurityCheck[] = [
  {
    id: 'xss',
    title: 'Potential XSS via inline scripts',
    description: 'Page contains inline event handlers that could be exploited for XSS attacks.',
    severity: 'high',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const riskyAttrs = $('[onclick], [onerror], [onload], [onmouseover]')
      return riskyAttrs.length > 0
    },
    remediation: 'Use external JavaScript files instead of inline event handlers. Sanitize all user input before rendering.',
  },
  {
    id: 'sql-injection',
    title: 'Potential SQL Injection risk',
    description: 'URL parameters suggest database queries that may be vulnerable to SQL injection.',
    severity: 'high',
    check: ($: cheerio.CheerioAPI, url: string) => {
      const urlObj = new URL(url, 'http://x')
      const params = urlObj.searchParams.toString()
      return /(id|user|pass|query|search|sql)/i.test(params)
    },
    remediation: 'Use parameterized queries or ORM. Never concatenate user input into SQL strings.',
  },
  {
    id: 'debug-mode',
    title: 'Debug mode possibly enabled',
    description: 'Page appears to show debug information which could aid attackers.',
    severity: 'medium',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const bodyText = $('body').text().toLowerCase()
      return /debug|stack trace|error|exception/.test(bodyText)
    },
    remediation: 'Disable debug mode in production. Ensure errors are logged, not displayed.',
  },
  {
    id: 'exposed-files',
    title: 'Potentially sensitive files exposed',
    description: 'Common development or configuration files may be accessible.',
    severity: 'high',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const scripts = $('script[src]').map((_, el) => $(el).attr('src')).get()
      return scripts.some((src: string) => 
        /(\.env|config|credentials|secrets)/i.test(src)
      )
    },
    remediation: 'Remove or block access to sensitive files. Use environment variables instead of config files in public paths.',
  },
  {
    id: 'missing-csp',
    title: 'Content Security Policy missing',
    description: 'No CSP header found, making XSS attacks more likely to succeed.',
    severity: 'medium',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      return $('meta[http-equiv="Content-Security-Policy"]').length === 0
    },
    remediation: 'Add a Content-Security-Policy header to restrict script sources.',
  },
  {
    id: 'https-missing',
    title: 'Page loaded over HTTP',
    description: 'This page was loaded without HTTPS, risking data interception.',
    severity: 'high',
    check: ($: cheerio.CheerioAPI, url: string) => {
      return url.startsWith('http://')
    },
    remediation: 'Use HTTPS exclusively. Redirect HTTP to HTTPS and set HSTS header.',
  },
  {
    id: 'autocomplete',
    title: 'Autocomplete enabled on sensitive fields',
    description: 'Form fields with autocomplete may leak sensitive data.',
    severity: 'low',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const sensitiveFields = $('input[type="password"], input[type="email"], input[name*="password"], input[name*="secret"]')
      return sensitiveFields.filter((_, el) => !$(el).attr('autocomplete')).length > 0
    },
    remediation: 'Add autocomplete="off" to sensitive form fields, especially password fields.',
  },
  {
    id: 'iframe-clickjacking',
    title: 'Missing X-Frame-Options header',
    description: 'Page can be embedded in iframes, enabling clickjacking attacks.',
    severity: 'medium',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      return $('meta[http-equiv="X-Frame-Options"]').length === 0
    },
    remediation: 'Add X-Frame-Options: DENY or SAMEORIGIN header to prevent framing.',
  },
]

export async function scanWebsite(url: string): Promise<WebsiteScanResult> {
  const findings: WebsiteScanResult['findings'] = []
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VibeChecker/1.0 Security Scanner',
      },
      signal: AbortSignal.timeout(30000),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    for (const check of SECURITY_CHECKS) {
      try {
        if (check.check($, url)) {
          findings.push({
            id: crypto.randomUUID(),
            ruleId: `WEBSITE_${check.id.toUpperCase()}`,
            severity: check.severity,
            title: check.title,
            description: check.description,
            remediation: check.remediation,
          })
        }
      } catch {
        // Skip failing checks
      }
    }
  } catch (error: any) {
    throw new Error(`Failed to fetch website: ${error.message}`)
  }
  
  const severityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
  for (const f of findings) {
    severityCounts[f.severity] = (severityCounts[f.severity] || 0) + 1
  }
  
  return {
    findings,
    severityCounts,
    scannedUrls: 1,
  }
}
