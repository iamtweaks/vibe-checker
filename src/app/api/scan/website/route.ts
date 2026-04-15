import { NextRequest, NextResponse } from 'next/server'
import { scanWebsite } from '@/lib/scanners/website'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    
    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }
    
    const result = await scanWebsite(url)
    
    return NextResponse.json({
      scanId: crypto.randomUUID(),
      type: 'website',
      targetUrl: url,
      status: 'completed',
      findings: result.findings,
      severityCounts: result.severityCounts,
      scannedAt: new Date().toISOString(),
      scanDuration: result.scanDuration,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Scan failed' },
      { status: 500 }
    )
  }
}
