import { describe, expect, it } from "vitest";
import { buildFindingRows } from "../src/lib/db/persistence";
import type { Finding } from "../src/lib/types";

function baseFinding(overrides: Partial<Finding> = {}): Finding {
	return {
		id: "test-1",
		ruleId: "TEST-001",
		severity: "high",
		title: "Test",
		description: "desc",
		remediation: "fix",
		...overrides,
	};
}

describe("buildFindingRows", () => {
	it("includes score and risk_factors from each finding", () => {
		const findings = [
			baseFinding({
				ruleId: "A01-IDOR",
				filePath: "src/app/api/login/route.ts",
				lineNumber: 42,
				score: 95,
				riskFactors: ["Auth route", "PII"],
			}),
		];
		const rows = buildFindingRows("scan-1", findings);
		expect(rows).toHaveLength(1);
		expect(rows[0]).toMatchObject({
			scan_id: "scan-1",
			rule_id: "A01-IDOR",
			score: 95,
			risk_factors: ["Auth route", "PII"],
		});
	});

	it("stores null score and risk_factors when finding has none", () => {
		const findings = [baseFinding({ ruleId: "R1" })];
		const rows = buildFindingRows("scan-1", findings);
		expect(rows[0]).toMatchObject({
			score: null,
			risk_factors: null,
		});
	});

	it("dedupes by (rule_id, file_path, line_number)", () => {
		const findings = [
			baseFinding({ ruleId: "R1", filePath: "a.ts", lineNumber: 1 }),
			baseFinding({ ruleId: "R1", filePath: "a.ts", lineNumber: 1 }),
			baseFinding({ ruleId: "R1", filePath: "a.ts", lineNumber: 2 }),
		];
		const rows = buildFindingRows("scan-1", findings);
		expect(rows).toHaveLength(2);
	});

	it("two scans of the same finding with different scores produce different rows", () => {
		// First scan: score 70
		const rows1 = buildFindingRows("scan-1", [
			baseFinding({ ruleId: "R1", filePath: "a.ts", lineNumber: 1, score: 70 }),
		]);
		expect(rows1[0].score).toBe(70);

		// Re-scan: same rule+path+line, but score changed to 90
		const rows2 = buildFindingRows("scan-2", [
			baseFinding({ ruleId: "R1", filePath: "a.ts", lineNumber: 1, score: 90 }),
		]);
		expect(rows2[0].score).toBe(90);

		// Different scan_id, so both rows exist historically
		expect(rows1[0].scan_id).toBe("scan-1");
		expect(rows2[0].scan_id).toBe("scan-2");
	});

	it("preserves risk_factors ordering", () => {
		const findings = [
			baseFinding({
				score: 80,
				riskFactors: ["Auth route", "PII", "No ownership filter"],
			}),
		];
		const rows = buildFindingRows("scan-1", findings);
		expect(rows[0].risk_factors).toEqual([
			"Auth route",
			"PII",
			"No ownership filter",
		]);
	});

	it("handles findings without file_path or line_number (website findings)", () => {
		const findings = [
			baseFinding({
				ruleId: "WEB-014",
				severity: "high",
				score: 85,
				riskFactors: ["CORS misconfiguration"],
				// no filePath, no lineNumber
			}),
		];
		const rows = buildFindingRows("scan-1", findings);
		expect(rows[0]).toMatchObject({
			file_path: null,
			line_number: null,
			score: 85,
			risk_factors: ["CORS misconfiguration"],
		});
	});
});