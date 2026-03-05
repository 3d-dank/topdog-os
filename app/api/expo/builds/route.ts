import { NextResponse } from 'next/server'
import { getAllBuilds } from '@/lib/integrations/expo'

export async function GET() {
  try {
    const builds = await getAllBuilds()
    return NextResponse.json({ builds })
  } catch (err) {
    console.error('[API] /api/expo/builds error:', err)
    return NextResponse.json(
      { error: 'EAS API unavailable', builds: [] },
      { status: 200 }
    )
  }
}
