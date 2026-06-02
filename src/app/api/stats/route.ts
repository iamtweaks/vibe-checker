import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
	try {
		const supabase = await createClient();

		// Get stats from Supabase
		const { count: totalWebsites, error: countError } = await supabase
			.from("websites")
			.select("*", { count: "exact", head: true });

		const { data: recentScans, error: scansError } = await supabase
			.from("scans")
			.select(
				"id, scan_type, target_url, findings_count, severity_counts, created_at",
			)
			.order("created_at", { ascending: false })
			.limit(100);

		if (countError || scansError) {
			console.error("Error fetching stats:", countError || scansError);
			// Fallback to cached response
			return NextResponse.json({
				totalScans: 0,
				uniqueSites: 0,
				recentScans: [],
				error: "Database unavailable",
			});
		}

		return NextResponse.json({
			totalScans: totalWebsites || 0,
			uniqueSites: totalWebsites || 0,
			recentScans: recentScans || [],
		});
	} catch (error) {
		console.error("Stats API error:", error);
		return NextResponse.json({
			totalScans: 0,
			uniqueSites: 0,
			recentScans: [],
			error: "Service unavailable",
		});
	}
}

export async function POST(request: Request) {
	try {
		const { url, scanType, findings, severityCounts, scanDuration } =
			await request.json();

		if (!url) {
			return NextResponse.json({ error: "URL required" }, { status: 400 });
		}

		const supabase = await createClient();

		// Normalize URL
		let normalizedUrl = url.toLowerCase().trim();
		normalizedUrl = normalizedUrl.replace(/\/$/, "");

		// Extract domain
		let domain = normalizedUrl;
		if (normalizedUrl.includes("github.com")) {
			const match = normalizedUrl.match(/github\.com\/([^/]+\/[^/]+)/);
			domain = match ? match[1] : normalizedUrl;
		} else {
			try {
				const u = new URL(normalizedUrl);
				domain = u.origin;
			} catch {
				domain = normalizedUrl;
			}
		}

		// Get or create website
		const { data: websiteId, error: websiteError } = await supabase.rpc(
			"get_or_create_website",
			{ p_url: normalizedUrl },
		);

		if (websiteError) {
			console.error("Error creating website:", websiteError);
			return NextResponse.json(
				{ error: "Failed to record website" },
				{ status: 500 },
			);
		}

		// Store the scan
		const { data: scan, error: scanError } = await supabase
			.from("scans")
			.insert({
				website_id: websiteId,
				scan_type: scanType || "website",
				target_url: normalizedUrl,
				findings_count: findings?.length || 0,
				severity_counts: severityCounts || {
					critical: 0,
					high: 0,
					medium: 0,
					low: 0,
					info: 0,
				},
				findings: findings || [],
				scan_duration_ms: scanDuration || 0,
				status: "completed",
			})
			.select()
			.single();

		if (scanError) {
			console.error("Error storing scan:", scanError);
			return NextResponse.json(
				{ error: "Failed to store scan" },
				{ status: 500 },
			);
		}

		// If there are findings, store them in scan_findings table
		if (findings && findings.length > 0) {
			const findingsRecords = findings.map((finding: any) => ({
				scan_id: scan.id,
				rule_id: finding.ruleId,
				title: finding.title,
				description: finding.description,
				severity: finding.severity,
				file_path: finding.filePath || null,
				line_number: finding.line || finding.lineNumber || null,
				code_snippet: finding.codeSnippet || finding.code || null,
				remediation: finding.remediation || null,
			}));

			await supabase.from("scan_findings").insert(findingsRecords);
		}

		// Get updated stats
		const { count: totalWebsites } = await supabase
			.from("websites")
			.select("*", { count: "exact", head: true });

		return NextResponse.json({
			scanId: scan.id,
			totalScans: totalWebsites || 0,
			uniqueSites: totalWebsites || 0,
		});
	} catch (error) {
		console.error("Stats POST error:", error);
		return NextResponse.json({ error: "Failed to save scan" }, { status: 500 });
	}
}
