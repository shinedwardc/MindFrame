// Canonical mood scale — the single source of truth for the 1-10 score, its
// label, and its tone. The five labels and their anchor scores mirror the
// backend's MOOD_LABEL_FALLBACK (Struggling=2, Low=4, Okay=6, Good=8, Great=10).
// Color follows the label via its tone, so the label and its color can never
// disagree. Tones map to the shared palette tokens in globals.css:
// low → dusk, mid → muted-foreground, high → brand.

export type MoodTone = 'low' | 'mid' | 'high';

// The five selectable moods, ordered low → high (used by the entry form).
export const moodOptions = ['Struggling', 'Low', 'Okay', 'Good', 'Great'];

const LABEL_TONE: Record<string, MoodTone> = {
	Struggling: 'low',
	Low: 'low',
	Okay: 'mid',
	Good: 'high',
	Great: 'high',
};

// Score → label. Boundaries round-trip the backend's anchor scores: 2 →
// Struggling, 4 → Low, 6 → Okay, 8 → Good, 10 → Great.
export const moodLabel = (score: number): string => {
	if (score <= 3) return 'Struggling';
	if (score <= 5) return 'Low';
	if (score <= 6) return 'Okay';
	if (score <= 8) return 'Good';
	return 'Great';
};

export const moodTone = (score: number): MoodTone => LABEL_TONE[moodLabel(score)];

const TONE_BG: Record<MoodTone, string> = {
	low: 'bg-dusk-500',
	mid: 'bg-muted-foreground/40',
	high: 'bg-brand-500',
};

const TONE_TEXT: Record<MoodTone, string> = {
	low: 'text-dusk-500',
	mid: 'text-muted-foreground',
	high: 'text-brand-500',
};

export const moodBgColor = (score: number): string => TONE_BG[moodTone(score)];

export const moodTextColor = (score: number): string => TONE_TEXT[moodTone(score)];

// Selected-button styling for the entry form's five-way mood picker. A richer
// five-level gradient than the three tones above, but the same tonal direction.
export const moodSelectedStyle: Record<string, string> = {
	Struggling: 'bg-dusk-600 text-white border-dusk-600',
	Low: 'bg-dusk-500 text-white border-dusk-500',
	Okay: 'bg-muted-foreground/60 text-white border-transparent',
	Good: 'bg-brand-500/70 text-white border-transparent',
	Great: 'bg-brand-500 text-white border-transparent',
};
