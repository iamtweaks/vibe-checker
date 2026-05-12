/**
 * Get Scan Result by ID
 * GET /api/scan/[id]
 */

import { NextRequest, NextResponse } from 'next/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400',
}

// Reuse the global scan store from parent route
function getScanStore(): Map<string, any> {
  if (!(globalThis as any).__vibechecker_scan_store) {
    (globalThis as any).__vibechecker_scan_store = new Map()
  }
  return (globalThis as any).__vibechecker_scan_store
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

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { success: false, error: 'Invalid scan ID format', code: 'INVALID_ID' },
      { status: 400, headers: corsHeaders }
    )
  }

  const scan = getScanStore().get(id)

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