import { NextResponse } from 'next/server'
import { getAllRepoActivity, getRepoStats } from '@/lib/integrations/github'
import { getAllBuilds, type BuildStatus } from '@/lib/integrations/expo'
import { getWeeklyCost } from '@/lib/integrations/openai'

export async function GET() {
  try {
    const [activityResult, lawnStats, spaStats, buildsResult, costResult] =
      await Promise.allSettled([
        getAllRepoActivity(7),
        getRepoStats('lawngenius-app'),
        getRepoStats('pooliq-app'),
        getAllBuilds(),
        getWeeklyCost(),
      ])

    const activity =
      activityResult.status === 'fulfilled' ? activityResult.value : []
    const lawnData =
      lawnStats.status === 'fulfilled'
        ? lawnStats.value
        : { lastCommitDate: null, commitsThisWeek: 0 }
    const spaData =
      spaStats.status === 'fulfilled'
        ? spaStats.value
        : { lastCommitDate: null, commitsThisWeek: 0 }
    const builds =
      buildsResult.status === 'fulfilled' ? buildsResult.value : []
    const cost =
      costResult.status === 'fulfilled' ? costResult.value : { weeklyTotal: 0 }

    const totalCommitsThisWeek =
      lawnData.commitsThisWeek + spaData.commitsThisWeek

    const lastCommit =
      activity[0]?.date ?? null

    // Build status per app
    const getBuildStatus = (appId: string): BuildStatus | null => {
      const appData = builds.find((b) => b.appId === appId)
      return appData?.latestStatus ?? null
    }

    const stripeConnected = Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
    )

    return NextResponse.json({
      github: {
        lastCommit,
        commitsThisWeek: totalCommitsThisWeek,
      },
      expo: {
        lawngenius: getBuildStatus('lawngenius'),
        spagenius: getBuildStatus('spagenius'),
      },
      openai: {
        weeklySpend: cost.weeklyTotal ?? 0,
      },
      stripe: {
        connected: stripeConnected,
      },
      uptime: '99.9%',
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[API] /api/status error:', err)
    return NextResponse.json(
      {
        github: { lastCommit: null, commitsThisWeek: 0 },
        expo: { lawngenius: null, spagenius: null },
        openai: { weeklySpend: 0 },
        stripe: { connected: false },
        uptime: '99.9%',
        generatedAt: new Date().toISOString(),
        error: 'Partial data — some integrations unavailable',
      },
      { status: 200 }
    )
  }
}
