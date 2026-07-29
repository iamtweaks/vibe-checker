import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { findMany, count } = vi.hoisted(() => ({
	findMany: vi.fn(),
	count: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
	prisma: { scan: { findMany, count } },
}));

vi.mock("@/lib/scan-store", () => ({
	getApiKeyFromHeaders: vi.fn(() => "admin-key"),
	isAdminApiKey: vi.fn(() => true),
}));

import { GET } from "../src/app/api/scans/history/route";

describe("GET /api/scans/history", () => {
	it("redacts sensitive target query values from legacy history rows", async () => {
		findMany.mockResolvedValue([
			{
				id: "scan-123",
				targetUrl: "https://example.com/callback?code=secret-code&view=public",
				scanType: "website",
				severityCounts: '{"critical":0,"high":0,"medium":0,"low":0,"info":0}',
				createdAt: new Date("2026-07-29T00:00:00.000Z"),
			},
		]);
		count.mockResolvedValue(1);

		const response = await GET(
			new NextRequest("https://scanner.test/api/scans/history"),
		);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.scans[0].targetUrl).toBe(
			"https://example.com/callback?code=REDACTED&view=public",
		);
	});
});
