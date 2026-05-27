'use server';

import { signIn, signOut } from '@/lib/auth';

export const signInWithGoogle = async () => {
	await signIn('google', { redirectTo: '/dashboard' });
};

export const signOutAction = async () => {
	await signOut({ redirectTo: process.env.AUTH_URL ?? 'http://localhost:3000' });
};
