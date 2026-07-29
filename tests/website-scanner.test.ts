import { describe, expect, it, vi } from "vitest";

const { fetchPublicHtml, runPathProbes } = vi.hoisted(() => ({
	fetchPublicHtml: vi.fn(),
	runPathProbes: vi.fn(),
}));

vi.mock("../src/lib/network-security", () => ({ fetchPublicHtml }));
vi.mock("../src/lib/scanners/path-probe", () => ({ runPathProbes }));

import { scanWebsite } from "../src/lib/scanners/website";

async function scanBody(body: string) {
	fetchPublicHtml.mockResolvedValue({
		finalUrl: "https://example.com/",
		html: `<html><body>${body}</body></html>`,
		headers: new Headers(),
	});
	runPathProbes.mockResolvedValue([]);
	return scanWebsite("https://example.com/");
}

describe("website scanner debug endpoint detection", () => {
	it("does not treat ordinary prose containing 'at' as a debug trace", async () => {
		const result = await scanBody("Learn how that AI assistant protects your data.");

		expect(result.findings).not.toContainEqual(
			expect.objectContaining({ title: "Debug or Development Endpoint Exposed" }),
		);
	});

	it("detects a structured stack frame in page content", async () => {
		const result = await scanBody(
			"Error: request failed\n    at Object.handler (/app/server.js:42:7)",
		);

		expect(result.findings).toContainEqual(
			expect.objectContaining({ title: "Debug or Development Endpoint Exposed" }),
		);
	});

	it("does not report reflected CORS without request Origin evidence", async () => {
		fetchPublicHtml.mockResolvedValue({
			finalUrl: "https://example.com/",
			html: "<html><body></body></html>",
			headers: new Headers({
				"access-control-allow-origin": "https://attacker.example",
				"access-control-allow-credentials": "true",
			}),
		});
		runPathProbes.mockResolvedValue([]);

		const result = await scanWebsite("https://example.com/");

		expect(result.findings.map((finding) => finding.ruleId)).not.toContain("WEB-021");
	});
});
