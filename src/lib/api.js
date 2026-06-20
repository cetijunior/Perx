// Thin wrapper around the perx-api server. Stores JWT in localStorage so the
// web app and the iOS app share the same auth model.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const TOKEN_KEY = 'perx.token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(json.error || 'request_failed'), { status: res.status, body: json })
  return json
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/auth/me', { auth: true }),
  providers: () => request('/providers'),
  employeeMe: () => request('/employees/me', { auth: true }),
  patchEmployee: (patch) => request('/employees/me', { method: 'PATCH', body: patch, auth: true }),
  addToCart: (slug) => request('/employees/me/cart', { method: 'POST', body: { slug }, auth: true }),
  removeFromCart: (slug) => request(`/employees/me/cart/${slug}`, { method: 'DELETE', auth: true }),
  listRequests: () => request('/requests', { auth: true }),
  submitRequest: (items) => request('/requests', { method: 'POST', body: { items }, auth: true }),
  decideRequest: (id, decision) => request(`/requests/${id}/decide`, { method: 'POST', body: { decision }, auth: true }),
  adminOverview: () => request('/admin/overview', { auth: true }),
}
