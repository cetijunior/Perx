// Poster images for benefit cards.

export const CATEGORY_POSTER = {
  wellness: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
  food:     'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800',
  sport:    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  travel:   'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  learning: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
  selfcare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
  health:   'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
}

/** Per-provider posters — kept in sync with server/src/seed.js */
export const PROVIDER_POSTER = {
  fitlife:      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
  kombi:        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
  aquaspa:      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',
  langschool:   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
  greensalad:   'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
  albtransport: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
  medicheck:    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
  booknook:     'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
  yogaflow:     'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
  burgerlab:    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
  cyclecity:    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
  lumeretreat:  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
}

export const providerPoster = (provider) =>
  provider?.posterUrl || PROVIDER_POSTER[provider?.id] || categoryPoster(provider?.category)

export const categoryPoster = (cat) => CATEGORY_POSTER[cat] || null
