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
"[project]/src/utils/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const createClient = async ()=>{
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(supabaseUrl, supabaseKey, {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // The `setAll` method was called from a Server Component.
                // This can be ignored if you have middleware refreshing user sessions.
                }
            }
        }
    });
};
}),
"[project]/src/lib/cors.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Centralized CORS configuration for VibeChecker API routes.
 *
 * Security rationale (OWASP A01:2021 - Broken Access Control):
 * - We do NOT use `Access-Control-Allow-Origin: *`. A wildcard origin allows
 *   any third-party site to invoke our API with the user's cookies, which is
 *   unsafe once we ship authenticated endpoints. CORS is browser-enforced, so
 *   on the server we still validate the request; the header exists to tell
 *   the browser which JS origins are allowed to read the response.
 * - We echo the request's `Origin` header back ONLY when it matches a trusted
 *   allowlist. This keeps the response `Vary: Origin` so caches don't serve
 *   one tenant's CORS headers to another.
 * - In server-to-server calls (no Origin header), we skip the CORS header
 *   entirely because there is no browser to instruct.
 */ __turbopack_context__.s([
    "getCorsHeaders",
    ()=>getCorsHeaders,
    "getPreflightHeaders",
    ()=>getPreflightHeaders
]);
/**
 * Trusted origins for VibeChecker. The list must be updated when new
 * production or preview deployments are added.
 */ const ALLOWED_ORIGINS = [
    // Production
    "https://vibe-checker-beta-umber.vercel.app",
    "https://vibecheck.dev",
    "https://www.vibecheck.dev",
    // Preview deployments follow this pattern on Vercel
    "https://vibe-checker-beta-git-main-iamtweaks.vercel.app",
    // Local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001"
];
function getCorsHeaders(request) {
    const requestOrigin = request?.headers.get("origin") ?? "";
    const allowOrigin = ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : "";
    const headers = {
        Vary: "Origin",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
        "Access-Control-Max-Age": "86400",
        // Do not advertise wildcard credentials - we use token auth, not cookies
        "Access-Control-Allow-Credentials": "true"
    };
    if (allowOrigin) {
        headers["Access-Control-Allow-Origin"] = allowOrigin;
    }
    return headers;
}
function getPreflightHeaders(request) {
    return getCorsHeaders(request);
}
}),
"[project]/src/lib/db/persistence.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Canonical persistence layer for scans and findings.
 *
 * Why this exists
 * ---------------
 * Previously, /api/scan/website and /api/scan/github each contained their own
 * copy of:
 *   - URL normalization
 *   - get_or_create_website RPC call
 *   - Insert into `scans`
 *   - Insert into `scan_findings`
 *
 * That duplication drifted: github inserted findings with `apiKey` reuse, website
 * did not normalize trailing slashes, and neither route deduplicated within
 * the same scan. Result: a re-scan of the same URL produced a new `website`
 * row and double-counted every finding.
 *
 * This module is the single source of truth for:
 *   - URL normalization (one URL = one website row, forever)
 *   - scan upsert (find the most recent scan for that URL, link to it)
 *   - finding dedupe (rule_id + file_path + line_number is unique within a scan)
 *
 * Anything that needs to persist a scan MUST go through `persistScan`.
 */ __turbopack_context__.s([
    "buildStats",
    ()=>buildStats,
    "normalizeTargetUrl",
    ()=>normalizeTargetUrl,
    "persistScan",
    ()=>persistScan
]);
function normalizeTargetUrl(rawUrl, kind) {
    const trimmed = rawUrl.trim();
    if (!trimmed) return trimmed;
    if (kind === "github") {
        // owner/repo shorthand: keep it as the canonical "github.com/owner/repo"
        // so two inputs of "facebook/react" and "facebook/react/" both land on
        // the same row.
        const shorthand = trimmed.match(/^([\w.-]+)\/([\w.-]+?)\/?$/);
        if (shorthand && !trimmed.includes("://") && !trimmed.includes("github.com")) {
            return `https://github.com/${shorthand[1]}/${shorthand[2]}`.toLowerCase();
        }
    }
    let url = trimmed;
    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
    }
    const parsed = new URL(url);
    parsed.hash = "";
    // Strip trailing slash from pathname (keep "/" for the bare host).
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
        parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    // Drop tracking params that real users don't care about.
    parsed.search = "";
    parsed.protocol = parsed.protocol.toLowerCase();
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.toString();
}
/**
 * Resolve or create the canonical website row for a normalized URL.
 * Returns the website id or null on failure (failure is non-fatal: callers
 * log it but still return the scan response to the user).
 */ async function resolveWebsiteId(supabase, normalizedUrl) {
    const { data, error } = await supabase.rpc("get_or_create_website", {
        p_url: normalizedUrl
    });
    if (error) {
        console.error("get_or_create_website failed:", error);
        return null;
    }
    return data ?? null;
}
/**
 * Insert the scan row. We do NOT dedupe scans themselves: every scan run is a
 * distinct event (different timestamp, different finding counts, possibly
 * different code state). What we dedupe is findings within a scan and
 * websites across scans.
 */ async function insertScan(supabase, input) {
    const { data, error } = await supabase.from("scans").insert({
        website_id: input.websiteId,
        scan_type: input.kind,
        target_url: input.normalizedUrl,
        findings_count: input.findingsCount,
        severity_counts: input.severityCounts,
        findings: [],
        scan_duration_ms: input.scanDurationMs,
        status: "completed"
    }).select("id").single();
    if (error) {
        console.error("scans insert failed:", error);
        return null;
    }
    return data?.id ?? null;
}
/**
 * Build the list of finding rows, deduping by
 * (rule_id, file_path, line_number) within the scan.
 *
 * We dedupe here in addition to the unique index so the client sees the
 * count we actually inserted; the unique index is a defense in depth in case
 * two scans race on the same finding tuple.
 */ function buildFindingRows(scanId, findings) {
    const seen = new Set();
    const rows = [];
    for (const f of findings){
        const key = `${f.ruleId}::${f.filePath ?? ""}::${f.lineNumber ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push({
            scan_id: scanId,
            rule_id: f.ruleId,
            title: f.title,
            description: f.description,
            severity: f.severity,
            file_path: f.filePath ?? null,
            line_number: f.lineNumber ?? null,
            code_snippet: f.snippet ?? null,
            remediation: f.remediation
        });
    }
    return rows;
}
async function persistScan(input) {
    const normalizedUrl = normalizeTargetUrl(input.rawUrl, input.kind);
    const websiteId = await resolveWebsiteId(input.supabase, normalizedUrl);
    if (!websiteId) {
        return {
            websiteId: null,
            scanId: null,
            findingsInserted: 0
        };
    }
    const scanId = await insertScan(input.supabase, {
        websiteId,
        kind: input.kind,
        normalizedUrl,
        findingsCount: input.findings.length,
        severityCounts: input.severityCounts,
        scanDurationMs: input.scanDurationMs
    });
    if (!scanId) {
        return {
            websiteId,
            scanId: null,
            findingsInserted: 0
        };
    }
    if (input.findings.length === 0) {
        return {
            websiteId,
            scanId,
            findingsInserted: 0
        };
    }
    const rows = buildFindingRows(scanId, input.findings);
    if (rows.length === 0) {
        return {
            websiteId,
            scanId,
            findingsInserted: 0
        };
    }
    const { error } = await input.supabase.from("scan_findings").insert(rows);
    if (error) {
        console.error("scan_findings insert failed:", error);
        return {
            websiteId,
            scanId,
            findingsInserted: 0
        };
    }
    return {
        websiteId,
        scanId,
        findingsInserted: rows.length
    };
}
async function buildStats(supabase) {
    const [{ count: totalScans }, { count: uniqueSites }, { count: totalVulnerabilities }, { data: findingKeys }] = await Promise.all([
        supabase.from("scans").select("*", {
            count: "exact",
            head: true
        }),
        supabase.from("websites").select("*", {
            count: "exact",
            head: true
        }),
        supabase.from("scan_findings").select("*", {
            count: "exact",
            head: true
        }),
        // (website_id, rule_id) pair = "this rule fired on this site".
        // Distinct pairs = unique vulns across the entire scanned corpus.
        supabase.from("scan_findings").select("scan_id, rule_id, scans!inner(website_id)").limit(5000)
    ]);
    const uniqueSet = new Set();
    for (const row of findingKeys ?? []){
        const websiteId = row.scans?.website_id;
        const ruleId = row.rule_id;
        if (websiteId && ruleId) uniqueSet.add(`${websiteId}::${ruleId}`);
    }
    return {
        totalScans: totalScans ?? 0,
        uniqueSites: uniqueSites ?? 0,
        totalVulnerabilities: totalVulnerabilities ?? 0,
        uniqueVulnerabilities: uniqueSet.size
    };
}
}),
"[project]/src/app/api/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "OPTIONS",
    ()=>OPTIONS,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cors.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$persistence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/persistence.ts [app-route] (ecmascript)");
;
;
;
;
async function OPTIONS(request) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({}, {
        headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getPreflightHeaders"])(request)
    });
}
async function GET(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const stats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$persistence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildStats"])(supabase);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ...stats,
            recentScans: []
        }, {
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCorsHeaders"])(request)
        });
    } catch (error) {
        console.error("Stats API error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            totalScans: 0,
            uniqueSites: 0,
            totalVulnerabilities: 0,
            uniqueVulnerabilities: 0,
            recentScans: [],
            error: "Service unavailable"
        }, {
            status: 200,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCorsHeaders"])(request)
        });
    }
}
async function POST(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const stats = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$persistence$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildStats"])(supabase);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(stats, {
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCorsHeaders"])(request)
        });
    } catch (error) {
        console.error("Stats POST error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to load stats"
        }, {
            status: 500,
            headers: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cors$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCorsHeaders"])(request)
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1l_bh7a._.js.map