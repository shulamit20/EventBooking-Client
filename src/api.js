// One place for every call to the server. Screens never call fetch directly.

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
    // ASP.NET ProblemDetails carries the message in `detail`, falling back to `title`.
    const message = data?.detail || data?.title || `הבקשה נכשלה (${res.status})`
    throw new ApiError(res.status, message, data)
  }
  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  del: (path) => request('DELETE', path),
}
