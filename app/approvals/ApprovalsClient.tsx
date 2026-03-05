'use client'

import { useState } from 'react'
import type { ApprovalItem } from '@/lib/approvals'

function formatAge(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

function TypeBadge({ type }: { type: string }) {
  const lc = type.toLowerCase()
  let bg = '#1E1E2E'
  let color = '#64748B'
  let border = '#1E1E2E'
  let label = type

  if (lc.includes('refund')) {
    bg = 'rgba(239,68,68,0.08)'
    color = '#EF4444'
    border = 'rgba(239,68,68,0.3)'
    label = 'REFUND'
  } else if (lc.includes('escalation')) {
    bg = 'rgba(245,158,11,0.08)'
    color = '#F59E0B'
    border = 'rgba(245,158,11,0.3)'
    label = 'ESCALATION'
  } else if (lc.includes('dispute')) {
    bg = 'rgba(239,68,68,0.06)'
    color = '#EF4444'
    border = 'rgba(239,68,68,0.4)'
    label = 'DISPUTE'
  } else if (lc.includes('review')) {
    bg = 'rgba(99,102,241,0.08)'
    color = '#6366F1'
    border = 'rgba(99,102,241,0.3)'
    label = 'REVIEW'
  } else if (lc.includes('alert')) {
    bg = 'rgba(239,68,68,0.08)'
    color = '#EF4444'
    border = 'rgba(239,68,68,0.3)'
    label = 'ALERT'
  }

  return (
    <span
      className="mono text-xs font-semibold px-2 py-0.5"
      style={{
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        borderRadius: '3px',
        letterSpacing: '0.05em',
      }}
    >
      {label}
    </span>
  )
}

function AppBadge({ name }: { name: string }) {
  return (
    <span
      className="mono text-xs px-1.5 py-0.5"
      style={{
        color: '#94A3B8',
        backgroundColor: '#13131F',
        border: '1px solid #1E1E2E',
        borderRadius: '3px',
      }}
    >
      {name.toLowerCase().replace(' ', '-')}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = '#64748B'
  if (status === 'approved') color = '#10B981'
  if (status === 'denied') color = '#EF4444'
  if (status === 'replied') color = '#6366F1'

  return (
    <span
      className="mono text-xs font-semibold uppercase px-1.5 py-0.5"
      style={{
        color,
        backgroundColor: `${color}12`,
        border: `1px solid ${color}30`,
        borderRadius: '3px',
      }}
    >
      {status}
    </span>
  )
}

function ActionBtn({
  label,
  onClick,
  disabled,
  variant = 'default',
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  variant?: 'approve' | 'deny' | 'default'
}) {
  const colors = {
    approve: { color: '#10B981', border: 'rgba(16,185,129,0.3)', bg: 'rgba(16,185,129,0.06)' },
    deny: { color: '#EF4444', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.06)' },
    default: { color: '#64748B', border: '#1E1E2E', bg: 'transparent' },
  }
  const c = colors[variant]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mono text-xs px-2.5 py-1 transition-opacity hover:opacity-80 disabled:opacity-30"
      style={{
        color: c.color,
        backgroundColor: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: '3px',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  )
}

export default function ApprovalsClient({ initialItems }: { initialItems: ApprovalItem[] }) {
  const [items, setItems] = useState<ApprovalItem[]>(initialItems)
  const [tab, setTab] = useState<'pending' | 'resolved'>('pending')
  const [replyId, setReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const pending = items.filter((i) => i.status === 'pending')
  const resolved = items.filter((i) => i.status !== 'pending')

  async function handleAction(id: string, action: 'approve' | 'deny' | 'reply') {
    if (action === 'reply' && replyId !== id) {
      setReplyId(id)
      return
    }
    setLoading(id + action)
    try {
      const res = await fetch(`/api/approvals/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, message: action === 'reply' ? replyText : undefined }),
      })
      if (res.ok) {
        const updated = await res.json()
        setItems((prev) => prev.map((i) => (i.id === id ? updated.item : i)))
        if (action === 'reply') {
          setReplyId(null)
          setReplyText('')
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  const displayItems = tab === 'pending' ? pending : resolved

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Page header */}
      <div
        className="flex items-center justify-between"
        style={{ borderBottom: '1px solid #1E1E2E', paddingBottom: '12px' }}
      >
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold" style={{ color: '#E2E8F0' }}>Approval Queue</h1>
          <span className="label">/ items requiring action</span>
        </div>
        {pending.length > 0 && (
          <span
            className="mono text-xs font-semibold px-2.5 py-1"
            style={{
              color: '#EF4444',
              backgroundColor: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '3px',
            }}
          >
            {pending.length} PENDING
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1" style={{ borderBottom: '1px solid #1E1E2E' }}>
        {(['pending', 'resolved'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="mono text-xs font-semibold px-3 py-2 capitalize transition-colors relative"
            style={{
              color: tab === t ? '#00D4AA' : '#64748B',
              borderBottom: tab === t ? '2px solid #00D4AA' : '2px solid transparent',
              marginBottom: '-1px',
              backgroundColor: 'transparent',
            }}
          >
            {t.toUpperCase()} ({t === 'pending' ? pending.length : resolved.length})
          </button>
        ))}
      </div>

      {/* Item list */}
      {displayItems.length === 0 ? (
        <div
          className="px-6 py-12 text-center"
          style={{ border: '1px solid #1E1E2E', borderRadius: '6px', backgroundColor: '#0F0F1A' }}
        >
          <div className="mono text-xs mb-2" style={{ color: '#334155' }}>
            {tab === 'pending' ? '// no pending items' : '// no resolved items'}
          </div>
          <div className="text-sm" style={{ color: '#64748B' }}>
            {tab === 'pending'
              ? 'Queue is clear. New items appear here when flagged.'
              : 'Resolved items will appear here.'}
          </div>
        </div>
      ) : (
        <div
          style={{ border: '1px solid #1E1E2E', borderRadius: '6px', backgroundColor: '#0F0F1A', overflow: 'hidden' }}
        >
          {/* Table header */}
          <div
            className="grid px-4 py-2"
            style={{
              gridTemplateColumns: '140px 1fr 120px 80px 80px 200px',
              borderBottom: '1px solid #1E1E2E',
              gap: '0 12px',
            }}
          >
            {['TYPE', 'DESCRIPTION', 'APP', 'AMOUNT', 'AGE', 'ACTIONS'].map((h) => (
              <span key={h} className="label">{h}</span>
            ))}
          </div>

          {displayItems.map((item, idx) => {
            const isResolved = item.status !== 'pending'
            return (
              <div key={item.id}>
                <div
                  className="grid px-4 py-3 items-center transition-colors"
                  style={{
                    gridTemplateColumns: '140px 1fr 120px 80px 80px 200px',
                    gap: '0 12px',
                    borderBottom: idx < displayItems.length - 1 ? '1px solid #16162A' : undefined,
                    backgroundColor: isResolved ? 'transparent' : 'transparent',
                    opacity: isResolved ? 0.55 : 1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.015)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {/* Type */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <TypeBadge type={item.type} />
                    {isResolved && <StatusBadge status={item.status} />}
                  </div>

                  {/* Description + user */}
                  <div className="min-w-0">
                    <div
                      className="text-xs truncate"
                      style={{
                        color: isResolved ? '#334155' : '#94A3B8',
                        textDecoration: isResolved ? 'line-through' : undefined,
                      }}
                    >
                      {item.description}
                    </div>
                    <div className="mono text-xs mt-0.5" style={{ color: '#334155' }}>
                      {item.userName}
                      {item.userEmail && ` · ${item.userEmail}`}
                    </div>
                  </div>

                  {/* App */}
                  <div><AppBadge name={item.appName} /></div>

                  {/* Amount */}
                  <div className="mono text-xs font-semibold" style={{ color: item.amount ? '#F59E0B' : '#334155' }}>
                    {item.amount ? `$${item.amount.toFixed(2)}` : '—'}
                  </div>

                  {/* Age */}
                  <div className="mono text-xs" style={{ color: '#334155' }}>
                    {formatAge(item.timestamp)}
                  </div>

                  {/* Actions */}
                  <div>
                    {item.status === 'pending' ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <ActionBtn
                          label="[Approve]"
                          onClick={() => handleAction(item.id, 'approve')}
                          disabled={loading === item.id + 'approve'}
                          variant="approve"
                        />
                        <ActionBtn
                          label="[Deny]"
                          onClick={() => handleAction(item.id, 'deny')}
                          disabled={loading === item.id + 'deny'}
                          variant="deny"
                        />
                        <ActionBtn
                          label={replyId === item.id ? '[Send]' : '[Reply]'}
                          onClick={() =>
                            replyId === item.id
                              ? handleAction(item.id, 'reply')
                              : setReplyId(item.id)
                          }
                          disabled={loading === item.id + 'reply'}
                        />
                        {replyId === item.id && (
                          <button
                            onClick={() => { setReplyId(null); setReplyText('') }}
                            className="mono text-xs"
                            style={{ color: '#334155' }}
                          >
                            cancel
                          </button>
                        )}
                      </div>
                    ) : (
                      item.resolvedMessage && (
                        <div
                          className="text-xs italic truncate"
                          style={{ color: '#334155' }}
                          title={item.resolvedMessage}
                        >
                          &ldquo;{item.resolvedMessage}&rdquo;
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Reply textarea row */}
                {replyId === item.id && (
                  <div
                    className="px-4 pb-3"
                    style={{ borderBottom: idx < displayItems.length - 1 ? '1px solid #16162A' : undefined }}
                  >
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="// type reply..."
                      rows={2}
                      className="mono w-full text-xs resize-none focus:outline-none px-3 py-2"
                      style={{
                        backgroundColor: '#0A0A0F',
                        border: '1px solid #1E1E2E',
                        borderRadius: '4px',
                        color: '#E2E8F0',
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
