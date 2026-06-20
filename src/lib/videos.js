// Local + remote video resolution for benefit cards.
// Drop files in public/videos/{providers,categories,packages}/{id}.mp4

const BASE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/'

// Category-level posters — first-paint stills before the video loads or when
// no per-provider posterUrl was set in the DB.
export const CATEGORY_POSTER = {
  wellness: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
  food:     'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
  sport:    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  travel:   'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  learning: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
  selfcare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
  health:   'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
}

export const CATEGORY_VIDEO = {
  wellness: BASE + 'ForBiggerEscapes.mp4',
  food: BASE + 'ForBiggerFun.mp4',
  sport: BASE + 'ForBiggerJoyrides.mp4',
  travel: BASE + 'ForBiggerBlazes.mp4',
  learning: BASE + 'ForBiggerMeltdowns.mp4',
  selfcare: BASE + 'SubaruOutbackOnStreetAndDirt.mp4',
  health: BASE + 'VolkswagenGTIReview.mp4',
}

export const categoryPoster = (cat) => CATEGORY_POSTER[cat] || null

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
