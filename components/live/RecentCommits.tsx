'use client'

import { useEffect, useState } from 'react'

interface Commit {
  repo: string
  sha: string
  message: string
  author: string
  date: string
  url: string
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export default function RecentCommits() {
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/github/activity?days=7')
      .then((r) => r.json())
      .then((data) => {
        setCommits((data.commits ?? []).slice(0, 5))
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  return (
    <div
      className="card-hover"
      style={{
        border: '1px solid #1E1E2E',
        borderRadius: '6px',
        backgroundColor: '#0F0F1A',
        overflow: 'hidden',
      }}
    >
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderBottom: '1px solid #1E1E2E' }}
      >
        <span className="label">RECENT COMMITS</span>
        <span className="mono text-xs" style={{ color: '#334155' }}>
          github · 7d
        </span>
      </div>

      {loading && (
        <div className="px-4 py-4">
          <span className="mono text-xs" style={{ color: '#334155' }}>
            fetching commits…
          </span>
        </div>
      )}

      {error && (
        <div className="px-4 py-4">
          <span className="mono text-xs" style={{ color: '#EF4444' }}>
            github api unavailable
          </span>
        </div>
      )}

      {!loading && !error && commits.length === 0 && (
        <div className="px-4 py-4">
          <span className="mono text-xs" style={{ color: '#334155' }}>
            no commits in last 7 days
          </span>
        </div>
      )}

      {!loading && !error && commits.map((commit, i) => (
        <div
          key={commit.sha + i}
          className="px-4 py-2.5 flex items-start gap-3"
          style={{
            borderBottom: i < commits.length - 1 ? '1px solid #16162A' : undefined,
          }}
        >
          {/* Repo badge */}
          <span
            className="mono text-xs px-1.5 py-0.5 shrink-0 mt-0.5"
            style={{
              color: '#00D4AA',
              backgroundColor: 'rgba(0,212,170,0.08)',
              border: '1px solid rgba(0,212,170,0.2)',
              borderRadius: '3px',
              fontSize: '10px',
            }}
          >
            {commit.repo.replace('-app', '')}
          </span>
          {/* Message + meta */}
          <div className="min-w-0 flex-1">
            <div className="text-xs" style={{ color: '#94A3B8' }}>
              {truncate(commit.message, 60)}
            </div>
            <div className="flex gap-2 mt-0.5">
              <span className="mono text-xs" style={{ color: '#334155', fontSize: '10px' }}>
                {commit.sha}
              </span>
              <span className="mono text-xs" style={{ color: '#334155', fontSize: '10px' }}>
                {commit.author}
              </span>
              <span className="mono text-xs" style={{ color: '#334155', fontSize: '10px' }}>
                {timeAgo(commit.date)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
