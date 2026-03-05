'use client'

import { useEffect, useState } from 'react'

export default function TopBar() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Chicago',
      }) + ' CT')
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header
      className="flex items-center justify-between px-6 py-3 shrink-0"
      style={{
        backgroundColor: '#1E293B',
        borderBottom: '1px solid #334155',
        minHeight: '60px',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-white ml-10 lg:ml-0">Top Dog OS</span>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#4CAF5020', color: '#4CAF50' }}>
          LIVE
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Clock */}
        <span className="text-sm font-mono" style={{ color: '#94A3B8' }}>
          {time}
        </span>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg transition-colors hover:bg-white/5"
          aria-label="Notifications"
        >
          <span className="text-lg">🔔</span>
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: '#EF4444' }}
          >
            3
          </span>
        </button>
      </div>
    </header>
  )
}
