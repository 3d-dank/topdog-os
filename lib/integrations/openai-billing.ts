const PRICING: Record<string, { input: number; output: number; cacheRead: number }> = {
  'gpt-4o': { input: 2.5 / 1_000_000, output: 10 / 1_000_000, cacheRead: 1.25 / 1_000_000 },
  'gpt-4o-mini': { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000, cacheRead: 0.075 / 1_000_000 },
  'gpt-4-vision-preview': { input: 10 / 1_000_000, output: 30 / 1_000_000, cacheRead: 5 / 1_000_000 },
  'text-embedding-3-small': { input: 0.02 / 1_000_000, output: 0, cacheRead: 0 },
}

function computeCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens = 0
): number {
  const pricing = PRICING[model] ?? PRICING['gpt-4o']
  return (
    inputTokens * pricing.input +
    outputTokens * pricing.output +
    cacheReadTokens * pricing.cacheRead
  )
}

interface ModelUsage {
  tokens: number
  cost: number
}

interface OpenAIUsageResult {
  totalCost: number
  totalTokens: number
  byModel: Record<string, ModelUsage>
  error?: string
}

export async function fetchOpenAIUsage(date: string): Promise<OpenAIUsageResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      totalCost: 0,
      totalTokens: 0,
      byModel: {},
      error: 'OPENAI_API_KEY not set',
    }
  }

  try {
    // Try v1 usage API first
    const res = await fetch(`https://api.openai.com/v1/usage?date=${date}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (res.ok) {
      const data = await res.json()
      const byModel: Record<string, ModelUsage> = {}
      let totalCost = 0
      let totalTokens = 0

      // v1 usage API returns { data: [{ model, n_context_tokens_total, n_generated_tokens_total, ... }] }
      if (data.data && Array.isArray(data.data)) {
        for (const item of data.data) {
          const model: string = item.snapshot_id ?? item.model ?? 'gpt-4o'
          const inputTokens: number = item.n_context_tokens_total ?? 0
          const outputTokens: number = item.n_generated_tokens_total ?? 0
          const cost = computeCost(model, inputTokens, outputTokens)
          const tokens = inputTokens + outputTokens
          byModel[model] = {
            tokens: (byModel[model]?.tokens ?? 0) + tokens,
            cost: (byModel[model]?.cost ?? 0) + cost,
          }
          totalCost += cost
          totalTokens += tokens
        }
      }

      return { totalCost, totalTokens, byModel }
    }

    // Fallback: billing usage dashboard API
    if (res.status === 404 || res.status === 401) {
      const nextDate = new Date(new Date(date).getTime() + 86400000)
        .toISOString()
        .slice(0, 10)
      const billingRes = await fetch(
        `https://api.openai.com/dashboard/billing/usage?start_date=${date}&end_date=${nextDate}`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (billingRes.ok) {
        const billingData = await billingRes.json()
        // billing API returns { total_usage: cents, daily_costs: [...] }
        const totalCost = (billingData.total_usage ?? 0) / 100 // convert cents to dollars
        return { totalCost, totalTokens: 0, byModel: {} }
      }
    }

    return {
      totalCost: 0,
      totalTokens: 0,
      byModel: {},
      error: 'OpenAI usage API unavailable — check dashboard.openai.com/usage',
    }
  } catch (err) {
    console.error('[OpenAI Billing] Error:', err)
    return {
      totalCost: 0,
      totalTokens: 0,
      byModel: {},
      error: 'OpenAI usage API unavailable — check dashboard.openai.com/usage',
    }
  }
}
