'use client'

import { useState } from 'react'
import { PORTFOLIO } from '@/lib/portfolio'

interface Customer {
  id: string
  name: string
  email: string
  appId: string
  plan: string
  joined: string
  ltv: number
  status: 'active' | 'churned' | 'trial'
}

// Sample mock data — Connect Stripe for live data
const MOCK_CUSTOMERS: Customer[] = [
  // LawnGenius
  { id: 'c1', name: 'Mike Johnson', email: 'mike.j@email.com', appId: 'lawngenius', plan: 'Pro', joined: '2026-01-15', ltv: 29.99, status: 'active' },
  { id: 'c2', name: 'Sarah Williams', email: 'sarah.w@gmail.com', appId: 'lawngenius', plan: 'Free', joined: '2026-02-03', ltv: 0, status: 'trial' },
  { id: 'c3', name: 'Tom Baker', email: 'tbaker@outlook.com', appId: 'lawngenius', plan: 'Pro', joined: '2025-11-20', ltv: 89.97, status: 'active' },
  { id: 'c4', name: 'Lisa Chen', email: 'lchen@yahoo.com', appId: 'lawngenius', plan: 'Pro', joined: '2025-12-01', ltv: 59.98, status: 'active' },
  { id: 'c5', name: 'Dave Martinez', email: 'd.martinez@email.com', appId: 'lawngenius', plan: 'Pro', joined: '2026-01-08', ltv: 29.99, status: 'churned' },
  // SpaGenius
  { id: 'c6', name: 'Karen Powell', email: 'kpowell@gmail.com', appId: 'spagenius', plan: 'Pro', joined: '2026-02-10', ltv: 29.99, status: 'active' },
  { id: 'c7', name: 'James Ford', email: 'jford@email.com', appId: 'spagenius', plan: 'Free', joined: '2026-02-20', ltv: 0, status: 'trial' },
  { id: 'c8', name: 'Amanda Lee', email: 'amanda.lee@email.com', appId: 'spagenius', plan: 'Pro', joined: '2026-01-25', ltv: 59.98, status: 'active' },
  { id: 'c9', name: 'Chris Turner', email: 'cturner@outlook.com', appId: 'spagenius', plan: 'Pro', joined: '2025-12-15', ltv: 89.97, status: 'active' },
  { id: 'c10', name: 'Megan Harris', email: 'mharris@yahoo.com', appId: 'spagenius', plan: 'Free', joined: '2026-03-01', ltv: 0, status: 'trial' },
  // GardenGenius
  { id: 'c11', name: 'Bob Green', email: 'bob.green@email.com', appId: 'gardengenius', plan: 'Free', joined: '2026-03-02', ltv: 0, status: 'trial' },
  { id: 'c12', name: 'Nancy White', email: 'nwhite@gmail.com', appId: 'gardengenius', plan: 'Free', joined: '2026-03-03', ltv: 0, status: 'trial' },
  { id: 'c13', name: 'Paul Scott', email: 'pscott@email.com', appId: 'gardengenius', plan: 'Free', joined: '2026-03-04', ltv: 0, status: 'trial' },
  { id: 'c14', name: 'Rachel Adams', email: 'radams@outlook.com', appId: 'gardengenius', plan: 'Free', joined: '2026-03-04', ltv: 0, status: 'trial' },
  { id: 'c15', name: 'Steve Clark', email: 'sclark@email.com', appId: 'gardengenius', plan: 'Free', joined: '2026-03-05', ltv: 0, status: 'trial' },
  // AquariumGenius
  { id: 'c16', name: 'Wendy Hall', email: 'whall@gmail.com', appId: 'aquariumgenius', plan: 'Free', joined: '2026-03-03', ltv: 0, status: 'trial' },
  { id: 'c17', name: 'Eric Young', email: 'eyoung@email.com', appId: 'aquariumgenius', plan: 'Free', joined: '2026-03-04', ltv: 0, status: 'trial' },
  { id: 'c18', name: 'Donna King', email: 'dking@yahoo.com', appId: 'aquariumgenius', plan: 'Free', joined: '2026-03-04', ltv: 0, status: 'trial' },
  { id: 'c19', name: 'Frank Wright', email: 'fwright@email.com', appId: 'aquariumgenius', plan: 'Free', joined: '2026-03-05', ltv: 0, status: 'trial' },
  { id: 'c20', name: 'Gloria Lopez', email: 'glopez@outlook.com', appId: 'aquariumgenius', plan: 'Free', joined: '2026-03-05', ltv: 0, status: 'trial' },
  // ScoutGenius
  { id: 'c21', name: 'Henry Nelson', email: 'hnelson@farm.com', appId: 'scoutgenius', plan: 'Beta', joined: '2026-03-01', ltv: 0, status: 'trial' },
  { id: 'c22', name: 'Iowa Farms LLC', email: 'contact@iowafarms.com', appId: 'scoutgenius', plan: 'Beta', joined: '2026-03-02', ltv: 0, status: 'trial' },
  { id: 'c23', name: 'Dale Carter', email: 'dcarter@farm.net', appId: 'scoutgenius', plan: 'Beta', joined: '2026-03-03', ltv: 0, status: 'trial' },
  { id: 'c24', name: 'Midwest Ag Co', email: 'info@midwestag.com', appId: 'scoutgenius', plan: 'Beta', joined: '2026-03-04', ltv: 0, status: 'trial' },
  { id: 'c25', name: 'Terry Evans', email: 'tevans@farm.com', appId: 'scoutgenius', plan: 'Beta', joined: '2026-03-05', ltv: 0, status: 'trial' },
]

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: 'rgba(16,185,129,0.1)', text: '#10B981' },
  trial: { bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
  churned: { bg: 'rgba(239,68,68,0.1)', text: '#EF4444' },
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  return `${user.slice(0, 2)}***@${domain}`
}

function downloadCSV(data: Customer[]) {
  const headers = ['Name', 'Email', 'App', 'Plan', 'Joined', 'LTV', 'Status']
  const rows = data.map((c) => [
    c.name,
    c.email,
    PORTFOLIO.find((a) => a.id === c.appId)?.name ?? c.appId,
    c.plan,
    c.joined,
    `$${c.ltv.toFixed(2)}`,
    c.status,
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'topdog-customers.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<string>('all')

  const tabs = [
    { id: 'all', label: 'All Apps' },
    ...PORTFOLIO.map((a) => ({ id: a.id, label: `${a.emoji} ${a.name}` })),
  ]

  const filtered = activeTab === 'all' ? MOCK_CUSTOMERS : MOCK_CUSTOMERS.filter((c) => c.appId === activeTab)
  const topCustomers = [...MOCK_CUSTOMERS].sort((a, b) => b.ltv - a.ltv).slice(0, 3)

  const totalLTV = filtered.reduce((s, c) => s + c.ltv, 0)
  const activeCount = filtered.filter((c) => c.status === 'active').length

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ borderBottom: '1px solid #1E1E2E', paddingBottom: '12px' }}
      >
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold" style={{ color: '#E2E8F0' }}>Customers</h1>
          <span className="label">/ crm</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="mono text-xs px-2 py-1 rounded"
            style={{
              color: '#F59E0B',
              backgroundColor: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.15)',
              fontSize: '0.6rem',
            }}
          >
            Sample data — Connect Stripe for live
          </span>
          <button
            onClick={() => downloadCSV(filtered)}
            className="mono text-xs px-3 py-1.5 rounded transition-opacity hover:opacity-80"
            style={{
              color: '#64748B',
              backgroundColor: '#0F0F1A',
              border: '1px solid #1E1E2E',
            }}
          >
            Export CSV ↓
          </button>
        </div>
      </div>

      {/* Top customers */}
      <div>
        <span className="label block mb-3">TOP CUSTOMERS BY LTV</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topCustomers.map((c, rank) => {
            const app = PORTFOLIO.find((a) => a.id === c.appId)
            return (
              <div
                key={c.id}
                className="card-hover"
                style={{
                  backgroundColor: '#0F0F1A',
                  border: '1px solid #1E1E2E',
                  borderRadius: '6px',
                  padding: '14px 16px',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="mono text-xs" style={{ color: '#334155' }}>#{rank + 1}</span>
                  <span className="mono text-lg font-bold" style={{ color: '#00D4AA' }}>
                    ${c.ltv.toFixed(2)}
                  </span>
                </div>
                <div className="text-sm font-medium" style={{ color: '#E2E8F0' }}>{c.name}</div>
                <div className="mono text-xs mt-0.5" style={{ color: '#64748B' }}>{maskEmail(c.email)}</div>
                <div className="mono text-xs mt-1.5" style={{ color: '#334155' }}>
                  {app?.emoji} {app?.name} · {c.plan}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 flex-wrap"
        style={{ borderBottom: '1px solid #1E1E2E', paddingBottom: '0' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="mono text-xs px-3 py-2 transition-colors"
              style={{
                color: isActive ? '#00D4AA' : '#64748B',
                borderBottom: isActive ? '2px solid #00D4AA' : '2px solid transparent',
                backgroundColor: 'transparent',
                marginBottom: '-1px',
              }}
            >
              {tab.label}
            </button>
          )
        })}
        <div className="ml-auto flex items-center gap-3 pb-1">
          <span className="mono text-xs" style={{ color: '#334155' }}>
            {filtered.length} customers · {activeCount} active · LTV ${totalLTV.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Table */}
      <div
        className="card-hover"
        style={{
          backgroundColor: '#0F0F1A',
          border: '1px solid #1E1E2E',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E1E2E' }}>
                {['Name', 'Email', 'App', 'Plan', 'Joined', 'LTV', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">
                    <span className="label">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const app = PORTFOLIO.find((a) => a.id === c.appId)
                const sc = STATUS_COLORS[c.status] ?? STATUS_COLORS.trial
                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid #16162A' : undefined }}
                  >
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-medium" style={{ color: '#E2E8F0' }}>{c.name}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="mono text-xs" style={{ color: '#64748B' }}>{maskEmail(c.email)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="mono text-xs" style={{ color: '#64748B' }}>
                        {app?.emoji} {app?.name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="mono text-xs" style={{ color: '#94A3B8' }}>{c.plan}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="mono text-xs" style={{ color: '#334155' }}>
                        {new Date(c.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="mono text-xs font-semibold" style={{ color: c.ltv > 0 ? '#10B981' : '#334155' }}>
                        ${c.ltv.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="mono text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: sc.bg, color: sc.text, fontSize: '0.6rem', textTransform: 'uppercase' }}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
