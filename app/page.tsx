import { readApprovals } from '@/lib/approvals'

const apps = [
  { id: 'lawngenius', name: 'lawngenius', status: 'operational', build: '#2', platform: 'ios+android' },
  { id: 'pooliq', name: 'pooliq', status: 'operational', build: '#1', platform: 'ios+android' },
  { id: 'scoutgenius', name: 'scoutgenius', status: 'operational', build: '—', platform: 'pending build' },
  { id: 'drone-spray', name: 'drone-spray', status: 'operational', build: 'vercel', platform: 'web' },
]

const activity = [
  { ts: '03:14:22', text: 'New signup — lawngenius', type: 'signup' },
  { ts: '02:58:07', text: 'Stripe payment — pooliq pro ($9.99)', type: 'payment' },
  { ts: '02:01:44', text: 'Dispute flagged — drone-spray', type: 'alert' },
  { ts: '01:22:11', text: 'Support ticket opened — scoutgenius', type: 'support' },
  { ts: '00:47:33', text: 'Refund requested — lawngenius ($29.99)', type: 'refund' },
]

function typeColor(type: string): string {
  switch (type) {
    case 'signup': return '#00D4AA'
    case 'payment': return '#10B981'
    case 'alert': return '#EF4444'
    case 'refund': return '#F59E0B'
    default: return '#64748B'
  }
}

export default function OverviewPage() {
  const approvals = readApprovals()
  const pendingCount = approvals.filter((a) => a.status === 'pending').length

  const stats = [
    { label: 'MRR', value: '$0.00', trend: '→', trendLabel: 'no stripe', trendColor: '#334155' },
    { label: 'ACTIVE USERS', value: '0', trend: '—', trendLabel: 'connect analytics', trendColor: '#334155' },
    { label: 'QUEUE', value: String(pendingCount), trend: pendingCount > 0 ? '↑' : '→', trendLabel: pendingCount > 0 ? `${pendingCount} pending` : 'clear', trendColor: pendingCount > 0 ? '#EF4444' : '#10B981' },
    { label: 'UPTIME', value: '99.9%', trend: '✓', trendLabel: 'all systems', trendColor: '#10B981' },
    { label: 'OPEN TICKETS', value: '2', trend: '↑', trendLabel: '2 open', trendColor: '#F59E0B' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page header */}
      <div style={{ borderBottom: '1px solid #1E1E2E', paddingBottom: '12px' }}>
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold" style={{ color: '#E2E8F0' }}>Overview</h1>
          <span className="label">/ command center</span>
        </div>
      </div>

      {/* Stat rows + Activity feed — 70/30 split */}
      <div className="flex gap-5" style={{ alignItems: 'flex-start' }}>
        {/* Left: Stats + App Status */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Compact stat rows */}
          <div
            className="card-hover"
            style={{ border: '1px solid #1E1E2E', borderRadius: '6px', backgroundColor: '#0F0F1A', overflow: 'hidden' }}
          >
            <div className="px-4 py-2.5" style={{ borderBottom: '1px solid #1E1E2E' }}>
              <span className="label">KEY METRICS</span>
            </div>
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="flex items-center px-4 py-2.5"
                style={{
                  borderBottom: i < stats.length - 1 ? '1px solid #16162A' : undefined,
                }}
              >
                <span className="label w-36 shrink-0">{s.label}</span>
                <span className="mono text-sm font-semibold flex-1" style={{ color: '#E2E8F0' }}>
                  {s.value}
                </span>
                <span className="mono text-xs" style={{ color: s.trendColor }}>
                  {s.trend} {s.trendLabel}
                </span>
              </div>
            ))}
          </div>

          {/* App Status Table */}
          <div
            className="card-hover"
            style={{ border: '1px solid #1E1E2E', borderRadius: '6px', backgroundColor: '#0F0F1A', overflow: 'hidden' }}
          >
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid #1E1E2E' }}>
              <span className="label">APP STATUS</span>
              <span className="mono text-xs" style={{ color: '#334155' }}>{apps.length} services</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {apps.map((app, i) => (
                  <tr
                    key={app.id}
                    style={{
                      borderBottom: i < apps.length - 1 ? '1px solid #16162A' : undefined,
                    }}
                  >
                    <td className="px-4 py-2.5">
                      <span className="mono text-xs font-medium" style={{ color: '#94A3B8' }}>
                        {app.name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: '#10B981', boxShadow: '0 0 3px #10B981' }}
                        />
                        <span className="mono text-xs font-semibold" style={{ color: '#10B981' }}>
                          OPERATIONAL
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="mono text-xs" style={{ color: '#64748B' }}>
                        build {app.build}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="mono text-xs px-1.5 py-0.5"
                        style={{
                          color: '#64748B',
                          backgroundColor: '#13131F',
                          border: '1px solid #1E1E2E',
                          borderRadius: '3px',
                        }}
                      >
                        {app.platform}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Activity feed — 30% */}
        <div
          className="card-hover shrink-0"
          style={{
            width: '280px',
            border: '1px solid #1E1E2E',
            borderRadius: '6px',
            backgroundColor: '#0F0F1A',
            overflow: 'hidden',
          }}
        >
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid #1E1E2E' }}>
            <span className="label">ACTIVITY</span>
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#00D4AA', boxShadow: '0 0 4px #00D4AA' }}
            />
          </div>
          <div>
            {activity.map((item, i) => (
              <div
                key={i}
                className="px-4 py-2.5 flex gap-3"
                style={{
                  borderBottom: i < activity.length - 1 ? '1px solid #16162A' : undefined,
                }}
              >
                <span
                  className="mono text-xs shrink-0 mt-0.5"
                  style={{ color: '#334155', fontVariantNumeric: 'tabular-nums' }}
                >
                  {item.ts}
                </span>
                <div>
                  <span
                    className="w-1 h-1 rounded-full inline-block mr-1.5 relative"
                    style={{
                      backgroundColor: typeColor(item.type),
                      verticalAlign: 'middle',
                      top: '-1px',
                    }}
                  />
                  <span className="text-xs" style={{ color: '#94A3B8' }}>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
          <div
            className="px-4 py-2"
            style={{ borderTop: '1px solid #1E1E2E' }}
          >
            <span className="label" style={{ color: '#334155' }}>CT timezone · live feed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
