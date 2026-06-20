// PERX catalog — providers, categories, packages, seasonal deals.
// All prices in ALL (Albanian Lek).

export const CATEGORIES = [
  { id: 'wellness', label: 'Wellness', color: 'wellness', icon: 'Sparkles' },
  { id: 'food', label: 'Food', color: 'food', icon: 'UtensilsCrossed' },
  { id: 'sport', label: 'Sport', color: 'sport', icon: 'Dumbbell' },
  { id: 'travel', label: 'Travel', color: 'travel', icon: 'Plane' },
  { id: 'learning', label: 'Learning', color: 'learning', icon: 'GraduationCap' },
  { id: 'selfcare', label: 'Self-care', color: 'selfcare', icon: 'HeartHandshake' },
  { id: 'health', label: 'Health', color: 'health', icon: 'Stethoscope' },
]

export const catColor = (cat) => `var(--cat-${cat})`

// id, name, category, cost (ALL), cadence, blurb, rating, lat/lng on the mock Tirana map (0..100 grid)
export const PROVIDERS = [
  { id: 'fitlife', name: 'FitLife Gym Tirana', category: 'sport', cost: 3500, cadence: 'month', blurb: 'Full-service gym in Blloku — weights, classes, sauna.', rating: 4.7, map: { x: 38, y: 44 }, tags: ['gym', 'fitness', 'sauna'] },
  { id: 'kombi', name: 'Kombi Coffee', category: 'food', cost: 800, cadence: 'month', blurb: 'Specialty coffee subscription across 6 Tirana spots.', rating: 4.8, map: { x: 52, y: 50 }, tags: ['coffee', 'cafe'] },
  { id: 'aquaspa', name: 'Aqua Spa Tirana', category: 'wellness', cost: 5000, cadence: 'once', blurb: 'Thermal pools, massage & hammam day-pass.', rating: 4.6, map: { x: 64, y: 36 }, tags: ['spa', 'massage', 'relax'] },
  { id: 'langschool', name: 'Tirana Language School', category: 'learning', cost: 8000, cadence: 'course', blurb: 'English, German & Italian — small evening groups.', rating: 4.5, map: { x: 46, y: 28 }, tags: ['language', 'course'] },
  { id: 'greensalad', name: 'Green Salad Bar', category: 'food', cost: 1200, cadence: 'month', blurb: 'Build-your-own healthy bowls, delivered to the office.', rating: 4.4, map: { x: 56, y: 58 }, tags: ['healthy', 'lunch', 'vegan'] },
  { id: 'albtransport', name: 'Albtransport Travel', category: 'travel', cost: 4200, cadence: 'variable', blurb: 'Discounted intercity & coastal weekend trips.', rating: 4.3, map: { x: 30, y: 64 }, tags: ['travel', 'bus', 'weekend'] },
  { id: 'medicheck', name: 'MediCheck Clinic', category: 'health', cost: 2500, cadence: 'once', blurb: 'Annual health screening & blood panel.', rating: 4.9, map: { x: 70, y: 52 }, tags: ['health', 'checkup', 'doctor'] },
  { id: 'booknook', name: 'BookNook Albania', category: 'learning', cost: 900, cadence: 'month', blurb: 'Unlimited e-books + 1 physical title / month.', rating: 4.6, map: { x: 44, y: 62 }, tags: ['books', 'reading'] },
  { id: 'yogaflow', name: 'YogaFlow Studio', category: 'wellness', cost: 3000, cadence: 'month', blurb: 'Unlimited yoga & breathwork, mornings + evenings.', rating: 4.8, map: { x: 60, y: 44 }, tags: ['yoga', 'mindfulness', 'relax'] },
  { id: 'burgerlab', name: 'Burger Lab Tirana', category: 'food', cost: 1500, cadence: 'once', blurb: 'Cheat-day voucher — smash burgers in Pazari i Ri.', rating: 4.5, map: { x: 58, y: 30 }, tags: ['burger', 'treat'] },
  { id: 'cyclecity', name: 'CycleCity Bike Rental', category: 'sport', cost: 1800, cadence: 'month', blurb: 'Unlimited city-bike rides + safety gear.', rating: 4.4, map: { x: 40, y: 56 }, tags: ['bike', 'commute', 'outdoor'] },
  { id: 'lumeretreat', name: 'Lumë Retreat', category: 'wellness', cost: 6500, cadence: 'once', blurb: 'Weekend mountain reset near the Lumë river.', rating: 4.9, map: { x: 24, y: 30 }, tags: ['retreat', 'nature', 'relax'] },
]

export const providerById = (id) => PROVIDERS.find((p) => p.id === id)

export const PACKAGES = [
  { id: 'healthy-start', name: 'Healthy Start', blurb: 'Move, eat clean, get checked.', items: ['fitlife', 'greensalad', 'medicheck'], accent: 'sport' },
  { id: 'mind-body', name: 'Mind & Body', blurb: 'Calm the mind, restore the body.', items: ['yogaflow', 'booknook', 'aquaspa'], accent: 'wellness' },
  { id: 'city-commuter', name: 'City Commuter', blurb: 'Ride, caffeinate, explore.', items: ['cyclecity', 'kombi', 'albtransport'], accent: 'travel' },
]

export const packageTotal = (pkg) => pkg.items.reduce((s, id) => s + (providerById(id)?.cost || 0), 0)

// Seasonal / limited-time deals for the "What's new" feed. expiresInH = hours from first load.
export const SEASONAL = [
  { id: 'summer-spa', providerId: 'aquaspa', title: 'Summer Spa −30%', blurb: 'Beat the Tirana heat. Limited slots.', discount: 0.3, expiresInH: 36, accent: 'wellness' },
  { id: 'yoga-trial', providerId: 'yogaflow', title: 'First month free', blurb: 'New members: 30 days on us.', discount: 1, expiresInH: 18, accent: 'wellness' },
  { id: 'coast-weekend', providerId: 'albtransport', title: 'Coast weekend deal', blurb: 'Sarandë & Vlorë trips −25%.', discount: 0.25, expiresInH: 60, accent: 'travel' },
]
