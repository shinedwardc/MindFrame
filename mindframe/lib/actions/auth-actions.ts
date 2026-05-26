'use server';

import { signIn, signOut } from '@/lib/auth';

export async function signInWithGoogle() {
	await signIn('google', { redirectTo: '/dashboard' });
}

export async function signOutAction() {
	await signOut({ redirectTo: process.env.AUTH_URL ?? 'http://localhost:3000' });
}
