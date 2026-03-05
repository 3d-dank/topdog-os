'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  {
    href: '/',
    label: 'Overview',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8.5" y="1" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="1" y="8.5" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: '/projects',
    label: 'Projects',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="3" height="13" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="6" y="4" width="3" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
        <rect x="11" y="7" width="3" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: '/approvals',
    label: 'Approval Queue',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 3.5h13M1 7.5h9M1 11.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="12" cy="11.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M10.8 11.5l.8.8 1.4-1.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/customers',
    label: 'Customers',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7.5" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M2 13c0-3.038 2.462-5.5 5.5-5.5S13 9.962 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/support',
    label: 'Support',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 3.5C2 2.672 2.672 2 3.5 2h8c.828 0 1.5.672 1.5 1.5v6c0 .828-.672 1.5-1.5 1.5H9L6 13.5V11H3.5C2.672 11 2 10.328 2 9.5v-6z" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
  {
    href: '/financials',
    label: 'Financials',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="4" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M1.5 7h12" stroke="currentColor" strokeWidth="1.2"/>
        <path d="M5 2v2M10 2v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.3 1.5l-.4 1.3a5.5 5.5 0 00-1.2.7L3.4 3l-1.2 2.1 1 .9a5.5 5.5 0 000 1.4l-1 .9L3.4 10.5l1.3-.5a5.5 5.5 0 001.2.7l.4 1.3h2.4l.4-1.3a5.5 5.5 0 001.2-.7l1.3.5 1.2-2.1-1-.9a5.5 5.5 0 000-1.4l1-.9L11.6 3l-1.3.5a5.5 5.5 0 00-1.2-.7L8.7 1.5H6.3z" stroke="currentColor" strokeWidth="1.2"/>
        <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
      </svg>
    ),
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded"
        style={{ backgroundColor: '#0F0F1A', border: '1px solid #1E1E2E', color: '#E2E8F0' }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          {mobileOpen ? (
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          ) : (
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          )}
        </svg>
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/60"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static top-0 left-0 h-full z-40
          w-56 flex flex-col shrink-0
          transform transition-transform duration-200
          lg:translate-x-0
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: '#0D0D14', borderRight: '1px solid #1E1E2E' }}
      >
        {/* Logo */}
        <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid #1E1E2E' }}>
          <span style={{ fontSize: '1.1rem' }}>🏔</span>
          <div>
            <div
              className="mono font-bold tracking-wider text-sm"
              style={{ color: '#E2E8F0', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              Top Dog OS
            </div>
            <div className="label mt-0.5">ops dashboard</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-100 relative"
                style={{
                  backgroundColor: isActive ? 'rgba(0,212,170,0.06)' : 'transparent',
                  color: isActive ? '#00D4AA' : '#64748B',
                  borderLeft: isActive ? '2px solid #00D4AA' : '2px solid transparent',
                  borderRadius: '0 4px 4px 0',
                  marginLeft: '-2px',
                  paddingLeft: isActive ? '14px' : '12px',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
                    e.currentTarget.style.color = '#E2E8F0'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#64748B'
                  }
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.6 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid #1E1E2E' }}>
          <div className="label mb-1">signed in as</div>
          <div className="text-xs font-medium" style={{ color: '#94A3B8' }}>Jeff Dankey</div>
          <div className="mono mt-2 text-xs" style={{ color: '#334155' }}>v0.1.0 — alpha</div>
        </div>
      </aside>
    </>
  )
}
