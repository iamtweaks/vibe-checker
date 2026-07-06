import type { Finding, Severity } from "../types";

type HeaderMatchKind = "presence" | "value-equals" | "value-matches";

interface HeaderRule {
	id: string;
	header: string;
	severity: Severity;
	title: string;
	description: string;
	remediation: string;
	cwe?: string;
	owasp?: string;
	match: HeaderMatchKind;
	/** Allowed values for value-equals. Lowercase comparison. */
	allowed?: string[];
	/** Regex (lowercased) for value-matches. */
	pattern?: RegExp;
}

const HEADER_RULES: HeaderRule[] = [
	{
		id: "WEB-001",
		header: "content-security-policy",
		severity: "high",
		title: "Content-Security-Policy Missing",
		description:
			"Content-Security-Policy header is not set. This helps prevent XSS and data injection attacks (OWASP A05:2025 - Security Misconfiguration).",
		remediation:
			"Add a strict CSP. Start with Content-Security-Policy-Report-Only in monitoring mode: Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; object-src 'none'; base-uri 'self'.",
		cwe: "CWE-1021",
		owasp: "A05:2021",
		match: "presence",
	},
	{
		id: "WEB-002",
		header: "strict-transport-security",
		severity: "high",
		title: "HSTS Header Missing",
		description:
			"Strict-Transport-Security header is not set. Browsers won't enforce HTTPS, leaving users vulnerable to protocol downgrade attacks.",
		remediation:
			"Add HSTS header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
		cwe: "CWE-319",
		owasp: "A02:2021",
		match: "presence",
	},
	{
		id: "WEB-003",
		header: "x-frame-options",
		severity: "medium",
		title: "X-Frame-Options Missing",
		description:
			"X-Frame-Options header is not set. Site may be vulnerable to clickjacking attacks where an attacker embeds the page in an iframe.",
		remediation:
			"Add X-Frame-Options: DENY or X-Frame-Options: SAMEORIGIN. Consider using CSP frame-ancestors directive for broader browser support.",
		cwe: "CWE-1021",
		owasp: "A05:2021",
		match: "presence",
	},
	{
		id: "WEB-004",
		header: "x-content-type-options",
		severity: "medium",
		title: "X-Content-Type-Options Not Set to nosniff",
		description:
			"X-Content-Type-Options header is missing or not set to 'nosniff'. Browsers may MIME-sniff the response and execute content even when it's not the declared type, enabling XSS via uploaded files (OWASP A05:2025).",
		remediation:
			"Add X-Content-Type-Options: nosniff to prevent browsers from MIME-sniffing responses away from the declared Content-Type.",
		cwe: "CWE-693",
		owasp: "A05:2021",
		match: "value-equals",
		allowed: ["nosniff"],
	},
	{
		id: "WEB-005",
		header: "referrer-policy",
		severity: "low",
		title: "Referrer-Policy Header Missing",
		description:
			"Referrer-Policy header is not set. The Referer header may leak sensitive URL information (URL parameters, path fragments) to external sites.",
		remediation:
			"Add Referrer-Policy: strict-origin-when-cross-origin or Referrer-Policy: no-referrer.",
		cwe: "CWE-116",
		owasp: "A05:2021",
		match: "presence",
	},
	{
		id: "WEB-006",
		header: "permissions-policy",
		severity: "low",
		title: "Permissions-Policy Header Missing",
		description:
			"Permissions-Policy (formerly Feature-Policy) header is not set. Unused browser features like camera, microphone, geolocation, or payment handler may be exploitable by attackers.",
		remediation:
			"Add Permissions-Policy header to disable unused features: Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()",
		cwe: "CWE-16",
		owasp: "A05:2021",
		match: "presence",
	},
	{
		id: "WEB-007",
		header: "x-powered-by",
		severity: "low",
		title: "X-Powered-By Header Discloses Technology Stack",
		description:
			"X-Powered-By header reveals the server technology (e.g., Express, PHP, ASP.NET). Attackers use this to target known vulnerabilities for specific frameworks.",
		remediation:
			"Remove the X-Powered-By header or set it to a generic value. In Express: app.disable('x-powered-by'). In IIS: remove the header via web.config.",
		cwe: "CWE-200",
		owasp: "A05:2021",
		match: "value-matches",
		pattern: /\d+(\.\d+)+/,
	},
	{
		id: "WEB-008",
		header: "server",
		severity: "low",
		title: "Server Header Discloses Version Information",
		description:
			"Server header reveals the web server name and version (e.g., Apache/2.4.52, nginx/1.18.0). Attackers use this to identify known vulnerabilities for specific server versions.",
		remediation:
			"Configure your web server to suppress or genericize the Server header. In nginx: server_tokens off; In Apache: ServerTokens Prod.",
		cwe: "CWE-200",
		owasp: "A05:2021",
		match: "value-matches",
		pattern: /\d+(\.\d+)+/,
	},
	{
		id: "WEB-009",
		header: "x-ratelimit-limit",
		severity: "medium",
		title: "Rate Limiting Headers Missing",
		description:
			"No rate limiting headers detected (X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After). Without rate limiting, APIs and login endpoints are vulnerable to brute force attacks.",
		remediation:
			"Implement rate limiting on sensitive endpoints. Return headers like X-RateLimit-Limit: 100, X-RateLimit-Remaining: 95, and Retry-After for 429 responses.",
		cwe: "CWE-307",
		owasp: "A04:2021",
		match: "presence",
	},
	{
		id: "WEB-010",
		header: "cross-origin-opener-policy",
		severity: "medium",
		title: "Cross-Origin-Opener-Policy (COOP) Header Missing",
		description:
			"COOP header is not set. Without COOP, your page can be opened by cross-origin documents in the same browsing context group, enabling Spectre-style speculative execution attacks (OWASP A05:2025).",
		remediation:
			"Add Cross-Origin-Opener-Policy: same-origin to isolate your browsing context from cross-origin documents.",
		cwe: "CWE-1021",
		owasp: "A05:2021",
		match: "presence",
	},
	{
		id: "WEB-011",
		header: "cross-origin-resource-policy",
		severity: "medium",
		title: "Cross-Origin-Resource-Policy (CORP) Header Missing",
		description:
			"CORP header is not set. Without CORP, your resources can be loaded by other origins, enabling clickjacking, timing attacks, and data theft (OWASP A05:2025).",
		remediation:
			"Add Cross-Origin-Resource-Policy: same-origin (or cross-origin if you need to allow embedding).",
		cwe: "CWE-1021",
		owasp: "A05:2021",
		match: "presence",
	},
	{
		id: "WEB-012",
		header: "cross-origin-embedder-policy",
		severity: "low",
		title: "Cross-Origin-Embedder-Policy (COEP) Header Missing",
		description:
			"COEP header is not set. Without COEP, cross-origin resources without explicit permission cannot be embedded, blocking access to features like SharedArrayBuffer, performance.measureMemory, and otp-credentials (OWASP A05:2025).",
		remediation:
			"Add Cross-Origin-Embedder-Policy: require-corp if you need cross-origin isolation for features like SharedArrayBuffer.",
		cwe: "CWE-1021",
		owasp: "A05:2021",
		match: "presence",
	},
	{
		id: "WEB-013",
		header: "x-xss-protection",
		severity: "low",
		title: "X-XSS-Protection Header Missing or Misconfigured",
		description:
			"X-XSS-Protection header is either missing or set to a value (0, 1) that does not provide meaningful protection. Modern browsers ignore this header in favor of CSP.",
		remediation:
			"Set X-XSS-Protection: 0 to explicitly disable the legacy filter, and rely on a strict Content-Security-Policy instead.",
		cwe: "CWE-692",
		owasp: "A05:2021",
		match: "value-equals",
		allowed: ["1; mode=block"],
	},
	{
		id: "WEB-014",
		header: "access-control-allow-origin",
		severity: "high",
		title: "CORS Misconfiguration Detected",
		description:
			"Access-Control-Allow-Origin is set to a wildcard (*) or to 'null', which combined with credentials permits any origin to read responses. This is a common CORS misconfiguration that enables cross-origin data theft (OWASP A05:2025).",
		remediation:
			"Set Access-Control-Allow-Origin to a specific trusted origin. Never combine '*' with Access-Control-Allow-Credentials: true.",
		cwe: "CWE-942",
		owasp: "A05:2021",
		match: "value-matches",
		pattern: /^\s*(\*|null)\s*$/i,
	},
	{
		id: "WEB-015",
		header: "allow",
		severity: "medium",
		title: "HTTP TRACE Method Enabled",
		description:
			"Allow header advertises the TRACE method. TRACE echoes back request headers and can be abused for Cross-Site Tracing (XST) attacks.",
		remediation:
			"Disable TRACE method at the web server level. In Apache: TraceEnable off. In nginx: limit_except GET POST { deny all; }.",
		cwe: "CWE-74",
		owasp: "A05:2021",
		match: "value-matches",
		pattern: /\btrace\b/i,
	},
	{
		id: "WEB-016",
		header: "x-aspnet-version",
		severity: "low",
		title: "ASP.NET Version Disclosure",
		description:
			"X-AspNet-Version header reveals the ASP.NET runtime version, which attackers can use to target known CVEs.",
		remediation:
			"Disable the header in web.config: <httpRuntime enableVersionHeader=\"false\" />.",
		cwe: "CWE-200",
		owasp: "A05:2021",
		match: "value-matches",
		pattern: /\d+(\.\d+)+/,
	},
];

const PERMISSIONS_POLICY_RISKY = [
	"camera=(",
	"microphone=(",
	"geolocation=(",
	"gyroscope=(",
	"magnetometer=(",
	"payment=(",
	"usb=(",
];

function safe<T>(fn: () => T): T | undefined {
	try {
		return fn();
	} catch {
		return undefined;
	}
}

function buildHeaderFinding(rule: HeaderRule): Finding {
	return {
		id: crypto.randomUUID(),
		ruleId: rule.id,
		severity: rule.severity,
		title: rule.title,
		description: rule.description,
		remediation: rule.remediation,
	};
}

function checkRule(rule: HeaderRule, headers: Record<string, string>): boolean {
	const raw = headers[rule.header];
	const value = raw?.trim().toLowerCase() ?? "";

	switch (rule.match) {
		case "presence":
			return !raw;

		case "value-equals": {
			if (!raw) return true;
			const allowed = rule.allowed ?? [];
			if (allowed.length === 0) return false;
			return !allowed.some((a) => a.toLowerCase() === value);
		}

		case "value-matches": {
			if (!raw || !rule.pattern) return false;
			return rule.pattern.test(value);
		}
	}
}

function checkPermissionsPolicyWeak(headers: Record<string, string>): boolean {
	const pp = headers["permissions-policy"] ?? headers["feature-policy"];
	if (!pp) return false;
	const normalized = pp.toLowerCase();
	if (normalized.includes("*")) return true;
	return PERMISSIONS_POLICY_RISKY.some((perm) => {
		const lower = perm.toLowerCase();
		return normalized.includes(lower + '"') || normalized.includes(lower + "'");
	});
}

/**
 * Inspect HTTP response headers and emit one Finding per detected misconfiguration.
 *
 * `headers` MUST already be normalized to lowercase keys (see normalizeHeaders).
 * If credentialsAllow is omitted, it is derived from the
 * Access-Control-Allow-Credentials header.
 */
export function analyzeHeaders(
	headers: Record<string, string>,
	options: { credentialsAllow?: boolean } = {},
): Finding[] {
	const credentialsHeader = (
		headers["access-control-allow-credentials"] ?? ""
	).trim();
	const credentialsAllow =
		options.credentialsAllow ?? credentialsHeader.toLowerCase() === "true";

	const findings: Finding[] = [];

	for (const rule of HEADER_RULES) {
		if (safe(() => checkRule(rule, headers))) {
			findings.push(buildHeaderFinding(rule));
		}
	}

	if (safe(() => checkPermissionsPolicyWeak(headers))) {
		findings.push({
			id: crypto.randomUUID(),
			ruleId: "WEB-017",
			severity: "low",
			title: "Weak Permissions-Policy Header (OWASP A05:2025)",
			description:
				"Permissions-Policy allows risky browser features (camera, microphone, geolocation, etc.) or uses a wildcard. Unused features should be disabled.",
			remediation:
				"Set Permissions-Policy to disable unused browser features: Permissions-Policy: camera=(), microphone=(), geolocation=(), gyroscope=(), magnetometer=(), payment=(), usb=()",
		});
	}

	if (
		credentialsAllow &&
		safe(() => /^[\s*,]+$|^null$/i.test(headers["access-control-allow-origin"] ?? ""))
	) {
		findings.push({
			id: crypto.randomUUID(),
			ruleId: "WEB-018",
			severity: "critical",
			title: "CORS Wildcard Combined With Credentials",
			description:
				"Access-Control-Allow-Origin is '*' or 'null' while Access-Control-Allow-Credentials is 'true'. Browsers will reject this combination, but misconfigured APIs sometimes drop the credentials check, exposing user data cross-origin.",
			remediation:
				"Either remove Access-Control-Allow-Credentials: true, or set Access-Control-Allow-Origin to a specific trusted origin (no wildcard).",
		});
	}

	return findings;
}