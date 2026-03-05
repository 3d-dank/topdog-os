import fs from 'fs'
import path from 'path'

export interface Settings {
  telegramChatId: string
  autoApproveUnder: number
  apps: {
    LawnGenius: boolean
    PoolIQ: boolean
    ScoutGenius: boolean
    DroneSpray: boolean
  }
}

const SETTINGS_PATH = path.join(process.cwd(), 'data', 'settings.json')

const DEFAULT_SETTINGS: Settings = {
  telegramChatId: '8762213445',
  autoApproveUnder: 0,
  apps: {
    LawnGenius: true,
    PoolIQ: true,
    ScoutGenius: true,
    DroneSpray: true,
  },
}

export function readSettings(): Settings {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, 'utf-8')
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function writeSettings(settings: Settings): void {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2))
}
