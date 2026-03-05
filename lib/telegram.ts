export async function sendTelegram(message: string, chatId?: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const targetChatId = chatId || '8762213445'

  if (!token) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN not set — skipping notification')
    return false
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
    const data = await res.json()
    if (!data.ok) {
      console.error('[Telegram] Send failed:', data.description)
      return false
    }
    return true
  } catch (err) {
    console.error('[Telegram] Error:', err)
    return false
  }
}

export function formatApprovalNotification(item: {
  type: string
  appName: string
  userName: string
  amount: number | null
  description: string
}): string {
  const typeEmoji: Record<string, string> = {
    Refund: '💰',
    'Support Escalation': '🆘',
    'Review Response': '⭐',
    Alert: '🚨',
  }
  const emoji = typeEmoji[item.type] || '📋'
  const amountStr = item.amount ? ` — $${item.amount.toFixed(2)}` : ''

  return `${emoji} <b>${item.type}${amountStr}</b>
📱 App: ${item.appName}
👤 User: ${item.userName}

${item.description}

⚡ Action needed in Top Dog OS`
}
