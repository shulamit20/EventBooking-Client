// One place for every call to the EventBooking server. Screens never call fetch directly.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5269'

/** Thrown for any non-2xx response. `status` lets a screen react to 401 / 403 / 409 specifically. */
export class ApiError extends Error {
  constructor(status, message, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

function authHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, path, body) {
  const res = await fetch(BASE_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message = data?.detail || data?.title || `הבקשה נכשלה (${res.status})`
    throw new ApiError(res.status, message, data)
  }
  return data
}

const http = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b),
  patch: (p, b) => request('PATCH', p, b),
  del: (p) => request('DELETE', p),
}

// ---- typed helpers, grouped by feature ----

export const api = {
  auth: {
    login: (email, password) => http.post('/api/auth/login', { email, password }),
    register: (email, password, displayName) =>
      http.post('/api/auth/register', { email, password, displayName }),
  },

  lookups: {
    eventTypes: () => http.get('/api/event-types'),
    serviceCategories: () => http.get('/api/service-categories'),
  },

  venues: {
    list: (page = 1, pageSize = 12) => http.get(`/api/venues?page=${page}&pageSize=${pageSize}`),
  },

  slots: {
    list: (params) => {
      const q = new URLSearchParams()
      Object.entries(params ?? {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') q.set(k, v)
      })
      return http.get(`/api/hall-slots?${q.toString()}`)
    },
    get: (id) => http.get(`/api/hall-slots/${id}`),
  },

  extraServices: {
    list: () => http.get('/api/extra-services'),
  },

  cateringMenus: {
    list: () => http.get('/api/catering-menus'),
  },

  pricing: {
    // { hallSlotId, guestCount, cateringMenuId?, extraServices:[{extraServiceId,quantity}] }
    estimate: (selection) => http.post('/api/pricing/estimate', selection),
  },

  bookings: {
    // { hallSlotId, eventTypeId, cateringMenuId?, hostName, guestCount, notes?, extraServices:[] }
    create: (booking) => http.post('/api/bookings', booking),
    mine: (page = 1, pageSize = 20) => http.get(`/api/bookings/mine?page=${page}&pageSize=${pageSize}`),
    get: (id) => http.get(`/api/bookings/${id}`),
    cancel: (id) => http.del(`/api/bookings/${id}`),
    // manager
    all: (page = 1, pageSize = 20, status) =>
      http.get(`/api/bookings?page=${page}&pageSize=${pageSize}${status ? `&status=${status}` : ''}`),
    setStatus: (id, status) => http.patch(`/api/bookings/${id}/status`, { status }),
  },
}
