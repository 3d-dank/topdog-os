import fs from 'fs'
import path from 'path'

export type ApprovalType = 'Refund' | 'Support Escalation' | 'Review Response' | 'Alert'
export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'replied'

export interface ApprovalItem {
  id: string
  type: ApprovalType
  appName: string
  userName: string
  userEmail: string | null
  amount: number | null
  description: string
  timestamp: string
  status: ApprovalStatus
  resolvedAt?: string
  resolvedMessage?: string
}

const DATA_PATH = path.join(process.cwd(), 'data', 'approvals.json')

export function readApprovals(): ApprovalItem[] {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function writeApprovals(items: ApprovalItem[]): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2))
}

export function addApproval(item: Omit<ApprovalItem, 'id' | 'timestamp' | 'status'>): ApprovalItem {
  const items = readApprovals()
  const newItem: ApprovalItem = {
    ...item,
    id: `appr_${Date.now()}`,
    timestamp: new Date().toISOString(),
    status: 'pending',
  }
  items.push(newItem)
  writeApprovals(items)
  return newItem
}

export function updateApprovalStatus(
  id: string,
  status: ApprovalStatus,
  resolvedMessage?: string
): ApprovalItem | null {
  const items = readApprovals()
  const idx = items.findIndex((i) => i.id === id)
  if (idx === -1) return null
  items[idx].status = status
  items[idx].resolvedAt = new Date().toISOString()
  if (resolvedMessage) items[idx].resolvedMessage = resolvedMessage
  writeApprovals(items)
  return items[idx]
}
