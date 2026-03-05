import SettingsClient from './SettingsClient'
import { readSettings } from '@/lib/settings'

export interface ApiKeyStatus {
  key: string
  label: string
  status: 'configured' | 'missing'
}

export default function SettingsPage() {
  const settings = readSettings()

  const apiKeys: ApiKeyStatus[] = [
    { key: 'OPENAI_API_KEY', label: 'OpenAI API Key', status: process.env.OPENAI_API_KEY ? 'configured' : 'missing' },
    { key: 'STRIPE_SECRET_KEY', label: 'Stripe Secret Key', status: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing' },
    { key: 'TELEGRAM_BOT_TOKEN', label: 'Telegram Bot Token', status: process.env.TELEGRAM_BOT_TOKEN ? 'configured' : 'missing' },
    { key: 'XAI_API_KEY', label: 'xAI / Grok API Key', status: process.env.XAI_API_KEY ? 'configured' : 'missing' },
  ]

  return <SettingsClient initialSettings={settings} apiKeys={apiKeys} />
}
