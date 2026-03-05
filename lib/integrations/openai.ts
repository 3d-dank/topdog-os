export interface DailyUsage {
  date: string
  totalTokens: number
  promptTokens: number
  completionTokens: number
  estimatedCost: number
}

export interface WeeklyCostResult {
  daily: DailyUsage[]
  weeklyTotal: number
  note?: string
}

// Approximate cost per 1K tokens (blended GPT-4o estimate)
const COST_PER_1K_TOKENS = 0.005

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export async function getDailyCost(date: string): Promise<DailyUsage> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { date, totalTokens: 0, promptTokens: 0, completionTokens: 0, estimatedCost: 0 }
  }

  try {
    const res = await fetch(`https://api.openai.com/v1/usage?date=${date}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      console.warn(`[OpenAI] Usage API returned ${res.status} for ${date}`)
      return { date, totalTokens: 0, promptTokens: 0, completionTokens: 0, estimatedCost: 0 }
    }

    const data = await res.json()
    const items: Array<{ n_context_tokens_total: number; n_generated_tokens_total: number }> =
      data?.data ?? []

    const promptTokens = items.reduce(
      (sum: number, item) => sum + (item.n_context_tokens_total ?? 0),
      0
    )
    const completionTokens = items.reduce(
      (sum: number, item) => sum + (item.n_generated_tokens_total ?? 0),
      0
    )
    const totalTokens = promptTokens + completionTokens
    const estimatedCost = (totalTokens / 1000) * COST_PER_1K_TOKENS

    return { date, totalTokens, promptTokens, completionTokens, estimatedCost }
  } catch (err) {
    console.warn(`[OpenAI] Error fetching usage for ${date}:`, err)
    return { date, totalTokens: 0, promptTokens: 0, completionTokens: 0, estimatedCost: 0 }
  }
}

export async function getWeeklyCost(): Promise<WeeklyCostResult> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return {
      daily: [],
      weeklyTotal: 0,
      note: 'Connect OpenAI billing API',
    }
  }

  try {
    const dates: string[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      dates.push(formatDate(d))
    }

    const daily = await Promise.all(dates.map((d) => getDailyCost(d)))
    const weeklyTotal = daily.reduce((sum, d) => sum + d.estimatedCost, 0)

    return { daily, weeklyTotal }
  } catch (err) {
    console.error('[OpenAI] Error fetching weekly cost:', err)
    return {
      daily: [],
      weeklyTotal: 0,
      note: 'Connect OpenAI billing API',
    }
  }
}
