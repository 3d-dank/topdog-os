import { NextRequest, NextResponse } from 'next/server'
import { sendTelegram, formatApprovalNotification } from '@/lib/telegram'
import { readSettings } from '@/lib/settings'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const settings = readSettings()

    const item = {
      type: body.type || 'Alert',
      appName: body.appName || 'Unknown App',
      userName: body.userName || 'Unknown',
      amount: body.amount || null,
      description: body.description || '',
    }

    const message = formatApprovalNotification(item)
    const chatId = body.chatId || settings.telegramChatId

    const ok = await sendTelegram(message, chatId)

    return NextResponse.json({ ok }, { status: 200 })
  } catch (err) {
    console.error('[Notify] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
