import { NextRequest, NextResponse } from 'next/server'
import { readActivity, addActivity } from '@/lib/activity'
import type { ActivityType } from '@/lib/activity'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const items = readActivity().slice(0, limit)
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { ts, text, type, appId } = body as {
    ts?: string
    text: string
    type: ActivityType
    appId: string
  }
  if (!text || !type || !appId) {
    return NextResponse.json({ error: 'text, type, appId required' }, { status: 400 })
  }
  const entry = addActivity({ ts: ts ?? new Date().toISOString(), text, type, appId })
  return NextResponse.json(entry, { status: 201 })
}
