import { NextRequest, NextResponse } from 'next/server'
import { validateGitHubUrl, parseGitHubUrl, checkRateLimit } from '@/lib/validation'
import { scanGitHubRepo } from '@/lib/scanners/github'
import { prisma } from '@/lib/db'
import type { ScanAPIResponse, SeverityCounts, Finding } from '@/lib/types'

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

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
          error: 'Too many requests. Please wait before trying again.',
          code: 'RATE_LIMITED',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Retry-After': String(Math.ceil((rateLimitResult.retryAfter || 1000) / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    // Parse request body
    let url: string | undefined
    try {
      const body = await request.json()
      url = body?.url
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body', code: 'INVALID_JSON' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required', code: 'URL_REQUIRED' },
        { status: 400, headers: corsHeaders }
      )
    }

    const validation = validateGitHubUrl(url.trim())
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, code: validation.code },
        { status: 400, headers: corsHeaders }
      )
    }

    // Extract GitHub token from header if provided
    const authHeader = request.headers.get('authorization')
    const githubToken = authHeader?.replace('Bearer ', '')

    const result = await scanGitHubRepo(url.trim(), githubToken)

    const response: ScanAPIResponse = {
      scanId: crypto.randomUUID(),
      type: 'github',
      targetUrl: url.trim(),
      status: 'completed',
      findings: result.findings,
      severityCounts: result.severityCounts as SeverityCounts,
      scannedAt: new Date().toISOString(),
      scannedFiles: result.scannedFiles,
      scanDuration: result.scanDuration,
    }

    // Persist scan to database
    await prisma.scan.create({
      data: {
        targetUrl: url.trim(),
        scanType: 'github',
        findingsJson: JSON.stringify(result.findings as Finding[]),
        severityCounts: JSON.stringify(result.severityCounts),
      },
    })

    return NextResponse.json(response, {
      headers: {
        ...corsHeaders,
        'X-RateLimit-Remaining': String(rateLimitResult.remainingRequests ?? 0),
      },
    })

  } catch (error: any) {
    console.error('GitHub scan error:', error)

    // Handle specific error types with appropriate status codes
    if (error.message?.includes('Invalid GitHub URL')) {
      return NextResponse.json(
        { error: 'Invalid GitHub repository URL', code: 'INVALID_URL' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (error.message?.includes('not found') || error.message?.includes('404')) {
      return NextResponse.json(
        { error: 'Repository not found or is not public', code: 'REPO_NOT_FOUND' },
        { status: 404, headers: corsHeaders }
      )
    }

    if (error.message?.includes('Could not access')) {
      return NextResponse.json(
        { error: 'Could not access repository. Make sure it exists and is public.', code: 'ACCESS_DENIED' },
        { status: 403, headers: corsHeaders }
      )
    }

    if (error.message?.includes('rate limit') || error.status === 403) {
      return NextResponse.json(
        { error: 'GitHub API rate limit exceeded. Try again later or provide a GitHub token.', code: 'GITHUB_RATE_LIMIT' },
        { status: 429, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Scan failed. Please try again.', code: 'SCAN_FAILED' },
      { status: 500, headers: corsHeaders }
    )
  }
}
