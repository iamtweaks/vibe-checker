import { describe, expect, it } from "vitest";
import {
	buildRepositoryProfile,
	filterScannableFiles,
} from "../src/lib/scanners/github";

describe("GitHub repository selection", () => {
	it("prioritizes sensitive web configuration files within the scan limit", () => {
		const tree = [
			{ path: "src/app/page.tsx", type: "blob" },
			{ path: ".env.production", type: "blob" },
			{ path: ".env.staging", type: "blob" },
			{ path: ".envrc", type: "blob" },
			{ path: "infra/main.tf", type: "blob" },
			{ path: ".npmrc", type: "blob" },
			{ path: ".replit", type: "blob" },
			{ path: ".github/workflows/deploy.yml", type: "blob" },
			{ path: "supabase/migrations/20260729_init.sql", type: "blob" },
			{ path: ".cursor/rules/security.mdc", type: "blob" },
			{ path: "package-lock.json", type: "blob" },
			{ path: "pnpm-lock.yaml", type: "blob" },
			{ path: "docs/example.ts", type: "blob" },
			{ path: "tests/fixture.ts", type: "blob" },
		];

		expect(filterScannableFiles(tree)).toEqual([
			".env.production",
			".env.staging",
			".envrc",
			".github/workflows/deploy.yml",
			".npmrc",
			".replit",
			"package-lock.json",
			"pnpm-lock.yaml",
			"supabase/migrations/20260729_init.sql",
			".cursor/rules/security.mdc",
			"src/app/page.tsx",
		]);
	});

	it("keeps sensitive configuration files when the repository exceeds the 500-file limit", () => {
		const tree = [
			...Array.from({ length: 500 }, (_, index) => ({
				path: `src/generated/${index}.ts`,
				type: "blob",
			})),
			{ path: ".env.production", type: "blob" },
			{ path: ".github/workflows/deploy.yml", type: "blob" },
		];

		const selected = filterScannableFiles(tree);
		expect(selected).toHaveLength(500);
		expect(selected).toEqual(
			expect.arrayContaining([".env.production", ".github/workflows/deploy.yml"]),
		);
	});
});

describe("repository profile", () => {
	it("requires two web signals before classifying a repository as a web application", () => {
		expect(buildRepositoryProfile(["src/app/page.tsx", "package.json"])).toEqual({
			kind: "web-application",
			aiAssistanceEvidence: [],
		});

		expect(buildRepositoryProfile(["src/app/page.tsx"])).toEqual({
			kind: "unknown",
			aiAssistanceEvidence: [],
		});
	});

	it("reports only explicit AI-assistance artifacts as evidence", () => {
		expect(buildRepositoryProfile([".replit", ".cursor/rules/security.mdc"])).toEqual({
			kind: "unknown",
			aiAssistanceEvidence: [
				"Replit project configuration",
				"Cursor project configuration",
			],
		});
	});
});
