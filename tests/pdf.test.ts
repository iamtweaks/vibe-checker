import { describe, expect, it, vi } from "vitest";

const { text } = vi.hoisted(() => ({ text: vi.fn() }));

vi.mock("jspdf", () => {
	const doc = {
		internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
		setFillColor: vi.fn(),
		rect: vi.fn(),
		setTextColor: vi.fn(),
		setFontSize: vi.fn(),
		setFont: vi.fn(),
		text,
		roundedRect: vi.fn(),
		getTextWidth: () => 10,
		splitTextToSize: (value: string) => [value],
		addPage: vi.fn(),
		setDrawColor: vi.fn(),
		setLineWidth: vi.fn(),
		line: vi.fn(),
	};

	return { default: class { constructor() { return doc } } };
});

import { generatePDF } from "../src/lib/pdf";

describe("PDF target redaction", () => {
	it("renders a redacted target URL", () => {
		generatePDF({
			scanId: "scan-1",
			type: "website",
			targetUrl: "https://example.com/account?access_token=token-value",
			severityCounts: {},
			findings: [],
			scannedAt: "2026-07-29T00:00:00.000Z",
		});

		expect(text).toHaveBeenCalledWith(
			"https://example.com/account?access_token=REDACTED",
			expect.any(Number),
			expect.any(Number),
		);
	});
});
