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
  scanDuration: number
}

interface SecurityCheck {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  check: ($: cheerio.CheerioAPI, url: string, headers: Record<string, string>) => boolean
  remediation: string
  cwe?: string
  owasp?: string
}

// OWASP Top 10 2021 aligned checks
const SECURITY_CHECKS: SecurityCheck[] = [
  // A01 - Broken Access Control
  {
    id: 'idor',
    title: 'Potential Insecure Direct Object Reference (IDOR)',
    description: 'URL patterns suggest direct access to resources without authorization checks.',
    severity: 'high',
    cwe: 'CWE-639',
    owasp: 'A01:2021',
    check: ($: cheerio.CheerioAPI, url: string) => {
      const urlObj = new URL(url, 'http://x')
      const path = urlObj.pathname
      return /\/(user|account|order|invoice|transaction|profile|edit|delete)\/(\d+|[a-f0-9-]+)/i.test(path)
    },
    remediation: 'Implement proper authorization checks. Verify the user is authorized to access the specific resource.',
  },
  {
    id: 'directory-traversal',
    title: 'Potential Directory Traversal',
    description: 'URL parameters may allow path traversal attacks.',
    severity: 'critical',
    cwe: 'CWE-22',
    owasp: 'A01:2021',
    check: ($: cheerio.CheerioAPI, url: string) => {
      const urlObj = new URL(url, 'http://x')
      const params = urlObj.searchParams.toString()
      return /(\.\.|\%2e|\%2f)/i.test(params) || /(\?|&)path=|(\?|&)file=|(\?|&)url=/i.test(params)
    },
    remediation: 'Sanitize and validate all user input. Use indirect references instead of direct file paths.',
  },
  {
    id: 'cors-misconfig',
    title: 'Potential CORS Misconfiguration',
    description: 'Page may be vulnerable to CORS attacks with overly permissive settings.',
    severity: 'high',
    cwe: 'CWE-942',
    owasp: 'A01:2021',
    check: ($: cheerio.CheerioAPI, _url: string, headers: Record<string, string>) => {
      const corsHeader = headers['access-control-allow-origin'] || ''
      return corsHeader === '*' || corsHeader === 'null'
    },
    remediation: 'Set Access-Control-Allow-Origin to specific trusted origins. Do not use * or null in production.',
  },

  // A02 - Cryptographic Failures
  {
    id: 'https-missing',
    title: 'Page Loaded Over HTTP',
    description: 'This page was loaded without HTTPS, risking data interception.',
    severity: 'critical',
    cwe: 'CWE-319',
    owasp: 'A02:2021',
    check: ($: cheerio.CheerioAPI, url: string) => url.startsWith('http://'),
    remediation: 'Use HTTPS exclusively. Redirect all HTTP traffic to HTTPS and set Strict-Transport-Security header.',
  },
  {
    id: 'mixed-content',
    title: 'Mixed Content Detected',
    description: 'Page loads resources over both HTTP and HTTPS.',
    severity: 'high',
    cwe: 'CWE-311',
    owasp: 'A02:2021',
    check: ($: cheerio.CheerioAPI, url: string) => {
      const html = $.html()
      return /src=["']http:\/\//i.test(html) || /href=["']http:\/\//i.test(html)
    },
    remediation: 'Update all resource URLs to use HTTPS. Configure CSP to block mixed content.',
  },
  {
    id: 'weak-ssl',
    title: 'Weak or Missing SSL/TLS Configuration',
    description: 'Server may be using outdated protocols or weak cipher suites.',
    severity: 'high',
    cwe: 'CWE-326',
    owasp: 'A02:2021',
    check: ($: cheerio.CheerioAPI, _url: string, headers: Record<string, string>) => {
      const sslHeader = headers['strict-transport-security'] || ''
      return sslHeader.length === 0
    },
    remediation: 'Enable HSTS with a long max-age. Ensure TLS 1.2+ is configured. Remove support for older protocols.',
  },

  // A03 - Injection
  {
    id: 'xss-stored',
    title: 'Potential Stored XSS via Form Input',
    description: 'Form fields may not be sanitized, risking stored cross-site scripting.',
    severity: 'critical',
    cwe: 'CWE-79',
    owasp: 'A03:2021',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const inputs = $('input, textarea, select').filter((_, el) => {
        const type = $(el).attr('type')
        const name = $(el).attr('name') || ''
        const id = $(el).attr('id') || ''
        const textField = type !== 'hidden' && type !== 'submit' && type !== 'button'
        const sensitiveField = /comment|message|post|content|body|description/i.test(name) || 
                              /comment|message|post|content|body|description/i.test(id)
        return textField && sensitiveField
      })
      return inputs.length > 0
    },
    remediation: 'Sanitize and escape all user input. Use Content Security Policy. Implement output encoding.',
  },
  {
    id: 'xss-reflected',
    title: 'Potential Reflected XSS in URL Parameters',
    description: 'URL parameters may be reflected unsanitized in the page.',
    severity: 'high',
    cwe: 'CWE-79',
    owasp: 'A03:2021',
    check: ($: cheerio.CheerioAPI, url: string) => {
      const urlObj = new URL(url, 'http://x')
      const params = urlObj.searchParams.toString()
      if (!params) return false
      const bodyText = $('body').text()
      return params.split('&').some(p => {
        const [key, val] = p.split('=')
        return val && val.length > 2 && bodyText.includes(decodeURIComponent(val))
      })
    },
    remediation: 'Encode all user input before reflecting. Implement CSP to mitigate XSS risks.',
  },
  {
    id: 'xss-dom',
    title: 'Potential DOM-based XSS',
    description: 'Page uses potentially unsafe JavaScript that could lead to DOM XSS.',
    severity: 'high',
    cwe: 'CWE-79',
    owasp: 'A03:2021',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const scripts = $('script').map((_, el) => $(el).html()).get().join('')
      const dangerousPatterns = [
        /document\.write/i,
        /innerHTML\s*=/i,
        /outerHTML\s*=/i,
        /insertAdjacentHTML/i,
        /\.href\s*=\s*location/i,
        /eval\s*\(/i,
        /setTimeout\s*\(\s*["']/, 
        /setInterval\s*\(\s*["']/,
      ]
      return dangerousPatterns.some(p => p.test(scripts))
    },
    remediation: 'Avoid using dangerous DOM APIs. Use safe alternatives like textContent. Implement strict CSP.',
  },
  {
    id: 'sql-injection-params',
    title: 'Potential SQL Injection via Parameters',
    description: 'URL parameters may be vulnerable to SQL injection.',
    severity: 'critical',
    cwe: 'CWE-89',
    owasp: 'A03:2021',
    check: ($: cheerio.CheerioAPI, url: string) => {
      const urlObj = new URL(url, 'http://x')
      const params = urlObj.searchParams.toString()
      if (!params) return false
      const riskyParams = ['id', 'user', 'query', 'search', 'page', 'sort', 'order', 'filter', 'cat']
      const bodyText = $('body').text().toLowerCase()
      return riskyParams.some(p => urlObj.searchParams.has(p)) && 
             (url.includes("'") || url.includes('"') || /union.*select/i.test(bodyText))
    },
    remediation: 'Use parameterized queries. Never concatenate user input into SQL strings.',
  },
  {
    id: 'cmd-injection',
    title: 'Potential Command Injection',
    description: 'URL or page content suggests system commands may be executed.',
    severity: 'critical',
    cwe: 'CWE-78',
    owasp: 'A03:2021',
    check: ($: cheerio.CheerioAPI, url: string) => {
      const urlParams = url + $('body').text()
      return /[;&|`$]/.test(urlParams) && /(\?|=|&)(cmd|command|exec|shell|ping|nslookup|wget|curl)/i.test(urlParams)
    },
    remediation: 'Never pass user input to system commands. Use safe APIs and input validation.',
  },
  {
    id: 'ldap-injection',
    title: 'Potential LDAP Injection',
    description: 'URL parameters may be vulnerable to LDAP injection.',
    severity: 'high',
    cwe: 'CWE-90',
    owasp: 'A03:2021',
    check: ($: cheerio.CheerioAPI, url: string) => {
      const urlObj = new URL(url, 'http://x')
      const params = urlObj.searchParams.toString()
      return (urlObj.pathname.includes('ldap') || /ldap/i.test(params)) && /(\*|\(|\||\&)/.test(params)
    },
    remediation: 'Sanitize all DN special characters. Use LDAP encoding functions.',
  },

  // A04 - Insecure Design
  {
    id: 'debug-endpoint',
    title: 'Debug or Development Endpoint Exposed',
    description: 'Development or debug endpoints appear to be accessible in production.',
    severity: 'high',
    cwe: 'CWE-489',
    owasp: 'A04:2021',
    check: ($: cheerio.CheerioAPI, url: string) => {
      const bodyText = $('body').text().toLowerCase()
      const debugPatterns = ['debug', 'stack trace', 'error details', 'exception', 'java.io', 'stacktrace', 'error in', 'at ']
      const hasDebugContent = debugPatterns.some(p => bodyText.includes(p))
      const debugUrls = /(\/debug|\/trace|\/actuator|\/env|\/config|\/actuator\/health)/i.test(url)
      return hasDebugContent || debugUrls
    },
    remediation: 'Disable debug mode in production. Remove debug endpoints or restrict access.',
  },
  {
    id: 'missing-rate-limit',
    title: 'Missing Rate Limiting Headers',
    description: 'No rate limiting headers detected, suggesting no brute force protection.',
    severity: 'medium',
    cwe: 'CWE-307',
    owasp: 'A04:2021',
    check: ($: cheerio.CheerioAPI, _url: string, headers: Record<string, string>) => {
      const rateHeaders = ['x-ratelimit-limit', 'x-ratelimit-remaining', 'ratelimit-limit']
      return !rateHeaders.some(h => headers[h.toLowerCase()])
    },
    remediation: 'Implement rate limiting. Use headers like X-RateLimit-Limit and Retry-After.',
  },

  // A05 - Security Misconfiguration
  {
    id: 'missing-csp',
    title: 'Content Security Policy Missing',
    description: 'No CSP header leaves the application vulnerable to XSS and data injection.',
    severity: 'high',
    cwe: 'CWE-1021',
    owasp: 'A05:2021',
    check: ($: cheerio.CheerioAPI, _url: string, headers: Record<string, string>) => {
      return !Object.keys(headers).some(h => h.includes('content-security-policy'))
    },
    remediation: 'Implement a strict CSP. Start with report-only mode to identify violations.',
  },
  {
    id: 'missing-xfo',
    title: 'X-Frame-Options Header Missing',
    description: 'Page can be embedded in iframes, enabling clickjacking attacks.',
    severity: 'medium',
    cwe: 'CWE-1021',
    owasp: 'A05:2021',
    check: ($: cheerio.CheerioAPI, _url: string, headers: Record<string, string>) => {
      return !Object.keys(headers).some(h => h.includes('x-frame-options'))
    },
    remediation: 'Add X-Frame-Options: DENY or SAMEORIGIN header. Consider CSP frame-ancestors.',
  },
  {
    id: 'missing-xct',
    title: 'X-Content-Type-Options Header Missing',
    description: 'Browser may MIME-sniff content, enabling attacks.',
    severity: 'medium',
    cwe: 'CWE-693',
    owasp: 'A05:2021',
    check: ($: cheerio.CheerioAPI, _url: string, headers: Record<string, string>) => {
      return !headers['x-content-type-options']
    },
    remediation: 'Add X-Content-Type-Options: nosniff header.',
  },
  {
    id: 'missing-xxp',
    title: 'X-XSS-Protection Header Missing or Weak',
    description: 'XSS filter not properly configured.',
    severity: 'low',
    cwe: 'CWE-692',
    owasp: 'A05:2021',
    check: ($: cheerio.CheerioAPI, _url: string, headers: Record<string, string>) => {
      const header = headers['x-xss-protection'] || ''
      return header === '' || header === '0' || header === '1'
    },
    remediation: 'Use CSP instead for XSS protection. If needed, set X-XSS-Protection: 0 (prefer CSP).',
  },
  {
    id: 'missing-referrer-policy',
    title: 'Referrer-Policy Header Missing',
    description: 'Referrer information may leak to external sites.',
    severity: 'low',
    cwe: 'CWE-116',
    owasp: 'A05:2021',
    check: ($: cheerio.CheerioAPI, _url: string, headers: Record<string, string>) => {
      return !headers['referrer-policy']
    },
    remediation: 'Add Referrer-Policy: strict-origin-when-cross-origin or no-referrer.',
  },
  {
    id: 'permissions-policy',
    title: 'Permissions-Policy Header Missing',
    description: 'Browser features not restricted, may enable attacks.',
    severity: 'low',
    cwe: 'CWE-16',
    owasp: 'A05:2021',
    check: ($: cheerio.CheerioAPI, _url: string, headers: Record<string, string>) => {
      return !headers['permissions-policy'] && !headers['feature-policy']
    },
    remediation: 'Add Permissions-Policy to disable unused browser features (camera, mic, geolocation, etc).',
  },
  {
    id: 'server-version',
    title: 'Server Version Information Disclosed',
    description: 'Server or framework version exposed in headers.',
    severity: 'low',
    cwe: 'CWE-200',
    owasp: 'A05:2021',
    check: ($: cheerio.CheerioAPI, _url: string, headers: Record<string, string>) => {
      const versionHeaders = ['server', 'x-powered-by', 'x-aspnet-version', 'x-Generator']
      return versionHeaders.some(h => headers[h] && /\d+(\.\d+)+/.test(headers[h]))
    },
    remediation: 'Remove or genericize version headers. Hide server technology stack information.',
  },
  {
    id: 'trace-method',
    title: 'HTTP TRACE Method Enabled',
    description: 'TRACE method enabled, can be used in Cross-Site Tracing attacks.',
    severity: 'medium',
    cwe: 'CWE-74',
    owasp: 'A05:2021',
    check: ($: cheerio.CheerioAPI, _url: string, headers: Record<string, string>) => {
      const allow = headers['allow'] || headers['access-control-allow-methods'] || ''
      return /trace/i.test(allow)
    },
    remediation: 'Disable TRACE method at the web server level.',
  },

  // A06 - Vulnerable Components
  {
    id: 'old-dep',
    title: 'Potentially Outdated JavaScript Dependencies',
    description: 'Script tags suggest old library versions may be in use.',
    severity: 'medium',
    cwe: 'CWE-1104',
    owasp: 'A06:2021',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const scripts = $('script[src]').map((_, el) => $(el).attr('src')).get()
      return scripts.some((src: string) => {
        if (!src) return false
        const oldPatterns = [
          /jquery[/-]1\./i,
          /jquery[/-]2\./i,
          /jquery[/-]3\.0/i,
          /bootstrap[/-]3\./i,
          /angular[/-]1\./i,
          /react[/-]0\./i,
          /vue[/-]1\./i,
        ]
        return oldPatterns.some(p => p.test(src))
      })
    },
    remediation: 'Update all JavaScript dependencies to latest stable versions. Monitor for CVE announcements.',
  },
  {
    id: 'cdn-unknown',
    title: 'Unknown Third-Party Scripts',
    description: 'Scripts loaded from unknown CDNs may pose supply chain risks.',
    severity: 'medium',
    cwe: 'CWE-1359',
    owasp: 'A06:2021',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const scripts = $('script[src]').map((_, el) => $(el).attr('src')).get()
      const knownCdns = ['jquery', 'bootstrap', 'googleapis', 'cloudflare', 'cdnjs', 'unpkg', 'jsdelivr']
      return scripts.filter((src: string) => {
        if (!src) return false
        return !knownCdns.some(cdn => src.toLowerCase().includes(cdn))
      }).length > 0
    },
    remediation: 'Review all third-party scripts. Use Subresource Integrity (SRI) hashes.',
  },

  // A07 - Auth Failures
  {
    id: 'autocomplete-password',
    title: 'Password Field With Autocomplete Enabled',
    description: 'Password fields should not allow autocomplete to prevent credential theft.',
    severity: 'high',
    cwe: 'CWE-799',
    owasp: 'A07:2021',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const passwordFields = $('input[type="password"]')
      return passwordFields.filter((_, el) => {
        const autocomplete = $(el).attr('autocomplete')
        return !autocomplete || autocomplete !== 'off'
      }).length > 0
    },
    remediation: 'Add autocomplete="off" to all password fields.',
  },
  {
    id: 'weak-auth',
    title: 'Weak or No Authentication on Sensitive Form',
    description: 'Form appears to handle sensitive data without strong auth indicators.',
    severity: 'high',
    cwe: 'CWE-287',
    owasp: 'A07:2021',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const sensitiveForms = $('form').filter((_, form) => {
        const text = $(form).text().toLowerCase()
        const hasPassword = /password|passwd|secret/i.test($(form).html() || '')
        const hasLogin = /login|signin|auth|log-in/i.test(text)
        return hasPassword || hasLogin
      })
      const has2fa = $('input[name*="totp"], input[name*="2fa"], input[name*="code"]').length > 0
      return sensitiveForms.length > 0 && !has2fa
    },
    remediation: 'Implement multi-factor authentication. Use secure session management.',
  },

  // A08 - Software Integrity
  {
    id: 'no-sri',
    title: 'Scripts Without Subresource Integrity (SRI)',
    description: 'External scripts loaded without SRI hashes, vulnerable to tampering.',
    severity: 'medium',
    cwe: 'CWE-345',
    owasp: 'A08:2021',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const scriptsWithSrc = $('script[src]').filter((_, el) => {
        const src = $(el).attr('src') || ''
        return src.startsWith('http') && !$(el).attr('integrity')
      })
      return scriptsWithSrc.length > 0
    },
    remediation: 'Add integrity attribute (SRI) to all external scripts: <script src="..." integrity="sha384-..." crossorigin="anonymous">',
  },
  {
    id: 'sri-not-used',
    title: 'External Scripts Found Without Integrity Check',
    description: 'External resources loaded without verification, risk of CDN compromise.',
    severity: 'medium',
    cwe: 'CWE-346',
    owasp: 'A08:2021',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      const externalScripts = $('script[src]').filter((_, el) => {
        const src = $(el).attr('src') || ''
        return src.startsWith('https://')
      })
      const withoutIntegrity = externalScripts.filter((_, el) => !$(el).attr('integrity'))
      return withoutIntegrity.length > 0
    },
    remediation: 'Use Subresource Integrity for all external scripts. Verify CDN credentials.',
  },

  // A09 - Logging & Monitoring
  {
    id: 'no-security-page',
    title: 'Missing Security.txt or Policy Page',
    description: 'No security policy page found for responsible disclosure.',
    severity: 'info',
    cwe: 'CWE-778',
    owasp: 'A09:2021',
    check: ($: cheerio.CheerioAPI, _url: string) => {
      return !$('a[href="/security"], a[href="/security.txt"], a[href="/.well-known/security.txt"]').length
    },
    remediation: 'Create a security.txt file at /.well-known/security.txt with contact information.',
  },

  // A10 - SSRF
  {
    id: 'ssrf-risk',
    title: 'Potential SSRF Risk via URL Parameters',
    description: 'URL parameters that accept URLs may enable Server-Side Request Forgery.',
    severity: 'high',
    cwe: 'CWE-918',
    owasp: 'A10:2021',
    check: ($: cheerio.CheerioAPI, url: string) => {
      const urlObj = new URL(url, 'http://x')
      const ssrfParams = ['url', 'uri', 'link', 'src', 'source', 'domain', 'host', 'port', 'path', 'dest']
      return ssrfParams.some(p => urlObj.searchParams.has(p))
    },
    remediation: 'Validate and sanitize all URL parameters. Use allowlists for permitted destinations. Never forward requests to user-controlled URLs.',
  },
]

export async function scanWebsite(url: string): Promise<WebsiteScanResult> {
  const findings: WebsiteScanResult['findings'] = []
  const startTime = Date.now()
  let headers: Record<string, string> = {}
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VibeChecker/1.0 Security Scanner (+https://vibe-checker.69-6-206-26.sslip.io)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(30000),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    // Extract headers
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Run all checks
    for (const check of SECURITY_CHECKS) {
      try {
        if (check.check($, url, headers)) {
          findings.push({
            id: crypto.randomUUID(),
            ruleId: check.owasp ? check.owasp.split(':')[0] : check.id.toUpperCase(),
            severity: check.severity,
            title: check.title,
            description: check.description,
            remediation: check.remediation,
          })
        }
      } catch {
        // Skip failing checks silently
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
    scanDuration: Date.now() - startTime,
  }
}
