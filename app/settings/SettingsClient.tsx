'use client'

import { useState } from 'react'
import type { Settings } from '@/lib/settings'

const APP_LIST: { key: keyof Settings['apps']; label: string; icon: string }[] = [
  { key: 'LawnGenius', label: 'LawnGenius', icon: '🌿' },
  { key: 'PoolIQ', label: 'PoolIQ', icon: '🏊' },
  { key: 'ScoutGenius', label: 'ScoutGenius', icon: '🔭' },
  { key: 'DroneSpray', label: 'Drone Spray', icon: '🚁' },
]

export default function SettingsClient({ initialSettings }: { initialSettings: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p style={{ color: '#94A3B8' }} className="text-sm mt-1">Configure Top Dog OS preferences</p>
      </div>

      {/* Telegram */}
      <section
        className="rounded-xl p-6"
        style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
      >
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span>📱</span> Telegram Notifications
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#CBD5E1' }}>
              Chat ID
            </label>
            <input
              type="text"
              value={settings.telegramChatId}
              onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#0F172A',
                border: '1px solid #334155',
              }}
            />
            <p className="text-xs mt-1.5" style={{ color: '#64748B' }}>
              Your Telegram chat ID for approval notifications
            </p>
          </div>
        </div>
      </section>

      {/* Approval thresholds */}
      <section
        className="rounded-xl p-6"
        style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
      >
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span>⚖️</span> Approval Thresholds
        </h2>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#CBD5E1' }}>
            Auto-approve refunds under $
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={settings.autoApproveUnder}
            onChange={(e) =>
              setSettings({ ...settings, autoApproveUnder: parseFloat(e.target.value) || 0 })
            }
            className="w-32 px-3 py-2 rounded-lg text-sm text-white focus:outline-none"
            style={{
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
            }}
          />
          <p className="text-xs mt-1.5" style={{ color: '#64748B' }}>
            Set to 0 to require approval for all refunds. Set to e.g. 10 to auto-approve refunds under $10.
          </p>
        </div>
      </section>

      {/* App toggles */}
      <section
        className="rounded-xl p-6"
        style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
      >
        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span>📱</span> App Monitoring
        </h2>
        <div className="space-y-3">
          {APP_LIST.map(({ key, label, icon }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-white text-sm font-medium">{label}</span>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    apps: { ...settings.apps, [key]: !settings.apps[key] },
                  })
                }
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
                style={{
                  backgroundColor: settings.apps[key] ? '#4CAF50' : '#334155',
                }}
                role="switch"
                aria-checked={settings.apps[key]}
              >
                <span
                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow"
                  style={{
                    transform: settings.apps[key] ? 'translateX(1.375rem)' : 'translateX(0.25rem)',
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#4CAF50' }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        {saved && (
          <span className="text-sm" style={{ color: '#4CAF50' }}>
            ✅ Settings saved!
          </span>
        )}
      </div>
    </div>
  )
}
