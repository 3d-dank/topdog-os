export type AppStatus = 'live' | 'building' | 'planned'

export interface PortfolioApp {
  id: string
  name: string
  emoji: string
  tagline: string
  platform: string
  status: AppStatus
  bundleId: string
  github: string
  affiliateTag: string
  affiliateStores: string[]
  monthlyRevenue: number
  users: number
  buildVersion: string
}

export interface ClientProject {
  id: string
  name: string
  emoji: string
  tagline: string
  client: string
  platform: string
  github: string
  url: string
}

export const PORTFOLIO: PortfolioApp[] = [
  {
    id: 'lawngenius',
    name: 'LawnGenius',
    emoji: '🌿',
    tagline: 'AI lawn diagnosis',
    platform: 'iOS + Android',
    status: 'live',
    bundleId: 'com.topdogai.lawngenius',
    github: 'lawngenius-app',
    affiliateTag: 'lawngenius-20',
    affiliateStores: ['Amazon', 'Home Depot'],
    monthlyRevenue: 0,
    users: 0,
    buildVersion: 'Preview #2',
  },
  {
    id: 'spagenius',
    name: 'SpaGenius',
    emoji: '💧',
    tagline: 'AI spa & pool chemistry',
    platform: 'iOS + Android',
    status: 'building',
    bundleId: 'com.topdogai.spagenius',
    github: 'pooliq-app',
    affiliateTag: 'spagenius-20',
    affiliateStores: ["Amazon", "Leslie's Pool"],
    monthlyRevenue: 0,
    users: 0,
    buildVersion: 'Preview pending',
  },
  {
    id: 'gardengenius',
    name: 'GardenGenius',
    emoji: '🌱',
    tagline: 'AI garden & plant diagnosis',
    platform: 'iOS + Android',
    status: 'building',
    bundleId: 'com.topdogai.gardengenius',
    github: 'gardengenius-app',
    affiliateTag: 'gardengenius-20',
    affiliateStores: ['Amazon', 'Home Depot'],
    monthlyRevenue: 0,
    users: 0,
    buildVersion: 'Preview pending',
  },
  {
    id: 'aquariumgenius',
    name: 'AquariumGenius',
    emoji: '🐠',
    tagline: 'AI aquarium water chemistry',
    platform: 'iOS + Android',
    status: 'building',
    bundleId: 'com.topdogai.aquariumgenius',
    github: 'aquariumgenius-app',
    affiliateTag: 'aquariumgenius-20',
    affiliateStores: ['Amazon', 'Chewy'],
    monthlyRevenue: 0,
    users: 0,
    buildVersion: 'Preview pending',
  },
  {
    id: 'scoutgenius',
    name: 'ScoutGenius',
    emoji: '🌽',
    tagline: 'NDVI satellite crop monitoring',
    platform: 'iOS + Android',
    status: 'building',
    bundleId: 'com.topdogai.scoutgenius',
    github: 'scoutgenius-app',
    affiliateTag: '',
    affiliateStores: [],
    monthlyRevenue: 0,
    users: 0,
    buildVersion: 'Preview pending',
  },
]

export const CLIENT_PROJECTS: ClientProject[] = [
  {
    id: 'drone-spray',
    name: 'MN Drone Spray',
    emoji: '🚁',
    tagline: 'Drone spraying ops + customer portal',
    client: 'Alex',
    platform: 'Web (Vercel)',
    github: 'drone-spray-site',
    url: 'https://drone-spray-site.vercel.app',
  },
]
