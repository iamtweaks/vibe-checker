import { NextRequest, NextResponse } from "next/server";
import { buildCorsHeaders } from "@/lib/security-headers";
import { prisma } from "@/lib/db";
import { getApiKeyFromHeaders, isAdminApiKey } from "@/lib/scan-store";

type SeverityCounts = {
	critical?: number;
	high?: number;
	medium?: number;
	low?: number;
	info?: number;
};

function countFindings(rawCounts: string): number {
	try {
		const counts = JSON.parse(rawCounts) as SeverityCounts;
		return Object.values(counts).reduce((total, value) => {
			return total + (typeof value === "number" ? value : 0);
		}, 0);
	} catch {
		return 0;
	}
}

export async function OPTIONS(request: NextRequest) {
	return NextResponse.json({}, { headers: buildCorsHeaders(request, "GET, OPTIONS") });
}

export async function GET(request: NextRequest) {
	try {
		const [totalScans, uniqueTargets, scansForFindingCount, recentScans] =
			await Promise.all([
				prisma.scan.count(),
				prisma.scan.groupBy({ by: ["targetUrl"] }),
				prisma.scan.findMany({ select: { severityCounts: true } }),
				prisma.scan.findMany({
					orderBy: { createdAt: "desc" },
					take: 10,
					select: {
						id: true,
						targetUrl: true,
						scanType: true,
						severityCounts: true,
						createdAt: true,
					},
				}),
			]);

		const vulnerabilitiesFound = scansForFindingCount.reduce(
			(total, scan) => total + countFindings(scan.severityCounts),
			0,
		);

		return NextResponse.json(
			{
				totalScans,
				uniqueSites: uniqueTargets.length,
				vulnerabilitiesFound,
				recentScans: recentScans.map((scan) => ({
					...scan,
					severityCounts: JSON.parse(scan.severityCounts),
				})),
			},
			{ headers: buildCorsHeaders(request, "GET, OPTIONS") },
		);
	} catch (error) {
		console.error("Stats API error:", error);
		return NextResponse.json(
			{
				totalScans: 0,
				uniqueSites: 0,
				vulnerabilitiesFound: 0,
				recentScans: [],
				error: "Service unavailable",
			},
			{ status: 503, headers: buildCorsHeaders(request, "GET, OPTIONS") },
		);
	}
}

// Manual backfill/import endpoint. Runtime scans are persisted by /api/scan.
export async function POST(request: NextRequest) {
	try {
		const adminKey = getApiKeyFromHeaders(request.headers);
		if (!isAdminApiKey(adminKey)) {
			return NextResponse.json(
				{ error: "Stats writes require an admin API key", code: "ADMIN_KEY_REQUIRED" },
				{ status: 403, headers: buildCorsHeaders(request) },
			);
		}

		const { url, scanType, findings, severityCounts } = await request.json();
		if (!url || typeof url !== "string") {
			return NextResponse.json(
				{ error: "URL required", code: "URL_REQUIRED" },
				{ status: 400, headers: buildCorsHeaders(request) },
			);
		}

		const scan = await prisma.scan.create({
			data: {
				targetUrl: url.trim().toLowerCase().replace(/\/$/, ""),
				scanType: scanType === "github" ? "github" : "website",
				findingsJson: JSON.stringify(Array.isArray(findings) ? findings : []),
				severityCounts: JSON.stringify(severityCounts || {}),
			},
		});

		return NextResponse.json(
			{ scanId: scan.id },
			{ headers: buildCorsHeaders(request) },
		);
	} catch (error) {
		console.error("Stats POST error:", error);
		return NextResponse.json(
			{ error: "Failed to save scan", code: "SAVE_FAILED" },
			{ status: 500, headers: buildCorsHeaders(request) },
		);
	}
}
