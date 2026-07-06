module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/security-headers.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "applySecurityHeaders",
    ()=>applySecurityHeaders,
    "buildCorsHeaders",
    ()=>buildCorsHeaders,
    "isProduction",
    ()=>isProduction,
    "jsonWithSecurity",
    ()=>jsonWithSecurity,
    "securityHeaders",
    ()=>securityHeaders
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
const DEFAULT_ALLOWED_ORIGINS = [
    'https://vibe-checker-beta-umber.vercel.app',
    'https://vibe-checker.69-6-206-26.sslip.io'
];
const securityHeaders = {
    'Content-Security-Policy': [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "style-src 'self' 'unsafe-inline'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "connect-src 'self' https://*.supabase.co https://api.github.com",
        "upgrade-insecure-requests"
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
};
function applySecurityHeaders(response) {
    for (const [header, value] of Object.entries(securityHeaders)){
        response.headers.set(header, value);
    }
    return response;
}
function parseAllowedOrigins() {
    const configured = process.env.ALLOWED_ORIGINS?.split(',').map((origin)=>origin.trim()).filter(Boolean);
    return configured?.length ? configured : DEFAULT_ALLOWED_ORIGINS;
}
function buildCorsHeaders(request, methods = 'GET, POST, OPTIONS') {
    const origin = request.headers.get('origin');
    const allowedOrigins = parseAllowedOrigins();
    const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
    return {
        ...securityHeaders,
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': methods,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin'
    };
}
function jsonWithSecurity(request, body, init = {}, methods) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(body, {
        ...init,
        headers: {
            ...buildCorsHeaders(request, methods),
            ...init.headers || {}
        }
    });
}
function isProduction() {
    return ("TURBOPACK compile-time value", "development") === 'production';
}
}),
"[externals]/node:dns/promises [external] (node:dns/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:dns/promises", () => require("node:dns/promises"));

module.exports = mod;
}),
"[externals]/node:net [external] (node:net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:net", () => require("node:net"));

module.exports = mod;
}),
"[project]/src/lib/network-security.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertPublicHttpUrl",
    ()=>assertPublicHttpUrl,
    "fetchPublicHtml",
    ()=>fetchPublicHtml,
    "isBlockedAddress",
    ()=>isBlockedAddress
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$dns$2f$promises__$5b$external$5d$__$28$node$3a$dns$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:dns/promises [external] (node:dns/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:net [external] (node:net, cjs)");
;
;
const MAX_REDIRECTS = 3;
const DEFAULT_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_BYTES = 2_000_000;
const LOCAL_HOSTNAMES = new Set([
    'localhost',
    'localhost.localdomain',
    'ip6-localhost',
    'ip6-loopback'
]);
function parseIPv4(address) {
    if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(address)) return null;
    const parts = address.split('.').map(Number);
    if (parts.some((part)=>part < 0 || part > 255)) return null;
    return parts;
}
function isPrivateIPv4(address) {
    const parts = parseIPv4(address);
    if (!parts) return false;
    const [a, b] = parts;
    return a === 0 || a === 10 || a === 127 || a === 100 && b >= 64 && b <= 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 0 || a === 192 && b === 168 || a === 198 && (b === 18 || b === 19) || a >= 224;
}
function isPrivateIPv6(address) {
    const normalized = address.toLowerCase();
    return normalized === '::1' || normalized === '::' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb') || normalized.startsWith('::ffff:127.') || normalized.startsWith('::ffff:10.') || normalized.startsWith('::ffff:192.168.') || /^::ffff:172\.(1[6-9]|2\d|3[01])\./.test(normalized) || normalized.startsWith('::ffff:169.254.');
}
function isBlockedAddress(address) {
    const ipVersion = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$net__$5b$external$5d$__$28$node$3a$net$2c$__cjs$29$__["default"].isIP(address);
    if (ipVersion === 4) return isPrivateIPv4(address);
    if (ipVersion === 6) return isPrivateIPv6(address);
    return false;
}
async function assertPublicHttpUrl(rawUrl) {
    const parsed = new URL(rawUrl);
    if (![
        'http:',
        'https:'
    ].includes(parsed.protocol)) {
        throw new Error('Only http and https URLs can be scanned');
    }
    const hostname = parsed.hostname.toLowerCase();
    if (LOCAL_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost')) {
        throw new Error('Localhost URLs are not allowed');
    }
    if (isBlockedAddress(hostname)) {
        throw new Error('Private, loopback, multicast, or link-local addresses are not allowed');
    }
    const records = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$dns$2f$promises__$5b$external$5d$__$28$node$3a$dns$2f$promises$2c$__cjs$29$__["default"].lookup(hostname, {
        all: true,
        verbatim: true
    });
    if (records.length === 0) {
        throw new Error('DNS lookup returned no addresses');
    }
    const blockedRecord = records.find((record)=>isBlockedAddress(record.address));
    if (blockedRecord) {
        throw new Error(`Hostname resolves to a non-public address (${blockedRecord.family})`);
    }
    return parsed;
}
async function readLimitedText(response) {
    const contentLength = response.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_RESPONSE_BYTES) {
        throw new Error('Website response too large (>2MB). Aborting scan.');
    }
    if (!response.body) return response.text();
    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    while(true){
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        total += value.byteLength;
        if (total > MAX_RESPONSE_BYTES) {
            await reader.cancel();
            throw new Error('Website response too large (>2MB). Aborting scan.');
        }
        chunks.push(value);
    }
    return new TextDecoder().decode(Buffer.concat(chunks));
}
async function fetchPublicHtml(rawUrl) {
    let currentUrl = rawUrl;
    for(let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++){
        const parsed = await assertPublicHttpUrl(currentUrl);
        const response = await fetch(parsed.toString(), {
            headers: {
                'User-Agent': 'VibeChecker/1.0 Security Scanner (+https://vibe-checker.69-6-206-26.sslip.io)',
                Accept: 'text/html,application/xhtml+xml'
            },
            redirect: 'manual',
            signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
        });
        if ([
            301,
            302,
            303,
            307,
            308
        ].includes(response.status)) {
            const location = response.headers.get('location');
            if (!location) throw new Error('Redirect response missing Location header');
            currentUrl = new URL(location, parsed).toString();
            continue;
        }
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type') || '';
        if (contentType && !/text\/html|application\/xhtml\+xml/i.test(contentType)) {
            throw new Error('Website response is not HTML');
        }
        const html = await readLimitedText(response);
        return {
            finalUrl: parsed.toString(),
            html,
            headers: response.headers
        };
    }
    throw new Error('Too many redirects while fetching website');
}
}),
"[project]/src/lib/validation.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Input validation utilities for VibeChecker
 * Centralized validation logic to avoid code duplication across API routes
 */ __turbopack_context__.s([
    "checkRateLimit",
    ()=>checkRateLimit,
    "cleanupRateLimitStore",
    ()=>cleanupRateLimitStore,
    "parseGitHubUrl",
    ()=>parseGitHubUrl,
    "validateGitHubUrl",
    ()=>validateGitHubUrl,
    "validateUrl",
    ()=>validateUrl,
    "validateWebsiteUrl",
    ()=>validateWebsiteUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$network$2d$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/network-security.ts [app-route] (ecmascript)");
;
// ============== URL Validation ==============
const HTTPS_PROTOCOL = 'https:';
const HTTP_PROTOCOL = 'http:';
const GITHUB_HOSTNAME = 'github.com';
function validateUrl(url) {
    if (!url || typeof url !== 'string') {
        return {
            valid: false,
            error: 'URL is required',
            code: 'URL_REQUIRED'
        };
    }
    const trimmed = url.trim();
    if (trimmed.length === 0) {
        return {
            valid: false,
            error: 'URL cannot be empty',
            code: 'URL_EMPTY'
        };
    }
    if (trimmed.length > 2000) {
        return {
            valid: false,
            error: 'URL is too long (max 2000 characters)',
            code: 'URL_TOO_LONG'
        };
    }
    try {
        const parsed = new URL(trimmed);
        return {
            valid: true
        };
    } catch  {
        return {
            valid: false,
            error: 'Invalid URL format',
            code: 'URL_INVALID_FORMAT'
        };
    }
}
function validateWebsiteUrl(url) {
    const baseValidation = validateUrl(url);
    if (!baseValidation.valid) {
        return baseValidation;
    }
    try {
        const parsed = new URL(url.trim());
        if (parsed.protocol !== HTTPS_PROTOCOL && parsed.protocol !== HTTP_PROTOCOL) {
            return {
                valid: false,
                error: 'Website URL must use http or https protocol',
                code: 'URL_INVALID_PROTOCOL'
            };
        }
        if (!parsed.hostname || parsed.hostname.length < 3) {
            return {
                valid: false,
                error: 'Invalid hostname',
                code: 'URL_INVALID_HOSTNAME'
            };
        }
        // Fast synchronous checks. The scanner performs DNS resolution and
        // redirect validation before making any network request.
        const hostname = parsed.hostname.toLowerCase();
        const blockedHosts = [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            '::1'
        ];
        if (blockedHosts.includes(hostname)) {
            return {
                valid: false,
                error: 'Localhost URLs are not allowed',
                code: 'URL_LOCALHOST_BLOCKED'
            };
        }
        if (hostname.endsWith('.localhost')) {
            return {
                valid: false,
                error: 'Localhost URLs are not allowed',
                code: 'URL_LOCALHOST_BLOCKED'
            };
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$network$2d$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isBlockedAddress"])(hostname)) {
            return {
                valid: false,
                error: 'Private, loopback, multicast, or link-local addresses are not allowed',
                code: 'URL_PRIVATE_IP_BLOCKED'
            };
        }
        return {
            valid: true
        };
    } catch  {
        return {
            valid: false,
            error: 'Invalid URL format',
            code: 'URL_PARSE_ERROR'
        };
    }
}
function validateGitHubUrl(url) {
    const baseValidation = validateUrl(url);
    if (!baseValidation.valid) {
        return baseValidation;
    }
    try {
        const parsed = new URL(url.trim());
        if (parsed.hostname !== GITHUB_HOSTNAME) {
            return {
                valid: false,
                error: 'Only GitHub repositories are supported',
                code: 'URL_NOT_GITHUB'
            };
        }
        const pathParts = parsed.pathname.split('/').filter(Boolean);
        if (pathParts.length < 2) {
            return {
                valid: false,
                error: 'GitHub URL must be in format: https://github.com/owner/repo',
                code: 'URL_GITHUB_INVALID_FORMAT'
            };
        }
        return {
            valid: true
        };
    } catch  {
        return {
            valid: false,
            error: 'Invalid GitHub URL format',
            code: 'URL_PARSE_ERROR'
        };
    }
}
function parseGitHubUrl(url) {
    const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+?)(?:\/tree\/([^\/]+))?(?:\.git)?$/,
        /github\.com\/([^\/]+)\/([^\/]+)$/
    ];
    for (const pattern of patterns){
        const match = url.match(pattern);
        if (match) {
            return {
                owner: match[1],
                repo: match[2].replace('.git', ''),
                branch: match[3] || undefined,
                isValid: true
            };
        }
    }
    return {
        owner: '',
        repo: '',
        isValid: false
    };
}
// ============== Rate Limiting ==============
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute
;
const MAX_REQUESTS_PER_WINDOW = 20;
const MIN_REQUEST_INTERVAL_MS = 500 // 500ms between requests
;
const rateLimitStore = new Map();
function checkRateLimit(clientId) {
    const now = Date.now();
    const entry = rateLimitStore.get(clientId);
    // No previous requests from this client
    if (!entry) {
        rateLimitStore.set(clientId, {
            count: 1,
            windowStart: now,
            lastRequestTime: now
        });
        return {
            allowed: true,
            remainingRequests: MAX_REQUESTS_PER_WINDOW - 1
        };
    }
    // Reset window if expired
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.set(clientId, {
            count: 1,
            windowStart: now,
            lastRequestTime: now
        });
        return {
            allowed: true,
            remainingRequests: MAX_REQUESTS_PER_WINDOW - 1
        };
    }
    // Check minimum interval between requests
    if (now - entry.lastRequestTime < MIN_REQUEST_INTERVAL_MS) {
        return {
            allowed: false,
            retryAfter: MIN_REQUEST_INTERVAL_MS - (now - entry.lastRequestTime)
        };
    }
    // Check request count limit
    if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
        const retryAfter = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
        return {
            allowed: false,
            retryAfter
        };
    }
    // Allow request
    entry.count++;
    entry.lastRequestTime = now;
    rateLimitStore.set(clientId, entry);
    return {
        allowed: true,
        remainingRequests: MAX_REQUESTS_PER_WINDOW - entry.count
    };
}
function cleanupRateLimitStore() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()){
        if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
            rateLimitStore.delete(key);
        }
    }
}
}),
"[project]/src/lib/scanners/rules/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GITHUB_SCANNER_RULES",
    ()=>GITHUB_SCANNER_RULES,
    "HEADER_CHECKS",
    ()=>HEADER_CHECKS,
    "PATH_CHECKS",
    ()=>PATH_CHECKS,
    "SUPABASE_FILE_PATTERNS",
    ()=>SUPABASE_FILE_PATTERNS,
    "checkSupabaseCredentials",
    ()=>checkSupabaseCredentials,
    "scanContent",
    ()=>scanContent
]);
const SUPABASE_FILE_PATTERNS = [
    /\.env(?:\.local|\.development|\.production)?$/i,
    /supabase\.ts$/i,
    /supabase[/\\]client/i,
    /lib[/\\]supabase/i,
    /[/\\]config\.ts$/i,
    /[/\\]config\.js$/i
];
function checkSupabaseCredentials(content, filePath) {
    const hasSupabaseFile = SUPABASE_FILE_PATTERNS.some((p)=>p.test(filePath));
    if (!hasSupabaseFile) return false;
    // Simple string-based detection for Supabase keys (avoids regex literal issues)
    const lower = content.toLowerCase();
    const indicators = [
        "supabase_anon_key",
        "supabase_service_role_key",
        "supabase_api_key",
        "sb_",
        "anon key",
        "service_role"
    ];
    const hasIndicator = indicators.some((i)=>lower.includes(i));
    if (!hasIndicator) return false;
    // Check for JWT-like patterns (base64 encoded)
    const jwtPattern = /[a-zA-Z0-9_-]{50,}\.eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/g;
    const hasJwt = jwtPattern.test(content);
    // Check for long base64-like strings that could be keys
    const longKeyPattern = /["'][a-zA-Z0-9_-]{40,}["']/g;
    const hasLongKey = longKeyPattern.test(content);
    return hasJwt || hasLongKey;
}
// ============== SUPABASE RLS RULES (OWASP A01:2021) ==============
function checkSupabaseRLSMissing(content, filePath) {
    if (!/\.(sql|migration)$/i.test(filePath) && !/supabase[/\\]/.test(filePath) && !/migration/i.test(filePath)) {
        return false;
    }
    const hasCreateTable = /CREATE\s+TABLE/i.test(content);
    if (!hasCreateTable) return false;
    const hasRLSKeyword = /row\s*level\s*security|rls/i.test(content);
    if (hasRLSKeyword) {
        return !/ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.test(content);
    }
    return true;
}
function checkOverlyPermissivePolicy(content, filePath) {
    if (!/\.(sql|ts|tsx)$/i.test(filePath)) return false;
    return /FOR\s+ALL|USING\s*\(\s*true\s*\)|FOR\s+SELECT\s+TO\s+authenticated/i.test(content);
}
function checkServiceRoleInClient(content, filePath) {
    const isServerContext = /\+server\.ts$|api[/\\]|server[/\\]|\.server\./i.test(filePath);
    const isBrowserCode = /\.(tsx?|jsx?|page\.tsx?|component\.tsx?)$/i.test(filePath);
    if (isBrowserCode && !isServerContext) {
        return /service[_-]?role[_-]?key|serviceRoleKey|SUPABASE_SERVICE_ROLE/i.test(content);
    }
    return false;
}
function checkMissingOwnership(content, filePath) {
    if (!/\.(sql|ts|tsx)$/i.test(filePath)) return false;
    const policyPattern = /CREATE\s+POLICY[\s\S]+?USING\s*\([\s\S]+?auth\.uid\(\s*\)/gi;
    const matches = content.match(policyPattern) || [];
    for (const match of matches){
        if (!/user_id|owner_id|profile_id|profileId/i.test(match)) {
            return true;
        }
    }
    return false;
}
function checkSupabaseRLS(content, filePath) {
    const findings = [];
    if (checkSupabaseRLSMissing(content, filePath)) {
        findings.push({
            id: "SUPABASE-RLS001-rls",
            ruleId: "SUPABASE-RLS001",
            severity: "critical",
            title: "Supabase Table Without RLS Enabled (OWASP A01:2021)",
            description: "A database table appears to be created without Row Level Security (RLS) enabled. Without RLS, all authenticated users can access all rows.",
            filePath,
            remediation: "Enable RLS on all tables: ALTER TABLE table_name ENABLE ROW LEVEL SECURITY; Create policies for each operation."
        });
    }
    if (checkOverlyPermissivePolicy(content, filePath)) {
        findings.push({
            id: "SUPABASE-RLS002-policy",
            ruleId: "SUPABASE-RLS002",
            severity: "high",
            title: "Overly Permissive Supabase RLS Policy (OWASP A01:2021)",
            description: "An RLS policy allows access to all authenticated users without proper row-level filtering.",
            filePath,
            remediation: "Create specific policies that filter by user ownership using auth.uid() = column_name pattern."
        });
    }
    if (checkServiceRoleInClient(content, filePath)) {
        findings.push({
            id: "SUPABASE-RLS003-service",
            ruleId: "SUPABASE-RLS003",
            severity: "critical",
            title: "Supabase Service Role Key Exposed (OWASP A01:2021)",
            description: "Supabase service role key found in client-side code. This bypasses all RLS and grants full database access.",
            filePath,
            remediation: "Never use service role key in browser code. Use SUPABASE_ANON_KEY for client-side operations."
        });
    }
    if (checkMissingOwnership(content, filePath)) {
        findings.push({
            id: "SUPABASE-RLS005-missing-ownership",
            ruleId: "SUPABASE-RLS005",
            severity: "high",
            title: "Missing User Ownership Check in Supabase Policy (OWASP A01:2021)",
            description: "RLS policy uses auth.uid() but does not filter by user ownership column.",
            filePath,
            remediation: "Add row ownership check: WHERE auth.uid() = user_id"
        });
    }
    return findings;
}
// ============== OWASP A01:2021 — BROKEN ACCESS CONTROL ==============
// IDOR: API route takes an id from URL/path without ownership check.
function checkIdorRoute(content, filePath) {
    const isApiRoute = /[/\\]app[\\/]api[\\/][^"'\s]+[/\\]route\.(ts|tsx|js|jsx)/i.test(filePath);
    if (!isApiRoute) return false;
    const usesParam = /params\.|req\.params|request\.params|URLSearchParams|searchParams|\.pathname|catch\s*\(\s*\{\s*params\b|\{\s*params\s*:\s*\{\s*id/i.test(content);
    if (!usesParam) return false;
    const hasOwnershipCheck = /auth\.uid\(\)|getUser\(|getSession\(|verifyToken|authoriz|ownsThis|userId\s*===|currentUser\.id\s*===/i.test(content);
    return !hasOwnershipCheck;
}
// ============== OWASP A02:2021 — CRYPTOGRAPHIC FAILURES ==============
// Use of broken hash algorithms (md5/sha1) for password or token storage.
function checkWeakHashing(content, filePath) {
    if (!/\.(ts|tsx|js|jsx)$/i.test(filePath)) return false;
    const hasHash = /crypto\.createHash|require\(['"]crypto['"]\)|from\s+['"]crypto['"]|hashlib\./i.test(content);
    if (!hasHash) return false;
    return /\bmd5\b|\bsha1\b/i.test(content);
}
// Plaintext password storage in a DB schema or migration file.
function checkPlaintextPasswordColumn(content, filePath) {
    if (!/\.(sql|prisma|ts|tsx|js|jsx)$/i.test(filePath)) return false;
    const hasPasswordColumn = /(password|passwd|pwd)\s+(varchar|text|string|String)/i.test(content);
    const hasHashingHint = /\b(bcrypt|argon2|scrypt|crypt)\b/i.test(content);
    return hasPasswordColumn && !hasHashingHint;
}
// ============== OWASP A04:2021 — INSECURE DESIGN ==============
// Hardcoded role check without server-side enforcement hint.
function checkHardcodedRoleCheck(content, filePath) {
    if (!/\.(ts|tsx|js|jsx)$/i.test(filePath)) return false;
    return /role\s*[!=]==\s*['"](?:admin|root|superuser|owner)['"]/i.test(content);
}
// ============== OWASP A07:2021 — IDENTIFICATION & AUTH FAILURES ==============
// JWT signed without expiry ("expiresIn") claim or no exp validation.
function checkJwtMissingExpiry(content, filePath) {
    if (!/\.(ts|tsx|js|jsx)$/i.test(filePath)) return false;
    const usesJwt = /jwt\.sign|jwt\.verify|jsonwebtoken|@nestjs\/jwt|fastify-jwt|express-jwt/i.test(content);
    if (!usesJwt) return false;
    const hasExpiry = /expiresIn|exp\s*:|jwt\.options|jwtid|exp\s*\)/i.test(content);
    return !hasExpiry;
}
// Cookie set without Secure/HttpOnly/SameSite flags.
function checkInsecureCookie(content, filePath) {
    if (!/\.(ts|tsx|js|jsx)$/i.test(filePath)) return false;
    const setsCookie = /res\.cookie\(|cookies\.set\(|setCookie\(|document\.cookie\s*=/i.test(content);
    if (!setsCookie) return false;
    const hasFlags = /httpOnly\s*:\s*true|secure\s*:\s*true|sameSite\s*:\s*['"](?:lax|strict|none)['"]|SameSite\s*=\s*(?:Lax|Strict)/i.test(content);
    return !hasFlags;
}
// ============== OWASP A08:2021 — SOFTWARE & DATA INTEGRITY FAILURES ==============
// Use of dangerous deserializers (node-serialize, eval, yaml.load).
function checkUnsafeDeserialization(content, filePath) {
    if (!/\.(ts|tsx|js|jsx)$/i.test(filePath)) return false;
    return /require\(['"]node-serialize['"]\)|require\(['"]serialize-javascript['"]\)|yaml\.load\(|pickle\.loads|yaml\.unsafe_load|JSON\.parse\(\s*req\.body/i.test(content);
}
// ============== OWASP A09:2021 — SECURITY LOGGING & MONITORING FAILURES ==============
// Auth route that returns success but has no logging hook nearby.
function checkAuthRouteWithoutLogging(content, filePath) {
    if (!/[/\\]app[\\/]api[\\/](?:login|auth|signin|signup|register|reset-password|verify)/i.test(filePath)) {
        return false;
    }
    const hasLogger = /logger\.|pino\.|winston\.|console\.(info|warn|error|log)|sentry|captureMessage|breadcrumb/i.test(content);
    return !hasLogger;
}
// ============== OWASP A10:2021 / 2025 — SSRF & EXCEPTIONAL CONDITIONS ==============
// User-controlled URL passed to fetch / axios / http without allowlist.
function checkPotentialSsrf(content, filePath) {
    if (!/\.(ts|tsx|js|jsx)$/i.test(filePath)) return false;
    const fetchesUserUrl = /(?:fetch|axios\.(?:get|post|put|delete|request)|got\(|http\.get|https\.get)\s*\(\s*(?:req\.body|req\.query|req\.params|params\.|searchParams|userUrl|targetUrl|inputUrl|url)/i.test(content);
    if (!fetchesUserUrl) return false;
    const hasAllowlist = /allowlist|allowList|allowedHosts|allowedDomains|isPrivateIp|ipRange|denyPrivate|validateUrl|safeUrl|isAllowedUrl/i.test(content);
    return !hasAllowlist;
}
// Unhandled promise rejection / unsafe await that swallows errors.
function checkSwallowedErrors(content, filePath) {
    if (!/\.(ts|tsx|js|jsx)$/i.test(filePath)) return false;
    return /\.catch\s*\(\s*\(\s*\)\s*=>\s*\{\s*\}\s*\)|\.catch\s*\(\s*\(\)\s*=>\s*null\s*\)/i.test(content);
}
// ============== XSS PREVENTION (OWASP Cheat Sheet) ==============
// Use of Function() constructor or setTimeout/setInterval with string body.
function checkCodeInjectionSink(content, filePath) {
    if (!/\.(ts|tsx|js|jsx)$/i.test(filePath)) return false;
    return /new\s+Function\s*\(|set(?:Timeout|Interval)\s*\(\s*['"`]|setImmediate\s*\(\s*['"`]/i.test(content);
}
// ============== SQL INJECTION PREVENTION (OWASP Cheat Sheet) ==============
// Prisma raw queries that interpolate parameters instead of using $queryRaw template.
function checkPrismaRawInjection(content, filePath) {
    if (!/\.(ts|tsx|js|jsx)$/i.test(filePath)) return false;
    return /\$executeRaw\s*\(\s*[`'"][^`'"]*\$\{|Prisma\.sql\s*\(\s*[`'"][^`'"]*\bSELECT\b[^`'"]*\$\{/i.test(content);
}
// ============== CRYPTO / SECRETS (hardening beyond existing rules) ==============
// Hardcoded fallback secret in process.env check (anti-pattern).
function checkHardcodedSecretFallback(content, filePath) {
    if (!/\.(ts|tsx|js|jsx)$/i.test(filePath)) return false;
    return /process\.env\.[A-Z_]+\s*\|\|\s*['"][A-Za-z0-9_\-]{12,}['"]/i.test(content);
}
// ============== CSRF (OWASP Cheat Sheet) ==============
// Next.js / Express form handler that mutates state but never checks CSRF token.
function checkMutatingRouteWithoutCsrf(content, filePath) {
    if (!/\.(ts|tsx|js|jsx)$/i.test(filePath)) return false;
    const isMutating = /export\s+(?:async\s+)?function\s+(?:POST|PUT|PATCH|DELETE)\b|router\.post\(|router\.put\(|router\.delete\(|router\.patch\(/i.test(content);
    if (!isMutating) return false;
    const hasCsrf = /csrf|csrfToken|csurf|samesite-token|origin\s*===|verifyCsrf|x-csrf-token/i.test(content);
    return !hasCsrf;
}
const GITHUB_SCANNER_RULES = [
    {
        id: "SUPABASE001",
        pattern: /(?:SUPABASE|supabase)[_-]?(?:ANON|SERVICE[_-]?ROLE|KEY|URL)[^\n]{0,50}["'][a-zA-Z0-9_-]{20,}["']/gi,
        severity: "critical",
        title: "Exposed Supabase Credentials",
        description: "Hardcoded Supabase API keys or service role keys found in source code. This allows full database access bypassing RLS policies.",
        remediation: "Use environment variables: process.env.SUPABASE_KEY. Never commit Supabase anon/service keys to version control. Add .env to .gitignore and use a secrets manager for production."
    },
    {
        id: "CSRF001",
        pattern: /(?:csrf|_csrf|xsrf|xsrf-token|csrftoken)[^\n]{0,50}?(?:missing|not.?found|no.?token|undefined|null)/gi,
        severity: "critical",
        title: "Missing CSRF Protection",
        description: "Potential missing CSRF protection detected. Forms or state-changing operations may be vulnerable to Cross-Site Request Forgery attacks. Found in 70% of vibe-coded apps.",
        remediation: "Implement CSRF tokens for all state-changing requests. Use the SameSite=Strict/Lax cookie attribute. Libraries like csurf (Express) or built-in framework CSRF protection can help."
    },
    {
        id: "SUPPLY001",
        pattern: /(?:"dependencies"|'dependencies')[\s\S]{0,3000}?"(?!node_modules|npm|typescript|react|next|vite|webpack|eslint|prettier|tailwind|@)[a-zA-Z0-9@_+./-]{1,50}"[\s:]+["0-9^~>=<.-]+/gi,
        severity: "high",
        title: "Suspicious Package Name (Slopsquatting Risk)",
        description: "A package dependency name looks suspicious — it may be an AI-hallucinated package name (slopsquatting). Attackers can register these non-existent package names to inject malware when developers run npm install.",
        remediation: "Verify each dependency exists in the official npm registry (npmjs.com). Remove unknown packages. Use package-lock.json to lock versions. Consider using tools like npm-audit or Snyk to validate dependencies."
    },
    {
        id: "ERRHAND001",
        pattern: /(?:stack[_-]?trace|stacktrace|error[_-]?stack|exception[_-]?trace)[^\n]{0,100}?(?:in|at|on|line)[^\n]{0,50}?\.(?:js|ts|tsx|jsx|py|rb|go|java|cs|php)/gi,
        severity: "high",
        title: "Exposed Stack Trace in Code",
        description: "Stack trace or debug error information found in source code. Exposing stack traces in production leaks framework version, internal paths, and code structure (OWASP A10:2025 - Mishandling of Exceptional Conditions).",
        remediation: "Remove stack traces from production code. Use structured error logging instead of printing errors directly. Implement global error handlers that return generic error messages to users."
    },
    {
        id: "SEC-001",
        pattern: /(?:api[_-]?key|apikey|api_secret|apiSecret)[^\n]{0,50}["']?(sk-|pk-|AIza|ghp_|gho_|eyJ|_[A-Z])[a-zA-Z0-9]{20,}/gi,
        severity: "critical",
        title: "API Key Detected",
        description: "Potential API key or secret found in code. This could allow unauthorized access to services.",
        remediation: "Remove API keys from code immediately. Use environment variables instead: process.env.API_KEY"
    },
    {
        id: "SEC-002",
        pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/gi,
        severity: "critical",
        title: "Private Key Detected",
        description: "Private cryptographic key found in source code. This is a critical security risk.",
        remediation: "Remove private keys from code immediately. Store them securely in environment variables or a secrets manager."
    },
    {
        id: "SEC-003",
        pattern: /\.env(?:\.local|\.development|\.production)?/gi,
        severity: "critical",
        title: ".env File Reference",
        description: "Reference to .env file detected. Verify it is not committed to the repository.",
        remediation: "Ensure .env files are in .gitignore and never committed. Use git-secrets or similar tools to prevent accidental commits."
    },
    {
        id: "SEC-004",
        pattern: /(?:password|passwd|pwd|secret)[^\n]{0,30}["'][^"']{6,32}["']/gi,
        severity: "high",
        title: "Hardcoded Password",
        description: "Potential hardcoded password found. Credentials should never be in source code.",
        remediation: "Move passwords to environment variables: process.env.DB_PASSWORD or use a secrets manager."
    },
    {
        id: "SEC-006",
        pattern: /\beval\s*\(/gi,
        severity: "high",
        title: "Eval Usage Detected",
        description: "Use of eval() detected. This can execute arbitrary code and is a major security risk.",
        remediation: "Replace eval() with safer alternatives. Use JSON.parse() for JSON, or restructure code to avoid dynamic execution."
    },
    {
        id: "SEC-007",
        pattern: /console\.(log|debug|info|warn|error)\s*\(/gi,
        severity: "low",
        title: "Console Statement",
        description: "Debug console statement found in code. Should be removed before production.",
        remediation: "Remove console statements or use a logging library with proper log levels for production."
    },
    {
        id: "SEC-008",
        pattern: /["'].*?(?:SELECT|INSERT|UPDATE|DELETE|DROP|UNION).*?(?:FROM|INTO|WHERE|TABLE).*?["'][+\s]/gi,
        severity: "critical",
        title: "SQL Injection Pattern",
        description: "Potential SQL injection vulnerability. User input may be concatenated directly into SQL queries.",
        remediation: "Use parameterized queries or an ORM. Never concatenate user input directly into SQL strings."
    },
    {
        id: "SEC-009",
        pattern: /(?:innerHTML|dangerouslySetInnerHTML|document\.write\s*\()/gi,
        severity: "high",
        title: "XSS Vulnerability Pattern",
        description: "Potential XSS vulnerability. User input may be rendered without sanitization.",
        remediation: "Sanitize user input before rendering. Use textContent instead of innerHTML, or use a sanitization library like DOMPurify."
    },
    {
        id: "SEC-010",
        pattern: /Access-Control-Allow-Origin[^\n]*[*:]/gi,
        severity: "high",
        title: "Permissive CORS Configuration",
        description: "CORS is configured to allow all origins (*). APIs allowing credentials with wildcard origin are vulnerable to cross-site request forgery. Wildcard origins also allow any website to make requests to your API (CWE-942: Permissive Cross-Domain Whitelist).",
        remediation: "Restrict CORS to specific trusted origins. Never use * with Access-Control-Allow-Credentials: true. Use environment variables to configure allowed origins: app.use(cors({ origin: process.env.ALLOWED_ORIGIN }))."
    },
    {
        id: "SEC-011",
        pattern: /__VUE__|Vue\.config\.devtools\s*=\s*true|vue-devtools|enableProdPreview|__VUE_OPTIONS_API__|__VUE_PROD_DEVTOOLS__/gi,
        severity: "high",
        title: "Vue Devtools or Debug Mode Enabled in Production",
        description: "Vue app exposes development tools or has debug mode enabled in production. __VUE__ global, Vue.config.devtools=true, or Vue Devtools integration found in code served to browsers, allowing attackers to inspect component state and potentially inject code.",
        remediation: "In Vue 3: set Vue.config.devtools = false in production. Ensure process.env.NODE_ENV === 'production' to disable all dev tools. Remove any __VUE_OPTIONS_API__ or __VUE_PROD_DEVTOOLS__ flags set to true."
    },
    {
        id: "SEC-012",
        pattern: /__REACT_DEVTOOLS_GLOBAL_HOOK__|window\.__REDUX_DEVTOOLS_EXTENSION__|reduxDevtools|enableDevTools\s*[=:]/gi,
        severity: "high",
        title: "React/Redux DevTools Enabled in Production",
        description: "React DevTools or Redux DevTools global hook is exposed in production code. Attackers can use these to inspect component tree, state, and props of a live production application.",
        remediation: "Remove __REACT_DEVTOOLS_GLOBAL_HOOK__ references from production builds. Ensure devtools are only included in development builds. Use environment checks: if (process.env.NODE_ENV !== 'production') { /* devtools */ }"
    },
    {
        id: "SEC-013",
        pattern: /ng\.probe|enableDebugTools|\.productionMode\s*=\s*false|platformBrowser\.dynamic|BrowserModule\.withServerTransition|Angular\.module.*\.debug|provide\(.*Angular.*debug/i,
        severity: "high",
        title: "Angular Debug Tools Enabled in Production",
        description: "Angular debug tools or production mode disabled in code. ng.probe(), enableDebugTools(), or productionMode=false found, allowing attackers to access component injectors and manipulate application state.",
        remediation: "Ensure enableProdMode() is called in production builds to disable Angular debug tools. Remove any references to ng.probe or enableDebugTools from production code."
    },
    {
        id: "SEC-014",
        pattern: /(\.git\/config|\.git\/HEAD|\.git\/index|\.git\/ORIG_HEAD)/gi,
        severity: "critical",
        title: "Exposed .git Directory or Metadata",
        description: "Reference to .git directory internals detected. If the .git directory is publicly accessible, attackers can download the entire source code, commit history, and potentially sensitive configuration. This is a critical information disclosure (CWE-552).",
        remediation: 'Block access to the .git directory in your web server configuration. Ensure .git is not in the public document root. Use: nginx: location ~ /.git { deny all; } or Apache: <Directory ~ ".git"> Require all denied </Directory>'
    },
    {
        id: "SEC-015",
        pattern: /(?:debug\s*[=:]\s*true|DEBUG\s*[=:]\s*true|process\.env\.DEBUG|app\.use\(require\('express'\)\.logger|connect\.logger| Morgan|\.enable\('cors'\)|cors\s*\.\s*enabled|helmet\.csp\s*\.\s*disabled)/gi,
        severity: "high",
        title: "Debug Mode or Verbose Logging Enabled",
        description: "Debug mode, verbose logging, or security middleware disabled detected in code. Debug endpoints or verbose logging in production can leak sensitive request data, internal paths, and stack traces (OWASP A10:2025).",
        remediation: "Disable debug mode in production: process.env.NODE_ENV = 'production'. Remove verbose logging (Morgan, connect.logger) from production. Ensure helmet.js CSP and other security middleware are not disabled."
    },
    {
        id: "SEC-016",
        pattern: /(\.env\.local|\.env\.development|\.env\.test|\.env\.production\.local)/gi,
        severity: "critical",
        title: "Local Environment File Reference",
        description: "Reference to local environment files (.env.local, .env.development) detected. These files may contain machine-specific credentials, API keys, or secrets that should never be committed. .env.local takes precedence over .env and is meant for machine-specific overrides.",
        remediation: "Ensure .env.local is in .gitignore. Never commit .env.local to version control. Use a secrets manager (AWS Secrets Manager, HashiCorp Vault) for production secrets."
    },
    {
        id: "SEC-017",
        pattern: /(config\.ya?ml|config\.json)[^\n]{0,100}?(?:aws|secret|password|token|api[_-]?key|credential|private|db_)/gi,
        severity: "critical",
        title: "Configuration File May Contain Secrets",
        description: "A config.yml or config.json file is referenced near sensitive keywords (secret, password, token, api_key, aws, credential). Configuration files may be publicly accessible or committed to version control, leaking infrastructure secrets.",
        remediation: "Move all secrets from config files to environment variables. Ensure config files are in .gitignore. Use secret management systems for production deployments. Never hardcode credentials in config files."
    },
    {
        id: "SEC-018",
        pattern: /(?:X-Content-Type-Options|x-content-type-options)[^\n]{0,50}?(?:noheader|missing|not.?set|none|false)/gi,
        severity: "medium",
        title: "X-Content-Type-Options Explicitly Disabled",
        description: "X-Content-Type-Options is explicitly set to an insecure value or disabled. Without nosniff, browsers may MIME-sniff responses and execute content as a different type, enabling XSS via content-type confusion attacks.",
        remediation: "Set X-Content-Type-Options: nosniff on all responses. Ensure this header is not removed or set to empty/0."
    },
    {
        id: "SEC-019",
        pattern: /(?:process\.env\.|getenv\(|os\.environ|\$\{.*\})[^\n]{0,100}?(?:DEBUG|debug|verbose|log[_-]?level|log[_-]?enabled)/gi,
        severity: "low",
        title: "Debug Environment Variables Referenced",
        description: "Debug-related environment variables (DEBUG, VERBOSE, LOG_LEVEL) are referenced in code. While not directly harmful, debug flags in production can enable verbose logging that leaks sensitive information.",
        remediation: "Use structured logging with appropriate log levels. Ensure DEBUG=false and LOG_LEVEL=error/warn in production environments. Review logs before shipping."
    },
    {
        id: "ERRHAND002",
        pattern: /(?:disableExpressErrorHandler|app\.use\(errorHandler\)|errorHandler\s*[=:]\s*false|process\.on\s*\(\s*['"]uncaughtException|process\.on\s*\(\s*['"]unhandledRejection)[^\n]{0,100}?(?:false|null|0|disabled|skip)/gi,
        severity: "high",
        title: "Global Exception Handler Disabled or Bypassed",
        description: "Global exception/error handlers are disabled, skipped, or set to no-op. Without proper error handling, uncaught exceptions crash the process and may expose stack traces, internal state, or configuration details to users (OWASP A10:2025).",
        remediation: "Always implement global error handlers that log details server-side and return generic error messages to users. Never set error handlers to false, null, or skip them in production."
    },
    {
        id: "CORS002",
        pattern: /(?:Access-Control-Allow-Credentials\s*[=:]|credentials\s*[=:])[^\n]{0,50}?true[^\n]{0,50}?(?:Access-Control-Allow-Origin|origin)[^\n]{0,50}?\*/gi,
        severity: "critical",
        title: "CORS Allows Credentials with Wildcard Origin",
        description: "Access-Control-Allow-Credentials is set to true while Access-Control-Allow-Origin is *. This is a critical CORS misconfiguration — browsers will reject this combination, but if a workaround is used, it allows any website to send authenticated requests to your API (CWE-346).",
        remediation: "Never use Access-Control-Allow-Origin: * with Access-Control-Allow-Credentials: true. Use a specific origin string or implement dynamic origin validation: origin: (origin, cb) => cb(null, allowedOrigins.includes(origin))"
    },
    {
        id: "AUTH001",
        pattern: /(?:jwt\.sign|jwt\.verify|sign\(.*\)[:.]|jsonwebtoken)[^\n]{0,100}?(?:algorithm\s*[=:]|ALGORITHM)[^\n]{0,50}?(?:HS256|HS512|'none'|none|"none")/gi,
        severity: "critical",
        title: "JWT Algorithm Confusion or None Algorithm",
        description: "JWT (JSON Web Token) code uses a weak or misconfigured algorithm. Using 'none' algorithm allows attackers to forge tokens. Using symmetric keys (HS*) with asymmetric algorithms exposes the secret. This can lead to complete authentication bypass (CWE-347).",
        remediation: "Use RS256 or ES256 algorithm for JWTs. Never accept the 'none' algorithm. Never use HS256 with a public key. Validate algorithm matches expected type. Use a library like jose that prevents algorithm confusion attacks."
    },
    {
        id: "RATE001",
        pattern: /(?:rateLimit|ratelimit|rate[_-]?limit|throttle|maxReq|max[_-]?requests)[^\n]{0,50}?(?:disabled|false|null|0|no[_-]?limit|unlimited|infinity)/gi,
        severity: "high",
        title: "Rate Limiting Explicitly Disabled",
        description: "Rate limiting is explicitly disabled or set to unlimited. Without rate limiting, endpoints are vulnerable to brute force attacks, API abuse, and denial of service (OWASP A04:2021/A07:2023).",
        remediation: "Enable rate limiting on all public endpoints, especially authentication, search, and data retrieval endpoints. Use libraries like express-rate-limit or a WAF. Set reasonable limits based on expected legitimate usage."
    },
    // ============== SUPPLY CHAIN RULES (A03:2025 & A06:2021) ==============
    {
        id: "SUPPLY001-TYPO",
        pattern: /\b(reacct|reacect|reacxt|reactt|reakt|reajct|reavt|reacet|recat)\b[\s":]*[~^]?[0-9]/gi,
        severity: "high",
        title: "Typo-squatting Package Detected (Slopsquatting)",
        description: 'A package name that looks like a typo of a popular library (e.g., "reacct" instead of "react"). Attackers register these look-alike packages to inject malware via typosquatting/slopsquatting attacks (OWASP A03:2025).',
        remediation: "Verify the package name is correct. Check npmjs.com to confirm the package exists with that exact name. Use exact versions and review package.json before npm install."
    },
    {
        id: "SUPPLY002",
        pattern: /"(dependencies|devDependencies)"[\s\S]{0,5000}?"[a-z][a-z0-9_-]{2,30}"[\s:]+["'][^~][0-9]/gi,
        severity: "medium",
        title: "Unpinned Dependencies (Version Range Risk)",
        description: "Dependencies use version ranges (^, ~, >=) instead of exact versions. Attackers can publish malicious versions within the allowed range, leading to supply chain attacks (CWE-1104).",
        remediation: 'Pin dependencies to exact versions in package.json. Use "1.2.3" instead of "^1.2.3". Regenerate package-lock.json and commit it. Consider using npm install --save-exact for new installs.'
    },
    {
        id: "SUPPLY003",
        pattern: /"(?:preinstall|postinstall|preuninstall|postuninstall|prepublish|postpublish|prepare|postprepare)"\s*:\s*"[^"]*\$\(|\$\{|`|;\s*(?:rm|wget|curl|npm|yarn)/gi,
        severity: "critical",
        title: "Shell Injection in npm Scripts",
        description: "npm lifecycle scripts contain potential shell injection patterns ($(...), `...`, or external curl/wget). Malicious packages can execute arbitrary code during npm install (OWASP A03:2025).",
        remediation: "Remove shell injection patterns from package.json scripts. Never use user input in scripts. If you must use external scripts, download and verify them first. Never pipe curl output directly to shell."
    },
    {
        id: "SUPPLY004",
        pattern: /(?:_auth|_authToken|access-token|password)\s*=\s*["'][a-zA-Z0-9+/=]{20,}["']|registry[\s\n]*.*_auth\s*=/gi,
        severity: "critical",
        title: ".npmrc Contains Credentials",
        description: ".npmrc file contains authentication credentials (_auth or registry _auth). If committed to version control, attackers can steal npm credentials and publish malicious packages under your account (OWASP A03:2025).",
        remediation: "Remove credentials from .npmrc. Use npm login with proper auth tokens stored securely. Set .npmrc to use environment variables: //registry.npmjs.org/:_authToken=${NPM_TOKEN}. Never commit .npmrc with credentials."
    },
    {
        id: "SUPPLY005",
        pattern: /(?:package\.json)[\s\S]{0,200}?(?:"dependencies"|"scripts"|"engines")[\s\S]{0,500}?(?!(?:package-lock|yarn\.lock|pnpm-lock))"[a-z]/gi,
        severity: "medium",
        title: "Lock File Missing",
        description: "package.json exists but no lock file (package-lock.json, yarn.lock, or pnpm-lock.yaml) is detected. Without lock files, npm install can resolve dependencies to different versions, including malicious ones (CWE-1104).",
        remediation: "Run npm install to generate package-lock.json, or use yarn.lock / pnpm-lock.yaml. Commit the lock file. Use npm ci (not npm install) in CI/CD to ensure reproducible builds."
    },
    {
        id: "DEP001",
        pattern: /"(?:lodash|moment|axios|express|qs|underscore|request|node-fetch)"\s*:\s*"[<>~^]?(?:0\.[0-9]|1\.[0-5]|4\.[0-9]|[0-3]\.)/gi,
        severity: "medium",
        title: "Known Vulnerable Package Version (CVE)",
        description: "A package with known CVEs is used in an outdated version. Common in AI-generated code that uses old templates. Known affected: lodash <4.17.21, moment <2.29.4, axios <1.6.0, express <4.18.0 (CWE-1104).",
        remediation: "Update to latest stable version: npm update <package>. Check npm audit for specific CVEs. Consider replacing deprecated packages with maintained alternatives."
    },
    {
        id: "DEP002",
        pattern: /(?:NODE_ENV\s*=\s*development|process\.env\.NODE_ENV\s*!==\s*['"]production['"])[^\n]{0,200}?(?:devDependencies|devDep|development)[^\n]{0,100}?(?:build|compile|webpack|vite|rollup)/gi,
        severity: "medium",
        title: "Dev Dependencies in Production Build",
        description: "Build scripts reference NODE_ENV=development or include dev dependencies in the production bundle. Dev dependencies may contain debugging tools or vulnerabilities that should not ship to production (CWE-1104).",
        remediation: 'Use NODE_ENV=production for production builds. Configure webpack/vite to exclude devDependencies. Use webpack DefinePlugin to replace process.env.NODE_ENV with "production".'
    },
    {
        id: "SUPPLY006",
        pattern: /\${{\s*secrets\.[A-Z_]+[^}]*}}[^\n]{0,200}?(?:echo|print|console\.log|write-output|Write-Host|Log-error)/gi,
        severity: "high",
        title: "GitHub Actions Secrets May Be Logged",
        description: "GitHub Actions workflow may log or expose secrets. The pattern ${{ secrets.* }} followed by echo/print statements can leak sensitive credentials to action logs (OWASP A03:2025).",
        remediation: "Never echo or log secret values in GitHub Actions. Use set -o noalog or add ::add-mask:: to mask secrets. Use environment variables instead of direct secret references in logs."
    },
    {
        id: "SUPPLY007",
        pattern: /"(?:postinstall|preinstall|postpublish|postuninstall)"\s*:\s*"[^"]*(?:curl|wget|http|https):\/\/[a-z0-9.-]{5,}(?:\|[\s]*(?:sh|bash|powershell))?/gi,
        severity: "critical",
        title: "Malicious External Script in npm Lifecycle",
        description: "npm lifecycle script (postinstall, preinstall, etc.) fetches and executes external scripts from URLs. This is a common supply chain attack vector — the external server can serve different malicious code at any time (OWASP A03:2025).",
        remediation: "Remove external curl/wget scripts from npm lifecycle hooks. Download scripts to your repo and verify their integrity. Never pipe curl directly to sh. Use npmignore to exclude suspicious scripts."
    },
    {
        id: "SUPPLY008",
        pattern: /(?:package\.json)[\s\S]{0,2000}?"(faker|mock-aws|aws-sdk-mock|fake-|mock-|test-utils)[\s":]*[~^]?[0-9]/gi,
        severity: "high",
        title: "Suspicious Test/Mock Package in Dependencies",
        description: "Dependencies include suspicious test or mock packages that may be typosquatting legitimate testing libraries or contain malicious code (OWASP A03:2025).",
        remediation: "Verify package names are correct. Check if the package is a known legitimate library. Remove suspicious packages. Use scoped packages (@testing-library/*) instead of generic names."
    },
    {
        id: "SUPPLY009",
        pattern: /(?:package\.json)[\s\S]{0,1000}?(?:registry|registry-url|publishConfig)[\s\n]*[\s":]*https?:\/\/(?!registry\.npmjs\.org)[a-z0-9.-]{5,}/gi,
        severity: "high",
        title: "Non-default npm Registry",
        description: "package.json or .npmrc specifies a non-default npm registry (not registry.npmjs.org). Packages from alternative registries may not be audited and could contain malware (OWASP A03:2025).",
        remediation: "Verify the registry is trusted and official. Use only well-known registries. Consider using npm shrinkwrap to lock all dependency sources. Audit all packages from alternative registries manually."
    },
    // ============== LOVABLE-SPECIFIC RULES ==============
    // AI coding tool: Lovable (AI builder with Supabase backend)
    {
        id: "LOVABLE001",
        pattern: /(?:createClient|supabase)[^\n]{0,100}?(?:SELECT|INSERT|UPDATE)[^\n]{0,50}?(?:from|table)[^\n]{0,30}?(?!--.*RLS|--.*row.?level|--.*security)/gi,
        severity: "high",
        title: "Lovable App: Supabase Without RLS Validation",
        description: "Supabase client used in a Lovable-generated app without visible RLS comment or validation. AI-generated apps often ship with Row Level Security disabled or policies not configured. 10.3% of Lovable apps have critical RLS flaws.",
        remediation: "Enable RLS on all tables: ALTER TABLE <name> ENABLE ROW LEVEL SECURITY. Create policies that verify auth.uid() matches the user ID in each row. Test that unauthenticated requests are blocked."
    },
    {
        id: "LOVABLE002",
        pattern: /app[/.\\]api[/.\\][^\n]{0,100}route\.(?:ts|tsx|js|jsx)[^\n]{0,200}?(?:supabase\.from|db\.|prisma\.)[^\n]{0,100}?(?!session|auth|getUser|verify|checkAuth)/gi,
        severity: "high",
        title: "Lovable App: Unprotected API Route",
        description: "API route in a Lovable app accesses the database without authentication check. AI-generated Next.js apps often leave API routes unprotected, allowing unauthenticated access to user data (OWASP A01:2021).",
        remediation: "Add session verification to all API routes: const session = await getSession(req). If (!session) return 401. Use middleware to protect routes that access user-specific data."
    },
    // ============== BOLT-SPECIFIC RULES ==============
    // AI coding tool: Bolt (SvelteKit builder from StackBlitz)
    {
        id: "BOLT001",
        pattern: /\+server\.ts[^\n]{0,200}?(?:locals\.|\.data\.|event\.)[^\n]{0,50}?(?!user|session|auth)/gi,
        severity: "high",
        title: "Bolt App: SvelteKit +server.ts Route Without Auth",
        description: "SvelteKit +server.ts route accesses server data or locals without checking if the user is authenticated. Bolt-generated SvelteKit apps often skip auth middleware on data routes (OWASP A01:2021).",
        remediation: "Add auth check to +server.ts routes: const session = await locals.auth(); if (!session) return json(401). Use hooks.server.ts to validate sessions before route handlers execute."
    },
    {
        id: "BOLT002",
        pattern: /PUBLIC_[A-Z_]+(?:=|:\s*)['"][^\n]{0,50}?(?:sk-|pk-|eyJ|[a-f0-9]{32,}|\$\{|ai_|openai|anthropic|supabase)/gi,
        severity: "high",
        title: "Bolt App: Sensitive Env Variable With PUBLIC_ Prefix",
        description: "Bolt/SvelteKit apps prefix all env vars with PUBLIC_ assuming they are safe client-side. This pattern flags PUBLIC_ vars that look like secrets (API keys, JWTs, database credentials). Attackers can extract these from the browser.",
        remediation: "Move sensitive variables to server-only env vars (no PUBLIC_ prefix). In SvelteKit: use $env/static/private for secrets. NEVER put API keys, passwords, or JWTs in PUBLIC_ variables."
    },
    // ============== CURSOR-SPECIFIC RULES ==============
    // AI coding tool: Cursor (AI pair programmer)
    {
        id: "CURSOR001",
        pattern: /export\s+(?:async\s+)?function\s+(?:GET|POST|PUT|DELETE|PATCH)\s*\([^\n]{0,100}?\)[^\n]{0,50}?(?:Request|NextRequest)[^\n]{0,200}?(?:db\.|prisma\.|supabase|from\()[^\n]{0,100}?(?!session|auth|verifyToken|getSession|authorize)/gi,
        severity: "high",
        title: "Cursor App: Next.js API Route Without Auth Validation",
        description: "Next.js API route handles database operations without authentication validation. Cursor-generated apps often have loose API route protection that allows unauthenticated data access (OWASP A01:2021).",
        remediation: "Validate session/JWT in every API route: const token = req.headers.get(authorization); const user = await verifyToken(token); if (!user) return NextResponse.json({error: Unauthorized}, {status: 401});"
    },
    {
        id: "CURSOR002",
        pattern: /middleware\.ts[\s\S]{0,500}?export\s+(?:const|function)\s+(?:config|matcher|matches)[^\n]{0,50}?(?!auth|session|verify|protect|redirect)/gi,
        severity: "medium",
        title: "Cursor App: Next.js Middleware Without Auth Protection",
        description: "Next.js middleware.ts exists but lacks auth/session validation or has a weak matcher that does not protect sensitive routes. Cursor apps often create middleware without proper route protection.",
        remediation: "Configure middleware to protect sensitive routes: export const config = { matcher: [/dashboard/:path*, /api/protected/:path*] }; Add JWT/session verification in middleware to redirect unauthenticated users."
    },
    // ============== V0-SPECIFIC RULES ==============
    // AI coding tool: v0 by Vercel
    {
        id: "V0001",
        pattern: /dangerouslySetInnerHTML[\s\S]{0,300}?(?:\{|\()[^\n]{0,100}?(?!DOMPurify|sanitize|xss|he\.escape)/gi,
        severity: "high",
        title: "v0 App: dangerouslySetInnerHTML Without Sanitization",
        description: "dangerouslySetInnerHTML used without DOMPurify.sanitize() or equivalent sanitization. v0-generated React apps often render raw HTML from user input or API responses without proper sanitization, enabling XSS attacks (CWE-79, OWASP A03:2021).",
        remediation: "Always sanitize before rendering: import DOMPurify from dompurify; const clean = DOMPurify.sanitize(dirtyHTML); <div dangerouslySetInnerHTML={{__html: clean}} />. Never pass unsanitized user input to dangerouslySetInnerHTML."
    },
    {
        id: "V0002",
        pattern: /(?:useAuth|AuthContext|authContext|useSession|getSession)[^\n]{0,50}?(?:createContext|useState)[^\n]{0,100}?(?:app[/.\\]api|server\.(?:ts|js)|actions)/gi,
        severity: "high",
        title: "v0 App: Server Actions Without Auth Guard",
        description: "Auth context or hook defined in a v0 app but server actions/API routes access data without verifying auth. v0 often generates server actions that handle user data without checking authentication (OWASP A01:2021).",
        remediation: "Verify auth in every server action: import { auth } from @/auth; const session = await auth(); if (!session) throw new Error(Unauthorized);. Add auth checks before any data access in server actions."
    },
    // ============== REPLIT-SPECIFIC RULES ==============
    // AI coding tool: Replit (browser-based IDE)
    {
        id: "REPLIT001",
        pattern: /(\.replit|replit\.toml)[\s\S]{0,500}?(?:secrets|config|env)[^\n]{0,50}?(?:api[_-]?key|token|password|secret|key)[^\n]{0,50}?=\s*["'][^\n"']{10,}/gi,
        severity: "critical",
        title: "Replit: Secrets Exposed in .replit Configuration",
        description: ".replit or replit.toml file contains secrets (API keys, tokens, passwords) in the secrets/config section. Replit apps commonly expose secrets in configuration files that can be read by collaborators or scraped from public repls (CWE-552).",
        remediation: "Remove secrets from .replit. Use Replit built-in environment secrets via the Secrets tab (encrypted). Never commit API keys or passwords to .replit files that are shared or public."
    },
    {
        id: "REPLIT002",
        pattern: /app\.(?:get|post|put|delete|patch)\s*\([^\n]{0,100}?,[^\n]{0,100}?(?:req|request)[^\n]{0,200}?(?:db|supabase|mongo|prisma)[^\n]{0,100}?(?!auth|verify|middleware|check)/gi,
        severity: "high",
        title: "Replit: Express Route Without Auth Middleware",
        description: "Express route in a Replit app handles database operations without auth middleware. Replit-generated Express apps often skip authentication on data routes (OWASP A01:2021).",
        remediation: "Add auth middleware to Express routes: const authMiddleware = require(./middleware/auth); app.get(/api/data, authMiddleware, handler). Create an auth middleware that validates JWT or session before allowing data access."
    }
];
const HEADER_CHECKS = [
    {
        id: "WEB-001",
        header: "content-security-policy",
        severity: "high",
        title: "Content-Security-Policy Missing",
        description: "Content-Security-Policy header is not set. This helps prevent XSS and data injection attacks. CSP is one of the most effective defenses against cross-site scripting (OWASP A05:2025 - Security Misconfiguration).",
        remediation: "Add a CSP header: Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; object-src 'none'; base-uri 'self'. Start with Content-Security-Policy-Report-Only in monitoring mode before enforcing."
    },
    {
        id: "WEB-002",
        header: "strict-transport-security",
        severity: "high",
        title: "HSTS Header Missing",
        description: "Strict-Transport-Security header is not set. Browsers won't enforce HTTPS, leaving users vulnerable to protocol downgrade attacks.",
        remediation: "Add HSTS header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload"
    },
    {
        id: "WEB-003",
        header: "x-frame-options",
        severity: "medium",
        title: "X-Frame-Options Missing",
        description: "X-Frame-Options header is not set. Site may be vulnerable to clickjacking attacks where an attacker embeds the page in an iframe.",
        remediation: "Add X-Frame-Options: DENY or X-Frame-Options: SAMEORIGIN. Consider using CSP frame-ancestors directive for broader browser support."
    },
    {
        id: "WEB-004",
        header: "x-content-type-options",
        severity: "medium",
        title: "X-Content-Type-Options Missing (MIME Sniffing Enabled)",
        description: "X-Content-Type-Options header is not set. Browsers may MIME-sniff the response and execute content even when it's not the declared type, enabling XSS attacks via uploaded files (OWASP A05:2025).",
        remediation: "Add X-Content-Type-Options: nosniff to prevent browsers from MIME-sniffing responses away from the declared Content-Type."
    },
    {
        id: "WEB-005",
        header: "referrer-policy",
        severity: "low",
        title: "Referrer-Policy Header Missing",
        description: "Referrer-Policy header is not set. The Referer header may leak sensitive URL information (URL parameters, path fragments) to external sites.",
        remediation: "Add Referrer-Policy: strict-origin-when-cross-origin or Referrer-Policy: no-referrer to control what information is sent with the Referer header."
    },
    {
        id: "WEB-006",
        header: "permissions-policy",
        severity: "low",
        title: "Permissions-Policy Header Missing",
        description: "Permissions-Policy (formerly Feature-Policy) header is not set. Unused browser features like camera, microphone, geolocation, or payment handler may be exploitable by attackers.",
        remediation: "Add Permissions-Policy header to disable unused features: Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()"
    },
    {
        id: "WEB-007",
        header: "x-powered-by",
        severity: "low",
        title: "X-Powered-By Header Discloses Technology Stack",
        description: "X-Powered-By header reveals the server technology (e.g., Express, PHP, ASP.NET). Attackers use this to target known vulnerabilities for specific frameworks.",
        remediation: "Remove the X-Powered-By header or set it to a generic value. In Express: app.disable('x-powered-by'). In IIS: remove the header via web.config."
    },
    {
        id: "WEB-008",
        header: "server",
        severity: "low",
        title: "Server Header Discloses Version Information",
        description: "Server header reveals the web server name and version (e.g., Apache/2.4.52, nginx/1.18.0). Attackers use this to identify known vulnerabilities for specific server versions.",
        remediation: "Configure your web server to suppress or genericize the Server header. In nginx: server_tokens off; In Apache: ServerTokens Prod"
    },
    {
        id: "WEB-009",
        header: "rate-limiting",
        severity: "medium",
        title: "Rate Limiting Headers Missing",
        description: "No rate limiting headers detected (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After). Without rate limiting, APIs and login endpoints are vulnerable to brute force attacks.",
        remediation: "Implement rate limiting on sensitive endpoints. Return headers like X-RateLimit-Limit: 100, X-RateLimit-Remaining: 95, and Retry-After for 429 responses."
    },
    {
        id: "WEB-010",
        header: "cross-origin-opener-policy",
        severity: "medium",
        title: "Cross-Origin-Opener-Policy (COOP) Header Missing",
        description: "COOP header is not set. Without COOP, your page can be opened by cross-origin documents in the same browsing context group, enabling Spectre-style speculative execution attacks (OWASP A05:2025).",
        remediation: "Add Cross-Origin-Opener-Policy: same-origin to isolate your browsing context from cross-origin documents."
    },
    {
        id: "WEB-011",
        header: "cross-origin-resource-policy",
        severity: "medium",
        title: "Cross-Origin-Resource-Policy (CORP) Header Missing",
        description: "CORP header is not set. Without CORP, your resources can be loaded by other origins, enabling clickjacking, timing attacks, and data theft (OWASP A05:2025).",
        remediation: "Add Cross-Origin-Resource-Policy: same-origin (or cross-origin if you need to allow embedding)."
    },
    {
        id: "WEB-012",
        header: "cross-origin-embedder-policy",
        severity: "low",
        title: "Cross-Origin-Embedder-Policy (COEP) Header Missing",
        description: "COEP header is not set. Without COEP, cross-origin resources without explicit permission cannot be embedded, blocking access to features like SharedArrayBuffer, performance.measureMemory, and otp-credentials (OWASP A05:2025).",
        remediation: "Add Cross-Origin-Embedder-Policy: require-corp if you need cross-origin isolation for features like SharedArrayBuffer."
    }
];
const PATH_CHECKS = [
    {
        path: "/.env",
        severity: "critical",
        title: ".env File Accessible",
        remediation: "Block access to .env files in web server config. Ensure .env is never in the public document root."
    },
    {
        path: "/.env.local",
        severity: "critical",
        title: ".env.local File Accessible",
        remediation: "Block access to .env.local files. These contain machine-specific overrides and may have more secrets than .env."
    },
    {
        path: "/.env.development",
        severity: "high",
        title: ".env.development File Accessible",
        remediation: "Block access to .env.development files. Development env files may contain debug flags and dev-only credentials."
    },
    {
        path: "/.git/config",
        severity: "critical",
        title: ".git/config Accessible (CWE-552)",
        remediation: 'Block access to the entire .git directory. Attackers can download full source code from .git/config if publicly accessible. Nginx: location ~ /.git { deny all; } Apache: <Directory ~ ".git"> Require all denied </Directory>'
    },
    {
        path: "/.git/HEAD",
        severity: "critical",
        title: ".git/HEAD Accessible",
        remediation: "Block access to .git/HEAD which reveals branch names and commit refs."
    },
    {
        path: "/.git",
        severity: "critical",
        title: ".git Directory Fully Accessible",
        remediation: "The entire .git directory must be blocked. It contains history, commits, and potentially sensitive config."
    },
    {
        path: "/config.yml",
        severity: "high",
        title: "config.yml Exposed",
        remediation: "Block access to config.yml. Configuration files may contain database credentials, API keys, or infrastructure secrets."
    },
    {
        path: "/config.yaml",
        severity: "high",
        title: "config.yaml Exposed",
        remediation: "Block access to config.yaml files."
    },
    {
        path: "/config.json",
        severity: "high",
        title: "config.json Exposed",
        remediation: "Block access to config.json. Do not serve config files from the public document root."
    },
    {
        path: "/admin",
        severity: "high",
        title: "Admin Panel Exposed",
        remediation: "Protect admin routes with strong authentication, rate limiting, and IP allowlisting. Add to robots.txt to discourage indexing."
    },
    {
        path: "/wp-admin",
        severity: "high",
        title: "WordPress Admin Exposed",
        remediation: "Protect WordPress admin with strong authentication, 2FA, and security plugins. Consider hiding wp-admin behind a VPN."
    },
    {
        path: "/debug",
        severity: "critical",
        title: "Debug Endpoints Exposed (OWASP A10:2025)",
        remediation: "Disable debug mode in production. Debug endpoints leak stack traces, environment variables, and internal state. Remove /debug, /trace, /actuator routes from production."
    },
    {
        path: "/api/debug",
        severity: "critical",
        title: "API Debug Endpoint Exposed (OWASP A10:2025)",
        remediation: "Remove all debug API endpoints from production. Debug endpoints are a primary target for information disclosure attacks."
    },
    {
        path: "/actuator/health",
        severity: "medium",
        title: "Spring Boot Actuator Health Exposed",
        remediation: "Restrict /actuator to internal networks only. Do not expose /actuator/env, /actuator/heapdump, or /actuator/loggers in production."
    },
    {
        path: "/actuator",
        severity: "high",
        title: "Spring Boot Actuator Fully Exposed",
        remediation: "Restrict all actuator endpoints to internal networks. Use Spring Security to protect actuator with authentication."
    },
    {
        path: "/trace",
        severity: "high",
        title: "Trace Endpoint Exposed",
        remediation: "Remove trace/debug endpoints. HTTP TRACE method and /trace routes expose request headers and internal routing."
    },
    {
        path: "/.aws/credentials",
        severity: "critical",
        title: "AWS Credentials File Exposed",
        remediation: "Never place AWS credentials in web-accessible directories. Use IAM roles, environment variables, or AWS Secrets Manager instead."
    },
    {
        path: "/id_rsa",
        severity: "critical",
        title: "SSH Private Key Exposed",
        remediation: "Never place private keys in web directories. Use SSH agent forwarding or secret management systems."
    },
    {
        path: "/backup",
        severity: "high",
        title: "Backup Directory Exposed",
        remediation: "Block access to backup directories. Backups may contain full application state and data."
    },
    {
        path: "/.svn",
        severity: "high",
        title: "Subversion (.svn) Directory Exposed",
        remediation: "Block access to .svn directories. Like .git, these expose version control history."
    },
    {
        path: "/.hg",
        severity: "high",
        title: "Mercurial (.hg) Directory Exposed",
        remediation: "Block access to .hg directories."
    },
    {
        path: "/phpinfo.php",
        severity: "high",
        title: "phpinfo() Page Exposed",
        remediation: "Remove phpinfo.php from production. phpinfo() reveals PHP version, extensions, paths, and server configuration."
    },
    {
        path: "/server-status",
        severity: "medium",
        title: "Apache Server Status Exposed",
        remediation: "Disable Apache mod_status or restrict it to localhost. Server status pages leak server details and traffic patterns."
    },
    {
        path: "/.well-known/security.txt",
        severity: "low",
        title: "security.txt Found",
        remediation: "This is expected and recommended. Ensure the security.txt contact information is correct and the file is properly formatted."
    }
];
function scanContent(content, filePath) {
    const findings = [];
    const lines = content.split("\n");
    // Run Supabase RLS checks
    findings.push(...checkSupabaseRLS(content, filePath));
    // Run Supabase credential check (requires file path context)
    if (checkSupabaseCredentials(content, filePath)) {
        findings.push({
            id: `SUPABASE001-${findings.length}`,
            ruleId: "SUPABASE001",
            severity: "critical",
            title: "Exposed Supabase Credentials",
            description: "Hardcoded Supabase API keys or service role keys found in source code. This allows full database access bypassing RLS policies.",
            filePath,
            remediation: "Use environment variables: process.env.SUPABASE_KEY. Never commit Supabase anon/service keys to version control. Add .env to .gitignore and use a secrets manager for production."
        });
    }
    // ---- OWASP Top 10 (2021 + 2025) + Cheat Sheets per-file detectors ----
    const owaspFileChecks = [
        {
            check: checkIdorRoute,
            finding: {
                ruleId: "A01-IDOR",
                severity: "high",
                title: "API Route With ID Parameter Without Ownership Check (OWASP A01:2021)",
                description: "API route reads an id from the request and uses it to load data, but no ownership check is visible. This pattern is the canonical IDOR (Insecure Direct Object Reference) — a user can read or mutate another user's data by guessing ids (CWE-639).",
                remediation: "After loading the resource, verify the caller owns it: const { data: { user } } = await supabase.auth.getUser(); if (record.user_id !== user.id) return new Response('Forbidden', { status: 403 });. For Next.js API routes, gate every handler with auth + ownership check or use row-level security on the underlying table."
            }
        },
        {
            check: checkWeakHashing,
            finding: {
                ruleId: "A02-WEAK-HASH",
                severity: "high",
                title: "Weak Hash Algorithm (MD5/SHA1) for Crypto (OWASP A02:2021)",
                description: "Crypto code uses MD5 or SHA-1. These are collision-broken and unsuitable for password storage, token integrity, or digital signatures. Attackers can craft collisions and brute-force pre-images cheaply (CWE-327, CWE-916).",
                remediation: "For passwords: use bcrypt, scrypt, argon2 or PBKDF2 with high work factor. For digital signatures / integrity: use SHA-256 or SHA-3. For tokens / HMAC: use SHA-256 with a random key of at least 256 bits."
            }
        },
        {
            check: checkPlaintextPasswordColumn,
            finding: {
                ruleId: "A02-PLAINTEXT-PWD",
                severity: "critical",
                title: "Password Column Without Hashing Hint (OWASP A02:2021)",
                description: "Schema or migration defines a password column with no sign of hashing (bcrypt/argon2/scrypt). If the app stores raw passwords there, a single DB leak exposes every credential (CWE-256, CWE-257).",
                remediation: "Never store plaintext passwords. Hash on write with bcrypt (cost ≥ 12) or argon2id. If migrating an existing table, force a password reset on next login."
            }
        },
        {
            check: checkHardcodedRoleCheck,
            finding: {
                ruleId: "A04-HARDCODED-ROLE",
                severity: "medium",
                title: "Hardcoded Role String Comparison (OWASP A04:2021)",
                description: "Authorization code compares role against a hardcoded literal (admin/root). This is brittle and easy to bypass if the role label changes or if the same string is reused for unrelated checks (CWE-1188).",
                remediation: "Use a role/permission enum and centralize authorization checks (e.g., requireRole('admin')) instead of literal compares. Enforce in middleware, not just in the handler."
            }
        },
        {
            check: checkJwtMissingExpiry,
            finding: {
                ruleId: "A07-JWT-NO-EXP",
                severity: "high",
                title: "JWT Without Expiry Claim (OWASP A07:2021)",
                description: "JWT is signed or verified without an explicit `expiresIn` / `exp` claim. Tokens live forever once issued, so stolen tokens grant permanent access and there is no automatic session rotation (CWE-613).",
                remediation: "Always set expiresIn when signing (e.g., jwt.sign(payload, secret, { expiresIn: '15m' })). On verify, require exp and reject tokens where exp is missing or in the past."
            }
        },
        {
            check: checkInsecureCookie,
            finding: {
                ruleId: "A07-COOKIE-FLAGS",
                severity: "high",
                title: "Cookie Set Without HttpOnly/Secure/SameSite (OWASP A07:2021)",
                description: "A cookie is set without the HttpOnly, Secure, or SameSite flags. Such cookies are readable from JavaScript (XSS-stealable) and can leak over plaintext HTTP or in cross-site requests (CWE-1004, CWE-614, CWE-1275).",
                remediation: "Set httpOnly: true, secure: true, sameSite: 'lax' (or 'strict') on every auth or session cookie. For session middleware in Next.js/Express, configure these flags globally."
            }
        },
        {
            check: checkUnsafeDeserialization,
            finding: {
                ruleId: "A08-UNSAFE-DESERIALIZE",
                severity: "critical",
                title: "Unsafe Deserialization (OWASP A08:2021)",
                description: "Code uses a known-unsafe deserializer (node-serialize, serialize-javascript, yaml.load, JSON.parse on req.body without validation). Crafted payloads can lead to remote code execution (CWE-502).",
                remediation: "Never deserialize untrusted input with code-executing parsers. Validate JSON Schema before JSON.parse. Use yaml.safeLoad / yaml.load with a custom safe schema. Avoid node-serialize entirely."
            }
        },
        {
            check: checkAuthRouteWithoutLogging,
            finding: {
                ruleId: "A09-AUTH-NO-LOG",
                severity: "medium",
                title: "Auth Handler Without Security Logging (OWASP A09:2021)",
                description: "Login/signup/reset-password handler returns a result but has no logger, monitoring, or audit hook. Auth events are the highest-value events to log — without them, credential stuffing and account takeover are invisible (CWE-778).",
                remediation: "Log auth successes and failures with: timestamp, user id (when known), source IP, user agent, and reason. Forward to a SIEM or at minimum to durable structured logs."
            }
        },
        {
            check: checkPotentialSsrf,
            finding: {
                ruleId: "A10-SSRF",
                severity: "high",
                title: "Server Fetches User-Controlled URL Without Allowlist (OWASP A10:2021)",
                description: "A handler reads a URL from the request and passes it to fetch/axios/http.get without validating the host. An attacker can point it at 169.254.169.254 (cloud metadata), localhost admin panels, or internal services (CWE-918).",
                remediation: "Resolve the host and reject private/loopback/link-local IPs (RFC1918, 127.0.0.0/8, 169.254.0.0/16, ::1). Use an explicit allowlist of trusted hosts. Disable HTTP redirects or revalidate after each hop."
            }
        },
        {
            check: checkSwallowedErrors,
            finding: {
                ruleId: "A10-SWALLOWED-ERROR",
                severity: "low",
                title: "Empty Catch Block Silencing Errors (OWASP A10:2025)",
                description: "A `.catch(() => {})` or `.catch(() => null)` swallows every error silently. Failures that should surface — network errors, validation errors, auth errors — are invisible, masking real bugs and security regressions (CWE-703, OWASP A10:2025 — Mishandling of Exceptional Conditions).",
                remediation: "Log or rethrow caught errors. If you intentionally ignore a specific error, narrow the catch (e.g., check the error type) and leave a comment explaining why."
            }
        },
        {
            check: checkCodeInjectionSink,
            finding: {
                ruleId: "XSS-CODE-INJECT",
                severity: "high",
                title: "Code Injection Sink: new Function / setTimeout-with-string (XSS Cheat Sheet)",
                description: "Code uses `new Function(...)`, `setTimeout('...', n)` or `setInterval('...', n)` with a string body. Strings are evaluated as JavaScript; an attacker who controls the string gets RCE or XSS in the browser (CWE-95, CWE-79).",
                remediation: "Pass function references instead of strings: setTimeout(handler, n). Avoid `new Function`. For dynamic code paths, use a whitelist lookup table rather than eval/Function."
            }
        },
        {
            check: checkPrismaRawInjection,
            finding: {
                ruleId: "SQLI-PRISMA-RAW",
                severity: "critical",
                title: "Prisma $executeRaw / $queryRaw With String Interpolation (SQLi Cheat Sheet)",
                description: "`prisma.$executeRaw` / `Prisma.sql` is called with a template literal that interpolates a variable. Prisma cannot parameterize interpolated values, so user input lands directly in the SQL string (CWE-89).",
                remediation: "Use Prisma's tagged template form: `prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}``. Better still, use the Prisma Client API (prisma.user.findUnique) which always parameterizes."
            }
        },
        {
            check: checkHardcodedSecretFallback,
            finding: {
                ruleId: "SECRET-FALLBACK",
                severity: "critical",
                title: "Environment Variable With Hardcoded Fallback Secret",
                description: "`process.env.X || 'long-string-literal'` provides a real-looking secret as a fallback. If the env var is unset in production (typo, missing .env), the app silently uses the hardcoded secret — which is now in the repo (CWE-798, CWE-547).",
                remediation: "Fail fast when a secret is missing: `if (!process.env.X) throw new Error('X is required')`. Never provide a default that looks like a real key."
            }
        },
        {
            check: checkMutatingRouteWithoutCsrf,
            finding: {
                ruleId: "CSRF-MISSING",
                severity: "high",
                title: "State-Changing Handler Without CSRF Defense (CSRF Cheat Sheet)",
                description: "POST/PUT/PATCH/DELETE handler has no CSRF token check, no SameSite cookie enforcement, and no Origin/Referer validation. A malicious cross-origin page can trigger state changes on behalf of the logged-in user (CWE-352).",
                remediation: "Add a CSRF token check (double-submit cookie or synchronizer pattern), enforce SameSite=Strict/Lax on session cookies, and validate Origin/Referer against an allowlist."
            }
        }
    ];
    for (const owasp of owaspFileChecks){
        if (owasp.check(content, filePath)) {
            findings.push({
                id: `${owasp.finding.ruleId}-${findings.length}`,
                ...owasp.finding,
                filePath
            });
        }
    }
    for (const rule of GITHUB_SCANNER_RULES){
        // Skip SUPABASE001 in the pattern loop since we handle it above
        if (rule.id === "SUPABASE001") continue;
        const matches = content.match(rule.pattern);
        if (matches) {
            for (const match of matches){
                // Find line number
                let lineNumber;
                for(let i = 0; i < lines.length; i++){
                    if (lines[i].includes(match.substring(0, 50))) {
                        lineNumber = i + 1;
                        break;
                    }
                }
                // Get snippet (line context)
                const snippet = lineNumber ? lines.slice(Math.max(0, lineNumber - 2), lineNumber + 2).join("\n") : undefined;
                findings.push({
                    id: `${rule.id}-${findings.length}`,
                    ruleId: rule.id,
                    severity: rule.severity,
                    title: rule.title,
                    description: rule.description,
                    filePath,
                    lineNumber,
                    snippet,
                    remediation: rule.remediation
                });
            }
        }
    }
    return findings;
}
}),
"[project]/src/lib/scanners/github.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "scanGitHubRepo",
    ()=>scanGitHubRepo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$octokit$2f$rest$2f$dist$2d$web$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@octokit/rest/dist-web/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scanners$2f$rules$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/scanners/rules/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation.ts [app-route] (ecmascript)");
;
;
;
// ============== Constants ==============
// File extensions to scan
const CODE_EXTENSIONS = [
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.mjs',
    '.cjs',
    '.py',
    '.rb',
    '.go',
    '.java',
    '.cs',
    '.php',
    '.html',
    '.css',
    '.scss',
    '.json',
    '.yaml',
    '.yml',
    '.sh',
    '.bash',
    '.sql',
    '.md'
];
// Directories to skip during scanning
const SKIP_DIRS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '.next',
    '__pycache__',
    'vendor',
    '.venv',
    'target',
    'bin',
    'obj',
    '.cache',
    '.parcel-cache'
];
// Maximum files to scan (prevent abuse)
const MAX_FILES_TO_SCAN = 500;
// Maximum file size to scan (1MB)
const MAX_FILE_SIZE = 1_000_000;
// ============== Utility Functions ==============
/**
 * Initialize severity counts
 */ function initSeverityCounts() {
    return {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
    };
}
/**
 * Filter files to scan based on extensions and directories to skip
 */ function filterScannableFiles(tree) {
    return tree.filter((item)=>item.type === 'blob' && CODE_EXTENSIONS.some((ext)=>item.path.endsWith(ext)) && !SKIP_DIRS.some((dir)=>item.path.includes(dir))).slice(0, MAX_FILES_TO_SCAN).map((item)=>item.path);
}
/**
 * Calculate severity counts from findings
 */ function calculateSeverityCounts(findings) {
    const counts = initSeverityCounts();
    for (const f of findings){
        if (f.severity in counts) {
            counts[f.severity]++;
        }
    }
    return counts;
}
// ============== Core Functions ==============
/**
 * Fetch repository file tree
 */ async function fetchRepoTree(octokit, owner, repo, branch) {
    try {
        const { data } = await octokit.rest.repos.get({
            owner,
            repo,
            ref: branch
        });
        const targetBranch = branch || data.default_branch || 'main';
        const treeResponse = await octokit.rest.git.getTree({
            owner,
            repo,
            tree_sha: targetBranch,
            recursive: 'true'
        });
        return filterScannableFiles(treeResponse.data.tree);
    } catch (error) {
        console.error('Error fetching repo tree:', error);
        return [];
    }
}
/**
 * Fetch content of a single file
 */ async function fetchFileContent(octokit, owner, repo, path, branch) {
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref: branch
        });
        if (data.encoding === 'base64') {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            // Skip files that are too large
            if (content.length > MAX_FILE_SIZE) {
                console.warn(`Skipping ${path} - file too large (>1MB)`);
                return null;
            }
            return content;
        }
        return null;
    } catch  {
        return null;
    }
}
/**
 * Check if repository exists and is accessible
 */ async function checkRepoAccess(octokit, owner, repo) {
    try {
        const { data } = await octokit.rest.repos.get({
            owner,
            repo
        });
        return {
            accessible: true,
            isPrivate: Boolean(data.private)
        };
    } catch (error) {
        if (error.status === 404) {
            return {
                accessible: false,
                isPrivate: false,
                error: 'Repository not found. Make sure it\'s public.'
            };
        }
        if (error.status === 403) {
            return {
                accessible: false,
                isPrivate: true,
                error: 'Repository is private. Public repos only.'
            };
        }
        return {
            accessible: false,
            isPrivate: false,
            error: 'Could not access repository.'
        };
    }
}
async function scanGitHubRepo(url, githubToken) {
    const startTime = Date.now();
    // Parse GitHub URL
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseGitHubUrl"])(url);
    if (!parsed.isValid) {
        throw new Error('Invalid GitHub URL. Use format: https://github.com/owner/repo');
    }
    const { owner, repo, branch } = parsed;
    // Initialize Octokit with optional auth
    const octokit = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$octokit$2f$rest$2f$dist$2d$web$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["Octokit"]({
        auth: githubToken
    });
    // Check repo access
    const accessCheck = await checkRepoAccess(octokit, owner, repo);
    if (!accessCheck.accessible) {
        throw new Error(accessCheck.error || 'Could not access repository');
    }
    // Fetch file tree
    const files = await fetchRepoTree(octokit, owner, repo, branch);
    if (files.length === 0) {
        return {
            findings: [],
            severityCounts: initSeverityCounts(),
            scannedFiles: 0,
            scanDuration: Date.now() - startTime
        };
    }
    // Scan files
    const findings = [];
    for (const filePath of files){
        const content = await fetchFileContent(octokit, owner, repo, filePath, branch);
        if (content) {
            const fileFindings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scanners$2f$rules$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scanContent"])(content, filePath);
            findings.push(...fileFindings);
        }
    }
    return {
        findings,
        severityCounts: calculateSeverityCounts(findings),
        scannedFiles: files.length,
        scanDuration: Date.now() - startTime
    };
}
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/node:assert [external] (node:assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:assert", () => require("node:assert"));

module.exports = mod;
}),
"[externals]/node:http [external] (node:http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http", () => require("node:http"));

module.exports = mod;
}),
"[externals]/node:querystring [external] (node:querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:querystring", () => require("node:querystring"));

module.exports = mod;
}),
"[externals]/node:events [external] (node:events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:events", () => require("node:events"));

module.exports = mod;
}),
"[externals]/node:diagnostics_channel [external] (node:diagnostics_channel, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:diagnostics_channel", () => require("node:diagnostics_channel"));

module.exports = mod;
}),
"[externals]/node:util [external] (node:util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util", () => require("node:util"));

module.exports = mod;
}),
"[externals]/node:tls [external] (node:tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:tls", () => require("node:tls"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:zlib [external] (node:zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:zlib", () => require("node:zlib"));

module.exports = mod;
}),
"[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:perf_hooks", () => require("node:perf_hooks"));

module.exports = mod;
}),
"[externals]/node:util/types [external] (node:util/types, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:util/types", () => require("node:util/types"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:worker_threads [external] (node:worker_threads, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:worker_threads", () => require("node:worker_threads"));

module.exports = mod;
}),
"[externals]/node:http2 [external] (node:http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:http2", () => require("node:http2"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/node:console [external] (node:console, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:console", () => require("node:console"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:timers [external] (node:timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:timers", () => require("node:timers"));

module.exports = mod;
}),
"[externals]/node:dns [external] (node:dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:dns", () => require("node:dns"));

module.exports = mod;
}),
"[project]/src/lib/scanners/website.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "scanWebsite",
    ()=>scanWebsite
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/cheerio/dist/esm/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$load$2d$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cheerio/dist/esm/load-parse.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$network$2d$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/network-security.ts [app-route] (ecmascript)");
;
;
// ============== Utility Functions ==============
/**
 * Safely parse and validate URL
 */ function safeParseUrl(url) {
    try {
        return new URL(url);
    } catch  {
        return null;
    }
}
/**
 * Safely run a check function and return false on error
 */ function safeCheck(checkFn) {
    try {
        return checkFn();
    } catch  {
        return false;
    }
}
/**
 * Count occurrences of items matching a predicate
 */ function countOccurrences(items, predicate) {
    return items.filter(predicate).length;
}
/**
 * Convert headers record to lowercase keys for case-insensitive lookup
 */ function normalizeHeaders(headers) {
    const normalized = {};
    headers.forEach((value, key)=>{
        normalized[key.toLowerCase()] = value.toLowerCase();
    });
    return normalized;
}
/**
 * Initialize severity counts
 */ function initSeverityCounts() {
    return {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
    };
}
/**
 * Build a Finding object
 */ function buildFinding(check, index) {
    return {
        id: crypto.randomUUID(),
        ruleId: check.owasp ? check.owasp.split(':')[0] : check.id.toUpperCase(),
        severity: check.severity,
        title: check.title,
        description: check.description,
        remediation: check.remediation
    };
}
// ============== Security Checks ==============
// OWASP Top 10 2021 aligned checks
const SECURITY_CHECKS = [
    // A01 - Broken Access Control
    {
        id: 'idor',
        title: 'Potential Insecure Direct Object Reference (IDOR)',
        description: 'URL patterns suggest direct access to resources without authorization checks.',
        severity: 'high',
        cwe: 'CWE-639',
        owasp: 'A01:2021',
        check: ($, url)=>{
            const urlObj = safeParseUrl(url);
            if (!urlObj) return false;
            const path = urlObj.pathname;
            return /\/(user|account|order|invoice|transaction|profile|edit|delete)\/(\d+|[a-f0-9-]+)/i.test(path);
        },
        remediation: 'Implement proper authorization checks. Verify the user is authorized to access the specific resource.'
    },
    {
        id: 'directory-traversal',
        title: 'Potential Directory Traversal',
        description: 'URL parameters may allow path traversal attacks.',
        severity: 'critical',
        cwe: 'CWE-22',
        owasp: 'A01:2021',
        check: ($, url)=>{
            const urlObj = safeParseUrl(url);
            if (!urlObj) return false;
            const params = urlObj.searchParams.toString();
            return /(\.\.|\%2e|\%2f)/i.test(params) || /(\?|&)path=|(\?|&)file=|(\?|&)url=/i.test(params);
        },
        remediation: 'Sanitize and validate all user input. Use indirect references instead of direct file paths.'
    },
    {
        id: 'cors-misconfig',
        title: 'Potential CORS Misconfiguration',
        description: 'Page may be vulnerable to CORS attacks with overly permissive settings.',
        severity: 'high',
        cwe: 'CWE-942',
        owasp: 'A01:2021',
        check: ($, _url, headers)=>{
            const corsHeader = headers['access-control-allow-origin'] || '';
            return corsHeader === '*' || corsHeader === 'null';
        },
        remediation: 'Set Access-Control-Allow-Origin to specific trusted origins. Do not use * or null in production.'
    },
    // A02 - Cryptographic Failures
    {
        id: 'https-missing',
        title: 'Page Loaded Over HTTP',
        description: 'This page was loaded without HTTPS, risking data interception.',
        severity: 'critical',
        cwe: 'CWE-319',
        owasp: 'A02:2021',
        check: ($, url)=>url.startsWith('http://'),
        remediation: 'Use HTTPS exclusively. Redirect all HTTP traffic to HTTPS and set Strict-Transport-Security header.'
    },
    {
        id: 'mixed-content',
        title: 'Mixed Content Detected',
        description: 'Page loads resources over both HTTP and HTTPS.',
        severity: 'high',
        cwe: 'CWE-311',
        owasp: 'A02:2021',
        check: ($, url)=>{
            if (!url) return false;
            const html = $.html();
            return /src=["']http:\/\//i.test(html) || /href=["']http:\/\//i.test(html);
        },
        remediation: 'Update all resource URLs to use HTTPS. Configure CSP to block mixed content.'
    },
    {
        id: 'weak-ssl',
        title: 'Weak or Missing SSL/TLS Configuration',
        description: 'Server may be using outdated protocols or weak cipher suites.',
        severity: 'high',
        cwe: 'CWE-326',
        owasp: 'A02:2021',
        check: ($, _url, headers)=>{
            const sslHeader = headers['strict-transport-security'] || '';
            return sslHeader.length === 0;
        },
        remediation: 'Enable HSTS with a long max-age. Ensure TLS 1.2+ is configured. Remove support for older protocols.'
    },
    // A03 - Injection
    {
        id: 'xss-stored',
        title: 'Potential Stored XSS via Form Input',
        description: 'Form fields may not be sanitized, risking stored cross-site scripting.',
        severity: 'critical',
        cwe: 'CWE-79',
        owasp: 'A03:2021',
        check: ($, _url)=>{
            const inputs = $('input, textarea, select').filter((_, el)=>{
                const type = $(el).attr('type');
                const name = $(el).attr('name') || '';
                const id = $(el).attr('id') || '';
                const textField = type !== 'hidden' && type !== 'submit' && type !== 'button';
                const sensitiveField = /comment|message|post|content|body|description/i.test(name) || /comment|message|post|content|body|description/i.test(id);
                return textField && sensitiveField;
            });
            return inputs.length > 0;
        },
        remediation: 'Sanitize and escape all user input. Use Content Security Policy. Implement output encoding.'
    },
    {
        id: 'xss-reflected',
        title: 'Potential Reflected XSS in URL Parameters',
        description: 'URL parameters may be reflected unsanitized in the page.',
        severity: 'high',
        cwe: 'CWE-79',
        owasp: 'A03:2021',
        check: ($, url)=>{
            const urlObj = safeParseUrl(url);
            if (!urlObj) return false;
            const params = urlObj.searchParams.toString();
            if (!params) return false;
            const bodyText = $('body').text();
            return params.split('&').some((p)=>{
                const [key, val] = p.split('=');
                return val && val.length > 2 && bodyText.includes(decodeURIComponent(val));
            });
        },
        remediation: 'Encode all user input before reflecting. Implement CSP to mitigate XSS risks.'
    },
    {
        id: 'xss-dom',
        title: 'Potential DOM-based XSS',
        description: 'Page uses potentially unsafe JavaScript that could lead to DOM XSS.',
        severity: 'high',
        cwe: 'CWE-79',
        owasp: 'A03:2021',
        check: ($, _url)=>{
            const scripts = $('script').map((_, el)=>$(el).html()).get().join('');
            const dangerousPatterns = [
                /document\.write/i,
                /innerHTML\s*=/i,
                /outerHTML\s*=/i,
                /insertAdjacentHTML/i,
                /\.href\s*=\s*location/i,
                /eval\s*\(/i,
                /setTimeout\s*\(\s*["']/,
                /setInterval\s*\(\s*["']/
            ];
            return dangerousPatterns.some((p)=>p.test(scripts));
        },
        remediation: 'Avoid using dangerous DOM APIs. Use safe alternatives like textContent. Implement strict CSP.'
    },
    {
        id: 'sql-injection-params',
        title: 'Potential SQL Injection via Parameters',
        description: 'URL parameters may be vulnerable to SQL injection.',
        severity: 'critical',
        cwe: 'CWE-89',
        owasp: 'A03:2021',
        check: ($, url)=>{
            const urlObj = safeParseUrl(url);
            if (!urlObj) return false;
            const params = urlObj.searchParams.toString();
            if (!params) return false;
            const riskyParams = [
                'id',
                'user',
                'query',
                'search',
                'page',
                'sort',
                'order',
                'filter',
                'cat'
            ];
            const bodyText = $('body').text().toLowerCase();
            return riskyParams.some((p)=>urlObj.searchParams.has(p)) && (url.includes("'") || url.includes('"') || /union.*select/i.test(bodyText));
        },
        remediation: 'Use parameterized queries. Never concatenate user input into SQL strings.'
    },
    {
        id: 'cmd-injection',
        title: 'Potential Command Injection',
        description: 'URL or page content suggests system commands may be executed.',
        severity: 'critical',
        cwe: 'CWE-78',
        owasp: 'A03:2021',
        check: ($, url)=>{
            if (!url) return false;
            const urlParams = url + $('body').text();
            return /[;&|`$]/.test(urlParams) && /(\?|=|&)(cmd|command|exec|shell|ping|nslookup|wget|curl)/i.test(urlParams);
        },
        remediation: 'Never pass user input to system commands. Use safe APIs and input validation.'
    },
    {
        id: 'ldap-injection',
        title: 'Potential LDAP Injection',
        description: 'URL parameters may be vulnerable to LDAP injection.',
        severity: 'high',
        cwe: 'CWE-90',
        owasp: 'A03:2021',
        check: ($, url)=>{
            const urlObj = safeParseUrl(url);
            if (!urlObj) return false;
            const params = urlObj.searchParams.toString();
            return (urlObj.pathname.includes('ldap') || /ldap/i.test(params)) && /(\*|\(|\||\&)/.test(params);
        },
        remediation: 'Sanitize all DN special characters. Use LDAP encoding functions.'
    },
    // A04 - Insecure Design
    {
        id: 'debug-endpoint',
        title: 'Debug or Development Endpoint Exposed',
        description: 'Development or debug endpoints appear to be accessible in production.',
        severity: 'high',
        cwe: 'CWE-489',
        owasp: 'A04:2021',
        check: ($, url)=>{
            if (!url) return false;
            const bodyText = $('body').text().toLowerCase();
            const debugPatterns = [
                'debug',
                'stack trace',
                'error details',
                'exception',
                'java.io',
                'stacktrace',
                'error in',
                'at '
            ];
            const hasDebugContent = debugPatterns.some((p)=>bodyText.includes(p));
            const debugUrls = /(\/debug|\/trace|\/actuator|\/env|\/config|\/actuator\/health)/i.test(url);
            return hasDebugContent || debugUrls;
        },
        remediation: 'Disable debug mode in production. Remove debug endpoints or restrict access.'
    },
    {
        id: 'missing-rate-limit',
        title: 'Missing Rate Limiting Headers',
        description: 'No rate limiting headers detected, suggesting no brute force protection.',
        severity: 'medium',
        cwe: 'CWE-307',
        owasp: 'A04:2021',
        check: ($, _url, headers)=>{
            const rateHeaders = [
                'x-ratelimit-limit',
                'x-ratelimit-remaining',
                'ratelimit-limit'
            ];
            return !rateHeaders.some((h)=>headers[h.toLowerCase()]);
        },
        remediation: 'Implement rate limiting. Use headers like X-RateLimit-Limit and Retry-After.'
    },
    // A05 - Security Misconfiguration
    {
        id: 'missing-csp',
        title: 'Content Security Policy Missing',
        description: 'No CSP header leaves the application vulnerable to XSS and data injection.',
        severity: 'high',
        cwe: 'CWE-1021',
        owasp: 'A05:2021',
        check: ($, _url, headers)=>{
            return !Object.keys(headers).some((h)=>h.includes('content-security-policy'));
        },
        remediation: 'Implement a strict CSP. Start with report-only mode to identify violations.'
    },
    {
        id: 'missing-xfo',
        title: 'X-Frame-Options Header Missing',
        description: 'Page can be embedded in iframes, enabling clickjacking attacks.',
        severity: 'medium',
        cwe: 'CWE-1021',
        owasp: 'A05:2021',
        check: ($, _url, headers)=>{
            return !Object.keys(headers).some((h)=>h.includes('x-frame-options'));
        },
        remediation: 'Add X-Frame-Options: DENY or SAMEORIGIN header. Consider CSP frame-ancestors.'
    },
    {
        id: 'missing-xct',
        title: 'X-Content-Type-Options Header Missing',
        description: 'Browser may MIME-sniff content, enabling attacks.',
        severity: 'medium',
        cwe: 'CWE-693',
        owasp: 'A05:2021',
        check: ($, _url, headers)=>{
            return !headers['x-content-type-options'];
        },
        remediation: 'Add X-Content-Type-Options: nosniff header.'
    },
    {
        id: 'missing-xxp',
        title: 'X-XSS-Protection Header Missing or Weak',
        description: 'XSS filter not properly configured.',
        severity: 'low',
        cwe: 'CWE-692',
        owasp: 'A05:2021',
        check: ($, _url, headers)=>{
            const header = headers['x-xss-protection'] || '';
            return header === '' || header === '0' || header === '1';
        },
        remediation: 'Use CSP instead for XSS protection. If needed, set X-XSS-Protection: 0 (prefer CSP).'
    },
    {
        id: 'missing-referrer-policy',
        title: 'Referrer-Policy Header Missing',
        description: 'Referrer information may leak to external sites.',
        severity: 'low',
        cwe: 'CWE-116',
        owasp: 'A05:2021',
        check: ($, _url, headers)=>{
            return !headers['referrer-policy'];
        },
        remediation: 'Add Referrer-Policy: strict-origin-when-cross-origin or no-referrer.'
    },
    {
        id: 'permissions-policy',
        title: 'Permissions-Policy Header Missing',
        description: 'Browser features not restricted, may enable attacks.',
        severity: 'low',
        cwe: 'CWE-16',
        owasp: 'A05:2021',
        check: ($, _url, headers)=>{
            return !headers['permissions-policy'] && !headers['feature-policy'];
        },
        remediation: 'Add Permissions-Policy to disable unused browser features (camera, mic, geolocation, etc).'
    },
    {
        id: 'server-version',
        title: 'Server Version Information Disclosed',
        description: 'Server or framework version exposed in headers.',
        severity: 'low',
        cwe: 'CWE-200',
        owasp: 'A05:2021',
        check: ($, _url, headers)=>{
            const versionHeaders = [
                'server',
                'x-powered-by',
                'x-aspnet-version',
                'x-generator'
            ];
            return versionHeaders.some((h)=>headers[h] && /\d+(\.\d+)+/.test(headers[h]));
        },
        remediation: 'Remove or genericize version headers. Hide server technology stack information.'
    },
    {
        id: 'trace-method',
        title: 'HTTP TRACE Method Enabled',
        description: 'TRACE method enabled, can be used in Cross-Site Tracing attacks.',
        severity: 'medium',
        cwe: 'CWE-74',
        owasp: 'A05:2021',
        check: ($, _url, headers)=>{
            const allow = headers['allow'] || headers['access-control-allow-methods'] || '';
            return /trace/i.test(allow);
        },
        remediation: 'Disable TRACE method at the web server level.'
    },
    // A06 - Vulnerable Components
    {
        id: 'old-dep',
        title: 'Potentially Outdated JavaScript Dependencies',
        description: 'Script tags suggest old library versions may be in use.',
        severity: 'medium',
        cwe: 'CWE-1104',
        owasp: 'A06:2021',
        check: ($, _url)=>{
            const scripts = $('script[src]').map((_, el)=>$(el).attr('src')).get();
            return scripts.some((src)=>{
                if (!src) return false;
                const oldPatterns = [
                    /jquery[/-]1\./i,
                    /jquery[/-]2\./i,
                    /jquery[/-]3\.0/i,
                    /bootstrap[/-]3\./i,
                    /angular[/-]1\./i,
                    /react[/-]0\./i,
                    /vue[/-]1\./i
                ];
                return oldPatterns.some((p)=>p.test(src));
            });
        },
        remediation: 'Update all JavaScript dependencies to latest stable versions. Monitor for CVE announcements.'
    },
    {
        id: 'cdn-unknown',
        title: 'Unknown Third-Party Scripts',
        description: 'Scripts loaded from unknown CDNs may pose supply chain risks.',
        severity: 'medium',
        cwe: 'CWE-1359',
        owasp: 'A06:2021',
        check: ($, _url)=>{
            const scripts = $('script[src]').map((_, el)=>$(el).attr('src')).get();
            const knownCdns = [
                'jquery',
                'bootstrap',
                'googleapis',
                'cloudflare',
                'cdnjs',
                'unpkg',
                'jsdelivr'
            ];
            return scripts.filter((src)=>{
                if (!src) return false;
                return !knownCdns.some((cdn)=>src.toLowerCase().includes(cdn));
            }).length > 0;
        },
        remediation: 'Review all third-party scripts. Use Subresource Integrity (SRI) hashes.'
    },
    // A07 - Auth Failures
    {
        id: 'autocomplete-password',
        title: 'Password Field With Autocomplete Enabled',
        description: 'Password fields should not allow autocomplete to prevent credential theft.',
        severity: 'high',
        cwe: 'CWE-799',
        owasp: 'A07:2021',
        check: ($, _url)=>{
            const passwordFields = $('input[type="password"]');
            return passwordFields.filter((_, el)=>{
                const autocomplete = $(el).attr('autocomplete');
                return !autocomplete || autocomplete !== 'off';
            }).length > 0;
        },
        remediation: 'Add autocomplete="off" to all password fields.'
    },
    {
        id: 'weak-auth',
        title: 'Weak or No Authentication on Sensitive Form',
        description: 'Form appears to handle sensitive data without strong auth indicators.',
        severity: 'high',
        cwe: 'CWE-287',
        owasp: 'A07:2021',
        check: ($, _url)=>{
            const sensitiveForms = $('form').filter((_, form)=>{
                const text = $(form).text().toLowerCase();
                const hasPassword = /password|passwd|secret/i.test($(form).html() || '');
                const hasLogin = /login|signin|auth|log-in/i.test(text);
                return hasPassword || hasLogin;
            });
            const has2fa = $('input[name*="totp"], input[name*="2fa"], input[name*="code"]').length > 0;
            return sensitiveForms.length > 0 && !has2fa;
        },
        remediation: 'Implement multi-factor authentication. Use secure session management.'
    },
    // A08 - Software Integrity
    {
        id: 'no-sri',
        title: 'Scripts Without Subresource Integrity (SRI)',
        description: 'External scripts loaded without SRI hashes, vulnerable to tampering.',
        severity: 'medium',
        cwe: 'CWE-345',
        owasp: 'A08:2021',
        check: ($, _url)=>{
            const scriptsWithSrc = $('script[src]').filter((_, el)=>{
                const src = $(el).attr('src') || '';
                return src.startsWith('http') && !$(el).attr('integrity');
            });
            return scriptsWithSrc.length > 0;
        },
        remediation: 'Add integrity attribute (SRI) to all external scripts: <script src="..." integrity="sha384-..." crossorigin="anonymous">'
    },
    {
        id: 'sri-not-used',
        title: 'External Scripts Found Without Integrity Check',
        description: 'External resources loaded without verification, risk of CDN compromise.',
        severity: 'medium',
        cwe: 'CWE-346',
        owasp: 'A08:2021',
        check: ($, _url)=>{
            const externalScripts = $('script[src]').filter((_, el)=>{
                const src = $(el).attr('src') || '';
                return src.startsWith('https://');
            });
            const withoutIntegrity = externalScripts.filter((_, el)=>!$(el).attr('integrity'));
            return withoutIntegrity.length > 0;
        },
        remediation: 'Use Subresource Integrity for all external scripts. Verify CDN credentials.'
    },
    // A09 - Logging & Monitoring
    {
        id: 'no-security-page',
        title: 'Missing Security.txt or Policy Page',
        description: 'No security policy page found for responsible disclosure.',
        severity: 'info',
        cwe: 'CWE-778',
        owasp: 'A09:2021',
        check: ($, _url)=>{
            return !$('a[href="/security"], a[href="/security.txt"], a[href="/.well-known/security.txt"]').length;
        },
        remediation: 'Create a security.txt file at /.well-known/security.txt with contact information.'
    },
    // A10 - SSRF
    {
        id: 'ssrf-risk',
        title: 'Potential SSRF Risk via URL Parameters',
        description: 'URL parameters that accept URLs may enable Server-Side Request Forgery.',
        severity: 'high',
        cwe: 'CWE-918',
        owasp: 'A10:2021',
        check: ($, url)=>{
            const urlObj = safeParseUrl(url);
            if (!urlObj) return false;
            const ssrfParams = [
                'url',
                'uri',
                'link',
                'src',
                'source',
                'domain',
                'host',
                'port',
                'path',
                'dest'
            ];
            return ssrfParams.some((p)=>urlObj.searchParams.has(p));
        },
        remediation: 'Validate and sanitize all URL parameters. Use allowlists for permitted destinations. Never forward requests to user-controlled URLs.'
    },
    // OWASP Top 10 2025 - NEW A03: Software Supply Chain Failures
    {
        id: 'suspicious-cdn',
        title: 'Unverified Third-Party Script (Supply Chain Risk)',
        description: 'External script loaded from an unknown source without Subresource Integrity. Attackers may compromise CDNs to inject malware (OWASP A03:2025).',
        severity: 'high',
        cwe: 'CWE-1359',
        owasp: 'A03:2025',
        check: ($, _url)=>{
            const scripts = $('script[src]').filter((_, el)=>{
                const src = $(el).attr('src') || '';
                return src.startsWith('http') && !$(el).attr('integrity');
            }).length > 0;
            return scripts;
        },
        remediation: 'Use Subresource Integrity (SRI) for all external scripts. Verify CDN providers. Monitor for supply chain compromises.'
    },
    // OWASP Top 10 2025 - NEW A10: Mishandling of Exceptional Conditions
    {
        id: 'error-stack-exposed',
        title: 'Exposed Error/Stack Information (OWASP A10:2025)',
        description: 'Debug or error information found in the page. Exposing stack traces, error details, or framework version information helps attackers identify vulnerabilities (OWASP A10:2025 - Mishandling of Exceptional Conditions).',
        severity: 'high',
        cwe: 'CWE-209',
        owasp: 'A10:2025',
        check: ($, url)=>{
            if (!url) return false;
            const bodyText = $('body').text().toLowerCase();
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
                /typeerror/i
            ];
            const hasErrorContent = errorPatterns.some((p)=>p.test(bodyText));
            const debugUrls = /(\/debug|\/trace|\/actuator|\/_debug|\/error|\/exception)/i.test(url);
            return hasErrorContent || debugUrls;
        },
        remediation: 'Disable debug mode in production. Return generic error messages to users while logging details server-side. Remove stack traces from HTTP responses. Implement proper error boundaries (React ErrorBoundary) and global exception handlers.'
    },
    {
        id: 'missing-error-boundary',
        title: 'Missing Error Boundaries (OWASP A10:2025)',
        description: 'No React ErrorBoundary found. Unhandled component errors can crash the entire app and expose error information to users.',
        severity: 'medium',
        cwe: 'CWE-755',
        owasp: 'A10:2025',
        check: ($, _url)=>{
            const html = $.html().toLowerCase();
            const hasErrorBoundary = /errorboundary|<errorboundary|componentdidcatch|getderivedstatefromerror/i.test(html);
            const hasReactApp = /data-react|/i.test(html) || $('script[src*="react"]').length > 0;
            return hasReactApp && !hasErrorBoundary;
        },
        remediation: 'Implement React ErrorBoundary components to catch and handle render errors gracefully. Use componentDidCatch or getDerivedStateFromError. This prevents app crashes from exposing error details.'
    },
    {
        id: 'missing-coop',
        title: 'Cross-Origin-Opener-Policy (COOP) Header Missing (OWASP A05:2025)',
        description: 'COOP header not set. Without COOP, your page can be opened by cross-origin documents in the same browsing context group, enabling Spectre-style attacks.',
        severity: 'medium',
        cwe: 'CWE-1021',
        owasp: 'A05:2025',
        check: ($, _url, headers)=>{
            return !headers['cross-origin-opener-policy'];
        },
        remediation: 'Add Cross-Origin-Opener-Policy: same-origin header to prevent cross-origin documents from accessing your window.'
    },
    {
        id: 'missing-corp',
        title: 'Cross-Origin-Resource-Policy (CORP) Header Missing (OWASP A05:2025)',
        description: 'CORP header not set. Without CORP, your resources can be loaded by other origins, enabling clickjacking and data theft.',
        severity: 'medium',
        cwe: 'CWE-1021',
        owasp: 'A05:2025',
        check: ($, _url, headers)=>{
            return !headers['cross-origin-resource-policy'] && !headers['cross-origin-resource-policy'];
        },
        remediation: 'Add Cross-Origin-Resource-Policy: same-origin or cross-origin header based on your resource loading needs.'
    },
    {
        id: 'missing-coep',
        title: 'Cross-Origin-Embedder-Policy (COEP) Header Missing (OWASP A05:2025)',
        description: 'COEP header not set. Without COEP, cross-origin resources without CORP/COOP headers can be embedded, blocking access to features like SharedArrayBuffer.',
        severity: 'low',
        cwe: 'CWE-1021',
        owasp: 'A05:2025',
        check: ($, _url, headers)=>{
            return !headers['cross-origin-embedder-policy'];
        },
        remediation: 'Add Cross-Origin-Embedder-Policy: require-corp header if you need cross-origin isolation (required for SharedArrayBuffer, performance.measureMemory).'
    },
    {
        id: 'permissions-policy-weak',
        title: 'Weak Permissions-Policy Header (OWASP A05:2025)',
        description: 'Permissions-Policy is either missing or allows risky browser features. Unused features like camera, microphone, or geolocation should be disabled.',
        severity: 'low',
        cwe: 'CWE-16',
        owasp: 'A05:2025',
        check: ($, _url, headers)=>{
            const pp = headers['permissions-policy'] || headers['feature-policy'] || '';
            if (!pp) return true;
            const riskyPerms = [
                'camera=(',
                'microphone=(',
                'geolocation=(',
                'gyroscope=(',
                'magnetometer=('
            ];
            return riskyPerms.some((p)=>pp.includes(p + '"') || pp.includes(p + '\'')) || pp.includes('*');
        },
        remediation: 'Set Permissions-Policy to disable unused browser features: Permissions-Policy: camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=()'
    },
    {
        id: 'fail-open',
        title: 'Potential Fail-Open Condition (OWASP A10:2025)',
        description: 'Authentication or authorization logic may fail open, allowing access when it should be denied. This is a critical logic flaw in error handling (OWASP A10:2025).',
        severity: 'critical',
        cwe: 'CWE-836',
        owasp: 'A10:2025',
        check: ($, url)=>{
            if (!url) return false;
            const authUrls = /(\/admin|\/dashboard|\/settings|\/profile|\/user|\/account)/i.test(url);
            const failOpenPatterns = /(\/auth\/bypass|\/skip|\/guest|\/anonymous|\/public)/i.test(url);
            return authUrls && failOpenPatterns;
        },
        remediation: 'Review authentication/authorization logic for fail-open conditions. Ensure access is denied by default. Use explicit allowlists for permitted access.'
    }
];
async function scanWebsite(url) {
    const findings = [];
    const startTime = Date.now();
    let headers = {};
    // Validate URL before attempting fetch
    const urlObj = safeParseUrl(url);
    if (!urlObj) {
        throw new Error(`Invalid URL format: ${url}`);
    }
    try {
        const { finalUrl, html, headers: responseHeaders } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$network$2d$security$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchPublicHtml"])(url);
        // Extract headers with normalization
        headers = normalizeHeaders(responseHeaders);
        const $ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cheerio$2f$dist$2f$esm$2f$load$2d$parse$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["load"](html);
        // Run all checks with error isolation
        for(let i = 0; i < SECURITY_CHECKS.length; i++){
            const check = SECURITY_CHECKS[i];
            const isTriggered = safeCheck(()=>check.check($, finalUrl, headers));
            if (isTriggered) {
                findings.push(buildFinding(check, findings.length));
            }
        }
    } catch (error) {
        if (error.name === 'TimeoutError') {
            throw new Error(`Website scan timed out after 15 seconds. Try a faster website.`);
        }
        throw new Error(`Failed to fetch website: ${error.message}`);
    }
    // Calculate severity counts
    const severityCounts = initSeverityCounts();
    for (const f of findings){
        if (f.severity in severityCounts) {
            severityCounts[f.severity]++;
        }
    }
    return {
        findings,
        severityCounts,
        scannedUrls: 1,
        scanDuration: Date.now() - startTime
    };
}
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$better$2d$sqlite3$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@prisma/adapter-better-sqlite3/dist/index.mjs [app-route] (ecmascript)");
;
;
const globalForPrisma = globalThis;
function createPrismaClient() {
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db';
    const adapter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$better$2d$sqlite3$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PrismaBetterSQLite3"]({
        url: dbPath
    });
    return new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
        adapter
    });
}
const prisma = globalForPrisma.prisma ?? createPrismaClient();
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[project]/src/lib/scan-store.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getApiKeyFromHeaders",
    ()=>getApiKeyFromHeaders,
    "getScanById",
    ()=>getScanById,
    "isAdminApiKey",
    ()=>isAdminApiKey,
    "listRecentScans",
    ()=>listRecentScans,
    "normalizeScanTarget",
    ()=>normalizeScanTarget,
    "persistScan",
    ()=>persistScan,
    "toScanAPIResponse",
    ()=>toScanAPIResponse
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
const MAX_SCAN_LIST_LIMIT = 50;
function parseAllowedApiKeyHashes() {
    return (process.env.VIBECHECKER_API_KEY_HASHES || '').split(',').map((hash)=>hash.trim()).filter(Boolean);
}
function sha256(value) {
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["createHash"])('sha256').update(value).digest();
}
function safeEqualHexHash(expectedHex, actual) {
    const expected = Buffer.from(expectedHex, 'hex');
    if (expected.length !== actual.length) return false;
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["timingSafeEqual"])(expected, actual);
}
function isAdminApiKey(apiKey) {
    if (!apiKey) return false;
    const allowedHashes = parseAllowedApiKeyHashes();
    if (allowedHashes.length === 0) return false;
    const actual = sha256(apiKey);
    return allowedHashes.some((expectedHash)=>safeEqualHexHash(expectedHash, actual));
}
function getApiKeyFromHeaders(headers) {
    const xApiKey = headers.get('x-api-key');
    if (xApiKey) return xApiKey;
    const authHeader = headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice('Bearer '.length).trim();
    }
    return null;
}
function normalizeScanTarget(rawUrl) {
    try {
        const parsed = new URL(rawUrl.trim());
        parsed.hash = '';
        parsed.search = '';
        parsed.hostname = parsed.hostname.toLowerCase();
        parsed.pathname = parsed.pathname.replace(/\/$/, '') || '';
        return parsed.toString().replace(/\/$/, '');
    } catch  {
        return rawUrl.trim().toLowerCase().replace(/\/$/, '');
    }
}
function toFindingCreate(finding) {
    return {
        ruleId: finding.ruleId,
        severity: finding.severity,
        title: finding.title,
        description: finding.description,
        filePath: finding.filePath ?? null,
        lineNumber: finding.lineNumber ?? null,
        snippet: finding.snippet ?? null,
        remediation: finding.remediation
    };
}
async function persistScan(scan) {
    const normalizedUrl = normalizeScanTarget(scan.targetUrl);
    const now = new Date(scan.scannedAt);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].$transaction(async (tx)=>{
        const target = await tx.target.upsert({
            where: {
                type_normalizedUrl: {
                    type: scan.type,
                    normalizedUrl
                }
            },
            create: {
                type: scan.type,
                normalizedUrl,
                displayUrl: scan.targetUrl,
                firstScannedAt: now,
                lastScannedAt: now,
                scanCount: 1
            },
            update: {
                displayUrl: scan.targetUrl,
                lastScannedAt: now,
                scanCount: {
                    increment: 1
                }
            }
        });
        await tx.scan.create({
            data: {
                id: scan.scanId,
                targetId: target.id,
                targetUrl: scan.targetUrl,
                scanType: scan.type,
                findingsJson: JSON.stringify(scan.findings),
                severityCounts: JSON.stringify(scan.severityCounts),
                scannedFiles: scan.scannedFiles ?? null,
                scannedUrls: scan.scannedUrls ?? null,
                scanDuration: scan.scanDuration ?? null,
                createdAt: now,
                findings: {
                    create: scan.findings.map((finding)=>toFindingCreate(finding))
                }
            }
        });
    });
}
function toScanAPIResponse(scan) {
    return {
        scanId: scan.id,
        type: scan.scanType === 'github' ? 'github' : 'website',
        targetUrl: scan.targetUrl,
        status: 'completed',
        findings: JSON.parse(scan.findingsJson),
        severityCounts: JSON.parse(scan.severityCounts),
        scannedAt: scan.createdAt.toISOString(),
        scannedFiles: scan.scannedFiles ?? undefined,
        scannedUrls: scan.scannedUrls ?? undefined,
        scanDuration: scan.scanDuration ?? undefined
    };
}
async function getScanById(id) {
    const scan = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].scan.findUnique({
        where: {
            id
        }
    });
    return scan ? toScanAPIResponse(scan) : null;
}
async function listRecentScans(limit) {
    const safeLimit = Math.max(1, Math.min(limit, MAX_SCAN_LIST_LIMIT));
    const scans = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].scan.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        take: safeLimit
    });
    return scans.map(toScanAPIResponse);
}
}),
"[project]/src/app/api/scan/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "OPTIONS",
    ()=>OPTIONS,
    "POST",
    ()=>POST
]);
/**
 * Unified Scan API - Handles both GitHub and Website scans
 * POST /api/scan
 * GET /api/scan - List recent scans
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/security-headers.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scanners$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/scanners/github.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scanners$2f$website$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/scanners/website.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scan$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/scan-store.ts [app-route] (ecmascript)");
;
;
;
;
;
;
// Valid scan types
const VALID_TYPES = [
    'github',
    'website'
];
async function OPTIONS(request) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({}, {
        headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
    });
}
async function GET(request) {
    const adminKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scan$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getApiKeyFromHeaders"])(request.headers);
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scan$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isAdminApiKey"])(adminKey)) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Scan listing requires an admin API key',
            code: 'ADMIN_KEY_REQUIRED'
        }, {
            status: 403,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
        });
    }
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const scans = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scan$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listRecentScans"])(limit);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        count: scans.length,
        scans
    }, {
        headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
    });
}
async function POST(request) {
    try {
        // Rate limiting using client IP as identifier
        const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('cf-connecting-ip') || 'anonymous';
        const rateLimitResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["checkRateLimit"])(clientIp);
        if (!rateLimitResult.allowed) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Too many requests. Please wait before trying again.',
                code: 'RATE_LIMITED',
                retryAfter: rateLimitResult.retryAfter
            }, {
                status: 429,
                headers: {
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request),
                    'Retry-After': String(Math.ceil((rateLimitResult.retryAfter || 1000) / 1000))
                }
            });
        }
        // Parse request body
        let url;
        let type;
        let githubToken;
        try {
            const body = await request.json();
            url = body?.url;
            type = body?.type;
            githubToken = body?.apiKey; // Reuse apiKey field as GitHub token
        } catch  {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid JSON in request body',
                code: 'INVALID_JSON'
            }, {
                status: 400,
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
            });
        }
        // Validate required fields
        if (!url || typeof url !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'URL is required',
                code: 'URL_REQUIRED'
            }, {
                status: 400,
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
            });
        }
        if (!type || typeof type !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Type is required (github or website)',
                code: 'TYPE_REQUIRED'
            }, {
                status: 400,
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
            });
        }
        // Validate type
        if (!VALID_TYPES.includes(type)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid type. Must be "github" or "website"',
                code: 'INVALID_TYPE'
            }, {
                status: 400,
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
            });
        }
        const trimmedUrl = url.trim();
        // Validate URL based on type
        let validation;
        if (type === 'github') {
            validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateGitHubUrl"])(trimmedUrl);
        } else {
            validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["validateWebsiteUrl"])(trimmedUrl);
        }
        if (!validation.valid) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: validation.error,
                code: validation.code
            }, {
                status: 400,
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
            });
        }
        // Perform scan
        let result;
        if (type === 'github') {
            // Extract GitHub token from header if provided
            const authHeader = request.headers.get('authorization');
            const token = githubToken || authHeader?.replace('Bearer ', '');
            result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scanners$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scanGitHubRepo"])(trimmedUrl, token);
        } else {
            result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scanners$2f$website$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scanWebsite"])(trimmedUrl);
        }
        const scanId = crypto.randomUUID();
        const response = {
            scanId,
            type: type,
            targetUrl: trimmedUrl,
            status: 'completed',
            findings: result.findings,
            severityCounts: result.severityCounts,
            scannedAt: new Date().toISOString(),
            scannedUrls: result.scannedUrls,
            scannedFiles: result.scannedFiles,
            scanDuration: result.scanDuration
        };
        // Persist scan result for later retrieval by ID. The scan itself still
        // succeeds if persistence is temporarily unavailable.
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$scan$2d$store$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["persistScan"])(response);
        } catch (persistError) {
            console.error('Failed to persist scan:', persistError);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            ...response
        }, {
            headers: {
                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request),
                'X-RateLimit-Remaining': String(rateLimitResult.remainingRequests ?? 0)
            }
        });
    } catch (error) {
        console.error('Scan error:', error.message);
        // Handle specific error types
        if (error.message?.includes('Invalid GitHub URL')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid GitHub repository URL',
                code: 'INVALID_URL'
            }, {
                status: 400,
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
            });
        }
        if (error.message?.includes('not found') || error.message?.includes('404')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Repository not found or is not public',
                code: 'REPO_NOT_FOUND'
            }, {
                status: 404,
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
            });
        }
        if (error.message?.includes('rate limit') || error.status === 403) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'GitHub API rate limit exceeded. Try again later or provide a token.',
                code: 'GITHUB_RATE_LIMIT'
            }, {
                status: 429,
                headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Scan failed. Please try again.',
            code: 'SCAN_FAILED'
        }, {
            status: 500,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$security$2d$headers$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildCorsHeaders"])(request)
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1nw45x2._.js.map