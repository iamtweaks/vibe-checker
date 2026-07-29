import { type NextRequest, NextResponse } from "next/server";
import { validateGitHubUrl, checkRateLimit } from "@/lib/validation";
import { scanGitHubRepo } from "@/lib/scanners/github";
import { createClient } from "@/utils/supabase/server";
import { getCorsHeaders, getPreflightHeaders } from "@/lib/cors";
import { persistScan } from "@/lib/db/persistence";
import { redactTargetUrl } from "@/lib/redaction";
import type { ScanAPIResponse, SeverityCounts } from "@/lib/types";

export async function OPTIONS(request: NextRequest) {
	return NextResponse.json({}, { headers: getPreflightHeaders(request) });
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
						...getCorsHeaders(request),
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
				{ status: 400, headers: getCorsHeaders(request) },
			);
		}

		// Validate URL
		if (!url || typeof url !== "string") {
			return NextResponse.json(
				{ error: "URL is required", code: "URL_REQUIRED" },
				{ status: 400, headers: getCorsHeaders(request) },
			);
		}

		const validation = validateGitHubUrl(url.trim());
		if (!validation.valid) {
			return NextResponse.json(
				{ error: validation.error, code: validation.code },
				{ status: 400, headers: getCorsHeaders(request) },
			);
		}

		// Extract GitHub token from header if provided
		const authHeader = request.headers.get("authorization");
		const githubToken = authHeader?.replace("Bearer ", "");

		const result = await scanGitHubRepo(url.trim(), githubToken);

		const response: ScanAPIResponse = {
			scanId: crypto.randomUUID(),
			type: "github",
			targetUrl: redactTargetUrl(url.trim()),
			status: "completed",
			findings: result.findings,
			severityCounts: result.severityCounts as SeverityCounts,
			scannedAt: new Date().toISOString(),
			scannedFiles: result.scannedFiles,
			scanDuration: result.scanDuration,
		};

		// Persist scan to Supabase using the canonical persistence layer.
		// All dedupe/normalization happens there — see src/lib/db/persistence.ts.
		try {
			const supabase = await createClient();
			await persistScan({
				supabase,
				kind: "github",
				rawUrl: url.trim(),
				findings: result.findings,
				severityCounts: result.severityCounts as Record<
					import("@/lib/types").Severity,
					number
				>,
				scanDurationMs: result.scanDuration || 0,
			});
		} catch (dbError) {
			console.error("Database error:", dbError);
			// Don't fail the scan if DB is unavailable
		}

		return NextResponse.json(response, {
			headers: {
				...getCorsHeaders(request),
				"X-RateLimit-Remaining": String(rateLimitResult.remainingRequests ?? 0),
			},
		});
	} catch (error: any) {
		console.error("GitHub scan error:", error);

		// Handle specific error types with appropriate status codes
		if (error.message?.includes("Invalid GitHub URL")) {
			return NextResponse.json(
				{ error: "Invalid GitHub repository URL", code: "INVALID_URL" },
				{ status: 400, headers: getCorsHeaders(request) },
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
				{ status: 404, headers: getCorsHeaders(request) },
			);
		}

		if (error.message?.includes("Could not access")) {
			return NextResponse.json(
				{
					error:
						"Could not access repository. Make sure it exists and is public.",
					code: "ACCESS_DENIED",
				},
				{ status: 403, headers: getCorsHeaders(request) },
			);
		}

		if (error.message?.includes("rate limit") || error.status === 403) {
			return NextResponse.json(
				{
					error:
						"GitHub API rate limit exceeded. Try again later or provide a GitHub token.",
					code: "GITHUB_RATE_LIMIT",
				},
				{ status: 429, headers: getCorsHeaders(request) },
			);
		}

		return NextResponse.json(
			{
				error: error.message || "Scan failed. Please try again.",
				code: "SCAN_FAILED",
			},
			{ status: 500, headers: getCorsHeaders(request) },
		);
	}
}
