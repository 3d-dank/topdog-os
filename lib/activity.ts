import fs from 'fs'
import path from 'path'

export type ActivityType = 'build' | 'feature' | 'launch' | 'infra' | 'milestone' | 'signup' | 'payment' | 'alert' | 'support'

export interface ActivityEntry {
  id: string
  ts: string
  text: string
  type: ActivityType
  appId: string
}

const DATA_PATH = path.join(process.cwd(), 'data', 'activity.json')

export function readActivity(): ActivityEntry[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8')
    const items: ActivityEntry[] = JSON.parse(raw)
    return items.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
  } catch {
    return []
  }
}

export function addActivity(item: Omit<ActivityEntry, 'id'>): ActivityEntry {
  const items = readActivity()
  const newItem: ActivityEntry = {
    ...item,
    id: `act_${Date.now()}`,
  }
  items.unshift(newItem)
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2))
  return newItem
}
