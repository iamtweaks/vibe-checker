import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Environment variables for GitHub App credentials
const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

// Verify webhook signature using HMAC SHA-256
function verifySignature(
  payload: string,
  signature: string | null
): boolean {
  if (!GITHUB_WEBHOOK_SECRET) {
    console.warn("GITHUB_WEBHOOK_SECRET not configured, skipping verification");
    return true;
  }
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", GITHUB_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  const trusted = Buffer.from(`sha256=${expectedSignature}`, "utf-8");
  const received = Buffer.from(signature, "utf-8");

  return crypto.timingSafeEqual(trusted, received);
}

// Get installation access token using GitHub App credentials
async function getInstallationAccessToken(installationId: number): Promise<string> {
  if (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY) {
    throw new Error("GitHub App credentials not configured");
  }

  // Generate JWT
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 600, // 10 min expiry
    iss: GITHUB_APP_ID,
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");

  // Sign the JWT
  const privateKey = crypto.createPrivateKey(GITHUB_APP_PRIVATE_KEY);
  const sign = crypto.createSign("SHA256");
  sign.update(`${header}.${base64Payload}`);
  const signature = sign.sign(privateKey, "base64url");
  const token = `${header}.${base64Payload}.${signature}`;

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "VibeChecker-GitHub-App",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.token;
}

// Get files changed in a PR
async function getPRFiles(
  owner: string,
  repo: string,
  pullNumber: number,
  accessToken: string
): Promise<Array<{ filename: string; patch?: string; additions: number; deletions: number }>> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "VibeChecker-GitHub-App",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get PR files: ${error}`);
  }

  return response.json();
}

// Scan a single file content for issues
function scanFileContent(
  content: string,
  filename: string
): Array<{ line: number; severity: "error" | "warning" | "info"; message: string; rule?: string }> {
  const findings: Array<{ line: number; severity: "error" | "warning" | "info"; message: string; rule?: string }> = [];
  const lines = content.split("\n");

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for console.log statements
    if (/console\.(log|debug|info)/.test(line)) {
      findings.push({
        line: lineNum,
        severity: "warning",
        message: `Debug statement found: ${line.trim().substring(0, 50)}...`,
        rule: "no-console",
      });
    }

    // Check for TODO without issue reference
    if (/\bTODO\b/.test(line) && !/\bTODO\s*\(?\s*#\d+\s*\)?/.test(line)) {
      findings.push({
        line: lineNum,
        severity: "info",
        message: `TODO without issue reference: ${line.trim().substring(0, 50)}...`,
        rule: "TODO-must-have-issue",
      });
    }

    // Check for hardcoded credentials patterns
    if (/(password|secret|api_key|apikey|token)\s*[=:]\s*["'][^"']{3,}/i.test(line)) {
      findings.push({
        line: lineNum,
        severity: "error",
        message: `Potential hardcoded secret detected: ${line.trim().substring(0, 50)}...`,
        rule: "no-hardcoded-secrets",
      });
    }

    // Check for dangerous eval usage
    if (/\beval\s*\(/.test(line)) {
      findings.push({
        line: lineNum,
        severity: "error",
        message: "Dangerous eval() usage detected",
        rule: "no-eval",
      });
    }

    // Check for innerHTML usage (XSS risk)
    if (/\.innerHTML\s*=/.test(line)) {
      findings.push({
        line: lineNum,
        severity: "warning",
        message: "innerHTML assignment detected - potential XSS risk",
        rule: "no-innerhtml",
      });
    }
  });

  return findings;
}

// Post comment to PR
async function postPRComment(
  owner: string,
  repo: string,
  pullNumber: number,
  body: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/vnd.github.v3+json",
        "User-Agent": "VibeChecker-GitHub-App",
      },
      body: JSON.stringify({ body }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post comment: ${error}`);
  }
}

// Main webhook handler
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const event = request.headers.get("x-github-event");

    // Verify signature
    if (!verifySignature(rawBody, signature)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);

    // Only process pull_request events
    if (event !== "pull_request") {
      return NextResponse.json({ message: "Event not supported" }, { status: 200 });
    }

    const { action, pull_request, repository, installation } = payload;

    // Only run on opened, synchronize, or reopened actions
    if (!["opened", "synchronize", "reopened"].includes(action)) {
      return NextResponse.json({ message: "Action not relevant" }, { status: 200 });
    }

    const owner = repository.owner.login;
    const repo = repository.name;
    const pullNumber = pull_request.number;
    const commitId = pull_request.head.sha;

    console.log(`Processing PR #${pullNumber} from ${owner}/${repo}`);

    // Get installation access token
    let accessToken: string;
    try {
      accessToken = await getInstallationAccessToken(installation.id);
    } catch (error) {
      console.error("Failed to get installation access token:", error);
      return NextResponse.json(
        { error: "Failed to authenticate with GitHub" },
        { status: 500 }
      );
    }

    // Get files changed in the PR
    let prFiles;
    try {
      prFiles = await getPRFiles(owner, repo, pullNumber, accessToken);
    } catch (error) {
      console.error("Failed to get PR files:", error);
      return NextResponse.json({ error: "Failed to get PR files" }, { status: 500 });
    }

    // Scan each file
    const allFindings: Array<{
      filename: string;
      line: number;
      severity: "error" | "warning" | "info";
      message: string;
      rule?: string;
    }> = [];

    for (const file of prFiles) {
      if (file.patch) {
        // Extract added/changed lines from unified diff patch
        const patchLines = file.patch.split("\n");
        let currentLine = 0;
        const addedLines: { line: number; content: string }[] = [];

        for (const patchLine of patchLines) {
          const match = patchLine.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
          if (match) {
            currentLine = parseInt(match[2], 10) - 1;
          } else if (patchLine.startsWith("+") && !patchLine.startsWith("+++")) {
            const content = patchLine.substring(1);
            addedLines.push({ line: currentLine, content });
            currentLine++;
          } else if (patchLine.startsWith("-")) {
            currentLine--;
          } else if (!patchLine.startsWith("\\") && !patchLine.startsWith("+++")) {
            currentLine++;
          }
        }

        // Scan added lines
        for (const added of addedLines) {
          const findings = scanFileContent(added.content, file.filename);
          for (const finding of findings) {
            allFindings.push({
              filename: file.filename,
              ...finding,
              line: added.line + finding.line - 1,
            });
          }
        }
      }
    }

    // Generate summary comment
    const errorCount = allFindings.filter((f) => f.severity === "error").length;
    const warningCount = allFindings.filter((f) => f.severity === "warning").length;
    const infoCount = allFindings.filter((f) => f.severity === "info").length;

    let comment: string;
    if (allFindings.length === 0) {
      comment = `## ✅ VibeChecker Scan Complete

No issues found in PR #${pullNumber}.

---
*Scanned by [VibeChecker](${process.env.VIBECHECKER_URL || "https://vibecheck.dev"}) GitHub App*`;
    } else {
      comment = `## 🔍 VibeChecker Scan Results

Found **${allFindings.length}** issue(s) in PR #${pullNumber}:\n`;
      if (errorCount > 0) comment += `- 🔴 ${errorCount} error(s)\n`;
      if (warningCount > 0) comment += `- 🟡 ${warningCount} warning(s)\n`;
      if (infoCount > 0) comment += `- ℹ️ ${infoCount} info item(s)\n`;

      comment += "\n### Findings\n\n";

      // Group by file
      const byFile = new Map<string, typeof allFindings>();
      for (const finding of allFindings) {
        const existing = byFile.get(finding.filename) || [];
        existing.push(finding);
        byFile.set(finding.filename, existing);
      }

      for (const [filename, findings] of byFile) {
        comment += `#### ${filename}\n`;
        for (const finding of findings) {
          const icon = finding.severity === "error" ? "🔴" : finding.severity === "warning" ? "🟡" : "ℹ️";
          comment += `- ${icon} \`L${finding.line}\`: ${finding.message}${finding.rule ? ` [\`${finding.rule}\`]` : ""}\n`;
        }
        comment += "\n";
      }

      comment += `---\n*Scanned by [VibeChecker](${process.env.VIBECHECKER_URL || "https://vibecheck.dev"}) GitHub App*`;
    }

    await postPRComment(owner, repo, pullNumber, comment, accessToken);

    return NextResponse.json({ success: true, findings: allFindings.length });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "VibeChecker GitHub Webhook",
    version: "1.0.0",
  });
}