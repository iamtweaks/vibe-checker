import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_FILE = '/tmp/vibe-checker-stats.json'

interface Stats {
  totalScans: number
  uniqueSites: Set<string>
  lastUpdated: string
}

function getStats(): { totalScans: number; uniqueSites: number; sites: string[] } {
  try {
    if (existsSync(DATA_FILE)) {
      const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
      return {
        totalScans: data.totalScans || 0,
        uniqueSites: data.uniqueSites || 0,
        sites: data.sites || []
      }
    }
  } catch (e) {
    console.error('Error reading stats:', e)
  }
  return { totalScans: 0, uniqueSites: 0, sites: [] }
}

function saveStats(stats: { totalScans: number; sites: string[] }) {
  try {
    const data = {
      ...stats,
      uniqueSites: stats.sites.length,
      lastUpdated: new Date().toISOString()
    }
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('Error saving stats:', e)
  }
}

export async function GET() {
  const stats = getStats()
  return NextResponse.json(stats)
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 })
    }

    // Only count unique sites (normalize the URL)
    let normalizedUrl = url.toLowerCase().trim()
    // Remove trailing slash
    normalizedUrl = normalizedUrl.replace(/\/$/, '')
    // Extract origin for websites, repo full name for github
    let siteKey = normalizedUrl
    if (normalizedUrl.includes('github.com')) {
      // Extract owner/repo from github URL
      const match = normalizedUrl.match(/github\.com\/([^\/]+\/[^\/]+)/)
      siteKey = match ? match[1] : normalizedUrl
    } else {
      // Extract origin for websites
      try {
        const u = new URL(normalizedUrl)
        siteKey = u.origin
      } catch {
        siteKey = normalizedUrl
      }
    }

    const stats = getStats()
    
    // Only add if not already in the list
    if (!stats.sites.includes(siteKey)) {
      stats.sites.push(siteKey)
      stats.totalScans += 1
      saveStats(stats)
    }

    return NextResponse.json({
      totalScans: stats.totalScans,
      uniqueSites: stats.sites.length,
      sites: stats.sites
    })
  } catch (e) {
    console.error('Error incrementing stats:', e)
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 })
  }
}
