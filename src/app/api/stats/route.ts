import { NextRequest, NextResponse } from "next/server";
import { buildCorsHeaders } from "@/lib/security-headers";
import { prisma } from "@/lib/db";
import { getApiKeyFromHeaders, isAdminApiKey, persistScan } from "@/lib/scan-store";

export async function OPTIONS(request: NextRequest) {
	return NextResponse.json({}, { headers: buildCorsHeaders(request, "GET, OPTIONS") });
}

export async function GET(request: NextRequest) {
	try {
		const [totalScans, uniqueTargets, vulnerabilitiesFound, recentScans] =
			await Promise.all([
				prisma.scan.count(),
				prisma.target.count(),
				prisma.scanFinding.count(),
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

		return NextResponse.json(
			{
				totalScans,
				uniqueSites: uniqueTargets,
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

		const type = scanType === "github" ? "github" : "website";
		const scanId = crypto.randomUUID();
		await persistScan({
			scanId,
			type,
			targetUrl: url.trim(),
			status: "completed",
			findings: Array.isArray(findings) ? findings : [],
			severityCounts: severityCounts || {
				critical: 0,
				high: 0,
				medium: 0,
				low: 0,
				info: 0,
			},
			scannedAt: new Date().toISOString(),
		});

		return NextResponse.json(
			{ scanId },
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
