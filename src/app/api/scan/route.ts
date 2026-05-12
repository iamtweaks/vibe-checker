/**
 * Unified Scan API - Handles both GitHub and Website scans
 * POST /api/scan
 * GET /api/scan - List recent scans
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateGitHubUrl, validateWebsiteUrl, checkRateLimit } from '@/lib/validation'
import { scanGitHubRepo } from '@/lib/scanners/github'
import { scanWebsite } from '@/lib/scanners/website'
import type { ScanAPIResponse, SeverityCounts, ValidationResult } from '@/lib/types'

// In-memory scan store for GET /api/scan/[id]
// Use globalThis for cross-route access in Next.js
function getScanStore(): Map<string, ScanAPIResponse> {
  if (!(globalThis as any).__vibechecker_scan_store) {
    (globalThis as any).__vibechecker_scan_store = new Map<string, ScanAPIResponse>()
  }
  return (globalThis as any).__vibechecker_scan_store
}

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400',
}

// Valid scan types
const VALID_TYPES = ['github', 'website'] as const

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// API Key authentication (simple header-based)
function validateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const authHeader = request.headers.get('authorization')
  
  // If no key provided, allow (optional auth for public beta)
  if (!apiKey && !authHeader) {
    return true
  }
  
  // TODO: Validate against stored API keys in production
  // For now, accept any non-empty key
  return true
}

// GET /api/scan - List recent scans (optional, for debugging)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || '10', 10)
  
  const scans = Array.from(getScanStore().values())
    .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
    .slice(0, Math.min(limit, 100))
  
  return NextResponse.json({
    count: scans.length,
    scans,
  }, { headers: corsHeaders })
}

// POST /api/scan - Unified scan endpoint
export async function POST(request: NextRequest) {
  try {
    // Rate limiting using client IP as identifier
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('cf-connecting-ip') ||
                     'anonymous'
    const rateLimitResult = checkRateLimit(clientIp)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please wait before trying again.',
          code: 'RATE_LIMITED',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: { ...corsHeaders, 'Retry-After': String(Math.ceil((rateLimitResult.retryAfter || 1000) / 1000)) },
        }
      )
    }

    // Authenticate
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key', code: 'INVALID_API_KEY' },
        { status: 401, headers: corsHeaders }
      )
    }

    // Parse request body
    let url: string | undefined
    let type: string | undefined
    let githubToken: string | undefined

    try {
      const body = await request.json()
      url = body?.url
      type = body?.type
      githubToken = body?.apiKey // Reuse apiKey field as GitHub token
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body', code: 'INVALID_JSON' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate required fields
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required', code: 'URL_REQUIRED' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!type || typeof type !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Type is required (github or website)', code: 'TYPE_REQUIRED' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate type
    if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Must be "github" or "website"', code: 'INVALID_TYPE' },
        { status: 400, headers: corsHeaders }
      )
    }

    const trimmedUrl = url.trim()

    // Validate URL based on type
    let validation: ValidationResult
    if (type === 'github') {
      validation = validateGitHubUrl(trimmedUrl)
    } else {
      validation = validateWebsiteUrl(trimmedUrl)
    }

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error, code: validation.code },
        { status: 400, headers: corsHeaders }
      )
    }

    // Perform scan
    let result: { findings: any[], severityCounts: SeverityCounts, scannedFiles?: number, scannedUrls?: number, scanDuration?: number }

    if (type === 'github') {
      // Extract GitHub token from header if provided
      const authHeader = request.headers.get('authorization')
      const token = githubToken || authHeader?.replace('Bearer ', '')
      result = await scanGitHubRepo(trimmedUrl, token)
    } else {
      result = await scanWebsite(trimmedUrl)
    }

    const scanId = crypto.randomUUID()
    const response: ScanAPIResponse = {
      scanId,
      type: type as 'github' | 'website',
      targetUrl: trimmedUrl,
      status: 'completed',
      findings: result.findings,
      severityCounts: result.severityCounts as SeverityCounts,
      scannedAt: new Date().toISOString(),
      scannedUrls: result.scannedUrls,
      scannedFiles: result.scannedFiles,
      scanDuration: result.scanDuration,
    }

    // Store scan result for later retrieval by ID
    getScanStore().set(scanId, response)

    return NextResponse.json({
      success: true,
      ...response,
    }, {
      headers: {
        ...corsHeaders,
        'X-RateLimit-Remaining': String(rateLimitResult.remainingRequests ?? 0),
      },
    })

  } catch (error: any) {
    console.error('Scan error:', error.message)

    // Handle specific error types
    if (error.message?.includes('Invalid GitHub URL')) {
      return NextResponse.json(
        { success: false, error: 'Invalid GitHub repository URL', code: 'INVALID_URL' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (error.message?.includes('not found') || error.message?.includes('404')) {
      return NextResponse.json(
        { success: false, error: 'Repository not found or is not public', code: 'REPO_NOT_FOUND' },
        { status: 404, headers: corsHeaders }
      )
    }

    if (error.message?.includes('rate limit') || error.status === 403) {
      return NextResponse.json(
        { success: false, error: 'GitHub API rate limit exceeded. Try again later or provide a token.', code: 'GITHUB_RATE_LIMIT' },
        { status: 429, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Scan failed. Please try again.', code: 'SCAN_FAILED' },
      { status: 500, headers: corsHeaders }
    )
  }
}