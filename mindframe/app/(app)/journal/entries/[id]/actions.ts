'use server';

import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export const deleteJournalEntry = async (entryId: number) => {
	await apiFetch(`/journal/${entryId}`, { method: 'DELETE' });
	redirect('/journal/entries');
};
