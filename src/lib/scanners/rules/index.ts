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
    severity: 'high',
    title: 'Permissive CORS Configuration',
    description: 'CORS is configured to allow all origins (*). APIs allowing credentials with wildcard origin are vulnerable to cross-site request forgery. Wildcard origins also allow any website to make requests to your API (CWE-942: Permissive Cross-Domain Whitelist).',
    remediation: 'Restrict CORS to specific trusted origins. Never use * with Access-Control-Allow-Credentials: true. Use environment variables to configure allowed origins: app.use(cors({ origin: process.env.ALLOWED_ORIGIN })).',
  },
  {
    id: 'SEC-011',
    pattern: /__VUE__|Vue\.config\.devtools\s*=\s*true|vue-devtools|enableProdPreview|__VUE_OPTIONS_API__|__VUE_PROD_DEVTOOLS__/gi,
    severity: 'high',
    title: 'Vue Devtools or Debug Mode Enabled in Production',
    description: 'Vue app exposes development tools or has debug mode enabled in production. __VUE__ global, Vue.config.devtools=true, or Vue Devtools integration found in code served to browsers, allowing attackers to inspect component state and potentially inject code.',
    remediation: 'In Vue 3: set Vue.config.devtools = false in production. Ensure process.env.NODE_ENV === \'production\' to disable all dev tools. Remove any __VUE_OPTIONS_API__ or __VUE_PROD_DEVTOOLS__ flags set to true.',
  },
  {
    id: 'SEC-012',
    pattern: /__REACT_DEVTOOLS_GLOBAL_HOOK__|window\.__REDUX_DEVTOOLS_EXTENSION__|reduxDevtools|enableDevTools\s*[=:]/gi,
    severity: 'high',
    title: 'React/Redux DevTools Enabled in Production',
    description: 'React DevTools or Redux DevTools global hook is exposed in production code. Attackers can use these to inspect component tree, state, and props of a live production application.',
    remediation: 'Remove __REACT_DEVTOOLS_GLOBAL_HOOK__ references from production builds. Ensure devtools are only included in development builds. Use environment checks: if (process.env.NODE_ENV !== \'production\') { /* devtools */ }',
  },
  {
    id: 'SEC-013',
    pattern: /ng\.probe|enableDebugTools|\.productionMode\s*=\s*false|platformBrowser\.dynamic|BrowserModule\.withServerTransition|Angular\.module.*\.debug|provide\(.*Angular.*debug/i,
    severity: 'high',
    title: 'Angular Debug Tools Enabled in Production',
    description: 'Angular debug tools or production mode disabled in code. ng.probe(), enableDebugTools(), or productionMode=false found, allowing attackers to access component injectors and manipulate application state.',
    remediation: 'Ensure enableProdMode() is called in production builds to disable Angular debug tools. Remove any references to ng.probe or enableDebugTools from production code.',
  },
  {
    id: 'SEC-014',
    pattern: /(\.git\/config|\.git\/HEAD|\.git\/index|\.git\/ORIG_HEAD)/gi,
    severity: 'critical',
    title: 'Exposed .git Directory or Metadata',
    description: 'Reference to .git directory internals detected. If the .git directory is publicly accessible, attackers can download the entire source code, commit history, and potentially sensitive configuration. This is a critical information disclosure (CWE-552).',
    remediation: 'Block access to the .git directory in your web server configuration. Ensure .git is not in the public document root. Use: nginx: location ~ /\.git { deny all; } or Apache: <Directory ~ "\.git"> Require all denied </Directory>',
  },
  {
    id: 'SEC-015',
    pattern: /(?:debug\s*[=:]\s*true|DEBUG\s*[=:]\s*true|process\.env\.DEBUG|app\.use\(require\('express'\)\.logger|connect\.logger| Morgan|\.enable\('cors'\)|cors\s*\.\s*enabled|helmet\.csp\s*\.\s*disabled)/gi,
    severity: 'high',
    title: 'Debug Mode or Verbose Logging Enabled',
    description: 'Debug mode, verbose logging, or security middleware disabled detected in code. Debug endpoints or verbose logging in production can leak sensitive request data, internal paths, and stack traces (OWASP A10:2025).',
    remediation: 'Disable debug mode in production: process.env.NODE_ENV = \'production\'. Remove verbose logging (Morgan, connect.logger) from production. Ensure helmet.js CSP and other security middleware are not disabled.',
  },
  {
    id: 'SEC-016',
    pattern: /(\.env\.local|\.env\.development|\.env\.test|\.env\.production\.local)/gi,
    severity: 'critical',
    title: 'Local Environment File Reference',
    description: 'Reference to local environment files (.env.local, .env.development) detected. These files may contain machine-specific credentials, API keys, or secrets that should never be committed. .env.local takes precedence over .env and is meant for machine-specific overrides.',
    remediation: 'Ensure .env.local is in .gitignore. Never commit .env.local to version control. Use a secrets manager (AWS Secrets Manager, HashiCorp Vault) for production secrets.',
  },
  {
    id: 'SEC-017',
    pattern: /(config\.ya?ml|config\.json)[^\n]{0,100}?(?:aws|secret|password|token|api[_-]?key|credential|private|db_)/gi,
    severity: 'critical',
    title: 'Configuration File May Contain Secrets',
    description: 'A config.yml or config.json file is referenced near sensitive keywords (secret, password, token, api_key, aws, credential). Configuration files may be publicly accessible or committed to version control, leaking infrastructure secrets.',
    remediation: 'Move all secrets from config files to environment variables. Ensure config files are in .gitignore. Use secret management systems for production deployments. Never hardcode credentials in config files.',
  },
  {
    id: 'SEC-018',
    pattern: /(?:X-Content-Type-Options|x-content-type-options)[^\n]{0,50}?(?:noheader|missing|not.?set|none|false)/gi,
    severity: 'medium',
    title: 'X-Content-Type-Options Explicitly Disabled',
    description: 'X-Content-Type-Options is explicitly set to an insecure value or disabled. Without nosniff, browsers may MIME-sniff responses and execute content as a different type, enabling XSS via content-type confusion attacks.',
    remediation: 'Set X-Content-Type-Options: nosniff on all responses. Ensure this header is not removed or set to empty/0.',
  },
  {
    id: 'SEC-019',
    pattern: /(?:process\.env\.|getenv\(|os\.environ|\$\{.*\})[^\n]{0,100}?(?:DEBUG|debug|verbose|log[_-]?level|log[_-]?enabled)/gi,
    severity: 'low',
    title: 'Debug Environment Variables Referenced',
    description: 'Debug-related environment variables (DEBUG, VERBOSE, LOG_LEVEL) are referenced in code. While not directly harmful, debug flags in production can enable verbose logging that leaks sensitive information.',
    remediation: 'Use structured logging with appropriate log levels. Ensure DEBUG=false and LOG_LEVEL=error/warn in production environments. Review logs before shipping.',
  },
  {
    id: 'ERRHAND002',
    pattern: /(?:disableExpressErrorHandler|app\.use\(errorHandler\)|errorHandler\s*[=:]\s*false|process\.on\s*\(\s*['"]uncaughtException|process\.on\s*\(\s*['"]unhandledRejection)[^\n]{0,100}?(?:false|null|0|disabled|skip)/gi,
    severity: 'high',
    title: 'Global Exception Handler Disabled or Bypassed',
    description: 'Global exception/error handlers are disabled, skipped, or set to no-op. Without proper error handling, uncaught exceptions crash the process and may expose stack traces, internal state, or configuration details to users (OWASP A10:2025).',
    remediation: 'Always implement global error handlers that log details server-side and return generic error messages to users. Never set error handlers to false, null, or skip them in production.',
  },
  {
    id: 'CORS002',
    pattern: /(?:Access-Control-Allow-Credentials\s*[=:]|credentials\s*[=:])[^\n]{0,50}?true[^\n]{0,50}?(?:Access-Control-Allow-Origin|origin)[^\n]{0,50}?\*/gi,
    severity: 'critical',
    title: 'CORS Allows Credentials with Wildcard Origin',
    description: 'Access-Control-Allow-Credentials is set to true while Access-Control-Allow-Origin is *. This is a critical CORS misconfiguration — browsers will reject this combination, but if a workaround is used, it allows any website to send authenticated requests to your API (CWE-346).',
    remediation: 'Never use Access-Control-Allow-Origin: * with Access-Control-Allow-Credentials: true. Use a specific origin string or implement dynamic origin validation: origin: (origin, cb) => cb(null, allowedOrigins.includes(origin))',
  },
  {
    id: 'AUTH001',
    pattern: /(?:jwt\.sign|jwt\.verify|sign\(.*\)[:.]|jsonwebtoken)[^\n]{0,100}?(?:algorithm\s*[=:]|ALGORITHM)[^\n]{0,50}?(?:HS256|HS512|'none'|none|"none")/gi,
    severity: 'critical',
    title: 'JWT Algorithm Confusion or None Algorithm',
    description: 'JWT (JSON Web Token) code uses a weak or misconfigured algorithm. Using \'none\' algorithm allows attackers to forge tokens. Using symmetric keys (HS*) with asymmetric algorithms exposes the secret. This can lead to complete authentication bypass (CWE-347).',
    remediation: 'Use RS256 or ES256 algorithm for JWTs. Never accept the \'none\' algorithm. Never use HS256 with a public key. Validate algorithm matches expected type. Use a library like jose that prevents algorithm confusion attacks.',
  },
  {
    id: 'RATE001',
    pattern: /(?:rateLimit|ratelimit|rate[_-]?limit|throttle|maxReq|max[_-]?requests)[^\n]{0,50}?(?:disabled|false|null|0|no[_-]?limit|unlimited|infinity)/gi,
    severity: 'high',
    title: 'Rate Limiting Explicitly Disabled',
    description: 'Rate limiting is explicitly disabled or set to unlimited. Without rate limiting, endpoints are vulnerable to brute force attacks, API abuse, and denial of service (OWASP A04:2021/A07:2023).',
    remediation: 'Enable rate limiting on all public endpoints, especially authentication, search, and data retrieval endpoints. Use libraries like express-rate-limit or a WAF. Set reasonable limits based on expected legitimate usage.',
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
    severity: 'high',
    title: 'Content-Security-Policy Missing',
    description: 'Content-Security-Policy header is not set. This helps prevent XSS and data injection attacks. CSP is one of the most effective defenses against cross-site scripting (OWASP A05:2025 - Security Misconfiguration).',
    remediation: 'Add a CSP header: Content-Security-Policy: default-src \'self\'; script-src \'self\' \'nonce-{random}\'; object-src \'none\'; base-uri \'self\'. Start with Content-Security-Policy-Report-Only in monitoring mode before enforcing.',
  },
  {
    id: 'WEB-002',
    header: 'strict-transport-security',
    severity: 'high',
    title: 'HSTS Header Missing',
    description: 'Strict-Transport-Security header is not set. Browsers won\'t enforce HTTPS, leaving users vulnerable to protocol downgrade attacks.',
    remediation: 'Add HSTS header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
  },
  {
    id: 'WEB-003',
    header: 'x-frame-options',
    severity: 'medium',
    title: 'X-Frame-Options Missing',
    description: 'X-Frame-Options header is not set. Site may be vulnerable to clickjacking attacks where an attacker embeds the page in an iframe.',
    remediation: 'Add X-Frame-Options: DENY or X-Frame-Options: SAMEORIGIN. Consider using CSP frame-ancestors directive for broader browser support.',
  },
  {
    id: 'WEB-004',
    header: 'x-content-type-options',
    severity: 'medium',
    title: 'X-Content-Type-Options Missing (MIME Sniffing Enabled)',
    description: 'X-Content-Type-Options header is not set. Browsers may MIME-sniff the response and execute content even when it\'s not the declared type, enabling XSS attacks via uploaded files (OWASP A05:2025).',
    remediation: 'Add X-Content-Type-Options: nosniff to prevent browsers from MIME-sniffing responses away from the declared Content-Type.',
  },
  {
    id: 'WEB-005',
    header: 'referrer-policy',
    severity: 'low',
    title: 'Referrer-Policy Header Missing',
    description: 'Referrer-Policy header is not set. The Referer header may leak sensitive URL information (URL parameters, path fragments) to external sites.',
    remediation: 'Add Referrer-Policy: strict-origin-when-cross-origin or Referrer-Policy: no-referrer to control what information is sent with the Referer header.',
  },
  {
    id: 'WEB-006',
    header: 'permissions-policy',
    severity: 'low',
    title: 'Permissions-Policy Header Missing',
    description: 'Permissions-Policy (formerly Feature-Policy) header is not set. Unused browser features like camera, microphone, geolocation, or payment handler may be exploitable by attackers.',
    remediation: 'Add Permissions-Policy header to disable unused features: Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  {
    id: 'WEB-007',
    header: 'x-powered-by',
    severity: 'low',
    title: 'X-Powered-By Header Discloses Technology Stack',
    description: 'X-Powered-By header reveals the server technology (e.g., Express, PHP, ASP.NET). Attackers use this to target known vulnerabilities for specific frameworks.',
    remediation: 'Remove the X-Powered-By header or set it to a generic value. In Express: app.disable(\'x-powered-by\'). In IIS: remove the header via web.config.',
  },
  {
    id: 'WEB-008',
    header: 'server',
    severity: 'low',
    title: 'Server Header Discloses Version Information',
    description: 'Server header reveals the web server name and version (e.g., Apache/2.4.52, nginx/1.18.0). Attackers use this to identify known vulnerabilities for specific server versions.',
    remediation: 'Configure your web server to suppress or genericize the Server header. In nginx: server_tokens off; In Apache: ServerTokens Prod',
  },
  {
    id: 'WEB-009',
    header: 'rate-limiting',
    severity: 'medium',
    title: 'Rate Limiting Headers Missing',
    description: 'No rate limiting headers detected (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After). Without rate limiting, APIs and login endpoints are vulnerable to brute force attacks.',
    remediation: 'Implement rate limiting on sensitive endpoints. Return headers like X-RateLimit-Limit: 100, X-RateLimit-Remaining: 95, and Retry-After for 429 responses.',
  },
  {
    id: 'WEB-010',
    header: 'cross-origin-opener-policy',
    severity: 'medium',
    title: 'Cross-Origin-Opener-Policy (COOP) Header Missing',
    description: 'COOP header is not set. Without COOP, your page can be opened by cross-origin documents in the same browsing context group, enabling Spectre-style speculative execution attacks (OWASP A05:2025).',
    remediation: 'Add Cross-Origin-Opener-Policy: same-origin to isolate your browsing context from cross-origin documents.',
  },
  {
    id: 'WEB-011',
    header: 'cross-origin-resource-policy',
    severity: 'medium',
    title: 'Cross-Origin-Resource-Policy (CORP) Header Missing',
    description: 'CORP header is not set. Without CORP, your resources can be loaded by other origins, enabling clickjacking, timing attacks, and data theft (OWASP A05:2025).',
    remediation: 'Add Cross-Origin-Resource-Policy: same-origin (or cross-origin if you need to allow embedding).',
  },
  {
    id: 'WEB-012',
    header: 'cross-origin-embedder-policy',
    severity: 'low',
    title: 'Cross-Origin-Embedder-Policy (COEP) Header Missing',
    description: 'COEP header is not set. Without COEP, cross-origin resources without explicit permission cannot be embedded, blocking access to features like SharedArrayBuffer, performance.measureMemory, and otp-credentials (OWASP A05:2025).',
    remediation: 'Add Cross-Origin-Embedder-Policy: require-corp if you need cross-origin isolation for features like SharedArrayBuffer.',
  },
]

export const PATH_CHECKS = [
  { path: '/.env', severity: 'critical' as Severity, title: '.env File Accessible', remediation: 'Block access to .env files in web server config. Ensure .env is never in the public document root.' },
  { path: '/.env.local', severity: 'critical' as Severity, title: '.env.local File Accessible', remediation: 'Block access to .env.local files. These contain machine-specific overrides and may have more secrets than .env.' },
  { path: '/.env.development', severity: 'high' as Severity, title: '.env.development File Accessible', remediation: 'Block access to .env.development files. Development env files may contain debug flags and dev-only credentials.' },
  { path: '/.git/config', severity: 'critical' as Severity, title: '.git/config Accessible (CWE-552)', remediation: 'Block access to the entire .git directory. Attackers can download full source code from .git/config if publicly accessible. Nginx: location ~ /\.git { deny all; } Apache: <Directory ~ "\.git"> Require all denied </Directory>' },
  { path: '/.git/HEAD', severity: 'critical' as Severity, title: '.git/HEAD Accessible', remediation: 'Block access to .git/HEAD which reveals branch names and commit refs.' },
  { path: '/.git', severity: 'critical' as Severity, title: '.git Directory Fully Accessible', remediation: 'The entire .git directory must be blocked. It contains history, commits, and potentially sensitive config.' },
  { path: '/config.yml', severity: 'high' as Severity, title: 'config.yml Exposed', remediation: 'Block access to config.yml. Configuration files may contain database credentials, API keys, or infrastructure secrets.' },
  { path: '/config.yaml', severity: 'high' as Severity, title: 'config.yaml Exposed', remediation: 'Block access to config.yaml files.' },
  { path: '/config.json', severity: 'high' as Severity, title: 'config.json Exposed', remediation: 'Block access to config.json. Do not serve config files from the public document root.' },
  { path: '/admin', severity: 'high' as Severity, title: 'Admin Panel Exposed', remediation: 'Protect admin routes with strong authentication, rate limiting, and IP allowlisting. Add to robots.txt to discourage indexing.' },
  { path: '/wp-admin', severity: 'high' as Severity, title: 'WordPress Admin Exposed', remediation: 'Protect WordPress admin with strong authentication, 2FA, and security plugins. Consider hiding wp-admin behind a VPN.' },
  { path: '/debug', severity: 'critical' as Severity, title: 'Debug Endpoints Exposed (OWASP A10:2025)', remediation: 'Disable debug mode in production. Debug endpoints leak stack traces, environment variables, and internal state. Remove /debug, /trace, /actuator routes from production.' },
  { path: '/api/debug', severity: 'critical' as Severity, title: 'API Debug Endpoint Exposed (OWASP A10:2025)', remediation: 'Remove all debug API endpoints from production. Debug endpoints are a primary target for information disclosure attacks.' },
  { path: '/actuator/health', severity: 'medium' as Severity, title: 'Spring Boot Actuator Health Exposed', remediation: 'Restrict /actuator to internal networks only. Do not expose /actuator/env, /actuator/heapdump, or /actuator/loggers in production.' },
  { path: '/actuator', severity: 'high' as Severity, title: 'Spring Boot Actuator Fully Exposed', remediation: 'Restrict all actuator endpoints to internal networks. Use Spring Security to protect actuator with authentication.' },
  { path: '/trace', severity: 'high' as Severity, title: 'Trace Endpoint Exposed', remediation: 'Remove trace/debug endpoints. HTTP TRACE method and /trace routes expose request headers and internal routing.' },
  { path: '/.aws/credentials', severity: 'critical' as Severity, title: 'AWS Credentials File Exposed', remediation: 'Never place AWS credentials in web-accessible directories. Use IAM roles, environment variables, or AWS Secrets Manager instead.' },
  { path: '/id_rsa', severity: 'critical' as Severity, title: 'SSH Private Key Exposed', remediation: 'Never place private keys in web directories. Use SSH agent forwarding or secret management systems.' },
  { path: '/backup', severity: 'high' as Severity, title: 'Backup Directory Exposed', remediation: 'Block access to backup directories. Backups may contain full application state and data.' },
  { path: '/.svn', severity: 'high' as Severity, title: 'Subversion (.svn) Directory Exposed', remediation: 'Block access to .svn directories. Like .git, these expose version control history.' },
  { path: '/.hg', severity: 'high' as Severity, title: 'Mercurial (.hg) Directory Exposed', remediation: 'Block access to .hg directories.' },
  { path: '/phpinfo.php', severity: 'high' as Severity, title: 'phpinfo() Page Exposed', remediation: 'Remove phpinfo.php from production. phpinfo() reveals PHP version, extensions, paths, and server configuration.' },
  { path: '/server-status', severity: 'medium' as Severity, title: 'Apache Server Status Exposed', remediation: 'Disable Apache mod_status or restrict it to localhost. Server status pages leak server details and traffic patterns.' },
  { path: '/.well-known/security.txt', severity: 'low' as Severity, title: 'security.txt Found', remediation: 'This is expected and recommended. Ensure the security.txt contact information is correct and the file is properly formatted.' },
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
