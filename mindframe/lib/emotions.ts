// Canonical emotion taxonomy — the single source of truth for which feeling
// words exist and how they're grouped by tone. Both the journal entry form
// (selectable chips) and the dashboard word cloud read from here, so the two
// can never drift. Families map to the shared palette tokens documented in
// globals.css: heavy → dusk, steady → stone, light → brand.

export type EmotionFamily = 'heavy' | 'steady' | 'light';

const HEAVY = new Set(['Anxious', 'Overwhelmed', 'Sad', 'Lonely', 'Frustrated', 'Drained']);
const LIGHT = new Set(['Hopeful', 'Content', 'Grateful', 'Connected', 'Proud']);

// Ordered for display: heavy first, then steady, then light.
export const emotionPalette = [
	'Anxious',
	'Overwhelmed',
	'Sad',
	'Lonely',
	'Frustrated',
	'Drained',
	'Tired',
	'Restless',
	'Uncertain',
	'Calm',
	'Hopeful',
	'Content',
	'Grateful',
	'Connected',
	'Proud',
];

// Anything not heavy or light is steady (Tired, Restless, Uncertain, Calm).
export const emotionFamily = (word: string): EmotionFamily =>
	HEAVY.has(word) ? 'heavy' : LIGHT.has(word) ? 'light' : 'steady';

// Selected-chip background (NewEntryForm). Tailwind utilities → globals.css tokens.
export const emotionChipClass: Record<EmotionFamily, string> = {
	heavy: 'bg-dusk-500 text-white',
	steady: 'bg-stone-500 text-white',
	light: 'bg-brand-500 text-white',
};

// Word-cloud fill shades (EmotionCloud). Raw CSS vars so d3-selection's .style()
// resolves them; three shades per family for subtle per-word variation.
export const emotionCloudTones: Record<EmotionFamily, string[]> = {
	heavy: ['var(--color-dusk-500)', 'var(--color-dusk-600)', 'var(--color-dusk-400)'],
	steady: ['var(--color-stone-500)', 'var(--color-stone-600)', 'var(--color-stone-400)'],
	light: ['var(--color-brand-500)', 'var(--color-brand-700)', 'var(--color-brand-600)'],
};
