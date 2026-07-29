/**
 * Get Scan Result by ID
 * GET /api/scan/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildCorsHeaders } from '@/lib/security-headers'
import { redactTargetUrl } from '@/lib/redaction'
import { getScanById } from '@/lib/scan-store'



export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: buildCorsHeaders(request) })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Scan ID is required', code: 'ID_REQUIRED' },
      { status: 400, headers: buildCorsHeaders(request) }
    )
  }

  // Validate conservative ID format before querying storage.
  const idRegex = /^[a-zA-Z0-9_-]{8,64}$/
  if (!idRegex.test(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid scan ID format', code: 'INVALID_ID' },
      { status: 400, headers: buildCorsHeaders(request) }
    )
  }

  const scan = await getScanById(id)

  if (!scan) {
    return NextResponse.json(
      { success: false, error: 'Scan not found', code: 'SCAN_NOT_FOUND' },
      { status: 404, headers: buildCorsHeaders(request) }
    )
  }

  return NextResponse.json({
    success: true,
    ...scan,
    targetUrl: redactTargetUrl(scan.targetUrl),
  }, { headers: buildCorsHeaders(request) })
}
