'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Overview', icon: '📊' },
  { href: '/approvals', label: 'Approval Queue', icon: '✅' },
  { href: '/customers', label: 'Customers', icon: '👥' },
  { href: '/support', label: 'Support', icon: '🆘' },
  { href: '/financials', label: 'Financials', icon: '💰' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white"
        style={{ backgroundColor: '#1E293B' }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <span className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full z-40
          w-64 flex flex-col
          transform transition-transform duration-200
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: '#1E293B', borderRight: '1px solid #334155' }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid #334155' }}>
          <span className="text-2xl">🏔️</span>
          <div>
            <div className="font-bold text-white text-lg leading-tight">Top Dog OS</div>
            <div className="text-xs" style={{ color: '#94A3B8' }}>Business Command Center</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'text-white'
                    : 'hover:text-white'
                  }
                `}
                style={{
                  backgroundColor: isActive ? '#4CAF50' : 'transparent',
                  color: isActive ? 'white' : '#94A3B8',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#2D3F55'
                    e.currentTarget.style.color = 'white'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#94A3B8'
                  }
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '1px solid #334155' }}>
          <div className="text-xs" style={{ color: '#64748B' }}>
            <div className="font-medium" style={{ color: '#94A3B8' }}>Jeff Dankey</div>
            <div>jdankey@gmail.com</div>
          </div>
        </div>
      </aside>
    </>
  )
}
