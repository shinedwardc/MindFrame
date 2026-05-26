/*
A typed fetch wrapper for all FastAPI calls. Reads the session server-side, attaches the JWT as a Bearer
token on every request, and throws on non-OK responses. Every page or server action that needs data will call apiFetch
instead of raw fetch. 
*/

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
	const cookieStore = await cookies();
	const token = cookieStore.get('next-auth.session-token')?.value;

	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...(token && { Authorization: `Bearer ${token}` }),
		...options.headers,
	};

	const res = await fetch(`${API_URL}${path}`, { ...options, headers });

	if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);

	return res.json() as Promise<T>;
}
