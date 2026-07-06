import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getCorsHeaders, getPreflightHeaders } from "@/lib/cors";
import { buildStats } from "@/lib/db/persistence";

export async function OPTIONS(request: NextRequest) {
	return NextResponse.json({}, { headers: getPreflightHeaders(request) });
}

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient();
		const stats = await buildStats(supabase);
		return NextResponse.json(
			{ ...stats, recentScans: [] },
			{ headers: getCorsHeaders(request) },
		);
	} catch (error) {
		console.error("Stats API error:", error);
		return NextResponse.json(
			{
				totalScans: 0,
				uniqueSites: 0,
				totalVulnerabilities: 0,
				uniqueVulnerabilities: 0,
				recentScans: [],
				error: "Service unavailable",
			},
			{ status: 200, headers: getCorsHeaders(request) },
		);
	}
}

/**
 * POST /api/stats
 *
 * Historically this endpoint also persisted the scan and its findings. That
 * caused double-writes because /api/scan/website and /api/scan/github already
 * save the same data. The endpoint is now a stats read only; the canonical
 * write path is the dedicated /api/scan/* routes. We keep the POST shape
 * for backwards compatibility with the existing Scanner component.
 */
export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const stats = await buildStats(supabase);
		return NextResponse.json(stats, { headers: getCorsHeaders(request) });
	} catch (error) {
		console.error("Stats POST error:", error);
		return NextResponse.json(
			{ error: "Failed to load stats" },
			{ status: 500, headers: getCorsHeaders(request) },
		);
	}
}
