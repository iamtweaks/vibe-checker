/**
 * Get Scan Result by ID
 * GET /api/scan/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { getScanById } from '@/lib/scan-store'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400',
}


export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Scan ID is required', code: 'ID_REQUIRED' },
      { status: 400, headers: corsHeaders }
    )
  }

  // Validate conservative ID format before querying storage.
  const idRegex = /^[a-zA-Z0-9_-]{8,64}$/
  if (!idRegex.test(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid scan ID format', code: 'INVALID_ID' },
      { status: 400, headers: corsHeaders }
    )
  }

  const scan = await getScanById(id)

  if (!scan) {
    return NextResponse.json(
      { success: false, error: 'Scan not found', code: 'SCAN_NOT_FOUND' },
      { status: 404, headers: corsHeaders }
    )
  }

  return NextResponse.json({
    success: true,
    ...scan,
  }, { headers: corsHeaders })
}