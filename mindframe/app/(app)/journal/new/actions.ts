'use server';

import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const createJournalEntry = async (
	content: string,
	moodLabel: string,
	emotions: string[] = []
) => {
	const entry = await apiFetch<{ id: number }>('/journal', {
		method: 'POST',
		body: JSON.stringify({ content, mood_label: moodLabel, emotions }),
	});
	redirect(`/journal/entries/${entry.id}`);
};
