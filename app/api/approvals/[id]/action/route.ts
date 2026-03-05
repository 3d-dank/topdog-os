import { NextRequest, NextResponse } from 'next/server'
import { updateApprovalStatus, readApprovals } from '@/lib/approvals'
import { sendTelegram } from '@/lib/telegram'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, message } = body

    if (!['approve', 'deny', 'reply'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const statusMap: Record<string, 'approved' | 'denied' | 'replied'> = {
      approve: 'approved',
      deny: 'denied',
      reply: 'replied',
    }

    const item = updateApprovalStatus(id, statusMap[action], message)

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Send Telegram confirmation
    const actionEmojis: Record<string, string> = {
      approved: '✅',
      denied: '❌',
      replied: '💬',
    }
    const emoji = actionEmojis[item.status] || '📋'
    const amountStr = item.amount ? ` ($${item.amount.toFixed(2)})` : ''
    const telegramMsg = `${emoji} <b>${item.type} ${item.status}</b>
👤 ${item.userName}${amountStr}
📱 ${item.appName}${message ? `\n\n💬 "${message}"` : ''}`

    await sendTelegram(telegramMsg)

    return NextResponse.json({ ok: true, item }, { status: 200 })
  } catch (err) {
    console.error('[Approval Action] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
