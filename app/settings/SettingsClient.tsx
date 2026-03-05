'use client'

import { useState } from 'react'
import type { Settings } from '@/lib/settings'
import type { ApiKeyStatus } from './page'

const APP_LIST: { key: keyof Settings['apps']; label: string }[] = [
  { key: 'LawnGenius', label: 'lawngenius' },
  { key: 'PoolIQ', label: 'spagenius / pooliq' },
  { key: 'ScoutGenius', label: 'scoutgenius' },
  { key: 'DroneSpray', label: 'drone-spray (client project)' },
]

const APP_LINKS = [
  { label: 'TopDog OS', url: 'https://topdog-os.vercel.app', emoji: '🏔' },
  { label: 'GitHub Portfolio', url: 'https://github.com/3d-dank', emoji: '🐙' },
  { label: 'MN Drone Spray (client)', url: 'https://drone-spray-site.vercel.app', emoji: '🚁' },
  { label: 'Amazon Associates', url: 'https://affiliate-program.amazon.com', emoji: '📦' },
  { label: 'Expo EAS', url: 'https://expo.dev', emoji: '⚡' },
  { label: 'DigitalOcean', url: 'https://cloud.digitalocean.com', emoji: '💧' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ backgroundColor: checked ? 'rgba(0,212,170,0.2)' : '#1E1E2E', border: '1px solid ' + (checked ? 'rgba(0,212,170,0.4)' : '#334155'), borderRadius: '12px', position: 'relative', width: '36px', height: '20px', cursor: 'pointer' }}>
      <span style={{ position: 'absolute', top: '2px', left: checked ? '16px' : '2px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: checked ? '#00D4AA' : '#334155', transition: 'left 0.15s', boxShadow: checked ? '0 0 4px rgba(0,212,170,0.5)' : 'none' }} />
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card-hover" style={{ border: '1px solid #1E1E2E', borderRadius: '6px', backgroundColor: '#0F0F1A', overflow: 'hidden' }}>
      <div className="px-5 py-3" style={{ borderBottom: '1px solid #1E1E2E' }}><span className="label">{title}</span></div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

export default function SettingsClient({ initialSettings, apiKeys }: { initialSettings: Settings; apiKeys: ApiKeyStatus[] }) {
  const [settings, setSettings] = useState<Settings>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  const configuredCount = apiKeys.filter((k) => k.status === 'configured').length
  const is: React.CSSProperties = { width: '100%', backgroundColor: '#0A0A0F', border: '1px solid #1E1E2E', borderRadius: '4px', color: '#E2E8F0', padding: '8px 10px', fontSize: '0.75rem', fontFamily: 'monospace' }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div style={{ borderBottom: '1px solid #1E1E2E', paddingBottom: '12px' }}>
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold" style={{ color: '#E2E8F0' }}>Settings</h1>
          <span className="label">/ system configuration</span>
        </div>
      </div>

      <Section title="API KEYS">
        <div className="space-y-0">
          {apiKeys.map((k, i) => {
            const ok = k.status === 'configured'
            return (
              <div key={k.key} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < apiKeys.length - 1 ? '1px solid #16162A' : undefined }}>
                <div>
                  <div className="mono text-xs font-medium" style={{ color: '#94A3B8' }}>{k.key}</div>
                  <div className="mono text-xs mt-0.5" style={{ color: '#334155' }}>{k.label}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ok ? '#10B981' : '#EF4444', boxShadow: '0 0 4px ' + (ok ? '#10B981' : '#EF4444') }} />
                  <span className="mono text-xs" style={{ color: ok ? '#10B981' : '#EF4444' }}>{ok ? 'Configured' : 'Missing'}</span>
                </div>
              </div>
            )
          })}
          <div className="pt-3"><span className="mono text-xs" style={{ color: '#334155' }}>{configuredCount}/{apiKeys.length} keys configured - set in .env.local</span></div>
        </div>
      </Section>

      <Section title="APP LINKS">
        <div className="grid grid-cols-1 gap-2">
          {APP_LINKS.map((link) => (
            <div key={link.url} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '0.85rem' }}>{link.emoji}</span>
                <span className="mono text-xs" style={{ color: '#94A3B8' }}>{link.label}</span>
              </div>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="mono text-xs hover:underline" style={{ color: '#334155' }}>{link.url.replace('https://','')}</a>
            </div>
          ))}
        </div>
      </Section>

      <Section title="NOTIFICATIONS / TELEGRAM">
        <div>
          <label className="block mono text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>CHAT_ID</label>
          <input type="text" value={settings.telegramChatId} onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })} style={is} />
          <p className="mono text-xs mt-1.5" style={{ color: '#334155' }}>// telegram chat id for approval alerts</p>
        </div>
      </Section>

      <Section title="APPROVAL THRESHOLDS">
        <div>
          <label className="block mono text-xs font-medium mb-1.5" style={{ color: '#94A3B8' }}>AUTO_APPROVE_UNDER ($)</label>
          <input type="number" value={settings.autoApproveUnder} onChange={(e) => setSettings({ ...settings, autoApproveUnder: parseFloat(e.target.value) || 0 })} style={{ ...is, width: '120px' }} />
          <p className="mono text-xs mt-1.5" style={{ color: '#334155' }}>// 0 = require all approvals</p>
        </div>
      </Section>

      <Section title="APP MONITORING">
        <div className="space-y-0">
          {APP_LIST.map(({ key, label }, i) => (
            <div key={key} className="flex items-center justify-between py-2.5" style={{ borderBottom: i < APP_LIST.length - 1 ? '1px solid #16162A' : undefined }}>
              <span className="mono text-xs font-medium" style={{ color: '#94A3B8' }}>{label}</span>
              <div className="flex items-center gap-2">
                <span className="mono text-xs" style={{ color: settings.apps[key] ? '#00D4AA' : '#334155' }}>{settings.apps[key] ? 'enabled' : 'disabled'}</span>
                <Toggle checked={settings.apps[key]} onChange={(v) => setSettings({ ...settings, apps: { ...settings.apps, [key]: v } })} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving} className="mono text-xs font-semibold px-5 py-2 hover:opacity-80 disabled:opacity-40" style={{ backgroundColor: saving ? 'transparent' : 'rgba(0,212,170,0.1)', color: '#00D4AA', border: '1px solid rgba(0,212,170,0.3)', borderRadius: '4px' }}>
          {saving ? '// saving...' : '[ SAVE SETTINGS ]'}
        </button>
        {saved && <span className="mono text-xs" style={{ color: '#10B981' }}>saved</span>}
      </div>
    </div>
  )
}
