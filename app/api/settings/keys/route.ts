import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
    STRIPE_SECRET_KEY: Boolean(process.env.STRIPE_SECRET_KEY),
    TELEGRAM_BOT_TOKEN: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    XAI_API_KEY: Boolean(process.env.XAI_API_KEY),
    EXPO_TOKEN: Boolean(process.env.EXPO_TOKEN),
  })
}
