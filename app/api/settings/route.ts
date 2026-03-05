import { NextRequest, NextResponse } from 'next/server'
import { writeSettings } from '@/lib/settings'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    writeSettings(body)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[Settings] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
