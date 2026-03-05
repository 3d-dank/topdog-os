'use client'

import { useState } from 'react'
import type { Settings } from '@/lib/settings'

const APP_LIST: { key: keyof Settings['apps']; label: string }[] = [
  { key: 'LawnGenius', label: 'lawngenius' },
  { key: 'PoolIQ', label: 'pooliq' },
  { key: 'ScoutGenius', label: 'scoutgenius' },
  { key: 'DroneSpray', label: 'drone-spray' },
]

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 items-center transition-colors focus:outline-none"
      style={{
        backgroundColor: checked ? 'rgba(0,212,170,0.2)' : '#1E1E2E',
        border: `1px solid ${checked ? 'rgba(0,212,170,0.4)' : '#334155'}`,
        borderRadius: '12px',
      }}
      role="switch"
      aria-checked={checked}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full transition-transform duration-150"
        style={{
          backgroundColor: checked ? '#00D4AA' : '#334155',
          transform: checked ? 'translateX(18px)' : 'translateX(2px)',
          boxShadow: checked ? '0 0 4px rgba(0,212,170,0.5)' : 'none',
        }}
      />
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="card-hover"
      style={{ border: '1px solid #1E1E2E', borderRadius: '6px', backgroundColor: '#0F0F1A', overflow: 'hidden' }}
    >
      <div className="px-5 py-3" style={{ borderBottom: '1px solid #1E1E2E' }}>
        <span className="label">{title}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

function InputField({
  label,
  hint,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  hint?: string
  value: string | number
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label
        className="block mono text-xs font-medium mb-1.5"
        style={{ color: '#94A3B8' }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mono text-xs focus:outline-none px-3 py-2"
        style={{
          width: type === 'number' ? '120px' : '100%',
          backgroundColor: '#0A0A0F',
          border: '1px solid #1E1E2E',
          borderRadius: '4px',
          color: '#E2E8F0',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,212,170,0.4)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = '#1E1E2E' }}
      />
      {hint && (
        <p className="mono text-xs mt-1.5" style={{ color: '#334155' }}>{hint}</p>
      )}
    </div>
  )
}

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
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Page header */}
      <div style={{ borderBottom: '1px solid #1E1E2E', paddingBottom: '12px' }}>
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold" style={{ color: '#E2E8F0' }}>Settings</h1>
          <span className="label">/ system configuration</span>
        </div>
      </div>

      {/* Telegram */}
      <Section title="NOTIFICATIONS / TELEGRAM">
        <InputField
          label="CHAT_ID"
          hint="// telegram chat id for approval alerts"
          value={settings.telegramChatId}
          onChange={(v) => setSettings({ ...settings, telegramChatId: v })}
        />
      </Section>

      {/* Approval thresholds */}
      <Section title="APPROVAL THRESHOLDS">
        <InputField
          label="AUTO_APPROVE_UNDER ($)"
          hint="// set 0 to require all approvals · e.g. 10 to auto-approve refunds < $10"
          value={settings.autoApproveUnder}
          type="number"
          onChange={(v) =>
            setSettings({ ...settings, autoApproveUnder: parseFloat(v) || 0 })
          }
        />
      </Section>

      {/* App toggles */}
      <Section title="APP MONITORING">
        <div className="space-y-0">
          {APP_LIST.map(({ key, label }, i) => (
            <div
              key={key}
              className="flex items-center justify-between py-2.5"
              style={{
                borderBottom: i < APP_LIST.length - 1 ? '1px solid #16162A' : undefined,
              }}
            >
              <span className="mono text-xs font-medium" style={{ color: '#94A3B8' }}>
                {label}
              </span>
              <div className="flex items-center gap-2">
                <span className="mono text-xs" style={{ color: settings.apps[key] ? '#00D4AA' : '#334155' }}>
                  {settings.apps[key] ? 'enabled' : 'disabled'}
                </span>
                <ToggleSwitch
                  checked={settings.apps[key]}
                  onChange={(v) =>
                    setSettings({
                      ...settings,
                      apps: { ...settings.apps, [key]: v },
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="mono text-xs font-semibold px-5 py-2 transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{
            backgroundColor: saving ? 'transparent' : 'rgba(0,212,170,0.1)',
            color: '#00D4AA',
            border: '1px solid rgba(0,212,170,0.3)',
            borderRadius: '4px',
          }}
        >
          {saving ? '// saving...' : '[ SAVE SETTINGS ]'}
        </button>
        {saved && (
          <span className="mono text-xs" style={{ color: '#10B981' }}>
            ✓ saved
          </span>
        )}
      </div>
    </div>
  )
}
