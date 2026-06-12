const BASE_URL = import.meta.env.VITE_API_URL || '/api'

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${BASE_URL}${url}`, { ...options, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export function get<T>(url: string): Promise<T> {
  return request<T>(url)
}

export function post<T>(url: string, body?: unknown): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  })
}

export function put<T>(url: string, body?: unknown): Promise<T> {
  return request<T>(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

export function del<T>(url: string): Promise<T> {
  return request<T>(url, { method: 'DELETE' })
}

export function upload<T>(url: string, file: File): Promise<T> {
  const formData = new FormData()
  formData.append('file', file)
  return request<T>(url, {
    method: 'POST',
    body: formData,
  })
}
