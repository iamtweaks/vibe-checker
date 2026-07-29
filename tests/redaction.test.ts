import { describe, expect, it } from "vitest";
import { buildFindingRows } from "../src/lib/db/persistence";
import { redactFinding, redactTargetUrl } from "../src/lib/redaction";
import { scanContent } from "../src/lib/scanners/rules";
import type { Finding } from "../src/lib/types";

const secret = "sk_live_4eC39HqLyjWDarjtT1zdp7dc";

function finding(snippet: string): Finding {
	return {
		id: "secret-1",
		ruleId: "SEC-001",
		severity: "critical",
		title: "API Key Detected",
		description: "A key was found.",
		snippet,
		remediation: "Remove it.",
	};
}

describe("finding redaction", () => {
	it("redacts sensitive target query values without changing the origin or path", () => {
		const redacted = redactTargetUrl(
			"https://example.com/account?access_token=abc&key=xyz&page=2",
		);

		expect(redacted).toBe(
			"https://example.com/account?access_token=REDACTED&key=REDACTED&page=2",
		);
	});

	it("redacts every supported sensitive query parameter while preserving safe values", () => {
		const redacted = redactTargetUrl(
			"https://example.com/callback?access_token=a&token=b&api_key=c&key=d&secret=e&password=f&code=g&state=keep",
		);

		expect(redacted).toBe(
			"https://example.com/callback?access_token=REDACTED&token=REDACTED&api_key=REDACTED&key=REDACTED&secret=REDACTED&password=REDACTED&code=REDACTED&state=keep",
		);
	});

	it("leaves targets without sensitive query parameters usable", () => {
		expect(redactTargetUrl("https://example.com/path?view=public")).toBe(
			"https://example.com/path?view=public",
		);
		expect(redactTargetUrl("https://example.com")).toBe(
			"https://example.com",
		);
	});

	it("removes secret values while preserving safe assignment context", () => {
		const redacted = redactFinding(finding(`const API_KEY = \"${secret}\";`));

		expect(redacted.snippet).toContain("API_KEY");
		expect(redacted.snippet).toContain("[REDACTED_SECRET]");
		expect(redacted.snippet).not.toContain(secret);
	});

	it("redacts scanner snippets before findings leave the scanner", () => {
		const serialized = JSON.stringify(
			scanContent(`const API_KEY = \"${secret}\";`, "src/config.ts"),
		);

		expect(serialized).not.toContain(secret);
	});

	it("redacts snippets at the persistence boundary", () => {
		const rows = buildFindingRows("scan-1", [finding(`const API_KEY = \"${secret}\";`)]);

		expect(rows[0].code_snippet).toContain("[REDACTED_SECRET]");
		expect(rows[0].code_snippet).not.toContain(secret);
	});
});
