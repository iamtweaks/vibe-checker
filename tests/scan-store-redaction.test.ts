import { describe, expect, it, vi } from "vitest";
import type { ScanAPIResponse } from "../src/lib/types";

const { scanCreate, targetUpsert, transaction } = vi.hoisted(() => ({
	scanCreate: vi.fn(),
	targetUpsert: vi.fn(),
	transaction: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
	prisma: { $transaction: transaction },
}));

import { persistScan, toScanAPIResponse } from "../src/lib/scan-store";

const targetUrl = "https://example.com/callback?token=secret-token&state=keep";
const redactedTargetUrl =
	"https://example.com/callback?token=REDACTED&state=keep";

function scan(): ScanAPIResponse {
	return {
		scanId: "scan-123",
		type: "website",
		targetUrl,
		status: "completed",
		findings: [],
		severityCounts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
		scannedAt: "2026-07-29T00:00:00.000Z",
	};
}

describe("legacy scan-store target URL redaction", () => {
	it("redacts sensitive target values before persistence", async () => {
		targetUpsert.mockResolvedValue({ id: "target-123" });
		scanCreate.mockResolvedValue({});
		transaction.mockImplementation(async (callback: (client: {
			target: { upsert: typeof targetUpsert };
			scan: { create: typeof scanCreate };
		}) => Promise<unknown>) =>
			callback({ target: { upsert: targetUpsert }, scan: { create: scanCreate } }),
		);

		await persistScan(scan());

		expect(targetUpsert).toHaveBeenCalledWith(
			expect.objectContaining({
				create: expect.objectContaining({ displayUrl: redactedTargetUrl }),
				update: expect.objectContaining({ displayUrl: redactedTargetUrl }),
			}),
		);
		expect(scanCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ targetUrl: redactedTargetUrl }),
			}),
		);
	});

	it("redacts target URLs read from legacy rows", () => {
		const response = toScanAPIResponse({
			id: "scan-123",
			targetUrl,
			scanType: "website",
			findingsJson: "[]",
			severityCounts: '{"critical":0,"high":0,"medium":0,"low":0,"info":0}',
			createdAt: new Date("2026-07-29T00:00:00.000Z"),
		});

		expect(response.targetUrl).toBe(redactedTargetUrl);
	});
});
