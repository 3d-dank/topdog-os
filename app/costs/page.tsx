'use client'

import { useState, useEffect, useCallback } from 'react'

interface CostSummary {
  today: number
  yesterday: number
  thisWeek: number
  thisMonth: number
  byProvider: Record<string, number>
  byModel: Record<string, number>
  trend: 'up' | 'down' | 'stable'
  projectedMonthly: number
}

interface CostThresholds {
  dailyWarning: number
  dailyCritical: number
  weeklyWarning: number
  weeklyCritical: number
  monthlyWarning: number
  monthlyCritical: number
}

interface CostEntry {
  id: string
  ts: string
  provider: string
  model?: string
  costUsd: number
  source: string
  note?: string
}

interface CostsData {
  summary: CostSummary
  thresholds: CostThresholds
  entries: CostEntry[]
  lastChecked: string | null
}

function fmt(n: number) {
  return `$${n.toFixed(2)}`
}

function getStatusColor(
  value: number,
  warning: number,
  critical: number
): { color: string; bg: string; label: string; pulse: boolean } {
  if (value >= critical)
    return { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', label: '🔴 Over', pulse: true }
  if (value >= warning)
    return { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', label: '⚠️ Warning', pulse: false }
  return { color: '#10B981', bg: 'rgba(16,185,129,0.08)', label: '✅ Normal', pulse: false }
}

// Group entries by date (UTC date string)
function groupByDate(entries: CostEntry[]): Record<string, CostEntry[]> {
  const map: Record<string, CostEntry[]> = {}
  for (const e of entries) {
    const day = e.ts.slice(0, 10)
    if (!map[day]) map[day] = []
    map[day].push(e)
  }
  return map
}

// Get last N days as YYYY-MM-DD strings
function lastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setUTCDate(d.getUTCDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

export default function CostsPage() {
  const [data, setData] = useState<CostsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<{ openaiStatus: string; anthropicStatus: string; alertsFired: unknown[] } | null>(null)
  const [thresholdEdits, setThresholdEdits] = useState<CostThresholds | null>(null)
  const [savingThresholds, setSavingThresholds] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/costs')
      const json = await res.json()
      setData(json)
      setThresholdEdits(json.thresholds)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCheckNow() {
    setChecking(true)
    setCheckResult(null)
    try {
      const res = await fetch('/api/costs/check', { method: 'POST' })
      const json = await res.json()
      setCheckResult(json)
      await load()
    } finally {
      setChecking(false)
    }
  }

  async function handleSaveThresholds() {
    if (!thresholdEdits) return
    setSavingThresholds(true)
    try {
      await fetch('/api/costs/thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thresholds: thresholdEdits }),
      })
      await load()
      setSavedMsg('Saved!')
      setTimeout(() => setSavedMsg(''), 2000)
    } finally {
      setSavingThresholds(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '40px' }}>Loading cost data…</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto">
        <div style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '40px' }}>Failed to load cost data.</div>
      </div>
    )
  }

  const { summary, thresholds, entries } = data
  const dailyStat = getStatusColor(summary.today, thresholds.dailyWarning, thresholds.dailyCritical)
  const weeklyStat = getStatusColor(summary.thisWeek, thresholds.weeklyWarning, thresholds.weeklyCritical)
  const monthlyStat = getStatusColor(summary.thisMonth, thresholds.monthlyWarning, thresholds.monthlyCritical)

  const trendArrow = summary.trend === 'up' ? '↑' : summary.trend === 'down' ? '↓' : '→'
  const trendColor = summary.trend === 'up' ? '#EF4444' : summary.trend === 'down' ? '#10B981' : '#64748B'

  // Provider breakdown for chart
  const totalMonthCost = Object.values(summary.byProvider).reduce((a, b) => a + b, 0) || 1
  const providerEntries = Object.entries(summary.byProvider).sort((a, b) => b[1] - a[1])

  // Daily table — last 14 days
  const days = lastNDays(14)
  const byDate = groupByDate(entries)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1E1E2E', paddingBottom: '12px' }}>
        <div className="flex items-baseline gap-3 justify-between flex-wrap">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-base font-semibold" style={{ color: '#E2E8F0' }}>AI Cost Monitor</h1>
              <span className="label">/ real-time spend tracking across OpenAI + Anthropic</span>
            </div>
            {data.lastChecked && (
              <div className="mono text-xs mt-1" style={{ color: '#334155' }}>
                Last checked: {new Date(data.lastChecked).toLocaleString()}
              </div>
            )}
          </div>
          <button
            onClick={handleCheckNow}
            disabled={checking}
            style={{
              backgroundColor: checking ? '#1E1E2E' : 'rgba(0,212,170,0.1)',
              border: '1px solid rgba(0,212,170,0.3)',
              color: checking ? '#64748B' : '#00D4AA',
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: checking ? 'not-allowed' : 'pointer',
              fontFamily: 'monospace',
            }}
          >
            {checking ? '⏳ Checking…' : '🔄 Check Now'}
          </button>
        </div>
        {checkResult && (
          <div className="mono text-xs mt-2 flex gap-4 flex-wrap" style={{ color: '#64748B' }}>
            <span>OpenAI: <span style={{ color: checkResult.openaiStatus === 'live' ? '#10B981' : '#F59E0B' }}>{checkResult.openaiStatus}</span></span>
            <span>Anthropic: <span style={{ color: checkResult.anthropicStatus === 'live' ? '#10B981' : '#F59E0B' }}>{checkResult.anthropicStatus}</span></span>
            {(checkResult.alertsFired as unknown[]).length > 0 && (
              <span style={{ color: '#EF4444' }}>🚨 {(checkResult.alertsFired as unknown[]).length} alert(s) fired → Telegram</span>
            )}
            {(checkResult.alertsFired as unknown[]).length === 0 && (
              <span style={{ color: '#10B981' }}>✅ No threshold breaches</span>
            )}
          </div>
        )}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Today */}
        <div
          className="rounded"
          style={{
            backgroundColor: dailyStat.bg,
            border: `1px solid ${dailyStat.color}40`,
            padding: '14px 16px',
            ...(dailyStat.pulse
              ? { animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }
              : {}),
          }}
        >
          <div className="mono text-2xl font-bold" style={{ color: dailyStat.color }}>
            {fmt(summary.today)}
          </div>
          <div className="text-xs font-medium mt-1" style={{ color: '#E2E8F0' }}>Today</div>
          <div className="mono text-xs mt-0.5" style={{ color: trendColor }}>
            {trendArrow} vs {fmt(summary.yesterday)} yesterday
          </div>
        </div>

        {/* This Week */}
        <div
          className="rounded"
          style={{
            backgroundColor: weeklyStat.bg,
            border: `1px solid ${weeklyStat.color}40`,
            padding: '14px 16px',
          }}
        >
          <div className="mono text-2xl font-bold" style={{ color: weeklyStat.color }}>
            {fmt(summary.thisWeek)}
          </div>
          <div className="text-xs font-medium mt-1" style={{ color: '#E2E8F0' }}>This Week</div>
          <div className="mono text-xs mt-0.5" style={{ color: '#334155' }}>
            of {fmt(thresholds.weeklyWarning)} limit
          </div>
        </div>

        {/* This Month */}
        <div
          className="rounded"
          style={{
            backgroundColor: monthlyStat.bg,
            border: `1px solid ${monthlyStat.color}40`,
            padding: '14px 16px',
          }}
        >
          <div className="mono text-2xl font-bold" style={{ color: monthlyStat.color }}>
            {fmt(summary.thisMonth)}
          </div>
          <div className="text-xs font-medium mt-1" style={{ color: '#E2E8F0' }}>This Month</div>
          <div className="mono text-xs mt-0.5" style={{ color: '#334155' }}>
            of {fmt(thresholds.monthlyWarning)} limit
          </div>
        </div>

        {/* Projected */}
        <div
          className="rounded"
          style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', padding: '14px 16px' }}
        >
          <div className="mono text-2xl font-bold" style={{ color: '#6366F1' }}>
            {fmt(summary.projectedMonthly)}
          </div>
          <div className="text-xs font-medium mt-1" style={{ color: '#E2E8F0' }}>Projected Month</div>
          <div className="mono text-xs mt-0.5" style={{ color: '#334155' }}>
            based on daily avg × 30
          </div>
        </div>
      </div>

      {/* Two-column: Breakdown chart + Threshold settings */}
      <div className="flex gap-4 flex-wrap lg:flex-nowrap">

        {/* Provider Breakdown */}
        <div
          className="flex-1 rounded"
          style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', padding: '16px', minWidth: '240px' }}
        >
          <div className="label mb-3">SPEND BY PROVIDER (this month)</div>
          {providerEntries.length === 0 && (
            <div className="mono text-xs" style={{ color: '#334155' }}>No data yet</div>
          )}
          {providerEntries.map(([provider, cost]) => {
            const pct = Math.round((cost / totalMonthCost) * 100)
            const colors: Record<string, string> = {
              anthropic: '#00D4AA',
              openai: '#6366F1',
              digitalocean: '#0080FF',
              vercel: '#E2E8F0',
              expo: '#F59E0B',
            }
            const color = colors[provider] ?? '#64748B'
            return (
              <div key={provider} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium capitalize" style={{ color: '#94A3B8' }}>{provider}</span>
                  <span className="mono text-xs" style={{ color }}>
                    {fmt(cost)} ({pct}%)
                  </span>
                </div>
                <div className="rounded-full h-2" style={{ backgroundColor: '#1E1E2E' }}>
                  <div
                    className="rounded-full h-2"
                    style={{ width: `${pct}%`, backgroundColor: color, transition: 'width 0.6s ease' }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Threshold Settings */}
        <div
          className="rounded"
          style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', padding: '16px', minWidth: '280px' }}
        >
          <div className="label mb-3">THRESHOLD SETTINGS</div>
          {thresholdEdits && (
            <div className="space-y-2">
              {(
                [
                  ['dailyWarning', 'Daily Warning'],
                  ['dailyCritical', 'Daily Critical'],
                  ['weeklyWarning', 'Weekly Warning'],
                  ['weeklyCritical', 'Weekly Critical'],
                  ['monthlyWarning', 'Monthly Warning'],
                  ['monthlyCritical', 'Monthly Critical'],
                ] as [keyof CostThresholds, string][]
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <span className="text-xs" style={{ color: '#64748B', minWidth: '130px' }}>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="mono text-xs" style={{ color: '#334155' }}>$</span>
                    <input
                      type="number"
                      value={thresholdEdits[key]}
                      onChange={(e) =>
                        setThresholdEdits((prev) =>
                          prev ? { ...prev, [key]: Number(e.target.value) } : prev
                        )
                      }
                      style={{
                        backgroundColor: '#13131F',
                        border: '1px solid #1E1E2E',
                        color: '#E2E8F0',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        width: '70px',
                      }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <button
                  onClick={handleSaveThresholds}
                  disabled={savingThresholds}
                  style={{
                    backgroundColor: 'rgba(0,212,170,0.1)',
                    border: '1px solid rgba(0,212,170,0.3)',
                    color: '#00D4AA',
                    padding: '5px 12px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                  }}
                >
                  {savingThresholds ? 'Saving…' : savedMsg || 'Save Thresholds'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Daily Spend Table */}
      <div style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', borderRadius: '6px', overflow: 'hidden' }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid #1E1E2E' }}>
          <span className="label">DAILY SPEND — LAST 14 DAYS</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E1E2E' }}>
                {['Date', 'OpenAI', 'Anthropic', 'Other', 'Total', 'Status'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 16px',
                      textAlign: 'left',
                      fontSize: '0.65rem',
                      color: '#334155',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, idx) => {
                const dayEntries = byDate[day] ?? []
                const openai = dayEntries
                  .filter((e) => e.provider === 'openai')
                  .reduce((s, e) => s + e.costUsd, 0)
                const anthropic = dayEntries
                  .filter((e) => e.provider === 'anthropic')
                  .reduce((s, e) => s + e.costUsd, 0)
                const other = dayEntries
                  .filter((e) => e.provider !== 'openai' && e.provider !== 'anthropic')
                  .reduce((s, e) => s + e.costUsd, 0)
                const total = openai + anthropic + other
                const stat = getStatusColor(total, thresholds.dailyWarning, thresholds.dailyCritical)
                const showTotal = total > 0

                return (
                  <tr
                    key={day}
                    style={{
                      borderBottom: idx < days.length - 1 ? '1px solid #16162A' : undefined,
                      opacity: showTotal ? 1 : 0.4,
                    }}
                  >
                    <td style={{ padding: '8px 16px', fontSize: '0.78rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                      {formatDate(day)}
                    </td>
                    <td style={{ padding: '8px 16px', fontSize: '0.78rem', color: openai > 0 ? '#6366F1' : '#334155', fontFamily: 'monospace' }}>
                      {openai > 0 ? fmt(openai) : '—'}
                    </td>
                    <td style={{ padding: '8px 16px', fontSize: '0.78rem', color: anthropic > 0 ? '#00D4AA' : '#334155', fontFamily: 'monospace' }}>
                      {anthropic > 0 ? fmt(anthropic) : '—'}
                    </td>
                    <td style={{ padding: '8px 16px', fontSize: '0.78rem', color: other > 0 ? '#F59E0B' : '#334155', fontFamily: 'monospace' }}>
                      {other > 0 ? fmt(other) : '—'}
                    </td>
                    <td style={{ padding: '8px 16px', fontSize: '0.78rem', fontWeight: 600, color: showTotal ? stat.color : '#334155', fontFamily: 'monospace' }}>
                      {showTotal ? fmt(total) : '—'}
                    </td>
                    <td style={{ padding: '8px 16px', fontSize: '0.75rem', color: '#64748B' }}>
                      {showTotal ? stat.label : <span style={{ color: '#334155' }}>—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Entries */}
      <div style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', borderRadius: '6px', overflow: 'hidden' }}>
        <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #1E1E2E' }}>
          <span className="label">RECENT ENTRIES</span>
        </div>
        {entries.length === 0 && (
          <div className="px-4 py-3 mono text-xs" style={{ color: '#334155' }}>No entries yet — click Check Now to fetch live data.</div>
        )}
        {entries
          .slice()
          .reverse()
          .slice(0, 20)
          .map((e, i) => (
            <div
              key={e.id}
              className="px-4 py-2.5 flex items-center gap-3 flex-wrap"
              style={{ borderBottom: i < Math.min(entries.length, 20) - 1 ? '1px solid #16162A' : undefined }}
            >
              <span className="mono text-xs" style={{ color: '#334155', minWidth: '100px' }}>
                {new Date(e.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span
                className="mono text-xs px-1.5 py-0.5 rounded capitalize"
                style={{
                  backgroundColor:
                    e.provider === 'anthropic'
                      ? 'rgba(0,212,170,0.1)'
                      : e.provider === 'openai'
                      ? 'rgba(99,102,241,0.1)'
                      : 'rgba(100,116,139,0.1)',
                  color:
                    e.provider === 'anthropic'
                      ? '#00D4AA'
                      : e.provider === 'openai'
                      ? '#6366F1'
                      : '#64748B',
                }}
              >
                {e.provider}
              </span>
              {e.model && (
                <span className="mono text-xs" style={{ color: '#475569' }}>{e.model}</span>
              )}
              <span className="mono text-xs font-bold" style={{ color: '#E2E8F0' }}>
                {fmt(e.costUsd)}
              </span>
              <span
                className="mono text-xs px-1 py-0.5 rounded"
                style={{ backgroundColor: '#13131F', color: '#475569', fontSize: '0.65rem' }}
              >
                {e.source}
              </span>
              {e.note && (
                <span className="text-xs" style={{ color: '#475569' }}>{e.note}</span>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
