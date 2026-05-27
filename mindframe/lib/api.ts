/*
A typed fetch wrapper for all FastAPI calls. Reads the session server-side, attaches the JWT as a Bearer
token on every request, and throws on non-OK responses. Every page or server action that needs data will call apiFetch
instead of raw fetch. 
*/

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
	const cookieStore = await cookies();
	// FastAPI needs the raw JWT cookie string to verify the signature using JWT_SECRET
	const token = cookieStore.get('authjs.session-token')?.value;

	if (!token) throw new Error('No auth token found; user is not authenticated');

	const headers: HeadersInit = {
		'Content-Type': 'application/json',
		...(token && { Authorization: `Bearer ${token}` }),
		...options.headers,
	};

	const res = await fetch(`${API_URL}${path}`, { ...options, headers });

	if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);

	return res.json() as Promise<T>;
};
