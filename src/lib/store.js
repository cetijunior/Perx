// PERX reactive store.
// State shape kept stable for existing components; data is now sourced from
// the backend API (server/) so the web app and iOS app share live state via
// the same MongoDB Atlas cluster.
//
// - Login goes through `/auth/login` (JWT stored in localStorage).
// - Providers, the current employee profile, and requests are pulled from the
//   API and reshaped into the in-memory state that components already consume.
// - Mutations (addToCart, requestApproval, decideRequest, …) call the API
//   and reconcile state from the server response.
// - A lightweight poll (on focus + every 8s while visible) keeps both clients
//   roughly in sync without a websocket.

import { useSyncExternalStore } from 'react'
import { PROVIDERS as LOCAL_PROVIDERS, providerById as localProviderById } from './catalog'
import { api, setToken, getToken } from './api'

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
    games: { streak: 3, lastClaim: 0, scratchToday: false, guessToday: false, memoryToday: false, spinsLeft: 1, tasks: [], history: [] },
    discountCodes: [],
  }
}

function defaultState() {
  return {
    users: [],
    employees: {},
    requests: [],
    activity: [],
    providers: LOCAL_PROVIDERS,    // fallback catalog until /providers loads
    lang: 'sq',
    currentUserId: null,
    sessionLoading: typeof window !== 'undefined' && !!getToken(),
    seededAt: now(),
    loading: false,
    error: null,
  }
}

let state = defaultState()
const listeners = new Set()
function persistSession() {
  try { localStorage.setItem('perx:session', state.currentUserId || '') } catch {}
}
function emit() { listeners.forEach((l) => l()) }
function set(updater) { state = { ...state, ...updater(state) }; emit() }

export function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb) }
export function getState() { return state }

// ── catalog helpers (provider lookup goes through state, falls back to local) ──
export function getProviderBySlug(slug) {
  return state.providers.find((p) => (p.slug || p.id) === slug) || localProviderById(slug) || null
}

// Shim so the rest of the app can keep importing providerById from store.
export const PROVIDERS = LOCAL_PROVIDERS

// ── budget derived ──
export function budgetFor(userId) {
  const u = state.users.find((x) => x.id === userId)
  const e = state.employees[userId]
  if (!u || !e) return { total: 0, spent: 0, bonus: 0, remaining: 0, pct: 0 }
  const total = (u.budget || 0) + (e.bonus || 0)
  const remaining = Math.max(0, total - (e.spent || 0))
  return { total, base: u.budget || 0, spent: e.spent || 0, bonus: e.bonus || 0, remaining, pct: total ? remaining / total : 0 }
}

// ── normalisers (API → store shape) ──
function reshapeEmployee(emp, providers) {
  const cart = emp?.cart || []
  const active = emp?.activeBenefits || []
  const lookup = (slug) => providers.find((p) => (p.slug || p.id) === slug)
  const spent = active.reduce((s, slug) => s + (lookup(slug)?.cost || 0), 0)
  const base = freshEmployeeState()
  return {
    ...base,
    cart,
    activeBenefits: active,
    bonus: emp?.bonus || 0,
    spent,
    preferences: { ...base.preferences, ...(emp?.preferences || {}) },
    games: { ...base.games, ...(emp?.games || {}) },
    discountCodes: emp?.discountCodes || [],
  }
}

// ── hydration ──
async function loadProviders() {
  try {
    const { providers } = await api.providers()
    set(() => ({ providers }))
  } catch { /* leave fallback */ }
}

async function loadCurrentUserData() {
  if (!getToken()) return
  try {
    const [{ providers }, requestsRes] = await Promise.all([
      api.providers().catch(() => ({ providers: state.providers })),
      api.listRequests().catch(() => ({ requests: [] })),
    ])
    let activeUserId = state.currentUserId
    let users = state.users

    if (!activeUserId) {
      const { user } = await api.me()
      activeUserId = user.id
      users = mergeUsers(state.users, [user])
    }

    const me = users.find((u) => u.id === activeUserId) || state.users.find((u) => u.id === activeUserId)
    let employeeUpdate = {}

    if (me?.role === 'employee') {
      try {
        const { employee } = await api.employeeMe()
        employeeUpdate = { [activeUserId]: reshapeEmployee(employee, providers) }
      } catch {}
    } else if (me?.role === 'admin') {
      try {
        const { users: allUsers, employees: allEmployees } = await api.adminOverview()
        users = mergeUsers(users, allUsers)
        for (const e of allEmployees) {
          employeeUpdate[e.userId] = reshapeEmployee(e, providers)
        }
      } catch {}
    }

    set((s) => ({
      providers,
      requests: requestsRes.requests,
      users,
      currentUserId: activeUserId,
      employees: { ...s.employees, ...employeeUpdate },
    }))
  } catch (err) {
    console.warn('hydrate failed', err)
  }
}

function mergeUsers(existing, incoming) {
  const map = new Map(existing.map((u) => [u.id, u]))
  for (const u of incoming) map.set(u.id, { ...map.get(u.id), ...u })
  return Array.from(map.values())
}

// ── auth ──
export async function login(email, password) {
  set(() => ({ loading: true, error: null }))
  try {
    const { token, user } = await api.login(email, password)
    setToken(token)
    set((s) => ({
      users: mergeUsers(s.users, [user]),
      currentUserId: user.id,
      loading: false,
    }))
    persistSession()
    await loadCurrentUserData()
    return { ok: true, user }
  } catch (err) {
    set(() => ({ loading: false, error: err.message }))
    return { ok: false, error: err.message }
  }
}

export function logout() {
  setToken(null)
  state = { ...defaultState(), providers: state.providers }
  persistSession()
  emit()
}

export function currentUser() {
  return state.users.find((x) => x.id === state.currentUserId) || null
}

// ── employee mutations (write-through to API, optimistic update first) ──
function applyEmployee(userId, mutator) {
  const employees = { ...state.employees }
  const e = { ...(employees[userId] || freshEmployeeState()) }
  mutator(e)
  employees[userId] = e
  set(() => ({ employees }))
}

export async function addToCart(userId, slug) {
  applyEmployee(userId, (e) => { if (!e.cart.includes(slug)) e.cart = [...e.cart, slug] })
  try {
    const { employee } = await api.addToCart(slug)
    set((s) => ({ employees: { ...s.employees, [userId]: reshapeEmployee(employee, s.providers) } }))
  } catch (err) { console.warn('addToCart failed', err) }
}

export async function removeFromCart(userId, slug) {
  applyEmployee(userId, (e) => { e.cart = e.cart.filter((x) => x !== slug) })
  try {
    const { employee } = await api.removeFromCart(slug)
    set((s) => ({ employees: { ...s.employees, [userId]: reshapeEmployee(employee, s.providers) } }))
  } catch (err) { console.warn('removeFromCart failed', err) }
}

export async function clearCart(userId) {
  const cart = state.employees[userId]?.cart || []
  applyEmployee(userId, (e) => { e.cart = [] })
  try { await Promise.all(cart.map((slug) => api.removeFromCart(slug))) } catch {}
}

export async function requestApproval(userId, items) {
  try {
    const { request } = await api.submitRequest(items)
    set((s) => ({ requests: [request, ...s.requests] }))
    await clearCart(userId)
  } catch (err) { console.warn('requestApproval failed', err) }
}

export async function decideRequest(reqId, decision) {
  try {
    const { request } = await api.decideRequest(reqId, decision)
    set((s) => ({ requests: s.requests.map((r) => (r.id === reqId ? request : r)) }))
    // Approval changes employee state — refresh.
    if (decision === 'approved') await loadCurrentUserData()
  } catch (err) { console.warn('decideRequest failed', err) }
}

// ── still-local actions (no backend equivalent yet) ──
export function setPreferences(userId, prefs) {
  applyEmployee(userId, (e) => { e.preferences = { ...e.preferences, ...prefs } })
  api.patchEmployee({ preferences: { ...state.employees[userId].preferences } }).catch(() => {})
}

function syncEmployee(userId, patch) {
  api.patchEmployee(patch).catch((err) => console.warn('patchEmployee failed', err))
}

export function awardBonus(userId, amount, label) {
  applyEmployee(userId, (e) => {
    e.bonus += amount
    e.games = { ...e.games, history: [{ id: uid(), at: now(), label, delta: amount }, ...(e.games.history || [])] }
  })
  syncEmployee(userId, { bonus: state.employees[userId].bonus, games: state.employees[userId].games })
}

export function setGames(userId, patch) {
  applyEmployee(userId, (e) => { e.games = { ...e.games, ...patch } })
  syncEmployee(userId, { games: state.employees[userId].games })
}

export function completeTask(userId, taskId, reward) {
  applyEmployee(userId, (e) => {
    if (e.games.tasks.includes(taskId)) return
    e.games = {
      ...e.games,
      tasks: [...e.games.tasks, taskId],
      history: [{ id: uid(), at: now(), label: `Task: ${taskId}`, delta: reward }, ...(e.games.history || [])],
    }
    e.bonus += reward
  })
  syncEmployee(userId, { bonus: state.employees[userId].bonus, games: state.employees[userId].games })
}

export async function awardDiscountCode(userId, reward) {
  if (!reward) return null
  try {
    const { discountCode, employee } = await api.claimGameReward(reward)
    set((s) => ({ employees: { ...s.employees, [userId]: reshapeEmployee(employee, s.providers) } }))
    return discountCode
  } catch (err) {
    console.warn('claimGameReward failed', err)
    const localCode = {
      id: uid(),
      code: `PERX${Math.round(reward.discountPct * 100)}-${uid().slice(0, 6).toUpperCase()}`,
      label: reward.label,
      providerSlug: reward.providerSlug || null,
      category: reward.category || null,
      discountPct: reward.discountPct,
      source: reward.source,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usedAt: null,
    }
    applyEmployee(userId, (e) => { e.discountCodes = [localCode, ...(e.discountCodes || [])] })
    return localCode
  }
}

export async function markDiscountCodeUsed(userId, codeId) {
  try {
    const { employee } = await api.useDiscountCode(codeId)
    set((s) => ({ employees: { ...s.employees, [userId]: reshapeEmployee(employee, s.providers) } }))
  } catch (err) {
    console.warn('useDiscountCode failed', err)
    applyEmployee(userId, (e) => {
      e.discountCodes = (e.discountCodes || []).map((c) =>
        c.id === codeId ? { ...c, usedAt: new Date().toISOString() } : c,
      )
    })
  }
}

export function setLang(lang) {
  set(() => ({ lang }))
  try {
    const saved = JSON.parse(localStorage.getItem('perx:v1') || '{}')
    localStorage.setItem('perx:v1', JSON.stringify({ ...saved, lang }))
  } catch {}
}

// ── daily surprise (still local-only) ──
const SURPRISE_KEY = 'perx:daily-surprise'
function todayStr() { return new Date().toISOString().slice(0, 10) }
export function getDailySurprise() {
  try { const raw = localStorage.getItem(SURPRISE_KEY); return raw ? JSON.parse(raw) : null } catch { return null }
}
export function markDailySurpriseShown(gameType) {
  localStorage.setItem(SURPRISE_KEY, JSON.stringify({ shownDate: todayStr(), gameType }))
}
export function isDailySurpriseShownToday() { return getDailySurprise()?.shownDate === todayStr() }
export function pickTodayGame() { return new Date().getDate() % 2 === 0 ? 'scratch' : 'spin' }

export function resetAll() { logout() }

// ── hooks ──
export function useStore(selector = (s) => s) {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state))
}
export function useCurrentUser() {
  return useSyncExternalStore(subscribe, currentUser, currentUser)
}

export function useSessionLoading() {
  return useSyncExternalStore(
    subscribe,
    () => state.sessionLoading,
    () => false,
  )
}

async function bootstrapSession() {
  if (!getToken()) {
    set(() => ({ sessionLoading: false }))
    return
  }
  set(() => ({ sessionLoading: true }))
  await loadCurrentUserData().catch(() => {})
  if (!currentUser() && getToken()) {
    setToken(null)
    persistSession()
  }
  set(() => ({ sessionLoading: false }))
}

// ── boot: providers always, restore session if a token exists, periodic refresh ──
loadProviders()
bootstrapSession()

if (typeof window !== 'undefined') {
  let timer = null
  const tick = () => { if (document.visibilityState === 'visible' && getToken()) loadCurrentUserData() }
  const start = () => { if (!timer) timer = setInterval(tick, 8000) }
  const stop = () => { if (timer) { clearInterval(timer); timer = null } }
  start()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { tick(); start() } else { stop() }
  })
  window.addEventListener('focus', tick)
}
