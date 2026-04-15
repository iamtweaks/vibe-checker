import { NextRequest, NextResponse } from 'next/server'
import { scanGitHubRepo } from '@/lib/scanners/github'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }
    
    // Extract GitHub token from header if provided
    const authHeader = request.headers.get('authorization')
    const githubToken = authHeader?.replace('Bearer ', '')
    
    const result = await scanGitHubRepo(url, githubToken)
    
    return NextResponse.json({
      scanId: crypto.randomUUID(),
      type: 'github',
      targetUrl: url,
      status: 'completed',
      findings: result.findings,
      severityCounts: result.severityCounts,
      scannedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Scan failed' },
      { status: 500 }
    )
  }
}
