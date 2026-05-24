/*
A typed fetch wrapper for all FastAPI calls. Reads the session server-side, attaches the JWT as a Bearer
token on every request, and throws on non-OK responses. Every page or server action that needs data will call apiFetch
instead of raw fetch. 
*/

import { auth } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = await auth()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(session && { Authorization: `Bearer ${session}` }),
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)

  return res.json() as Promise<T>
}
