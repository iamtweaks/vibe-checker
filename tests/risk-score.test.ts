import { describe, expect, it } from "vitest";
import { scoreFinding, applyScore } from "../src/lib/scanners/risk-score";
import type { Finding } from "../src/lib/types";

function baseFinding(overrides: Partial<Finding> = {}): Finding {
	return {
		id: "test-1",
		ruleId: "TEST-001",
		severity: "medium",
		title: "Test finding",
		description: "desc",
		remediation: "fix",
		...overrides,
	};
}

describe("scoreFinding — base severity scaling", () => {
	it("score is bounded 0-100", () => {
		const f = baseFinding({ severity: "critical" });
		const { score } = scoreFinding(f, {});
		expect(score).toBeGreaterThanOrEqual(0);
		expect(score).toBeLessThanOrEqual(100);
	});

	it("critical severity scores higher than info with no factors", () => {
		const critical = scoreFinding(baseFinding({ severity: "critical" }), {});
		const info = scoreFinding(baseFinding({ severity: "info" }), {});
		expect(critical.score).toBeGreaterThan(info.score);
	});

	it("score ordering: critical > high > medium > low > info", () => {
		const sev = (s: Finding["severity"]) =>
			scoreFinding(baseFinding({ severity: s }), {}).score;
		expect(sev("critical")).toBeGreaterThan(sev("high"));
		expect(sev("high")).toBeGreaterThan(sev("medium"));
		expect(sev("medium")).toBeGreaterThan(sev("low"));
		expect(sev("low")).toBeGreaterThan(sev("info"));
	});
});

describe("scoreFinding — auth route factor", () => {
	it("boosts score for /api/login paths", () => {
		const login = scoreFinding(
			baseFinding({ severity: "high", ruleId: "TEST" }),
			{ filePath: "app/api/login/route.ts" },
		);
		const other = scoreFinding(
			baseFinding({ severity: "high", ruleId: "TEST" }),
			{ filePath: "app/api/posts/route.ts" },
		);
		expect(login.score).toBeGreaterThan(other.score);
		expect(login.riskFactors.some((r) => /auth/i.test(r))).toBe(true);
	});

	it("matches /forgot-password paths", () => {
		const r = scoreFinding(
			baseFinding({ severity: "high" }),
			{ filePath: "app/api/forgot-password/route.ts" },
		);
		expect(r.riskFactors.some((f) => /auth/i.test(f))).toBe(true);
	});
});

describe("scoreFinding — admin route factor", () => {
	it("boosts score for /admin paths", () => {
		const admin = scoreFinding(
			baseFinding({ severity: "medium" }),
			{ filePath: "src/app/api/admin/users/route.ts" },
		);
		const other = scoreFinding(
			baseFinding({ severity: "medium" }),
			{ filePath: "src/app/api/posts/route.ts" },
		);
		expect(admin.score).toBeGreaterThan(other.score);
		expect(admin.riskFactors.some((r) => /admin/i.test(r))).toBe(true);
	});
});

describe("scoreFinding — user-data route factor", () => {
	it("boosts score for /profile paths", () => {
		const r = scoreFinding(
			baseFinding({ severity: "medium" }),
			{ filePath: "src/app/api/profile/route.ts" },
		);
		expect(r.riskFactors.some((f) => /user-data/i.test(f))).toBe(true);
	});

	it("matches /billing paths", () => {
		const r = scoreFinding(
			baseFinding({ severity: "medium" }),
			{ filePath: "src/app/api/billing/route.ts" },
		);
		expect(r.riskFactors.some((f) => /user-data/i.test(f))).toBe(true);
	});
});

describe("scoreFinding — mutation method factor", () => {
	it("boosts when snippet contains POST handler", () => {
		const r = scoreFinding(baseFinding({ severity: "medium" }), {
			content: "export async function POST(req: Request) {}",
		});
		expect(r.riskFactors.some((f) => /mutating/i.test(f))).toBe(true);
	});

	it("does not boost for GET handlers", () => {
		const r = scoreFinding(baseFinding({ severity: "medium" }), {
			content: "export async function GET(req: Request) {}",
		});
		expect(r.riskFactors.some((f) => /mutating/i.test(f))).toBe(false);
	});

	it("detects app.post()", () => {
		const r = scoreFinding(baseFinding({ severity: "medium" }), {
			content: "app.post('/api/foo', handler)",
		});
		expect(r.riskFactors.some((f) => /mutating/i.test(f))).toBe(true);
	});
});

describe("scoreFinding — PII factor", () => {
	it("boosts when content mentions password", () => {
		const r = scoreFinding(baseFinding({ severity: "medium" }), {
			content: "const { password } = req.body",
		});
		expect(r.riskFactors.some((f) => /pii/i.test(f))).toBe(true);
	});

	it("boosts when content mentions credit_card", () => {
		const r = scoreFinding(baseFinding({ severity: "medium" }), {
			content: "const card = form.credit_card",
		});
		expect(r.riskFactors.some((f) => /pii/i.test(f))).toBe(true);
	});

	it("does not boost for unrelated content", () => {
		const r = scoreFinding(baseFinding({ severity: "medium" }), {
			content: "const result = await db.findMany()",
		});
		expect(r.riskFactors.some((f) => /pii/i.test(f))).toBe(false);
	});
});

describe("scoreFinding — ownership check factor", () => {
	it("boosts when auth is checked but ownership is missing", () => {
		const content = `
const { data: { user } } = await supabase.auth.getUser()
const item = await supabase.from('orders').select('*').eq('id', id).single()
`;
		const r = scoreFinding(baseFinding({ severity: "high" }), {
			filePath: "src/app/api/orders/[id]/route.ts",
			content,
		});
		expect(r.riskFactors.some((f) => /ownership|row-level/i.test(f))).toBe(true);
	});

	it("does not boost when ownership filter is present", () => {
		const content = `
const { data: { user } } = await supabase.auth.getUser()
const item = await supabase.from('orders').select('*').eq('id', id).eq('user_id', user.id).single()
`;
		const r = scoreFinding(baseFinding({ severity: "high" }), {
			filePath: "src/app/api/orders/[id]/route.ts",
			content,
		});
		expect(r.riskFactors.some((f) => /ownership|row-level/i.test(f))).toBe(false);
	});
});

describe("scoreFinding — AI-vibe-coded signature factor", () => {
	it("boosts for VIBECODE-* ruleIds", () => {
		const r = scoreFinding(baseFinding({ ruleId: "VIBECODE-AI-DEBUG-001" }), {});
		expect(r.riskFactors.some((f) => /vibe-coded/i.test(f))).toBe(true);
	});

	it("boosts for LOVABLE rules", () => {
		const r = scoreFinding(baseFinding({ ruleId: "LOVABLE002" }), {});
		expect(r.riskFactors.some((f) => /vibe-coded/i.test(f))).toBe(true);
	});

	it("does not boost for generic rules", () => {
		const r = scoreFinding(baseFinding({ ruleId: "SEC-001" }), {});
		expect(r.riskFactors.some((f) => /vibe-coded/i.test(f))).toBe(false);
	});
});

describe("scoreFinding — combined factors", () => {
	it("IDOR in auth route with PII scores highest", () => {
		const finding = baseFinding({ severity: "high", ruleId: "A01-IDOR" });
		const content = `
const { data: { user } } = await supabase.auth.getUser()
const result = await db.user.findUnique({ where: { email } })
return result
`;
		const r = scoreFinding(finding, {
			filePath: "src/app/api/login/profile/route.ts",
			content,
		});

		expect(r.score).toBeGreaterThanOrEqual(70);
		expect(r.riskFactors.length).toBeGreaterThanOrEqual(2);
	});

	it("generic info finding in util file stays low", () => {
		const r = scoreFinding(
			baseFinding({ severity: "info", ruleId: "INFO-001" }),
			{ filePath: "src/utils/format.ts" },
		);
		expect(r.score).toBeLessThan(30);
	});
});

describe("applyScore — mutates finding", () => {
	it("mutates the finding in place with score + riskFactors", () => {
		const f = baseFinding({ severity: "high" });
		const result = applyScore(f, { filePath: "src/app/api/login/route.ts" });
		expect(result).toBe(f);
		expect(f.score).toBeDefined();
		expect(f.riskFactors).toBeDefined();
		expect(f.riskFactors!.length).toBeGreaterThan(0);
	});
});