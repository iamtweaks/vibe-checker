import type { Finding } from "./types";

const REDACTED_SECRET = "[REDACTED_SECRET]";
const REDACTED_PRIVATE_KEY = "[REDACTED_PRIVATE_KEY]";
const REDACTED_URL_PARAMETER = "REDACTED";
const SENSITIVE_URL_PARAMETERS = new Set([
	"access_token",
	"access-token",
	"token",
	"api_key",
	"api-key",
	"key",
	"secret",
	"password",
	"code",
]);

/** Preserve a target's origin and path while removing sensitive query values. */
export function redactTargetUrl(value: string): string {
	try {
		const url = new URL(value);
		let redacted = false;
		for (const [name] of url.searchParams) {
			if (SENSITIVE_URL_PARAMETERS.has(name.toLowerCase())) {
				url.searchParams.set(name, REDACTED_URL_PARAMETER);
				redacted = true;
			}
		}
		return redacted ? url.toString() : value;
	} catch {
		return value.replace(
			/([?&](?:access[_-]?token|token|api[_-]?key|key|secret|password|code)=)[^&#]*/gi,
			`$1${REDACTED_URL_PARAMETER}`,
		);
	}
}

/**
 * Remove credential material from evidence before it reaches an API response,
 * report, or persistence layer. Rule names and surrounding code stay visible.
 */
export function redactSecrets(value: string | undefined): string | undefined {
	if (!value) return value;

	return value
		.replace(
			/(-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)[\s\S]*?(-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)/g,
			`$1${REDACTED_PRIVATE_KEY}$2`,
		)
		.replace(
			/((?:api[_-]?key|api[_-]?secret|auth[_-]?token|access[_-]?token|password|passwd|pwd|secret|service[_-]?role(?:[_-]?key)?)\s*[:=]\s*["'])[^"'\r\n]+(["'])/gi,
			`$1${REDACTED_SECRET}$2`,
		)
		.replace(
			/\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9_-]{12,}\b|\b(?:gh[pousr]_|github_pat_)[A-Za-z0-9_]{16,}\b|\bAIza[A-Za-z0-9_-]{20,}\b|\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b|\bsb_(?:secret|service_role)_[A-Za-z0-9_-]{12,}\b/g,
			REDACTED_SECRET,
		);
}

export function redactFinding(finding: Finding): Finding {
	return {
		...finding,
		snippet: redactSecrets(finding.snippet),
	};
}

export function redactFindings(findings: Finding[]): Finding[] {
	return findings.map(redactFinding);
}
