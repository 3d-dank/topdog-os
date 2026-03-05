import { readApprovals } from '@/lib/approvals'

const apps = [
  { name: 'LawnGenius', status: 'operational', icon: '🌿' },
  { name: 'PoolIQ', status: 'operational', icon: '🏊' },
  { name: 'ScoutGenius', status: 'operational', icon: '🔭' },
  { name: 'Drone Spray', status: 'operational', icon: '🚁' },
]

const activity = [
  { time: '2m ago', text: 'New signup — LawnGenius', icon: '🌿' },
  { time: '14m ago', text: 'Stripe payment — PoolIQ Pro ($9.99)', icon: '💳' },
  { time: '1h ago', text: 'Dispute flagged — Drone Spray', icon: '🚨' },
  { time: '2h ago', text: 'Support ticket opened — ScoutGenius', icon: '🎫' },
  { time: '3h ago', text: 'Refund requested — LawnGenius ($29.99)', icon: '💰' },
]

export default function OverviewPage() {
  const approvals = readApprovals()
  const pendingCount = approvals.filter((a) => a.status === 'pending').length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p style={{ color: '#94A3B8' }} className="text-sm mt-1">Business command center — all apps, one view</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Monthly Recurring Revenue" value="$0" sub="No Stripe connected yet" icon="💰" />
        <KpiCard label="Active Users" value="—" sub="Connect analytics to populate" icon="👥" />
        <KpiCard
          label="Approval Queue"
          value={String(pendingCount)}
          sub={pendingCount > 0 ? 'Items need your decision' : 'All clear'}
          icon="✅"
          urgent={pendingCount > 0}
        />
        <KpiCard label="Support Tickets" value="2" sub="Open across all apps" icon="🎫" />
      </div>

      {/* App Status */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">App Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {apps.map((app) => (
            <div
              key={app.name}
              className="rounded-xl p-4 flex items-center gap-3"
              style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
            >
              <span className="text-2xl">{app.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{app.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4CAF50' }} />
                  <span className="text-xs capitalize" style={{ color: '#4CAF50' }}>Operational</span>
                </div>
              </div>
              <span className="text-lg">✅</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Recent Activity</h2>
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}>
          {activity.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-5 py-4"
              style={{
                borderBottom: i < activity.length - 1 ? '1px solid #334155' : undefined,
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 text-sm text-white">{item.text}</span>
              <span className="text-xs shrink-0" style={{ color: '#64748B' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  urgent,
}: {
  label: string
  value: string
  sub: string
  icon: string
  urgent?: boolean
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: '#1E293B',
        border: urgent ? '1px solid #EF4444' : '1px solid #334155',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {urgent && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: '#EF4444' }}
          >
            URGENT
          </span>
        )}
      </div>
      <div
        className="text-3xl font-bold mb-1"
        style={{ color: urgent ? '#EF4444' : '#4CAF50' }}
      >
        {value}
      </div>
      <div className="text-sm font-medium text-white mb-0.5">{label}</div>
      <div className="text-xs" style={{ color: '#64748B' }}>{sub}</div>
    </div>
  )
}
