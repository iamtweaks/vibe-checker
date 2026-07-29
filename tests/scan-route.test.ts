import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { Finding, SeverityCounts } from "../src/lib/types";

const { scanWebsite, createClient, persistScan, buildFindingRows } = vi.hoisted(() => ({
	scanWebsite: vi.fn(),
	createClient: vi.fn(),
	persistScan: vi.fn(),
	buildFindingRows: vi.fn(),
}));

vi.mock("@/lib/scanners/website", () => ({ scanWebsite }));
vi.mock("@/utils/supabase/server", () => ({ createClient }));
vi.mock("@/lib/db/persistence", () => ({ buildFindingRows, persistScan }));

import { POST } from "../src/app/api/scan/route";

const severityCounts: SeverityCounts = {
	critical: 0,
	high: 1,
	medium: 0,
	low: 0,
	info: 0,
};

const findings: Finding[] = [
	{
		id: "finding-1",
		ruleId: "A01",
		severity: "high",
		title: "Test finding",
		description: "Test description",
		remediation: "Test remediation",
	},
];

const secret = "sk_live_4eC39HqLyjWDarjtT1zdp7dc";

function scanRequest(clientIp: string): NextRequest {
	return new NextRequest("https://scanner.test/api/scan", {
		method: "POST",
		headers: { "content-type": "application/json", "x-forwarded-for": clientIp },
		body: JSON.stringify({ type: "website", url: "https://example.com?access_token=token-value" }),
	});
}

describe("POST /api/scan", () => {
	it("persists browser scans through the Supabase persistence contract", async () => {
		const supabase = { client: "supabase" };
		scanWebsite.mockResolvedValue({
			findings,
			severityCounts,
			scannedUrls: 1,
			scanDuration: 42,
		});
		createClient.mockResolvedValue(supabase);
		buildFindingRows.mockReturnValue([{}]);
		persistScan.mockResolvedValue({
			websiteId: "website-1",
			scanId: "scan-1",
			findingsInserted: 1,
		});

		const response = await POST(scanRequest("203.0.113.1"));

		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({
			success: true,
			type: "website",
			targetUrl: "https://example.com/?access_token=REDACTED",
			status: "completed",
		});
		expect(persistScan).toHaveBeenCalledWith({
			supabase,
			kind: "website",
			rawUrl: "https://example.com?access_token=token-value",
			findings,
			severityCounts,
			scanDurationMs: 42,
		});
	});

	it("redacts findings at the API response boundary", async () => {
		scanWebsite.mockResolvedValue({
			findings: [{ ...findings[0], snippet: `const API_KEY = "${secret}"` }],
			severityCounts,
			scannedUrls: 1,
			scanDuration: 42,
		});
		createClient.mockResolvedValue({ client: "supabase" });
		buildFindingRows.mockReturnValue([{}]);
		persistScan.mockResolvedValue({ websiteId: "website-1", scanId: "scan-1", findingsInserted: 1 });

		const response = await POST(scanRequest("203.0.113.2"));
		const body = await response.json();

		expect(JSON.stringify(body)).not.toContain(secret);
		expect(body.findings[0].snippet).toContain("[REDACTED_SECRET]");
	});

	it("reports a storage failure instead of returning a completed scan", async () => {
		scanWebsite.mockResolvedValue({
			findings,
			severityCounts,
			scannedUrls: 1,
			scanDuration: 42,
		});
		createClient.mockResolvedValue({ client: "supabase" });
		buildFindingRows.mockReturnValue([{}]);
		persistScan.mockResolvedValue({
			websiteId: "website-1",
			scanId: null,
			findingsInserted: 0,
		});

		const response = await POST(scanRequest("203.0.113.3"));

		expect(response.status).toBe(503);
		expect(await response.json()).toEqual({
			success: false,
			error: "Scan completed but could not be durably stored. Please try again.",
			code: "PERSISTENCE_FAILED",
		});
	});
});
