import * as cheerio from 'cheerio'
import type { WebsiteScanResult, Finding, SeverityCounts, Severity } from '../types'
import { fetchPublicHtml } from '../network-security'
import { analyzeHeaders } from './headers'
import { runPathProbes } from './path-probe'
import { scoreFinding } from './risk-score'

// ============== Type Definitions ==============

interface SecurityCheck {
  id: string
  title: string
  description: string
  severity: Severity
  check: ($: cheerio.CheerioAPI, url: string) => boolean
  remediation: string
  cwe?: string
  owasp?: string
}

// ============== Utility Functions ==============

/**
 * Safely parse and validate URL
 */
function safeParseUrl(url: string): URL | null {
  try {
    return new URL(url)
  } catch {
    return null
  }
}

/**
 * Safely run a check function and return false on error
 */
function safeCheck(checkFn: () => boolean): boolean {
  try {
    return checkFn()
  } catch {
    return false
  }
}

/**
 * Convert headers record to lowercase keys for case-insensitive lookup
 */
function normalizeHeaders(headers: Headers): Record<string, string> {
  const normalized: Record<string, string> = {}
  headers.forEach((value, key) => {
    normalized[key.toLowerCase()] = value
  })
  return normalized
}

/**
 * Initialize severity counts
 */
function initSeverityCounts(): SeverityCounts {
  return { critical: 0, high: 0, medium: 0, low: 0, info: 0 }
}

/**
 * Build a Finding object
 */
function buildFinding(check: SecurityCheck): Finding {
  return {
    id: crypto.randomUUID(),
    ruleId: check.owasp ? check.owasp.split(':')[0] : check.id.toUpperCase(),
    severity: check.severity,
    title: check.title,
    description: check.description,
    remediation: check.remediation,
  }
}

// ============== Security Checks ==============

// HTML body + URL pattern checks. Header-related checks are handled by analyzeHeaders()
// in ./headers.ts and path-exposure checks are handled by runPathProbes() in
// ./path-probe.ts. Keeping them in one place avoids duplication.
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
      const urlObj = safeParseUrl(url)
      if (!urlObj) return false
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
      const urlObj = safeParseUrl(url)
      if (!urlObj) return false
      const params = urlObj.searchParams.toString()
      return /(\.\.|\%2e|\%2f)/i.test(params) || /(\?|&)path=|(\?|&)file=|(\?|&)url=/i.test(params)
    },
    remediation: 'Sanitize and validate all user input. Use indirect references instead of direct file paths.',
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
      if (!url) return false
      const html = $.html()
      return /src=["']http:\/\//i.test(html) || /href=["']http:\/\//i.test(html)
    },
    remediation: 'Update all resource URLs to use HTTPS. Configure CSP to block mixed content.',
  },

  // A03 - Injection
  {
    id: 'xss-stored',
    title: 'Potential Stored XSS via Form Input',
    description: 'Form fields may not be sanitized, risking stored cross-site scripting.',
    severity: 'critical',
    cwe: 'CWE-79',
    owasp: 'A03:2021',
    check: ($: cheerio.CheerioAPI) => {
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
      const urlObj = safeParseUrl(url)
      if (!urlObj) return false
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
    check: ($: cheerio.CheerioAPI) => {
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
      const urlObj = safeParseUrl(url)
      if (!urlObj) return false
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
      if (!url) return false
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
      const urlObj = safeParseUrl(url)
      if (!urlObj) return false
      const params = urlObj.searchParams.toString()
      return /[*(\|&=]/.test(params) && /(ldap|dn|cn|uid)/i.test(urlObj.pathname)
    },
    remediation: 'Sanitize all LDAP special characters. Use LDAP encoding functions.',
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
      if (!url) return false
      const bodyText = $('body').text().toLowerCase()
      const debugPatterns = ['debug', 'stack trace', 'error details', 'exception', 'java.io', 'stacktrace', 'error in', 'at ']
      const hasDebugContent = debugPatterns.some(p => bodyText.includes(p))
      const debugUrls = /(\/debug|\/trace|\/actuator|\/env|\/config|\/actuator\/health)/i.test(url)
      return hasDebugContent || debugUrls
    },
    remediation: 'Disable debug mode in production. Remove debug endpoints or restrict access.',
  },

  // A06 - Vulnerable Components
  {
    id: 'old-dep',
    title: 'Potentially Outdated JavaScript Dependencies',
    description: 'Script tags suggest old library versions may be in use.',
    severity: 'medium',
    cwe: 'CWE-1104',
    owasp: 'A06:2021',
    check: ($: cheerio.CheerioAPI) => {
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
    check: ($: cheerio.CheerioAPI) => {
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
    check: ($: cheerio.CheerioAPI) => {
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
    check: ($: cheerio.CheerioAPI) => {
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
    check: ($: cheerio.CheerioAPI) => {
      const scriptsWithSrc = $('script[src]').filter((_, el) => {
        const src = $(el).attr('src') || ''
        return src.startsWith('http') && !$(el).attr('integrity')
      })
      return scriptsWithSrc.length > 0
    },
    remediation: 'Add integrity attribute (SRI) to all external scripts: <script src="..." integrity="sha384-..." crossorigin="anonymous">',
  },

  // A09 - Logging & Monitoring
  {
    id: 'no-security-page',
    title: 'Missing Security.txt or Policy Page',
    description: 'No security policy page found for responsible disclosure.',
    severity: 'info',
    cwe: 'CWE-778',
    owasp: 'A09:2021',
    check: ($: cheerio.CheerioAPI) => {
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
      const urlObj = safeParseUrl(url)
      if (!urlObj) return false
      const ssrfParams = ['url', 'uri', 'link', 'src', 'source', 'domain', 'host', 'port', 'path', 'dest']
      return ssrfParams.some(p => urlObj.searchParams.has(p))
    },
    remediation: 'Validate and sanitize all URL parameters. Use allowlists for permitted destinations. Never forward requests to user-controlled URLs.',
  },

  // OWASP Top 10 2025 - NEW A10: Mishandling of Exceptional Conditions
  {
    id: 'error-stack-exposed',
    title: 'Exposed Error/Stack Information (OWASP A10:2025)',
    description: 'Debug or error information found in the page. Exposing stack traces, error details, or framework version information helps attackers identify vulnerabilities (OWASP A10:2025 - Mishandling of Exceptional Conditions).',
    severity: 'high',
    cwe: 'CWE-209',
    owasp: 'A10:2025',
    check: ($: cheerio.CheerioAPI, url: string) => {
      if (!url) return false
      const bodyText = $('body').text().toLowerCase()
      const errorPatterns = [
        /stack[\s-]?trace/i,
        /error\s+in\s+line\s+\d+/i,
        /exception\s+in\s+thread/i,
        /at\s+[a-zA-Z0-9_$]+\.[a-zA-Z0-9_$]+\(/i,
        /java\.io\.|\.class\.java/i,
        /node\.js|__filename|__dirname/i,
        /traceback\s*\(most\s*recent\s*call\s*last\)/i,
        /warning\s+deprecated/i,
        /fatal\s+error/i,
        /syntaxerror/i,
        /referenceerror/i,
        /typeerror/i,
      ]
      const hasErrorContent = errorPatterns.some(p => p.test(bodyText))
      const debugUrls = /(\/debug|\/trace|\/actuator|\/_debug|\/error|\/exception)/i.test(url)
      return hasErrorContent || debugUrls
    },
    remediation: 'Disable debug mode in production. Return generic error messages to users while logging details server-side. Remove stack traces from HTTP responses. Implement proper error boundaries (React ErrorBoundary) and global exception handlers.',
  },
  {
    id: 'missing-error-boundary',
    title: 'Missing Error Boundaries (OWASP A10:2025)',
    description: 'No React ErrorBoundary found. Unhandled component errors can crash the entire app and expose error information to users.',
    severity: 'medium',
    cwe: 'CWE-755',
    owasp: 'A10:2025',
    check: ($: cheerio.CheerioAPI) => {
      const html = $.html().toLowerCase()
      const hasErrorBoundary = /errorboundary|<errorboundary|componentdidcatch|getderivedstatefromerror/i.test(html)
      const hasReactApp = /data-react|/i.test(html) || $('script[src*="react"]').length > 0
      return hasReactApp && !hasErrorBoundary
    },
    remediation: 'Implement React ErrorBoundary components to catch and handle render errors gracefully. Use componentDidCatch or getDerivedStateFromError. This prevents app crashes from exposing error details.',
  },

  // OWASP Top 10 2025 - NEW A10: Fail-Open Conditions
  {
    id: 'fail-open',
    title: 'Potential Fail-Open Condition (OWASP A10:2025)',
    description: 'Authentication or authorization logic may fail open, allowing access when it should be denied. This is a critical logic flaw in error handling (OWASP A10:2025).',
    severity: 'critical',
    cwe: 'CWE-836',
    owasp: 'A10:2025',
    check: ($: cheerio.CheerioAPI, url: string) => {
      if (!url) return false
      const authUrls = /(\/admin|\/dashboard|\/settings|\/profile|\/user|\/account)/i.test(url)
      const failOpenPatterns = /(\/auth\/bypass|\/skip|\/guest|\/anonymous|\/public)/i.test(url)
      return authUrls && failOpenPatterns
    },
    remediation: 'Review authentication/authorization logic for fail-open conditions. Ensure access is denied by default. Use explicit allowlists for permitted access.',
  },
]

// ============== Main Scanner Function ==============

export async function scanWebsite(url: string): Promise<WebsiteScanResult> {
  const findings: Finding[] = []
  const startTime = Date.now()
  let headers: Record<string, string> = {}

  // Validate URL before attempting fetch
  const urlObj = safeParseUrl(url)
  if (!urlObj) {
    throw new Error(`Invalid URL format: ${url}`)
  }

  try {
    const { finalUrl, html, headers: responseHeaders } = await fetchPublicHtml(url)

    headers = normalizeHeaders(responseHeaders)
    const finalUrlObj = safeParseUrl(finalUrl) ?? urlObj

    const $ = cheerio.load(html)

    // 1) HTML body + URL pattern checks
    for (const check of SECURITY_CHECKS) {
      const isTriggered = safeCheck(() => check.check($, finalUrl))
      if (isTriggered) {
        const finding = buildFinding(check)
        const scored = scoreFinding(finding, { filePath: finalUrl, snippet: finding.snippet })
        findings.push({ ...finding, ...scored })
      }
    }

    // 2) HTTP header misconfiguration checks
    try {
      const headerFindings = analyzeHeaders(headers)
      for (const f of headerFindings) {
        findings.push({ ...f, ...scoreFinding(f, { filePath: finalUrl }) })
      }
    } catch (headerError) {
      console.error('Header analysis failed:', headerError)
    }
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error(`Website scan timed out after 15 seconds. Try a faster website.`)
    }
    throw new Error(`Failed to fetch website: ${error.message}`)
  }

  // 3) Sensitive-path exposure probes (parallel, capped, isolated per-probe)
  const pathFindings = await runPathProbes(urlObj)
  for (const f of pathFindings) {
    findings.push({ ...f, ...scoreFinding(f, { filePath: urlObj.toString() }) })
  }

  // Calculate severity counts
  const severityCounts = initSeverityCounts()
  for (const f of findings) {
    if (f.severity in severityCounts) {
      severityCounts[f.severity]++
    }
  }

  return {
    findings,
    severityCounts,
    scannedUrls: 1,
    scanDuration: Date.now() - startTime,
  }
}