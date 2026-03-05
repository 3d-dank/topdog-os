import Link from 'next/link'
import { readApprovals } from '@/lib/approvals'
import { readTasks } from '@/lib/tasks'
import { readActivity } from '@/lib/activity'
import { PORTFOLIO, CLIENT_PROJECTS } from '@/lib/portfolio'
import { getCostSummary, readCosts } from '@/lib/costs'
import OverviewActions from './OverviewActions'

function typeColor(type: string): string {
  const map: Record<string, string> = {
    build: '#6366F1', feature: '#00D4AA', launch: '#10B981',
    infra: '#F59E0B', milestone: '#00D4AA', signup: '#00D4AA',
    payment: '#10B981', alert: '#EF4444', support: '#F59E0B',
  }
  return map[type] ?? '#64748B'
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    build: 'BUILD', feature: 'FEAT', launch: 'LAUNCH',
    infra: 'INFRA', milestone: 'MILE', signup: 'SIGNUP',
    payment: 'PAY', alert: 'ALERT', support: 'SUPP',
  }
  return labels[type] ?? type.toUpperCase()
}

function formatTs(ts: string): string {
  const d = new Date(ts)
  const now = new Date()
  const diffH = (now.getTime() - d.getTime()) / 3600000
  if (diffH < 1) return Math.round(diffH * 60) + 'm ago'
  if (diffH < 24) return Math.round(diffH) + 'h ago'
  return Math.round(diffH / 24) + 'd ago'
}

export default function OverviewPage() {
  const approvals = readApprovals()
  const tasks = readTasks()
  const activity = readActivity().slice(0, 10)
  const pendingApprovals = approvals.filter((a) => a.status === 'pending').length
  const openTasks = tasks.filter((t) => t.status !== 'done').length
  const liveApps = PORTFOLIO.filter((a) => a.status === 'live').length
  const buildingApps = PORTFOLIO.filter((a) => a.status === 'building').length

  // Cost widget data
  const costSummary = getCostSummary()
  const { thresholds } = readCosts()
  const todaySpend = costSummary.today
  let costColor = '#10B981'
  let costSub = 'under limit'
  if (todaySpend >= thresholds.dailyCritical) {
    costColor = '#EF4444'
    costSub = '🔴 over critical'
  } else if (todaySpend >= thresholds.dailyWarning) {
    costColor = '#F59E0B'
    costSub = '⚠️ over warning'
  }

  const kpis = [
    { label: 'Portfolio MRR', value: '$0', sub: 'Connect Stripe', subHref: '/settings', color: '#00D4AA' },
    { label: 'Active Apps', value: String(liveApps), sub: 'live on stores', color: '#10B981' },
    { label: 'In Build', value: String(buildingApps), sub: 'apps in progress', color: '#F59E0B' },
    { label: 'Pending Approvals', value: String(pendingApprovals), sub: pendingApprovals > 0 ? 'needs action' : 'all clear', color: pendingApprovals > 0 ? '#EF4444' : '#10B981' },
    { label: 'Open Tasks', value: String(openTasks), sub: 'across all apps', color: '#64748B' },
    {
      label: "Today's AI Spend",
      value: `$${todaySpend.toFixed(2)}`,
      sub: costSub,
      subHref: '/costs',
      color: costColor,
    },
  ]
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div style={{ borderBottom: '1px solid #1E1E2E', paddingBottom: '12px' }}>
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold" style={{ color: '#E2E8F0' }}>Overview</h1>
          <span className="label">/ command center</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card-hover rounded" style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', padding: '14px 16px' }}>
            <div className="mono text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-xs font-medium mt-1" style={{ color: '#E2E8F0' }}>{kpi.label}</div>
            {kpi.subHref ? (
              <Link href={kpi.subHref} className="mono text-xs mt-0.5 block hover:underline" style={{ color: '#334155' }}>{kpi.sub} &rarr;</Link>
            ) : (
              <div className="mono text-xs mt-0.5" style={{ color: '#334155' }}>{kpi.sub}</div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-5" style={{ alignItems: 'flex-start' }}>
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <span className="label">APP PORTFOLIO</span>
            <span className="mono text-xs" style={{ color: '#334155' }}>{PORTFOLIO.length} apps</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {PORTFOLIO.map((app) => {
              const isLive = app.status === 'live'
              const statusColor = isLive ? '#10B981' : app.status === 'building' ? '#F59E0B' : '#334155'
              const statusLabel = isLive ? 'LIVE' : app.status === 'building' ? 'BUILDING' : 'PLANNED'
              return (
                <div key={app.id} className="card-hover flex flex-col" style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', borderRadius: '6px', padding: '14px 16px', gap: '10px' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '1.15rem' }}>{app.emoji}</span>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: '#E2E8F0' }}>{app.name}</div>
                        <div className="mono text-xs mt-0.5" style={{ color: '#64748B' }}>{app.tagline}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor, boxShadow: '0 0 4px ' + statusColor }} />
                      <span className="mono text-xs font-bold" style={{ color: statusColor }}>{statusLabel}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="mono text-xs" style={{ color: '#334155' }}>Platform</span>
                      <span className="mono text-xs" style={{ color: '#64748B' }}>{app.platform}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="mono text-xs" style={{ color: '#334155' }}>Build</span>
                      <span className="mono text-xs" style={{ color: '#64748B' }}>{app.buildVersion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="mono text-xs" style={{ color: '#334155' }}>MRR</span>
                      <span className="mono text-xs font-semibold" style={{ color: '#E2E8F0' }}>${app.monthlyRevenue} / {app.users} users</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-auto pt-1" style={{ borderTop: '1px solid #16162A' }}>
                    <a href={'https://github.com/3d-dank/' + app.github} target="_blank" rel="noopener noreferrer" className="mono text-xs px-2 py-1 rounded hover:opacity-80" style={{ color: '#64748B', backgroundColor: '#13131F', border: '1px solid #1E1E2E' }}>GitHub &uarr;</a>
                    {app.affiliateTag && (
                      <a href="https://affiliate-program.amazon.com" target="_blank" rel="noopener noreferrer" className="mono text-xs px-2 py-1 rounded hover:opacity-80" style={{ color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>{app.affiliateTag}</a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <OverviewActions />
        </div>
        <div className="card-hover shrink-0" style={{ width: '290px', border: '1px solid #1E1E2E', borderRadius: '6px', backgroundColor: '#0F0F1A', overflow: 'hidden' }}>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid #1E1E2E' }}>
            <span className="label">ACTIVITY</span>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#00D4AA', boxShadow: '0 0 4px #00D4AA' }} />
          </div>
          {activity.map((item, i) => (
            <div key={item.id} className="px-4 py-3 flex gap-3" style={{ borderBottom: i < activity.length - 1 ? '1px solid #16162A' : undefined }}>
              <div className="shrink-0 mt-0.5">
                <span className="mono px-1 py-0.5 rounded" style={{ backgroundColor: typeColor(item.type) + '20', color: typeColor(item.type), fontSize: '0.6rem' }}>{typeLabel(item.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-snug" style={{ color: '#94A3B8' }}>{item.text}</p>
                <p className="mono text-xs mt-0.5" style={{ color: '#334155' }}>{formatTs(item.ts)}</p>
              </div>
            </div>
          ))}
          <div className="px-4 py-2.5" style={{ borderTop: '1px solid #1E1E2E' }}>
            <Link href="/projects" className="mono text-xs hover:opacity-80" style={{ color: '#334155' }}>View all tasks &rarr;</Link>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #1E1E2E', paddingTop: '20px' }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="label">CLIENT PROJECTS</span>
          <span className="mono px-2 py-0.5 rounded" style={{ color: '#64748B', backgroundColor: '#13131F', border: '1px solid #1E1E2E', fontSize: '0.6rem' }}>not in portfolio</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {CLIENT_PROJECTS.map((cp) => (
            <div key={cp.id} style={{ backgroundColor: '#0D0D14', border: '1px solid #1E1E2E', borderRadius: '6px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1rem' }}>{cp.emoji}</span>
              <div>
                <div className="text-xs font-medium" style={{ color: '#64748B' }}>{cp.name}</div>
                <div className="mono text-xs" style={{ color: '#334155' }}>client project for {cp.client}</div>
              </div>
              <div className="flex gap-3 ml-4">
                <a href={'https://github.com/3d-dank/' + cp.github} target="_blank" rel="noopener noreferrer" className="mono text-xs hover:opacity-70" style={{ color: '#334155' }}>GitHub</a>
                <a href={cp.url} target="_blank" rel="noopener noreferrer" className="mono text-xs hover:opacity-70" style={{ color: '#334155' }}>Site &uarr;</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
