import { NextResponse } from 'next/server'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const DATA_FILE = process.env.STATS_FILE_PATH || join(process.cwd(), '.stats.json')

interface Stats {
  totalScans: number
  uniqueSites: number
  sites: string[]
  lastUpdated: string
}

function getStats(): Stats {
  try {
    if (existsSync(DATA_FILE)) {
      const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'))
      return {
        totalScans: data.totalScans || 0,
        uniqueSites: data.uniqueSites || 0,
        sites: data.sites || [],
        lastUpdated: data.lastUpdated || ''
      }
    }
  } catch (e) {
    console.error('Error reading stats:', e)
  }
  return { totalScans: 0, uniqueSites: 0, sites: [], lastUpdated: '' }
}

function saveStats(stats: Stats) {
  try {
    writeFileSync(DATA_FILE, JSON.stringify(stats, null, 2))
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
      stats.uniqueSites = stats.sites.length
      stats.lastUpdated = new Date().toISOString()
      saveStats(stats)
    }

    return NextResponse.json({
      totalScans: stats.totalScans,
      uniqueSites: stats.uniqueSites,
      sites: stats.sites
    })
  } catch (e) {
    console.error('Error incrementing stats:', e)
    return NextResponse.json({ error: 'Failed to update stats' }, { status: 500 })
  }
}
