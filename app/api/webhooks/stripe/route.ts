import { NextRequest, NextResponse } from 'next/server'
import { addApproval } from '@/lib/approvals'
import { sendTelegram, formatApprovalNotification } from '@/lib/telegram'

// Helper to log to data/activity.json
async function logActivity(entry: {
  type: string
  text: string
  appName?: string
  amount?: number | null
}) {
  try {
    const { addActivity } = await import('@/lib/activity')
    type AT = 'build'|'feature'|'launch'|'infra'|'milestone'|'signup'|'payment'|'alert'|'support'
    const valid: string[] = ['build','feature','launch','infra','milestone','signup','payment','alert','support']
    const safeType: AT = valid.includes(entry.type) ? (entry.type as AT) : 'alert'
    addActivity({ type: safeType, text: entry.text, appId: 'system', ts: new Date().toISOString() })
  } catch (err) {
    console.warn('[Stripe Webhook] Could not log activity:', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const event = body

    let newItem = null

    switch (event.type) {
      // ─── Payment intent succeeded ──────────────────────────────
      case 'payment_intent.succeeded': {
        const pi = event.data?.object
        const amount = pi?.amount ? pi.amount / 100 : null
        const appName = pi?.metadata?.app_name || 'Unknown App'
        const customerEmail = pi?.receipt_email || pi?.customer || 'Unknown'

        await logActivity({
          type: 'payment',
          text: `Payment succeeded — ${appName} — $${amount?.toFixed(2) ?? '?'}`,
          appName,
          amount,
        })

        await sendTelegram(
          `💳 <b>Payment succeeded</b> — ${appName} — $${amount?.toFixed(2) ?? '?'}\n👤 ${customerEmail}`
        )
        break
      }

      // ─── New subscription ──────────────────────────────────────
      case 'customer.subscription.created': {
        const sub = event.data?.object
        const appName = sub?.metadata?.app_name || 'Unknown App'
        const amountCents =
          sub?.plan?.amount ?? sub?.items?.data?.[0]?.price?.unit_amount ?? 0
        const amount = amountCents / 100

        newItem = addApproval({
          type: 'Alert',
          appName,
          userName: sub?.customer || 'Unknown Customer',
          userEmail: null,
          amount,
          description: `New subscriber — ${appName} — $${amount.toFixed(2)}/mo`,
        })

        await logActivity({
          type: 'signup',
          text: `New subscriber — ${appName} — $${amount.toFixed(2)}/mo`,
          appName,
          amount,
        })

        await sendTelegram(
          `🎉 <b>New subscriber</b> — ${appName} — $${amount.toFixed(2)}/mo`
        )
        break
      }

      // ─── Subscription cancelled ────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data?.object
        const appName = sub?.metadata?.app_name || 'Unknown App'

        newItem = addApproval({
          type: 'Alert',
          appName,
          userName: sub?.customer || 'Unknown Customer',
          userEmail: null,
          amount: null,
          description: `Subscription cancelled — customer ${sub?.customer} cancelled their ${sub?.plan?.nickname || sub?.items?.data?.[0]?.price?.nickname || 'subscription'} plan.`,
        })

        await logActivity({
          type: 'alert',
          text: `Churned — ${appName}`,
          appName,
        })

        await sendTelegram(`⚠️ <b>Churned</b> — ${appName}`)
        break
      }

      // ─── Invoice payment failed ────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data?.object
        const customerEmail =
          invoice?.customer_email || invoice?.customer || 'Unknown'
        const appName = invoice?.metadata?.app_name || 'Unknown App'
        const amount = invoice?.amount_due ? invoice.amount_due / 100 : null

        newItem = addApproval({
          type: 'Alert',
          appName,
          userName: customerEmail,
          userEmail:
            typeof customerEmail === 'string' && customerEmail.includes('@')
              ? customerEmail
              : null,
          amount,
          description: `Invoice payment failed — ${customerEmail}. Amount: $${amount?.toFixed(2) ?? '?'}. Invoice: ${invoice?.id}`,
        })

        await logActivity({
          type: 'alert',
          text: `Payment failed — ${customerEmail}`,
          appName,
          amount,
        })

        await sendTelegram(
          `🔴 <b>Payment failed</b> — ${customerEmail}\n📱 App: ${appName}\n💰 Amount: $${amount?.toFixed(2) ?? '?'}`
        )
        break
      }

      // ─── Payment intent failed (legacy handler) ────────────────
      case 'payment_intent.payment_failed': {
        const pi = event.data?.object
        const amount = pi?.amount ? pi.amount / 100 : null
        const customerEmail =
          pi?.receipt_email || pi?.customer || 'Unknown'
        newItem = addApproval({
          type: 'Alert',
          appName: pi?.metadata?.app_name || 'Unknown App',
          userName: customerEmail,
          userEmail:
            typeof customerEmail === 'string' && customerEmail.includes('@')
              ? customerEmail
              : null,
          amount,
          description: `Payment failed — ${pi?.last_payment_error?.message || 'No details provided'}. Payment Intent: ${pi?.id}`,
        })
        break
      }

      // ─── Dispute / chargeback ──────────────────────────────────
      case 'charge.dispute.created': {
        const dispute = event.data?.object
        const amount = dispute?.amount ? dispute.amount / 100 : null
        const appName = dispute?.metadata?.app_name || 'Unknown App'

        newItem = addApproval({
          type: 'Alert',
          appName,
          userName: dispute?.customer || 'Unknown Customer',
          userEmail: null,
          amount,
          description: `⚠️ Dispute/chargeback — URGENT. Reason: ${dispute?.reason || 'unknown'}. Amount: $${amount?.toFixed(2) || '?'}. You have 7 days to respond in Stripe.`,
        })

        await logActivity({
          type: 'alert',
          text: `DISPUTE OPENED — $${amount?.toFixed(2) ?? '?'} — needs attention`,
          appName,
          amount,
        })

        await sendTelegram(
          `🚨 <b>DISPUTE OPENED</b> — $${amount?.toFixed(2) ?? '?'} — needs your attention\n📱 App: ${appName}\n⚡ Reason: ${dispute?.reason || 'unknown'}\nRespond within 7 days in Stripe.`
        )
        break
      }

      default:
        return NextResponse.json({ received: true }, { status: 200 })
    }

    if (newItem) {
      const message = formatApprovalNotification(newItem)
      await sendTelegram(message)
    }

    return NextResponse.json({ received: true, item: newItem }, { status: 200 })
  } catch (err) {
    console.error('[Stripe Webhook] Error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
