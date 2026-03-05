import { NextRequest, NextResponse } from 'next/server'
import { readCosts, updateThresholds } from '@/lib/costs'

export async function GET() {
  try {
    const { thresholds } = readCosts()
    return NextResponse.json({ thresholds })
  } catch (err) {
    console.error('[GET /api/costs/thresholds]', err)
    return NextResponse.json({ error: 'Failed to read thresholds' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { thresholds } = body as { thresholds: Record<string, number> }
    if (!thresholds || typeof thresholds !== 'object') {
      return NextResponse.json({ error: 'Invalid thresholds payload' }, { status: 400 })
    }
    updateThresholds(thresholds)
    const { thresholds: updated } = readCosts()
    return NextResponse.json({ thresholds: updated })
  } catch (err) {
    console.error('[POST /api/costs/thresholds]', err)
    return NextResponse.json({ error: 'Failed to update thresholds' }, { status: 500 })
  }
}
