import { NextResponse } from 'next/server'
import {
  addCostEntry,
  getCostSummary,
  checkThresholds,
  sendCostAlerts,
  updateLastChecked,
} from '@/lib/costs'
import { fetchOpenAIUsage } from '@/lib/integrations/openai-billing'
import { fetchAnthropicUsage } from '@/lib/integrations/anthropic-billing'

export async function POST() {
  try {
    const today = new Date().toISOString().slice(0, 10)

    // Fetch live usage from both providers in parallel
    const [openaiResult, anthropicResult] = await Promise.all([
      fetchOpenAIUsage(today),
      fetchAnthropicUsage(today),
    ])

    const openaiStatus = openaiResult.error ? 'unavailable' : 'live'
    const anthropicStatus = anthropicResult.error ? 'unavailable' : 'live'

    // Save non-zero live results to cost store
    if (openaiStatus === 'live' && openaiResult.totalCost > 0) {
      addCostEntry({
        provider: 'openai',
        costUsd: openaiResult.totalCost,
        source: 'api',
        note: `Auto-fetched for ${today}`,
      })
    }

    if (anthropicStatus === 'live' && anthropicResult.totalCost > 0) {
      addCostEntry({
        provider: 'anthropic',
        costUsd: anthropicResult.totalCost,
        source: 'api',
        note: `Auto-fetched for ${today}`,
      })
    }

    updateLastChecked()

    // Get fresh summary after saving
    const summary = getCostSummary()
    const { triggered, alerts } = checkThresholds()

    // Fire Telegram alerts for any breaches
    if (triggered) {
      await sendCostAlerts(alerts, summary)
    }

    return NextResponse.json({
      summary,
      thresholdsChecked: true,
      alertsFired: alerts,
      openaiStatus,
      anthropicStatus,
      openaiError: openaiResult.error,
      anthropicError: anthropicResult.error,
    })
  } catch (err) {
    console.error('[POST /api/costs/check]', err)
    return NextResponse.json({ error: 'Cost check failed' }, { status: 500 })
  }
}
