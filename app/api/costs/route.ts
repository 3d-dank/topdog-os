import { NextResponse } from 'next/server'
import { getCostSummary, readCosts, getLastChecked } from '@/lib/costs'

export async function GET() {
  try {
    const summary = getCostSummary()
    const { thresholds, entries } = readCosts()
    const lastChecked = getLastChecked()
    return NextResponse.json({ summary, thresholds, entries, lastChecked })
  } catch (err) {
    console.error('[GET /api/costs]', err)
    return NextResponse.json({ error: 'Failed to read costs' }, { status: 500 })
  }
}
