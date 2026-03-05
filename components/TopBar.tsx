'use client'

import { useEffect, useState } from 'react'

export default function TopBar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: 'America/Chicago',
        }) + ' CT'
      )
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header
      className="flex items-center justify-between px-6 shrink-0"
      style={{
        backgroundColor: '#0D0D14',
        borderBottom: '1px solid #1E1E2E',
        height: '48px',
      }}
    >
      <div className="flex items-center gap-3 ml-10 lg:ml-0">
        <span
          className="label"
          style={{ color: '#334155' }}
        >
          SYSTEM STATUS
        </span>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium mono px-2 py-0.5"
          style={{
            color: '#10B981',
            backgroundColor: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.15)',
            borderRadius: '3px',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: '#10B981',
              boxShadow: '0 0 4px #10B981',
              animation: 'pulse 2s infinite',
            }}
          />
          OPERATIONAL
        </span>
      </div>

      <div className="flex items-center gap-5">
        {/* Clock */}
        <span className="mono text-xs" style={{ color: '#334155' }}>
          {time}
        </span>

        {/* Notification bell */}
        <button
          className="relative flex items-center justify-center transition-colors hover:opacity-80"
          aria-label="Notifications"
          style={{ color: '#64748B' }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 1.5A4 4 0 003.5 5.5V9L2 10.5v.5h11v-.5L11.5 9V5.5A4 4 0 007.5 1.5z" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M6 11.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          <span
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full text-xs flex items-center justify-center font-bold mono"
            style={{ backgroundColor: '#EF4444', color: 'white', fontSize: '9px' }}
          >
            3
          </span>
        </button>
      </div>
    </header>
  )
}
