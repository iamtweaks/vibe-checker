import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const scanType = searchParams.get('type')

    const where: Record<string, unknown> = {}
    if (scanType === 'github' || scanType === 'website') {
      where.scanType = scanType
    }

    const scans = await prisma.scan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        targetUrl: true,
        scanType: true,
        severityCounts: true,
        createdAt: true,
      },
    })

    const total = await prisma.scan.count({ where })

    const scansWithParsedCounts = scans.map((scan: { severityCounts: string }) => ({
      ...scan,
      severityCounts: JSON.parse(scan.severityCounts),
    }))

    return NextResponse.json(
      {
        scans: scansWithParsedCounts,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + scans.length < total,
        },
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    console.error('History fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scan history', code: 'FETCH_FAILED' },
      { status: 500, headers: corsHeaders }
    )
  }
}
