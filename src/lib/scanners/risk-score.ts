import type { Finding, Severity } from "../types";

export interface ScoreOptions {
	/** Full file content when available (better inference accuracy). */
	content?: string;
	/** Override the code snippet used for keyword detection. */
	snippet?: string;
	/** Override the path used for routing signals. */
	filePath?: string;
}

export interface ScoredFinding {
	score: number;
	riskFactors: string[];
}

interface FactorHit {
	label: string;
	weight: number;
}

const SEVERITY_BASE: Record<Severity, number> = {
	critical: 10,
	high: 7,
	medium: 4,
	low: 2,
	info: 1,
};

const AUTH_ROUTE_RE =
	/\/(?:api\/)?(?:auth|login|signup|signin|sign-up|sign-in|register|forgot[-_]?password|reset[-_]?password|verify[-_]?(?:email|otp|2fa|mfa)|change[-_]?password|two[-_]?factor|otp|session|token|refresh)/i;
const ADMIN_ROUTE_RE =
	/\/(?:api\/)?(?:admin|internal|backoffice|manage|management|console|owner|root|staff|moderation)/i;
const USER_DATA_ROUTE_RE =
	/\/(?:api\/)?(?:users?|accounts?|profile|me|settings|preferences|billing|subscription|invoices?|orders?|payments?|wallet|cart|checkout)/i;

const MUTATION_METHOD_RE =
	/\b(?:export\s+(?:async\s+)?function\s+(?:POST|PUT|DELETE|PATCH)|app\.(?:post|put|delete|patch)|router\.(?:post|put|delete|patch)|fetch\([^)]*,\s*\{\s*method:\s*['"](?:POST|PUT|DELETE|PATCH))/i;

const PII_KEYWORDS = [
	"password",
	"passwd",
	"secret",
	"token",
	"ssn",
	"credit_card",
	"credit-card",
	"creditcard",
	"card_number",
	"cvv",
	"cvc",
	"phone",
	"address",
	"email",
	"dob",
	"birthday",
	"tax_id",
	"passport",
	"driver_license",
	"bank_account",
	"iban",
];

const OWNERSHIP_KEYWORDS = [
	"user_id",
	"userId",
	"ownerId",
	"owner_id",
	"created_by",
	"createdBy",
	"auth.uid",
	"session.user.id",
];

const AUTH_PROOF_KEYWORDS = [
	"auth.getUser",
	"auth.getSession",
	"getServerSession",
	"verifyToken",
	"verifyJwt",
	"jwt.verify",
	"requireAuth",
	"requireUser",
	"clerkClient",
	"locals.user",
	"event.locals.user",
];

const AI_GENERATED_PREFIX_RE = /^(VIBECODE|LOVABLE|BOLT|CURSOR|V\d{4}|REPLIT\d{3})/;

function normalizeInputs(finding: Finding, options: ScoreOptions) {
	const filePath = options.filePath ?? finding.filePath ?? "";
	const snippet = options.snippet ?? finding.snippet ?? "";
	const content = options.content ?? "";
	return { filePath, snippet, content };
}

function pathHitsAny(re: RegExp, filePath: string): boolean {
	return re.test(filePath);
}

function hasAnyKeyword(haystack: string, keywords: string[]): boolean {
	if (!haystack) return false;
	const lower = haystack.toLowerCase();
	return keywords.some((k) => lower.includes(k.toLowerCase()));
}

function detectFactors(
	finding: Finding,
	inputs: { filePath: string; snippet: string; content: string },
): FactorHit[] {
	const factors: FactorHit[] = [];
	const combined = `${inputs.snippet}\n${inputs.content}`;

	if (pathHitsAny(AUTH_ROUTE_RE, inputs.filePath)) {
		factors.push({ label: "Auth route (login/signup/password/2FA)", weight: 0.5 });
	}
	if (pathHitsAny(ADMIN_ROUTE_RE, inputs.filePath)) {
		factors.push({ label: "Admin/internal route", weight: 0.4 });
	}
	if (pathHitsAny(USER_DATA_ROUTE_RE, inputs.filePath)) {
		factors.push({ label: "User-data route (profile/orders/billing)", weight: 0.3 });
	}

	if (MUTATION_METHOD_RE.test(combined)) {
		factors.push({ label: "Mutating HTTP method (POST/PUT/DELETE/PATCH)", weight: 0.3 });
	}

	if (hasAnyKeyword(combined, PII_KEYWORDS)) {
		factors.push({ label: "Handles PII (email/password/token/SSN/card/phone)", weight: 0.4 });
	}

	const hasAuth = hasAnyKeyword(combined, AUTH_PROOF_KEYWORDS);
	const hasOwnership = hasAnyKeyword(combined, OWNERSHIP_KEYWORDS);
	if (hasAuth && !hasOwnership) {
		factors.push({
			label: "Auth check present but no ownership/row-level filter",
			weight: 0.5,
		});
	}

	if (!hasAuth) {
		const usesAuthData =
			AUTH_ROUTE_RE.test(inputs.filePath) ||
			ADMIN_ROUTE_RE.test(inputs.filePath) ||
			hasAnyKeyword(combined, ["session", "auth", "login", "user"]);
		if (usesAuthData) {
			factors.push({ label: "Touches auth/session context without auth check", weight: 0.4 });
		}
	}

	if (AI_GENERATED_PREFIX_RE.test(finding.ruleId)) {
		factors.push({ label: "AI-vibe-coded pattern (Lovable/Cursor/Bolt/v0/Replit)", weight: 0.2 });
	}

	return factors;
}

/**
 * Compute a contextual risk score (0-100) for a finding.
 *
 * The score combines the rule's static severity with contextual signals from
 * the file path, surrounding code, and the rule family. Each signal adds a
 * weight to the multiplier. The original `severity` field is never modified —
 * `score` is an orthogonal, explainable risk signal.
 */
export function scoreFinding(
	finding: Finding,
	options: ScoreOptions = {},
): ScoredFinding {
	const inputs = normalizeInputs(finding, options);
	const base = SEVERITY_BASE[finding.severity] ?? 1;
	const factors = detectFactors(finding, inputs);
	const multiplier = factors.reduce((acc, f) => acc + f.weight, 1);
	const raw = base * 10 * multiplier;
	const score = Math.min(100, Math.max(0, Math.round(raw)));

	return {
		score,
		riskFactors: factors.map((f) => f.label),
	};
}

/**
 * Apply scoring to a finding in-place (mutates `finding.score` and `finding.riskFactors`).
 */
export function applyScore(
	finding: Finding,
	options: ScoreOptions = {},
): Finding {
	const { score, riskFactors } = scoreFinding(finding, options);
	finding.score = score;
	finding.riskFactors = riskFactors;
	return finding;
}