// Local + remote video resolution for benefit cards.
// Drop files in public/videos/{providers,categories,packages}/{id}.mp4

const BASE = 'https://storage.googleapis.com/gtv-videos-bucket/sample/'

export const CATEGORY_VIDEO = {
  wellness: BASE + 'ForBiggerEscapes.mp4',
  food: BASE + 'ForBiggerFun.mp4',
  sport: BASE + 'ForBiggerJoyrides.mp4',
  travel: BASE + 'ForBiggerBlazes.mp4',
  learning: BASE + 'ForBiggerMeltdowns.mp4',
  selfcare: BASE + 'SubaruOutbackOnStreetAndDirt.mp4',
  health: BASE + 'VolkswagenGTIReview.mp4',
}

export const localVideoUrl = (folder, id, ext = 'mp4') => `/videos/${folder}/${id}.${ext}`

/** Ordered fallback URLs for a provider clip. */
export const providerVideoSources = (provider) => {
  if (!provider) return []
  const sources = []
  if (provider.video) sources.push(provider.video)
  sources.push(localVideoUrl('providers', provider.id))
  if (provider.category) {
    sources.push(localVideoUrl('categories', provider.category))
    if (CATEGORY_VIDEO[provider.category]) sources.push(CATEGORY_VIDEO[provider.category])
  }
  return [...new Set(sources)]
}

/** Primary URL — component cascades through providerVideoSources on error. */
export const providerVideo = (provider) => providerVideoSources(provider)[0] ?? null

/** Ordered fallback URLs for a curated package. */
export const packageVideoSources = (pkg) => {
  if (!pkg) return []
  const sources = [localVideoUrl('packages', pkg.id)]
  if (pkg.accent) {
    sources.push(localVideoUrl('categories', pkg.accent))
    if (CATEGORY_VIDEO[pkg.accent]) sources.push(CATEGORY_VIDEO[pkg.accent])
  }
  return [...new Set(sources)]
}

export const packageVideo = (pkg) => packageVideoSources(pkg)[0] ?? null

/** Deal cards reuse the linked provider's video chain. */
export const dealVideoSources = (deal, provider) => providerVideoSources(provider ?? (deal?.providerId ? { id: deal.providerId, category: deal.accent } : null))

export const dealVideo = (deal, provider) => dealVideoSources(deal, provider)[0] ?? null
