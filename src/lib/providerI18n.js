/** Localized provider name + blurb for UI (hero cards, marketplace, etc.). */
export function providerDisplay(t, provider) {
  const base = `catalog.providers.${provider.id}`
  return {
    name: t(`${base}.name`, { defaultValue: provider.name }),
    blurb: t(`${base}.blurb`, { defaultValue: provider.blurb }),
  }
}

export function truncateBlurb(text, max = 52) {
  if (!text || text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}
