// Set GITHUB_TOKEN and GITHUB_USER in your environment / Vercel env vars
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? ''
const GITHUB_USER = process.env.GITHUB_USER ?? '3d-dank'

const REPOS = [
  'lawngenius-app',
  'pooliq-app',
  'gardengenius-app',
  'aquariumgenius-app',
  'scoutgenius-app',
  'topdog-os',
]

export interface Commit {
  repo: string
  sha: string
  message: string
  author: string
  date: string
  url: string
}

export interface RepoStats {
  repo: string
  lastCommitDate: string | null
  commitsThisWeek: number
  openIssues: number
  error?: string
}

const githubHeaders = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'topdog-os/1.0',
}

export async function getRecentCommits(repo: string, days: number): Promise<Commit[]> {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    const url = `https://api.github.com/repos/${GITHUB_USER}/${repo}/commits?since=${since}&per_page=20`

    const res = await fetch(url, {
      headers: githubHeaders,
      next: { revalidate: 300 }, // 5 min cache
    })

    if (!res.ok) {
      if (res.status === 404 || res.status === 409) {
        // 409 = empty repo, 404 = not found
        return []
      }
      console.warn(`[GitHub] ${repo} returned ${res.status}`)
      return []
    }

    const data = await res.json()

    if (!Array.isArray(data)) return []

    return data.map((commit: {
      sha: string;
      commit: { message: string; author: { name: string; date: string } };
      html_url: string;
    }) => ({
      repo,
      sha: commit.sha?.slice(0, 7) ?? '',
      message: commit.commit?.message?.split('\n')[0] ?? '',
      author: commit.commit?.author?.name ?? 'unknown',
      date: commit.commit?.author?.date ?? '',
      url: commit.html_url ?? '',
    }))
  } catch (err) {
    console.error(`[GitHub] Error fetching commits for ${repo}:`, err)
    return []
  }
}

export async function getAllRepoActivity(days: number): Promise<Commit[]> {
  const results = await Promise.allSettled(
    REPOS.map((repo) => getRecentCommits(repo, days))
  )

  const all: Commit[] = []
  for (const result of results) {
    if (result.status === 'fulfilled') {
      all.push(...result.value)
    }
  }

  // Sort newest first
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return all
}

export async function getRepoStats(repo: string): Promise<RepoStats> {
  try {
    const [commits, repoData] = await Promise.allSettled([
      getRecentCommits(repo, 7),
      fetch(`https://api.github.com/repos/${GITHUB_USER}/${repo}`, {
        headers: githubHeaders,
        next: { revalidate: 300 },
      }).then((r) => (r.ok ? r.json() : null)),
    ])

    const commitList = commits.status === 'fulfilled' ? commits.value : []
    const repoInfo = repoData.status === 'fulfilled' ? repoData.value : null

    return {
      repo,
      lastCommitDate: commitList[0]?.date ?? null,
      commitsThisWeek: commitList.length,
      openIssues: repoInfo?.open_issues_count ?? 0,
    }
  } catch (err) {
    return {
      repo,
      lastCommitDate: null,
      commitsThisWeek: 0,
      openIssues: 0,
      error: String(err),
    }
  }
}

export { REPOS }
