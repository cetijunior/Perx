// PERX reactive store — single localStorage-backed state object, no backend.
// Reactivity via useSyncExternalStore. All mutations go through actions here.
import { useSyncExternalStore } from 'react'
import { PROVIDERS, providerById } from './catalog'

const KEY = 'perx:v1'
const SESSION = 'perx:session'

// ---- seed users ----
const SEED_USERS = [
  {
    id: 'arta', email: 'arta.koci@perx.al', password: 'perx123', role: 'employee',
    name: 'Arta Koçi', department: 'Marketing', company: 'TeamSystem Albania', budget: 45000,
  },
  {
    id: 'blend', email: 'blend.hoxha@perx.al', password: 'perx123', role: 'employee',
    name: 'Blend Hoxha', department: 'Engineering', company: 'TeamSystem Albania', budget: 60000,
  },
  {
    id: 'admin', email: 'admin@perx.al', password: 'admin2026', role: 'admin',
    name: 'Endrit Leka', department: 'People Ops', company: 'TeamSystem Albania', budget: 0,
  },
]

const now = () => Date.now()
const uid = () => Math.random().toString(36).slice(2, 9)

function freshEmployeeState() {
  return {
    spent: 0,
    bonus: 0,
    activeBenefits: [],
    cart: [],
    preferences: {
      categories: ['wellness', 'sport', 'food'],
      dietary: [],
      notifications: { deals: true, approvals: true, streaks: true },
    },
    games: { streak: 3, lastClaim: 0, scratchToday: false, spinsLeft: 1, tasks: [], history: [
      { id: uid(), at: now() - 86400000 * 2, label: 'Welcome bonus', delta: 1500 },
      { id: uid(), at: now() - 86400000, label: 'Daily streak ×3', delta: 300 },
    ] },
  }
}

function defaultState() {
  const employees = {}
  SEED_USERS.filter((u) => u.role === 'employee').forEach((u) => { employees[u.id] = freshEmployeeState() })
  // Pre-seed Blend with some activity so admin dashboards aren't empty.
  employees.blend.activeBenefits = ['fitlife', 'kombi']
  employees.blend.spent = 4300
  employees.arta.activeBenefits = ['yogaflow']
  employees.arta.spent = 3000
  return {
    users: SEED_USERS,
    employees,
    requests: [
      { id: uid(), userId: 'arta', items: ['aquaspa', 'greensalad'], total: 6200, status: 'pending', createdAt: now() - 3600000 },
      { id: uid(), userId: 'blend', items: ['medicheck'], total: 2500, status: 'pending', createdAt: now() - 7200000 },
    ],
    activity: [
      { id: uid(), at: now() - 3600000, text: 'Arta Koçi requested Aqua Spa + Green Salad Bar', kind: 'request' },
      { id: uid(), at: now() - 7200000, text: 'Blend Hoxha requested MediCheck Clinic', kind: 'request' },
      { id: uid(), at: now() - 90000000, text: 'Blend Hoxha activated FitLife Gym', kind: 'activate' },
    ],
    lang: 'sq',
    seededAt: now(),
  }
}

// ---- persistence ----
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) { const s = defaultState(); localStorage.setItem(KEY, JSON.stringify(s)); return s }
    return JSON.parse(raw)
  } catch { return defaultState() }
}

let state = load()
const listeners = new Set()
function persist() { localStorage.setItem(KEY, JSON.stringify(state)); listeners.forEach((l) => l()) }
function set(updater) { state = { ...state, ...updater(state) }; persist() }

export function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb) }
export function getState() { return state }

// ---- derived ----
export function budgetFor(userId) {
  const u = state.users.find((x) => x.id === userId)
  const e = state.employees[userId]
  if (!u || !e) return { total: 0, spent: 0, bonus: 0, remaining: 0, pct: 0 }
  const total = u.budget + e.bonus
  const remaining = Math.max(0, total - e.spent)
  return { total, base: u.budget, spent: e.spent, bonus: e.bonus, remaining, pct: total ? remaining / total : 0 }
}

// ---- auth ----
export function login(email, password) {
  const u = state.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
  if (!u) return { ok: false, error: 'Invalid credentials' }
  localStorage.setItem(SESSION, u.id)
  listeners.forEach((l) => l())
  return { ok: true, user: u }
}
export function logout() { localStorage.removeItem(SESSION); listeners.forEach((l) => l()) }
export function currentUser() {
  const id = localStorage.getItem(SESSION)
  return state.users.find((x) => x.id === id) || null
}

// ---- employee actions ----
function mutEmp(userId, fn) {
  set((s) => {
    const employees = { ...s.employees, [userId]: { ...s.employees[userId] } }
    fn(employees[userId])
    return { employees }
  })
}
export const addToCart = (userId, pid) => mutEmp(userId, (e) => { if (!e.cart.includes(pid)) e.cart = [...e.cart, pid] })
export const removeFromCart = (userId, pid) => mutEmp(userId, (e) => { e.cart = e.cart.filter((x) => x !== pid) })
export const clearCart = (userId) => mutEmp(userId, (e) => { e.cart = [] })

export function requestApproval(userId, items, label) {
  const total = items.reduce((sum, id) => sum + (providerById(id)?.cost || 0), 0)
  const user = state.users.find((u) => u.id === userId)
  set((s) => ({
    requests: [{ id: uid(), userId, items, total, status: 'pending', createdAt: now(), label }, ...s.requests],
    activity: [{ id: uid(), at: now(), text: `${user.name} requested ${items.map((i) => providerById(i)?.name).join(' + ')}`, kind: 'request' }, ...s.activity],
  }))
  clearCart(userId)
}

export function setPreferences(userId, prefs) { mutEmp(userId, (e) => { e.preferences = { ...e.preferences, ...prefs } }) }

export function awardBonus(userId, amount, label) {
  mutEmp(userId, (e) => {
    e.bonus += amount
    e.games = { ...e.games, history: [{ id: uid(), at: now(), label, delta: amount }, ...e.games.history] }
  })
}
export function setGames(userId, patch) { mutEmp(userId, (e) => { e.games = { ...e.games, ...patch } }) }

export function completeTask(userId, taskId, reward) {
  mutEmp(userId, (e) => {
    if (e.games.tasks.includes(taskId)) return
    e.games = {
      ...e.games,
      tasks: [...e.games.tasks, taskId],
      history: [{ id: uid(), at: now(), label: `Task: ${taskId}`, delta: reward }, ...e.games.history],
    }
    e.bonus += reward
  })
}

// ---- admin actions ----
export function decideRequest(reqId, decision) {
  set((s) => {
    const req = s.requests.find((r) => r.id === reqId)
    if (!req || req.status !== 'pending') return {}
    const requests = s.requests.map((r) => (r.id === reqId ? { ...r, status: decision } : r))
    const employees = { ...s.employees }
    const user = s.users.find((u) => u.id === req.userId)
    if (decision === 'approved') {
      const e = { ...employees[req.userId] }
      e.spent += req.total
      e.activeBenefits = Array.from(new Set([...e.activeBenefits, ...req.items]))
      employees[req.userId] = e
    }
    const activity = [{ id: uid(), at: now(), text: `${user.name}'s request ${decision}`, kind: decision }, ...s.activity]
    return { requests, employees, activity }
  })
}

export function setLang(lang) { set(() => ({ lang })) }

// ---- daily surprise pop-up ----
const SURPRISE_KEY = 'perx:daily-surprise'
function todayStr() { return new Date().toISOString().slice(0, 10) }

export function getDailySurprise() {
  try {
    const raw = localStorage.getItem(SURPRISE_KEY)
    if (!raw) return null
    return JSON.parse(raw) // { shownDate, gameType }
  } catch { return null }
}

export function markDailySurpriseShown(gameType) {
  localStorage.setItem(SURPRISE_KEY, JSON.stringify({ shownDate: todayStr(), gameType }))
}

export function isDailySurpriseShownToday() {
  const s = getDailySurprise()
  return s?.shownDate === todayStr()
}

/** Pick scratch or spin deterministically for today (different each day) */
export function pickTodayGame() {
  // Use date digits to alternate: even day → scratch, odd → spin
  const day = new Date().getDate()
  return day % 2 === 0 ? 'scratch' : 'spin'
}

export function resetAll() { localStorage.removeItem(KEY); localStorage.removeItem(SESSION); state = defaultState(); persist() }

// ---- hooks ----
export function useStore(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state))
}
export function useCurrentUser() {
  return useSyncExternalStore(subscribe, currentUser, currentUser)
}

export { PROVIDERS }
