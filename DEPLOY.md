# Top Dog OS — Deployment Guide

## Prerequisites
- Vercel account (free tier works)
- GitHub repo: `topdog-os` (create at github.com/new — set to Private)
- Telegram bot token (from @BotFather)
- Stripe account (for webhooks — Phase 2 full integration)

---

## 1. Create GitHub Repo

Go to [github.com/new](https://github.com/new) and create a **private** repo named `topdog-os`.

Then push:
```bash
cd /home/jdankey/.openclaw/workspace/topdog-os
git remote set-url origin https://github.com/3d-dank/topdog-os.git
git push -u origin main
```

---

## 2. Deploy to Vercel

### Option A — Vercel Dashboard (recommended)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `topdog-os` GitHub repo
3. Framework: Next.js (auto-detected)
4. Add environment variables (see below)
5. Click Deploy

### Option B — Vercel CLI
```bash
npm i -g vercel
cd /home/jdankey/.openclaw/workspace/topdog-os
vercel --prod
```

---

## 3. Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `TELEGRAM_BOT_TOKEN` | Your OpenClaw Telegram bot token | ✅ Yes |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Webhooks | For Stripe webhooks |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Optional |

### Getting TELEGRAM_BOT_TOKEN
Your OpenClaw bot token is stored in OpenClaw's config. To find it:
```bash
openclaw config show
```
Or message @BotFather to create a new bot if needed.

---

## 4. Stripe Webhook Setup

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://your-app.vercel.app/api/webhooks/stripe`
4. Events to listen to:
   - `payment_intent.payment_failed`
   - `customer.subscription.deleted`
   - `charge.dispute.created`
5. Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

---

## 5. Data Persistence Note

Phase 1 uses JSON files in the `data/` directory for storage. On Vercel (serverless), these files **reset on each deployment**. 

For production persistence, Phase 2 will migrate to Supabase:
- `data/approvals.json` → `approvals` table
- `data/settings.json` → `settings` table

For now, the app works great for local use or self-hosted deployment (VPS/Pi).

---

## 6. Self-Hosted (DigitalOcean / Pi)

If running on your Top-dog-ai droplet:
```bash
cd /home/jdankey/.openclaw/workspace/topdog-os
cp .env.example .env.local
# Edit .env.local with your values
npm run build
npm start
# Or with PM2:
pm2 start "npm start" --name topdog-os
```

Default port: 3000. Nginx reverse proxy recommended for production.

---

## Phase 2 Roadmap
- [ ] Supabase integration (real persistence)
- [ ] Stripe live data (MRR, revenue charts)
- [ ] Customer directory
- [ ] Full support inbox
- [ ] Auth (Clerk or NextAuth)
- [ ] Multi-user access
