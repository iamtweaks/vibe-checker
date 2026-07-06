import type { Finding, Severity } from "../types";
import { isBlockedAddress } from "../network-security";

interface PathCheck {
	path: string;
	severity: Severity;
	title: string;
	description: string;
	remediation: string;
	cwe?: string;
	owasp?: string;
	/** Body content-types that count as "real exposure" (matches the file, not a SPA fallback). */
	evidenceContentTypes?: string[];
	/** If true, treat any 200 OK with non-empty body as exposure (used for txt/env files). */
	matchAnyBody?: boolean;
	/** If true, treat 401/403 with body as exposure (auth wall still leaks existence). */
	matchAuthWall?: boolean;
}

const PATH_CHECKS: PathCheck[] = [
	{
		path: "/.env",
		severity: "critical",
		title: ".env File Accessible",
		description:
			"The .env file is publicly accessible. This file typically contains database credentials, API keys, and other secrets that would compromise the entire application.",
		remediation:
			"Block access to .env files in web server config. Ensure .env is never in the public document root. Rotate any exposed secrets immediately.",
		cwe: "CWE-538",
		owasp: "A05:2021",
		matchAnyBody: true,
	},
	{
		path: "/.env.local",
		severity: "critical",
		title: ".env.local File Accessible",
		description:
			"The .env.local file is publicly accessible. These contain machine-specific overrides and may have more secrets than .env.",
		remediation:
			"Block access to .env.local files. Rotate any exposed secrets immediately.",
		cwe: "CWE-538",
		owasp: "A05:2021",
		matchAnyBody: true,
	},
	{
		path: "/.env.development",
		severity: "high",
		title: ".env.development File Accessible",
		description:
			"The .env.development file is publicly accessible. Development env files may contain debug flags and dev-only credentials.",
		remediation:
			"Block access to .env.development files. Ensure development env files are not deployed to production.",
		cwe: "CWE-538",
		owasp: "A05:2021",
		matchAnyBody: true,
	},
	{
		path: "/.git/config",
		severity: "critical",
		title: ".git/config Accessible (CWE-552)",
		description:
			"The .git/config file is publicly accessible. Attackers can download full source code, including potentially sensitive configuration.",
		remediation:
			"Block access to the entire .git directory. Nginx: location ~ /.git { deny all; } Apache: <Directory ~ \".git\"> Require all denied </Directory>",
		cwe: "CWE-552",
		owasp: "A01:2021",
		matchAnyBody: true,
	},
	{
		path: "/.git/HEAD",
		severity: "critical",
		title: ".git/HEAD Accessible",
		description:
			"The .git/HEAD file is publicly accessible, revealing branch names and commit refs.",
		remediation:
			"Block access to .git/HEAD along with the entire .git directory.",
		cwe: "CWE-552",
		owasp: "A01:2021",
		matchAnyBody: true,
	},
	{
		path: "/.git",
		severity: "critical",
		title: ".git Directory Fully Accessible",
		description:
			"The entire .git directory is publicly accessible, leaking full version control history and source code.",
		remediation:
			"Block the entire .git directory. It contains history, commits, and potentially sensitive configuration.",
		cwe: "CWE-552",
		owasp: "A01:2021",
		matchAnyBody: true,
	},
	{
		path: "/config.yml",
		severity: "high",
		title: "config.yml Exposed",
		description:
			"config.yml is publicly accessible. Configuration files may contain database credentials, API keys, or infrastructure secrets.",
		remediation:
			"Block access to config.yml. Do not serve config files from the public document root.",
		cwe: "CWE-538",
		owasp: "A05:2021",
		matchAnyBody: true,
	},
	{
		path: "/config.yaml",
		severity: "high",
		title: "config.yaml Exposed",
		description: "config.yaml is publicly accessible, potentially leaking credentials or secrets.",
		remediation: "Block access to config.yaml files.",
		cwe: "CWE-538",
		owasp: "A05:2021",
		matchAnyBody: true,
	},
	{
		path: "/config.json",
		severity: "high",
		title: "config.json Exposed",
		description:
			"config.json is publicly accessible. Configuration files may contain database credentials, API keys, or infrastructure secrets.",
		remediation:
			"Block access to config.json. Do not serve config files from the public document root.",
		cwe: "CWE-538",
		owasp: "A05:2021",
		matchAnyBody: true,
	},
	{
		path: "/admin",
		severity: "high",
		title: "Admin Panel Exposed",
		description:
			"An admin panel is reachable at /admin. Such endpoints are prime targets for credential stuffing and brute force attacks.",
		remediation:
			"Protect admin routes with strong authentication, rate limiting, and IP allowlisting. Add to robots.txt to discourage indexing.",
		cwe: "CWE-284",
		owasp: "A01:2021",
		matchAuthWall: true,
	},
	{
		path: "/wp-admin",
		severity: "high",
		title: "WordPress Admin Exposed",
		description:
			"The WordPress admin panel is reachable. Default wp-admin paths are heavily targeted by automated attacks.",
		remediation:
			"Protect WordPress admin with strong authentication, 2FA, and security plugins. Consider hiding wp-admin behind a VPN.",
		cwe: "CWE-284",
		owasp: "A01:2021",
		matchAuthWall: true,
	},
	{
		path: "/debug",
		severity: "critical",
		title: "Debug Endpoints Exposed (OWASP A10:2025)",
		description:
			"Debug endpoints are reachable at /debug. They typically leak stack traces, environment variables, and internal state.",
		remediation:
			"Disable debug mode in production. Remove /debug, /trace, /actuator routes from production deployments.",
		cwe: "CWE-489",
		owasp: "A10:2025",
		matchAuthWall: true,
	},
	{
		path: "/api/debug",
		severity: "critical",
		title: "API Debug Endpoint Exposed (OWASP A10:2025)",
		description:
			"API debug endpoints are reachable. Debug endpoints are a primary target for information disclosure attacks.",
		remediation:
			"Remove all debug API endpoints from production. Audit internal endpoints before deployment.",
		cwe: "CWE-489",
		owasp: "A10:2025",
		matchAuthWall: true,
	},
	{
		path: "/actuator/health",
		severity: "medium",
		title: "Spring Boot Actuator Health Exposed",
		description:
			"Spring Boot actuator /health is publicly accessible. While health itself is often benign, the actuator namespace typically also exposes /env, /heapdump, /loggers, and /trace if not properly restricted.",
		remediation:
			"Restrict /actuator to internal networks only. Disable exposure of /actuator/env, /actuator/heapdump, and /actuator/loggers.",
		cwe: "CWE-200",
		owasp: "A05:2021",
		matchAuthWall: true,
	},
	{
		path: "/actuator",
		severity: "high",
		title: "Spring Boot Actuator Fully Exposed",
		description:
			"Spring Boot actuator base path is publicly accessible, indicating the entire actuator surface may be reachable.",
		remediation:
			"Restrict all actuator endpoints to internal networks. Use Spring Security to require authentication on /actuator/**.",
		cwe: "CWE-200",
		owasp: "A05:2021",
		matchAuthWall: true,
	},
	{
		path: "/trace",
		severity: "high",
		title: "Trace Endpoint Exposed",
		description:
			"A /trace endpoint is reachable, exposing request headers and internal routing information.",
		remediation:
			"Remove trace/debug endpoints. HTTP TRACE method and /trace routes expose request headers and internal routing.",
		cwe: "CWE-200",
		owasp: "A10:2025",
		matchAuthWall: true,
	},
	{
		path: "/.aws/credentials",
		severity: "critical",
		title: "AWS Credentials File Exposed",
		description:
			"AWS credentials file is publicly accessible. This file grants access to AWS resources and must be considered fully compromised.",
		remediation:
			"Never place AWS credentials in web-accessible directories. Rotate exposed credentials immediately. Use IAM roles or AWS Secrets Manager instead.",
		cwe: "CWE-538",
		owasp: "A07:2021",
		matchAnyBody: true,
	},
	{
		path: "/id_rsa",
		severity: "critical",
		title: "SSH Private Key Exposed",
		description:
			"An SSH private key is publicly accessible at /id_rsa. Anyone with this key can authenticate to systems that trust it.",
		remediation:
			"Never place private keys in web directories. Rotate the exposed keypair and remove it from all authorized_keys files.",
		cwe: "CWE-538",
		owasp: "A07:2021",
		matchAnyBody: true,
	},
	{
		path: "/backup",
		severity: "high",
		title: "Backup Directory Exposed",
		description:
			"A /backup directory is publicly accessible. Backups may contain full application state and data, including PII.",
		remediation:
			"Block access to backup directories. Move backups outside the web root or protect them with authentication.",
		cwe: "CWE-538",
		owasp: "A01:2021",
		matchAuthWall: true,
	},
	{
		path: "/.svn",
		severity: "high",
		title: "Subversion (.svn) Directory Exposed",
		description:
			"The .svn directory is publicly accessible, exposing version control history and source code.",
		remediation: "Block access to .svn directories.",
		cwe: "CWE-552",
		owasp: "A01:2021",
		matchAuthWall: true,
	},
	{
		path: "/.hg",
		severity: "high",
		title: "Mercurial (.hg) Directory Exposed",
		description:
			"The .hg directory is publicly accessible, exposing Mercurial version control history.",
		remediation: "Block access to .hg directories.",
		cwe: "CWE-552",
		owasp: "A01:2021",
		matchAuthWall: true,
	},
	{
		path: "/phpinfo.php",
		severity: "high",
		title: "phpinfo() Page Exposed",
		description:
			"A phpinfo() page is publicly accessible, revealing PHP version, loaded extensions, server paths, and environment variables.",
		remediation:
			"Remove phpinfo.php from production. phpinfo() reveals PHP version, extensions, paths, and server configuration useful for exploitation.",
		cwe: "CWE-200",
		owasp: "A05:2021",
		matchAnyBody: true,
	},
	{
		path: "/server-status",
		severity: "medium",
		title: "Apache Server Status Exposed",
		description:
			"Apache mod_status is publicly accessible. Server status pages leak connection details, traffic patterns, and active requests.",
		remediation:
			"Disable Apache mod_status or restrict it to localhost. In Apache: SetHandler server-status; Require local.",
		cwe: "CWE-200",
		owasp: "A05:2021",
		matchAuthWall: true,
	},
	{
		path: "/.well-known/security.txt",
		severity: "info",
		title: "security.txt Found",
		description:
			"security.txt is present and reachable. This file is recommended for responsible disclosure programs.",
		remediation:
			"This is informational. Ensure the security.txt contact information is correct and the file follows RFC 9116.",
		cwe: "CWE-1059",
		owasp: "A09:2021",
		matchAnyBody: true,
	},
];

export interface PathProbeOptions {
	maxConcurrent?: number;
	perPathTimeoutMs?: number;
	maxResponseBytes?: number;
}

interface ProbeResult {
	check: PathCheck;
	triggered: boolean;
	evidence?: string;
	status?: number;
	contentType?: string;
	contentLength?: number;
}

const DEFAULT_MAX_CONCURRENT = 6;
const DEFAULT_PER_PATH_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RESPONSE_BYTES = 256 * 1024;

function normalizeContentType(raw: string | null): string {
	return (raw ?? "").split(";")[0].trim().toLowerCase();
}

function classify(
	check: PathCheck,
	status: number,
	contentType: string,
	bodyBytes: number,
): { triggered: boolean; evidence: string } {
	const isHtml = contentType.includes("text/html");
	const isAuthWall = status === 401 || status === 403;

	if (status >= 200 && status < 300) {
		if (isHtml) {
			return {
				triggered: false,
				evidence: `SPA fallback HTML returned (${status}, ${contentType})`,
			};
		}
		if (bodyBytes === 0) {
			return {
				triggered: false,
				evidence: `Empty response (${status}, ${contentType})`,
			};
		}
		if (check.matchAnyBody) {
			return {
				triggered: true,
				evidence: `HTTP ${status} (${contentType}, ${bodyBytes}B)`,
			};
		}
		return {
			triggered: false,
			evidence: `HTTP ${status} (${contentType}, ${bodyBytes}B) - no match rule`,
		};
	}

	if (isAuthWall && check.matchAuthWall) {
		return {
			triggered: true,
			evidence: `HTTP ${status} - auth wall indicates endpoint exists`,
		};
	}

	return {
		triggered: false,
		evidence: `HTTP ${status} (${contentType}, ${bodyBytes}B)`,
	};
}

async function probe(
	baseUrl: URL,
	check: PathCheck,
	signal: AbortSignal,
	maxResponseBytes: number,
): Promise<ProbeResult> {
	const target = new URL(check.path, baseUrl);

	try {
		const res = await fetch(target, {
			method: "GET",
			redirect: "manual",
			signal,
			headers: {
				"User-Agent": "VibeChecker/1.0 (security-scanner)",
				Accept: "*/*",
			},
		});

		const contentType = normalizeContentType(res.headers.get("content-type"));
		const contentLengthHeader = res.headers.get("content-length");
		let bodyBytes = contentLengthHeader ? Number(contentLengthHeader) || 0 : 0;

		if (bodyBytes === 0 && res.body) {
			const reader = res.body.getReader();
			let received = 0;
			const chunks: Uint8Array[] = [];
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				received += value.byteLength;
				if (received > maxResponseBytes) {
					await reader.cancel().catch(() => {});
					bodyBytes = maxResponseBytes;
					break;
				}
				chunks.push(value);
			}
			if (bodyBytes === 0) bodyBytes = received;
		}

		const classification = classify(check, res.status, contentType, bodyBytes);
		return {
			check,
			status: res.status,
			contentType,
			contentLength: bodyBytes,
			triggered: classification.triggered,
			evidence: classification.evidence,
		};
	} catch (error: any) {
		const isAbort = error?.name === "AbortError";
		return {
			check,
			triggered: false,
			evidence: isAbort ? "timeout" : `error: ${error?.message ?? "unknown"}`,
		};
	}
}

/**
 * Probe a list of well-known sensitive paths against the base URL and emit
 * one Finding per confirmed exposure.
 *
 * Probes run concurrently (capped) and each has its own timeout. Results from
 * individual probes never throw - failures are treated as "not exposed".
 */
export async function runPathProbes(
	baseUrl: URL,
	options: PathProbeOptions = {},
): Promise<Finding[]> {
	const maxConcurrent = options.maxConcurrent ?? DEFAULT_MAX_CONCURRENT;
	const perPathTimeoutMs =
		options.perPathTimeoutMs ?? DEFAULT_PER_PATH_TIMEOUT_MS;
	const maxResponseBytes =
		options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;

	if (!["http:", "https:"].includes(baseUrl.protocol)) {
		return [];
	}

	const hostname = baseUrl.hostname.toLowerCase();
	if (
		hostname === "localhost" ||
		hostname === "127.0.0.1" ||
		hostname === "[::1]" ||
		hostname.endsWith(".localhost")
	) {
		return [];
	}

	if (isBlockedAddress(hostname)) {
		return [];
	}

	const findings: Finding[] = [];
	const queue = PATH_CHECKS.slice();
	const workers: Promise<void>[] = [];

	async function worker(controller: AbortController): Promise<void> {
		while (queue.length > 0) {
			const next = queue.shift();
			if (!next) return;
			const result = await probe(baseUrl, next, controller.signal, maxResponseBytes);
			if (!result.triggered) continue;

			const evidenceSuffix = result.evidence ? ` [${result.evidence}]` : "";
			findings.push({
				id: crypto.randomUUID(),
				ruleId: `WEB-PATH-${next.path.replace(/[^a-z0-9]+/gi, "-").toUpperCase()}`,
				severity: next.severity,
				title: next.title,
				description: `${next.description}${evidenceSuffix}`,
				remediation: next.remediation,
			});
		}
	}

	const controller = new AbortController();
	const timeoutHandle = setTimeout(() => controller.abort(), perPathTimeoutMs * PATH_CHECKS.length);

	for (let i = 0; i < Math.min(maxConcurrent, PATH_CHECKS.length); i++) {
		workers.push(worker(controller));
	}
	await Promise.all(workers);
	clearTimeout(timeoutHandle);

	return findings;
}