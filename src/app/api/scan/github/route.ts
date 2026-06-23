import { type NextRequest, NextResponse } from "next/server";
import { buildCorsHeaders } from "@/lib/security-headers";
import { validateGitHubUrl, checkRateLimit } from "@/lib/validation";
import { scanGitHubRepo } from "@/lib/scanners/github";
import { createClient } from "@/utils/supabase/server";
import type { ScanAPIResponse, SeverityCounts } from "@/lib/types";

export async function OPTIONS(request: NextRequest) {
	return NextResponse.json({}, { headers: buildCorsHeaders(request) });
}

export async function POST(request: NextRequest) {
	try {
		// Rate limiting using client IP as identifier
		const clientIp =
			request.headers.get("x-forwarded-for")?.split(",")[0] ||
			request.headers.get("cf-connecting-ip") ||
			"anonymous";
		const rateLimitResult = checkRateLimit(clientIp);

		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{
					error: "Too many requests. Please wait before trying again.",
					code: "RATE_LIMITED",
					retryAfter: rateLimitResult.retryAfter,
				},
				{
					status: 429,
					headers: {
						...buildCorsHeaders(request),
						"Retry-After": String(
							Math.ceil((rateLimitResult.retryAfter || 1000) / 1000),
						),
						"X-RateLimit-Remaining": "0",
					},
				},
			);
		}

		// Parse request body
		let url: string | undefined;
		try {
			const body = await request.json();
			url = body?.url;
		} catch {
			return NextResponse.json(
				{ error: "Invalid JSON in request body", code: "INVALID_JSON" },
				{ status: 400, headers: buildCorsHeaders(request) },
			);
		}

		// Validate URL
		if (!url || typeof url !== "string") {
			return NextResponse.json(
				{ error: "URL is required", code: "URL_REQUIRED" },
				{ status: 400, headers: buildCorsHeaders(request) },
			);
		}

		const validation = validateGitHubUrl(url.trim());
		if (!validation.valid) {
			return NextResponse.json(
				{ error: validation.error, code: validation.code },
				{ status: 400, headers: buildCorsHeaders(request) },
			);
		}

		// Extract GitHub token from header if provided
		const authHeader = request.headers.get("authorization");
		const githubToken = authHeader?.replace("Bearer ", "");

		const result = await scanGitHubRepo(url.trim(), githubToken);

		const response: ScanAPIResponse = {
			scanId: crypto.randomUUID(),
			type: "github",
			targetUrl: url.trim(),
			status: "completed",
			findings: result.findings,
			severityCounts: result.severityCounts as SeverityCounts,
			scannedAt: new Date().toISOString(),
			scannedFiles: result.scannedFiles,
			scanDuration: result.scanDuration,
		};

		// Persist scan to Supabase database
		try {
			const supabase = await createClient();

			// Normalize URL
			const normalizedUrl = url.trim().toLowerCase().replace(/\/$/, "");

			// Extract owner/repo from github URL
			const match = normalizedUrl.match(/github\.com\/([^/]+\/[^/]+)/);
			const domain = match ? match[1] : normalizedUrl;

			// Get or create website
			const { data: websiteId } = await supabase.rpc("get_or_create_website", {
				p_url: normalizedUrl,
			});

			if (websiteId) {
				// Store the scan
				const { error: scanError } = await supabase.from("scans").insert({
					website_id: websiteId,
					scan_type: "github",
					target_url: normalizedUrl,
					findings_count: result.findings.length,
					severity_counts: result.severityCounts,
					findings: result.findings,
					scan_duration_ms: result.scanDuration || 0,
					status: "completed",
				});

				if (scanError) {
					console.error("Failed to save scan to database:", scanError);
					// Don't fail the scan if DB save fails
				}
			}
		} catch (dbError) {
			console.error("Database error:", dbError);
			// Don't fail the scan if DB is unavailable
		}

		return NextResponse.json(response, {
			headers: {
				...buildCorsHeaders(request),
				"X-RateLimit-Remaining": String(rateLimitResult.remainingRequests ?? 0),
			},
		});
	} catch (error: any) {
		console.error("GitHub scan error:", error);

		// Handle specific error types with appropriate status codes
		if (error.message?.includes("Invalid GitHub URL")) {
			return NextResponse.json(
				{ error: "Invalid GitHub repository URL", code: "INVALID_URL" },
				{ status: 400, headers: buildCorsHeaders(request) },
			);
		}

		if (
			error.message?.includes("not found") ||
			error.message?.includes("404")
		) {
			return NextResponse.json(
				{
					error: "Repository not found or is not public",
					code: "REPO_NOT_FOUND",
				},
				{ status: 404, headers: buildCorsHeaders(request) },
			);
		}

		if (error.message?.includes("Could not access")) {
			return NextResponse.json(
				{
					error:
						"Could not access repository. Make sure it exists and is public.",
					code: "ACCESS_DENIED",
				},
				{ status: 403, headers: buildCorsHeaders(request) },
			);
		}

		if (error.message?.includes("rate limit") || error.status === 403) {
			return NextResponse.json(
				{
					error:
						"GitHub API rate limit exceeded. Try again later or provide a GitHub token.",
					code: "GITHUB_RATE_LIMIT",
				},
				{ status: 429, headers: buildCorsHeaders(request) },
			);
		}

		return NextResponse.json(
			{
				error: error.message || "Scan failed. Please try again.",
				code: "SCAN_FAILED",
			},
			{ status: 500, headers: buildCorsHeaders(request) },
		);
	}
}
