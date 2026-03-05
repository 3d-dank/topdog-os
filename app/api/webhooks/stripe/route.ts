import { NextRequest, NextResponse } from 'next/server'
import { addApproval } from '@/lib/approvals'
import { sendTelegram, formatApprovalNotification } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const event = body

    let newItem = null

    switch (event.type) {
      case 'payment_intent.payment_failed': {
        const pi = event.data?.object
        const amount = pi?.amount ? pi.amount / 100 : null
        const customerEmail = pi?.receipt_email || pi?.customer || 'Unknown'
        newItem = addApproval({
          type: 'Alert',
          appName: pi?.metadata?.app_name || 'Unknown App',
          userName: customerEmail,
          userEmail: typeof customerEmail === 'string' && customerEmail.includes('@') ? customerEmail : null,
          amount,
          description: `Payment failed — ${pi?.last_payment_error?.message || 'No details provided'}. Payment Intent: ${pi?.id}`,
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data?.object
        newItem = addApproval({
          type: 'Alert',
          appName: sub?.metadata?.app_name || 'Unknown App',
          userName: sub?.customer || 'Unknown Customer',
          userEmail: null,
          amount: null,
          description: `Subscription cancelled — customer ${sub?.customer} cancelled their ${sub?.plan?.nickname || sub?.items?.data?.[0]?.price?.nickname || 'subscription'} plan.`,
        })
        break
      }

      case 'charge.dispute.created': {
        const dispute = event.data?.object
        const amount = dispute?.amount ? dispute.amount / 100 : null
        newItem = addApproval({
          type: 'Alert',
          appName: dispute?.metadata?.app_name || 'Unknown App',
          userName: dispute?.customer || 'Unknown Customer',
          userEmail: null,
          amount,
          description: `⚠️ Dispute/chargeback — URGENT. Reason: ${dispute?.reason || 'unknown'}. Amount: $${amount?.toFixed(2) || '?'}. You have 7 days to respond in Stripe.`,
        })
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
