-- CreateTable
CREATE TABLE "Target" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "normalizedUrl" TEXT NOT NULL,
    "displayUrl" TEXT NOT NULL,
    "firstScannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastScannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scanCount" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ScanFinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scanId" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "filePath" TEXT,
    "lineNumber" INTEGER,
    "snippet" TEXT,
    "remediation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScanFinding_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "Scan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Scan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "targetId" TEXT,
    "targetUrl" TEXT NOT NULL,
    "scanType" TEXT NOT NULL,
    "findingsJson" TEXT NOT NULL,
    "severityCounts" TEXT NOT NULL,
    "scannedFiles" INTEGER,
    "scannedUrls" INTEGER,
    "scanDuration" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Scan_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Target" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Scan" ("createdAt", "findingsJson", "id", "scanType", "severityCounts", "targetUrl") SELECT "createdAt", "findingsJson", "id", "scanType", "severityCounts", "targetUrl" FROM "Scan";
DROP TABLE "Scan";
ALTER TABLE "new_Scan" RENAME TO "Scan";
CREATE INDEX "Scan_targetId_idx" ON "Scan"("targetId");
CREATE INDEX "Scan_targetUrl_idx" ON "Scan"("targetUrl");
CREATE INDEX "Scan_scanType_idx" ON "Scan"("scanType");
CREATE INDEX "Scan_createdAt_idx" ON "Scan"("createdAt");

-- Backfill unique scan targets from historical scans. Existing scan rows keep
-- their own scan records, but repeated URLs/repos now point at one Target row.
INSERT OR IGNORE INTO "Target" (
    "id",
    "type",
    "normalizedUrl",
    "displayUrl",
    "firstScannedAt",
    "lastScannedAt",
    "scanCount"
)
SELECT
    "scanType" || ':' || rtrim(lower("targetUrl"), '/') AS "id",
    "scanType" AS "type",
    rtrim(lower("targetUrl"), '/') AS "normalizedUrl",
    min("targetUrl") AS "displayUrl",
    min("createdAt") AS "firstScannedAt",
    max("createdAt") AS "lastScannedAt",
    count(*) AS "scanCount"
FROM "Scan"
GROUP BY "scanType", rtrim(lower("targetUrl"), '/');

UPDATE "Scan"
SET "targetId" = "scanType" || ':' || rtrim(lower("targetUrl"), '/')
WHERE "targetId" IS NULL;

-- Backfill structured findings from the historical JSON blob where SQLite JSON1
-- is available. The original findingsJson column remains as a compatibility copy.
INSERT OR IGNORE INTO "ScanFinding" (
    "id",
    "scanId",
    "ruleId",
    "severity",
    "title",
    "description",
    "filePath",
    "lineNumber",
    "snippet",
    "remediation",
    "createdAt"
)
SELECT
    "Scan"."id" || ':' || json_each.key AS "id",
    "Scan"."id" AS "scanId",
    COALESCE(json_extract(json_each.value, '$.ruleId'), 'UNKNOWN') AS "ruleId",
    COALESCE(json_extract(json_each.value, '$.severity'), 'info') AS "severity",
    COALESCE(json_extract(json_each.value, '$.title'), 'Untitled finding') AS "title",
    COALESCE(json_extract(json_each.value, '$.description'), '') AS "description",
    json_extract(json_each.value, '$.filePath') AS "filePath",
    COALESCE(
      json_extract(json_each.value, '$.lineNumber'),
      json_extract(json_each.value, '$.line')
    ) AS "lineNumber",
    COALESCE(
      json_extract(json_each.value, '$.snippet'),
      json_extract(json_each.value, '$.codeSnippet'),
      json_extract(json_each.value, '$.code')
    ) AS "snippet",
    COALESCE(json_extract(json_each.value, '$.remediation'), '') AS "remediation",
    "Scan"."createdAt" AS "createdAt"
FROM "Scan", json_each("Scan"."findingsJson")
WHERE json_valid("Scan"."findingsJson");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Target_type_idx" ON "Target"("type");

-- CreateIndex
CREATE INDEX "Target_lastScannedAt_idx" ON "Target"("lastScannedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Target_type_normalizedUrl_key" ON "Target"("type", "normalizedUrl");

-- CreateIndex
CREATE INDEX "ScanFinding_scanId_idx" ON "ScanFinding"("scanId");

-- CreateIndex
CREATE INDEX "ScanFinding_ruleId_idx" ON "ScanFinding"("ruleId");

-- CreateIndex
CREATE INDEX "ScanFinding_severity_idx" ON "ScanFinding"("severity");

-- CreateIndex
CREATE INDEX "ScanFinding_createdAt_idx" ON "ScanFinding"("createdAt");
