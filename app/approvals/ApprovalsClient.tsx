'use client'

import { useState } from 'react'
import type { ApprovalItem, ApprovalStatus } from '@/lib/approvals'

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Refund: { bg: '#3B82F620', text: '#60A5FA' },
  'Support Escalation': { bg: '#F59E0B20', text: '#FCD34D' },
  'Review Response': { bg: '#8B5CF620', text: '#A78BFA' },
  Alert: { bg: '#EF444420', text: '#F87171' },
}

const APP_COLORS: Record<string, string> = {
  LawnGenius: '#4CAF50',
  PoolIQ: '#3B82F6',
  ScoutGenius: '#8B5CF6',
  'Drone Spray': '#F59E0B',
}

function formatTime(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
          <p style={{ color: '#94A3B8' }} className="text-sm mt-1">
            Items that need your decision before action is taken
          </p>
        </div>
        {pending.length > 0 && (
          <span
            className="px-3 py-1 rounded-full text-sm font-bold text-white"
            style={{ backgroundColor: '#EF4444' }}
          >
            {pending.length} pending
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ backgroundColor: '#1E293B' }}>
        {(['pending', 'resolved'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all"
            style={{
              backgroundColor: tab === t ? '#4CAF50' : 'transparent',
              color: tab === t ? 'white' : '#94A3B8',
            }}
          >
            {t} {t === 'pending' ? `(${pending.length})` : `(${resolved.length})`}
          </button>
        ))}
      </div>

      {/* Items */}
      {displayItems.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
        >
          <div className="text-4xl mb-3">
            {tab === 'pending' ? '🎉' : '📋'}
          </div>
          <div className="text-white font-medium">
            {tab === 'pending' ? 'All clear! No pending items.' : 'No resolved items yet.'}
          </div>
          <div className="text-sm mt-1" style={{ color: '#64748B' }}>
            {tab === 'pending' ? 'New items will appear here when they need your attention.' : 'Resolved approvals will show here.'}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayItems.map((item) => {
            const typeColor = TYPE_COLORS[item.type] || { bg: '#33415520', text: '#94A3B8' }
            const appColor = APP_COLORS[item.appName] || '#94A3B8'

            return (
              <div
                key={item.id}
                className="rounded-xl p-5"
                style={{
                  backgroundColor: '#1E293B',
                  border: item.status === 'pending' ? '1px solid #334155' : '1px solid #2D3748',
                  opacity: item.status !== 'pending' ? 0.75 : 1,
                }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Type badge */}
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                    >
                      {item.type}
                    </span>
                    {/* App badge */}
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: `${appColor}20`, color: appColor }}
                    >
                      {item.appName}
                    </span>
                    {/* Status badge for resolved */}
                    {item.status !== 'pending' && (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                        style={{
                          backgroundColor:
                            item.status === 'approved'
                              ? '#4CAF5020'
                              : item.status === 'denied'
                              ? '#EF444420'
                              : '#8B5CF620',
                          color:
                            item.status === 'approved'
                              ? '#4CAF50'
                              : item.status === 'denied'
                              ? '#F87171'
                              : '#A78BFA',
                        }}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>
                  <span className="text-xs shrink-0" style={{ color: '#64748B' }}>
                    {formatTime(item.timestamp)}
                  </span>
                </div>

                {/* User info */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ backgroundColor: appColor + '40' }}
                  >
                    {item.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{item.userName}</div>
                    {item.userEmail && (
                      <div className="text-xs" style={{ color: '#64748B' }}>{item.userEmail}</div>
                    )}
                  </div>
                  {item.amount && (
                    <div
                      className="ml-auto text-lg font-bold"
                      style={{ color: '#F59E0B' }}
                    >
                      ${item.amount.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm mb-4 leading-relaxed" style={{ color: '#CBD5E1' }}>
                  {item.description}
                </p>

                {/* Reply box */}
                {replyId === item.id && (
                  <div className="mb-4">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        color: 'white',
                        // @ts-expect-error CSS custom property
                        '--tw-ring-color': '#4CAF50',
                      }}
                    />
                  </div>
                )}

                {/* Resolved message */}
                {item.resolvedMessage && (
                  <div
                    className="mb-4 px-3 py-2 rounded-lg text-sm italic"
                    style={{ backgroundColor: '#0F172A', color: '#94A3B8' }}
                  >
                    &ldquo;{item.resolvedMessage}&rdquo;
                  </div>
                )}

                {/* Action buttons */}
                {item.status === 'pending' && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleAction(item.id, 'approve')}
                      disabled={loading === item.id + 'approve'}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#4CAF50' }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleAction(item.id, 'deny')}
                      disabled={loading === item.id + 'deny'}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      ❌ Deny
                    </button>
                    <button
                      onClick={() =>
                        replyId === item.id
                          ? handleAction(item.id, 'reply')
                          : setReplyId(item.id)
                      }
                      disabled={loading === item.id + 'reply'}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{
                        backgroundColor: '#334155',
                        color: '#CBD5E1',
                      }}
                    >
                      {replyId === item.id ? '📤 Send Reply' : '💬 Reply'}
                    </button>
                    {replyId === item.id && (
                      <button
                        onClick={() => { setReplyId(null); setReplyText('') }}
                        className="px-3 py-2 rounded-lg text-sm transition-opacity hover:opacity-90"
                        style={{ color: '#64748B' }}
                      >
                        Cancel
                      </button>
                    )}
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
