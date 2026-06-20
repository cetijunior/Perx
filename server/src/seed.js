import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { connectDB } from './lib/db.js'
import User from './models/User.js'
import Employee from './models/Employee.js'
import Provider from './models/Provider.js'

const USERS = [
  { email: 'arta.koci@perx.al', password: 'perx123', name: 'Arta Koçi', role: 'employee', department: 'Design', budget: 30000 },
  { email: 'blend.hoxha@perx.al', password: 'perx123', name: 'Blend Hoxha', role: 'employee', department: 'Engineering', budget: 30000 },
  { email: 'admin@perx.al', password: 'admin2026', name: 'Endrit Leka', role: 'admin', department: 'People Ops', budget: 0 },
]

// Per-provider thematic Unsplash posters + Mixkit free-stock MP4s.
// Posters are very reliable; Mixkit URLs occasionally rotate, so the catalog's
// local `providerVideoSources` chain still tries category fallbacks if a primary
// 404s. The result is always *something* on screen.
const POSTERS = {
  fitlife:      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', // gym
  kombi:        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', // coffee
  aquaspa:      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800',    // spa pool
  langschool:   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800', // classroom
  greensalad:   'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',    // salad bowl
  albtransport: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', // road trip
  medicheck:    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800', // stethoscope
  booknook:     'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800', // books
  yogaflow:     'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',    // yoga
  burgerlab:    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800', // burger
  cyclecity:    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800', // cycling
  lumeretreat:  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', // mountains
}

// Free clips from samplelib.com — confirmed hotlinkable from any origin
// (Mixkit/Pexels/Vimeo block third-party Referers). 5 distinct clips cycled
// across providers + archive.org's Big Buck Bunny gives 6 variants.
// Thumbnails are thematic (Unsplash); on hover the cards play these so each
// category at least gets a different motion.
const V1 = 'https://download.samplelib.com/mp4/sample-5s.mp4'
const V2 = 'https://download.samplelib.com/mp4/sample-10s.mp4'
const V3 = 'https://download.samplelib.com/mp4/sample-15s.mp4'
const V4 = 'https://download.samplelib.com/mp4/sample-20s.mp4'
const V5 = 'https://download.samplelib.com/mp4/sample-30s.mp4'
const V6 = 'https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4'

const VIDEOS = {
  fitlife:      V1,
  kombi:        V2,
  aquaspa:      V3,
  langschool:   V4,
  greensalad:   V5,
  albtransport: V6,
  medicheck:    V1,
  booknook:     V2,
  yogaflow:     V3,
  burgerlab:    V4,
  cyclecity:    V5,
  lumeretreat:  V6,
}

const media = (slug) => ({
  videoUrl: VIDEOS[slug] || '',
  posterUrl: POSTERS[slug] || '',
})

const PROVIDERS = [
  { slug: 'fitlife', name: 'FitLife Gym Tirana', category: 'sport', cost: 3500, cadence: 'month', rating: 4.7, blurb: 'Full-service gym in Blloku — weights, classes, sauna.', map: { x: 38, y: 44 }, ...media('fitlife') },
  { slug: 'kombi', name: 'Kombi Coffee', category: 'food', cost: 800, cadence: 'month', rating: 4.8, blurb: 'Specialty coffee subscription across 6 Tirana spots.', map: { x: 52, y: 50 }, ...media('kombi') },
  { slug: 'aquaspa', name: 'Aqua Spa Tirana', category: 'wellness', cost: 5000, cadence: 'once', rating: 4.6, blurb: 'Thermal pools, massage & hammam day-pass.', map: { x: 64, y: 36 }, ...media('aquaspa') },
  { slug: 'langschool', name: 'Tirana Language School', category: 'learning', cost: 8000, cadence: 'course', rating: 4.5, blurb: 'English, German & Italian — small evening groups.', map: { x: 46, y: 28 }, ...media('langschool') },
  { slug: 'greensalad', name: 'Green Salad Bar', category: 'food', cost: 1200, cadence: 'month', rating: 4.4, blurb: 'Build-your-own healthy bowls, delivered to the office.', map: { x: 56, y: 58 }, ...media('greensalad') },
  { slug: 'albtransport', name: 'Albtransport Travel', category: 'travel', cost: 4200, cadence: 'variable', rating: 4.3, blurb: 'Discounted intercity & coastal weekend trips.', map: { x: 30, y: 64 }, ...media('albtransport') },
  { slug: 'medicheck', name: 'MediCheck Clinic', category: 'health', cost: 2500, cadence: 'once', rating: 4.9, blurb: 'Annual health screening & blood panel.', map: { x: 70, y: 52 }, ...media('medicheck') },
  { slug: 'booknook', name: 'BookNook Albania', category: 'learning', cost: 900, cadence: 'month', rating: 4.6, blurb: 'Unlimited e-books + 1 physical title / month.', map: { x: 44, y: 62 }, ...media('booknook') },
  { slug: 'yogaflow', name: 'YogaFlow Studio', category: 'wellness', cost: 3000, cadence: 'month', rating: 4.8, blurb: 'Unlimited yoga & breathwork, mornings + evenings.', map: { x: 60, y: 44 }, ...media('yogaflow') },
  { slug: 'burgerlab', name: 'Burger Lab Tirana', category: 'food', cost: 1500, cadence: 'once', rating: 4.5, blurb: 'Cheat-day voucher — smash burgers in Pazari i Ri.', map: { x: 58, y: 30 }, ...media('burgerlab') },
  { slug: 'cyclecity', name: 'CycleCity Bike Rental', category: 'sport', cost: 1800, cadence: 'month', rating: 4.4, blurb: 'Unlimited city-bike rides + safety gear.', map: { x: 40, y: 56 }, ...media('cyclecity') },
  { slug: 'lumeretreat', name: 'Lumë Retreat', category: 'wellness', cost: 6500, cadence: 'once', rating: 4.9, blurb: 'Weekend mountain reset near the Lumë river.', map: { x: 24, y: 30 }, ...media('lumeretreat') },
]

async function run() {
  await connectDB()
  console.log('seeding…')

  for (const p of PROVIDERS) {
    await Provider.updateOne({ slug: p.slug }, { $set: p }, { upsert: true })
  }
  console.log(`providers: ${PROVIDERS.length} upserted`)

  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10)
    const { password, ...rest } = u
    const user = await User.findOneAndUpdate(
      { email: u.email },
      { $set: { ...rest, passwordHash } },
      { new: true, upsert: true },
    )
    if (user.role === 'employee') {
      await Employee.updateOne(
        { userId: user._id },
        { $setOnInsert: { userId: user._id, activeBenefits: [], cart: [] } },
        { upsert: true },
      )
    }
  }
  console.log(`users: ${USERS.length} upserted`)

  await mongoose.disconnect()
  console.log('done.')
}

run().catch((err) => { console.error(err); process.exit(1) })
