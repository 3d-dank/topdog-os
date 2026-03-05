import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export const metadata: Metadata = {
  title: 'Top Dog OS 🏔️',
  description: 'Business operations dashboard for Jeff Dankey\'s app portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0F172A' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto p-6" style={{ backgroundColor: '#0F172A' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
