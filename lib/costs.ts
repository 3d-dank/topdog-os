import fs from 'fs'
import path from 'path'
import { sendTelegramAlert } from './telegram'

export interface CostEntry {
  id: string
  ts: string // ISO timestamp
  provider: 'openai' | 'anthropic' | 'digitalocean' | 'vercel' | 'expo'
  model?: string // 'gpt-4o', 'claude-sonnet-4-6', etc
  inputTokens?: number
  outputTokens?: number
  cacheReadTokens?: number
  costUsd: number
  source: 'api' | 'manual' | 'estimated'
  note?: string
}

export interface CostThresholds {
  dailyWarning: number
  dailyCritical: number
  weeklyWarning: number
  weeklyCritical: number
  monthlyWarning: number
  monthlyCritical: number
}

interface CostStore {
  thresholds: CostThresholds
  entries: CostEntry[]
  lastChecked: string | null
  totalThisMonth: number
  totalThisWeek: number
  totalToday: number
}

const DATA_PATH = path.join(process.cwd(), 'data', 'costs.json')

function readStore(): CostStore {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return {
      thresholds: {
        dailyWarning: 15,
        dailyCritical: 25,
        weeklyWarning: 60,
        weeklyCritical: 100,
        monthlyWarning: 200,
        monthlyCritical: 350,
      },
      entries: [],
      lastChecked: null,
      totalThisMonth: 0,
      totalThisWeek: 0,
      totalToday: 0,
    }
  }
}

function writeStore(store: CostStore): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(store, null, 2))
}

function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function startOfWeek(d: Date): Date {
  const day = d.getUTCDay() // 0=Sun
  const diff = d.getUTCDate() - day
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff))
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

export function readCosts(): {
  entries: CostEntry[]
  thresholds: CostThresholds
  totalToday: number
  totalThisWeek: number
  totalThisMonth: number
} {
  const store = readStore()
  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  const totalToday = store.entries
    .filter((e) => new Date(e.ts) >= todayStart)
    .reduce((sum, e) => sum + e.costUsd, 0)

  const totalThisWeek = store.entries
    .filter((e) => new Date(e.ts) >= weekStart)
    .reduce((sum, e) => sum + e.costUsd, 0)

  const totalThisMonth = store.entries
    .filter((e) => new Date(e.ts) >= monthStart)
    .reduce((sum, e) => sum + e.costUsd, 0)

  return {
    entries: store.entries,
    thresholds: store.thresholds,
    totalToday,
    totalThisWeek,
    totalThisMonth,
  }
}

export function addCostEntry(entry: Omit<CostEntry, 'id' | 'ts'>): CostEntry {
  const store = readStore()
  const newEntry: CostEntry = {
    ...entry,
    id: `cost_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ts: new Date().toISOString(),
  }
  store.entries.push(newEntry)
  writeStore(store)
  return newEntry
}

export function updateThresholds(thresholds: Partial<CostThresholds>): void {
  const store = readStore()
  store.thresholds = { ...store.thresholds, ...thresholds }
  writeStore(store)
}

export function getCostSummary(): {
  today: number
  yesterday: number
  thisWeek: number
  thisMonth: number
  byProvider: Record<string, number>
  byModel: Record<string, number>
  trend: 'up' | 'down' | 'stable'
  projectedMonthly: number
} {
  const store = readStore()
  const now = new Date()
  const todayStart = startOfDay(now)
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)

  const today = store.entries
    .filter((e) => new Date(e.ts) >= todayStart)
    .reduce((sum, e) => sum + e.costUsd, 0)

  const yesterday = store.entries
    .filter((e) => {
      const t = new Date(e.ts)
      return t >= yesterdayStart && t < todayStart
    })
    .reduce((sum, e) => sum + e.costUsd, 0)

  const thisWeek = store.entries
    .filter((e) => new Date(e.ts) >= weekStart)
    .reduce((sum, e) => sum + e.costUsd, 0)

  const thisMonth = store.entries
    .filter((e) => new Date(e.ts) >= monthStart)
    .reduce((sum, e) => sum + e.costUsd, 0)

  const byProvider: Record<string, number> = {}
  const byModel: Record<string, number> = {}

  for (const e of store.entries) {
    if (new Date(e.ts) >= monthStart) {
      byProvider[e.provider] = (byProvider[e.provider] ?? 0) + e.costUsd
      if (e.model) {
        byModel[e.model] = (byModel[e.model] ?? 0) + e.costUsd
      }
    }
  }

  // Projected monthly: daily average × 30 based on month so far
  const daysIntoMonth = Math.max(1, (now.getTime() - monthStart.getTime()) / 86400000)
  const dailyAvg = thisMonth / daysIntoMonth
  const projectedMonthly = dailyAvg * 30

  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (today > yesterday * 1.1) trend = 'up'
  else if (today < yesterday * 0.9) trend = 'down'

  return { today, yesterday, thisWeek, thisMonth, byProvider, byModel, trend, projectedMonthly }
}

export interface ThresholdAlert {
  level: 'warning' | 'critical'
  period: string
  actual: number
  threshold: number
}

export function checkThresholds(): { triggered: boolean; alerts: ThresholdAlert[] } {
  const { thresholds } = readStore()
  const summary = getCostSummary()
  const alerts: ThresholdAlert[] = []

  const checks: { period: string; actual: number; warning: number; critical: number }[] = [
    { period: 'daily', actual: summary.today, warning: thresholds.dailyWarning, critical: thresholds.dailyCritical },
    { period: 'weekly', actual: summary.thisWeek, warning: thresholds.weeklyWarning, critical: thresholds.weeklyCritical },
    { period: 'monthly', actual: summary.thisMonth, warning: thresholds.monthlyWarning, critical: thresholds.monthlyCritical },
  ]

  for (const check of checks) {
    if (check.actual >= check.critical) {
      alerts.push({ level: 'critical', period: check.period, actual: check.actual, threshold: check.critical })
    } else if (check.actual >= check.warning) {
      alerts.push({ level: 'warning', period: check.period, actual: check.actual, threshold: check.warning })
    }
  }

  return { triggered: alerts.length > 0, alerts }
}

export async function sendCostAlerts(
  alerts: ThresholdAlert[],
  summary: ReturnType<typeof getCostSummary>
): Promise<void> {
  for (const alert of alerts) {
    const overPct = Math.round(((alert.actual - alert.threshold) / alert.threshold) * 100)
    const byProviderLines = Object.entries(summary.byProvider)
      .map(([p, v]) => `• ${p.charAt(0).toUpperCase() + p.slice(1)}: $${v.toFixed(2)}`)
      .join('\n')

    let message: string
    if (alert.level === 'critical') {
      message = `🚨 <b>CRITICAL COST ALERT</b>
${alert.period.charAt(0).toUpperCase() + alert.period.slice(1)}'s AI spend: <b>$${alert.actual.toFixed(2)}</b>
Critical threshold: $${alert.threshold.toFixed(2)}

Immediate action may be needed.
Consider pausing sub-agent tasks.

${byProviderLines}

→ topdog-os.vercel.app/costs`
    } else {
      message = `⚠️ <b>COST ALERT — ${alert.period.charAt(0).toUpperCase() + alert.period.slice(1)} Warning</b>
${alert.period.charAt(0).toUpperCase() + alert.period.slice(1)}'s AI spend: <b>$${alert.actual.toFixed(2)}</b>
Threshold: $${alert.threshold.toFixed(2)}
🔴 You are ${overPct}% over your ${alert.period} warning limit.

Breakdown:
${byProviderLines}

→ topdog-os.vercel.app/costs`
    }

    await sendTelegramAlert(message)
  }
}

export function updateLastChecked(): void {
  const store = readStore()
  store.lastChecked = new Date().toISOString()
  writeStore(store)
}

export function getLastChecked(): string | null {
  return readStore().lastChecked
}
