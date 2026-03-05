'use client'

import { useEffect, useState } from 'react'

type BuildStatus = 'finished' | 'in-progress' | 'errored' | 'canceled' | 'new' | 'unknown' | null

interface AppBuilds {
  appId: string
  appName: string
  builds: Array<{ id: string; status: BuildStatus; platform: string; createdAt: string }>
  latestStatus: BuildStatus
  error?: string
}

interface Props {
  appId: string
}

function statusChip(latestStatus: BuildStatus, buildNumber?: number) {
  switch (latestStatus) {
    case 'finished':
      return {
        label: buildNumber ? `✅ Build #${buildNumber}` : '✅ Built',
        color: '#10B981',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.2)',
        pulse: false,
      }
    case 'in-progress':
    case 'new':
      return {
        label: '🔨 Building...',
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.2)',
        pulse: true,
      }
    case 'errored':
      return {
        label: '❌ Failed',
        color: '#EF4444',
        bg: 'rgba(239,68,68,0.08)',
        border: 'rgba(239,68,68,0.2)',
        pulse: false,
      }
    case 'canceled':
      return {
        label: '⊘ Canceled',
        color: '#64748B',
        bg: 'rgba(100,116,139,0.08)',
        border: 'rgba(100,116,139,0.2)',
        pulse: false,
      }
    default:
      return {
        label: '— No builds',
        color: '#334155',
        bg: '#13131F',
        border: '#1E1E2E',
        pulse: false,
      }
  }
}

// Global cache for build data
let buildCache: AppBuilds[] | null = null
let buildCacheTime = 0
const BUILD_CACHE_TTL = 5 * 60 * 1000

export default function BuildStatusBadge({ appId }: Props) {
  const [appData, setAppData] = useState<AppBuilds | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        if (buildCache && Date.now() - buildCacheTime < BUILD_CACHE_TTL) {
          const found = buildCache.find((a) => a.appId === appId)
          setAppData(found ?? null)
          setLoaded(true)
          return
        }

        const res = await fetch('/api/expo/builds')
        const data = await res.json()
        buildCache = data.builds ?? []
        buildCacheTime = Date.now()
        const found = (buildCache ?? []).find((a) => a.appId === appId)
        setAppData(found ?? null)
      } catch {
        setAppData(null)
      }
      setLoaded(true)
    }
    load()
  }, [appId])

  if (!loaded) {
    return (
      <span
        className="mono text-xs px-1.5 py-0.5"
        style={{ color: '#334155', backgroundColor: '#13131F', border: '1px solid #1E1E2E', borderRadius: '3px' }}
      >
        …
      </span>
    )
  }

  const buildCount = appData?.builds?.length ?? 0
  const chip = statusChip(appData?.latestStatus ?? null, buildCount > 0 ? buildCount : undefined)

  return (
    <span
      className={`mono text-xs px-1.5 py-0.5${chip.pulse ? ' animate-pulse' : ''}`}
      style={{
        color: chip.color,
        backgroundColor: chip.bg,
        border: `1px solid ${chip.border}`,
        borderRadius: '3px',
        fontSize: '11px',
      }}
    >
      {chip.label}
    </span>
  )
}
