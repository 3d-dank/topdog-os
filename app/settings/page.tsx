import SettingsClient from './SettingsClient'
import { readSettings } from '@/lib/settings'

export default function SettingsPage() {
  const settings = readSettings()
  return <SettingsClient initialSettings={settings} />
}
