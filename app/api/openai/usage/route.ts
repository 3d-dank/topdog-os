import { NextResponse } from 'next/server'
import { getWeeklyCost } from '@/lib/integrations/openai'

export async function GET() {
  try {
    const result = await getWeeklyCost()
    return NextResponse.json(result)
  } catch (err) {
    console.error('[API] /api/openai/usage error:', err)
    return NextResponse.json(
      { daily: [], weeklyTotal: 0, note: 'Connect OpenAI billing API' },
      { status: 200 }
    )
  }
}
