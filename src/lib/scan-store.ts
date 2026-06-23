import { createHash, timingSafeEqual } from 'node:crypto'
import { prisma } from './db'
import type { Finding, ScanAPIResponse } from './types'

const MAX_SCAN_LIST_LIMIT = 50

function parseAllowedApiKeyHashes(): string[] {
  return (process.env.VIBECHECKER_API_KEY_HASHES || '')
    .split(',')
    .map((hash) => hash.trim())
    .filter(Boolean)
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest()
}

function safeEqualHexHash(expectedHex: string, actual: Buffer): boolean {
  const expected = Buffer.from(expectedHex, 'hex')
  if (expected.length !== actual.length) return false
  return timingSafeEqual(expected, actual)
}

export function isAdminApiKey(apiKey: string | null): boolean {
  if (!apiKey) return false
  const allowedHashes = parseAllowedApiKeyHashes()
  if (allowedHashes.length === 0) return false

  const actual = sha256(apiKey)
  return allowedHashes.some((expectedHash) => safeEqualHexHash(expectedHash, actual))
}

export function getApiKeyFromHeaders(headers: Headers): string | null {
  const xApiKey = headers.get('x-api-key')
  if (xApiKey) return xApiKey

  const authHeader = headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }

  return null
}

export function normalizeScanTarget(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim())
    parsed.hash = ''
    parsed.search = ''
    parsed.hostname = parsed.hostname.toLowerCase()
    parsed.pathname = parsed.pathname.replace(/\/$/, '') || ''
    return parsed.toString().replace(/\/$/, '')
  } catch {
    return rawUrl.trim().toLowerCase().replace(/\/$/, '')
  }
}

function toFindingCreate(finding: Finding) {
  return {
    ruleId: finding.ruleId,
    severity: finding.severity,
    title: finding.title,
    description: finding.description,
    filePath: finding.filePath ?? null,
    lineNumber: finding.lineNumber ?? null,
    snippet: finding.snippet ?? null,
    remediation: finding.remediation,
  }
}

export async function persistScan(scan: ScanAPIResponse): Promise<void> {
  const normalizedUrl = normalizeScanTarget(scan.targetUrl)
  const now = new Date(scan.scannedAt)

  await prisma.$transaction(async (tx) => {
    const target = await tx.target.upsert({
      where: {
        type_normalizedUrl: {
          type: scan.type,
          normalizedUrl,
        },
      },
      create: {
        type: scan.type,
        normalizedUrl,
        displayUrl: scan.targetUrl,
        firstScannedAt: now,
        lastScannedAt: now,
        scanCount: 1,
      },
      update: {
        displayUrl: scan.targetUrl,
        lastScannedAt: now,
        scanCount: { increment: 1 },
      },
    })

    await tx.scan.create({
      data: {
        id: scan.scanId,
        targetId: target.id,
        targetUrl: scan.targetUrl,
        scanType: scan.type,
        findingsJson: JSON.stringify(scan.findings),
        severityCounts: JSON.stringify(scan.severityCounts),
        scannedFiles: scan.scannedFiles ?? null,
        scannedUrls: scan.scannedUrls ?? null,
        scanDuration: scan.scanDuration ?? null,
        createdAt: now,
        findings: {
          create: scan.findings.map((finding) => toFindingCreate(finding)),
        },
      },
    })
  })
}

export function toScanAPIResponse(scan: {
  id: string
  targetUrl: string
  scanType: string
  findingsJson: string
  severityCounts: string
  scannedFiles?: number | null
  scannedUrls?: number | null
  scanDuration?: number | null
  createdAt: Date
}): ScanAPIResponse {
  return {
    scanId: scan.id,
    type: scan.scanType === 'github' ? 'github' : 'website',
    targetUrl: scan.targetUrl,
    status: 'completed',
    findings: JSON.parse(scan.findingsJson),
    severityCounts: JSON.parse(scan.severityCounts),
    scannedAt: scan.createdAt.toISOString(),
    scannedFiles: scan.scannedFiles ?? undefined,
    scannedUrls: scan.scannedUrls ?? undefined,
    scanDuration: scan.scanDuration ?? undefined,
  }
}

export async function getScanById(id: string): Promise<ScanAPIResponse | null> {
  const scan = await prisma.scan.findUnique({ where: { id } })
  return scan ? toScanAPIResponse(scan) : null
}

export async function listRecentScans(limit: number): Promise<ScanAPIResponse[]> {
  const safeLimit = Math.max(1, Math.min(limit, MAX_SCAN_LIST_LIMIT))
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: 'desc' },
    take: safeLimit,
  })
  return scans.map(toScanAPIResponse)
}
