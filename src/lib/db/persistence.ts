/**
 * Canonical persistence layer for scans and findings.
 *
 * Why this exists
 * ---------------
 * Previously, /api/scan/website and /api/scan/github each contained their own
 * copy of:
 *   - URL normalization
 *   - get_or_create_website RPC call
 *   - Insert into `scans`
 *   - Insert into `scan_findings`
 *
 * That duplication drifted: github inserted findings with `apiKey` reuse, website
 * did not normalize trailing slashes, and neither route deduplicated within
 * the same scan. Result: a re-scan of the same URL produced a new `website`
 * row and double-counted every finding.
 *
 * This module is the single source of truth for:
 *   - URL normalization (one URL = one website row, forever)
 *   - scan upsert (find the most recent scan for that URL, link to it)
 *   - finding dedupe (rule_id + file_path + line_number is unique within a scan)
 *
 * Anything that needs to persist a scan MUST go through `persistScan`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Finding, Severity } from "@/lib/types";

export type ScanKind = "github" | "website";

export interface PersistScanInput {
	supabase: SupabaseClient;
	kind: ScanKind;
	rawUrl: string;
	findings: Finding[];
	severityCounts: Record<Severity, number>;
	scanDurationMs: number;
}

export interface PersistScanResult {
	websiteId: string | null;
	scanId: string | null;
	findingsInserted: number;
}

/**
 * Normalize a URL so that trivially different spellings collapse to the same
 * website row. Examples:
 *   "  HTTPS://Example.com/ " -> "https://example.com"
 *   "https://example.com/"   -> "https://example.com"
 *   "github.com/foo/bar"     -> "https://github.com/foo/bar"
 *   "owner/repo"             -> "owner/repo" (GitHub shorthand, kept as-is)
 */
export function normalizeTargetUrl(rawUrl: string, kind: ScanKind): string {
	const trimmed = rawUrl.trim();
	if (!trimmed) return trimmed;

	if (kind === "github") {
		// owner/repo shorthand: keep it as the canonical "github.com/owner/repo"
		// so two inputs of "facebook/react" and "facebook/react/" both land on
		// the same row.
		const shorthand = trimmed.match(/^([\w.-]+)\/([\w.-]+?)\/?$/);
		if (shorthand && !trimmed.includes("://") && !trimmed.includes("github.com")) {
			return `https://github.com/${shorthand[1]}/${shorthand[2]}`.toLowerCase();
		}
	}

	let url = trimmed;
	if (!/^https?:\/\//i.test(url)) {
		url = `https://${url}`;
	}

	const parsed = new URL(url);
	parsed.hash = "";
	// Strip trailing slash from pathname (keep "/" for the bare host).
	if (parsed.pathname.length > 1 && parsed.pathname.endsWith("/")) {
		parsed.pathname = parsed.pathname.replace(/\/+$/, "");
	}
	// Drop tracking params that real users don't care about.
	parsed.search = "";
	parsed.protocol = parsed.protocol.toLowerCase();
	parsed.hostname = parsed.hostname.toLowerCase();

	return parsed.toString();
}

/**
 * Resolve or create the canonical website row for a normalized URL.
 * Returns the website id or null on failure (failure is non-fatal: callers
 * log it but still return the scan response to the user).
 */
async function resolveWebsiteId(
	supabase: SupabaseClient,
	normalizedUrl: string,
): Promise<string | null> {
	const { data, error } = await supabase.rpc("get_or_create_website", {
		p_url: normalizedUrl,
	});
	if (error) {
		console.error("get_or_create_website failed:", error);
		return null;
	}
	return data ?? null;
}

/**
 * Insert the scan row. We do NOT dedupe scans themselves: every scan run is a
 * distinct event (different timestamp, different finding counts, possibly
 * different code state). What we dedupe is findings within a scan and
 * websites across scans.
 */
async function insertScan(
	supabase: SupabaseClient,
	input: {
		websiteId: string;
		kind: ScanKind;
		normalizedUrl: string;
		findingsCount: number;
		severityCounts: Record<Severity, number>;
		scanDurationMs: number;
	},
): Promise<string | null> {
	const { data, error } = await supabase
		.from("scans")
		.insert({
			website_id: input.websiteId,
			scan_type: input.kind,
			target_url: input.normalizedUrl,
			findings_count: input.findingsCount,
			severity_counts: input.severityCounts,
			findings: [], // canonical findings live in scan_findings
			scan_duration_ms: input.scanDurationMs,
			status: "completed",
		})
		.select("id")
		.single();

	if (error) {
		console.error("scans insert failed:", error);
		return null;
	}
	return data?.id ?? null;
}

/**
 * Build the list of finding rows, deduping by
 * (rule_id, file_path, line_number) within the scan.
 *
 * We dedupe here in addition to the unique index so the client sees the
 * count we actually inserted; the unique index is a defense in depth in case
 * two scans race on the same finding tuple.
 */
export function buildFindingRows(
	scanId: string,
	findings: Finding[],
): Array<Record<string, unknown>> {
	const seen = new Set<string>();
	const rows: Array<Record<string, unknown>> = [];
	for (const f of findings) {
		const key = `${f.ruleId}::${f.filePath ?? ""}::${f.lineNumber ?? ""}`;
		if (seen.has(key)) continue;
		seen.add(key);
		rows.push({
			scan_id: scanId,
			rule_id: f.ruleId,
			title: f.title,
			description: f.description,
			severity: f.severity,
			file_path: f.filePath ?? null,
			line_number: f.lineNumber ?? null,
			code_snippet: f.snippet ?? null,
			remediation: f.remediation,
			score: f.score ?? null,
			risk_factors: f.riskFactors ?? null,
		});
	}
	return rows;
}

/**
 * Persist a scan end-to-end. Always returns a structured result; the caller
 * decides what to do with partial failures.
 */
export async function persistScan(
	input: PersistScanInput,
): Promise<PersistScanResult> {
	const normalizedUrl = normalizeTargetUrl(input.rawUrl, input.kind);

	const websiteId = await resolveWebsiteId(input.supabase, normalizedUrl);
	if (!websiteId) {
		return { websiteId: null, scanId: null, findingsInserted: 0 };
	}

	const scanId = await insertScan(input.supabase, {
		websiteId,
		kind: input.kind,
		normalizedUrl,
		findingsCount: input.findings.length,
		severityCounts: input.severityCounts,
		scanDurationMs: input.scanDurationMs,
	});
	if (!scanId) {
		return { websiteId, scanId: null, findingsInserted: 0 };
	}

	if (input.findings.length === 0) {
		return { websiteId, scanId, findingsInserted: 0 };
	}

	const rows = buildFindingRows(scanId, input.findings);
	if (rows.length === 0) {
		return { websiteId, scanId, findingsInserted: 0 };
	}

	const { error } = await input.supabase.from("scan_findings").insert(rows);
	if (error) {
		console.error("scan_findings insert failed:", error);
		return { websiteId, scanId, findingsInserted: 0 };
	}

	return { websiteId, scanId, findingsInserted: rows.length };
}

/**
 * Build aggregate stats from Supabase. Numbers reflect the *deduplicated*
 * universe we want:
 *   - uniqueSites: number of distinct websites ever scanned
 *   - totalScans: total scan rows (every run counts, including re-scans)
 *   - totalVulnerabilities: total finding rows persisted
 *   - uniqueVulnerabilities: distinct (website_id, rule_id) pairs across
 *     every scan — i.e. unique vulnerabilities discovered across all scanned
 *     sites. Re-scanning the same URL does not double-count.
 */
export async function buildStats(supabase: SupabaseClient) {
	const [
		{ count: totalScans },
		{ count: uniqueSites },
		{ count: totalVulnerabilities },
		{ data: findingKeys },
	] = await Promise.all([
		supabase.from("scans").select("*", { count: "exact", head: true }),
		supabase.from("websites").select("*", { count: "exact", head: true }),
		supabase.from("scan_findings").select("*", { count: "exact", head: true }),
		// (website_id, rule_id) pair = "this rule fired on this site".
		// Distinct pairs = unique vulns across the entire scanned corpus.
		supabase
			.from("scan_findings")
			.select("scan_id, rule_id, scans!inner(website_id)")
			.limit(5000),
	]);

	const uniqueSet = new Set<string>();
	for (const row of findingKeys ?? []) {
		const websiteId =
			(row as { scans?: { website_id?: string | null } }).scans?.website_id;
		const ruleId = (row as { rule_id?: string | null }).rule_id;
		if (websiteId && ruleId) uniqueSet.add(`${websiteId}::${ruleId}`);
	}

	return {
		totalScans: totalScans ?? 0,
		uniqueSites: uniqueSites ?? 0,
		totalVulnerabilities: totalVulnerabilities ?? 0,
		uniqueVulnerabilities: uniqueSet.size,
	};
}