import Link from 'next/link'
import { PORTFOLIO } from '@/lib/portfolio'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const COSTS = [
  { item: 'DigitalOcean Droplet', monthly: 24, notes: 'Top-dog-ai server' },
  { item: 'OpenAI API', monthly: null, notes: 'GPT-4o Vision calls — variable' },
  { item: 'Vercel', monthly: 0, notes: 'Free tier' },
  { item: 'Expo EAS', monthly: 0, notes: 'Free tier' },
  { item: 'Domain Registrations', monthly: 1, notes: '~$12/yr across .app domains' },
]

const AFFILIATE_MAP: { appId: string; stores: { name: string; url: string; tag: string }[] }[] = [
  {
    appId: 'lawngenius',
    stores: [
      { name: 'Amazon', url: 'https://affiliate-program.amazon.com', tag: 'lawngenius-20' },
      { name: 'Home Depot', url: 'https://www.homedepot.com/c/affiliate_marketing', tag: 'lawngenius-HD' },
    ],
  },
  {
    appId: 'spagenius',
    stores: [
      { name: 'Amazon', url: 'https://affiliate-program.amazon.com', tag: 'spagenius-20' },
      { name: "Leslie's Pool", url: 'https://lesliespool.com', tag: 'spagenius-LP' },
    ],
  },
  {
    appId: 'gardengenius',
    stores: [
      { name: 'Amazon', url: 'https://affiliate-program.amazon.com', tag: 'gardengenius-20' },
      { name: 'Home Depot', url: 'https://www.homedepot.com/c/affiliate_marketing', tag: 'gardengenius-HD' },
    ],
  },
  {
    appId: 'aquariumgenius',
    stores: [
      { name: 'Amazon', url: 'https://affiliate-program.amazon.com', tag: 'aquariumgenius-20' },
      { name: 'Chewy', url: 'https://www.chewy.com/affiliate', tag: 'aquariumgenius-CW' },
    ],
  },
]

export default function FinancialsPage() {
  const totalMRR = PORTFOLIO.reduce((s, a) => s + a.monthlyRevenue, 0)
  const totalARR = totalMRR * 12
  const fixedBurn = COSTS.filter((c) => c.monthly !== null).reduce((s, c) => s + (c.monthly ?? 0), 0)
  const netPosition = totalMRR - fixedBurn

  const kpis = [
    { label: 'MRR', value: `$${totalMRR.toLocaleString()}`, sub: 'monthly recurring revenue', color: '#00D4AA' },
    { label: 'ARR', value: `$${totalARR.toLocaleString()}`, sub: 'annualized', color: '#10B981' },
    { label: 'Total Revenue', value: '$0', sub: 'lifetime', color: '#6366F1' },
    { label: 'ARPU', value: '—', sub: 'avg revenue per user', color: '#64748B' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1E1E2E', paddingBottom: '12px' }}>
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold" style={{ color: '#E2E8F0' }}>Financials</h1>
          <span className="label">/ revenue & costs</span>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="card-hover rounded"
            style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', padding: '14px 16px' }}
          >
            <div className="mono text-2xl font-bold" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs font-medium mt-1" style={{ color: '#E2E8F0' }}>{k.label}</div>
            <div className="mono text-xs mt-0.5" style={{ color: '#334155' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue by App */}
      <div
        className="card-hover"
        style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', borderRadius: '6px', overflow: 'hidden' }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid #1E1E2E' }}
        >
          <span className="label">REVENUE BY APP</span>
          <Link
            href="/settings"
            className="mono text-xs hover:opacity-80"
            style={{
              color: '#00D4AA',
              backgroundColor: 'rgba(0,212,170,0.06)',
              border: '1px solid rgba(0,212,170,0.2)',
              padding: '3px 10px',
              borderRadius: '4px',
            }}
          >
            Connect Stripe →
          </Link>
        </div>
        <div className="px-5 py-4 space-y-3">
          {PORTFOLIO.map((app) => (
            <div key={app.id} className="flex items-center gap-3">
              <span style={{ fontSize: '0.9rem', width: '20px' }}>{app.emoji}</span>
              <div className="text-xs font-medium w-32 shrink-0" style={{ color: '#94A3B8' }}>{app.name}</div>
              <div className="flex-1">
                <div
                  className="h-2 rounded"
                  style={{
                    backgroundColor: '#1E1E2E',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: app.monthlyRevenue > 0 ? `${Math.min((app.monthlyRevenue / Math.max(...PORTFOLIO.map((a) => a.monthlyRevenue), 1)) * 100, 100)}%` : '0%',
                      height: '100%',
                      backgroundColor: '#00D4AA',
                      borderRadius: '2px',
                    }}
                  />
                </div>
              </div>
              <span className="mono text-xs w-16 text-right" style={{ color: '#334155' }}>
                ${app.monthlyRevenue}/mo
              </span>
            </div>
          ))}
          <div
            className="mono text-xs mt-2 py-2 text-center rounded"
            style={{
              color: '#334155',
              backgroundColor: '#13131F',
              border: '1px solid #1E1E2E',
            }}
          >
            Live revenue data once Stripe is connected in Settings →
          </div>
        </div>
      </div>

      {/* Affiliate Revenue */}
      <div
        className="card-hover"
        style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', borderRadius: '6px', overflow: 'hidden' }}
      >
        <div className="px-5 py-3" style={{ borderBottom: '1px solid #1E1E2E' }}>
          <span className="label">AFFILIATE PROGRAMS</span>
        </div>
        <div>
          {AFFILIATE_MAP.map((aff, i) => {
            const app = PORTFOLIO.find((a) => a.id === aff.appId)
            if (!app) return null
            return (
              <div
                key={aff.appId}
                className="px-5 py-3.5 flex items-start gap-3"
                style={{ borderBottom: i < AFFILIATE_MAP.length - 1 ? '1px solid #16162A' : undefined }}
              >
                <span style={{ fontSize: '1rem', marginTop: '1px' }}>{app.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium" style={{ color: '#E2E8F0' }}>{app.name}</span>
                    <span className="mono text-xs px-1.5 py-0.5 rounded" style={{ color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.6rem' }}>
                      {app.affiliateTag}
                    </span>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {aff.stores.map((store) => (
                      <div key={store.name} className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: '#10B981' }}
                        />
                        <a
                          href={store.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mono text-xs hover:underline"
                          style={{ color: '#64748B' }}
                        >
                          {store.name} ↗
                        </a>
                        <span className="mono text-xs" style={{ color: '#334155' }}>· Active</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="mono text-sm font-bold" style={{ color: '#334155' }}>$0</div>
                  <a
                    href="https://affiliate-program.amazon.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-xs hover:underline"
                    style={{ color: '#334155', fontSize: '0.6rem' }}
                  >
                    Check dashboard ↗
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly Revenue Table */}
      <div
        className="card-hover"
        style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', borderRadius: '6px', overflow: 'hidden' }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid #1E1E2E' }}
        >
          <span className="label">2026 MONTHLY REVENUE</span>
          <span
            className="mono text-xs px-2 py-0.5 rounded"
            style={{ color: '#334155', backgroundColor: '#13131F', border: '1px solid #1E1E2E', fontSize: '0.6rem' }}
          >
            Live once Stripe connected
          </span>
        </div>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E1E2E' }}>
                {MONTHS.map((m) => (
                  <th key={m} className="px-3 py-2 text-left">
                    <span className="label">{m}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {MONTHS.map((m) => (
                  <td key={m} className="px-3 py-3">
                    <span className="mono text-xs" style={{ color: '#334155' }}>$0</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Tracking */}
      <div
        className="card-hover"
        style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', borderRadius: '6px', overflow: 'hidden' }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid #1E1E2E' }}
        >
          <span className="label">MONTHLY COSTS</span>
          <div className="flex items-center gap-3">
            <span className="mono text-xs" style={{ color: '#334155' }}>
              Fixed burn: <span style={{ color: '#F59E0B' }}>${fixedBurn}/mo</span>
            </span>
            <span className="mono text-xs" style={{ color: netPosition >= 0 ? '#10B981' : '#EF4444' }}>
              Net: ${netPosition}/mo
            </span>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1E1E2E' }}>
              <th className="px-5 py-2.5 text-left"><span className="label">Item</span></th>
              <th className="px-5 py-2.5 text-right"><span className="label">Monthly</span></th>
              <th className="px-5 py-2.5 text-left"><span className="label">Notes</span></th>
            </tr>
          </thead>
          <tbody>
            {COSTS.map((row, i) => (
              <tr key={row.item} style={{ borderBottom: i < COSTS.length - 1 ? '1px solid #16162A' : undefined }}>
                <td className="px-5 py-3">
                  <span className="text-xs font-medium" style={{ color: '#E2E8F0' }}>{row.item}</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="mono text-xs" style={{ color: row.monthly === 0 ? '#10B981' : row.monthly === null ? '#64748B' : '#F59E0B' }}>
                    {row.monthly === null ? 'variable' : row.monthly === 0 ? 'free' : `$${row.monthly}/mo`}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="mono text-xs" style={{ color: '#334155' }}>{row.notes}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
