const ANTHROPIC_PRICING: Record<
  string,
  { input: number; output: number; cacheRead: number; cacheWrite: number }
> = {
  'claude-sonnet-4-6': {
    input: 3 / 1_000_000,
    output: 15 / 1_000_000,
    cacheRead: 0.3 / 1_000_000,
    cacheWrite: 3.75 / 1_000_000,
  },
  'claude-haiku-3-5': {
    input: 0.8 / 1_000_000,
    output: 4 / 1_000_000,
    cacheRead: 0.08 / 1_000_000,
    cacheWrite: 1 / 1_000_000,
  },
  'claude-opus-4': {
    input: 15 / 1_000_000,
    output: 75 / 1_000_000,
    cacheRead: 1.5 / 1_000_000,
    cacheWrite: 18.75 / 1_000_000,
  },
}

function computeAnthropicCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens = 0,
  cacheWriteTokens = 0
): number {
  const pricing = ANTHROPIC_PRICING[model] ?? ANTHROPIC_PRICING['claude-sonnet-4-6']
  return (
    inputTokens * pricing.input +
    outputTokens * pricing.output +
    cacheReadTokens * pricing.cacheRead +
    cacheWriteTokens * pricing.cacheWrite
  )
}

interface ModelUsage {
  tokens: number
  cost: number
}

interface AnthropicUsageResult {
  totalCost: number
  totalTokens: number
  byModel: Record<string, ModelUsage>
  error?: string
}

export async function fetchAnthropicUsage(date: string): Promise<AnthropicUsageResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      totalCost: 0,
      totalTokens: 0,
      byModel: {},
      error: 'ANTHROPIC_API_KEY not set',
    }
  }

  try {
    // Anthropic usage API: GET /v1/usage (aggregated) or via workspace billing
    const startDate = date
    const nextDate = new Date(new Date(date).getTime() + 86400000).toISOString().slice(0, 10)

    const res = await fetch(
      `https://api.anthropic.com/v1/usage?start_time=${startDate}T00:00:00Z&end_time=${nextDate}T00:00:00Z`,
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    )

    if (res.ok) {
      const data = await res.json()
      const byModel: Record<string, ModelUsage> = {}
      let totalCost = 0
      let totalTokens = 0

      // Response shape may vary — handle both array and paginated
      const items = data.data ?? data.usage ?? []
      if (Array.isArray(items)) {
        for (const item of items) {
          const model: string = item.model ?? 'claude-sonnet-4-6'
          const inputTokens: number = item.input_tokens ?? 0
          const outputTokens: number = item.output_tokens ?? 0
          const cacheReadTokens: number = item.cache_read_input_tokens ?? 0
          const cacheWriteTokens: number = item.cache_creation_input_tokens ?? 0
          const cost = computeAnthropicCost(
            model,
            inputTokens,
            outputTokens,
            cacheReadTokens,
            cacheWriteTokens
          )
          const tokens = inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens
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

    return {
      totalCost: 0,
      totalTokens: 0,
      byModel: {},
      error: `Anthropic usage API unavailable (status ${res.status}) — check console.anthropic.com`,
    }
  } catch (err) {
    console.error('[Anthropic Billing] Error:', err)
    return {
      totalCost: 0,
      totalTokens: 0,
      byModel: {},
      error: 'Anthropic usage API unavailable — check console.anthropic.com',
    }
  }
}
