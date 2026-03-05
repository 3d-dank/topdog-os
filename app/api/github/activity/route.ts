import { NextRequest, NextResponse } from 'next/server'
import { getAllRepoActivity, type Commit } from '@/lib/integrations/github'

// Simple in-memory cache
const cache: { data: Commit[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') ?? '7', 10)

    // Check cache (only for default 7-day query)
    const now = Date.now()
    if (days === 7 && cache.data && now - cache.timestamp < CACHE_TTL) {
      return NextResponse.json({ commits: cache.data, cached: true })
    }

    const commits = await getAllRepoActivity(days)

    // Update cache for 7-day queries
    if (days === 7) {
      cache.data = commits
      cache.timestamp = now
    }

    return NextResponse.json({ commits, cached: false })
  } catch (err) {
    console.error('[API] /api/github/activity error:', err)
    return NextResponse.json(
      { error: 'GitHub API unavailable', data: [] },
      { status: 200 } // Return 200 so page doesn't break
    )
  }
}
