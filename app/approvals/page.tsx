import { readApprovals } from '@/lib/approvals'
import ApprovalsClient from './ApprovalsClient'

export default function ApprovalsPage() {
  const items = readApprovals()
  return <ApprovalsClient initialItems={items} />
}
