const EXPO_TOKEN = process.env.EXPO_TOKEN ?? ''

export const EXPO_APPS = [
  { id: 'lawngenius', name: 'LawnGenius', projectId: 'd75fe288-81e6-4100-a4f6-5628be2452e3' },
  { id: 'spagenius', name: 'SpaGenius', projectId: '80f279ab-5152-42e4-b028-170109a46d6b' },
]

export type BuildStatus = 'finished' | 'in-progress' | 'errored' | 'canceled' | 'new' | 'unknown'

export interface ExpoBuilld {
  id: string
  status: BuildStatus
  platform: 'ios' | 'android'
  createdAt: string
  appVersion?: string
  buildNumber?: string
}

export interface AppBuilds {
  appId: string
  appName: string
  builds: ExpoBuilld[]
  latestStatus: BuildStatus | null
  error?: string
}

export async function getLatestBuilds(projectId: string): Promise<ExpoBuilld[]> {
  try {
    const url = `https://api.expo.dev/v2/builds?appId=${projectId}&limit=3`

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${EXPO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      console.warn(`[Expo] Project ${projectId} returned ${res.status}`)
      return []
    }

    const data = await res.json()
    const builds = data?.data ?? data?.builds ?? []

    if (!Array.isArray(builds)) return []

    return builds.map((b: {
      id?: string;
      status?: string;
      platform?: string;
      createdAt?: string;
      appVersion?: string;
      buildNumber?: string;
    }) => ({
      id: b.id ?? '',
      status: (b.status ?? 'unknown') as BuildStatus,
      platform: (b.platform ?? 'ios') as 'ios' | 'android',
      createdAt: b.createdAt ?? '',
      appVersion: b.appVersion,
      buildNumber: b.buildNumber,
    }))
  } catch (err) {
    console.error(`[Expo] Error fetching builds for ${projectId}:`, err)
    return []
  }
}

export async function getAllBuilds(): Promise<AppBuilds[]> {
  const results = await Promise.allSettled(
    EXPO_APPS.map(async (app) => {
      const builds = await getLatestBuilds(app.projectId)
      const latestStatus = builds[0]?.status ?? null
      return {
        appId: app.id,
        appName: app.name,
        builds,
        latestStatus,
      }
    })
  )

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value
    }
    return {
      appId: EXPO_APPS[i].id,
      appName: EXPO_APPS[i].name,
      builds: [],
      latestStatus: null,
      error: 'EAS API unavailable',
    }
  })
}
