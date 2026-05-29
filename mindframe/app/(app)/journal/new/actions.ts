'use server';

import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const createJournalEntry = async (content: string, moodScore: number) => {
	await apiFetch('/journal', {
		method: 'POST',
		body: JSON.stringify({ content, mood_score: moodScore }),
	});
	redirect('/journal');
};
