/** Muted earth-tone palette aligned to benefit categories. */
export const EARTH_TONES = {
  wellness: '#7A9485',
  food: '#B8895A',
  sport: '#7A8694',
  travel: '#C17B5E',
  learning: '#6E9099',
  selfcare: '#A8767F',
  health: '#7A9468',
}

export function earthTone(category) {
  return EARTH_TONES[category] || '#A08B72'
}
