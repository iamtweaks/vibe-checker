import { createHash, timingSafeEqual } from 'node:crypto'
import { prisma } from './db'
import type { ScanAPIResponse } from './types'

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

export async function persistScan(scan: ScanAPIResponse): Promise<void> {
  await prisma.scan.create({
    data: {
      id: scan.scanId,
      targetUrl: scan.targetUrl,
      scanType: scan.type,
      findingsJson: JSON.stringify(scan.findings),
      severityCounts: JSON.stringify(scan.severityCounts),
      createdAt: new Date(scan.scannedAt),
    },
  })
}

export function toScanAPIResponse(scan: {
  id: string
  targetUrl: string
  scanType: string
  findingsJson: string
  severityCounts: string
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
