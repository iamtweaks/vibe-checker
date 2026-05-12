import { NextRequest, NextResponse } from 'next/server'
import { validateWebsiteUrl, checkRateLimit } from '@/lib/validation'
import { scanWebsite } from '@/lib/scanners/website'
import { prisma } from '@/lib/db'
import type { ScanAPIResponse, SeverityCounts, Finding } from '@/lib/types'

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
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

    const validation = validateWebsiteUrl(url.trim())
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, code: validation.code },
        { status: 400, headers: corsHeaders }
      )
    }

    const result = await scanWebsite(url.trim())

    const response: ScanAPIResponse = {
      scanId: crypto.randomUUID(),
      type: 'website',
      targetUrl: url.trim(),
      status: 'completed',
      findings: result.findings,
      severityCounts: result.severityCounts as SeverityCounts,
      scannedAt: new Date().toISOString(),
      scannedUrls: result.scannedUrls,
      scanDuration: result.scanDuration,
    }

    // Persist scan to database
    await prisma.scan.create({
      data: {
        targetUrl: url.trim(),
        scanType: 'website',
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
    console.error('Website scan error:', error)

    // Handle specific error types with appropriate status codes
    if (error.message?.includes('Invalid URL') || error.message?.includes('Invalid URL format')) {
      return NextResponse.json(
        { error: 'Invalid website URL', code: 'INVALID_URL' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
      return NextResponse.json(
        { error: 'Could not fetch website. Make sure the URL is accessible and the site is online.', code: 'FETCH_FAILED' },
        { status: 502, headers: corsHeaders }
      )
    }

    if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Website took too long to respond. Try a faster or smaller website.', code: 'TIMEOUT' },
        { status: 504, headers: corsHeaders }
      )
    }

    if (error.message?.includes('DNS') || error.message?.includes('ENOTFOUND')) {
      return NextResponse.json(
        { error: 'Website not found. Check the URL for typos.', code: 'DNS_NOT_FOUND' },
        { status: 502, headers: corsHeaders }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Scan failed. Please try again.', code: 'SCAN_FAILED' },
      { status: 500, headers: corsHeaders }
    )
  }
}
