import { describe, expect, it } from "vitest";
import { analyzeHeaders } from "../src/lib/scanners/headers";
import { scanContent } from "../src/lib/scanners/rules";
import { analyzePassiveResponseExposure } from "../src/lib/scanners/website";

function ruleIds(content: string, filePath = "src/app/api/users/route.ts"): string[] {
	return scanContent(content, filePath).map((finding) => finding.ruleId);
}

describe("Prisma raw SQL detection", () => {
	it("does not flag Prisma tagged templates, which parameterize interpolated values", () => {
		const findings = ruleIds(
			"const rows = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;",
		);

		expect(findings).not.toContain("VIBECODE-AI-INPUT-001");
		expect(findings).not.toContain("SQLI-PRISMA-RAW");
	});

	it("flags unsafe raw APIs, SQL string building, and untrusted Prisma.raw values", () => {
		const unsafeApi = ruleIds(
			"const rows = await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE id = ${userId}`);",
		);
		const stringBuilding = ruleIds(
			"const userQuery = 'SELECT * FROM users WHERE id = ' + userId; await prisma.$queryRawUnsafe(userQuery);",
		);
		const prismaRaw = ruleIds(
			"const clause = Prisma.raw(`ORDER BY ${request.nextUrl.searchParams.get('sort')}`);",
		);

		expect(unsafeApi).toContain("VIBECODE-AI-INPUT-001");
		expect(stringBuilding).toContain("VIBECODE-AI-INPUT-001");
		expect(prismaRaw).toContain("VIBECODE-AI-INPUT-001");
	});
});

describe("GitHub Actions workflow analysis", () => {
	for (const [form, trigger] of [
		["scalar", "on: pull_request_target"],
		["inline list", "on: [push, pull_request_target]"],
		["multiline", "on:\n  pull_request_target:"],
	]) {
		it(`flags ${form} pull_request_target workflows that check out an untrusted ref and request write permissions`, () => {
		const findings = ruleIds(
			`name: CI
${trigger}
permissions: write-all
jobs:
  test:
    steps:
      - uses: actions/checkout@v4
        with:
          ref: \${{ github.event.pull_request.head.sha }}
      - run: echo \${{ github.event.pull_request.title }}
`,
			".github/workflows/pr.yml",
		);

		expect(findings).toEqual(
			expect.arrayContaining([
				"GHA-PR-TARGET-001",
				"GHA-RUN-EXPR-001",
				"GHA-PERMISSIONS-001",
				"GHA-ACTION-PIN-001",
			]),
		);
		});
	}

	it("does not flag a pinned workflow using a trusted checkout ref and no untrusted run expression", () => {
		const findings = ruleIds(
			`name: CI
on: pull_request
permissions:
  contents: read
jobs:
  test:
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
        with:
          ref: \${{ github.sha }}
      - run: npm test
`,
			".github/workflows/pr.yml",
		);

		for (const ruleId of [
			"GHA-PR-TARGET-001",
			"GHA-RUN-EXPR-001",
			"GHA-PERMISSIONS-001",
			"GHA-ACTION-PIN-001",
		]) {
			expect(findings).not.toContain(ruleId);
		}
	});
});

describe("Supabase credential classification", () => {
	it("does not treat the publishable anon key as a secret finding", () => {
		const findings = ruleIds(
			'NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.signature"',
			".env.production",
		);

		expect(findings).not.toContain("SUPABASE001");
		expect(findings).not.toContain("VIBECODE-AI-SECRET-CLIENT-001");
	});

	it("flags a service role key in a staging env file without flagging publishable keys", () => {
		const serviceRole = ruleIds(
			'SUPABASE_SERVICE_ROLE_KEY="sb_service_role_1234567890abcdef"',
			".env.staging",
		);
		const publishable = ruleIds(
			'NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiJ9.signature"',
			".env.staging",
		);

		expect(serviceRole).toContain("SUPABASE001");
		expect(publishable).not.toContain("SUPABASE001");
	});

	it("flags a service role key exposed in browser code", () => {
		const findings = ruleIds(
			'const supabase = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY);',
			"src/app/page.tsx",
		);

		expect(findings).toContain("SUPABASE-RLS003");
	});
});

describe("passive response header analysis", () => {
	it("finds weak CSP, insecure session cookies, and CORS reflection with request Origin evidence", () => {
		const findings = analyzeHeaders(
			{
				"content-security-policy": "default-src *; script-src 'unsafe-inline' 'unsafe-eval' https:",
				"set-cookie": "session=abc; Path=/",
				"access-control-allow-origin": "https://attacker.example",
				"access-control-allow-credentials": "true",
			},
			{ requestOriginEvidence: "https://attacker.example" },
		).map((finding) => finding.ruleId);

		expect(findings).toEqual(
			expect.arrayContaining(["WEB-019", "WEB-020", "WEB-021"]),
		);
	});

	it("detects a script-src wildcard without flagging specific script sources", () => {
		const wildcard = analyzeHeaders({
			"content-security-policy": "default-src 'self'; script-src *",
		}).map((finding) => finding.ruleId);
		const specific = analyzeHeaders({
			"content-security-policy": "default-src 'self'; script-src https://cdn.example.com",
		}).map((finding) => finding.ruleId);

		expect(wildcard).toContain("WEB-019");
		expect(specific).not.toContain("WEB-019");
	});

	it("finds a credentialed wildcard CORS response without treating it as exploitation proof", () => {
		const findings = analyzeHeaders({
			"access-control-allow-origin": "*",
			"access-control-allow-credentials": "true",
		}).map((finding) => finding);

		expect(findings).toContainEqual(
			expect.objectContaining({ ruleId: "WEB-018", severity: "high" }),
		);
	});

	it("does not flag strong CSP, hardened session cookies, or a fixed trusted CORS origin", () => {
		const findings = analyzeHeaders(
			{
				"content-security-policy": "default-src 'self'; script-src 'self' 'nonce-abc'; object-src 'none'",
				"set-cookie": "session=abc; Path=/; Secure; HttpOnly; SameSite=Lax",
				"access-control-allow-origin": "https://app.example.com",
				"access-control-allow-credentials": "true",
			},
			{ requestOriginEvidence: "https://attacker.example" },
		).map((finding) => finding.ruleId);

		for (const ruleId of ["WEB-019", "WEB-020", "WEB-021"]) {
			expect(findings).not.toContain(ruleId);
		}
	});
});

describe("passive response exposure analysis", () => {
	it("reports documentation, source maps, and debug headers only from the received response", () => {
		const findings = analyzePassiveResponseExposure(
			"https://example.com/api-docs",
			"//# sourceMappingURL=app.js.map",
			{ "x-debug-id": "trace-123" },
		).map((finding) => finding.ruleId);

		expect(findings).toEqual(
			expect.arrayContaining([
				"WEB-API-DOCS-INFO",
				"WEB-SOURCEMAP-INFO",
				"WEB-DEBUG-INFO",
			]),
		);
	});
});
